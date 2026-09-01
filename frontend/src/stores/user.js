// stores/user.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginApi, register as registerApi } from '@/api/auth'
import { ElMessage } from 'element-plus'

export const useUserStore = defineStore('user', () => {
  // ========== State ==========
  const token = ref(localStorage.getItem('token') || '')
  const username = ref(localStorage.getItem('username') || '')
  const role = ref(localStorage.getItem('role') || 'user')

  // ========== Getters ==========
  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => role.value === 'admin')

  // ========== Actions ==========
  const login = async (usernameVal, passwordVal) => {
    try {
      const response = await loginApi(usernameVal, passwordVal)
      const { access_token, role: userRole } = response

      token.value = access_token
      username.value = usernameVal
      role.value = userRole || 'user'

      localStorage.setItem('token', access_token)
      localStorage.setItem('username', usernameVal)
      localStorage.setItem('role', userRole || 'user')

      ElMessage.success('登录成功 ✅')
      return true
    } catch (error) {
      ElMessage.error(error.response?.data?.detail || '登录失败')
      return false
    }
  }

  const register = async userData => {
    try {
      await registerApi(userData)
      ElMessage.success('注册成功，请登录 🎉')
      return true
    } catch (error) {
      ElMessage.error(error.response?.data?.detail || '注册失败')
      return false
    }
  }

  const logout = () => {
    token.value = ''
    username.value = ''
    role.value = 'user'
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    localStorage.removeItem('role')
    ElMessage.success('已退出登录')
  }

  return {
    token,
    username,
    role,
    isLoggedIn,
    isAdmin,
    login,
    register,
    logout
  }
})
