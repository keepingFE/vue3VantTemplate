/**
 * 权限判断 Hook
 * 
 * 提供多种权限判断方法：
 * 1. hasPermission - 检查是否有任一权限
 * 2. hasAllPermissions - 检查是否有所有权限
 * 3. hasRole - 检查是否有指定角色
 * 4. isAdmin - 是否管理员
 * 5. isGuest - 是否游客
 */

import { computed } from 'vue'
import { useUserStore } from '@/store/modules/user'

export function usePermission() {
  const userStore = useUserStore()
  
  // 用户角色（响应式）
  const roles = computed(() => userStore.roles || [])
  
  // 是否已登录
  const isLoggedIn = computed(() => userStore.isLoggedIn)
  
  /**
   * 检查是否有权限（有任一权限即可）
   * @param {String|Array} permissionRoles - 需要的角色（字符串或数组）
   * @returns {Boolean}
   */
  const hasPermission = (permissionRoles) => {
    if (!permissionRoles) {
      return true
    }
    
    // 转换为数组
    const requiredRoles = Array.isArray(permissionRoles) 
      ? permissionRoles 
      : [permissionRoles]
    
    if (requiredRoles.length === 0) {
      return true
    }
    
    return roles.value.some(role => requiredRoles.includes(role))
  }
  
  /**
   * 检查是否有任一权限（别名方法）
   * @param {Array} permissionRoles - 需要的角色列表
   * @returns {Boolean}
   */
  const hasAnyPermission = (permissionRoles) => {
    return hasPermission(permissionRoles)
  }
  
  /**
   * 检查是否有所有权限
   * @param {Array} permissionRoles - 需要的角色列表
   * @returns {Boolean}
   */
  const hasAllPermissions = (permissionRoles) => {
    if (!permissionRoles || !Array.isArray(permissionRoles)) {
      return true
    }
    
    if (permissionRoles.length === 0) {
      return true
    }
    
    return permissionRoles.every(role => roles.value.includes(role))
  }
  
  /**
   * 检查是否有指定角色
   * @param {String} role - 角色名称
   * @returns {Boolean}
   */
  const hasRole = (role) => {
    if (!role) return false
    return roles.value.includes(role)
  }
  
  /**
   * 是否管理员
   * @returns {Boolean}
   */
  const isAdmin = computed(() => {
    return roles.value.includes('admin')
  })
  
  /**
   * 是否游客（未登录或只有 guest 角色）
   * @returns {Boolean}
   */
  const isGuest = computed(() => {
    if (!isLoggedIn.value) return true
    return roles.value.length === 1 && roles.value[0] === 'guest'
  })
  
  /**
   * 是否普通用户
   * @returns {Boolean}
   */
  const isUser = computed(() => {
    return roles.value.includes('user')
  })
  
  return {
    // 响应式数据
    roles,
    isLoggedIn,
    isAdmin,
    isGuest,
    isUser,
    
    // 权限判断方法
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole
  }
}

