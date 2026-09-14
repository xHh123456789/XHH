import { ref } from 'vue'
import type { App } from 'vue'

// 全局加载状态
const isLoading = ref(false)
let loadingCount = 0

const loadingPlugin = {
  install(app: App): void {
    // 开启加载
    const show = (): void => {
      loadingCount++
      isLoading.value = true
    }

    // 关闭加载
    const hide = (): void => {
      loadingCount--
      if (loadingCount <= 0) {
        loadingCount = 0
        isLoading.value = false
      }
    }

    // 全局属性注入
    app.config.globalProperties.$loading = {
      show,
      hide,
      isLoading
    }

    // 注入到 Pinia 或组件中（提供组合式 API 支持）
    app.provide('loading', { show, hide, isLoading })
  }
}

export default loadingPlugin
