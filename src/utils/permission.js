/**
 * 权限判断工具函数
 */

import { useUserStore } from '@/store/modules/user'

/**
 * 检查是否有权限
 * @param {string|Array} permission - 权限标识
 * @returns {boolean}
 */
export function hasPermission(permission) {
  const userStore = useUserStore()
  const roles = userStore.roles || []
  
  if (!permission) return true
  
  if (typeof permission === 'string') {
    return roles.includes(permission)
  }
  
  if (Array.isArray(permission)) {
    return permission.some(role => roles.includes(role))
  }
  
  return false
}

/**
 * 检查是否有所有权限
 * @param {Array} permissions - 权限标识数组
 * @returns {boolean}
 */
export function hasAllPermissions(permissions) {
  const userStore = useUserStore()
  const roles = userStore.roles || []
  
  if (!permissions || !Array.isArray(permissions)) return true
  
  return permissions.every(permission => roles.includes(permission))
}

