/**
 * 主题管理 Hook
 */

import { computed } from 'vue'
import { useAppStore } from '@/store/modules/app'
import { THEME_COLORS, THEME_MODES } from '@/constants/theme'

export function useTheme() {
  const appStore = useAppStore()
  
  // 当前主题色
  const currentThemeColor = computed(() => appStore.themeColor)
  
  // 当前主题模式
  const currentThemeMode = computed(() => appStore.themeMode)
  
  // 切换主题色
  const changeThemeColor = (colorKey) => {
    if (!THEME_COLORS[colorKey]) return
    
    appStore.setThemeColor(colorKey)
  }
  
  // 切换主题模式
  const changeThemeMode = (mode) => {
    appStore.setThemeMode(mode)
  }
  
  // 启动时同步持久化的主题到 CSS 变量
  const initTheme = () => {
    changeThemeColor(appStore.themeColorKey)
    changeThemeMode(appStore.themeMode)
  }
  
  // 获取所有主题色
  const getAllThemeColors = () => {
    return Object.entries(THEME_COLORS).map(([key, value]) => ({
      key,
      ...value
    }))
  }
  
  return {
    currentThemeColor,
    currentThemeMode,
    changeThemeColor,
    changeThemeMode,
    initTheme,
    getAllThemeColors,
    THEME_COLORS,
    THEME_MODES
  }
}

