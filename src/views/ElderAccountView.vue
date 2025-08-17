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
          <div v-if="user">
            <p><strong>Username:</strong> {{ user.username }}</p>
            <p><strong>Email:</strong> {{ user.email }}</p>
            <p><strong>Role:</strong> {{ user.role }}</p>
          </div>
          <p v-else>Loading user data...</p>
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
import { useRouter } from 'vue-router';

// 引入所有需要的 Firebase 服务
import { getAuth, updateEmail, updatePassword, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';

const router = useRouter();
const auth = getAuth();

const currentTab = ref('profile')
const user = ref(null)

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

onMounted(async () => {
  const currentUser = auth.currentUser;
  if (currentUser) {
    // 1. 获取用户信息 (从 Auth 和 Firestore)
    const userDocRef = doc(db, 'users', currentUser.uid);
    const userDoc = await getDoc(userDocRef);

    if(userDoc.exists()) {
      user.value = { uid: currentUser.uid, email: currentUser.email, ...userDoc.data() };
    } else {
      console.error("User data not found in Firestore!");
      // 可以选择登出或显示错误
      return;
    }

    // 2. 获取用户参与的活动 (从 Firestore 查询)
    const activitiesRef = collection(db, "activities");
    // 假设 activities 文档中有一个 'registeredUsers' 数组字段，存储了参与用户的 UID
    const q = query(activitiesRef, where("registeredUsers", "array-contains", currentUser.uid));
    const querySnapshot = await getDocs(q);
    
    activities.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  } else {
    console.log("No user is logged in. Redirecting to login.");
    router.push('/login');
  }

  // 3. 模拟设备数据 (保持不变)
  equipments.value = [
    { name: 'Walker', date: '2025-06-28' },
    { name: 'Blood Pressure Monitor', date: '2025-07-02' }
  ];
});

// updateSettings: 使用 Firebase API 更新用户信息
async function updateSettings() {
  updateMessage.value = '';
  const currentUser = auth.currentUser;
  if (!currentUser) return;

  const trimmedEmail = newEmail.value.trim();
  const trimmedPassword = newPassword.value.trim();
  const promises = [];

  // --- 1. 验证输入 ---
  if (!trimmedEmail && !trimmedPassword) {
    updateSuccess.value = false;
    updateMessage.value = '❗ You changed nothing.';
    return;
  }
  if (trimmedEmail && !validateEmailFormat(trimmedEmail)) {
    updateSuccess.value = false;
    updateMessage.value = '❌ Invalid email format.';
    return;
  }
  if (trimmedPassword && !validatePasswordFormat(trimmedPassword)) {
    updateSuccess.value = false;
    updateMessage.value = '❌ Password must be 8+ chars...'; // 简写
    return;
  }
  if (!confirm('Are you sure you want to update? You will be logged out.')) return;

  // --- 2. 准备更新任务 ---
  // 如果邮箱变了，准备两个任务：更新 Auth 和 更新 Firestore
  if (trimmedEmail && trimmedEmail !== currentUser.email) {
    promises.push(updateEmail(currentUser, trimmedEmail));
    const userDocRef = doc(db, 'users', currentUser.uid);
    promises.push(updateDoc(userDocRef, { email: trimmedEmail }));
  }

  // 如果密码变了，准备更新 Auth 的任务
  if (trimmedPassword) {
    promises.push(updatePassword(currentUser, trimmedPassword));
  }

  // --- 3. 执行所有更新任务 ---
  try {
    await Promise.all(promises);

    updateSuccess.value = true;
    updateMessage.value = '✅ Info updated successfully! Please log in again.';
    
    // 成功后登出用户
    await signOut(auth);
    router.push('/login');

  } catch (error) {
    updateSuccess.value = false;
    // 处理常见的 Firebase 错误
    if (error.code === 'auth/requires-recent-login') {
      updateMessage.value = '❌ This operation is sensitive and requires recent authentication. Please log out and log back in before trying again.';
    } else {
      updateMessage.value = `❌ An error occurred: ${error.message}`;
    }
    console.error("Error updating settings:", error);
  }
}
</script>


<style scoped>
.list-group-item {
  cursor: pointer;
}
</style>

