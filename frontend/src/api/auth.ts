import request from '@/utils/request'
import type { TokenResponse, User } from '@/types'

// 用户登录
export const login = (username: string, password: string): Promise<TokenResponse> => {
  const formData = new FormData()
  formData.append('username', username)
  formData.append('password', password)
  return request.post<unknown, TokenResponse>('/token', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// 用户注册
export const register = (data: {
  username: string
  password: string
  email?: string
}): Promise<{ message: string }> => {
  return request.post<unknown, { message: string }>('/register', data)
}

// 获取当前用户信息
export const getCurrentUser = (): Promise<User> => {
  return request.get<unknown, User>('/users/me')
}
