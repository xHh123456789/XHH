<template>
  <div>
    <el-empty v-if="!loading && orders.length === 0" description="暂无工单数据" />

    <el-table v-else v-loading="loading" :data="orders" border stripe style="width: 100%">
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
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button
            v-permission="'admin'"
            type="danger"
            size="small"
            @click="deleteOrder(row.order_id)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
// ✅ 核心修改：将 deleteOrder 重命名为 deleteOrderApi
import { getOrders, updateOrder, deleteOrder as deleteOrderApi } from '@/api/order'
import type { Order, OrderStatus } from '@/types'

// ========== 响应式数据（空数组必须显式泛型，否则推断成 never[]）==========
const orders = ref<Order[]>([])
const loading = ref(false)

// ========== 获取工单列表 ==========
const fetchOrders = async (): Promise<void> => {
  loading.value = true
  try {
    orders.value = await getOrders()
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

// ========== 更新状态 ==========
const updateStatus = async (orderId: string, newStatus: string): Promise<void> => {
  try {
    // el-select 的 change 事件给的是 string，断言收窄成三个状态值
    await updateOrder(orderId, { status: newStatus as OrderStatus })
    ElMessage.success('状态更新成功 ✅')
    await fetchOrders()
  } catch (err) {
    console.error(err)
  }
}

// ========== 删除工单 ==========
const deleteOrder = (orderId: string): void => {
  ElMessageBox.confirm(`确定要删除工单 ${orderId} 吗？此操作不可恢复！`, '提示', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        // ✅ 调用重命名后的 API 函数
        await deleteOrderApi(orderId)
        ElMessage.success('删除成功 ✅')
        await fetchOrders()
      } catch (err) {
        console.error(err)
      }
    })
    .catch(() => {})
}

// defineExpose 自动推断类型
defineExpose({ fetchOrders })

onMounted(fetchOrders)
</script>
