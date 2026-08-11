<template>
  <div class="order-form-container">
    <h3>➕ 新增工单</h3>
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
        <el-select v-model="form.status" placeholder="选择状态">
          <el-option label="待处理" value="待处理" />
          <el-option label="处理中" value="处理中" />
          <el-option label="已完成" value="已完成" />
        </el-select>
      </el-form-item>

      <el-form-item>
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

const emit = defineEmits(['success'])

const form = reactive({
  order_id: '',
  customer_name: '',
  address: '',
  status: '待处理'
})

const submitting = ref(false)

const submitForm = async () => {
  if (!form.order_id || !form.customer_name || !form.address) {
    ElMessage.warning('请完整填写工单信息')
    return
  }

  submitting.value = true
  try {
    await createOrder(form)
    ElMessage.success('工单创建成功 ✅')
    
    // 重置表单
    form.order_id = ''
    form.customer_name = ''
    form.address = ''
    form.status = '待处理'
    
    emit('success')
  } catch (err) {
    console.error(err)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.order-form-container {
  background: #f9fafb;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  margin-bottom: 24px;
}
h3 {
  margin-bottom: 16px;
  font-size: 16px;
  color: #374151;
}
</style>
