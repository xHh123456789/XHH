import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  build: {
    outDir: 'dist',        // 打包输出目录
    assetsDir: 'assets',   // 静态资源目录
    sourcemap: false,      // 生产环境不生成 sourcemap
    minify: 'terser',      // 代码压缩
    rollupOptions: {
      output: {
        // ✅ 手动代码分割（Vite 8 / rolldown 只支持函数形式）
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('element-plus')) return 'element-ui'
          if (id.includes('echarts')) return 'chart-vendor'
          if (id.includes('axios')) return 'utils-vendor'
          // Vue 核心库（vue / vue-router / pinia）单独打包
          if (id.includes('/vue/') || id.includes('/vue-router/') || id.includes('/pinia/')) {
            return 'vue-vendor'
          }
        },
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: '[ext]/[name]-[hash].[ext]'
      }
    }
  }
})