<template>
  <div class="container mt-5" style="max-width: 500px;">
    <h2 class="text-center mb-4">Sign in to Health Charity</h2>

    <form @submit.prevent="handleLogin">
      <!-- 用户名或邮箱输入框 -->
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

      <!-- 密码输入框 -->
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

      <!-- 登录按钮 -->
      <button type="submit" class="btn btn-success w-100">Sign in</button>

      <!-- 错误提示 -->
      <p v-if="error" class="text-danger mt-2 text-center">
        Invalid credentials or user not found
      </p>
    </form>

    <!-- 分隔线 -->
    <hr />

    <!-- 注册跳转 -->
    <p class="text-center">
      New to the system?
      <a href="#" @click.prevent="goToRegister">Create an account</a>
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const identifier = ref('')
const password = ref('')
const error = ref(false)
const router = useRouter()

function handleLogin() {
  const users = JSON.parse(localStorage.getItem('users') || '[]')

  // 匹配用户名或邮箱
  const user = users.find(
    (u) =>
      (u.username === identifier.value || u.email === identifier.value) &&
      u.password === password.value
  )

  if (user) {
    // 保存登录状态
    localStorage.setItem('isAuthenticated', 'true')
    localStorage.setItem('currentUser', JSON.stringify(user))
    error.value = false

    // 根据角色跳转
    if (user.role === 'admin') {
      router.push('/admin')
    } else if (user.role === 'elder') {
      router.push('/account-elder')
    } else if (user.role === 'volunteer') {
      router.push('/volunteer')
    } else {
      router.push('/')
    }
  } else {
    error.value = true
  }
}

function goToRegister() {
  router.push('/register')
}

</script>
