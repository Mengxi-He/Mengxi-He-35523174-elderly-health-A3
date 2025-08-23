<template>
  <div class="container-fluid mt-4">
    <div class="row">
      <!-- Left sidebar -->
      <div class="col-md-3">
        <div class="list-group">
          <button class="list-group-item list-group-item-action"
                  :class="{ active: activeTab === 'rate' }"
                  @click="activeTab = 'rate'">
            🌟 Interested activities
          </button>
          <button class="list-group-item list-group-item-action"
                  :class="{ active: activeTab === 'register' }"
                  @click="activeTab = 'register'">
            📋 Activities available for registration
          </button>
        </div>
      </div>

      <!-- Content Area -->
      <div class="col-md-9">
        <h3 class="mb-4 text-center">
          {{ activeTab === 'rate' ? '🎯 Activities to Rate' : '📝 Activities to Register' }}
        </h3>

        <!-- Rating tab -->
        <div v-if="activeTab === 'rate'">
          <p v-if="activities.length === 0">Loading activities...</p>
          <div v-for="activity in activities" :key="activity.id" class="card mb-3">
            <div class="card-body">
              <h5>{{ activity.title }}</h5>
              <p>
                📅 {{ activity.date }} | 🕒 {{ activity.time }} <br>
                📍 {{ activity.location }}<br>
                {{ activity.description }}
              </p>
              <div v-if="!hasRated(activity)">
                <label>Your expectation (1–5):</label>
                <select v-model="ratings[activity.id]" class="form-select d-inline-block w-auto mx-2">
                  <option disabled value="">Select</option>
                  <option v-for="n in 5" :key="n" :value="n">{{ n }}</option>
                </select>
                <button class="btn btn-sm btn-primary" @click="submitRating(activity)">Submit</button>
              </div>
              <div v-else class="mt-2">
                <strong>⭐ Avg. Expectation:</strong> {{ calculateAverage(activity) }}
                <span class="ms-2 text-success">✓ You have rated</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Registration tab with DataTable -->
        <div v-else>
          <DataTable 
            :columns="columns" 
            :data="availableActivities" 
            :options="dtOptions"
            class="table table-hover table-striped"
            id="activitiesTable"
            @select="handleRowSelect"
            @deselect="handleRowSelect"
          >
            <thead>
            </thead>
          </DataTable>

          <button class="btn btn-success mt-3" @click="registerActivities" :disabled="selectedActivities.length === 0">
            Register Selected ({{ selectedActivities.length }})
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

// DataTable imports
import DataTable from 'datatables.net-vue3';
import DataTablesCore from 'datatables.net-bs5';
import DataTablesSelect from 'datatables.net-select-bs5';
import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css';
import 'datatables.net-select-bs5/css/select.bootstrap5.min.css';

DataTable.use(DataTablesCore);
DataTable.use(DataTablesSelect);

// Firebase imports
import { getAuth } from 'firebase/auth'
import { db } from '@/firebase/config'
import { collection, getDocs, doc, updateDoc, arrayUnion, serverTimestamp, addDoc } from 'firebase/firestore'

const router = useRouter()
const auth = getAuth()

// User authentication state
const userUID = ref(null)
const userEmail = ref(null)

const activities = ref([])
const ratings = ref({})
const selectedActivities = ref([])
const activeTab = ref('rate')

// DataTable column configuration
const columns = [
  { 
    data: null, 
    title: 'Select',
    orderable: false,
    defaultContent: '',
    className: 'select-checkbox'
  },
  { data: 'title', title: 'Activity' },
  { data: 'date', title: 'Date' },
  { data: 'time', title: 'Time' },
  { data: 'location', title: 'Location' },
  { 
    data: null,
    title: 'Status',
    orderable: false,
    render: (data, type, row) => {
      if (isAlreadyRegistered(row)) {
        return '<span class="badge bg-success">✅ Registered</span>';
      }
      return '<span class="badge bg-secondary">Available</span>';
    }
  }
];

// DataTable configuration options
const dtOptions = {
  responsive: true,
  pageLength: 10,
  select: { 
    style: 'multi', 
    selector: 'td:first-child' 
  },
  // Disable row selection for already registered activities and add keyboard support
  rowCallback: (row, data) => {
    if (isAlreadyRegistered(data)) {
      row.classList.add('dt-row-disabled');
      row.classList.remove('selected');
    } else {
      // Add keyboard support for checkbox cells
      const checkboxCell = row.cells[0]; // First cell contains the checkbox
      if (checkboxCell) {
        checkboxCell.setAttribute('tabindex', '0');
        checkboxCell.setAttribute('role', 'checkbox');
        checkboxCell.setAttribute('aria-checked', 'false');
        checkboxCell.setAttribute('aria-label', `Select ${data.title} for registration`);
        
        // Add keyboard event listener
        checkboxCell.addEventListener('keydown', (event) => {
          if (event.key === ' ' || event.key === 'Enter') {
            event.preventDefault();
            // Simulate click to trigger DataTable selection
            checkboxCell.click();
          }
        });
      }
    }
  },
  // Add selection state management
  initComplete: function() {
    const dt = this.api();
    
    // Update ARIA states when selection changes
    dt.on('select.dt deselect.dt', function(e, dt, type, indexes) {
      if (type === 'row') {
        indexes.forEach(index => {
          const row = dt.row(index).node();
          const checkboxCell = row.cells[0];
          if (checkboxCell) {
            const isSelected = row.classList.contains('selected');
            checkboxCell.setAttribute('aria-checked', isSelected ? 'true' : 'false');
          }
        });
      }
    });
  }
};

// Load data from Firebase on component mount
onMounted(async () => {
  const currentUser = auth.currentUser
  if (currentUser) {
    userUID.value = currentUser.uid
    userEmail.value = currentUser.email
  } else {
    console.log("No user logged in.");
    router.push('/login');
    return;
  }
  
  // Load activities from Firestore
  const querySnapshot = await getDocs(collection(db, 'activities'))
  activities.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
})

// Check if user has rated an activity
function hasRated(activity) {
  return activity.ratingsByUser && activity.ratingsByUser[userUID.value] !== undefined
}

// Submit rating to Firestore
async function submitRating(activity) {
  const score = parseInt(ratings.value[activity.id])
  if (!score || score < 1 || score > 5) return

  const activityRef = doc(db, 'activities', activity.id)
  
  try {
    // Update Firestore with rating
    await updateDoc(activityRef, {
      [`ratingsByUser.${userUID.value}`]: score,
      scores: arrayUnion(score)
    })
    
    // Update local state to avoid reload
    if (!activity.ratingsByUser) activity.ratingsByUser = {}
    if (!activity.scores) activity.scores = []
    activity.ratingsByUser[userUID.value] = score
    activity.scores.push(score)

  } catch (error) {
    console.error("Error submitting rating:", error)
    alert("Failed to submit rating. Please try again.")
  }
}

// Calculate average rating for an activity
function calculateAverage(activity) {
  if (!activity.scores?.length) return 'N/A'
  const total = activity.scores.reduce((a, b) => a + b, 0)
  return (total / activity.scores.length).toFixed(1)
}

// Handle DataTable row selection
function handleRowSelect(e, dt, type, indexes) {
  const selectedRowsData = dt.rows({ selected: true }).data().toArray();
  // Filter out already registered activities
  const validSelections = selectedRowsData.filter(row => !isAlreadyRegistered(row));
  selectedActivities.value = validSelections.map(row => row.id);
  console.log('Selected activities:', selectedActivities.value);
}

// Check if user is already registered for an activity
function isAlreadyRegistered(activity) {
  return activity.registeredUsers?.includes(userUID.value);
}

// Show all activities (registered and unregistered)
const availableActivities = computed(() => activities.value)

// Check for time conflicts between activities
function checkTimeConflict(activity) {
  const userEvents = activities.value.filter(a => a.registeredUsers?.includes(userUID.value))
  return userEvents.some(
    e => e.date === activity.date && e.time === activity.time && e.id !== activity.id
  )
}

// Register for selected activities and send confirmation emails
async function registerActivities() {
  if (!userUID.value || selectedActivities.value.length === 0) return

  const promises = []
  const successfullyRegisteredActivities = []

  // Create update promises for each selected activity
  selectedActivities.value.forEach(activityId => {
    const activityRef = doc(db, 'activities', activityId)
    promises.push(
      updateDoc(activityRef, {
        registeredUsers: arrayUnion(userUID.value)
      }).then(() => {
        // Track successfully registered activities for email notification
        const activityData = activities.value.find(a => a.id === activityId)
        if (activityData) {
          successfullyRegisteredActivities.push(activityData)
        }
      })
    )
  })

  try {
    // Wait for all database updates to complete
    await Promise.all(promises)

    // Send confirmation emails via mail queue
    if (successfullyRegisteredActivities.length > 0) {
      const mailPromises = successfullyRegisteredActivities.map(activity => {
        return addDoc(collection(db, 'mailQueue'), {
          to: userEmail.value,
          message: {
            subject: `Confirmation for joining: ${activity.title}`,
            text: `Hi! You have successfully registered for the activity "${activity.title}" on ${activity.date} at ${activity.location}. We look forward to seeing you!`,
            html: `<h3>Confirmation for joining: ${activity.title}</h3><p>Hi! You have successfully registered for the activity "${activity.title}" on ${activity.date} at ${activity.location}. We look forward to seeing you!</p>`,
            activityInfo: activity
          },
          createdAt: serverTimestamp()
        })
      })
      await Promise.all(mailPromises);
    }
    
    // Update frontend UI
    activities.value.forEach(activity => {
      if (selectedActivities.value.includes(activity.id)) {
        if (!activity.registeredUsers) activity.registeredUsers = []
        activity.registeredUsers.push(userUID.value)
      }
    })
    
    selectedActivities.value = []
    alert('Successfully registered! A confirmation email will be sent to you shortly.')
    
    // Refresh DataTable to update row states
    await new Promise(resolve => setTimeout(resolve, 100));

  } catch (error) {
    console.error("Error registering for activities:", error)
    alert("An error occurred during registration. Please try again.")
  }
}
</script>
<style scoped>
.card {
  border-radius: 10px;
}
.list-group-item {
  cursor: pointer;
}
.list-group-item.active {
  background-color: #0d6efd;
  color: white;
  border-color: #0d6efd;
}

/* DataTable select checkbox styling */
:deep(.select-checkbox) {
  text-align: center;
  width: 40px;
}

:deep(.select-checkbox:before) {
  content: '';
  margin-top: 0;
  margin-left: 0;
}

/* Keyboard focus styling for checkbox cells */
:deep(.select-checkbox:focus) {
  outline: 2px solid #007bff;
  outline-offset: 2px;
  border-radius: 4px;
  background-color: rgba(0, 123, 255, 0.1);
}

/* Improve table row focus states */
:deep(.table tbody tr:focus-within) {
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

/* Styling for already registered rows */
:deep(.dt-row-disabled) {
  background-color: #f8f9fa !important;
  opacity: 0.7;
  color: #6c757d !important;
}

:deep(.dt-row-disabled td) {
  color: #6c757d !important;
}

/* Click the checkbox to disable the selected bank. */
:deep(.dt-row-disabled .select-checkbox) {
  pointer-events: none;
  cursor: not-allowed;
}
</style>
