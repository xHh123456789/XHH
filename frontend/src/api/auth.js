import request from '@/utils/request'

// 用户登录
export const login = (username, password) => {
  const formData = new FormData()
  formData.append('username', username)
  formData.append('password', password)
  return request.post('/token', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// 用户注册
export const register = data => {
  return request.post('/register', data)
}

// 获取当前用户信息
export const getCurrentUser = () => {
  return request.get('/users/me')
}
