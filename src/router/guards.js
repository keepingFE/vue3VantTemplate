/**
 * 路由守卫
 */

import { useUserStore } from '@/store/modules/user'
import { usePermissionStore } from '@/store/modules/permission'
import { getToken } from '@/utils/auth'
import { showToast } from 'vant'

// 白名单路由
const whiteList = ['/login', '/register', '/404', '/403']

/**
 * 全局前置守卫
 */
export function setupRouterGuards(router) {
  router.beforeEach(async (to, from, next) => {
    const userStore = useUserStore()
    const permissionStore = usePermissionStore()
    const token = userStore.token || getToken()
    
    // 设置页面标题
    document.title = to.meta.title || '移动端应用'
    
    // 判断是否需要登录
    if (token) {
      if (!userStore.token) {
        userStore.token = token
      }
      if (to.path === '/login') {
        // 已登录，跳转到首页
        next({ path: '/' })
      } else {
        // 检查是否已获取用户信息
        if (!userStore.userInfo) {
          try {
            // 获取用户信息
            await userStore.getUserInfo()
            
            // 生成动态路由
            const accessRoutes = await permissionStore.generateRoutes(userStore.roles)
            
            // 动态添加路由
            accessRoutes.forEach(route => {
              router.addRoute(route)
            })
            
            // 重新导航到目标路由
            next({ ...to, replace: true })
          } catch (error) {
            // 获取用户信息失败，清除 token 并跳转到登录页
            await userStore.logout()
            showToast('获取用户信息失败，请重新登录')
            next(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
          }
        } else {
          // 检查权限
          if (to.meta.roles && to.meta.roles.length > 0) {
            const hasPermission = userStore.roles.some(role => to.meta.roles.includes(role))
            if (!hasPermission) {
              showToast('您没有权限访问该页面')
              next('/403')
              return
            }
          }
          next()
        }
      }
    } else {
      userStore.resetToken()
      // 未登录
      if (whiteList.includes(to.path)) {
        // 在白名单中，直接进入
        next()
      } else {
        // 不在白名单中，跳转到登录页
        next(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
      }
    }
  })
  
  // 全局后置守卫
  router.afterEach((to, from) => {
    // 页面滚动到顶部
    window.scrollTo(0, 0)
  })
  
  // 全局错误处理
  router.onError((error) => {
    console.error('路由错误：', error)
    showToast('页面加载失败')
  })
}

