<template>
  <div ref="chartRef" :style="{ width: '100%', height: height }" />
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  // 图表配置项
  option: {
    type: Object,
    required: true
  },
  // 图表高度
  height: {
    type: String,
    default: '400px'
  }
})

const chartRef = ref(null)
let chartInstance = null

// 初始化图表
const initChart = () => {
  if (chartRef.value) {
    chartInstance = echarts.init(chartRef.value)
    chartInstance.setOption(props.option)
  }
}

// 监听 option 变化，更新图表
watch(
  () => props.option,
  newOption => {
    if (chartInstance) {
      chartInstance.setOption(newOption)
    }
  },
  { deep: true }
)

// 窗口自适应
const resizeChart = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', resizeChart)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeChart)
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
})
</script>
