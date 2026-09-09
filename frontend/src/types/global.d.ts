// src/types/global.d.ts —— 全局类型声明（.d.ts 结尾 = 纯声明文件，不产生任何代码）

// ========== 扩展环境变量类型 ==========
// 和 vite/client 里已有的 ImportMetaEnv 声明"合并"（interface 声明合并特性）
// 效果：import.meta.env.VITE_XXX 有类型提示了，且拼错变量名会报错
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_APP_TITLE: string
  readonly VITE_ENV: 'development' | 'production' | 'test'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
