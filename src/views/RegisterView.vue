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

function handleRegister() {
  validateEmail(true)
  validateUsername(true)
  validatePassword(true)
  validateConfirmPassword(true)
  validateRole(true)

  if (Object.values(errors.value).some((e) => e)) {
    globalError.value = 'Please fix the errors above.'
    return
  }

  const users = JSON.parse(localStorage.getItem('users') || '[]')
  const duplicate = users.find(
    (u) => u.username === formData.value.username || u.email === formData.value.email
  )

  if (duplicate) {
    globalError.value = 'Username or email already exists.'
    return
  }

  users.push({
    username: formData.value.username,
    email: formData.value.email,
    password: formData.value.password,
    role: formData.value.role,
  })

  localStorage.setItem('users', JSON.stringify(users))
  globalError.value = ''
  success.value = true

  setTimeout(() => {
    router.push('/login')
  }, 2000)
}
</script>

<style scoped>
.bg-dark {
  background: linear-gradient(135deg, #111 0%, #333 100%);
}
</style>
