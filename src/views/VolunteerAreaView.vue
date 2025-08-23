<template>
 <div class="container-fluid mt-4">
  <div class="row">
   <!-- Left Sidebar -->
   <div class="col-md-3 mb-3">
    <div class="list-group">
     <button class="list-group-item list-group-item-action" :class="{ active: currentTab === 'notice' }" @click="currentTab = 'notice'">
      📢 Volunteer Guidelines
     </button>
     <button class="list-group-item list-group-item-action" :class="{ active: currentTab === 'register' }" @click="currentTab = 'register'">
      📋 Register for Volunteer Activities
     </button>
    </div>
   </div>

   <!-- Right Content Area -->
   <div class="col-md-9">
    <div v-if="currentTab === 'notice'">
     <h4>📢 Volunteer Guidelines</h4>
     <ul>
      <li>📧 If you can't attend an event, please email us in advance.</li>
      <li>📄 Contact the admin for official volunteer hour certificates.</li>
      <li>⏰ Volunteer hours are automatically tracked in your account.</li>
     </ul>
    </div>

    <!-- Volunteer Activity Registration Tab with DataTable -->
    <div v-if="currentTab === 'register'">
     <h4>📋 Volunteer Activity Registration</h4>
     <p class="text-muted">Select the volunteer activities you're interested in.</p>
     
     <DataTable
        v-if="!isLoading"
        :columns="columns"
        :data="activities"
        :options="dtOptions"
        class="table table-hover table-striped"
        style="width:100%"
        @select="handleRowSelect"
        @deselect="handleRowSelect"
      >
        <thead>
          <tr>
            <th>Select</th>
            <th>Activity</th>
            <th>Details</th>
            <th>Availability</th>
            <th>Status</th>
          </tr>
        </thead>
      </DataTable>
      <p v-else>Loading activities...</p>

      <button class="btn btn-primary mt-3" @click="submitRegistrations" :disabled="selectedActivities.length === 0">
        Submit Registration ({{ selectedActivities.length }})
     </button>
    </div>
   </div>
  </div>
 </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';

// DataTable imports for volunteer activity management
import DataTable from 'datatables.net-vue3';
import DataTablesCore from 'datatables.net-bs5';
import DataTablesSelect from 'datatables.net-select-bs5';
import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css';
import 'datatables.net-select-bs5/css/select.bootstrap5.min.css';
DataTable.use(DataTablesCore);
DataTable.use(DataTablesSelect);

// Firebase imports for authentication and database operations
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '@/firebase/config';
import { collection, getDocs, doc, updateDoc, arrayUnion } from 'firebase/firestore';

const router = useRouter();
const auth = getAuth();

// Component state
const currentTab = ref('notice');
const activities = ref([]);
const selectedActivities = ref([]);
const successMessage = ref('');
const userUID = ref(null);
const isLoading = ref(true);

// DataTable configuration with volunteer-specific logic
const columns = [
  { data: null, defaultContent: '', orderable: false, className: 'select-checkbox' },
  { data: 'title', title: 'Activity' },
  { 
    data: null,
    title: 'Details',
    render: (data, type, row) => `${row.date} ${row.time} @ ${row.location}`
  },
  { 
    data: null,
    title: 'Availability',
    render: (data, type, row) => `Needed: ${row.capacity} | Registered: ${row.registeredVolunteers ? row.registeredVolunteers.length : 0}`
  },
  { 
    data: null,
    title: 'Status',
    // Render status based on volunteer-specific business logic
    render: (data, type, row) => {
      if (hasJoined(row)) return '<span class="text-success">✅ Already registered</span>';
      if (isFull(row)) return '<span class="text-danger">⛔ Full</span>';
      if (isConflict(row)) return '<span class="text-danger">⛔ Time conflict</span>';
      return '<span class="text-info">Available</span>';
    }
  },
];

const dtOptions = {
  responsive: true,
  pageLength: 10,
  searching: true,
  ordering: true,
  select: { style: 'multi', selector: 'td:first-child' },
  // Apply row styling based on availability status and add keyboard support
  rowCallback: (row, data) => {
    if (isFull(data) || hasJoined(data) || isConflict(data)) {
      row.classList.add('dt-row-disabled');
    } else {
      row.classList.remove('dt-row-disabled');
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

// Load volunteer activities data on authentication state change
onMounted(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      userUID.value = user.uid;
      const querySnapshot = await getDocs(collection(db, 'volunteer_activities'));
      activities.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      isLoading.value = false;
    } else {
      router.push('/login');
    }
    unsubscribe();
  });
});

// Business logic functions for volunteer activity management
function isFull(activity) {
  return activity.registeredVolunteers && activity.registeredVolunteers.length >= activity.capacity;
}

function hasJoined(activity) {
  return activity.registeredVolunteers && activity.registeredVolunteers.includes(userUID.value);
}

function isConflict(newAct) {
  if (!userUID.value) return false;
  
  // Check conflicts with already registered activities
  const currentUserActivities = activities.value.filter(a => 
    a.registeredVolunteers && a.registeredVolunteers.includes(userUID.value)
  );
  
  // Check conflicts with currently selected activities
  const currentlySelectedActivities = activities.value.filter(a => 
    selectedActivities.value.includes(a.id) && a.id !== newAct.id
  );
  
  // Combine both lists for conflict checking
  const allUserActivities = [...currentUserActivities, ...currentlySelectedActivities];
  
  return allUserActivities.some(a => a.date === newAct.date && a.time === newAct.time);
}

// Handle DataTable row selection events
function handleRowSelect(e, dt, type, indexes) {
  const selectedRowsData = dt.rows({ selected: true }).data().toArray();
  
  // Validate new selections for time conflicts
  const validSelections = [];
  for (const row of selectedRowsData) {
    // Temporarily set selection list to check conflicts
    const tempSelected = validSelections.map(r => r.id);
    selectedActivities.value = tempSelected;
    
    if (isConflict(row)) {
      // Deselect conflicting row
      const rowIndex = dt.row((idx, data) => data.id === row.id).index();
      dt.row(rowIndex).deselect();
      alert(`Cannot select "${row.title}" due to time conflict with other selected activities.`);
    } else {
      validSelections.push(row);
    }
  }
  
  selectedActivities.value = validSelections.map(row => row.id);
  console.log('Selected activities:', selectedActivities.value);
}

// Submit volunteer activity registrations
async function submitRegistrations() {
  if (!userUID.value || selectedActivities.value.length === 0) return;

  const promises = [];
  
  // Final validation before submission
  for (const id of selectedActivities.value) {
    const act = activities.value.find(a => a.id === id);
    if (isConflict(act) || isFull(act) || hasJoined(act)) {
       alert(`Cannot register for "${act.title}" due to a conflict or it being full.`);
       return;
    }
    const activityRef = doc(db, 'volunteer_activities', id);
    promises.push(
      updateDoc(activityRef, {
        registeredVolunteers: arrayUnion(userUID.value)
      })
    );
  }

  try {
    await Promise.all(promises);

    successMessage.value = 'Successfully registered!';
    
    // Refresh data to update UI
    isLoading.value = true;
    const querySnapshot = await getDocs(collection(db, 'volunteer_activities'));
    activities.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    isLoading.value = false;
    selectedActivities.value = [];

  } catch (error) {
    console.error("Error submitting registrations:", error);
    successMessage.value = 'An error occurred during registration.';
  }

  setTimeout(() => (successMessage.value = ''), 4000);
}
</script>

<style scoped>
.list-group-item {
  border-radius: 8px;
  margin-bottom: 8px;
}

/* DataTable disabled row styling */
:deep(.dt-row-disabled) {
  background-color: #f8f9fa !important;
  opacity: 0.6;
  pointer-events: none;
}

:deep(.dt-row-disabled td) {
  color: #6c757d !important;
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
</style>