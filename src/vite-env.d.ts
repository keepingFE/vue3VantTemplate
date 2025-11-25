/// <reference types="vite/client" />

// 声明 .vue 文件模块
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// 环境变量类型声明
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_BASE_API: string
  readonly VITE_APP_PORT: string
  readonly VITE_USE_MOCK: string
  readonly VITE_USE_VCONSOLE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
