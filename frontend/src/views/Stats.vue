<template>
  <div>
    <h2 style="margin-bottom: 20px;">
      📊 工单统计
    </h2>

    <!-- 统计卡片 -->
    <el-row :gutter="16">
      <el-col :span="6">
        <el-card>
          <div style="text-align: center;">
            <div style="font-size: 32px; color: #409EFF;">
              {{ stats.total || 0 }}
            </div>
            <div style="color: #909399; font-size: 14px;">
              总工单
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div style="text-align: center;">
            <div style="font-size: 32px; color: #E6A23C;">
              {{ stats.pending || 0 }}
            </div>
            <div style="color: #909399; font-size: 14px;">
              待处理
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div style="text-align: center;">
            <div style="font-size: 32px; color: #409EFF;">
              {{ stats.processing || 0 }}
            </div>
            <div style="color: #909399; font-size: 14px;">
              处理中
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div style="text-align: center;">
            <div style="font-size: 32px; color: #67C23A;">
              {{ stats.completed || 0 }}
            </div>
            <div style="color: #909399; font-size: 14px;">
              已完成
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row
      :gutter="16"
      style="margin-top: 20px;"
    >
      <el-col :span="12">
        <el-card>
          <div style="font-size: 16px; font-weight: 600; margin-bottom: 12px;">
            工单状态分布
          </div>
          <BaseChart
            :option="pieOption"
            height="350px"
          />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <div style="font-size: 16px; font-weight: 600; margin-bottom: 12px;">
            近7天工单趋势
          </div>
          <BaseChart
            :option="lineOption"
            height="350px"
          />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import BaseChart from '@/components/BaseChart.vue'

const stats = ref({})
const dailyStats = ref([])

// 饼图配置
const pieOption = computed(() => ({
  tooltip: { trigger: 'item' },
  legend: { orient: 'vertical', right: 10, top: 'center' },
  series: [
    {
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: { show: true, formatter: '{b}\n{d}%' },
      emphasis: {
        label: { show: true, fontSize: 16, fontWeight: 'bold' }
      },
      data: [
        { value: stats.value.pending || 0, name: '待处理', itemStyle: { color: '#E6A23C' } },
        { value: stats.value.processing || 0, name: '处理中', itemStyle: { color: '#409EFF' } },
        { value: stats.value.completed || 0, name: '已完成', itemStyle: { color: '#67C23A' } }
      ]
    }
  ]
}))

// 折线图配置
const lineOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  xAxis: {
    type: 'category',
    data: dailyStats.value.map(item => item.date) || []
  },
  yAxis: {
    type: 'value',
    minInterval: 1
  },
  series: [
    {
      data: dailyStats.value.map(item => item.count) || [],
      type: 'line',
      smooth: true,
      lineStyle: { color: '#409EFF', width: 3 },
      areaStyle: {
        color: 'rgba(64, 158, 255, 0.2)'
      },
      symbol: 'circle',
      symbolSize: 8
    }
  ]
}))

// 获取统计数据
const fetchStats = async () => {
  try {
    const response = await axios.get('/api/stats')
    stats.value = response.data
  } catch (error) {
    console.error('获取统计数据失败：', error)
  }
}

// 获取近7天每日工单数量
const fetchDailyStats = async () => {
  try {
    const response = await axios.get('/api/stats/daily')
    dailyStats.value = response.data
  } catch (error) {
    console.error('获取每日统计失败：', error)
    // 模拟数据（开发时使用）
    dailyStats.value = [
      { date: '08-12', count: 3 },
      { date: '08-13', count: 5 },
      { date: '08-14', count: 2 },
      { date: '08-15', count: 7 },
      { date: '08-16', count: 4 },
      { date: '08-17', count: 6 },
      { date: '08-18', count: 8 }
    ]
  }
}

onMounted(() => {
  fetchStats()
  fetchDailyStats()
})
</script>