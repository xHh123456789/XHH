import type { ObjectDirective } from 'vue'
import { useUserStore } from '@/stores/user'

// 自定义指令类型：用在 HTMLElement 上，binding.value 是 string（如 'admin'）
const permission: ObjectDirective<HTMLElement, string> = {
  mounted(el, binding) {
    // binding.value 就是传入的权限值，如 'admin'
    if (useUserStore().role !== binding.value) {
      el.parentNode?.removeChild(el)
    }
  },
  // 响应式更新（角色变化时重新判断）
  updated(el, binding) {
    if (useUserStore().role !== binding.value) {
      el.parentNode?.removeChild(el)
    }
  }
}

export default permission
