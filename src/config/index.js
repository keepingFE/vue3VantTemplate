/**
 * 全局配置
 */

// 语言选项配置
export const languages = (t) => [
  { text: t('user.languageZhCN'), value: 'zh-CN' },
  { text: t('user.languageEnUS'), value: 'en-US' }
]

export default {
  // 应用标题
  title: import.meta.env.VITE_APP_TITLE || '移动端应用',

  // API 基础路径
  baseAPI: import.meta.env.VITE_APP_BASE_API || '/api',

  // 请求超时时间
  timeout: 15000,

  // Token 键名
  tokenKey: 'Authorization',

  // Token 前缀
  tokenPrefix: 'Bearer ',

  // 默认语言
  defaultLocale: window.config.defaultLocale || 'zh-CN',

  // 默认主题色
  defaultThemeColor: 'blue',

  // 默认主题模式
  defaultThemeMode: 'light',

  // 路由白名单（不需要登录）
  whiteList: ['/login', '/register', '/404', '/403']
}

