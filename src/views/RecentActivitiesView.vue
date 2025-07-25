<template>
  <div class="container mt-5">
    <h2 class="mb-4 text-center">🎯 Upcoming Activities for Elders</h2>

    <div v-for="activity in activities" :key="activity.id" class="card mb-4 shadow-sm">
      <div class="card-body">
        <h5 class="card-title">{{ activity.title }}</h5>
        <p class="card-text">
          📅 {{ activity.date }} | 📍 {{ activity.location }}<br />
          {{ activity.description }}
        </p>

        <!-- 评分区域 -->
        <div v-if="!hasRated(activity)" class="rating-input">
          <label for="rating">Your expectation (1–5):</label>
          <select v-model="ratings[activity.id]" class="form-select w-auto d-inline-block mx-2">
            <option disabled value="">Select</option>
            <option v-for="n in 5" :key="n" :value="n">{{ n }}</option>
          </select>
          <button class="btn btn-primary btn-sm" @click="submitRating(activity)">Submit</button>
        </div>

        <!-- 平均评分展示 -->
        <div v-else class="mt-2">
          <strong>⭐ Average Expectation:</strong> {{ calculateAverage(activity) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 当前登录用户
const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
const username = currentUser?.username || ''

// 当前所有活动
const activities = ref([])

// 当前评分输入
const ratings = ref({})

// 初始化活动数据
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

// 检查是否已评分
function hasRated(activity) {
  return activity.ratingsByUser && activity.ratingsByUser[username] !== undefined
}

// 提交评分
function submitRating(activity) {
  const score = parseInt(ratings.value[activity.id])
  if (!score || score < 1 || score > 5) return

  activity.ratingsByUser[username] = score
  activity.scores.push(score)

  // 更新 localStorage
  localStorage.setItem('activities', JSON.stringify(activities.value))
}

// 计算平均分
function calculateAverage(activity) {
  if (!activity.scores.length) return 'N/A'
  const total = activity.scores.reduce((a, b) => a + b, 0)
  return (total / activity.scores.length).toFixed(1)
}
</script>

<style scoped>
.card {
  border-radius: 12px;
  border: 1px solid #ccc;
}
.rating-input select {
  width: 80px;
}
</style>
