const bcrypt = require('bcryptjs');
const { db } = require('./db');
const { runReminderChecks } = require('./services/reminderEngine');

function offsetDateStr(daysOffset) {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function pastDateStr(monthsAgo) {
  const d = new Date();
  d.setMonth(d.getMonth() - monthsAgo);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function seedFleetData() {
  console.log('Seeding fleet database with realistic demo transport data...');

  // Clear existing demo tables
  db.exec(`
    DELETE FROM activity_logs;
    DELETE FROM notifications;
    DELETE FROM expenses;
    DELETE FROM maintenance;
    DELETE FROM documents;
    DELETE FROM vehicle_photos;
    DELETE FROM vehicles;
    DELETE FROM drivers;
    DELETE FROM users;
  `);

  // 1. Create Default Owner User
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync('fleet123', salt);

  const userStmt = db.prepare(`
    INSERT INTO users (name, email, phone, password_hash, business_name)
    VALUES (?, ?, ?, ?, ?)
  `);
  const userResult = userStmt.run(
    'Rajesh Transport Services',
    'owner@fleetmanager.com',
    '+91 98220 12345',
    passwordHash,
    'Rajesh Transport & Logistics Co.'
  );
  const userId = userResult.lastInsertRowid;

  // 2. Create Drivers
  const driverStmt = db.prepare(`
    INSERT INTO drivers (user_id, name, phone, licence_number, licence_expiry, address, emergency_contact, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const driver1 = driverStmt.run(
    userId,
    'Rahul Patil',
    '+91 98231 11223',
    'MH-09-2015-0045231',
    offsetDateStr(240), // valid
    'Kolhapur, Maharashtra',
    'Sunita Patil (+91 98231 99887)',
    'Experienced heavy vehicle driver with 8 years experience. Clean record.'
  ).lastInsertRowid;

  const driver2 = driverStmt.run(
    userId,
    'Suresh Kumar',
    '+91 98232 22334',
    'MH-12-2017-0098412',
    offsetDateStr(1), // Driver licence expiring TOMORROW! (1 day)
    'Pune, Maharashtra',
    'Kavita Kumar (+91 98232 88776)',
    'Long-distance route specialist (Mumbai-Delhi corridor).'
  ).lastInsertRowid;

  const driver3 = driverStmt.run(
    userId,
    'Vikram Singh',
    '+91 98233 33445',
    'RJ-14-2016-0012984',
    offsetDateStr(450), // valid
    'Jaipur / Navi Mumbai Depot',
    'Ramesh Singh (+91 98233 77665)',
    'Container trailer specialist.'
  ).lastInsertRowid;

  const driver4 = driverStmt.run(
    userId,
    'Mahesh Jadhav',
    '+91 98234 44556',
    'MH-09-2018-0056123',
    offsetDateStr(2), // Driver licence expiring in 2 DAYS!
    'Sangli, Maharashtra',
    'Anjali Jadhav (+91 98234 66554)',
    'Local distribution and port haulage.'
  ).lastInsertRowid;

  // 3. Create Vehicles
  const vehicleStmt = db.prepare(`
    INSERT INTO vehicles (user_id, vehicle_number, vehicle_type, model, manufacturing_year, purchase_date, owner_name, driver_id, status, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Truck 1: MH 09 AB 1234 (Has EXPIRED Insurance)
  const v1 = vehicleStmt.run(
    userId,
    'MH 09 AB 1234',
    'Multi-Axle Truck (16-Wheeler)',
    'Tata Signa 4825.T',
    2022,
    '2022-04-15',
    'Rajesh Transport Co.',
    driver1,
    'active',
    'Primary heavy load truck for Pune-Bangalore highway route.'
  ).lastInsertRowid;

  // Truck 2: MH 09 AB 5678 (Has PUC EXPIRES TOMORROW - 1 day)
  const v2 = vehicleStmt.run(
    userId,
    'MH 09 AB 5678',
    'Heavy Goods Truck (10-Wheeler)',
    'Ashok Leyland 2820-6x2',
    2021,
    '2021-08-20',
    'Rajesh Transport Co.',
    driver2,
    'active',
    'Assigned to Mumbai-Indore transport line.'
  ).lastInsertRowid;

  // Truck 3: MH 09 AB 9012 (Has National Permit EXPIRES IN 2 DAYS)
  const v3 = vehicleStmt.run(
    userId,
    'MH 09 AB 9012',
    'Heavy Haulage Truck',
    'BharatBenz 3528R',
    2023,
    '2023-02-10',
    'Rajesh Transport Co.',
    driver3,
    'active',
    'Express parcel and industrial steel cargo carrier.'
  ).lastInsertRowid;

  // Truck 4: MH 12 PQ 3456 (All Valid)
  const v4 = vehicleStmt.run(
    userId,
    'MH 12 PQ 3456',
    'Container Truck',
    'Eicher Pro 6028',
    2023,
    '2023-11-05',
    'Rajesh Transport Co.',
    driver4,
    'active',
    'Dedicated refrigerated pharma and FMCG delivery.'
  ).lastInsertRowid;

  // Truck 5: MH 14 CD 7890 (Has Fitness EXPIRED 5 days ago)
  const v5 = vehicleStmt.run(
    userId,
    'MH 14 CD 7890',
    'Tractor Trailer',
    'Tata Prima 5530.S',
    2020,
    '2020-09-18',
    'Rajesh Transport Co.',
    null,
    'maintenance',
    'Heavy 40ft container trailer unit.'
  ).lastInsertRowid;

  // Update drivers with assigned vehicle ids
  db.prepare('UPDATE drivers SET assigned_vehicle_id = ? WHERE id = ?').run(v1, driver1);
  db.prepare('UPDATE drivers SET assigned_vehicle_id = ? WHERE id = ?').run(v2, driver2);
  db.prepare('UPDATE drivers SET assigned_vehicle_id = ? WHERE id = ?').run(v3, driver3);
  db.prepare('UPDATE drivers SET assigned_vehicle_id = ? WHERE id = ?').run(v4, driver4);

  // 4. Create Documents for Vehicles
  const docStmt = db.prepare(`
    INSERT INTO documents (vehicle_id, document_type, document_number, issue_date, expiry_date, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  // Documents for Truck 1 (MH 09 AB 1234)
  docStmt.run(v1, 'Registration Certificate (RC)', 'MH09AB1234/RC/2022', '2022-04-15', offsetDateStr(1800), 'Original RC registered at Kolhapur RTO.');
  docStmt.run(v1, 'Insurance', 'HDFC-ERGO-POL-99281', pastDateStr(12), offsetDateStr(-3), 'Comprehensive policy. Expired 3 days ago!'); // 🔴 EXPIRED
  docStmt.run(v1, 'PUC (Pollution Under Control)', 'PUC-MH09-887192', pastDateStr(6), offsetDateStr(85), 'Valid emission test certificate.');
  docStmt.run(v1, 'Fitness Certificate', 'FC-MH09-2024-0019', pastDateStr(10), offsetDateStr(120), 'Passed vehicle fitness inspection.');
  docStmt.run(v1, 'National Permit', 'NP-AUTH-2023-7761', pastDateStr(11), offsetDateStr(35), 'All India Permit valid till next month.');
  docStmt.run(v1, 'Road Tax', 'TAX-REC-2024-8812', pastDateStr(4), offsetDateStr(240), 'Annual road tax paid in full.');

  // Documents for Truck 2 (MH 09 AB 5678)
  docStmt.run(v2, 'Registration Certificate (RC)', 'MH09AB5678/RC/2021', '2021-08-20', offsetDateStr(1500), 'RC smart card registered at RTO.');
  docStmt.run(v2, 'Insurance', 'ICICI-LOMBARD-TRK-7712', pastDateStr(11), offsetDateStr(45), 'Comprehensive commercial coverage.');
  docStmt.run(v2, 'PUC (Pollution Under Control)', 'PUC-MH09-994411', pastDateStr(6), offsetDateStr(1), 'Expires Tomorrow! Immediate testing required.'); // 🚨 EXPIRES TOMORROW (1 day)
  docStmt.run(v2, 'Fitness Certificate', 'FC-MH09-2023-4412', pastDateStr(8), offsetDateStr(150), 'Valid fitness document.');
  docStmt.run(v2, 'State Permit', 'SP-MH-2023-1199', pastDateStr(9), offsetDateStr(90), 'Maharashtra state carrier permit.');
  docStmt.run(v2, 'Road Tax', 'TAX-REC-2024-3321', pastDateStr(5), offsetDateStr(210), 'Quarterly MV tax cleared.');

  // Documents for Truck 3 (MH 09 AB 9012)
  docStmt.run(v3, 'Registration Certificate (RC)', 'MH09AB9012/RC/2023', '2023-02-10', offsetDateStr(2100), 'Valid RC registration.');
  docStmt.run(v3, 'Insurance', 'BAJAJ-ALLIANZ-CV-8823', pastDateStr(10), offsetDateStr(60), 'Valid comprehensive policy.');
  docStmt.run(v3, 'PUC (Pollution Under Control)', 'PUC-MH09-331299', pastDateStr(3), offsetDateStr(90), 'Valid pollution certificate.');
  docStmt.run(v3, 'National Permit', 'NP-AUTH-2023-9988', pastDateStr(12), offsetDateStr(2), 'Expires in 2 Days! Renewal application in progress.'); // ⚠️ EXPIRES IN 2 DAYS (2 days)
  docStmt.run(v3, 'Fitness Certificate', 'FC-MH09-2024-5541', pastDateStr(2), offsetDateStr(310), 'Valid fitness certification.');
  docStmt.run(v3, 'Road Tax', 'TAX-REC-2024-5512', pastDateStr(3), offsetDateStr(270), 'Paid till next year.');

  // Documents for Truck 4 (MH 12 PQ 3456)
  docStmt.run(v4, 'Registration Certificate (RC)', 'MH12PQ3456/RC/2023', '2023-11-05', offsetDateStr(2200), 'RC card issued by Pune RTO.');
  docStmt.run(v4, 'Insurance', 'TATA-AIG-CV-55419', pastDateStr(8), offsetDateStr(120), 'Full bumper-to-bumper insurance.');
  docStmt.run(v4, 'PUC (Pollution Under Control)', 'PUC-MH12-771144', pastDateStr(2), offsetDateStr(120), 'Valid BS6 emission cert.');
  docStmt.run(v4, 'National Permit', 'NP-AUTH-2024-1122', pastDateStr(6), offsetDateStr(180), 'National permit authorized.');
  docStmt.run(v4, 'Fitness Certificate', 'FC-MH12-2023-8821', pastDateStr(7), offsetDateStr(190), 'Annual fitness valid.');
  docStmt.run(v4, 'Road Tax', 'TAX-REC-2024-9901', pastDateStr(2), offsetDateStr(300), 'Tax paid.');

  // Documents for Truck 5 (MH 14 CD 7890)
  docStmt.run(v5, 'Registration Certificate (RC)', 'MH14CD7890/RC/2020', '2020-09-18', offsetDateStr(1100), 'RC smart card.');
  docStmt.run(v5, 'Insurance', 'NEW-INDIA-ASSUR-3312', pastDateStr(11), offsetDateStr(30), 'Valid third party + own damage.');
  docStmt.run(v5, 'Fitness Certificate', 'FC-MH14-2023-0091', pastDateStr(12), offsetDateStr(-5), 'Expired 5 days ago! Truck scheduled for RTO inspection.'); // 🔴 EXPIRED
  docStmt.run(v5, 'PUC (Pollution Under Control)', 'PUC-MH14-110099', pastDateStr(4), offsetDateStr(60), 'Valid.');
  docStmt.run(v5, 'National Permit', 'NP-AUTH-2023-4455', pastDateStr(9), offsetDateStr(90), 'Valid national authorization.');

  // 5. Create Maintenance Records
  const maintStmt = db.prepare(`
    INSERT INTO maintenance (vehicle_id, maintenance_type, service_date, next_service_date, current_km, next_service_km, amount, vendor_name, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  maintStmt.run(v1, 'Major Service & Oil Change', offsetDateStr(-30), offsetDateStr(15), 145200, 155000, 24500, 'Tata Authorized Workshop - Kolhapur', 'Engine oil, oil filter, diesel filter replaced. Brake liners adjusted.');
  maintStmt.run(v2, 'Tyre Replacement', offsetDateStr(-60), offsetDateStr(90), 182300, 220000, 58000, 'Apollo Tyres Dealer, Pune', '4 drive axle tyres replaced with Apollo EnduRace.');
  maintStmt.run(v3, 'Scheduled Service', offsetDateStr(-20), offsetDateStr(40), 98400, 110000, 18500, 'BharatBenz Service Center', 'Standard 100K interval general service & wheel balancing.');
  maintStmt.run(v4, 'Battery Replacement', offsetDateStr(-10), offsetDateStr(360), 65000, 120000, 14200, 'Exide Power Care', 'New 180Ah heavy duty battery installed with 36m warranty.');
  maintStmt.run(v5, 'Suspension & Leaf Spring Repair', offsetDateStr(-5), offsetDateStr(10), 235000, 245000, 32000, 'Shree Ram Truck Garage, Nigdi', 'Rear spring bush replacement and hub greasing.');

  // 6. Create Expenses
  const expStmt = db.prepare(`
    INSERT INTO expenses (vehicle_id, category, amount, expense_date, description)
    VALUES (?, ?, ?, ?, ?)
  `);

  expStmt.run(v1, 'Diesel', 18500, offsetDateStr(-2), 'Full tank diesel (205 Litres) at HPCL Highway Fuel Stop.');
  expStmt.run(v1, 'Toll', 3450, offsetDateStr(-2), 'Fastag toll charges for Pune-Bangalore stretch.');
  expStmt.run(v2, 'Diesel', 16200, offsetDateStr(-4), 'Diesel 180 Litres at BPCL bypass pump.');
  expStmt.run(v2, 'Repairs', 4500, offsetDateStr(-6), 'Air pressure pipe leak repair and coolant top-up.');
  expStmt.run(v3, 'Diesel', 22000, offsetDateStr(-1), 'Diesel 240 Litres for Mumbai-Delhi transit.');
  expStmt.run(v3, 'Permit', 16500, offsetDateStr(-25), 'National permit annual fee renewal deposit.');
  expStmt.run(v4, 'Service', 14200, offsetDateStr(-10), 'Exide Heavy Duty Battery purchase.');
  expStmt.run(v5, 'Repairs', 32000, offsetDateStr(-5), 'Rear suspension and hub greasing overhaul.');

  // 7. Activity Logs
  const logStmt = db.prepare(`
    INSERT INTO activity_logs (user_id, action_type, description, entity_type, entity_id)
    VALUES (?, ?, ?, ?, ?)
  `);

  logStmt.run(userId, 'CREATE_VEHICLE', 'Added new vehicle MH 09 AB 1234 (Tata Signa)', 'vehicle', v1);
  logStmt.run(userId, 'CREATE_VEHICLE', 'Added new vehicle MH 09 AB 5678 (Ashok Leyland)', 'vehicle', v2);
  logStmt.run(userId, 'CREATE_VEHICLE', 'Added new vehicle MH 09 AB 9012 (BharatBenz)', 'vehicle', v3);
  logStmt.run(userId, 'UPLOAD_DOC', 'Added Insurance for MH 09 AB 1234', 'document', 2);
  logStmt.run(userId, 'EXPENSE_LOG', 'Recorded Diesel expense of ₹18,500 for MH 09 AB 1234', 'expense', 1);

  // 8. Run Reminder Checks to generate initial notifications
  runReminderChecks(userId);

  console.log('Fleet database seeded successfully with 5 vehicles, realistic documents, drivers, maintenance, and expenses!');
}

module.exports = {
  seedFleetData
};
