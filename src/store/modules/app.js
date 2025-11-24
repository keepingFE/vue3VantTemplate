/**
 * 应用状态管理
 */

import { defineStore } from 'pinia'
import { THEME_COLORS, THEME_MODES } from '@/constants/theme'
import { setThemeColor as applyThemeColor, setThemeMode as applyThemeMode } from '@/utils/theme'

export const useAppStore = defineStore('app', {
  state: () => ({
    locale: 'zh-CN',
    themeColorKey: 'blue',
    themeColor: THEME_COLORS.blue,
    themeMode: THEME_MODES.LIGHT,
    loading: false,
    device: 'mobile'
  }),
  
  actions: {
    /**
     * 设置主题色
     * @param {string} colorKey
     */
    setThemeColor(colorKey) {
      const key = THEME_COLORS[colorKey] ? colorKey : 'blue'
      this.themeColorKey = key
      this.themeColor = THEME_COLORS[key]
      applyThemeColor(key)
    },
    
    /**
     * 设置主题模式
     * @param {string} mode
     */
    setThemeMode(mode) {
      const safeMode = Object.values(THEME_MODES).includes(mode) ? mode : THEME_MODES.LIGHT
      this.themeMode = safeMode
      applyThemeMode(safeMode)
    },
    
    /**
     * 设置语言
     * @param {string} locale
     */
    setLocale(locale) {
      this.locale = locale
    },
    
    /**
     * 在应用启动时调用，使用持久化的值同步 CSS 变量
     */
    initTheme() {
      this.setThemeColor(this.themeColorKey)
      this.setThemeMode(this.themeMode)
    }
  },
  
  // Pinia 持久化配置（pinia-plugin-persistedstate v3.x 语法）
  persist: {
    key: 'app-store',
    storage: localStorage,
    paths: ['locale', 'themeColorKey', 'themeMode']
  }
})

