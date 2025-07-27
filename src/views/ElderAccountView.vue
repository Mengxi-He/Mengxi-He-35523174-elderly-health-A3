<template>
  <div class="container-fluid mt-4">
    <div class="row">
      <!-- Left sidebar -->
      <div class="col-md-3 mb-3">
        <div class="list-group">
          <button
            class="list-group-item list-group-item-action"
            :class="{ active: currentTab === 'profile' }"
            @click="currentTab = 'profile'"
          >
            👤 Personal Info
          </button>
          <button
            class="list-group-item list-group-item-action"
            :class="{ active: currentTab === 'activities' }"
            @click="currentTab = 'activities'"
          >
            🎯 My Joined Activities
          </button>

          <button
            class="list-group-item list-group-item-action"
            :class="{ active: currentTab === 'equipment' }"
            @click="currentTab = 'equipment'"
          >
            🩺 Equipment Borrowing
          </button>

          <button
            class="list-group-item list-group-item-action"
            :class="{ active: currentTab === 'settings' }"
            @click="currentTab = 'settings'"
        >
            ⚙️ Settings
          </button>

        </div>
      </div>

      <!-- Right content display area -->
      <div class="col-md-9">
        <div v-if="currentTab === 'profile'">
          <h4>👤 Personal Information</h4>
          <p><strong>Username:</strong> {{ user.username }}</p>
          <p><strong>Email:</strong> {{ user.email }}</p>
          <p><strong>Role:</strong> {{ user.role }}</p>
        </div>

        <div v-if="currentTab === 'activities'">
          <h4>🎯 My Joined Activities</h4>
          <p v-if="activities.length === 0" class="text-muted">No joined activity records yet.</p>
          <ul class="list-group" v-else>
            <li class="list-group-item" v-for="(a, index) in activities" :key="index">
              {{ a.title }} — {{ a.date }} at {{ a.location }}
            </li>
          </ul>
        </div>


        <div v-if="currentTab === 'equipment'">
          <h4>🩺 Borrowed Medical Equipment</h4>
          <p v-if="equipments.length === 0" class="text-muted">No equipment borrowed yet.</p>
          <ul class="list-group" v-else>
            <li class="list-group-item" v-for="(e, index) in equipments" :key="index">
              {{ e.name }} — Borrowed on {{ e.date }}
            </li>
          </ul>
        </div>

        <div v-if="currentTab === 'settings'">
          <h4>⚙️ Account Settings</h4>

          <div class="mb-3">
            <label class="form-label">New Email</label>
            <input type="email" class="form-control" v-model="newEmail" />
          </div>

          <div class="mb-3">
            <label class="form-label">New Password</label>
            <input type="password" class="form-control" v-model="newPassword" />
          </div>

          <button class="btn btn-primary" @click="updateSettings">Update</button>
          
          <p class="text-muted mt-2">Note: You will be logged out after updating.</p>
          <p class="text-danger mt-2" v-if="updateMessage && !updateSuccess">{{ updateMessage }}</p>
          <p class="text-success mt-2" v-if="updateMessage && updateSuccess">{{ updateMessage }}</p>

        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const currentTab = ref('profile')
const user = ref({
  username: '',
  email: '',
  role: ''
})

const activities = ref([])
const equipments = ref([])

// Set fields
const newEmail = ref('')
const newPassword = ref('')
const updateMessage = ref('')
const updateSuccess = ref(false)

// Validation functions
function validateEmailFormat(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

function validatePasswordFormat(password) {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password) &&
    /[!@#$%^&*]/.test(password)
  )
}

onMounted(() => {
  const stored = JSON.parse(localStorage.getItem('currentUser'))
  if (stored) {
    user.value = stored
  }

  // Get activities registered by the current user
  const allActivities = JSON.parse(localStorage.getItem('activities') || '[]')
  activities.value = allActivities.filter(
    act => act.registeredUsers && act.registeredUsers.includes(user.value.username)
  )

  // Mock equipment data (for testing)
  equipments.value = [
    { name: 'Walker', date: '2025-06-28' },
    { name: 'Blood Pressure Monitor', date: '2025-07-02' }
  ]
})

function updateSettings() {
  const users = JSON.parse(localStorage.getItem('users') || '[]')
  const current = JSON.parse(localStorage.getItem('currentUser'))

  const index = users.findIndex((u) => u.username === current.username)
  if (index === -1) return

  const trimmedEmail = newEmail.value.trim()
  const trimmedPassword = newPassword.value.trim()

  const emailChanged = trimmedEmail && trimmedEmail !== users[index].email
  const passwordChanged = trimmedPassword && trimmedPassword !== users[index].password

  // No changes made
  if (!emailChanged && !passwordChanged) {
    updateSuccess.value = false
    updateMessage.value = '❗ You changed nothing.'
    return
  }

  // Validation failed
  if (emailChanged && !validateEmailFormat(trimmedEmail)) {
    updateSuccess.value = false
    updateMessage.value = '❌ Invalid email format.'
    return
  }
  if (passwordChanged && !validatePasswordFormat(trimmedPassword)) {
    updateSuccess.value = false
    updateMessage.value = '❌ Password must be 8+ chars, include upper/lowercase, number, special char.'
    return
  }

  // Confirm changes
  if (!confirm('Are you sure you want to update? You will be logged out.')) return

  if (emailChanged) users[index].email = trimmedEmail
  if (passwordChanged) users[index].password = trimmedPassword
  localStorage.setItem('users', JSON.stringify(users))

  localStorage.removeItem('currentUser')
  localStorage.setItem('isAuthenticated', 'false')
  alert('✅ Info updated. Please log in again.')

  // Clear and redirect
  window.location.href = '/login'
}

</script>


<style scoped>
.list-group-item {
  cursor: pointer;
}
</style>

