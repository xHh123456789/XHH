import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const username = ref(localStorage.getItem('username') || '')
  const role = ref(localStorage.getItem('role') || 'user')  // ✅ 新增

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => role.value === 'admin')  // ✅ 新增

  const login = async (usernameVal, passwordVal) => {
    try {
      const formData = new FormData()
      formData.append('username', usernameVal)
      formData.append('password', passwordVal)

      const response = await axios.post('/api/token', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      const { access_token, role: userRole } = response.data  // ✅ 解构 role
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
    logout
  }
})