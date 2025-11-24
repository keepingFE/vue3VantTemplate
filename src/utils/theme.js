/**
 * 主题管理工具函数
 */

import { THEME_COLORS } from '@/constants/theme'

/**
 * 设置主题色
 * @param {string} colorKey - 主题色键名
 */
export function setThemeColor(colorKey) {
  const themeColor = THEME_COLORS[colorKey]
  if (!themeColor) return
  
  const root = document.documentElement
  root.style.setProperty('--theme-color', themeColor.primary)
  root.style.setProperty('--theme-color-light', themeColor.light)
  root.style.setProperty('--theme-color-lighter', themeColor.lighter)
  root.style.setProperty('--theme-color-dark', themeColor.dark)
}

let mediaQuery
let autoThemeChangeHandler

/**
 * 设置主题模式（深色/浅色）
 * @param {string} mode - 主题模式
 */
export function setThemeMode(mode) {
  const root = document.documentElement
  const apply = (isDark) => {
    if (isDark) {
      root.setAttribute('data-theme', 'dark')
    } else {
      root.removeAttribute('data-theme')
    }
  }

  if (mode === 'auto' && typeof window !== 'undefined' && window.matchMedia) {
    mediaQuery = mediaQuery || window.matchMedia('(prefers-color-scheme: dark)')
    apply(mediaQuery.matches)
    autoThemeChangeHandler =
      autoThemeChangeHandler ||
      ((event) => {
        apply(event.matches)
      })
    mediaQuery.removeEventListener?.('change', autoThemeChangeHandler)
    mediaQuery.addEventListener?.('change', autoThemeChangeHandler)
    root.setAttribute('data-theme-mode', 'auto')
    return
  }

  if (mediaQuery && autoThemeChangeHandler) {
    mediaQuery.removeEventListener?.('change', autoThemeChangeHandler)
  }
  apply(mode === 'dark')
  root.setAttribute('data-theme-mode', mode)
}

/**
 * 获取当前主题色
 */
export function getCurrentThemeColor() {
  const root = document.documentElement
  return getComputedStyle(root).getPropertyValue('--theme-color').trim()
}

