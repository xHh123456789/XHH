<template>
  <el-dialog v-model="visible" :title="title" width="400px" @close="handleCancel">
    <div style="text-align: center; padding: 20px 0">
      <el-icon size="48" color="#E6A23C">
        <WarningFilled />
      </el-icon>
      <p style="margin-top: 12px; font-size: 16px">
        {{ message }}
      </p>
    </div>
    <template #footer>
      <el-button @click="handleCancel"> 取消 </el-button>
      <el-button type="danger" @click="handleConfirm"> 确定 </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { WarningFilled } from '@element-plus/icons-vue'

interface Props {
  modelValue: boolean
  title?: string
  message?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '提示',
  message: '确定执行此操作吗？'
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const visible = ref(false)

watch(
  () => props.modelValue,
  val => {
    visible.value = val
  }
)

const handleConfirm = (): void => {
  emit('confirm')
  emit('update:modelValue', false)
}

const handleCancel = (): void => {
  emit('cancel')
  emit('update:modelValue', false)
}
</script>
