// src/types/index.ts —— 全局类型定义中心

// 工单状态（字面量联合类型：只能是这三个值之一）
export type OrderStatus = '待处理' | '处理中' | '已完成'

// 工单
export interface Order {
  order_id: string
  customer_name: string
  address: string
  status: OrderStatus
  engineers: string[]
  created_at: string
}

// 工单列表查询参数
export interface OrderListParams {
  status?: string
  keyword?: string
}

// 创建工单参数
export interface OrderCreateParams {
  order_id: string
  customer_name: string
  address: string
  status?: OrderStatus // 后端 schema 接受，可选，默认'待处理'
  engineer_names?: string[]
}

// 更新工单参数（全是可选——更新时只传要改的）
export interface OrderUpdateParams {
  customer_name?: string
  address?: string
  status?: OrderStatus
  engineer_names?: string[]
}

// 用户
export interface User {
  id: number
  username: string
  email?: string
  role: 'user' | 'admin'
  is_active: number
  created_at: string
}

// 登录参数
export interface LoginParams {
  username: string
  password: string
}

// 注册参数
export interface RegisterParams {
  username: string
  password: string
  email?: string
}

// /token 接口响应
export interface TokenResponse {
  access_token: string
  token_type: string
  role: 'user' | 'admin'
}

// 统计数据响应
export interface StatsResponse {
  total: number
  pending: number
  processing: number
  completed: number
}
