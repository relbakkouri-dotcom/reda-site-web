# Student Management System - Quick Start Guide

## What's Included

This is a complete full-stack Student Management application with:

- **Backend**: Express.js server with RESTful API
- **Database**: SQLite3 with automatic schema creation
- **Frontend**: Beautiful, responsive HTML/CSS/JavaScript interface
- **Features**: Add, edit, delete, search students with real-time statistics

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
npm start
```

### 3. Open in Browser
Navigate to: **http://localhost:3000**

## What You Can Do

✅ **Add Students** - Fill the form and click "Add Student"
✅ **Edit Students** - Click "Edit" button, modify, and save
✅ **Delete Students** - Click "Delete" and confirm
✅ **Search** - Find students by name or email
✅ **View Stats** - See total students, active count, and average GPA

## File Structure

```
reda-site-web/
├── src/server.js           ← Backend API
├── src/database.js         ← Database setup
├── public/
│   ├── index.html          ← Frontend page
│   ├── style.css           ← Styling
│   └── script.js           ← Interactivity
├── data/students.db        ← Database (auto-created)
└── package.json            ← Dependencies
```

## Database

SQLite database is automatically created in the `data/` folder on first run.

## Environment

- **Server Port**: 3000
- **Database**: SQLite (local file)
- **Frontend**: Responsive design (mobile & desktop)

## Available API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/students` | Get all students |
| GET | `/api/students/:id` | Get student by ID |
| POST | `/api/students` | Create new student |
| PUT | `/api/students/:id` | Update student |
| DELETE | `/api/students/:id` | Delete student |
| GET | `/api/search?query=text` | Search students |
| GET | `/api/statistics` | Get statistics |

## Troubleshooting

**Port already in use?**
The app uses port 3000. If it's in use, modify `server.js` to change the port.

**Database issues?**
Delete the `data/students.db` file and restart the server to reset the database.

**Dependencies not installing?**
Make sure Node.js is installed: `node --version`

## Additional Notes

- Data persists in SQLite database
- No external API required
- Run locally only (no production deployment in this version)
- Student email must be unique
- GPA value should be between 0-4
