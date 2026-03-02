const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Check if running on Vercel (serverless environment)
const isVercel = !!process.env.VERCEL;

let dbPath;
if (isVercel) {
  // Use /tmp directory on Vercel (ephemeral, but better than failing)
  dbPath = '/tmp/students.db';
  console.log('Running on Vercel: Using /tmp for database');
} else {
  // Local development
  const dataDir = path.join(__dirname, '../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  dbPath = path.join(dataDir, 'students.db');
}

let db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
    initializeDatabase();
  }
});

function initializeDatabase() {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      dateOfBirth TEXT,
      enrollmentDate TEXT DEFAULT CURRENT_DATE,
      gpa REAL,
      status TEXT DEFAULT 'Active',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
  });
}

module.exports = db;
