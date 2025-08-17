<template>
  <div class="container-fluid mt-4">
    <div class="row">
      <!-- Left Sidebar -->
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
            🙋 Joined Volunteer Activities
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

      <!-- Right Content Panel -->
      <div class="col-md-9">
        <div v-if="currentTab === 'profile'">
          <h4>👤 Personal Information</h4>
          <div v-if="user">
            <p><strong>Username:</strong> {{ user.username }}</p>
            <p><strong>Email:</strong> {{ user.email }}</p>
            <p><strong>Role:</strong> {{ user.role }}</p>
          </div>
          <p v-else>Loading user data...</p>
        </div>

      <div v-if="currentTab === 'activities'">
        <h4>🙋 My Joined Volunteer Activities</h4>
        <p v-if="activities.length === 0" class="text-muted">No joined volunteer activity records yet.</p>
        <ul class="list-group" v-else>
          <li class="list-group-item" v-for="activity in activities" :key="activity.id">
            {{ activity.title }} — {{ activity.date }} at {{ activity.location }}
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
import { useRouter } from 'vue-router';

// 【修改】引入 Firebase 相关服务
import { getAuth, updateEmail, updatePassword, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';

const router = useRouter();
const auth = getAuth();

const currentTab = ref('profile')
const user = ref(null);
const activities = ref([])

const newEmail = ref('')
const newPassword = ref('')
const updateMessage = ref('')
const updateSuccess = ref(false)

// Email and password validators
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

// 【修改】onMounted 完全重写，从 Firebase 加载数据
onMounted(async () => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    router.push('/login');
    return;
  }

  // 1. 获取用户信息 (逻辑与 ElderAccountView 完全一致)
  const userDocRef = doc(db, 'users', currentUser.uid);
  const userDoc = await getDoc(userDocRef);
  if (userDoc.exists()) {
    user.value = { uid: currentUser.uid, email: currentUser.email, ...userDoc.data() };
  } else {
    console.error("User data not found in Firestore!");
    return;
  }

  // 2. 获取该志愿者加入的活动 (查询不同的集合)
  // 【关键区别】我们现在查询 'volunteer_activities' 集合
  const activitiesRef = collection(db, "volunteer_activities");
  // 【关键区别】我们现在检查 'registeredVolunteers' 字段
  const q = query(activitiesRef, where("registeredVolunteers", "array-contains", currentUser.uid));
  const querySnapshot = await getDocs(q);
  activities.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
});

// 【修改】updateSettings 函数 (逻辑与 ElderAccountView 完全一致)
async function updateSettings() {
  updateMessage.value = '';
  const currentUser = auth.currentUser;
  if (!currentUser) return;

  const trimmedEmail = newEmail.value.trim();
  const trimmedPassword = newPassword.value.trim();
  const promises = [];

  // --- 验证逻辑 ---
  if (!trimmedEmail && !trimmedPassword) { /* ... */ return; }
  if (trimmedEmail && !validateEmailFormat(trimmedEmail)) { /* ... */ return; }
  if (trimmedPassword && !validatePasswordFormat(trimmedPassword)) { /* ... */ return; }
  if (!confirm('Are you sure you want to update? You will be logged out.')) return;

  // --- 准备更新任务 ---
  if (trimmedEmail && trimmedEmail !== currentUser.email) {
    promises.push(updateEmail(currentUser, trimmedEmail));
    const userDocRef = doc(db, 'users', currentUser.uid);
    promises.push(updateDoc(userDocRef, { email: trimmedEmail }));
  }
  if (trimmedPassword) {
    promises.push(updatePassword(currentUser, trimmedPassword));
  }

  // --- 执行更新 ---
  try {
    await Promise.all(promises);
    updateSuccess.value = true;
    updateMessage.value = '✅ Info updated successfully! Please log in again.';
    await signOut(auth);
    router.push('/login');
  } catch (error) {
    updateSuccess.value = false;
    if (error.code === 'auth/requires-recent-login') {
      updateMessage.value = '❌ This operation is sensitive...';
    } else {
      updateMessage.value = `❌ An error occurred: ${error.message}`;
    }
  }
}
</script>

<style scoped>
.list-group-item {
  cursor: pointer;
}
</style>

