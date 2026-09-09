<template>
  <div class="login-container">
    <el-card class="login-card">
      <h2 style="text-align: center; margin-bottom: 24px">📋 工单系统登录</h2>

      <!-- 登录表单 -->
      <el-form label-width="80px" @submit.prevent="handleLogin">
        <el-form-item label="用户名">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" native-type="submit" style="width: 100%" :loading="loading">
            登录
          </el-button>
        </el-form-item>
      </el-form>

      <div style="text-align: center; margin-top: 12px">
        <span style="color: #909399">还没有账号？</span>
        <el-link type="primary" @click="goToRegister"> 立即注册 </el-link>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

// ========== 表单类型（今天知识点：本地 interface）==========
interface LoginForm {
  username: string
  password: string
}

const router = useRouter()
const userStore = useUserStore()

// ========== 响应式数据 ==========
const form = reactive<LoginForm>({
  username: '',
  password: ''
})
const loading = ref<boolean>(false)

// ========== 登录处理 ==========
const handleLogin = async (): Promise<void> => {
  if (!form.username || !form.password) {
    ElMessage.warning('请填写完整信息')
    return
  }

  loading.value = true
  const success = await userStore.login(form.username, form.password)
  loading.value = false

  if (success) {
    // 登录成功，跳转到首页
    router.push('/')
  }
}

// ========== 跳转注册 ==========
const goToRegister = (): void => {
  router.push('/register')
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f5f7fa;
}
.login-card {
  width: 420px;
  padding: 20px;
}
</style>
