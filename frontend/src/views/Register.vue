<template>
  <div class="register-container">
    <el-card class="register-card">
      <h2 style="text-align: center; margin-bottom: 24px;">
        📝 注册新账号
      </h2>

      <el-form
        label-width="80px"
        @submit.prevent="handleRegister"
      >
        <el-form-item label="用户名">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名（必填）"
          />
        </el-form-item>
        <el-form-item label="密码">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码（必填）"
          />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input
            v-model="form.email"
            placeholder="请输入邮箱（选填）"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            native-type="submit"
            style="width: 100%;"
            :loading="loading"
          >
            注册
          </el-button>
        </el-form-item>
      </el-form>

      <div style="text-align: center; margin-top: 12px;">
        <span style="color: #909399;">已有账号？</span>
        <el-link
          type="primary"
          @click="goToLogin"
        >
          去登录
        </el-link>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

const form = reactive({
  username: '',
  password: '',
  email: ''
})
const loading = ref(false)

const handleRegister = async () => {
  if (!form.username || !form.password) {
    ElMessage.warning('用户名和密码为必填项')
    return
  }

  loading.value = true // 开启转圈
  try {
    const success = await userStore.register(form)
    if (success) {
      router.push('/login')
    }
  } catch (err) {
    console.error('注册发生意外错误:', err)
  } finally {
    loading.value = false // ✅ 关键：无论成功还是失败，最终都停止转圈
  }
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.register-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f5f7fa;
}
.register-card {
  width: 420px;
  padding: 20px;
}
</style>