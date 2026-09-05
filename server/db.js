const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'fleet.db');
const db = new Database(dbPath);

// Enable WAL mode for high performance and concurrency
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize database schema
function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      password_hash TEXT NOT NULL,
      business_name TEXT DEFAULT 'My Trucking Logistics',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      vehicle_number TEXT NOT NULL,
      vehicle_type TEXT NOT NULL DEFAULT 'Truck',
      model TEXT NOT NULL,
      manufacturing_year INTEGER,
      purchase_date TEXT,
      owner_name TEXT,
      driver_id INTEGER,
      status TEXT DEFAULT 'active',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS vehicle_photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicle_id INTEGER NOT NULL,
      file_path TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_size INTEGER,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicle_id INTEGER NOT NULL,
      document_type TEXT NOT NULL,
      document_number TEXT,
      issue_date TEXT,
      expiry_date TEXT NOT NULL,
      file_path TEXT,
      file_type TEXT,
      file_name TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS drivers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      licence_number TEXT,
      licence_expiry TEXT,
      assigned_vehicle_id INTEGER,
      address TEXT,
      emergency_contact TEXT,
      photo_path TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS maintenance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicle_id INTEGER NOT NULL,
      maintenance_type TEXT NOT NULL,
      service_date TEXT NOT NULL,
      next_service_date TEXT,
      current_km INTEGER,
      next_service_km INTEGER,
      amount REAL DEFAULT 0,
      notes TEXT,
      vendor_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicle_id INTEGER NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      expense_date TEXT NOT NULL,
      description TEXT,
      receipt_path TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      vehicle_id INTEGER,
      document_id INTEGER,
      driver_id INTEGER,
      notification_type TEXT NOT NULL, /* two_days, one_day, expired, maintenance */
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      scheduled_date TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
      FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
      FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      action_type TEXT NOT NULL,
      description TEXT NOT NULL,
      entity_type TEXT,
      entity_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_vehicles_user ON vehicles(user_id);
    CREATE INDEX IF NOT EXISTS idx_vehicles_num ON vehicles(vehicle_number);
    CREATE INDEX IF NOT EXISTS idx_documents_vehicle ON documents(vehicle_id);
    CREATE INDEX IF NOT EXISTS idx_documents_expiry ON documents(expiry_date);
    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
  `);
}

initSchema();

module.exports = {
  db,
  uploadsDir
};
