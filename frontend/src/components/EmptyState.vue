<template>
  <div style="text-align: center; padding: 60px 0">
    <el-empty :description="description || '暂无数据'" />
  </div>
</template>

<script setup>
defineProps({
  description: {
    type: String,
    default: ''
  }
})
</script>
