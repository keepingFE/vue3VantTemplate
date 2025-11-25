/**
 * 权限状态管理
 */

import { defineStore } from 'pinia'
import { asyncRoutes } from '@/router/routes'

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    routes: [],
    addRoutes: [],
    permissions: []
  }),
  
  getters: {
    // 获取所有路由
    allRoutes: (state) => state.routes
  },
  
  actions: {
    /**
     * 检查路由是否有权限访问
     * @param {Array} roles - 用户角色
     * @param {Object} route - 路由对象
     * @returns {boolean}
     */
    hasPermission(roles, route) {
      if (route.meta && route.meta.roles) {
        // 路由定义了角色要求，检查用户是否有对应角色
        return roles.some(role => route.meta.roles.includes(role))
      }
      // 路由没有角色要求，默认有权限
      return true
    },
    
    /**
     * 根据角色过滤路由
     * @param {Array} routes - 路由列表
     * @param {Array} roles - 用户角色
     * @returns {Array} - 过滤后的路由
     */
    filterAsyncRoutes(routes, roles) {
      const res = []
      
      routes.forEach(route => {
        // 复制路由对象，避免修改原对象
        const tmp = { ...route }
        
        // 检查是否有权限
        if (this.hasPermission(roles, tmp)) {
          // 递归处理子路由
          if (tmp.children) {
            tmp.children = this.filterAsyncRoutes(tmp.children, roles)
          }
          res.push(tmp)
        }
      })
      
      return res
    },
    
    /**
     * 生成动态路由
     * @param {Array} roles - 用户角色
     * @returns {Array} - 可访问的路由列表
     */
    async generateRoutes(roles) {
      let accessedRoutes
      
      if (roles.includes('admin')) {
        // 管理员拥有所有权限
        accessedRoutes = asyncRoutes || []
      } else {
        // 根据角色过滤路由
        accessedRoutes = this.filterAsyncRoutes(asyncRoutes, roles)
      }
      
      this.addRoutes = accessedRoutes
      
      return accessedRoutes
    },
    
    /**
     * 设置权限列表
     * @param {Array} permissions - 权限列表
     */
    setPermissions(permissions) {
      this.permissions = permissions
    },
    
    /**
     * 重置路由
     */
    resetRoutes() {
      this.routes = []
      this.addRoutes = []
    }
  }
})

