#!/usr/bin/env python3
"""
Student Management System - Standalone Python Backend
Provides the same functionality without requiring Node.js
"""

import json
import sqlite3
import os
from datetime import datetime
from pathlib import Path
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import threading

# Configuration
DB_PATH = Path(__file__).parent / 'data' / 'students.db'
DB_PATH.parent.mkdir(parents=True, exist_ok=True)
PORT = 3000

# Initialize database
def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS students (
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
        )
    ''')
    conn.commit()
    conn.close()

class StudentAPIHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        path = urlparse(self.path).path
        query_params = parse_qs(urlparse(self.path).query)
        
        # API Routes
        if path == '/api/students':
            self.handle_get_students()
        elif path.startswith('/api/students/') and path != '/api/students/':
            student_id = path.split('/')[-1]
            self.handle_get_student(student_id)
        elif path == '/api/search':
            query = query_params.get('query', [''])[0]
            self.handle_search(query)
        elif path == '/api/statistics':
            self.handle_statistics()
        elif path == '/' or path == '/index.html':
            self.serve_file('public/index.html', 'text/html')
        elif path.startswith('/'):
            self.serve_file('public' + path, self.get_mime_type(path))
        else:
            self.send_error(404)
    
    def do_POST(self):
        if self.path == '/api/students':
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            data = json.loads(body)
            self.handle_create_student(data)
        else:
            self.send_error(404)
    
    def do_PUT(self):
        if self.path.startswith('/api/students/'):
            student_id = self.path.split('/')[-1]
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            data = json.loads(body)
            self.handle_update_student(student_id, data)
        else:
            self.send_error(404)
    
    def do_DELETE(self):
        if self.path.startswith('/api/students/'):
            student_id = self.path.split('/')[-1]
            self.handle_delete_student(student_id)
        else:
            self.send_error(404)
    
    def handle_get_students(self):
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM students ORDER BY id DESC')
        students = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        self.send_json(students)
    
    def handle_get_student(self, student_id):
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM students WHERE id = ?', (student_id,))
        student = cursor.fetchone()
        conn.close()
        
        if student:
            self.send_json(dict(student))
        else:
            self.send_error(404, 'Student not found')
    
    def handle_create_student(self, data):
        try:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute(
                '''INSERT INTO students (firstName, lastName, email, phone, dateOfBirth, gpa, status)
                   VALUES (?, ?, ?, ?, ?, ?, ?)''',
                (data['firstName'], data['lastName'], data['email'], 
                 data.get('phone'), data.get('dateOfBirth'), 
                 data.get('gpa'), data.get('status', 'Active'))
            )
            conn.commit()
            student_id = cursor.lastrowid
            conn.close()
            
            self.send_json({
                'id': student_id,
                'message': 'Student added successfully'
            }, 201)
        except Exception as e:
            self.send_error(400, str(e))
    
    def handle_update_student(self, student_id, data):
        try:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute(
                '''UPDATE students 
                   SET firstName=?, lastName=?, email=?, phone=?, dateOfBirth=?, gpa=?, status=?
                   WHERE id=?''',
                (data['firstName'], data['lastName'], data['email'],
                 data.get('phone'), data.get('dateOfBirth'),
                 data.get('gpa'), data.get('status'), student_id)
            )
            conn.commit()
            conn.close()
            
            self.send_json({'message': 'Student updated successfully'})
        except Exception as e:
            self.send_error(400, str(e))
    
    def handle_delete_student(self, student_id):
        try:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute('DELETE FROM students WHERE id=?', (student_id,))
            conn.commit()
            conn.close()
            
            self.send_json({'message': 'Student deleted successfully'})
        except Exception as e:
            self.send_error(400, str(e))
    
    def handle_search(self, query):
        if not query:
            self.send_error(400, 'Search query required')
            return
        
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        search_term = f'%{query}%'
        cursor.execute(
            '''SELECT * FROM students 
               WHERE firstName LIKE ? OR lastName LIKE ? OR email LIKE ?
               ORDER BY id DESC''',
            (search_term, search_term, search_term)
        )
        students = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        self.send_json(students)
    
    def handle_statistics(self):
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute('''
            SELECT 
                COUNT(*) as totalStudents,
                COUNT(CASE WHEN status = 'Active' THEN 1 END) as activeStudents,
                COUNT(CASE WHEN status = 'Inactive' THEN 1 END) as inactiveStudents,
                ROUND(AVG(gpa), 2) as averageGPA
            FROM students
        ''')
        result = cursor.fetchone()
        conn.close()
        
        stats = {
            'totalStudents': result[0],
            'activeStudents': result[1],
            'inactiveStudents': result[2],
            'averageGPA': result[3] or 0.0
        }
        self.send_json(stats)
    
    def serve_file(self, path, mime_type):
        try:
            with open(path, 'rb') as f:
                self.send_response(200)
                self.send_header('Content-type', mime_type)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(f.read())
        except FileNotFoundError:
            self.send_error(404)
    
    def get_mime_type(self, path):
        if path.endswith('.html'):
            return 'text/html'
        elif path.endswith('.css'):
            return 'text/css'
        elif path.endswith('.js'):
            return 'application/javascript'
        elif path.endswith('.json'):
            return 'application/json'
        else:
            return 'text/plain'
    
    def send_json(self, data, status=200):
        self.send_response(status)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())
    
    def send_error(self, code, message=None):
        self.send_response(code)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        error = {'error': message or f'Error {code}'}
        self.wfile.write(json.dumps(error).encode())
    
    def log_message(self, format, *args):
        pass

if __name__ == '__main__':
    print("Initializing database...")
    init_db()
    
    print(f"\n🚀 Student Management System starting...")
    print(f"📍 Server: http://localhost:{PORT}")
    print(f"💾 Database: {DB_PATH}")
    print(f"\nPress Ctrl+C to stop the server\n")
    
    server = HTTPServer(('localhost', PORT), StudentAPIHandler)
    server.serve_forever()
