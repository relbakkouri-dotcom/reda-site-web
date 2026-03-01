// Local Storage Database (Works without backend!)
class StudentDB {
  constructor() {
    this.storageKey = 'students_db';
    this.nextId = this.getMaxId() + 1;
  }

  getMaxId() {
    const students = this.getAllStudents();
    return students.length > 0 ? Math.max(...students.map(s => s.id)) : 0;
  }

  getAllStudents() {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  getStudentById(id) {
    const students = this.getAllStudents();
    return students.find(s => s.id === parseInt(id));
  }

  addStudent(student) {
    const students = this.getAllStudents();
    student.id = this.nextId++;
    student.createdAt = new Date().toISOString();
    students.push(student);
    localStorage.setItem(this.storageKey, JSON.stringify(students));
    return student;
  }

  updateStudent(id, student) {
    let students = this.getAllStudents();
    students = students.map(s => s.id === parseInt(id) ? { ...s, ...student } : s);
    localStorage.setItem(this.storageKey, JSON.stringify(students));
  }

  deleteStudent(id) {
    let students = this.getAllStudents();
    students = students.filter(s => s.id !== parseInt(id));
    localStorage.setItem(this.storageKey, JSON.stringify(students));
  }

  searchStudents(query) {
    const students = this.getAllStudents();
    const lowerQuery = query.toLowerCase();
    return students.filter(s => 
      s.firstName.toLowerCase().includes(lowerQuery) ||
      s.lastName.toLowerCase().includes(lowerQuery) ||
      s.email.toLowerCase().includes(lowerQuery)
    );
  }

  getStatistics() {
    const students = this.getAllStudents();
    const activeCount = students.filter(s => s.status === 'Active').length;
    const inactiveCount = students.filter(s => s.status === 'Inactive').length;
    const gpaList = students.map(s => s.gpa).filter(g => g !== null && g !== undefined);
    const avgGPA = gpaList.length > 0 ? (gpaList.reduce((a, b) => a + b, 0) / gpaList.length) : 0;

    return {
      totalStudents: students.length,
      activeStudents: activeCount,
      inactiveStudents: inactiveCount,
      averageGPA: Math.round(avgGPA * 100) / 100
    };
  }
}

const db = new StudentDB();

// State
let students = [];
let editingStudentId = null;

// DOM Elements
const studentForm = document.getElementById('studentForm');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const resetBtn = document.getElementById('resetBtn');
const studentsTableBody = document.getElementById('studentsTableBody');
const formStatus = document.getElementById('formStatus');
const deleteModal = document.getElementById('deleteModal');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');

let studentToDelete = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  loadStudents();
  loadStatistics();
  setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
  studentForm.addEventListener('submit', handleFormSubmit);
  cancelBtn.addEventListener('click', resetForm);
  searchBtn.addEventListener('click', handleSearch);
  resetBtn.addEventListener('click', handleReset);
  confirmDeleteBtn.addEventListener('click', confirmDelete);
  cancelDeleteBtn.addEventListener('click', closeDeleteModal);
}

// Load all students
function loadStudents() {
  students = db.getAllStudents();
  renderStudentsTable(students);
}

// Load statistics
function loadStatistics() {
  const stats = db.getStatistics();
  document.getElementById('totalStudents').textContent = stats.totalStudents;
  document.getElementById('activeStudents').textContent = stats.activeStudents;
  document.getElementById('averageGPA').textContent = stats.averageGPA.toFixed(2);
}

// Handle form submission
function handleFormSubmit(e) {
  e.preventDefault();
  
  const formData = {
    firstName: document.getElementById('firstName').value.trim(),
    lastName: document.getElementById('lastName').value.trim(),
    email: document.getElementById('email').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    dateOfBirth: document.getElementById('dateOfBirth').value,
    gpa: parseFloat(document.getElementById('gpa').value) || null,
    status: document.getElementById('status').value
  };

  // Validation
  if (!formData.firstName || !formData.lastName || !formData.email) {
    showError('First Name, Last Name, and Email are required');
    return;
  }

  if (formData.email.indexOf('@') === -1) {
    showError('Please enter a valid email address');
    return;
  }

  // Check for duplicate email (excluding current student if editing)
  const existingStudent = db.getAllStudents().find(s => 
    s.email === formData.email && s.id !== editingStudentId
  );
  if (existingStudent) {
    showError('This email address is already in use');
    return;
  }

  try {
    if (editingStudentId) {
      db.updateStudent(editingStudentId, formData);
      showSuccess('Student updated successfully!');
    } else {
      db.addStudent(formData);
      showSuccess('Student added successfully!');
    }
    resetForm();
    loadStudents();
    loadStatistics();
  } catch (error) {
    console.error('Error:', error);
    showError('Operation failed: ' + error.message);
  }
}

// Reset form
function resetForm() {
  studentForm.reset();
  editingStudentId = null;
  submitBtn.textContent = 'Add Student';
  formStatus.textContent = '';
  formStatus.className = 'form-status';
}

// Render students table
function renderStudentsTable(data) {
  if (data.length === 0) {
    studentsTableBody.innerHTML = '<tr class="no-data"><td colspan="9">No students found. Add one to get started!</td></tr>';
    return;
  }

  studentsTableBody.innerHTML = data.map(student => `
    <tr>
      <td>${student.id}</td>
      <td>${student.firstName}</td>
      <td>${student.lastName}</td>
      <td>${student.email}</td>
      <td>${student.phone || '-'}</td>
      <td>${student.dateOfBirth || '-'}</td>
      <td>${student.gpa !== null ? student.gpa : '-'}</td>
      <td><span class="status-badge ${student.status.toLowerCase()}">${student.status}</span></td>
      <td>
        <div class="action-buttons">
          <button class="btn btn-edit" onclick="editStudent(${student.id})">Edit</button>
          <button class="btn btn-delete" onclick="deleteStudent(${student.id})">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// Edit student
function editStudent(id) {
  const student = db.getStudentById(id);
  
  if (!student) {
    showError('Student not found');
    return;
  }

  // Populate form with student data
  document.getElementById('firstName').value = student.firstName;
  document.getElementById('lastName').value = student.lastName;
  document.getElementById('email').value = student.email;
  document.getElementById('phone').value = student.phone || '';
  document.getElementById('dateOfBirth').value = student.dateOfBirth || '';
  document.getElementById('gpa').value = student.gpa !== null ? student.gpa : '';
  document.getElementById('status').value = student.status;
  
  editingStudentId = student.id;
  submitBtn.textContent = 'Update Student';
  
  // Scroll to form
  document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
}

// Delete student
function deleteStudent(id) {
  studentToDelete = id;
  deleteModal.classList.add('show');
}

// Confirm delete
function confirmDelete() {
  if (!studentToDelete) return;

  try {
    db.deleteStudent(studentToDelete);
    showSuccess('Student deleted successfully!');
    closeDeleteModal();
    loadStudents();
    loadStatistics();
  } catch (error) {
    console.error('Error deleting student:', error);
    showError('Failed to delete student');
  }
}

// Close delete modal
function closeDeleteModal() {
  deleteModal.classList.remove('show');
  studentToDelete = null;
}

// Handle search
function handleSearch() {
  const query = searchInput.value.trim();
  
  if (!query) {
    showError('Please enter a search term');
    return;
  }

  const results = db.searchStudents(query);
  renderStudentsTable(results);
  showSuccess(`Found ${results.length} student(s)`);
}

// Handle reset
function handleReset() {
  searchInput.value = '';
  formStatus.textContent = '';
  formStatus.className = 'form-status';
  loadStudents();
}

// Show success message
function showSuccess(message) {
  formStatus.textContent = message;
  formStatus.className = 'form-status success';
  setTimeout(() => {
    formStatus.textContent = '';
    formStatus.className = 'form-status';
  }, 3000);
}

// Show error message
function showError(message) {
  formStatus.textContent = message;
  formStatus.className = 'form-status error';
  setTimeout(() => {
    formStatus.textContent = '';
    formStatus.className = 'form-status';
  }, 3000);
}

// Close modal when clicking outside
deleteModal.addEventListener('click', (e) => {
  if (e.target === deleteModal) {
    closeDeleteModal();
  }
});
