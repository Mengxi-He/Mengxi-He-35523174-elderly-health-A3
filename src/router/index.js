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
    path: '/register', // 注册页面路径
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

// 路由导航守卫
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
  const currentUser = JSON.parse(localStorage.getItem('currentUser'))

  if (to.meta.requiresAuth) {
    if (!isAuthenticated || !currentUser) {
      return next('/login') // 未登录
    }

    // 检查角色是否匹配
    if (to.meta.role && currentUser.role !== to.meta.role) {
      return next('/') // 登录但角色不匹配，跳首页
    }
  }

  next()
})


export default router
