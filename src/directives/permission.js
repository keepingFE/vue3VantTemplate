/**
 * 权限指令
 * 使用：v-permission="['admin', 'editor']"
 * 
 * 特性：
 * 1. 支持动态角色变化（updated 钩子）
 * 2. 使用 display:none 而非移除 DOM
 * 3. 更友好的错误提示
 * 4. 支持单个角色或角色数组
 */

import { useUserStore } from '@/store/modules/user'

/**
 * 检查权限
 * @param {HTMLElement} el - DOM 元素
 * @param {Object} binding - 指令绑定对象
 */
function checkPermission(el, binding) {
  const { value } = binding
  
  // 参数验证
  if (!value) {
    console.warn('[v-permission] 指令需要传入权限角色，如 v-permission="[\'admin\']"')
    return
  }
  
  // 转换为数组
  let requiredRoles = []
  if (typeof value === 'string') {
    requiredRoles = [value]
  } else if (Array.isArray(value)) {
    requiredRoles = value
  } else {
    console.error('[v-permission] 指令参数必须是字符串或数组')
    return
  }
  
  if (requiredRoles.length === 0) {
    console.warn('[v-permission] 权限角色不能为空')
    return
  }
  
  // 获取用户角色
  const userStore = useUserStore()
  const userRoles = userStore.roles || []
  
  // 检查是否有权限（只要有一个角色匹配即可）
  const hasPermission = userRoles.some(role => requiredRoles.includes(role))
  
  // 控制元素显示/隐藏
  if (!hasPermission) {
    // 无权限，隐藏元素
    el.style.display = 'none'
    el.setAttribute('data-permission-hidden', 'true')
    el.setAttribute('data-required-roles', requiredRoles.join(','))
  } else {
    // 有权限，显示元素
    if (el.getAttribute('data-permission-hidden') === 'true') {
      el.style.display = ''
      el.removeAttribute('data-permission-hidden')
    }
  }
}

export const permission = {
  // 元素挂载时检查权限
  mounted(el, binding) {
    checkPermission(el, binding)
  },
  
  // 指令参数更新时重新检查权限（支持动态角色变化）
  updated(el, binding) {
    // 只有当绑定值改变时才重新检查
    if (JSON.stringify(binding.value) !== JSON.stringify(binding.oldValue)) {
      checkPermission(el, binding)
    }
  },
  
  // 元素卸载时清理
  unmounted(el) {
    el.removeAttribute('data-permission-hidden')
    el.removeAttribute('data-required-roles')
  }
}

