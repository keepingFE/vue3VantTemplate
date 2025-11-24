/**
 * 用户状态管理
 */

import { defineStore } from 'pinia'
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
      // 本地 Mock 登录，直接生成用户数据
      const username = credentials?.username?.trim() || '游客'
      const token = 'mock-token'
      const userInfo = {
        username,
        email: `${username}@example.com`,
        roles: ['user']
      }

      this.token = token
      this.userInfo = userInfo
      this.roles = userInfo.roles
      setToken(token)
      return { token, userInfo }
    },
    
    /**
     * 获取用户信息
     */
    async getUserInfo() {
      // 本地直接返回当前用户信息
      if (!this.userInfo) {
        this.userInfo = {
          username: '游客',
          email: 'guest@example.com',
          roles: ['user']
        }
        this.roles = this.userInfo.roles
      }
      return this.userInfo
    },
    
    /**
     * 登出
     */
    async logout() {
      // 清除本地状态
      clearToken()
      this.token = ''
      this.userInfo = null
      this.roles = []
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
