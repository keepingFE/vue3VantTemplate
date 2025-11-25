/**
 * 权限判断工具函数
 * 
 * 注意：这些是纯函数，不是响应式的
 * 如果需要响应式权限判断，请使用 usePermission Hook
 */

import { useUserStore } from '@/store/modules/user'

/**
 * 检查是否有权限（有任一权限即可）
 * @param {String|Array} permission - 权限标识（字符串或数组）
 * @returns {Boolean}
 */
export function hasPermission(permission) {
  const userStore = useUserStore()
  const roles = userStore.roles || []
  
  if (!permission) return true
  
  // 支持字符串和数组
  if (typeof permission === 'string') {
    return roles.includes(permission)
  }
  
  if (Array.isArray(permission)) {
    // 有任一权限即可
    return permission.some(role => roles.includes(role))
  }
  
  return false
}

/**
 * 检查是否有所有权限
 * @param {Array} permissions - 权限标识数组
 * @returns {Boolean}
 */
export function hasAllPermissions(permissions) {
  const userStore = useUserStore()
  const roles = userStore.roles || []
  
  if (!permissions || !Array.isArray(permissions)) return true
  if (permissions.length === 0) return true
  
  // 必须拥有所有权限
  return permissions.every(permission => roles.includes(permission))
}

/**
 * 检查是否有指定角色
 * @param {String} role - 角色名称
 * @returns {Boolean}
 */
export function hasRole(role) {
  if (!role || typeof role !== 'string') return false
  
  const userStore = useUserStore()
  const roles = userStore.roles || []
  
  return roles.includes(role)
}

/**
 * 检查是否是管理员
 * @returns {Boolean}
 */
export function isAdmin() {
  return hasRole('admin')
}

/**
 * 检查是否是游客
 * @returns {Boolean}
 */
export function isGuest() {
  const userStore = useUserStore()
  const roles = userStore.roles || []
  
  if (!userStore.isLoggedIn) return true
  return roles.length === 1 && roles[0] === 'guest'
}

/**
 * 检查当前用户角色
 * @returns {Array} 用户角色列表
 */
export function getCurrentRoles() {
  const userStore = useUserStore()
  return userStore.roles || []
}

