<template>
  <div class="container-fluid mt-4">
    <div class="row">
      <!-- 左侧边栏 -->
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

      <!-- 右侧内容展示区 -->
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

          <p class="text-success mt-3" v-if="updateSuccess">{{ updateMessage }}</p>
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
const updateMessage = ref('')
onMounted(() => {
  const stored = JSON.parse(localStorage.getItem('currentUser'))
  if (stored) {
    user.value = stored
  }

  // 获取当前用户报名的活动
  const allActivities = JSON.parse(localStorage.getItem('activities') || '[]')
  activities.value = allActivities.filter(
    act => act.registeredUsers && act.registeredUsers.includes(user.value.username)
  )

  // 保留借设备记录的假数据
  equipments.value = [
    { name: 'Walker', date: '2025-06-28' },
    { name: 'Blood Pressure Monitor', date: '2025-07-02' }
  ]
})

const newEmail = ref('')
const newPassword = ref('')
const updateSuccess = ref(false)

function updateSettings() {
  const users = JSON.parse(localStorage.getItem('users') || '[]')
  const current = JSON.parse(localStorage.getItem('currentUser'))

  const index = users.findIndex((u) => u.username === current.username)
  if (index !== -1) {
    const trimmedEmail = newEmail.value.trim()
    const trimmedPassword = newPassword.value.trim()

    const emailChanged = trimmedEmail && trimmedEmail !== users[index].email
    const passwordChanged = trimmedPassword && trimmedPassword !== users[index].password

    if (!emailChanged && !passwordChanged) {
      updateSuccess.value = true
      updateMessage.value = 'Change nothing'
      setTimeout(() => {
        updateSuccess.value = false
        updateMessage.value = ''
      }, 3000)
      return
    }

    const confirmUpdate = confirm('Email or password has changed. Do you want to proceed and log out?')
    if (!confirmUpdate) return

    // 应用更改
    if (emailChanged) users[index].email = trimmedEmail
    if (passwordChanged) users[index].password = trimmedPassword

    localStorage.setItem('users', JSON.stringify(users))

    // 清除登录状态并跳转
    localStorage.removeItem('currentUser')
    localStorage.setItem('isAuthenticated', 'false')
    window.location.href = '/login'
  }

  newEmail.value = ''
  newPassword.value = ''
}



</script>

<style scoped>
.list-group-item {
  cursor: pointer;
}
</style>

