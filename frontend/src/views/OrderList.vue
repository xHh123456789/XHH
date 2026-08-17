<template>
  <div class="order-page">
    <!-- ✅ 顶部操作栏 -->
    <div class="toolbar" style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
      <h2>📋 工单列表</h2>
      <!-- 点击按钮打开弹窗 -->
      <el-button type="primary" @click="dialogVisible = true" icon="Plus">新增工单</el-button>
    </div>

    <!-- ✅ 新增工单弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      title="创建新工单"
      width="500px"
      destroy-on-close
    >
      <!-- 将原有的 OrderForm 放入弹窗中 -->
      <!-- 当 OrderForm 触发 success 事件时，关闭弹窗并刷新列表 -->
      <OrderForm @success="handleCreateSuccess" />
    </el-dialog>

    <el-empty v-if="!loading && orders.length === 0" description="暂无工单数据" />

    <el-table
      v-else
      :data="orders"
      border
      stripe
      style="width: 100%"
      v-loading="loading"
    >
      <el-table-column prop="order_id" label="工单号" width="120" />
      <el-table-column prop="customer_name" label="客户" width="120" />
      <el-table-column prop="address" label="地址" min-width="180" />
      <el-table-column label="状态" width="180">
        <template #default="{ row }">
          <el-select
            :model-value="row.status"
            size="small"
            @change="updateStatus(row.order_id, $event)"
          >
            <el-option label="待处理" value="待处理" />
            <el-option label="处理中" value="处理中" />
            <el-option label="已完成" value="已完成" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="工程师" width="150">
        <template #default="{ row }">
          {{ row.engineers?.join('、') || '未分配' }}
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="180">
        <template #default="{ row }">
          {{ new Date(row.created_at).toLocaleString() }}
        </template>
      </el-table-column>

      <!-- 操作列 -->
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button
            v-if="userStore.isAdmin"
            type="danger"
            size="small"
            @click="deleteOrder(row.order_id)"
          >
            删除
          </el-button>
          <span v-else style="color: #909399; font-size: 12px;">无权限</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getOrders, updateOrder, deleteOrder as deleteOrderApi } from '@/api/order'
import { useUserStore } from '@/stores/user'
import OrderForm from '@/components/OrderForm.vue'

const userStore = useUserStore()
const orders = ref([])
const loading = ref(false)

// ✅ 控制弹窗显示/隐藏的状态
const dialogVisible = ref(false)

const fetchOrders = async () => {
  loading.value = true
  try {
    orders.value = await getOrders()
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

// ✅ 处理新增成功后的回调
const handleCreateSuccess = () => {
  dialogVisible.value = false // 1. 关闭弹窗
  fetchOrders()               // 2. 刷新列表数据
}

const updateStatus = async (orderId, newStatus) => {
  try {
    await updateOrder(orderId, { status: newStatus })
    ElMessage.success('状态更新成功 ✅')
    await fetchOrders()
  } catch (err) {
    console.error(err)
  }
}

const deleteOrder = (orderId) => {
  ElMessageBox.confirm(`确定要删除工单 ${orderId} 吗？此操作不可恢复！`, '提示', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteOrderApi(orderId)
      ElMessage.success('删除成功 ✅')
      await fetchOrders()
    } catch (err) {
      console.error(err)
    }
  }).catch(() => {})
}

onMounted(fetchOrders)
</script>

<style scoped>
.order-page {
  padding: 20px;
}
.toolbar h2 {
  font-size: 20px;
  color: #1a1a2e;
}
</style>