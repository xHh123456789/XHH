import request from '@/utils/request'

// 获取工单统计数据
export const getStats = () => {
  return request.get('/stats')
}

// 获取近7天每日数据
export const getDailyStats = () => {
  return request.get('/stats/daily')
}