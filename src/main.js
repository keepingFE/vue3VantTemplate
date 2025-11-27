/**
 * 应用入口文件
 */

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from './store'
import i18n from './locales'
import directives from './directives'

// 引入 Vant 基础样式
import 'vant/lib/index.css'

// 引入 amfe-flexible 实现移动端适配
import 'amfe-flexible'

// 引入vconsole调试工具

// 限制 PC 端的 rem 基准，避免页面过度放大
const setRemUnit = () => {
  const docEl = document.documentElement
  const clientWidth = docEl.clientWidth
  // PC 端（宽度大于 750px）固定 font-size 为 75px（对应 750px 设计稿）
  if (clientWidth > 750) {
    docEl.style.fontSize = '75px'
  } else {
    // 移动端使用 amfe-flexible 的默认行为
    docEl.style.fontSize = clientWidth / 10 + 'px'
  }
}

// 初始化
setRemUnit()

// 监听窗口大小变化
window.addEventListener('resize', setRemUnit)
window.addEventListener('pageshow', e => {
  if (e.persisted) {
    setRemUnit()
  }
})

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

// 根据环境变量初始化vconsole调试工具
if (import.meta.env.VITE_USE_VCONSOLE === 'true') {
  import('vconsole').then(({ default: VConsole }) => {
    new VConsole()
    console.log('VConsole 已启用')
  })
}


// 挂载应用
app.mount('#app')
