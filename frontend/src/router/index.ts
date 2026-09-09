// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'

// ✅ 动态导入（路由懒加载，按需加载页面组件）
const OrderList = () => import('@/views/OrderList.vue')
const Stats = () => import('@/views/Stats.vue')
const Login = () => import('@/views/Login.vue')
const Register = () => import('@/views/Register.vue')

// ========== 路由配置（RouteRecordRaw：每条路由的"户口本"类型）==========
const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false } // 不需要登录
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    redirect: '/orders'
  },
  {
    path: '/orders',
    name: 'OrderList',
    component: OrderList,
    meta: { requiresAuth: true } // 需要登录
  },
  {
    path: '/stats',
    name: 'Stats',
    component: Stats,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// ========== 路由守卫（to/from/next 的类型 vue-router 自动推断，不用手写）==========
router.beforeEach((to, _from, next) => {
  const userStore = useUserStore()

  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next('/login')
  } else {
    next()
  }
})
export default router
