<template>
  <div>
    <h2>📊 工单统计</h2>

    <el-row :gutter="16" style="margin-top: 20px;">
      <el-col :span="6">
        <el-card>
          <div style="text-align: center;">
            <div style="font-size: 32px; color: #409EFF;">{{ stats.total || 0 }}</div>
            <div>总工单</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div style="text-align: center;">
            <div style="font-size: 32px; color: #E6A23C;">{{ stats.pending || 0 }}</div>
            <div>待处理</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div style="text-align: center;">
            <div style="font-size: 32px; color: #409EFF;">{{ stats.processing || 0 }}</div>
            <div>处理中</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div style="text-align: center;">
            <div style="font-size: 32px; color: #67C23A;">{{ stats.completed || 0 }}</div>
            <div>已完成</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 这里后续可以加图表 -->
    <el-card style="margin-top: 20px;">
      <div style="color: #909399; text-align: center; padding: 40px 0;">
        📈 图表功能将在后续课程中集成（如 ECharts）
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const stats = ref({})

const fetchStats = async () => {
  try {
    const response = await axios.get('/api/stats')
    stats.value = response.data
  } catch (err) {
    console.error('获取统计数据失败：', err)
  }
}

onMounted(fetchStats)
</script>