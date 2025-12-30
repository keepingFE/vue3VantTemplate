/**
 * 路由缓存管理 Hook
 */

import { useKeepAliveStore } from '@/store/modules/keepAlive'
import { useRouter } from 'vue-router'

export function useKeepAlive() {
  const keepAliveStore = useKeepAliveStore()
  const router = useRouter()

  /**
   * 刷新当前页面（移除缓存后重新加载）
   * @param {string} name - 组件名称，不传则使用当前路由
   */
  const refreshPage = async (name) => {
    const currentRoute = router.currentRoute.value
    const componentName = name || currentRoute.name

    if (!componentName) return

    // 移除缓存
    keepAliveStore.removeCachedView(componentName)

    // 通过重定向页面刷新
    const { path, query } = currentRoute
    await router.replace({
      path: '/redirect' + path,
      query
    })
  }

  /**
   * 关闭当前页面并返回
   * @param {string} name - 组件名称，不传则使用当前路由
   */
  const closePage = (name) => {
    const currentRoute = router.currentRoute.value
    const componentName = name || currentRoute.name

    if (componentName) {
      keepAliveStore.removeCachedView(componentName)
    }

    router.back()
  }

  /**
   * 关闭其他页面（保留当前页面）
   * @param {string} name - 要保留的组件名称，不传则使用当前路由
   */
  const closeOthers = (name) => {
    const currentRoute = router.currentRoute.value
    const componentName = name || currentRoute.name

    keepAliveStore.removeOthersCachedViews(componentName)
  }

  /**
   * 关闭所有页面
   */
  const closeAll = () => {
    keepAliveStore.clearCachedViews()
  }

  /**
   * 添加缓存
   * @param {string} name - 组件名称
   */
  const addCache = (name) => {
    if (name) {
      keepAliveStore.addCachedView(name)
    }
  }

  /**
   * 移除缓存
   * @param {string} name - 组件名称
   */
  const removeCache = (name) => {
    if (name) {
      keepAliveStore.removeCachedView(name)
    }
  }

  return {
    refreshPage,
    closePage,
    closeOthers,
    closeAll,
    addCache,
    removeCache
  }
}
