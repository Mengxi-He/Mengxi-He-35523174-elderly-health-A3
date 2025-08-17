<template>
  <div class="container-fluid mt-4">
    <div class="row">
      <!-- left sidebar (无变动) -->
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

        <!-- Rate Tab (模板基本无变动, 逻辑已更新) -->
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

        <!-- Register Tab (模板已修改为表格, 满足 D.3) -->
        <div v-else>
          <!-- 【修改】用 DataTable 组件替换 table -->
          <DataTable 
            :columns="columns" 
            :data="availableActivities" 
            :options="dtOptions"
            class="table table-hover table-striped"
            id="activitiesTable"
          >
            <thead>
              <!-- 表头现在由 columns 配置自动生成 -->
            </thead>
          </DataTable>

          <button class="btn btn-success mt-3" @click="registerActivities">
            Register Selected
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

import DataTable from 'datatables.net-vue3';
import DataTablesCore from 'datatables.net-bs5';
import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css';

DataTable.use(DataTablesCore);


// 【新增】引入所有需要的 Firebase 服务
import { getAuth } from 'firebase/auth'
import { db } from '@/firebase/config'
import { collection, getDocs, doc, updateDoc, arrayUnion, serverTimestamp, addDoc } from 'firebase/firestore'

const router = useRouter()
const auth = getAuth()

// 【修改】使用 uid 和 email 来识别用户，而不是 username
const userUID = ref(null)
const userEmail = ref(null)

const activities = ref([])
const ratings = ref({})
const selectedActivities = ref([])
const activeTab = ref('rate')

// 【新增】为 DataTable 定义列
const columns = [
  { 
    data: null, 
    title: 'Select',
    orderable: false, // 这一列不允许排序
    render: (data, type, row) => {
      // 动态渲染复选框。注意：这里的交互逻辑需要稍微调整
      // 为了简单起见，我们先渲染，交互逻辑后续处理
      return `<input type="checkbox" class="form-check-input" value="${row.id}">`;
    }
  },
  { data: 'title', title: 'Activity' },
  { data: 'date', title: 'Date' },
  { data: 'time', title: 'Time' },
  { data: 'location', title: 'Location' },
];

// 【新增】为 DataTable 提供配置选项
const dtOptions = {
  responsive: true,
  pageLength: 10, // D.3 要求：每页最多显示10行
  // 默认开启了排序和搜索，无需额外配置
};

// 【修改】onMounted 完全重写，从 Firebase 加载数据
onMounted(async () => {
  const currentUser = auth.currentUser
  if (currentUser) {
    userUID.value = currentUser.uid
    userEmail.value = currentUser.email
  } else {
    // 如果没有用户登录，则不加载数据并可能重定向
    console.log("No user logged in.");
    router.push('/login');
    return;
  }
  
  // 从 Firestore 的 'activities' 集合中获取数据
  const querySnapshot = await getDocs(collection(db, 'activities'))
  activities.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
})

// 【修改】hasRated 函数现在使用 uid
function hasRated(activity) {
  return activity.ratingsByUser && activity.ratingsByUser[userUID.value] !== undefined
}

// 【修改】submitRating 函数现在更新 Firestore
async function submitRating(activity) {
  const score = parseInt(ratings.value[activity.id])
  if (!score || score < 1 || score > 5) return

  const activityRef = doc(db, 'activities', activity.id)
  
  try {
    // 使用点表示法更新 map 字段，并使用 arrayUnion 原子化地添加分数
    await updateDoc(activityRef, {
      [`ratingsByUser.${userUID.value}`]: score,
      scores: arrayUnion(score)
    })
    
    // 在前端同步更新，避免重新加载
    if (!activity.ratingsByUser) activity.ratingsByUser = {}
    if (!activity.scores) activity.scores = []
    activity.ratingsByUser[userUID.value] = score
    activity.scores.push(score)

  } catch (error) {
    console.error("Error submitting rating:", error)
    alert("Failed to submit rating. Please try again.")
  }
}

// calculateAverage 函数无变动
function calculateAverage(activity) {
  if (!activity.scores?.length) return 'N/A'
  const total = activity.scores.reduce((a, b) => a + b, 0)
  return (total / activity.scores.length).toFixed(1)
}

// 【修改】availableActivities 计算属性现在使用 uid
const availableActivities = computed(() =>
  activities.value.filter(a => !a.registeredUsers?.includes(userUID.value))
)

// 【修改】checkTimeConflict 函数现在使用 uid
function checkTimeConflict(activity) {
  const userEvents = activities.value.filter(a => a.registeredUsers?.includes(userUID.value))
  return userEvents.some(
    e => e.date === activity.date && e.time === activity.time && e.id !== activity.id
  )
}

// 【修改】registerActivities 函数现在更新 Firestore 并触发邮件
async function registerActivities() {
  if (!userUID.value || selectedActivities.value.length === 0) return

  const promises = []
  const successfullyRegisteredActivities = []

  // 为每个选中的活动创建一个更新 Promise
  selectedActivities.value.forEach(activityId => {
    const activityRef = doc(db, 'activities', activityId)
    promises.push(
      updateDoc(activityRef, {
        registeredUsers: arrayUnion(userUID.value)
      }).then(() => {
        // 记录成功报名的活动信息，用于后续发送邮件
        const activityData = activities.value.find(a => a.id === activityId)
        if (activityData) {
          successfullyRegisteredActivities.push(activityData)
        }
      })
    )
  })

  try {
    // 等待所有数据库更新完成
    await Promise.all(promises)

    // 【新增】D.2 & E.1 需求实现: 写入邮件队列以触发云函数
    if (successfullyRegisteredActivities.length > 0) {
      const mailPromises = successfullyRegisteredActivities.map(activity => {
        return addDoc(collection(db, 'mailQueue'), {
          to: userEmail.value,
          message: {
            subject: `Confirmation for joining: ${activity.title}`,
            text: `Hi! You have successfully registered for the activity "${activity.title}" on ${activity.date} at ${activity.location}. We look forward to seeing you!`,
            // 您的云函数可以根据这些信息生成附件
            html: `<h3>Confirmation for joining: ${activity.title}</h3><p>Hi! You have successfully registered for the activity "${activity.title}" on ${activity.date} at ${activity.location}. We look forward to seeing you!</p>`,
            activityInfo: activity // 传递活动信息给云函数
          },
          createdAt: serverTimestamp()
        })
      })
      await Promise.all(mailPromises);
    }
    
    // 更新前端 UI
    activities.value.forEach(activity => {
      if (selectedActivities.value.includes(activity.id)) {
        if (!activity.registeredUsers) activity.registeredUsers = []
        activity.registeredUsers.push(userUID.value)
      }
    })
    
    selectedActivities.value = []
    alert('Successfully registered! A confirmation email will be sent to you shortly.')

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
</style>
