/**
 * 用户状态管理
 */

import { defineStore } from 'pinia'
import { getToken, setToken, clearToken } from '@/utils/auth'
import { userApi } from '@/api/modules/user'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: getToken(),
    userInfo: null,
    roles: []
  }),
  
  getters: {
    // 是否已登录
    isLoggedIn: (state) => !!state.token,
    
    // 用户名
    username: (state) => state.userInfo?.username || '',
    
    // 用户角色
    userRoles: (state) => state.roles
  },
  
  actions: {
    /**
     * 登录
     * @param {object} credentials - { username, password }
     */
    async login(credentials) {
      try {
        const { token, userInfo } = await userApi.login(credentials)
        this.token = token
        this.userInfo = userInfo
        this.roles = userInfo.roles || []
        setToken(token)
        return { token, userInfo }
      } catch (error) {
        throw error
      }
    },

    /**
     * 获取用户信息
     */
    async getUserInfo() {
      try {
        const userInfo = await userApi.getUserInfo()
        
        // 验证用户信息格式
        if (!userInfo || !userInfo.username) {
          throw new Error('用户信息格式错误')
        }
        
        // 验证角色列表（防止后端返回非法角色）
        const validRoles = ['admin', 'user', 'guest', 'editor', 'viewer']
        let roles = []
        
        if (Array.isArray(userInfo.roles)) {
          // 过滤出合法角色
          roles = userInfo.roles.filter(role => validRoles.includes(role))
        }
        
        // 如果没有任何角色，分配默认角色
        if (roles.length === 0) {
          console.warn('用户没有有效角色，分配默认角色: guest')
          roles = ['guest']
        }
        
        this.userInfo = userInfo
        this.roles = roles
        
        return userInfo
      } catch (error) {
        console.error('获取用户信息失败：', error)
        // 获取用户信息失败，清除登录状态
        this.resetToken()
        throw error
      }
    },

    /**
     * 更新用户信息
     * @param {object} payload
     */
    async updateUserInfo(payload) {
      try {
        const result = await userApi.updateUserInfo(payload)
        const mergedInfo = {
          ...(this.userInfo || {}),
          ...payload,
          ...(result || {})
        }
        this.userInfo = mergedInfo
        return mergedInfo
      } catch (error) {
        throw error
      }
    },

    /**
     * 登出
     */
    async logout() {
      try {
        await userApi.logout()
      } catch (error) {
        console.error('登出失败：', error)
      } finally {
        // 清除 token
        clearToken()
        this.token = ''
        this.userInfo = null
        this.roles = []
        
        // 清除权限路由
        const { usePermissionStore } = await import('./permission')
        const permissionStore = usePermissionStore()
        permissionStore.resetRoutes()
      }
    },
    
    /**
     * 重置 token
     */
    resetToken() {
      clearToken()
      this.token = ''
      this.userInfo = null
      this.roles = []
    }
  },
  
  // Pinia 持久化配置（pinia-plugin-persistedstate v3.x 语法）
  persist: {
    key: 'user-store', // 与 utils/auth 中的 TOKEN_KEY 保持一致
    storage: localStorage,
    paths: ['token']  // 仅持久化 token，userInfo 每次重新获取
  }
})
