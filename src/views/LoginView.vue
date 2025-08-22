<template>
  <div class="container mt-5" style="max-width: 500px;">
    <h2 class="text-center mb-4">Sign in to Health Charity</h2>

    <form @submit.prevent="handleLogin">
      <!-- Username or Email Input Box -->
      <div class="mb-3">
        <label>Email or Username:</label>
        <input
          type="text"
          v-model="identifier"
          class="form-control"
          placeholder="Enter your email or username"
          required
        />
      </div>

      <!-- Password Input Box -->
      <div class="mb-3">
        <label>Password:</label>
        <input
          type="password"
          v-model="password"
          class="form-control"
          placeholder="Enter your password"
          required
        />
      </div>

      <!-- Login Button -->
      <button type="submit" class="btn btn-success w-100">Sign in</button>

      <!-- Error Message -->
      <p v-if="error" class="text-danger mt-2 text-center">
        {{ error }}
      </p>
    </form>

    <!-- Divider -->
    <hr />

    <!-- Registration Redirect -->
    <p class="text-center">
      New to the system?
      <a href="#" @click.prevent="goToRegister">Create an account</a>
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { signInWithEmailAndPassword } from 'firebase/auth'
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/firebase/config'

const identifier = ref('')
const password = ref('')
const error = ref(null)
const isLoading = ref(false) //add a loading state
const router = useRouter()

async function handleLogin() {
  error.value = null
  isLoading.value = true

  try {
    let email = identifier.value

    // 1. 判断用户输入的是邮箱还是用户名
    //    一个简单的判断方法是检查是否包含 '@' 符号
    if (!identifier.value.includes('@')) {
      // 如果是用户名, 需要去 Firestore 查询对应的邮箱
      const usersRef = collection(db, "users")
      const q = query(usersRef, where("username", "==", identifier.value))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        throw new Error("auth/user-not-found") // 抛出错误，让 catch 块处理
      }
      
      // 获取查询到的第一个用户的 email
      email = querySnapshot.docs[0].data().email
    }

    // 2. 使用邮箱和密码进行 Firebase 登录
    const userCredential = await signInWithEmailAndPassword(auth, email, password.value)
    const user = userCredential.user

    // 3. 从 Firestore 获取用户角色信息
    const userDocRef = doc(db, "users", user.uid)
    const userDoc = await getDoc(userDocRef)

    if (!userDoc.exists()) {
      throw new Error("User data not found in database.")
    }

    const userData = userDoc.data()

    // 4. 根据角色进行重定向
    // 注意：你不再需要手动设置 localStorage.setItem('isAuthenticated', 'true')
    // Firebase 会自动管理用户的登录状态
    if (userData.role === 'admin') {
      router.push('/admin-panel')
    } else if (userData.role === 'elder') {
      router.push('/account-elder')
    } else if (userData.role === 'volunteer') {
      router.push('/volunteer-area')
    } else {
      router.push('/') // 默认跳转
    }

  } catch (err) {
    // 5. 处理 Firebase 返回的错误
    switch (err.code || err.message) {
      case 'auth/user-not-found':
      case 'auth/invalid-email':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        error.value = 'Invalid email/username or password.'
        break
      default:
        error.value = 'An unexpected error occurred. Please try again.'
        console.error("Firebase login error:", err)
    }
  } finally {
    isLoading.value = false // 无论成功失败，都结束加载状态
  }
}

function goToRegister() {
  router.push('/register')
}

</script>
