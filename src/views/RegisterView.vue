<template>
  <div class="container-fluid vh-100">
    <div class="row h-100">
      <!-- Left Banner -->
      <div class="col-md-6 d-none d-md-flex align-items-center justify-content-center bg-dark text-white">
        <div class="text-center px-4">
          <h1 class="mb-4">Create your free account</h1>
          <p class="lead">
            Join our health & charity platform.<br />
            Register as an elder 👵 or a volunteer 🙋 and start your journey today!
          </p>
        </div>
      </div>

      <!-- Right Form Section -->
      <div class="col-md-6 d-flex align-items-center justify-content-center">
        <div class="w-75">
          <h2 class="mb-4 text-center">Sign up</h2>

          <form @submit.prevent="handleRegister">
            <!-- Email -->
            <div class="mb-3">
              <label>Email</label>
              <input
                type="email"
                class="form-control"
                v-model="formData.email"
                @blur="validateEmail(true)"
                @input="validateEmail(false)"
                placeholder="Enter your email"
              />
              <div v-if="errors.email" class="text-danger">{{ errors.email }}</div>
            </div>

            <!-- Password -->
            <div class="mb-3">
              <label>Password</label>
              <input
                type="password"
                class="form-control"
                v-model="formData.password"
                @blur="validatePassword(true)"
                @input="validatePassword(false)"
                placeholder="Enter your password"
              />
              <div v-if="errors.password" class="text-danger">{{ errors.password }}</div>
            </div>

            <!-- Confirm Password -->
            <div class="mb-3">
              <label>Confirm Password</label>
              <input
                type="password"
                class="form-control"
                v-model="formData.confirmPassword"
                @blur="validateConfirmPassword(true)"
                @input="validateConfirmPassword(false)"
                placeholder="Re-enter your password"
              />
              <div v-if="errors.confirmPassword" class="text-danger">{{ errors.confirmPassword }}</div>
            </div>

            <!-- Username -->
            <div class="mb-3">
              <label>Username</label>
              <input
                type="text"
                class="form-control"
                v-model="formData.username"
                @blur="validateUsername(true)"
                @input="validateUsername(false)"
                placeholder="Choose a username"
              />
              <div v-if="errors.username" class="text-danger">{{ errors.username }}</div>
            </div>

            <!-- Role -->
            <div class="mb-3">
              <label>Role</label>
              <select class="form-select" v-model="formData.role" @blur="validateRole(true)">
                <option disabled value="">Select your role</option>
                <option value="elder">Elder 👵</option>
                <option value="volunteer">Volunteer 🙋</option>
              </select>
              <div v-if="errors.role" class="text-danger">{{ errors.role }}</div>
            </div>

            <!-- Global Error / Success -->
            <p v-if="globalError" class="text-danger text-center">{{ globalError }}</p>
            <p v-if="success" class="text-success text-center">Registration successful! Redirecting...</p>

            <!-- Submit Button -->
            <button type="submit" class="btn btn-dark w-100 mt-3">Create account</button>
          </form>

          <!-- Already have account -->
          <p class="text-center mt-3">
            Already have an account?
            <a href="#" @click.prevent="router.push('/login')">Sign in →</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db } from '@/firebase/config'

const router = useRouter()
const success = ref(false)
const globalError = ref('')

const formData = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: ''
})

const errors = ref({
  username: null,
  email: null,
  password: null,
  confirmPassword: null,
  role: null
})

function validateEmail(blur) {
  const email = formData.value.email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  errors.value.email = !emailRegex.test(email) && blur ? 'Invalid email format.' : null
}

function validateUsername(blur) {
  const name = formData.value.username
  const validLength = name.length >= 3 && name.length <= 20
  const validFormat = /^[a-zA-Z0-9_]+$/.test(name)

  if (!validLength && blur) {
    errors.value.username = 'Username must be 3–20 characters long.'
  } else if (!validFormat && blur) {
    errors.value.username = 'Only letters, numbers and underscores allowed.'
  } else {
    errors.value.username = null
  }
}


function validatePassword(blur) {
  const pwd = formData.value.password
  const valid = pwd.length >= 8 && /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /\d/.test(pwd) && /[!@#$%^&*]/.test(pwd)
  if (!valid && blur) {
    errors.value.password = 'Password must be at least 8 characters and include upper/lowercase, number, and special character.'
  } else {
    errors.value.password = null
  }
}

function validateConfirmPassword(blur) {
  if (formData.value.password !== formData.value.confirmPassword && blur) {
    errors.value.confirmPassword = 'Passwords do not match.'
  } else {
    errors.value.confirmPassword = null
  }
}

function validateRole(blur) {
  if (!formData.value.role && blur) {
    errors.value.role = 'Please select a role.'
  } else {
    errors.value.role = null
  }
}

async function handleRegister() {
  // 1. 本地表单验证 (这部分逻辑不变)
  validateEmail(true)
  validateUsername(true)
  validatePassword(true)
  validateConfirmPassword(true)
  validateRole(true)

  if (Object.values(errors.value).some((e) => e)) {
    globalError.value = 'Please fix the errors above.'
    return
  }
  
  globalError.value = '' // 清除旧的错误信息

  try {
    // 2. 使用 Firebase 创建用户
    const userCredential = await createUserWithEmailAndPassword(auth, formData.value.email, formData.value.password)
    const user = userCredential.user;

    // 3. 将额外信息 (username, role) 存储到 Firestore
    // 使用 user.uid 作为文档的唯一 ID
    await setDoc(doc(db, "users", user.uid), {
      username: formData.value.username,
      email: formData.value.email,
      role: formData.value.role,
      createdAt: new Date() // 可选：添加一个创建时间戳
    });

    // 4. 注册成功
    success.value = true
    const role = formData.value.role; // 获取刚刚注册的角色

    setTimeout(() => {
      if (role === 'elder') {
        router.push('/account-elder'); // 如果是长者，直接去长者账户页
      } else if (role === 'volunteer') {
        router.push('/volunteer-area'); // 如果是志愿者，直接去志愿者区
      } else {
        router.push('/'); // 其他情况（或默认）去首页
      }
    }, 2000);
    // setTimeout(() => {
    //   router.push('/login') // 或直接跳转到用户主页
    // }, 2000)

  } catch (error) {
    // 5. 处理 Firebase 返回的错误
    switch (error.code) {
      case 'auth/email-already-in-use':
        globalError.value = 'This email address is already in use.'
        break;
      case 'auth/invalid-email':
        globalError.value = 'The email address is not valid.'
        break;
      case 'auth/weak-password':
        globalError.value = 'The password is too weak.'
        break;
      default:
        globalError.value = 'An unexpected error occurred. Please try again.'
    }
    console.error("Firebase registration error:", error.message);
  }
}


</script>

<style scoped>
.bg-dark {
  background: linear-gradient(135deg, #111 0%, #333 100%);
}
</style>
