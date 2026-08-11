// src/utils/request.js
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user' // 👈 必须导入 store

// 从环境变量读取 baseURL
const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'

const request = axios.create({
  baseURL,
  timeout: 10000, // 10秒超时
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器（在这里统一注入 Token）
request.interceptors.request.use(
  (config) => {
    const userStore = useUserStore() // 👈 获取当前用户的 store 状态
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}` // 👈 正式注入 Token
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器（统一处理错误）
request.interceptors.response.use(
  (response) => {
    return response.data // 直接返回 data，少写一层 .data
  },
  (error) => {
    const message = error.response?.data?.detail || error.message || '网络错误'
    ElMessage.error(message)
    return Promise.reject(error)
  }
)

export default request