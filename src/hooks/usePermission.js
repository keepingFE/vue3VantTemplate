/**
 * 权限判断 Hook
 */

import { computed } from 'vue'
import { useUserStore } from '@/store/modules/user'

export function usePermission() {
  const userStore = useUserStore()
  
  // 用户角色
  const roles = computed(() => userStore.roles || [])
  
  /**
   * 检查是否有权限
   * @param {Array} permissionRoles - 需要的角色列表
   * @returns {boolean}
   */
  const hasPermission = (permissionRoles) => {
    if (!permissionRoles || permissionRoles.length === 0) {
      return true
    }
    
    return roles.value.some(role => permissionRoles.includes(role))
  }
  
  /**
   * 检查是否有任一权限
   * @param {Array} permissionRoles - 需要的角色列表
   * @returns {boolean}
   */
  const hasAnyPermission = (permissionRoles) => {
    if (!permissionRoles || permissionRoles.length === 0) {
      return true
    }
    
    return roles.value.some(role => permissionRoles.includes(role))
  }
  
  /**
   * 检查是否有所有权限
   * @param {Array} permissionRoles - 需要的角色列表
   * @returns {boolean}
   */
  const hasAllPermissions = (permissionRoles) => {
    if (!permissionRoles || permissionRoles.length === 0) {
      return true
    }
    
    return permissionRoles.every(role => roles.value.includes(role))
  }
  
  return {
    roles,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions
  }
}

