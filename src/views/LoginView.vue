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
const isLoading = ref(false) // Add a loading state
const router = useRouter()

async function handleLogin() {
  error.value = null
  isLoading.value = true

  try {
    let email = identifier.value

    // 1. Determine if user input is email or username
    //    Simple check: if contains '@' symbol, it's an email
    if (!identifier.value.includes('@')) {
      // If it's a username, query Firestore to find corresponding email
      const usersRef = collection(db, "users")
      const q = query(usersRef, where("username", "==", identifier.value))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        throw new Error("auth/user-not-found") // Throw error for catch block to handle
      }
      
      // Get email from the first user document found
      email = querySnapshot.docs[0].data().email
    }

    // 2. Use email and password for Firebase authentication
    const userCredential = await signInWithEmailAndPassword(auth, email, password.value)
    const user = userCredential.user

    // 3. Get user role information from Firestore
    const userDocRef = doc(db, "users", user.uid)
    const userDoc = await getDoc(userDocRef)

    if (!userDoc.exists()) {
      throw new Error("User data not found in database.")
    }

    const userData = userDoc.data()

    // 4. Redirect based on user role
    // Note: No need to manually set localStorage.setItem('isAuthenticated', 'true')
    // Firebase automatically manages user authentication state
    if (userData.role === 'admin') {
      router.push('/admin-panel')
    } else if (userData.role === 'elder') {
      router.push('/account-elder')
    } else if (userData.role === 'volunteer') {
      router.push('/volunteer-area')
    } else {
      router.push('/') // Default redirect
    }

  } catch (err) {
    // 5. Handle Firebase authentication errors
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
    isLoading.value = false // End loading state regardless of success or failure
  }
}

function goToRegister() {
  router.push('/register')
}

</script>
