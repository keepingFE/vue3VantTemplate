/**
 * i18n 国际化配置
 */

import { createI18n } from 'vue-i18n'
import { useAppStore } from '@/store/modules/app'
import zhCN from './zh-CN'
import enUS from './en-US'

// Vant 组件库语言包
import { Locale } from 'vant'
import vantZhCN from 'vant/es/locale/lang/zh-CN'
import vantEnUS from 'vant/es/locale/lang/en-US'

// 语言包映射
const messages = {
  'zh-CN': zhCN,
  'en-US': enUS
}

// Vant 语言包映射
const vantLocales = {
  'zh-CN': vantZhCN,
  'en-US': vantEnUS
}

// 创建 i18n 实例
const i18n = createI18n({
  legacy: false, // 使用 Composition API 模式
  locale: 'zh-CN', // 默认语言
  fallbackLocale: 'zh-CN', // 回退语言
  messages,
  globalInjection: true // 全局注入 $t 函数
})

/**
 * 切换语言
 * @param {string} locale - 语言代码
 */
export function setLocale(locale) {
  if (!messages[locale]) {
    console.warn(`语言包 ${locale} 不存在`)
    return
  }
  
  // 设置 i18n 语言
  i18n.global.locale.value = locale
  
  // 设置 Vant 组件库语言
  if (vantLocales[locale]) {
    Locale.use(locale, vantLocales[locale])
  }
  
  // 更新 store
  const appStore = useAppStore()
  appStore.setLocale(locale)
  
  // 更新 HTML lang 属性
  document.querySelector('html').setAttribute('lang', locale)
}

// 初始化语言
export function initLocale() {
  const appStore = useAppStore()
  const locale = appStore.locale || 'zh-CN'
  setLocale(locale)
}

export default i18n

