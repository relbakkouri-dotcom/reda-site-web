# Student Management System

A complete full-stack Student Management application built with Node.js, Express, SQLite, and vanilla JavaScript.

## Features

- ✅ Add, edit, delete, and view students
- ✅ Search students by name or email
- ✅ Real-time statistics (total students, active students, average GPA)
- ✅ Student status management (Active, Inactive, Graduated, Suspended)
- ✅ GPA tracking
- ✅ Responsive design for mobile and desktop
- ✅ RESTful API with SQLite database

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: SQLite3
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Server**: Node.js

## Project Structure

```
reda-site-web/
├── src/
│   ├── server.js           # Express server and API routes
│   └── database.js         # SQLite database configuration
├── public/
│   ├── index.html          # Frontend HTML
│   ├── style.css           # Styling
│   └── script.js           # Frontend JavaScript
├── data/
│   └── students.db         # SQLite database (auto-created)
├── package.json            # Project dependencies
└── README.md              # This file
```

## Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

## Installation

1. **Clone or navigate to the project directory**:
   ```bash
   cd reda-site-web
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

## Running the Application

1. **Start the server**:
   ```bash
   npm start
   ```

2. **Open your browser**:
   - Navigate to `http://localhost:3000`
   - The database will be automatically created on first run

## API Endpoints

### GET `/api/students`
Retrieve all students.

**Response**: Array of student objects

### GET `/api/students/:id`
Retrieve a specific student by ID.

**Response**: Student object

### POST `/api/students`
Create a new student.

**Body**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "dateOfBirth": "2000-01-01",
  "gpa": 3.5,
  "status": "Active"
}
```

### PUT `/api/students/:id`
Update an existing student.

**Body**: Same as POST

### DELETE `/api/students/:id`
Delete a student.

### GET `/api/search?query=name`
Search for students by name or email.

**Query Parameters**:
- `query`: Search term (name or email)

**Response**: Array of matching student objects

### GET `/api/statistics`
Get statistics about students.

**Response**:
```json
{
  "totalStudents": 10,
  "activeStudents": 8,
  "inactiveStudents": 2,
  "averageGPA": 3.45
}
```

## Database Schema

The SQLite database includes a single table:

### students
- `id` (INTEGER, PRIMARY KEY, AUTO INCREMENT)
- `firstName` (TEXT, NOT NULL)
- `lastName` (TEXT, NOT NULL)
- `email` (TEXT, UNIQUE, NOT NULL)
- `phone` (TEXT)
- `dateOfBirth` (TEXT)
- `enrollmentDate` (TEXT, DEFAULT: CURRENT_DATE)
- `gpa` (REAL)
- `status` (TEXT, DEFAULT: 'Active')
- `createdAt` (DATETIME, DEFAULT: CURRENT_TIMESTAMP)

## Usage

### Adding a Student
1. Fill in the form with student details (First Name, Last Name, and Email are required)
2. Click "Add Student"
3. The student will appear in the table below

### Editing a Student
1. Click the "Edit" button next to a student
2. The form will populate with their information
3. Make your changes
4. Click "Update Student"

### Deleting a Student
1. Click the "Delete" button next to a student
2. Confirm the deletion in the modal
3. The student will be removed from the database

### Searching Students
1. Enter a name or email in the search box
2. Click "Search"
3. Results will be displayed in the table
4. Click "Reset" to view all students again

## Features Explained

### Statistics Dashboard
- **Total Students**: Count of all students in the system
- **Active Students**: Count of students with "Active" status
- **Average GPA**: Calculated average GPA of all students

### Status Management
Students can have the following statuses:
- Active
- Inactive
- Graduated
- Suspended

### Responsive Design
The application is fully responsive and works on:
- Desktop browsers
- Tablets
- Mobile devices

## File Descriptions

- **server.js**: Main Express server file with all API endpoints
- **database.js**: SQLite database initialization and connection
- **index.html**: Main HTML structure with form and table
- **style.css**: Complete styling with responsive design
- **script.js**: Frontend JavaScript for interactivity and API calls

## Error Handling

The application includes error handling for:
- Database operations
- API requests
- Form validation
- Search queries

## Future Enhancements

- User authentication and authorization
- Batch import/export of students
- Grade management system
- Attendance tracking
- Email notifications
- Advanced filtering and sorting
- Student photo uploads

## License

ISC

## Author

Created as a full-stack learning project.
