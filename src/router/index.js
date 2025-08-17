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

import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config'; // 确保路径正确


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

// 辅助函数：使用 Promise 获取当前 Firebase 用户状态
const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const removeListener = onAuthStateChanged(
      getAuth(),
      (user) => {
        removeListener(); // 获取到状态后立即移除监听器
        resolve(user);
      },
      reject
    );
  });
};

// 新的、异步的路由导航守卫
router.beforeEach(async (to, from, next) => {
  // 1. 判断目标路由是否需要认证
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  // 2. 获取当前的 Firebase 登录用户
  const firebaseUser = await getCurrentUser();

  if (requiresAuth) {
    // ---- 情况 A: 页面需要登录 ----
    if (!firebaseUser) {
      // 用户未登录，强制跳转到登录页
      return next('/login');
    }

    // 用户已登录，现在检查角色权限
    const requiredRole = to.meta.role;
    if (requiredRole) {
      // 如果这个路由需要特定的角色...
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists() && userDoc.data().role === requiredRole) {
        // 用户角色匹配，放行
        return next();
      } else {
        // 用户角色不匹配，或数据库中没有该用户的文档
        // 将他们重定向到一个安全的默认页面，比如首页
        return next('/');
      }
    } else {
      // 页面需要登录，但对角色没有要求，直接放行
      return next();
    }

  } else {
    // ---- 情况 B: 页面不需要登录，直接放行 ----
    return next();
  }
});
// // Routing navigation guard
// router.beforeEach((to, from, next) => {
//   const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
//   const currentUser = JSON.parse(localStorage.getItem('currentUser'))

//   if (to.meta.requiresAuth) {
//     if (!isAuthenticated || !currentUser) {
//       return next('/login') // Not logged in
//     }

//     // Check role
//     if (to.meta.role && currentUser.role !== to.meta.role) {
//       return next('/') // Logged in but role mismatch, redirect to home
//     }
//   }

//   next()
// })



export default router
