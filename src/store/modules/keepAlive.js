/**
 * 路由缓存状态管理
 */

import { defineStore } from 'pinia'

export const useKeepAliveStore = defineStore('keepAlive', {
  state: () => ({
    // 缓存的组件名称列表
    cachedViews: []
  }),

  getters: {
    /**
     * 获取缓存的组件列表
     */
    getCachedViews: (state) => state.cachedViews
  },

  actions: {
    /**
     * 添加缓存视图
     * @param {string} name - 组件名称
     */
    addCachedView(name) {
      if (!name || this.cachedViews.includes(name)) {
        return
      }
      this.cachedViews.push(name)
    },

    /**
     * 移除缓存视图
     * @param {string} name - 组件名称
     */
    removeCachedView(name) {
      const index = this.cachedViews.indexOf(name)
      if (index > -1) {
        this.cachedViews.splice(index, 1)
      }
    },

    /**
     * 清空所有缓存
     */
    clearCachedViews() {
      this.cachedViews = []
    },

    /**
     * 移除其他缓存（保留指定的）
     * @param {string} name - 要保留的组件名称
     */
    removeOthersCachedViews(name) {
      this.cachedViews = name ? [name] : []
    },

    /**
     * 批量添加缓存视图
     * @param {Array<string>} names - 组件名称数组
     */
    addMultipleCachedViews(names) {
      if (!Array.isArray(names)) return
      names.forEach((name) => {
        if (name && !this.cachedViews.includes(name)) {
          this.cachedViews.push(name)
        }
      })
    }
  }
})
