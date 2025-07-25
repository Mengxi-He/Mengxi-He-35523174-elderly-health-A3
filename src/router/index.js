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
    //meta: { requiresAuth: true }
  },
  {
    path: '/account-elder',
    component: ElderAccountView
  },
  {
    path: '/free-help',
    component: FreeHelpView
  },
  {
    path: '/recent-activities',
    component: RecentActivitiesView
  },
  {
    path: '/account-volunteer',
    component: VolunteerAccountView
  },
  {
    path: '/volunteer-area',
    component: VolunteerAreaView
  },
  {
    path: '/admin-panel',
    component: AdminPanelView
  }

]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由导航守卫
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router
