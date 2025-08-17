<template>
  <div class="container">
    <header class="d-flex justify-content-center py-3">
      <ul class="nav nav-pills">
        <!-- All users can view. -->
        <li class="nav-item">
          <router-link to="/" class="nav-link" active-class="active">Home</router-link>
        </li>
        <li class="nav-item">
          <router-link to="/about" class="nav-link" active-class="active">About</router-link>
        </li>

        <!--  After logging in, Elder displays -->
        <template v-if="loggedIn && userRole === 'elder'">
          <li class="nav-item">
            <router-link to="/account-elder" class="nav-link" active-class="active">Account</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/free-help" class="nav-link" active-class="active">Free Help</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/recent-activities" class="nav-link" active-class="active">Recent Activities</router-link>
          </li>
        </template>

        <!--  After logging in, Volunteer displays -->
        <template v-if="loggedIn && userRole === 'volunteer'">
          <li class="nav-item">
            <router-link to="/account-volunteer" class="nav-link" active-class="active">Account</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/volunteer-area" class="nav-link" active-class="active">Volunteer Area</router-link>
          </li>
        </template>

        <!--  After logging in, Admin displays -->
        <template v-if="loggedIn && userRole === 'admin'">
          <li class="nav-item">
            <router-link to="/admin-panel" class="nav-link" active-class="active">Admin Panel</router-link>
          </li>
        </template>
      </ul>

      <!-- Login / Logout button -->
      <div class="ms-3">
        <router-link v-if="!loggedIn" to="/login" class="btn btn-outline-primary btn-sm">Login</router-link>
        <button v-else @click="logout" class="btn btn-outline-danger btn-sm">Logout</button>
      </div>
    </header>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
// 引入 Firebase 相关服务和方法
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase/config' // 确保路径正确

const loggedIn = ref(false)
const userRole = ref(null) // 使用 null 作为初始值更清晰
const router = useRouter()
const auth = getAuth()

// onMounted 是一个生命周期钩子，确保在组件挂载到页面后才执行代码
onMounted(() => {
  // 设置一个持久的 Firebase 认证状态监听器
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      // --- 用户已登录 ---
      loggedIn.value = true;
      
      // 从 Firestore 获取该用户的角色信息
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        userRole.value = userDoc.data().role;
      } else {
        // 如果数据库里找不到用户信息，这是一个异常情况
        console.error("User is authenticated, but their data is missing from Firestore.");
        userRole.value = null;
      }

    } else {
      // --- 用户已登出 ---
      loggedIn.value = false;
      userRole.value = null;
    }
  });
});

// 新的登出函数
async function logout() {
  try {
    await signOut(auth); // 通知 Firebase 用户登出
    // 登出成功后，onAuthStateChanged 会自动触发，将 loggedIn 和 userRole 置为 false/null
    // 所以我们在这里不再需要手动修改它们的值
    router.push('/login'); // 跳转到登录页
  } catch (error) {
    console.error("Error signing out: ", error);
  }
}
</script>

<!-- <script setup>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const loggedIn = ref(localStorage.getItem('isAuthenticated') === 'true')
const userRole = ref('')
const router = useRouter()
const route = useRoute()

// Initial mount to read login role
const user = JSON.parse(localStorage.getItem('currentUser'))
userRole.value = user?.role || ''

// Watch for route changes to check login status and role
watch(
  () => route.fullPath,
  () => {
    loggedIn.value = localStorage.getItem('isAuthenticated') === 'true'
    const user = JSON.parse(localStorage.getItem('currentUser'))
    userRole.value = user?.role || ''
  }
)

function logout() {
  localStorage.removeItem('isAuthenticated')
  localStorage.removeItem('currentUser')
  loggedIn.value = false
  userRole.value = ''
  router.push('/login')
}
</script> -->


<style scoped>
.b-example-divider {
  height: 3rem;
  background-color: rgba(0, 0, 0, 0.1);
  border: solid rgba(0, 0, 0, 0.15);
  border-width: 1px 0;
  box-shadow:
    inset 0 0.5em 1.5em rgba(0, 0, 0, 0.1),
    inset 0 0.125em 0.5em rgba(0, 0, 0, 0.15);
}

.form-control-dark {
  color: #fff;
  background-color: var(--bs-dark);
  border-color: var(--bs-gray);
}
.form-control-dark:focus {
  color: #fff;
  background-color: var(--bs-dark);
  border-color: #fff;
  box-shadow: 0 0 0 0.25rem rgba(255, 255, 255, 0.25);
}

.bi {
  vertical-align: -0.125em;
  fill: currentColor;
}

.text-small {
  font-size: 85%;
}

.dropdown-toggle {
  outline: 0;
}

</style>
