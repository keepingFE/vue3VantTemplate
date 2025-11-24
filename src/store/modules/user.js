/**
 * 用户状态管理
 */

import { defineStore } from 'pinia'
import { userApi } from '@/api/modules/user'
import { getToken, setToken, clearToken } from '@/utils/auth'

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
        this.userInfo = userInfo
        this.roles = userInfo.roles || []
        return userInfo
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
        clearToken()
        this.token = ''
        this.userInfo = null
        this.roles = []
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

