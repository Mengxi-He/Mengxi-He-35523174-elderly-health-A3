<template>
  <div class="container-fluid mt-4">
    <div class="row">
      <!-- left sidebar -->
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

        <div v-if="activeTab === 'rate'">
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
              </div>
            </div>
          </div>
        </div>

        <div v-else>
          <div v-for="activity in availableActivities" :key="activity.id" class="form-check mb-3 border p-3 rounded">
            <input type="checkbox" class="form-check-input"
                   :id="'activity-' + activity.id"
                   :value="activity.id"
                   v-model="selectedActivities"
                   :disabled="checkTimeConflict(activity)">
            <label :for="'activity-' + activity.id" class="form-check-label">
              <strong>{{ activity.title }}</strong> <br>
              📅 {{ activity.date }} | 🕒 {{ activity.time }} | 📍 {{ activity.location }}<br>
              <small>{{ activity.description }}</small>
              <div v-if="checkTimeConflict(activity)" class="text-danger mt-1">⚠️ Time conflict!</div>
            </label>
          </div>
          <button class="btn btn-success mt-3" @click="registerActivities">Register Selected</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
const username = currentUser?.username || ''

const activities = ref([])
const ratings = ref({})
const selectedActivities = ref([])
const activeTab = ref('rate')

// Load activity data
onMounted(async () => {
  const cached = localStorage.getItem('activities')
  if (cached) {
    activities.value = JSON.parse(cached)
  } else {
    const res = await fetch('/src/assets/json/activities.json')
    const data = await res.json()
    localStorage.setItem('activities', JSON.stringify(data))
    activities.value = data
  }
})

// Check if already rated
function hasRated(activity) {
  return activity.ratingsByUser && activity.ratingsByUser[username] !== undefined
}

// Submit rating
function submitRating(activity) {
  const score = parseInt(ratings.value[activity.id])
  if (!score || score < 1 || score > 5) return
  if (!activity.ratingsByUser) activity.ratingsByUser = {}
  if (!activity.scores) activity.scores = []

  activity.ratingsByUser[username] = score
  activity.scores.push(score)
  localStorage.setItem('activities', JSON.stringify(activities.value))
}

// Calculate average rating
function calculateAverage(activity) {
  if (!activity.scores?.length) return 'N/A'
  const total = activity.scores.reduce((a, b) => a + b, 0)
  return (total / activity.scores.length).toFixed(1)
}

// Filter available activities for registration
const availableActivities = computed(() =>
  activities.value.filter(a => !a.registeredUsers?.includes(username))
)

// Time conflict detection
function checkTimeConflict(activity) {
  const userEvents = activities.value.filter(a => a.registeredUsers?.includes(username))
  return userEvents.some(
    e => e.date === activity.date && e.time === activity.time
  )
}

// Register selected activities
function registerActivities() {
  activities.value.forEach(activity => {
    if (selectedActivities.value.includes(activity.id)) {
      if (!activity.registeredUsers) activity.registeredUsers = []
      if (!activity.registeredUsers.includes(username)) {
        activity.registeredUsers.push(username)
      }
    }
  })
  localStorage.setItem('activities', JSON.stringify(activities.value))
  selectedActivities.value = []
  alert('Successfully registered!')
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
</style>
