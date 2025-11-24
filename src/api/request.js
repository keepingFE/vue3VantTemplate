/**
 * Axios 请求封装
 */

import axios from 'axios'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { getToken, clearToken } from '@/utils/auth'
import router from '@/router'

// 根据 runtime config 或环境变量确定接口地址
const resolveBaseURL = () => {
  const useMock = import.meta.env.VITE_USE_MOCK === 'true'
  if (useMock) {
    return '/api'
  }

  if (typeof window !== 'undefined' && window?.config?.systemApi) {
    return window.config.systemApi
  }
  return import.meta.env.VITE_APP_BASE_API
}

// 创建 axios 实例
const service = axios.create({
  baseURL: resolveBaseURL(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 添加 token
    const token = getToken()
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    
    // 显示 loading
    if (config.loading !== false) {
      showLoadingToast({
        message: '加载中...',
        forbidClick: true,
        duration: 0
      })
    }
    
    return config
  },
  error => {
    closeToast()
    console.error('请求错误：', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    closeToast()
    const { code, data, message } = response.data
    
    // 根据业务状态码处理
    if (code === 200 || code === 0) {
      return data
    } else if (code === 401) {
      // token 过期
      clearToken()
      const redirect = router.currentRoute?.value?.fullPath || '/'
      router.push(`/login?redirect=${encodeURIComponent(redirect)}`)
      showToast('登录已过期，请重新登录')
      return Promise.reject(new Error(message || '登录已过期'))
    } else {
      showToast(message || '请求失败')
      return Promise.reject(new Error(message || '请求失败'))
    }
  },
  error => {
    closeToast()
    
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 400:
          showToast(data.message || '请求参数错误')
          break
        case 401:
          showToast('未授权，请重新登录')
          clearToken()
          {
            const redirect = router.currentRoute?.value?.fullPath || '/'
            router.push(`/login?redirect=${encodeURIComponent(redirect)}`)
          }
          break
        case 403:
          showToast('拒绝访问')
          break
        case 404:
          showToast('请求资源不存在')
          break
        case 500:
          showToast('服务器错误')
          break
        default:
          showToast(data.message || '请求失败')
      }
    } else if (error.message.includes('timeout')) {
      showToast('请求超时，请稍后重试')
    } else if (error.message.includes('Network Error')) {
      showToast('网络连接失败')
    } else {
      showToast('请求失败，请稍后重试')
    }
    
    return Promise.reject(error)
  }
)

export default service
