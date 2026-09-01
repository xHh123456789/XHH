// src/api/order.js
import request from '@/utils/request'

// 获取工单列表
export const getOrders = params => {
  return request.get('/orders', { params })
}

// 获取单个工单
export const getOrder = orderId => {
  return request.get(`/orders/${orderId}`)
}

// 创建工单
export const createOrder = data => {
  return request.post('/orders', data)
}

// 更新工单
export const updateOrder = (orderId, data) => {
  return request.put(`/orders/${orderId}`, data)
}

// 删除工单
export const deleteOrder = orderId => {
  return request.delete(`/orders/${orderId}`)
}
