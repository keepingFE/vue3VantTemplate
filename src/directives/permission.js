/**
 * 权限指令
 * 使用：v-permission="['admin', 'editor']"
 */

import { useUserStore } from '@/store/modules/user'

export const permission = {
  mounted(el, binding) {
    const { value } = binding
    const userStore = useUserStore()
    const roles = userStore.roles || []
    
    if (value && value instanceof Array && value.length > 0) {
      const hasPermission = roles.some(role => value.includes(role))
      
      if (!hasPermission) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    } else {
      throw new Error('需要指定权限角色，如 v-permission="[\'admin\',\'editor\']"')
    }
  }
}

