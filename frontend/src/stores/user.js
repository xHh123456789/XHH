import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'

export const useUserStore = defineStore('user', () => {
  // ========== 状态 ==========
  const token = ref(localStorage.getItem('token') || '')
  const username = ref(localStorage.getItem('username') || '')
  const isLoggedIn = computed(() => !!token.value)

  // ========== 登录 ==========
  const login = async (usernameVal, passwordVal) => {
    try {
      // OAuth2 登录需要 form-data 格式
      const formData = new FormData()
      formData.append('username', usernameVal)
      formData.append('password', passwordVal)

      const response = await axios.post('/api/token', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      const { access_token } = response.data
      token.value = access_token
      username.value = usernameVal

      // 存储到 localStorage（持久化）
      localStorage.setItem('token', access_token)
      localStorage.setItem('username', usernameVal)

      ElMessage.success('登录成功 ✅')
      return true
    } catch (error) {
      ElMessage.error(error.response?.data?.detail || '登录失败')
      return false
    }
  }

  // ========== 注册 ==========
  const register = async (userData) => {
    try {
      await axios.post('/api/register', userData)
      ElMessage.success('注册成功，请登录 🎉')
      return true
    } catch (error) {
      ElMessage.error(error.response?.data?.detail || '注册失败')
      return false
    }
  }

  // ========== 登出 ==========
  const logout = () => {
    token.value = ''
    username.value = ''
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    ElMessage.success('已退出登录')
  }

  return {
    token,
    username,
    isLoggedIn,
    login,
    register,
    logout
  }
})