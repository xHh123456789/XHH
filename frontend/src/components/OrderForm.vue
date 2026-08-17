<template>
  <div class="order-form-container">
    <!-- 使用 el-form 进行布局 -->
    <el-form :model="form" label-position="top">
      <el-form-item label="工单编号">
        <el-input v-model="form.order_id" placeholder="例如：T100" />
      </el-form-item>

      <el-form-item label="客户姓名">
        <el-input v-model="form.customer_name" placeholder="请输入客户姓名" />
      </el-form-item>

      <el-form-item label="安装地址">
        <el-input v-model="form.address" placeholder="请输入详细安装地址" />
      </el-form-item>

      <el-form-item label="工单状态">
        <el-select v-model="form.status" placeholder="选择状态" style="width: 100%">
          <el-option label="待处理" value="待处理" />
          <el-option label="处理中" value="处理中" />
          <el-option label="已完成" value="已完成" />
        </el-select>
      </el-form-item>

      <el-form-item style="margin-top: 20px;">
        <el-button
          type="primary"
          @click="submitForm"
          :loading="submitting"
          style="width: 100%"
        >
          提交工单
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { createOrder } from '@/api/order'

// 定义向父组件发送的事件
const emit = defineEmits(['success'])

const form = reactive({
  order_id: '',
  customer_name: '',
  address: '',
  status: '待处理'
})

const submitting = ref(false)

const submitForm = async () => {
  // 基础校验
  if (!form.order_id || !form.customer_name || !form.address) {
    ElMessage.warning('请完整填写工单信息')
    return
  }

  submitting.value = true
  try {
    await createOrder(form)
    ElMessage.success('工单创建成功 ✅')

    // 触发 success 事件，通知 OrderList.vue 关闭弹窗并刷新列表
    emit('success')
  } catch (err) {
    console.error('提交失败:', err)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.order-form-container {
  padding: 10px;
}
</style>