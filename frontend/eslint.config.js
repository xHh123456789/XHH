// eslint.config.js（ESLint v9+ 扁平化配置，v10 只认这个文件）
import js from '@eslint/js'
import vue from 'eslint-plugin-vue'
import globals from 'globals'
import prettier from '@vue/eslint-config-prettier'
// ✅ TS 支持：让 ESLint 认识 .ts 文件和 .vue 里的 <script lang="ts">
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'

export default defineConfigWithVueTs(
  { ignores: ['dist/**', 'node_modules/**'] },
  js.configs.recommended,
  ...vue.configs['flat/recommended'],
  vueTsConfigs.recommended,
  {
    files: ['**/*.{js,ts,vue}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    }
  },
  {
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'off',
      // 渐进式迁移期间 JS/TS 共存，暂不强制 script 标签带 lang="ts"（全部迁完后可删掉此行）
      'vue/block-lang': 'off',
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off'
    }
  },
  prettier // 放在最后，关闭与 Prettier 冲突的格式规则
)
