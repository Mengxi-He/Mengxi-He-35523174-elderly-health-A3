<template>
  <!-- Skip link for accessibility -->
  <a href="#main-content" class="skip-link">Skip to main content</a>

  <div class="container-fluid mt-4">
    <div class="row">
      <!-- Left Sidebar Menu -->
      <nav class="col-md-3 mb-3" role="navigation" aria-label="Admin panel navigation">
        <div class="list-group" role="tablist">
          <button
            class="list-group-item list-group-item-action"
            :class="{ active: currentTab === 'dashboard' }"
            @click="currentTab = 'dashboard'"
            @keydown="handleKeyDown"
            role="tab"
            :aria-selected="currentTab === 'dashboard'"
            aria-controls="dashboard-panel"
            tabindex="0"
            data-tab="dashboard"
          >
            <span aria-hidden="true">📊</span> Dashboard
          </button>
          <button
            class="list-group-item list-group-item-action"
            :class="{ active: currentTab === 'users' }"
            @click="currentTab = 'users'"
            @keydown="handleKeyDown"
            role="tab"
            :aria-selected="currentTab === 'users'"
            aria-controls="users-panel"
            tabindex="0"
            data-tab="users"
          >
            <span aria-hidden="true">👥</span> User Management
          </button>
        </div>
      </nav>

      <!-- Right Content Panel -->
      <main id="main-content" class="col-md-9">
        <!-- Dashboard View -->
        <div 
          v-if="currentTab === 'dashboard'" 
          id="dashboard-panel"
          role="tabpanel"
          aria-labelledby="dashboard-tab"
        >
          <header class="mb-4">
            <h1>📊 Dashboard</h1>
            <p class="text-muted">An overview of the health charity platform.</p>
          </header>
          
          <!-- Admin Dashboard: KPI Cards -->
          <section class="row mb-4" aria-labelledby="stats-heading">
            <h2 id="stats-heading" class="visually-hidden">Platform Statistics</h2>
            <div class="col-md-4">
              <div class="card text-center">
                <div class="card-body">
                  <h3 class="card-title">Total Users</h3>
                  <p class="card-text fs-2 fw-bold" aria-label="Total users count">{{ totalUsers }}</p>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="card text-center">
                <div class="card-body">
                  <h3 class="card-title">Elder Users</h3>
                  <p class="card-text fs-2 fw-bold" aria-label="Elder users count">{{ elderUsersCount }}</p>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="card text-center">
                <div class="card-body">
                  <h3 class="card-title">Volunteers</h3>
                  <p class="card-text fs-2 fw-bold" aria-label="Volunteer users count">{{ volunteerUsersCount }}</p>
                </div>
              </div>
            </div>
          </section>

          <!-- Interactive Charts: User Role Distribution -->
          <section aria-labelledby="chart-heading">
            <h2 id="chart-heading">User Role Distribution</h2>
            <div style="max-width: 400px; margin: auto;">
              <div v-if="isLoading" class="text-center">
                <div class="spinner-border" role="status" aria-label="Loading chart data">
                  <span class="visually-hidden">Loading chart data...</span>
                </div>
              </div>
              <div v-else-if="chartData.datasets[0].data.length > 0">
                <Pie 
                  :data="chartData" 
                  :options="chartOptions"
                  aria-label="Pie chart showing user role distribution"
                />
              </div>
              <p v-else class="text-muted">No data available for chart</p>
            </div>
          </section>
        </div>

        <!-- User Management View -->
        <div 
          v-if="currentTab === 'users'" 
          id="users-panel"
          role="tabpanel"
          aria-labelledby="users-tab"
        >
          <header class="mb-4">
            <h1>👥 User Management</h1>
          </header>
          
          <!-- Action Buttons: Export & Bulk Email -->
          <section class="mb-3" aria-labelledby="actions-heading">
            <h2 id="actions-heading" class="visually-hidden">User Management Actions</h2>
            <button 
              class="btn btn-success me-2" 
              @click="exportUsersToCSV"
              :disabled="isLoading || users.length === 0"
            >
              <span aria-hidden="true">📥</span> Export to CSV
            </button>
            <button 
              class="btn btn-info" 
              @click="showBulkEmailModal = true" 
              :disabled="selectedUserIds.length === 0"
              :aria-label="`Send email to ${selectedUserIds.length} selected users`"
            >
              <span aria-hidden="true">📧</span> Send Email to Selected ({{ selectedUserIds.length }})
            </button>
            
            <!-- Select All / Deselect All Button -->
            <button 
              type="button"
              class="btn btn-outline-secondary ms-2"
              @click="toggleSelectAll"
              :aria-label="selectedUserIds.length === users.length ? 'Deselect all users' : 'Select all users'"
            >
              <span aria-hidden="true">{{ selectedUserIds.length === users.length ? '❌' : '✅' }}</span>
              {{ selectedUserIds.length === users.length ? 'Deselect All' : 'Select All' }}
            </button>
          </section>

          <!-- Users DataTable -->
          <section aria-labelledby="users-table-heading">
            <h2 id="users-table-heading" class="visually-hidden">Users Table</h2>
            <div v-if="isLoading" class="text-center">
              <div class="spinner-border" role="status" aria-label="Loading users">
                <span class="visually-hidden">Loading users...</span>
              </div>
            </div>
            <div v-else-if="users.length === 0" class="text-muted">
              No users found.
            </div>
            <DataTable
              v-else
              :columns="userColumns"
              :data="users"
              :options="userDtOptions"
              class="table table-hover table-striped"
              style="width:100%"
              @select="handleUserSelect"
              @deselect="handleUserSelect"
              role="table"
              aria-label="Users management table"
            >
            </DataTable>
          </section>
        </div>

        <!-- Success/Error Messages -->
        <div 
          v-if="message" 
          class="alert mt-3"
          :class="messageType === 'success' ? 'alert-success' : 'alert-danger'"
          role="alert"
          aria-live="polite"
        >
          {{ message }}
        </div>
      </main>
    </div>

    <!-- Bulk Email Modal -->
    <div 
      v-if="showBulkEmailModal" 
      class="modal fade show d-block" 
      tabindex="-1"
      role="dialog"
      aria-labelledby="bulk-email-title"
      aria-modal="true"
    >
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h2 id="bulk-email-title" class="modal-title">Send Bulk Email</h2>
            <button 
              type="button" 
              class="btn-close" 
              @click="closeBulkEmailModal"
              aria-label="Close modal"
            ></button>
          </div>
          <div class="modal-body">
            <p>Sending email to <strong>{{ selectedUserIds.length }}</strong> selected users.</p>
            <form @submit.prevent="sendBulkEmail">
              <div class="mb-3">
                <label for="emailSubject" class="form-label">Subject *</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="emailSubject" 
                  v-model="emailSubject"
                  required
                  :class="{ 'is-invalid': emailSubjectError }"
                >
                <div v-if="emailSubjectError" class="invalid-feedback">
                  {{ emailSubjectError }}
                </div>
              </div>
              <div class="mb-3">
                <label for="emailBody" class="form-label">Body *</label>
                <textarea 
                  class="form-control" 
                  id="emailBody" 
                  rows="5" 
                  v-model="emailBody"
                  required
                  :class="{ 'is-invalid': emailBodyError }"
                ></textarea>
                <div v-if="emailBodyError" class="invalid-feedback">
                  {{ emailBodyError }}
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button 
              type="button" 
              class="btn btn-secondary" 
              @click="closeBulkEmailModal"
            >
              Cancel
            </button>
            <button 
              type="button" 
              class="btn btn-primary" 
              @click="sendBulkEmail"
              :disabled="isSendingEmail"
            >
              <span v-if="isSendingEmail" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              {{ isSendingEmail ? 'Sending...' : 'Send Emails' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showBulkEmailModal" class="modal-backdrop fade show"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';

// --- Dependency Imports ---
import DataTable from 'datatables.net-vue3';
import DataTablesCore from 'datatables.net-bs5';
import 'datatables.net-select-bs5';
import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css';
import 'datatables.net-select-bs5/css/select.bootstrap5.min.css';
import { Pie } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale } from 'chart.js';
import Papa from 'papaparse'; // For CSV Export

// --- Firebase Imports ---
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '@/firebase/config';
import { collection, getDocs, doc, getDoc, addDoc, serverTimestamp } from 'firebase/firestore';

// --- Initializations ---
DataTable.use(DataTablesCore);
ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

// --- Component State ---
const router = useRouter();
const auth = getAuth();
const currentTab = ref('dashboard');
const users = ref([]);
const isLoading = ref(true);
const message = ref('');
const messageType = ref('success');

// --- User Management State ---
const selectedUserIds = ref([]);
const showBulkEmailModal = ref(false);
const emailSubject = ref('');
const emailBody = ref('');
const emailSubjectError = ref('');
const emailBodyError = ref('');
const isSendingEmail = ref(false);

// --- Authentication Check ---
onMounted(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    // Verify admin role
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists() || userDoc.data().role !== 'admin') {
        showMessage('Access denied. Admin privileges required.', 'error');
        router.push('/');
        return;
      }
      
      // Load data if user is admin
      await loadUsers();
    } catch (error) {
      console.error('Error verifying admin role:', error);
      showMessage('Error verifying permissions', 'error');
      router.push('/');
    } finally {
      unsubscribe();
    }
  });
});

// --- Data Fetching ---
async function loadUsers() {
  isLoading.value = true;
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    users.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error loading users:', error);
    showMessage('Error loading users data', 'error');
  } finally {
    isLoading.value = false;
  }
}

// --- Dashboard Logic (Admin Dashboard) ---
const totalUsers = computed(() => users.value.length);
const elderUsersCount = computed(() => users.value.filter(u => u.role === 'elder').length);
const volunteerUsersCount = computed(() => users.value.filter(u => u.role === 'volunteer').length);
const adminUsersCount = computed(() => users.value.filter(u => u.role === 'admin').length);

// --- Chart Logic (Interactive Charts) ---
const chartData = computed(() => ({
  labels: ['Elders', 'Volunteers', 'Admins'],
  datasets: [
    {
      backgroundColor: ['#41B883', '#00D8FF', '#FF6B6B'],
      data: [elderUsersCount.value, volunteerUsersCount.value, adminUsersCount.value]
    }
  ]
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom'
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          const label = context.label || '';
          const value = context.parsed || 0;
          const total = context.dataset.data.reduce((a, b) => a + b, 0);
          const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
          return `${label}: ${value} (${percentage}%)`;
        }
      }
    }
  },
  accessibility: {
    announceOnFocus: {
      enabled: true
    }
  }
};

// --- User Management Logic ---

// DataTable Config
const userColumns = [
  { 
    data: null, 
    defaultContent: '', 
    orderable: false, 
    className: 'select-checkbox', 
    title: 'Select',
    render: function(data, type, row, meta) {
      if (type === 'display') {
        return `<input type="checkbox" 
                       class="form-check-input user-select-checkbox" 
                       data-user-id="${row.id}"
                       aria-label="Select user ${row.username || row.email}"
                       tabindex="0">`;
      }
      return '';
    }
  },
  { data: 'username', title: 'Username' },
  { data: 'email', title: 'Email' },
  { data: 'role', title: 'Role' },
  { 
    data: null, 
    title: 'Created', 
    render: function(data, type, row) {
      if (row.createdAt) {
        const date = row.createdAt.toDate ? row.createdAt.toDate() : new Date(row.createdAt);
        return date.toLocaleDateString();
      }
      return 'N/A';
    }
  }
];

const userDtOptions = {
  responsive: true,
  pageLength: 10,
  searching: true,
  ordering: true,
  // Remove DataTables default select functionality
  select: false,
  language: {
    search: 'Search users:',
    lengthMenu: 'Show _MENU_ users per page',
    info: 'Showing _START_ to _END_ of _TOTAL_ users',
    paginate: {
      first: 'First',
      last: 'Last',
      next: 'Next',
      previous: 'Previous'
    }
  },
  // Add custom checkbox event handling after table is drawn
  drawCallback: function() {
    // Add event listeners to checkboxes after each redraw
    setupCheckboxEventListeners();
  }
};

// Custom checkbox event handling
function setupCheckboxEventListeners() {
  // Remove existing event listeners to prevent duplicates
  document.querySelectorAll('.user-select-checkbox').forEach(checkbox => {
    const newCheckbox = checkbox.cloneNode(true);
    checkbox.parentNode.replaceChild(newCheckbox, checkbox);
  });
  
  // Add event listeners to all checkboxes
  document.querySelectorAll('.user-select-checkbox').forEach(checkbox => {
    // Click/change event
    checkbox.addEventListener('change', handleCheckboxChange);
    
    // Keyboard event for space key
    checkbox.addEventListener('keydown', (event) => {
      if (event.key === ' ') {
        event.preventDefault();
        checkbox.checked = !checkbox.checked;
        handleCheckboxChange({ target: checkbox });
      }
    });
  });
}

// Handle checkbox selection changes
function handleCheckboxChange(event) {
  const checkbox = event.target;
  const userId = checkbox.getAttribute('data-user-id');
  
  if (checkbox.checked) {
    // Add to selection if not already present
    if (!selectedUserIds.value.includes(userId)) {
      selectedUserIds.value.push(userId);
    }
  } else {
    // Remove from selection
    const index = selectedUserIds.value.indexOf(userId);
    if (index > -1) {
      selectedUserIds.value.splice(index, 1);
    }
  }
  
  // Update checkbox states to reflect current selection
  updateCheckboxStates();
}

// Update checkbox states to reflect current selection
function updateCheckboxStates() {
  document.querySelectorAll('.user-select-checkbox').forEach(checkbox => {
    const userId = checkbox.getAttribute('data-user-id');
    checkbox.checked = selectedUserIds.value.includes(userId);
  });
}

// Toggle select all/deselect all functionality
function toggleSelectAll() {
  if (selectedUserIds.value.length === users.value.length) {
    // Deselect all
    selectedUserIds.value = [];
  } else {
    // Select all
    selectedUserIds.value = users.value.map(user => user.id);
  }
  updateCheckboxStates();
}

// Export Logic (Export)
function exportUsersToCSV() {
  if (users.value.length === 0) {
    showMessage("No user data to export.", 'error');
    return;
  }
  
  try {
    // Prepare data for export (exclude sensitive information)
    const exportData = users.value.map(user => ({
      username: user.username || 'N/A',
      email: user.email,
      role: user.role,
      createdAt: user.createdAt ? (user.createdAt.toDate ? user.createdAt.toDate().toLocaleDateString() : new Date(user.createdAt).toLocaleDateString()) : 'N/A'
    }));
    
    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `users_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      showMessage(`Successfully exported ${exportData.length} users to CSV`, 'success');
    }
  } catch (error) {
    console.error('Error exporting users:', error);
    showMessage('Error exporting users data', 'error');
  }
}

// Form validation
function validateEmailForm() {
  emailSubjectError.value = '';
  emailBodyError.value = '';
  
  if (!emailSubject.value.trim()) {
    emailSubjectError.value = 'Subject is required';
    return false;
  }
  
  if (!emailBody.value.trim()) {
    emailBodyError.value = 'Email body is required';
    return false;
  }
  
  if (emailSubject.value.trim().length < 3) {
    emailSubjectError.value = 'Subject must be at least 3 characters long';
    return false;
  }
  
  if (emailBody.value.trim().length < 10) {
    emailBodyError.value = 'Email body must be at least 10 characters long';
    return false;
  }
  
  return true;
}

// Bulk Email Logic
async function sendBulkEmail() {
  if (!validateEmailForm()) {
    return;
  }
  
  if (selectedUserIds.value.length === 0) {
    showMessage("No users selected for email.", 'error');
    return;
  }
  
  isSendingEmail.value = true;
  
  try {
    const selectedUsers = users.value.filter(u => selectedUserIds.value.includes(u.id));
    const mailPromises = selectedUsers.map(user => {
      return addDoc(collection(db, 'mailQueue'), {
        to: user.email,
        message: {
          subject: emailSubject.value.trim(),
          text: emailBody.value.trim(),
          html: `<p>${emailBody.value.trim().replace(/\n/g, '<br>')}</p>`,
        },
        createdAt: serverTimestamp(),
        sentBy: auth.currentUser.uid
      });
    });

    await Promise.all(mailPromises);
    showMessage(`Email requests sent for ${selectedUsers.length} users!`, 'success');
    closeBulkEmailModal();
  } catch (error) {
    console.error("Error sending bulk email requests:", error);
    showMessage("An error occurred while sending emails. Please try again.", 'error');
  } finally {
    isSendingEmail.value = false;
  }
}

// Modal management
function closeBulkEmailModal() {
  showBulkEmailModal.value = false;
  emailSubject.value = '';
  emailBody.value = '';
  emailSubjectError.value = '';
  emailBodyError.value = '';
  isSendingEmail.value = false;
}

// Keyboard navigation for tabs
function handleKeyDown(event) {
  const tabs = ['dashboard', 'users'];
  const currentIndex = tabs.indexOf(currentTab.value);
  
  switch (event.key) {
    case 'ArrowRight':
    case 'ArrowDown':
      event.preventDefault();
      const nextIndex = (currentIndex + 1) % tabs.length;
      currentTab.value = tabs[nextIndex];
      // Focus the next tab button
      document.querySelector(`[data-tab="${tabs[nextIndex]}"]`)?.focus();
      break;
      
    case 'ArrowLeft':
    case 'ArrowUp':
      event.preventDefault();
      const prevIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
      currentTab.value = tabs[prevIndex];
      // Focus the previous tab button
      document.querySelector(`[data-tab="${tabs[prevIndex]}"]`)?.focus();
      break;
      
    case 'Home':
      event.preventDefault();
      currentTab.value = tabs[0];
      document.querySelector(`[data-tab="${tabs[0]}"]`)?.focus();
      break;
      
    case 'End':
      event.preventDefault();
      currentTab.value = tabs[tabs.length - 1];
      document.querySelector(`[data-tab="${tabs[tabs.length - 1]}"]`)?.focus();
      break;
      
    case 'Enter':
    case ' ':
      event.preventDefault();
      // Tab switching is handled by click event
      event.target.click();
      break;
  }
}

// Message display helper
function showMessage(text, type = 'success') {
  message.value = text;
  messageType.value = type;
  
  // Auto-hide message after 5 seconds
  setTimeout(() => {
    message.value = '';
  }, 5000);
}
</script>

<style scoped>
/* Accessibility improvements */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: #000;
  color: #fff;
  padding: 8px;
  text-decoration: none;
  border-radius: 4px;
  z-index: 1000;
}

.skip-link:focus {
  top: 6px;
}

.visually-hidden {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

/* Focus styles for better keyboard navigation */
.list-group-item:focus {
  outline: 3px solid #0066cc;
  outline-offset: 2px;
  box-shadow: 0 0 0 0.2rem rgba(0, 102, 204, 0.25);
  z-index: 1;
}

.list-group-item:focus:not(.active) {
  background-color: rgba(0, 102, 204, 0.1);
  border-color: #0066cc;
}

.btn:focus {
  outline: 3px solid #0066cc;
  outline-offset: 2px;
}

.form-control:focus,
.form-select:focus {
  border-color: #0066cc;
  box-shadow: 0 0 0 0.2rem rgba(0, 102, 204, 0.25);
}

/* Card styling */
.card {
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: box-shadow 0.15s ease-in-out;
  border: 1px solid #dee2e6;
}

.card:hover {
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.card-title {
  color: #495057;
  font-weight: 600;
}

/* Statistics cards specific styling */
.card .fs-2 {
  color: #0d6efd;
  font-weight: bold;
}

/* Active tab styling */
.list-group-item.active {
  background-color: #0d6efd;
  border-color: #0d6efd;
  color: white;
}

.list-group-item.active:hover {
  background-color: #0b5ed7;
  border-color: #0a58ca;
}

.list-group-item.active:focus {
  background-color: #0d6efd;
  border-color: #0d6efd;
  color: white;
}

/* Tab navigation improvements */
.list-group-item {
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  border: 1px solid #dee2e6;
  position: relative;
}

.list-group-item:hover:not(.active) {
  background-color: #f8f9fa;
  border-color: #0d6efd;
}

.list-group-item[role="tab"] {
  border-radius: 0.375rem;
  margin-bottom: 0.25rem;
}

/* Modal styling */
.modal.d-block {
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  border: none;
  border-radius: 0.5rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.modal-header {
  border-bottom: 1px solid #dee2e6;
  padding: 1rem 1.5rem;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  border-top: 1px solid #dee2e6;
  padding: 1rem 1.5rem;
}

/* Form validation styling */
.is-invalid {
  border-color: #dc3545;
}

.invalid-feedback {
  display: block;
  width: 100%;
  margin-top: 0.25rem;
  font-size: 0.875em;
  color: #dc3545;
}

/* Custom accessible checkbox styling */
.user-select-checkbox {
  width: 1.2rem !important;
  height: 1.2rem !important;
  cursor: pointer;
  border: 2px solid #6c757d;
  border-radius: 4px;
  background-color: #fff;
  transition: all 0.2s ease-in-out;
}

.user-select-checkbox:hover {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

.user-select-checkbox:focus {
  outline: none;
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.user-select-checkbox:checked {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.user-select-checkbox:checked:focus {
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.5);
}

/* Remove old DataTables checkbox styling */
:deep(.select-checkbox:before) {
  display: none;
}

:deep(.select-checkbox) {
  text-align: center;
  cursor: pointer;
}

/* DataTable styling improvements */
:deep(.dataTables_wrapper) {
  font-family: inherit;
}

:deep(.dataTables_filter) {
  margin-bottom: 1rem;
}

:deep(.dataTables_length) {
  margin-bottom: 1rem;
}

:deep(.dataTables_info) {
  margin-top: 1rem;
}

:deep(.dataTables_paginate) {
  margin-top: 1rem;
}

/* Table styling */
.table {
  border-collapse: separate;
  border-spacing: 0;
}

.table th {
  background-color: #f8f9fa;
  font-weight: 600;
  border-top: none;
  border-bottom: 2px solid #dee2e6;
}

.table-striped > tbody > tr:nth-of-type(odd) > td {
  background-color: rgba(0, 0, 0, 0.025);
}

.table-hover tbody tr:hover {
  background-color: rgba(0, 0, 0, 0.075);
}

/* Button styling */
.btn {
  border-radius: 0.375rem;
  font-weight: 500;
  transition: all 0.15s ease-in-out;
}

.btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.btn-success {
  background-color: #198754;
  border-color: #198754;
}

.btn-success:hover:not(:disabled) {
  background-color: #157347;
  border-color: #146c43;
}

.btn-info {
  background-color: #0dcaf0;
  border-color: #0dcaf0;
  color: #000;
}

.btn-info:hover:not(:disabled) {
  background-color: #31d2f2;
  border-color: #25cff2;
}

/* Alert styling */
.alert {
  border-radius: 0.375rem;
  border: 1px solid transparent;
}

.alert-success {
  background-color: #d1edff;
  border-color: #b6d7ff;
  color: #004085;
}

.alert-danger {
  background-color: #f8d7da;
  border-color: #f5c6cb;
  color: #721c24;
}

/* Loading spinner */
.spinner-border {
  width: 2rem;
  height: 2rem;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .list-group-item {
    border: 2px solid;
  }
  
  .btn {
    border: 2px solid;
  }
  
  .card {
    border: 2px solid;
  }
  
  .table th,
  .table td {
    border: 1px solid;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .spinner-border {
    animation: none;
  }
  
  .card {
    transition: none;
  }
  
  .btn {
    transition: none;
  }
}

/* Improve touch targets for mobile accessibility */
@media (max-width: 767px) {
  .list-group-item {
    min-height: 44px;
    display: flex;
    align-items: center;
  }
  
  .btn {
    min-height: 44px;
  }
  
  .form-control,
  .form-select {
    min-height: 44px;
  }
  
  .modal-dialog {
    margin: 0.5rem;
  }
}

/* Chart container */
.chart-container {
  position: relative;
  height: 300px;
  margin: 2rem 0;
}

/* Responsive design */
@media (max-width: 992px) {
  .container-fluid {
    padding: 0 1rem;
  }
}

@media (max-width: 768px) {
  .col-md-3,
  .col-md-9 {
    padding: 0;
  }
  
  .list-group {
    margin-bottom: 1rem;
  }
}
</style>