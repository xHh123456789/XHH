// stores/user.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginApi, register as registerApi } from '@/api/auth'
import { ElMessage } from 'element-plus'
import type { RegisterParams } from '@/types'

// 角色类型（复用 types 里的思想，本地起别名）
type UserRole = 'user' | 'admin'

export const useUserStore = defineStore('user', () => {
  // ========== State ==========
  // localStorage 返回 string | null，用断言 + 兜底默认值
  const token = ref(localStorage.getItem('token') || '')
  const username = ref(localStorage.getItem('username') || '')
  const role = ref<UserRole>((localStorage.getItem('role') as UserRole) || 'user')

  // ========== Getters（computed 自动推断返回 boolean，不用标）==========
  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => role.value === 'admin')

  // ========== Actions ==========
  const login = async (usernameVal: string, passwordVal: string): Promise<boolean> => {
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
      ElMessage.error(
        (error as { response?: { data?: { detail?: string } } }).response?.data?.detail ||
          '登录失败'
      )
      return false
    }
  }

  const register = async (userData: RegisterParams): Promise<boolean> => {
    try {
      await registerApi(userData)
      ElMessage.success('注册成功，请登录 🎉')
      return true
    } catch (error) {
      ElMessage.error(
        (error as { response?: { data?: { detail?: string } } }).response?.data?.detail ||
          '注册失败'
      )
      return false
    }
  }

  const logout = (): void => {
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
