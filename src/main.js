/**
 * 应用入口文件
 */

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from './store'
import i18n from './locales'
import directives from './directives'

// 引入 amfe-flexible 实现移动端适配
import 'amfe-flexible'

// 引入全局样式
import '@/assets/styles/index.scss'

// 创建应用实例
const app = createApp(App)

// 全局错误处理
app.config.errorHandler = (err, instance, info) => {
  console.error('全局错误：', err)
  console.error('错误信息：', info)
  
  // 这里可以添加错误日志上报
  // reportError(err, info)
}

// 未捕获的 Promise 错误
window.addEventListener('unhandledrejection', event => {
  console.error('未捕获的 Promise 错误：', event.reason)
  event.preventDefault()
})

// 使用插件
app.use(pinia)
app.use(router)
app.use(i18n)
app.use(directives)

// 初始化主题
import { useAppStore } from '@/store/modules/app'
const appStore = useAppStore()
appStore.initTheme()

// 挂载应用
app.mount('#app')

