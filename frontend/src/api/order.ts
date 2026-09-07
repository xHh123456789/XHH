// src/api/order.ts
import request from '@/utils/request'
import type { Order, OrderCreateParams, OrderUpdateParams, OrderListParams } from '@/types'

// 获取工单列表
export const getOrders = (params?: OrderListParams): Promise<Order[]> => {
  return request.get<unknown, Order[]>('/orders', { params })
}

// 获取单个工单
export const getOrder = (orderId: string): Promise<Order> => {
  return request.get<unknown, Order>(`/orders/${orderId}`)
}

// 创建工单
export const createOrder = (data: OrderCreateParams): Promise<Order> => {
  return request.post<unknown, Order>('/orders', data)
}

// 更新工单
export const updateOrder = (orderId: string, data: OrderUpdateParams): Promise<Order> => {
  return request.put<unknown, Order>(`/orders/${orderId}`, data)
}

// 删除工单
export const deleteOrder = (orderId: string): Promise<{ message: string }> => {
  return request.delete<unknown, { message: string }>(`/orders/${orderId}`)
}