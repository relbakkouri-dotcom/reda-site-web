const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// ==================== API ENDPOINTS ====================

// GET all students
app.get('/api/students', (req, res) => {
  db.all('SELECT * FROM students ORDER BY id DESC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// GET student by ID
app.get('/api/students/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM students WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }
    res.json(row);
  });
});

// POST - Add new student
app.post('/api/students', (req, res) => {
  const { firstName, lastName, email, phone, dateOfBirth, gpa, status } = req.body;

  if (!firstName || !lastName || !email) {
    res.status(400).json({ error: 'firstName, lastName, and email are required' });
    return;
  }

  db.run(
    `INSERT INTO students (firstName, lastName, email, phone, dateOfBirth, gpa, status) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [firstName, lastName, email, phone, dateOfBirth, gpa || null, status || 'Active'],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.status(201).json({
        id: this.lastID,
        firstName,
        lastName,
        email,
        phone,
        dateOfBirth,
        gpa,
        status: status || 'Active',
        message: 'Student added successfully'
      });
    }
  );
});

// PUT - Update student
app.put('/api/students/:id', (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, email, phone, dateOfBirth, gpa, status } = req.body;

  db.run(
    `UPDATE students 
     SET firstName = ?, lastName = ?, email = ?, phone = ?, dateOfBirth = ?, gpa = ?, status = ?
     WHERE id = ?`,
    [firstName, lastName, email, phone, dateOfBirth, gpa, status, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Student not found' });
        return;
      }
      res.json({ message: 'Student updated successfully' });
    }
  );
});

// DELETE - Remove student
app.delete('/api/students/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM students WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }
    res.json({ message: 'Student deleted successfully' });
  });
});

// SEARCH - Search students by name or email
app.get('/api/search', (req, res) => {
  const { query } = req.query;

  if (!query) {
    res.status(400).json({ error: 'Search query is required' });
    return;
  }

  const searchTerm = `%${query}%`;
  db.all(
    `SELECT * FROM students 
     WHERE firstName LIKE ? OR lastName LIKE ? OR email LIKE ? 
     ORDER BY id DESC`,
    [searchTerm, searchTerm, searchTerm],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

// GET - Statistics
app.get('/api/statistics', (req, res) => {
  db.all(
    `SELECT 
       COUNT(*) as totalStudents,
       COUNT(CASE WHEN status = 'Active' THEN 1 END) as activeStudents,
       COUNT(CASE WHEN status = 'Inactive' THEN 1 END) as inactiveStudents,
       ROUND(AVG(gpa), 2) as averageGPA
     FROM students`,
    [],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows[0] || {});
    }
  );
});

// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Export for Vercel serverless
module.exports = app;

// Start server locally (for development)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
