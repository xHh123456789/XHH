import { createApp } from 'vue'
import { createPinia } from 'pinia'  // 新增
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import router from './router'
// 导入自定义指令
import permission from './directives/permission'
import loadingPlugin from './plugins/loading'

const app = createApp(App)
const pinia = createPinia()  // 创建 Pinia 实例

app.use(pinia)           // 注册 Pinia
app.use(ElementPlus, { locale: zhCn })
app.use(router)
app.use(loadingPlugin)

// ✅ 注册全局指令
app.directive('permission', permission)

app.mount('#app')