<template>
  <!-- Skip link for keyboard navigation - WCAG 2.4.1 -->
  <a href="#main-content" class="skip-link">Skip to main content</a>
  
  <div class="container-fluid mt-4">
    <!-- Page header with proper heading hierarchy - WCAG 1.3.1 -->
    <header>
      <h1 class="visually-hidden">Volunteer Account Dashboard</h1>
    </header>

    <div class="row" role="main">
      <!-- Left Sidebar Navigation - WCAG 2.4.3 -->
      <nav class="col-md-3 mb-3" aria-label="Account navigation">
        <h2 class="visually-hidden">Account Sections</h2>
        <div 
          class="list-group" 
          role="tablist" 
          aria-label="Account management tabs"
        >
          <button
            class="list-group-item list-group-item-action"
            :class="{ active: currentTab === 'profile' }"
            @click="currentTab = 'profile'"
            @keydown="handleKeyDown"
            role="tab"
            :aria-selected="currentTab === 'profile'"
            aria-controls="profile-panel"
            tabindex="0"
            data-tab="profile"
          >
            <span aria-hidden="true">👤</span> Personal Info
          </button>
          <button
            class="list-group-item list-group-item-action"
            :class="{ active: currentTab === 'activities' }"
            @click="currentTab = 'activities'"
            @keydown="handleKeyDown"
            role="tab"
            :aria-selected="currentTab === 'activities'"
            aria-controls="activities-panel"
            tabindex="0"
            data-tab="activities"
          >
            <span aria-hidden="true">🙋</span> Joined Volunteer Activities
          </button>
          <button
            class="list-group-item list-group-item-action"
            :class="{ active: currentTab === 'settings' }"
            @click="currentTab = 'settings'"
            @keydown="handleKeyDown"
            role="tab"
            :aria-selected="currentTab === 'settings'"
            aria-controls="settings-panel"
            tabindex="0"
            data-tab="settings"
          >
            <span aria-hidden="true">⚙️</span> Settings
          </button>
        </div>
      </nav>

      <!-- Right Content Panel - WCAG 1.3.1 -->
      <main class="col-md-9" id="main-content">
        <!-- Personal Information Tab - WCAG 2.4.6 -->
        <section 
          v-if="currentTab === 'profile'"
          id="profile-panel"
          role="tabpanel"
          aria-labelledby="profile-tab"
          tabindex="0"
        >
          <h2>
            <span aria-hidden="true">👤</span> Personal Information
          </h2>
          <div v-if="user" class="card">
            <div class="card-body">
              <dl class="row">
                <dt class="col-sm-3">Username:</dt>
                <dd class="col-sm-9">{{ user.username }}</dd>
                
                <dt class="col-sm-3">Email:</dt>
                <dd class="col-sm-9">{{ user.email }}</dd>
                
                <dt class="col-sm-3">Role:</dt>
                <dd class="col-sm-9">{{ user.role }}</dd>
              </dl>
            </div>
          </div>
          <div v-else class="d-flex align-items-center" aria-live="polite">
            <div class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></div>
            <span>Loading user data...</span>
          </div>
        </section>

        <!-- Volunteer Activities Tab - WCAG 2.4.6 -->
        <section 
          v-if="currentTab === 'activities'"
          id="activities-panel"
          role="tabpanel"
          aria-labelledby="activities-tab"
          tabindex="0"
        >
          <h2>
            <span aria-hidden="true">🙋</span> My Joined Volunteer Activities
          </h2>
          
          <div v-if="activities.length === 0" class="alert alert-info" role="status">
            <p class="mb-0">No joined volunteer activity records yet.</p>
          </div>
          
          <div v-else class="card">
            <div class="card-header">
              <h3 class="card-title h5 mb-0">Activity List</h3>
            </div>
            <div class="card-body">
              <ul class="list-group list-group-flush" role="list">
                <li 
                  class="list-group-item d-flex justify-content-between align-items-start" 
                  v-for="activity in activities" 
                  :key="activity.id"
                  role="listitem"
                >
                  <div class="ms-2 me-auto">
                    <div class="fw-bold">{{ activity.title }}</div>
                    <small class="text-muted">
                      <time :datetime="activity.date">{{ activity.date }}</time>
                      at {{ activity.location }}
                    </small>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <!-- Settings Tab - WCAG 2.4.6 -->
        <section 
          v-if="currentTab === 'settings'"
          id="settings-panel"
          role="tabpanel"
          aria-labelledby="settings-tab"
          tabindex="0"
        >
          <h2>
            <span aria-hidden="true">⚙️</span> Account Settings
          </h2>

          <form @submit.prevent="updateSettings" class="card" novalidate>
            <div class="card-body">
              <div class="mb-3">
                <label for="new-email" class="form-label">
                  New Email
                  <span class="text-muted">(optional)</span>
                </label>
                <input 
                  type="email" 
                  class="form-control" 
                  id="new-email"
                  v-model="newEmail"
                  autocomplete="email"
                  aria-describedby="email-help"
                  :aria-invalid="emailError ? 'true' : 'false'"
                />
                <div id="email-help" class="form-text">
                  Enter a new email address to update your account.
                </div>
                <div v-if="emailError" class="invalid-feedback d-block" role="alert">
                  {{ emailError }}
                </div>
              </div>

              <div class="mb-3">
                <label for="new-password" class="form-label">
                  New Password
                  <span class="text-muted">(optional)</span>
                </label>
                <input 
                  type="password" 
                  class="form-control" 
                  id="new-password"
                  v-model="newPassword"
                  autocomplete="new-password"
                  aria-describedby="password-help"
                  :aria-invalid="passwordError ? 'true' : 'false'"
                />
                <div id="password-help" class="form-text">
                  Password must be at least 8 characters with uppercase, lowercase, number, and special character.
                </div>
                <div v-if="passwordError" class="invalid-feedback d-block" role="alert">
                  {{ passwordError }}
                </div>
              </div>

              <button 
                type="submit" 
                class="btn btn-primary"
                :disabled="isUpdating"
                :aria-describedby="isUpdating ? 'updating-status' : undefined"
              >
                <span v-if="isUpdating" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                {{ isUpdating ? 'Updating...' : 'Update Settings' }}
              </button>
              
              <div v-if="isUpdating" id="updating-status" class="visually-hidden" aria-live="polite">
                Updating account settings...
              </div>

              <div class="alert alert-info mt-3" role="note">
                <strong>Note:</strong> You will be logged out after updating your settings.
              </div>

              <div v-if="updateMessage && !updateSuccess" class="alert alert-danger mt-3" role="alert">
                {{ updateMessage }}
              </div>
              <div v-if="updateMessage && updateSuccess" class="alert alert-success mt-3" role="status">
                {{ updateMessage }}
              </div>
            </div>
          </form>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router';

// Firebase services for authentication and database operations
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
const isUpdating = ref(false)

// Form validation states - WCAG 3.3.1
const emailError = computed(() => {
  if (!newEmail.value.trim()) return ''
  return validateEmailFormat(newEmail.value.trim()) ? '' : 'Please enter a valid email address.'
})

const passwordError = computed(() => {
  if (!newPassword.value.trim()) return ''
  return validatePasswordFormat(newPassword.value.trim()) ? '' : 'Password must be at least 8 characters with uppercase, lowercase, number, and special character.'
})

// Email and password validators - WCAG 3.3.3
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

// Keyboard navigation for tabs - consistent with AdminPanelView
function handleKeyDown(event) {
  const tabs = ['profile', 'activities', 'settings'];
  const currentIndex = tabs.indexOf(currentTab.value);
  
  switch (event.key) {
    case 'ArrowRight':
    case 'ArrowDown':
      event.preventDefault();
      const nextIndex = (currentIndex + 1) % tabs.length;
      currentTab.value = tabs[nextIndex];
      // Focus the next tab button
      document.querySelector(`[data-tab="${tabs[nextIndex]}"]`)?.focus();
      break;
      
    case 'ArrowLeft':
    case 'ArrowUp':
      event.preventDefault();
      const prevIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
      currentTab.value = tabs[prevIndex];
      // Focus the previous tab button
      document.querySelector(`[data-tab="${tabs[prevIndex]}"]`)?.focus();
      break;
      
    case 'Home':
      event.preventDefault();
      currentTab.value = tabs[0];
      document.querySelector(`[data-tab="${tabs[0]}"]`)?.focus();
      break;
      
    case 'End':
      event.preventDefault();
      currentTab.value = tabs[tabs.length - 1];
      document.querySelector(`[data-tab="${tabs[tabs.length - 1]}"]`)?.focus();
      break;
  }
}

// Load user data and volunteer activities from Firebase
onMounted(async () => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    router.push('/login');
    return;
  }

  try {
    // Get user information from Firestore
    const userDocRef = doc(db, 'users', currentUser.uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      user.value = { uid: currentUser.uid, email: currentUser.email, ...userDoc.data() };
    } else {
      console.error("User data not found in Firestore!");
      return;
    }

    // Get volunteer activities that this user has joined
    const activitiesRef = collection(db, "volunteer_activities");
    const q = query(activitiesRef, where("registeredVolunteers", "array-contains", currentUser.uid));
    const querySnapshot = await getDocs(q);
    activities.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error loading user data:", error);
  }
});

// Update user email and password settings - WCAG 3.3.4
async function updateSettings() {
  updateMessage.value = '';
  updateSuccess.value = false;
  isUpdating.value = true;
  
  const currentUser = auth.currentUser;
  if (!currentUser) {
    isUpdating.value = false;
    return;
  }

  const trimmedEmail = newEmail.value.trim();
  const trimmedPassword = newPassword.value.trim();
  const promises = [];

  // Validation logic - WCAG 3.3.1
  if (!trimmedEmail && !trimmedPassword) { 
    updateMessage.value = 'Please enter at least one field to update.';
    isUpdating.value = false;
    return; 
  }
  
  if (trimmedEmail && !validateEmailFormat(trimmedEmail)) { 
    updateMessage.value = 'Please enter a valid email address.';
    isUpdating.value = false;
    return; 
  }
  
  if (trimmedPassword && !validatePasswordFormat(trimmedPassword)) { 
    updateMessage.value = 'Password must be at least 8 characters with uppercase, lowercase, number, and special character.';
    isUpdating.value = false;
    return; 
  }
  
  if (!confirm('Are you sure you want to update? You will be logged out.')) {
    isUpdating.value = false;
    return;
  }

  // Prepare update operations
  try {
    if (trimmedEmail && trimmedEmail !== currentUser.email) {
      promises.push(updateEmail(currentUser, trimmedEmail));
      const userDocRef = doc(db, 'users', currentUser.uid);
      promises.push(updateDoc(userDocRef, { email: trimmedEmail }));
    }
    if (trimmedPassword) {
      promises.push(updatePassword(currentUser, trimmedPassword));
    }

    // Execute updates
    await Promise.all(promises);
    updateSuccess.value = true;
    updateMessage.value = '✅ Info updated successfully! Please log in again.';
    
    // Clear form
    newEmail.value = '';
    newPassword.value = '';
    
    setTimeout(async () => {
      await signOut(auth);
      router.push('/login');
    }, 2000);
    
  } catch (error) {
    updateSuccess.value = false;
    if (error.code === 'auth/requires-recent-login') {
      updateMessage.value = '❌ This operation is sensitive and requires recent authentication. Please log out and log back in, then try again.';
    } else {
      updateMessage.value = `❌ An error occurred: ${error.message}`;
    }
  } finally {
    isUpdating.value = false;
  }
}
</script>

<style scoped>
/* Skip link for keyboard navigation - WCAG 2.4.1 */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: #000;
  color: #fff;
  padding: 8px;
  text-decoration: none;
  z-index: 1000;
  border-radius: 4px;
}

.skip-link:focus {
  top: 6px;
}

/* Tab navigation styling - WCAG 2.4.7 */
.list-group-item {
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.list-group-item:focus {
  outline: 2px solid #0d6efd;
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(13, 110, 253, 0.25);
}

.list-group-item.active {
  background-color: #0d6efd;
  color: white;
  border-color: #0d6efd;
}

/* Card and content styling */
.card {
  border-radius: 10px;
  transition: all 0.2s ease-in-out;
}

.card:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.card:focus-within {
  box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.25);
}

/* Form accessibility - WCAG 1.3.1 */
.form-label {
  font-weight: 500;
  color: #212529;
}

.form-control:focus {
  outline: 2px solid #0d6efd;
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(13, 110, 253, 0.25);
}

/* Button accessibility - WCAG 2.4.7 */
.btn:focus {
  outline: 2px solid #0d6efd;
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(13, 110, 253, 0.25);
}

.btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

/* Tab panel focus */
[role="tabpanel"]:focus {
  outline: 2px solid #0d6efd;
  outline-offset: 4px;
}

/* Definition list styling for better readability */
.row dt {
  font-weight: 600;
  color: #495057;
}

.row dd {
  color: #212529;
}

/* Loading state accessibility */
.spinner-border {
  width: 1rem;
  height: 1rem;
}

/* Activity list styling */
.list-group-flush .list-group-item {
  border-left: 0;
  border-right: 0;
  border-radius: 0;
}

.list-group-flush .list-group-item:first-child {
  border-top: 0;
}

.list-group-flush .list-group-item:last-child {
  border-bottom: 0;
}

/* Alert accessibility */
.alert {
  border-radius: 8px;
}

/* Form validation styling */
.invalid-feedback {
  font-size: 0.875rem;
  font-weight: 500;
}

/* Time element styling */
time {
  font-style: normal;
}
</style>

