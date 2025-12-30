/**
 * 路由守卫
 */

import config from '@/config'
import { showToast } from 'vant'
import { useUserStore } from '@/store/modules/user'
import { usePermissionStore } from '@/store/modules/permission'
import { useKeepAliveStore } from '@/store/modules/keepAlive'

/**
 * 检查路由是否需要登录
 * @param {Object} route - 路由对象
 * @returns {Boolean} 是否需要登录
 */
function requiresAuth(route) {
  // 如果明确设置了 requiresAuth，以此为准
  if (route.meta?.requiresAuth !== undefined) {
    return route.meta.requiresAuth
  }
  // 如果设置了 roles，默认需要登录
  if (route.meta?.roles?.length > 0) {
    return true
  }
  // 默认需要登录（安全优先）
  return true
}

/**
 * 检查路由是否需要特定角色
 * @param {Object} route - 路由对象
 * @returns {Boolean} 是否需要特定角色
 */
function requiresRoles(route) {
  return route.meta?.roles && route.meta.roles.length > 0
}

/**
 * 检查用户是否有权限访问路由
 * @param {Array} userRoles - 用户角色列表
 * @param {Array} routeRoles - 路由需要的角色列表
 * @returns {Boolean} 是否有权限
 */
function hasPermission(userRoles, routeRoles) {
  if (!routeRoles || routeRoles.length === 0) {
    return true
  }
  if (!userRoles || userRoles.length === 0) {
    return false
  }
  return userRoles.some(role => routeRoles.includes(role))
}

/**
 * 全局前置守卫
 */
export function setupRouterGuards(router) {
  router.beforeEach(async (to, from, next) => {
    // 设置页面标题
    document.title = to.meta.title || config.title

    const userStore = useUserStore()
    const permissionStore = usePermissionStore()
    const token = userStore.token

    // 1. 检查是否在白名单中（使用 config 中的配置）
    if (config.whiteList.includes(to.path)) {
      // 白名单路由直接放行
      next()
      return
    }

    // 2. 检查路由是否需要登录
    if (!requiresAuth(to)) {
      // 不需要登录的路由，直接放行
      next()
      return
    }

    // 3. 需要登录但没有 token
    if (!token) {
      // 未登录，重定向到登录页
      const redirect = to.fullPath !== '/' ? to.fullPath : ''
      next(`/login${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`)
      return
    }

    // 4. 已登录，访问登录页时重定向到首页
    if (to.path === '/login') {
      next({ path: '/' })
      return
    }

    // 5. 已登录，检查是否已获取用户信息
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
        
        // 确保添加完路由后再跳转
        next({ ...to, replace: true })
        return
      } catch (error) {
        console.error('获取用户信息失败：', error)
        // 获取用户信息失败，清除token并跳转登录
        userStore.resetToken()
        showToast('登录已过期，请重新登录')
        next(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
        return
      }
    }

    // 6. 已有用户信息，检查角色权限
    const needRoles = requiresRoles(to)
    
    if (needRoles) {
      // 路由需要特定角色
      const allowed = hasPermission(userStore.roles, to.meta.roles)
      
      if (allowed) {
        next()
      } else {
        // 无权限访问
        showToast('您没有权限访问该页面')
        next('/403')
      }
    } else {
      // 路由不需要特定角色，已登录即可访问
      next()
    }
  })
  
  // 全局后置守卫
  router.afterEach((to, from) => {
    // 处理路由缓存
    const keepAliveStore = useKeepAliveStore()
    
    // 记录进入前是否已经在缓存中
    const wasAlreadyCached = keepAliveStore.cachedViews.includes(to.name)
    
    // 如果路由配置了 keepAlive，则添加到缓存列表
    if (to.meta?.keepAlive && to.name) {
      keepAliveStore.addCachedView(to.name)
    }
    
    // 只有在非缓存页面或首次进入缓存页面时才滚动到顶部
    // 如果页面已经被缓存过，说明是从缓存恢复，应该保持滚动位置
    if (!to.meta?.keepAlive || !wasAlreadyCached) {
      window.scrollTo(0, 0)
    }
  })
  
  // 全局错误处理
  router.onError((error) => {
    console.error('路由错误：', error)
    showToast('页面加载失败')
  })
}
