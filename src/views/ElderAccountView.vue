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
</script>

<style scoped>
.list-group-item {
  cursor: pointer;
}
</style>

