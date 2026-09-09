<template>
  <div ref="chartRef" :style="{ width: '100%', height: height }" />
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as echarts from 'echarts'
// echarts 自带类型：EChartsOption 是配置项类型，ECharts 是实例类型
import type { ECharts, EChartsOption } from 'echarts'

// ========== Props 定义（defineProps 泛型写法 + withDefaults 默认值）==========
interface Props {
  option: EChartsOption // 必填：图表配置（不用写 required，不加 ? 就是必填）
  height?: string // 选填：高度
}

const props = withDefaults(defineProps<Props>(), {
  height: '400px'
})

// ========== 响应式数据（DOM 元素的标准类型写法）==========
const chartRef = ref<HTMLDivElement | null>(null)
// 实例不需要响应式（echarts 内部管理重绘），用普通变量
let chartInstance: ECharts | null = null

// ========== 初始化图表 ==========
const initChart = (): void => {
  if (chartRef.value) {
    chartInstance = echarts.init(chartRef.value)
    chartInstance.setOption(props.option)
  }
}

// ========== 监听 option 变化 ==========
watch(
  () => props.option,
  newOption => {
    if (chartInstance) {
      chartInstance.setOption(newOption)
    }
  },
  { deep: true }
)

// ========== 窗口自适应 ==========
const resizeChart = (): void => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

// ========== 生命周期 ==========
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
