const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const { db, uploadsDir } = require('./db');
const { getDaysRemaining, getDocumentStatus, runReminderChecks } = require('./services/reminderEngine');
const { seedFleetData } = require('./seedData');

const JWT_SECRET = process.env.JWT_SECRET || 'fleetmanager_super_secret_jwt_key_2026';
const PORT = process.env.PORT || 5000;

const app = express();
app.set('trust proxy', 1);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cloud health check endpoint
app.get('/api/health', (req, res) => {
  try {
    const dbCheck = db.prepare('SELECT 1 as healthy').get();
    res.json({
      status: 'ok',
      service: 'FleetManager Pro Cloud API',
      database: dbCheck.healthy === 1 ? 'connected' : 'unhealthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// Direct APK Download Endpoints
const handleApkDownload = (req, res) => {
  const candidatePaths = [
    path.join(__dirname, '..', 'FleetManagerPro.apk'),
    path.join(__dirname, '..', 'client', 'dist', 'FleetManagerPro.apk'),
    path.join(__dirname, '..', 'client', 'public', 'FleetManagerPro.apk'),
    path.join(process.cwd(), 'FleetManagerPro.apk'),
    path.join(process.cwd(), 'client', 'dist', 'FleetManagerPro.apk')
  ];

  const apkFile = candidatePaths.find(p => fs.existsSync(p));
  if (apkFile) {
    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
    return res.download(apkFile, 'FleetManagerPro.apk');
  }
  return res.status(404).json({ error: 'FleetManagerPro.apk not found on server' });
};

app.get('/download/apk', handleApkDownload);
app.get('/FleetManagerPro.apk', handleApkDownload);
app.get('/api/apk', handleApkDownload);

// Configure Multer for secure file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'fleet-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedExts = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, JPG, JPEG, and PNG files are allowed'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
  fileFilter
});

// Middleware to serve uploaded files safely
app.use('/uploads', express.static(uploadsDir));

// Seed database on first startup if no users exist
const userCount = db.prepare('SELECT count(*) as count FROM users').get().count;
if (userCount === 0) {
  seedFleetData();
}

// Authentication Middleware
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization token required. Please log in.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded || !decoded.id) {
      return res.status(401).json({ error: 'Invalid authentication token.' });
    }

    const user = db.prepare('SELECT id, name, email, phone, business_name FROM users WHERE id = ?').get(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User session expired or account not found. Please log in again.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Session expired or invalid token. Please log in again.' });
  }
}

// Helper to log user activities
function logActivity(userId, actionType, description, entityType = null, entityId = null) {
  try {
    db.prepare(`
      INSERT INTO activity_logs (user_id, action_type, description, entity_type, entity_id)
      VALUES (?, ?, ?, ?, ?)
    `).run(userId, actionType, description, entityType, entityId);
  } catch (e) {
    console.error('Failed to log activity:', e);
  }
}

/* ==========================================================================
   AUTHENTICATION ROUTES
   ========================================================================== */

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const validPassword = bcrypt.compareSync(password, user.password_hash);
  if (!validPassword) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name, businessName: user.business_name },
    JWT_SECRET,
    { expiresIn: '30d' }
  );

  // Trigger reminder check on login
  runReminderChecks(user.id);

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      businessName: user.business_name
    }
  });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, phone, password, businessName } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists' });
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);

  const result = db.prepare(`
    INSERT INTO users (name, email, phone, password_hash, business_name)
    VALUES (?, ?, ?, ?, ?)
  `).run(name, email.toLowerCase().trim(), phone || '', passwordHash, businessName || 'My Truck Logistics');

  const userId = result.lastInsertRowid;
  const token = jwt.sign(
    { id: userId, email: email.toLowerCase().trim(), name, businessName },
    JWT_SECRET,
    { expiresIn: '30d' }
  );

  res.status(201).json({
    token,
    user: { id: userId, name, email, phone, businessName }
  });
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT id, name, email, phone, business_name, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
});

/* ==========================================================================
   DASHBOARD & STATS
   ========================================================================== */

app.get('/api/stats', authMiddleware, (req, res) => {
  const userId = req.user.id;

  // Run reminder checks so notifications & status counts are fresh
  runReminderChecks(userId);

  const totalVehicles = db.prepare('SELECT count(*) as c FROM vehicles WHERE user_id = ?').get(userId).c;
  const activeVehicles = db.prepare("SELECT count(*) as c FROM vehicles WHERE user_id = ? AND status = 'active'").get(userId).c;
  const totalDrivers = db.prepare('SELECT count(*) as c FROM drivers WHERE user_id = ?').get(userId).c;

  // Fetch all vehicle documents to compute exact status breakdown
  const docs = db.prepare(`
    SELECT d.id, d.document_type, d.document_number, d.expiry_date,
           v.id as vehicle_id, v.vehicle_number, v.model
    FROM documents d
    JOIN vehicles v ON d.vehicle_id = v.id
    WHERE v.user_id = ?
    ORDER BY d.expiry_date ASC
  `).all(userId);

  let expiredDocsCount = 0;
  let expiresTomorrowCount = 0; // 1 day
  let expires2DaysCount = 0;    // 2 days
  let validDocsCount = 0;
  const urgentActions = [];

  for (const doc of docs) {
    const statusObj = getDocumentStatus(doc.expiry_date);
    doc.statusInfo = statusObj;

    if (statusObj.status === 'EXPIRED') {
      expiredDocsCount++;
      urgentActions.push({
        id: doc.id,
        vehicleId: doc.vehicle_id,
        vehicleNumber: doc.vehicle_number,
        documentType: doc.document_type,
        expiryDate: doc.expiry_date,
        status: statusObj.status,
        badgeLabel: statusObj.label,
        icon: '🔴',
        days: statusObj.days,
        actionText: `${doc.vehicle_number} — ${doc.document_type} expired`
      });
    } else if (statusObj.status === 'EXPIRES_TOMORROW' || statusObj.status === 'EXPIRES_TODAY') {
      expiresTomorrowCount++;
      urgentActions.push({
        id: doc.id,
        vehicleId: doc.vehicle_id,
        vehicleNumber: doc.vehicle_number,
        documentType: doc.document_type,
        expiryDate: doc.expiry_date,
        status: statusObj.status,
        badgeLabel: statusObj.label,
        icon: '🚨',
        days: statusObj.days,
        actionText: `${doc.vehicle_number} — ${doc.document_type} expires tomorrow`
      });
    } else if (statusObj.status === 'EXPIRES_2_DAYS') {
      expires2DaysCount++;
      urgentActions.push({
        id: doc.id,
        vehicleId: doc.vehicle_id,
        vehicleNumber: doc.vehicle_number,
        documentType: doc.document_type,
        expiryDate: doc.expiry_date,
        status: statusObj.status,
        badgeLabel: statusObj.label,
        icon: '⚠️',
        days: statusObj.days,
        actionText: `${doc.vehicle_number} — ${doc.document_type} expires in 2 days`
      });
    } else {
      validDocsCount++;
    }
  }

  // Also include expiring driver licences in urgent actions
  const drivers = db.prepare(`
    SELECT dr.id, dr.name, dr.phone, dr.licence_number, dr.licence_expiry,
           v.vehicle_number, v.id as vehicle_id
    FROM drivers dr
    LEFT JOIN vehicles v ON dr.assigned_vehicle_id = v.id
    WHERE dr.user_id = ?
  `).all(userId);

  for (const dr of drivers) {
    if (!dr.licence_expiry) continue;
    const statusObj = getDocumentStatus(dr.licence_expiry);
    if (statusObj.status === 'EXPIRED') {
      urgentActions.push({
        id: `dr-${dr.id}`,
        driverId: dr.id,
        vehicleNumber: dr.vehicle_number || 'Unassigned',
        documentType: 'Driver Licence',
        expiryDate: dr.licence_expiry,
        status: statusObj.status,
        badgeLabel: statusObj.label,
        icon: '🔴',
        days: statusObj.days,
        actionText: `${dr.name} — Driver licence expired`
      });
    } else if (statusObj.status === 'EXPIRES_TOMORROW' || statusObj.status === 'EXPIRES_TODAY') {
      urgentActions.push({
        id: `dr-${dr.id}`,
        driverId: dr.id,
        vehicleNumber: dr.vehicle_number || 'Unassigned',
        documentType: 'Driver Licence',
        expiryDate: dr.licence_expiry,
        status: statusObj.status,
        badgeLabel: statusObj.label,
        icon: '🚨',
        days: statusObj.days,
        actionText: `${dr.name} — Driver licence expires tomorrow`
      });
    } else if (statusObj.status === 'EXPIRES_2_DAYS') {
      urgentActions.push({
        id: `dr-${dr.id}`,
        driverId: dr.id,
        vehicleNumber: dr.vehicle_number || 'Unassigned',
        documentType: 'Driver Licence',
        expiryDate: dr.licence_expiry,
        status: statusObj.status,
        badgeLabel: statusObj.label,
        icon: '⚠️',
        days: statusObj.days,
        actionText: `${dr.name} — Driver licence expires in 2 days`
      });
    }
  }

  // Upcoming maintenance
  const upcomingMaintenance = db.prepare(`
    SELECT m.*, v.vehicle_number, v.model
    FROM maintenance m
    JOIN vehicles v ON m.vehicle_id = v.id
    WHERE v.user_id = ? AND m.next_service_date IS NOT NULL
    ORDER BY m.next_service_date ASC
    LIMIT 5
  `).all(userId);

  // Recent activity logs
  const recentActivity = db.prepare(`
    SELECT * FROM activity_logs
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 8
  `).all(userId);

  // Current month total expense
  const now = new Date();
  const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthlyExpenseResult = db.prepare(`
    SELECT coalesce(SUM(amount), 0) as total
    FROM expenses e
    JOIN vehicles v ON e.vehicle_id = v.id
    WHERE v.user_id = ? AND e.expense_date LIKE ?
  `).get(userId, `${currentYearMonth}%`);

  res.json({
    totalVehicles,
    activeVehicles,
    totalDrivers,
    totalDocuments: docs.length,
    expiredDocuments: expiredDocsCount,
    expiresTomorrow: expiresTomorrowCount,
    expires2Days: expires2DaysCount,
    validDocuments: validDocsCount,
    urgentActions,
    upcomingMaintenance,
    recentActivity,
    thisMonthExpenses: monthlyExpenseResult.total
  });
});

/* ==========================================================================
   VEHICLES CRUD & PROFILE
   ========================================================================== */

app.get('/api/vehicles', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const vehicles = db.prepare(`
    SELECT v.*, 
           dr.name as driver_name, dr.phone as driver_phone,
           (SELECT count(*) FROM documents d WHERE d.vehicle_id = v.id) as doc_count,
           (SELECT file_path FROM vehicle_photos vp WHERE vp.vehicle_id = v.id ORDER BY vp.id ASC LIMIT 1) as primary_photo
    FROM vehicles v
    LEFT JOIN drivers dr ON v.driver_id = dr.id
    WHERE v.user_id = ?
    ORDER BY v.created_at DESC
  `).all(userId);

  // Attach status overview for each vehicle
  for (const v of vehicles) {
    const docs = db.prepare('SELECT expiry_date FROM documents WHERE vehicle_id = ?').all(v.id);
    let hasExpired = false;
    let hasExpiringSoon = false;

    for (const d of docs) {
      const status = getDocumentStatus(d.expiry_date).status;
      if (status === 'EXPIRED') hasExpired = true;
      if (status === 'EXPIRES_TOMORROW' || status === 'EXPIRES_2_DAYS' || status === 'EXPIRES_TODAY') hasExpiringSoon = true;
    }

    v.overallDocStatus = hasExpired ? 'EXPIRED' : (hasExpiringSoon ? 'EXPIRING_SOON' : 'VALID');
  }

  res.json({ vehicles });
});

app.post('/api/vehicles', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    const body = req.body || {};
    const { vehicle_number, vehicle_type, model, manufacturing_year, purchase_date, owner_name, driver_id, notes, status } = body;

    // 1. Validate vehicle registration number
    if (!vehicle_number || typeof vehicle_number !== 'string' || !vehicle_number.trim()) {
      return res.status(400).json({ error: 'Vehicle registration number is required (e.g. MH 09 GJ 6600)' });
    }
    const cleanVehicleNum = vehicle_number.trim().replace(/\s+/g, ' ').toUpperCase();
    if (cleanVehicleNum.length < 3) {
      return res.status(400).json({ error: 'Registration number must be at least 3 characters long.' });
    }

    // 2. Validate model
    if (!model || typeof model !== 'string' || !model.trim()) {
      return res.status(400).json({ error: 'Vehicle model name is required (e.g. Eicher Pro 2110 / Tata Signa)' });
    }
    const cleanModel = model.trim();

    // 3. Check registration number uniqueness within user fleet (ignoring spaces & case)
    const existing = db.prepare(`
      SELECT id, vehicle_number FROM vehicles 
      WHERE user_id = ? AND UPPER(REPLACE(vehicle_number, ' ', '')) = UPPER(REPLACE(?, ' ', ''))
    `).get(userId, cleanVehicleNum);

    if (existing) {
      return res.status(409).json({ 
        error: `Vehicle registration number '${existing.vehicle_number}' is already registered in your fleet.` 
      });
    }

    // 4. Validate and normalize driver_id
    let validDriverId = null;
    if (driver_id !== undefined && driver_id !== null && driver_id !== '' && driver_id !== 'null' && driver_id !== 'undefined' && driver_id !== 0 && driver_id !== '0') {
      const parsedDriverId = parseInt(driver_id, 10);
      if (isNaN(parsedDriverId) || parsedDriverId <= 0) {
        return res.status(400).json({ error: 'Invalid driver selected. Please select a valid driver.' });
      }
      const driverExists = db.prepare('SELECT id, name FROM drivers WHERE id = ? AND user_id = ?').get(parsedDriverId, userId);
      if (!driverExists) {
        return res.status(400).json({ error: 'The selected driver was not found in your fleet.' });
      }
      validDriverId = parsedDriverId;
    }

    // 5. Validate manufacturing year
    let validYear = null;
    if (manufacturing_year !== undefined && manufacturing_year !== null && manufacturing_year !== '' && manufacturing_year !== 'null' && manufacturing_year !== 'undefined') {
      const parsedYear = parseInt(manufacturing_year, 10);
      const currentYear = new Date().getFullYear();
      if (isNaN(parsedYear) || parsedYear < 1950 || parsedYear > currentYear + 2) {
        return res.status(400).json({ 
          error: `Manufacturing year must be a valid 4-digit year between 1950 and ${currentYear + 1}` 
        });
      }
      validYear = parsedYear;
    }

    // 6. Validate purchase date
    let validPurchaseDate = null;
    if (purchase_date && typeof purchase_date === 'string' && purchase_date.trim()) {
      const trimmedDate = purchase_date.trim();
      if (trimmedDate !== 'null' && trimmedDate !== 'undefined' && trimmedDate !== 'dd-mm-yyyy' && trimmedDate !== '') {
        const parsedDate = new Date(trimmedDate);
        if (isNaN(parsedDate.getTime())) {
          return res.status(400).json({ error: 'Purchase date is invalid. Please select a valid calendar date.' });
        }
        validPurchaseDate = trimmedDate.slice(0, 10);
      }
    }

    // 7. Validate vehicle type
    const ALLOWED_VEHICLE_TYPES = ['Truck', 'Trailer', 'Tanker', 'Tipper', 'Container', 'Mini Truck', 'Pickup', 'Van', 'Bus', 'Other'];
    let validVehicleType = 'Truck';
    if (vehicle_type && typeof vehicle_type === 'string' && vehicle_type.trim()) {
      const trimmedType = vehicle_type.trim();
      validVehicleType = ALLOWED_VEHICLE_TYPES.includes(trimmedType) ? trimmedType : 'Truck';
    }

    // 8. Normalize owner name
    let validOwnerName = req.user.business_name || req.user.name || 'Fleet Owner';
    if (owner_name && typeof owner_name === 'string' && owner_name.trim() && owner_name.trim() !== 'null' && owner_name.trim() !== 'undefined') {
      validOwnerName = owner_name.trim();
    }

    // 9. Normalize status
    const ALLOWED_STATUSES = ['active', 'inactive', 'maintenance'];
    const validStatus = (status && typeof status === 'string' && ALLOWED_STATUSES.includes(status.toLowerCase().trim()))
      ? status.toLowerCase().trim()
      : 'active';

    // 10. Normalize notes
    const validNotes = (notes && typeof notes === 'string' && notes.trim() !== 'null' && notes.trim() !== 'undefined')
      ? notes.trim()
      : '';

    // Execute safe database transaction
    const insertVehicleTx = db.transaction(() => {
      const stmt = db.prepare(`
        INSERT INTO vehicles (user_id, vehicle_number, vehicle_type, model, manufacturing_year, purchase_date, owner_name, driver_id, status, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        userId,
        cleanVehicleNum,
        validVehicleType,
        cleanModel,
        validYear,
        validPurchaseDate,
        validOwnerName,
        validDriverId,
        validStatus,
        validNotes
      );

      const vehicleId = result.lastInsertRowid;

      // Update driver assignment if driver assigned
      if (validDriverId) {
        db.prepare('UPDATE drivers SET assigned_vehicle_id = ? WHERE id = ? AND user_id = ?').run(vehicleId, validDriverId, userId);
      }

      return vehicleId;
    });

    const newVehicleId = insertVehicleTx();

    logActivity(userId, 'CREATE_VEHICLE', `Added vehicle ${cleanVehicleNum} (${cleanModel})`, 'vehicle', newVehicleId);

    return res.status(201).json({
      id: newVehicleId,
      message: 'Vehicle added successfully.',
      vehicle_number: cleanVehicleNum
    });
  } catch (err) {
    console.error('[Create Vehicle Error]:', err);
    const msg = err.message || '';
    if (msg.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'This vehicle registration number already exists in your fleet.' });
    }
    if (msg.includes('FOREIGN KEY constraint failed')) {
      return res.status(400).json({ error: 'Driver assignment failed: Selected driver does not exist in your fleet.' });
    }
    return res.status(400).json({ error: `Unable to save vehicle: ${err.message}` });
  }
});

app.get('/api/vehicles/:id', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const vehicleId = req.params.id;

  const vehicle = db.prepare(`
    SELECT v.*, 
           dr.id as driver_id, dr.name as driver_name, dr.phone as driver_phone, dr.licence_number, dr.licence_expiry
    FROM vehicles v
    LEFT JOIN drivers dr ON v.driver_id = dr.id
    WHERE v.id = ? AND v.user_id = ?
  `).get(vehicleId, userId);

  if (!vehicle) {
    return res.status(404).json({ error: 'Vehicle not found' });
  }

  // Get Documents with computed status & days remaining
  const documents = db.prepare(`
    SELECT * FROM documents 
    WHERE vehicle_id = ?
    ORDER BY expiry_date ASC
  `).all(vehicleId);

  for (const doc of documents) {
    doc.statusInfo = getDocumentStatus(doc.expiry_date);
  }

  // Get Photos
  const photos = db.prepare(`
    SELECT * FROM vehicle_photos
    WHERE vehicle_id = ?
    ORDER BY uploaded_at DESC
  `).all(vehicleId);

  // Get Maintenance
  const maintenance = db.prepare(`
    SELECT * FROM maintenance
    WHERE vehicle_id = ?
    ORDER BY service_date DESC
  `).all(vehicleId);

  // Get Expenses
  const expenses = db.prepare(`
    SELECT * FROM expenses
    WHERE vehicle_id = ?
    ORDER BY expense_date DESC
  `).all(vehicleId);

  // Expense total
  const totalExpense = expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  // This month expenses
  const now = new Date();
  const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const thisMonthExpenses = expenses
    .filter(e => e.expense_date && e.expense_date.startsWith(currentYearMonth))
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

  res.json({
    vehicle,
    documents,
    photos,
    maintenance,
    expenses,
    stats: {
      totalExpense,
      thisMonthExpenses,
      docCount: documents.length,
      photoCount: photos.length
    }
  });
});

app.put('/api/vehicles/:id', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    const vehicleId = req.params.id;
    const body = req.body || {};
    const { vehicle_number, vehicle_type, model, manufacturing_year, purchase_date, owner_name, driver_id, status, notes } = body;

    const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ? AND user_id = ?').get(vehicleId, userId);
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });

    const cleanVehicleNum = vehicle_number ? vehicle_number.trim().replace(/\s+/g, ' ').toUpperCase() : vehicle.vehicle_number;

    // Check uniqueness if number changed
    if (cleanVehicleNum !== vehicle.vehicle_number) {
      const dup = db.prepare(`
        SELECT id, vehicle_number FROM vehicles 
        WHERE user_id = ? AND id != ? AND UPPER(REPLACE(vehicle_number, ' ', '')) = UPPER(REPLACE(?, ' ', ''))
      `).get(userId, vehicleId, cleanVehicleNum);
      if (dup) {
        return res.status(409).json({ error: `Vehicle registration number '${dup.vehicle_number}' is already registered in your fleet.` });
      }
    }

    let validDriverId = vehicle.driver_id;
    if (driver_id !== undefined) {
      if (driver_id !== null && driver_id !== '' && driver_id !== 'null' && driver_id !== 'undefined' && driver_id !== 0 && driver_id !== '0') {
        const parsedDriverId = parseInt(driver_id, 10);
        if (isNaN(parsedDriverId) || parsedDriverId <= 0) {
          return res.status(400).json({ error: 'Invalid driver selection.' });
        }
        const driverExists = db.prepare('SELECT id FROM drivers WHERE id = ? AND user_id = ?').get(parsedDriverId, userId);
        if (!driverExists) {
          return res.status(400).json({ error: 'Selected driver was not found in your fleet.' });
        }
        validDriverId = parsedDriverId;
      } else {
        validDriverId = null;
      }
    }

    let validYear = vehicle.manufacturing_year;
    if (manufacturing_year !== undefined && manufacturing_year !== null && manufacturing_year !== '' && manufacturing_year !== 'undefined' && manufacturing_year !== 'null') {
      const parsedYear = parseInt(manufacturing_year, 10);
      const currentYear = new Date().getFullYear();
      if (isNaN(parsedYear) || parsedYear < 1950 || parsedYear > currentYear + 2) {
        return res.status(400).json({ error: `Manufacturing year must be between 1950 and ${currentYear + 1}` });
      }
      validYear = parsedYear;
    } else if (manufacturing_year === null || manufacturing_year === '') {
      validYear = null;
    }

    let validPurchaseDate = vehicle.purchase_date;
    if (purchase_date !== undefined) {
      if (purchase_date && typeof purchase_date === 'string' && purchase_date.trim() && purchase_date.trim() !== 'undefined' && purchase_date.trim() !== 'null' && purchase_date.trim() !== 'dd-mm-yyyy') {
        const parsedDate = new Date(purchase_date.trim());
        if (isNaN(parsedDate.getTime())) {
          return res.status(400).json({ error: 'Invalid purchase date.' });
        }
        validPurchaseDate = purchase_date.trim().slice(0, 10);
      } else {
        validPurchaseDate = null;
      }
    }

    const ALLOWED_STATUSES = ['active', 'inactive', 'maintenance'];
    const validStatus = (status && typeof status === 'string' && ALLOWED_STATUSES.includes(status.toLowerCase().trim()))
      ? status.toLowerCase().trim()
      : vehicle.status;

    db.prepare(`
      UPDATE vehicles 
      SET vehicle_number = ?, vehicle_type = ?, model = ?, manufacturing_year = ?,
          purchase_date = ?, owner_name = ?, driver_id = ?, status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `).run(
      cleanVehicleNum,
      vehicle_type || vehicle.vehicle_type,
      model ? model.trim() : vehicle.model,
      validYear,
      validPurchaseDate,
      owner_name !== undefined ? (owner_name ? owner_name.trim() : null) : vehicle.owner_name,
      validDriverId,
      validStatus,
      notes !== undefined ? (notes ? notes.trim() : '') : vehicle.notes,
      vehicleId,
      userId
    );

    // Update driver assignment
    if (validDriverId && validDriverId !== vehicle.driver_id) {
      db.prepare('UPDATE drivers SET assigned_vehicle_id = ? WHERE id = ? AND user_id = ?').run(vehicleId, validDriverId, userId);
    }

    logActivity(userId, 'UPDATE_VEHICLE', `Updated details for ${cleanVehicleNum}`, 'vehicle', vehicleId);

    res.json({ message: 'Vehicle updated successfully' });
  } catch (err) {
    console.error('Failed to update vehicle:', err);
    return res.status(400).json({ error: `Failed to update vehicle: ${err.message}` });
  }
});

app.delete('/api/vehicles/:id', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    const vehicleId = req.params.id;

    const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ? AND user_id = ?').get(vehicleId, userId);
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });

    // Clear assigned_vehicle_id in drivers
    db.prepare('UPDATE drivers SET assigned_vehicle_id = NULL WHERE assigned_vehicle_id = ? AND user_id = ?').run(vehicleId, userId);

    db.prepare('DELETE FROM vehicles WHERE id = ? AND user_id = ?').run(vehicleId, userId);
    logActivity(userId, 'DELETE_VEHICLE', `Deleted vehicle ${vehicle.vehicle_number}`, 'vehicle', vehicleId);

    res.json({ message: 'Vehicle deleted successfully' });
  } catch (err) {
    console.error('Failed to delete vehicle:', err);
    return res.status(500).json({ error: `Failed to delete vehicle: ${err.message}` });
  }
});

// Upload photos for vehicle
app.post('/api/vehicles/:id/photos', authMiddleware, upload.array('photos', 10), (req, res) => {
  const userId = req.user.id;
  const vehicleId = req.params.id;

  const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ? AND user_id = ?').get(vehicleId, userId);
  if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No photo files uploaded' });
  }

  const insertPhotoStmt = db.prepare(`
    INSERT INTO vehicle_photos (vehicle_id, file_path, file_name, file_size)
    VALUES (?, ?, ?, ?)
  `);

  const addedPhotos = [];
  for (const f of req.files) {
    const filePath = `/uploads/${f.filename}`;
    const r = insertPhotoStmt.run(vehicleId, filePath, f.originalname, f.size);
    addedPhotos.push({ id: r.lastInsertRowid, filePath, fileName: f.originalname });
  }

  logActivity(userId, 'UPLOAD_PHOTO', `Uploaded ${req.files.length} photo(s) for ${vehicle.vehicle_number}`, 'vehicle', vehicleId);

  res.status(201).json({
    message: `${req.files.length} photo(s) uploaded successfully`,
    photos: addedPhotos
  });
});

app.delete('/api/vehicles/:vehicleId/photos/:photoId', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const { vehicleId, photoId } = req.params;

  const photo = db.prepare(`
    SELECT vp.* FROM vehicle_photos vp
    JOIN vehicles v ON vp.vehicle_id = v.id
    WHERE vp.id = ? AND vp.vehicle_id = ? AND v.user_id = ?
  `).get(photoId, vehicleId, userId);

  if (!photo) return res.status(404).json({ error: 'Photo not found' });

  // Delete from disk if exists
  if (photo.file_path) {
    const filename = path.basename(photo.file_path);
    const diskPath = path.join(uploadsDir, filename);
    if (fs.existsSync(diskPath)) {
      try { fs.unlinkSync(diskPath); } catch (e) { console.error(e); }
    }
  }

  db.prepare('DELETE FROM vehicle_photos WHERE id = ?').run(photoId);
  res.json({ message: 'Photo deleted successfully' });
});

/* ==========================================================================
   DOCUMENT MANAGEMENT & 7-STEP ADD PROCESS
   ========================================================================== */

app.get('/api/documents', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const { vehicleId, type, filter } = req.query;

  let query = `
    SELECT d.*, v.vehicle_number, v.model as vehicle_model
    FROM documents d
    JOIN vehicles v ON d.vehicle_id = v.id
    WHERE v.user_id = ?
  `;
  const params = [userId];

  if (vehicleId) {
    query += ` AND d.vehicle_id = ?`;
    params.push(vehicleId);
  }

  if (type) {
    query += ` AND d.document_type = ?`;
    params.push(type);
  }

  query += ` ORDER BY d.expiry_date ASC`;

  const documents = db.prepare(query).all(...params);

  // Compute live statuses
  const results = [];
  for (const doc of documents) {
    doc.statusInfo = getDocumentStatus(doc.expiry_date);

    if (filter === 'expired' && doc.statusInfo.status !== 'EXPIRED') continue;
    if (filter === 'tomorrow' && doc.statusInfo.status !== 'EXPIRES_TOMORROW' && doc.statusInfo.status !== 'EXPIRES_TODAY') continue;
    if (filter === 'two_days' && doc.statusInfo.status !== 'EXPIRES_2_DAYS') continue;
    if (filter === 'valid' && doc.statusInfo.status !== 'VALID') continue;

    results.push(doc);
  }

  res.json({ documents: results });
});

// Add Document (Simple 7-step process endpoint)
app.post('/api/documents', authMiddleware, upload.single('file'), (req, res) => {
  const userId = req.user.id;
  const { vehicle_id, document_type, document_number, issue_date, expiry_date, notes } = req.body;

  if (!vehicle_id || !document_type || !expiry_date) {
    return res.status(400).json({ error: 'Vehicle, document type, and expiry date are required' });
  }

  // Validate vehicle ownership
  const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ? AND user_id = ?').get(vehicle_id, userId);
  if (!vehicle) return res.status(404).json({ error: 'Vehicle not found or unauthorized' });

  let filePath = null;
  let fileType = null;
  let fileName = null;

  if (req.file) {
    filePath = `/uploads/${req.file.filename}`;
    fileName = req.file.originalname;
    fileType = path.extname(req.file.originalname).toLowerCase().replace('.', '');
  }

  const stmt = db.prepare(`
    INSERT INTO documents (vehicle_id, document_type, document_number, issue_date, expiry_date, file_path, file_type, file_name, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    vehicle_id,
    document_type.trim(),
    document_number ? document_number.trim() : null,
    issue_date || null,
    expiry_date.trim(),
    filePath,
    fileType,
    fileName,
    notes || ''
  );

  const docId = result.lastInsertRowid;

  // Run reminder check immediately
  runReminderChecks(userId);

  const statusInfo = getDocumentStatus(expiry_date);
  logActivity(userId, 'UPLOAD_DOC', `Added ${document_type} for ${vehicle.vehicle_number}`, 'document', docId);

  res.status(201).json({
    id: docId,
    message: 'Document saved successfully.',
    statusInfo
  });
});

app.get('/api/documents/:id', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const docId = req.params.id;

  const document = db.prepare(`
    SELECT d.*, v.vehicle_number, v.model as vehicle_model
    FROM documents d
    JOIN vehicles v ON d.vehicle_id = v.id
    WHERE d.id = ? AND v.user_id = ?
  `).get(docId, userId);

  if (!document) return res.status(404).json({ error: 'Document not found' });

  document.statusInfo = getDocumentStatus(document.expiry_date);
  res.json({ document });
});

app.put('/api/documents/:id', authMiddleware, upload.single('file'), (req, res) => {
  const userId = req.user.id;
  const docId = req.params.id;
  const { document_type, document_number, issue_date, expiry_date, notes } = req.body;

  const doc = db.prepare(`
    SELECT d.*, v.vehicle_number FROM documents d
    JOIN vehicles v ON d.vehicle_id = v.id
    WHERE d.id = ? AND v.user_id = ?
  `).get(docId, userId);

  if (!doc) return res.status(404).json({ error: 'Document not found' });

  let filePath = doc.file_path;
  let fileType = doc.file_type;
  let fileName = doc.file_name;

  if (req.file) {
    filePath = `/uploads/${req.file.filename}`;
    fileName = req.file.originalname;
    fileType = path.extname(req.file.originalname).toLowerCase().replace('.', '');
  }

  db.prepare(`
    UPDATE documents
    SET document_type = ?, document_number = ?, issue_date = ?, expiry_date = ?,
        file_path = ?, file_type = ?, file_name = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    document_type || doc.document_type,
    document_number !== undefined ? document_number : doc.document_number,
    issue_date !== undefined ? issue_date : doc.issue_date,
    expiry_date || doc.expiry_date,
    filePath,
    fileType,
    fileName,
    notes !== undefined ? notes : doc.notes,
    docId
  );

  runReminderChecks(userId);
  logActivity(userId, 'UPDATE_DOC', `Updated ${doc.document_type} for ${doc.vehicle_number}`, 'document', docId);

  res.json({ message: 'Document updated successfully.' });
});

app.delete('/api/documents/:id', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const docId = req.params.id;

  const doc = db.prepare(`
    SELECT d.*, v.vehicle_number FROM documents d
    JOIN vehicles v ON d.vehicle_id = v.id
    WHERE d.id = ? AND v.user_id = ?
  `).get(docId, userId);

  if (!doc) return res.status(404).json({ error: 'Document not found' });

  db.prepare('DELETE FROM documents WHERE id = ?').run(docId);
  logActivity(userId, 'DELETE_DOC', `Deleted ${doc.document_type} for ${doc.vehicle_number}`, 'document', docId);

  res.json({ message: 'Document deleted successfully' });
});

/* ==========================================================================
   DRIVERS CRUD
   ========================================================================== */

app.get('/api/drivers', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const drivers = db.prepare(`
    SELECT dr.*, v.vehicle_number, v.model as vehicle_model
    FROM drivers dr
    LEFT JOIN vehicles v ON dr.assigned_vehicle_id = v.id
    WHERE dr.user_id = ?
    ORDER BY dr.created_at DESC
  `).all(userId);

  for (const dr of drivers) {
    dr.licenceStatusInfo = getDocumentStatus(dr.licence_expiry);
  }

  res.json({ drivers });
});

app.post('/api/drivers', authMiddleware, upload.single('photo'), (req, res) => {
  const userId = req.user.id;
  const { name, phone, licence_number, licence_expiry, assigned_vehicle_id, address, emergency_contact, notes } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: 'Driver name and phone number are required' });
  }

  let photoPath = null;
  if (req.file) {
    photoPath = `/uploads/${req.file.filename}`;
  }

  const stmt = db.prepare(`
    INSERT INTO drivers (user_id, name, phone, licence_number, licence_expiry, assigned_vehicle_id, address, emergency_contact, photo_path, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    userId,
    name.trim(),
    phone.trim(),
    licence_number ? licence_number.trim() : null,
    licence_expiry ? licence_expiry.trim() : null,
    assigned_vehicle_id ? parseInt(assigned_vehicle_id) : null,
    address || '',
    emergency_contact || '',
    photoPath,
    notes || ''
  );

  const driverId = result.lastInsertRowid;

  // If vehicle assigned, update vehicle driver_id
  if (assigned_vehicle_id) {
    db.prepare('UPDATE vehicles SET driver_id = ? WHERE id = ?').run(driverId, assigned_vehicle_id);
  }

  runReminderChecks(userId);
  logActivity(userId, 'CREATE_DRIVER', `Added driver ${name}`, 'driver', driverId);

  res.status(201).json({ id: driverId, message: 'Driver added successfully' });
});

app.put('/api/drivers/:id', authMiddleware, upload.single('photo'), (req, res) => {
  const userId = req.user.id;
  const driverId = req.params.id;
  const { name, phone, licence_number, licence_expiry, assigned_vehicle_id, address, emergency_contact, notes } = req.body;

  const driver = db.prepare('SELECT * FROM drivers WHERE id = ? AND user_id = ?').get(driverId, userId);
  if (!driver) return res.status(404).json({ error: 'Driver not found' });

  let photoPath = driver.photo_path;
  if (req.file) {
    photoPath = `/uploads/${req.file.filename}`;
  }

  db.prepare(`
    UPDATE drivers
    SET name = ?, phone = ?, licence_number = ?, licence_expiry = ?, assigned_vehicle_id = ?,
        address = ?, emergency_contact = ?, photo_path = ?, notes = ?
    WHERE id = ?
  `).run(
    name || driver.name,
    phone || driver.phone,
    licence_number !== undefined ? licence_number : driver.licence_number,
    licence_expiry !== undefined ? licence_expiry : driver.licence_expiry,
    assigned_vehicle_id ? parseInt(assigned_vehicle_id) : null,
    address !== undefined ? address : driver.address,
    emergency_contact !== undefined ? emergency_contact : driver.emergency_contact,
    photoPath,
    notes !== undefined ? notes : driver.notes,
    driverId
  );

  if (assigned_vehicle_id) {
    db.prepare('UPDATE vehicles SET driver_id = ? WHERE id = ?').run(driverId, assigned_vehicle_id);
  }

  runReminderChecks(userId);
  res.json({ message: 'Driver updated successfully' });
});

app.delete('/api/drivers/:id', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    const driverId = req.params.id;

    const driver = db.prepare('SELECT * FROM drivers WHERE id = ? AND user_id = ?').get(driverId, userId);
    if (!driver) return res.status(404).json({ error: 'Driver not found' });

    // Clear driver_id in vehicles
    db.prepare('UPDATE vehicles SET driver_id = NULL WHERE driver_id = ? AND user_id = ?').run(driverId, userId);

    db.prepare('DELETE FROM drivers WHERE id = ? AND user_id = ?').run(driverId, userId);
    logActivity(userId, 'DELETE_DRIVER', `Deleted driver ${driver.name}`, 'driver', driverId);

    res.json({ message: 'Driver deleted successfully' });
  } catch (err) {
    console.error('Failed to delete driver:', err);
    return res.status(500).json({ error: `Failed to delete driver: ${err.message}` });
  }
});

/* ==========================================================================
   MAINTENANCE CRUD
   ========================================================================== */

app.get('/api/maintenance', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const { vehicleId } = req.query;

  let query = `
    SELECT m.*, v.vehicle_number, v.model
    FROM maintenance m
    JOIN vehicles v ON m.vehicle_id = v.id
    WHERE v.user_id = ?
  `;
  const params = [userId];

  if (vehicleId) {
    query += ` AND m.vehicle_id = ?`;
    params.push(vehicleId);
  }

  query += ` ORDER BY m.service_date DESC`;

  const records = db.prepare(query).all(...params);
  res.json({ maintenance: records });
});

app.post('/api/maintenance', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const { vehicle_id, maintenance_type, service_date, next_service_date, current_km, next_service_km, amount, vendor_name, notes } = req.body;

  if (!vehicle_id || !maintenance_type || !service_date) {
    return res.status(400).json({ error: 'Vehicle, maintenance type, and service date are required' });
  }

  const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ? AND user_id = ?').get(vehicle_id, userId);
  if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });

  const stmt = db.prepare(`
    INSERT INTO maintenance (vehicle_id, maintenance_type, service_date, next_service_date, current_km, next_service_km, amount, vendor_name, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    vehicle_id,
    maintenance_type,
    service_date,
    next_service_date || null,
    current_km ? parseInt(current_km) : null,
    next_service_km ? parseInt(next_service_km) : null,
    amount ? parseFloat(amount) : 0,
    vendor_name || '',
    notes || ''
  );

  logActivity(userId, 'MAINTENANCE_LOG', `Recorded ${maintenance_type} for ${vehicle.vehicle_number}`, 'maintenance', result.lastInsertRowid);

  res.status(201).json({ id: result.lastInsertRowid, message: 'Maintenance record saved' });
});

app.delete('/api/maintenance/:id', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const id = req.params.id;

  const item = db.prepare(`
    SELECT m.* FROM maintenance m
    JOIN vehicles v ON m.vehicle_id = v.id
    WHERE m.id = ? AND v.user_id = ?
  `).get(id, userId);

  if (!item) return res.status(404).json({ error: 'Maintenance record not found' });

  db.prepare('DELETE FROM maintenance WHERE id = ?').run(id);
  res.json({ message: 'Record deleted successfully' });
});

/* ==========================================================================
   EXPENSES CRUD & ANALYTICS
   ========================================================================== */

app.get('/api/expenses', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const { vehicleId, category, month } = req.query;

  let query = `
    SELECT e.*, v.vehicle_number, v.model
    FROM expenses e
    JOIN vehicles v ON e.vehicle_id = v.id
    WHERE v.user_id = ?
  `;
  const params = [userId];

  if (vehicleId) {
    query += ` AND e.vehicle_id = ?`;
    params.push(vehicleId);
  }

  if (category) {
    query += ` AND e.category = ?`;
    params.push(category);
  }

  if (month) {
    query += ` AND e.expense_date LIKE ?`;
    params.push(`${month}%`);
  }

  query += ` ORDER BY e.expense_date DESC`;

  const expenses = db.prepare(query).all(...params);

  // Category summary
  const categoryTotals = db.prepare(`
    SELECT e.category, SUM(e.amount) as total, count(*) as count
    FROM expenses e
    JOIN vehicles v ON e.vehicle_id = v.id
    WHERE v.user_id = ?
    GROUP BY e.category
    ORDER BY total DESC
  `).all(userId);

  res.json({ expenses, categoryTotals });
});

app.post('/api/expenses', authMiddleware, upload.single('receipt'), (req, res) => {
  const userId = req.user.id;
  const { vehicle_id, category, amount, expense_date, description } = req.body;

  if (!vehicle_id || !category || !amount || !expense_date) {
    return res.status(400).json({ error: 'Vehicle, category, amount, and date are required' });
  }

  const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ? AND user_id = ?').get(vehicle_id, userId);
  if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });

  let receiptPath = null;
  if (req.file) {
    receiptPath = `/uploads/${req.file.filename}`;
  }

  const stmt = db.prepare(`
    INSERT INTO expenses (vehicle_id, category, amount, expense_date, description, receipt_path)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    vehicle_id,
    category,
    parseFloat(amount),
    expense_date,
    description || '',
    receiptPath
  );

  logActivity(userId, 'EXPENSE_LOG', `Recorded ${category} expense of ₹${parseFloat(amount).toLocaleString('en-IN')} for ${vehicle.vehicle_number}`, 'expense', result.lastInsertRowid);

  res.status(201).json({ id: result.lastInsertRowid, message: 'Expense recorded successfully' });
});

app.delete('/api/expenses/:id', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const id = req.params.id;

  const item = db.prepare(`
    SELECT e.* FROM expenses e
    JOIN vehicles v ON e.vehicle_id = v.id
    WHERE e.id = ? AND v.user_id = ?
  `).get(id, userId);

  if (!item) return res.status(404).json({ error: 'Expense not found' });

  db.prepare('DELETE FROM expenses WHERE id = ?').run(id);
  res.json({ message: 'Expense deleted successfully' });
});

/* ==========================================================================
   NOTIFICATIONS & IN-APP REMINDERS
   ========================================================================== */

app.get('/api/notifications', authMiddleware, (req, res) => {
  const userId = req.user.id;
  runReminderChecks(userId);

  const notifications = db.prepare(`
    SELECT n.*, v.vehicle_number, d.document_type
    FROM notifications n
    LEFT JOIN vehicles v ON n.vehicle_id = v.id
    LEFT JOIN documents d ON n.document_id = d.id
    WHERE n.user_id = ?
    ORDER BY n.created_at DESC
    LIMIT 50
  `).all(userId);

  const unreadCount = db.prepare('SELECT count(*) as c FROM notifications WHERE user_id = ? AND is_read = 0').get(userId).c;

  res.json({ notifications, unreadCount });
});

app.post('/api/notifications/:id/read', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const id = req.params.id;

  db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(id, userId);
  res.json({ message: 'Marked as read' });
});

app.post('/api/notifications/mark-all-read', authMiddleware, (req, res) => {
  const userId = req.user.id;
  db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(userId);
  res.json({ message: 'All notifications marked as read' });
});

/* ==========================================================================
   GLOBAL SEARCH
   ========================================================================== */

app.get('/api/search', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const q = (req.query.q || '').trim();

  if (!q) {
    return res.json({ vehicles: [], documents: [], drivers: [] });
  }

  const searchPattern = `%${q}%`;

  // Search Vehicles
  const vehicles = db.prepare(`
    SELECT v.*, dr.name as driver_name
    FROM vehicles v
    LEFT JOIN drivers dr ON v.driver_id = dr.id
    WHERE v.user_id = ? AND (v.vehicle_number LIKE ? OR v.model LIKE ? OR v.vehicle_type LIKE ?)
  `).all(userId, searchPattern, searchPattern, searchPattern);

  // Search Documents
  const documents = db.prepare(`
    SELECT d.*, v.vehicle_number
    FROM documents d
    JOIN vehicles v ON d.vehicle_id = v.id
    WHERE v.user_id = ? AND (d.document_type LIKE ? OR d.document_number LIKE ? OR v.vehicle_number LIKE ?)
  `).all(userId, searchPattern, searchPattern, searchPattern);

  for (const doc of documents) {
    doc.statusInfo = getDocumentStatus(doc.expiry_date);
  }

  // Search Drivers
  const drivers = db.prepare(`
    SELECT dr.*, v.vehicle_number
    FROM drivers dr
    LEFT JOIN vehicles v ON dr.assigned_vehicle_id = v.id
    WHERE dr.user_id = ? AND (dr.name LIKE ? OR dr.phone LIKE ? OR dr.licence_number LIKE ?)
  `).all(userId, searchPattern, searchPattern, searchPattern);

  res.json({ vehicles, documents, drivers });
});

/* ==========================================================================
   DATABASE RESET & SEED ENDPOINT
   ========================================================================== */

app.post('/api/seed/reset', (req, res) => {
  try {
    seedFleetData();
    res.json({ message: 'Fleet database successfully reset and seeded with realistic demo trucks and documents!' });
  } catch (err) {
    console.error('Reset error:', err);
    res.status(500).json({ error: 'Failed to reset database: ' + err.message });
  }
});

// Robust frontend build resolution across production environments
const candidateDistPaths = [
  path.resolve(__dirname, '..', 'client', 'dist'),
  path.resolve(process.cwd(), 'client', 'dist'),
  path.resolve(__dirname, 'client', 'dist'),
  path.resolve(process.cwd(), 'dist')
];

const clientDist = candidateDistPaths.find(p => fs.existsSync(p) && fs.existsSync(path.join(p, 'index.html')));

if (clientDist) {
  console.log(`📦 Serving production client assets from: ${clientDist}`);
  app.use(express.static(clientDist));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api/') && req.path !== '/api' && !req.path.startsWith('/uploads/')) {
      return res.sendFile(path.join(clientDist, 'index.html'));
    }
    next();
  });
} else {
  console.warn('⚠️ client/dist not found. Serving API fallback landing page.');
  app.get('/', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <title>FleetManager Pro Cloud Server</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #07111F; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
            .card { background: #0B192C; border: 1px solid rgba(255,255,255,0.12); border-radius: 16px; padding: 36px 28px; max-width: 480px; text-align: center; box-shadow: 0 24px 48px rgba(0,0,0,0.6); }
            .badge { display: inline-block; background: rgba(34,197,94,0.15); color: #4ade80; border: 1px solid rgba(34,197,94,0.3); padding: 5px 14px; border-radius: 9999px; font-weight: 700; font-size: 13px; margin-bottom: 18px; letter-spacing: 0.5px; }
            h1 { color: #38bdf8; font-size: 26px; font-weight: 800; margin: 0 0 10px 0; }
            p { color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0; }
            .btn { display: inline-block; background: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 14px; margin-top: 10px; transition: background 0.2s; }
            .btn:hover { background: #1d4ed8; }
            .meta { margin-top: 24px; padding-top: 18px; border-top: 1px solid rgba(255,255,255,0.08); font-size: 12px; color: #64748b; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="badge">🟢 SERVER ONLINE</div>
            <h1>FleetManager Pro API</h1>
            <p>The cloud backend server and SQLite fleet database are running live.</p>
            <p>Connect your Android APK or external clients using this server URL.</p>
            <a href="/api/health" class="btn">Check /api/health Status →</a>
            <div class="meta">FleetManager Pro Enterprise &bull; 24/7 Cloud Node Engine</div>
          </div>
        </body>
      </html>
    `);
  });
}

app.listen(PORT, () => {
  console.log(`🚛 FleetManager Backend API running on port ${PORT}`);
});
