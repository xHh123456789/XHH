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

// 创建工单参数（工具类型派生）：
// 必填三项用 Pick 保持必填；status 可选用 Partial 包裹；engineer_names 是后端特有字段用交叉补充
export type OrderCreateParams = Pick<Order, 'order_id' | 'customer_name' | 'address'> &
  Partial<Pick<Order, 'status'>> & {
    engineer_names?: string[]
  }

// 更新工单参数（只允许改这些字段，全部可选）
export type OrderUpdateParams = Partial<Pick<Order, 'customer_name' | 'address' | 'status'>> & {
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

// ========== 每日统计 ==========

// 近7天每日工单数（/stats/daily 响应项）
export interface DailyStat {
  date: string
  count: number
}

// 工单摘要（列表页其实只用到这三个字段渲染）
export type OrderSummary = Pick<Order, 'order_id' | 'customer_name' | 'status'>

// 状态 → 数量 的键值对（将来做统计映射时用）
export type StatusCount = Record<OrderStatus, number>

// 通用 API 响应包装（T = any：不传泛型时默认 any——默认泛型参数知识点）
export interface ApiResponse<T = unknown> {
  data: T
  total?: number
  status?: number
  message?: string
}
