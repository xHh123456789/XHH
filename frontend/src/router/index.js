import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'


// ✅ 改为动态导入（路由懒加载） # （按需加载页面组件）
const OrderList = () => import('@/views/OrderList.vue')
const Stats = () => import('@/views/Stats.vue')
const Login = () => import('@/views/Login.vue')
const Register = () => import('@/views/Register.vue')


const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }  // 不需要登录
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
    meta: { requiresAuth: true }   // 需要登录
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

// ========== 路由守卫 ==========
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  // 如果页面需要登录，但用户未登录 → 跳转到登录页
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next('/login')
  } else {
    next()
  }
})

export default router