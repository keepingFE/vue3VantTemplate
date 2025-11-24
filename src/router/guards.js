/**
 * 路由守卫
 */

import { showToast } from 'vant'

/**
 * 全局前置守卫
 */
export function setupRouterGuards(router) {
  router.beforeEach(async (to, from, next) => {
    // 设置页面标题
    document.title = to.meta.title || '移动端应用'

    // 目前无需登录校验，直接放行所有路由
    next()
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
