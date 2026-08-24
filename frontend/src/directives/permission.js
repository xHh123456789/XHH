import { useUserStore } from '@/stores/user'

export default {
  mounted(el, binding) {
    // binding.value 就是传入的权限值，如 'admin'
    const requiredRole = binding.value
    const userStore = useUserStore()

    if (userStore.role !== requiredRole) {
      // 如果没有权限，移除该 DOM 元素
      el.parentNode?.removeChild(el)
    }
  },
  // 如果需要响应式更新（角色变化时重新判断）
  updated(el, binding) {
    const requiredRole = binding.value
    const userStore = useUserStore()

    if (userStore.role !== requiredRole) {
      el.parentNode?.removeChild(el)
    }
  }
}