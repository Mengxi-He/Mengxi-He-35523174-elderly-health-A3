<template>
  <div class="container-fluid mt-4">
    <!-- Skip link for keyboard navigation -->
    <a href="#main-content" class="skip-link">Skip to main content</a>
    
    <main id="main-content">
      <h1 class="visually-hidden">Elder Account Dashboard</h1>
      
      <div class="row">
        <!-- Left sidebar -->
        <aside class="col-md-3 mb-3" aria-labelledby="navigation-heading">
          <h2 id="navigation-heading" class="visually-hidden">Account Navigation</h2>
          <nav aria-label="Account sections">
            <div class="list-group" role="tablist">
              <button
                class="list-group-item list-group-item-action"
                :class="{ active: currentTab === 'profile' }"
                @click="currentTab = 'profile'"
                type="button"
                role="tab"
                :aria-selected="currentTab === 'profile'"
                aria-controls="profile-panel"
                id="profile-tab"
              >
                <span aria-hidden="true">👤</span> Personal Info
              </button>
              <button
                class="list-group-item list-group-item-action"
                :class="{ active: currentTab === 'activities' }"
                @click="currentTab = 'activities'"
                type="button"
                role="tab"
                :aria-selected="currentTab === 'activities'"
                aria-controls="activities-panel"
                id="activities-tab"
              >
                <span aria-hidden="true">🎯</span> My Joined Activities
              </button>

              <button
                class="list-group-item list-group-item-action"
                :class="{ active: currentTab === 'equipment' }"
                @click="currentTab = 'equipment'"
                type="button"
                role="tab"
                :aria-selected="currentTab === 'equipment'"
                aria-controls="equipment-panel"
                id="equipment-tab"
              >
                <span aria-hidden="true">🩺</span> Equipment Borrowing
              </button>

              <button
                class="list-group-item list-group-item-action"
                :class="{ active: currentTab === 'settings' }"
                @click="currentTab = 'settings'"
                type="button"
                role="tab"
                :aria-selected="currentTab === 'settings'"
                aria-controls="settings-panel"
                id="settings-tab"
              >
                <span aria-hidden="true">⚙️</span> Settings
              </button>
            </div>
          </nav>
        </aside>

        <!-- Right content display area -->
        <section class="col-md-9">
          <div 
            v-if="currentTab === 'profile'" 
            role="tabpanel" 
            id="profile-panel" 
            aria-labelledby="profile-tab"
            tabindex="0"
          >
            <h2><span aria-hidden="true">👤</span> Personal Information</h2>
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
            <div v-else aria-live="polite">
              <div class="spinner-border" role="status" aria-label="Loading user data">
                <span class="visually-hidden">Loading...</span>
              </div>
              <span class="ms-2">Loading user data...</span>
            </div>
          </div>

          <div 
            v-if="currentTab === 'activities'" 
            role="tabpanel" 
            id="activities-panel" 
            aria-labelledby="activities-tab"
            tabindex="0"
          >
            <h2><span aria-hidden="true">🎯</span> My Joined Activities</h2>
            <div v-if="activities.length === 0" class="alert alert-info" role="status">
              <span aria-hidden="true">📝</span> No joined activity records yet.
            </div>
            <div v-else>
              <ul class="list-group" role="list">
                <li class="list-group-item" v-for="(a, index) in activities" :key="index" role="listitem">
                  <strong>{{ a.title }}</strong><br>
                  <span class="text-muted">
                    <span aria-label="Date">{{ a.date }}</span> at 
                    <span aria-label="Location">{{ a.location }}</span>
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div 
            v-if="currentTab === 'equipment'" 
            role="tabpanel" 
            id="equipment-panel" 
            aria-labelledby="equipment-tab"
            tabindex="0"
          >
            <h2><span aria-hidden="true">🩺</span> Borrowed Medical Equipment</h2>
            <div v-if="equipments.length === 0" class="alert alert-info" role="status">
              <span aria-hidden="true">📋</span> No equipment borrowed yet.
            </div>
            <div v-else>
              <ul class="list-group" role="list">
                <li class="list-group-item" v-for="(e, index) in equipments" :key="index" role="listitem">
                  <strong>{{ e.name }}</strong><br>
                  <span class="text-muted">Borrowed on {{ e.date }}</span>
                </li>
              </ul>
            </div>
          </div>

          <div 
            v-if="currentTab === 'settings'" 
            role="tabpanel" 
            id="settings-panel" 
            aria-labelledby="settings-tab"
            tabindex="0"
          >
            <h2><span aria-hidden="true">⚙️</span> Account Settings</h2>

            <form @submit.prevent="updateSettings" novalidate aria-labelledby="settings-form-heading">
              <h3 id="settings-form-heading" class="visually-hidden">Update Account Information</h3>
              
              <div class="mb-3">
                <label for="new-email" class="form-label">New Email</label>
                <input 
                  id="new-email"
                  type="email" 
                  class="form-control" 
                  v-model="newEmail"
                  autocomplete="email"
                  aria-describedby="email-help"
                />
                <div id="email-help" class="form-text">Leave blank to keep current email</div>
              </div>

              <div class="mb-3">
                <label for="new-password" class="form-label">New Password</label>
                <input 
                  id="new-password"
                  type="password" 
                  class="form-control" 
                  v-model="newPassword"
                  autocomplete="new-password"
                  aria-describedby="password-help"
                />
                <div id="password-help" class="form-text">
                  Must be 8+ characters with uppercase, lowercase, number, and special character
                </div>
              </div>

              <button 
                type="submit" 
                class="btn btn-primary"
                :disabled="isUpdating"
                :aria-label="isUpdating ? 'Updating account information' : 'Update account information'"
              >
                <span v-if="isUpdating" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                {{ isUpdating ? 'Updating...' : 'Update' }}
              </button>
              
              <div class="mt-3">
                <p class="text-muted">
                  <span aria-hidden="true">ℹ️</span> Note: You will be logged out after updating.
                </p>
                
                <div 
                  v-if="updateMessage" 
                  class="alert mt-2" 
                  :class="updateSuccess ? 'alert-success' : 'alert-danger'"
                  role="alert"
                  aria-live="polite"
                >
                  {{ updateMessage }}
                </div>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router';

// Firebase services for authentication and database operations
import { getAuth, updateEmail, updatePassword, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';

const router = useRouter();
const auth = getAuth();

const currentTab = ref('profile')
const user = ref(null)

const activities = ref([])
const equipments = ref([])

// Settings form fields
const newEmail = ref('')
const newPassword = ref('')
const updateMessage = ref('')
const updateSuccess = ref(false)
const isUpdating = ref(false)

// Email and password validation functions
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
    // Get user information from Auth and Firestore
    const userDocRef = doc(db, 'users', currentUser.uid);
    const userDoc = await getDoc(userDocRef);

    if(userDoc.exists()) {
      user.value = { uid: currentUser.uid, email: currentUser.email, ...userDoc.data() };
    } else {
      console.error("User data not found in Firestore!");
      return;
    }

    // Get user's joined activities from Firestore
    const activitiesRef = collection(db, "activities");
    const q = query(activitiesRef, where("registeredUsers", "array-contains", currentUser.uid));
    const querySnapshot = await getDocs(q);
    
    activities.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  } else {
    console.log("No user is logged in. Redirecting to login.");
    router.push('/login');
  }

  // Mock equipment data
  equipments.value = [
    { name: 'Walker', date: '2025-06-28' },
    { name: 'Blood Pressure Monitor', date: '2025-07-02' }
  ];
});

// Update user email and password settings
async function updateSettings() {
  updateMessage.value = '';
  isUpdating.value = true;
  const currentUser = auth.currentUser;
  if (!currentUser) {
    isUpdating.value = false;
    return;
  }

  const trimmedEmail = newEmail.value.trim();
  const trimmedPassword = newPassword.value.trim();
  const promises = [];

  // Input validation
  if (!trimmedEmail && !trimmedPassword) {
    updateSuccess.value = false;
    updateMessage.value = '❗ You changed nothing.';
    isUpdating.value = false;
    return;
  }
  if (trimmedEmail && !validateEmailFormat(trimmedEmail)) {
    updateSuccess.value = false;
    updateMessage.value = '❌ Invalid email format.';
    isUpdating.value = false;
    return;
  }
  if (trimmedPassword && !validatePasswordFormat(trimmedPassword)) {
    updateSuccess.value = false;
    updateMessage.value = '❌ Password must be 8+ chars with uppercase, lowercase, number, and special character.';
    isUpdating.value = false;
    return;
  }
  if (!confirm('Are you sure you want to update? You will be logged out.')) {
    isUpdating.value = false;
    return;
  }

  // Prepare update operations
  if (trimmedEmail && trimmedEmail !== currentUser.email) {
    promises.push(updateEmail(currentUser, trimmedEmail));
    const userDocRef = doc(db, 'users', currentUser.uid);
    promises.push(updateDoc(userDocRef, { email: trimmedEmail }));
  }

  if (trimmedPassword) {
    promises.push(updatePassword(currentUser, trimmedPassword));
  }

  // Execute all update operations
  try {
    await Promise.all(promises);

    updateSuccess.value = true;
    updateMessage.value = '✅ Info updated successfully! Please log in again.';
    
    // Sign out user after successful update
    await signOut(auth);
    router.push('/login');

  } catch (error) {
    updateSuccess.value = false;
    // Handle common Firebase errors
    if (error.code === 'auth/requires-recent-login') {
      updateMessage.value = '❌ This operation is sensitive and requires recent authentication. Please log out and log back in before trying again.';
    } else {
      updateMessage.value = `❌ An error occurred: ${error.message}`;
    }
    console.error("Error updating settings:", error);
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
  border-color: #0d6efd;
  color: #fff;
}

/* Form accessibility - WCAG 1.3.1 */
.form-label {
  font-weight: 500;
  color: #212529;
}

.form-control:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

/* Tab panel focus */
[role="tabpanel"]:focus {
  outline: 2px solid #0d6efd;
  outline-offset: 4px;
}

/* Ensure sufficient color contrast - WCAG 1.4.3 */
.card {
  border: 1px solid #dee2e6;
}

.text-muted {
  color: #6c757d !important;
}

/* Loading state accessibility */
.spinner-border {
  width: 1rem;
  height: 1rem;
}

/* Button accessibility */
.btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}
</style>

