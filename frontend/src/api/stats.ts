import request from '@/utils/request'
import type { StatsResponse, DailyStat } from '@/types'

// 获取工单统计数据
export const getStats = (): Promise<StatsResponse> => {
  return request.get<unknown, StatsResponse>('/stats')
}

// 获取近7天每日数据
export const getDailyStats = (): Promise<DailyStat[]> => {
  return request.get<unknown, DailyStat[]>('/stats/daily')
}
