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

    <div v-if="currentTab === 'register'">
     <h4>📋 Volunteer Activity Registration</h4>
     <p class="text-muted">Select the volunteer activities you're interested in (multiple selection allowed, but time conflicts will be checked).</p>
     <ul class="list-group">
      <li v-for="activity in activities" :key="activity.id" class="list-group-item">
       <input
        type="checkbox"
        class="form-check-input me-2"
        :disabled="isConflict(activity) || isFull(activity) || hasJoined(activity)"
        v-model="selectedActivities"
        :value="activity.id"
       />
       <strong>{{ activity.title }}</strong> — {{ activity.date }} {{ activity.time }} @ {{ activity.location }} <br />
       🧍 Needed: {{ activity.capacity }} | Registered: {{ activity.registeredUsers.length }}
       <br />
       <small v-if="isConflict(activity)" class="text-danger">⛔ Time conflict</small>
       <small v-else-if="isFull(activity)" class="text-danger">⛔ Full</small>
       <small v-else-if="hasJoined(activity)" class="text-success">✅ Already registered</small>
      </li>
     </ul>
     <button class="btn btn-primary mt-3" @click="submitRegistrations">Submit Registration</button>
     <p class="text-success mt-2" v-if="successMessage">{{ successMessage }}</p>
    </div>
   </div>
  </div>
 </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const currentTab = ref('notice')
const activities = ref([])
const selectedActivities = ref([])
const successMessage = ref('')
const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')

// Load activity list
onMounted(async () => {
 const local = localStorage.getItem('volunteer_activities')
 if (local) {
  activities.value = JSON.parse(local)
 } else {
  const res = await fetch('/src/assets/json/volunteer_activities.json')
  const data = await res.json()
  data.forEach(a => {
   if (!a.registeredUsers) a.registeredUsers = []
  })
  localStorage.setItem('volunteer_activities', JSON.stringify(data))
  activities.value = data
 }
})

// Check if full
function isFull(activity) {
 return activity.registeredUsers.length >= activity.capacity
}

// Check if already registered
function hasJoined(activity) {
 return activity.registeredUsers.includes(currentUser.username)
}

// Check for time conflicts
function isConflict(newAct) {
 const selected = activities.value.filter(a =>
  a.registeredUsers.includes(currentUser.username) || selectedActivities.value.includes(a.id)
 )

 return selected.some(a => a.date === newAct.date && a.time === newAct.time && a.id !== newAct.id)
}

// Submit registrations
function submitRegistrations() {
 let updated = false

 selectedActivities.value.forEach(id => {
  const act = activities.value.find(a => a.id === id)
  if (!act.registeredUsers.includes(currentUser.username) && act.registeredUsers.length < act.capacity) {
   act.registeredUsers.push(currentUser.username)
   updated = true
  }
 })

 if (updated) {
  localStorage.setItem('volunteer_activities', JSON.stringify(activities.value))
  successMessage.value = 'Successfully registered!'
  selectedActivities.value = []
 } else {
  successMessage.value = 'No changes made — may already be full or registered.'
 }

 setTimeout(() => (successMessage.value = ''), 3000)
}
</script>

<style scoped>
.list-group-item {
 border-radius: 8px;
 margin-bottom: 8px;
}
</style>