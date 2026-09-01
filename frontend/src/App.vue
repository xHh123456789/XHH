<template>
  <el-container style="height: 100vh">
    <!-- 侧边栏 -->
    <el-aside width="200px" style="background: #1a1a2e; color: white">
      <div
        style="
          padding: 20px;
          text-align: center;
          font-size: 18px;
          font-weight: bold;
          border-bottom: 1px solid #2d2d44;
        "
      >
        📋 工单系统
      </div>
      <!-- 用户信息 -->
      <div
        style="
          padding: 12px 20px;
          color: #b0b0c0;
          font-size: 13px;
          border-bottom: 1px solid #2d2d44;
        "
      >
        👤 {{ userStore.username || '未登录' }}
      </div>
      <el-menu
        :default-active="activeMenu"
        background-color="#1a1a2e"
        text-color="#b0b0c0"
        active-text-color="#ffffff"
        router
        style="border-right: none"
      >
        <el-menu-item index="/orders">
          <span>📋 工单列表</span>
        </el-menu-item>
        <el-menu-item index="/stats">
          <span>📊 数据统计</span>
        </el-menu-item>
        <el-menu-item style="color: #f56c6c" @click="handleLogout">
          <span>🚪 退出登录</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-main style="background: #f5f7fa">
      <router-view />
    </el-main>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const activeMenu = computed(() => route.path)

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.el-menu-item {
  font-size: 14px;
}
</style>
