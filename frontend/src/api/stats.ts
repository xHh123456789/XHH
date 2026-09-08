import request from '@/utils/request'
import type { StatsResponse } from '@/types'

// 每日统计项（后端返回 [{date: "09-01", count: 5}, ...]）
export interface DailyStat {
  date: string
  count: number
}

// 获取工单统计数据
export const getStats = (): Promise<StatsResponse> => {
  return request.get<unknown, StatsResponse>('/stats')
}

// 获取近7天每日数据
export const getDailyStats = (): Promise<DailyStat[]> => {
  return request.get<unknown, DailyStat[]>('/stats/daily')
}
