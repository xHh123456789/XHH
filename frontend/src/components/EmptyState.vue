<template>
  <div style="text-align: center; padding: 60px 0">
    <el-empty :description="description || '暂无数据'" />
  </div>
</template>

<script setup lang="ts">
interface Props {
  description?: string
}

withDefaults(defineProps<Props>(), {
  description: ''
})
</script>
