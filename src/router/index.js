import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import HomeView from '../views/HomeView.vue'
import AboutView from '../views/AboutView.vue'
import RegisterView from '../views/RegisterView.vue' // 注册页面导入
import ElderAccountView from '../views/ElderAccountView.vue'
import FreeHelpView from '../views/FreeHelpView.vue'
import RecentActivitiesView from '../views/RecentActivitiesView.vue'
import VolunteerAccountView from '../views/VolunteerAccountView.vue'
import VolunteerAreaView from '../views/VolunteerAreaView.vue'
import AdminPanelView from '../views/AdminPanelView.vue'



const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginView
  },
  {
    path: '/register', 
    name: 'Register',
    component: RegisterView
  },
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
  {
    path: '/about',
    name: 'About',
    component: AboutView,

  },
  {
    path: '/account-elder',
    component: ElderAccountView,
    meta: { requiresAuth: true, role: 'elder' }
  },
  {
    path: '/free-help',
    component: FreeHelpView,
    meta: { requiresAuth: true, role: 'elder' }
  },
  {
    path: '/recent-activities',
    component: RecentActivitiesView,
    meta: { requiresAuth: true, role: 'elder' }
  },
  {
    path: '/account-volunteer',
    component: VolunteerAccountView,
    meta: { requiresAuth: true, role: 'volunteer' }
  },
  {
    path: '/volunteer-area',
    component: VolunteerAreaView,
    meta: { requiresAuth: true, role: 'volunteer' }
  },
  {
    path: '/admin-panel',
    component: AdminPanelView,
    meta: { requiresAuth: true, role: 'admin' }
  }

]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Routing navigation guard
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
  const currentUser = JSON.parse(localStorage.getItem('currentUser'))

  if (to.meta.requiresAuth) {
    if (!isAuthenticated || !currentUser) {
      return next('/login') // Not logged in
    }

    // Check role
    if (to.meta.role && currentUser.role !== to.meta.role) {
      return next('/') // Logged in but role mismatch, redirect to home
    }
  }

  next()
})


export default router
