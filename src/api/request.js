/**
 * Axios 请求封装
 */

import axios from 'axios'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { getToken, clearToken } from '@/utils/auth'
import router from '@/router'
import i18n from '@/locales'

// 根据 runtime config 或环境变量确定接口地址
const resolveBaseURL = () => {
  const useMock = import.meta.env.VITE_USE_MOCK === 'true'
  if (useMock) {
    return '/api'
  }

  if (typeof window !== 'undefined' && window.config && window.config.systemApi) {
    return window.config.systemApi
  }

  return import.meta.env.VITE_APP_BASE_API
}

// 获取国际化翻译
const t = (key) => i18n.global.t(key)

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
        message: t('http.loading'),
        forbidClick: true,
        duration: 0
      })
    }
    
    return config
  },
  error => {
    closeToast()
    console.error(t('http.requestError'), error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    closeToast()
    
    const { code, data, message } = response.data
    if (code === 200 || code === 0) {
       // 根据业务状态码处理，请求成功
      return data
    } else if (code === 401) {
      // token 过期
      clearToken()
      const redirect = router.currentRoute?.value?.fullPath || '/'
      router.push(`/login?redirect=${encodeURIComponent(redirect)}`)
      showToast(t('http.loginExpired'))
      return Promise.reject(new Error(message || t('http.loginExpiredShort')))
    } else {
      // 请求失败
      showToast(message || t('http.requestFailed'))
      return Promise.reject(new Error(message || t('http.requestFailed')))
    }
  },
  error => {
    closeToast()
    
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 400:
          showToast(data.message || t('http.badRequest'))
          break
        case 401:
          showToast(t('http.unauthorized'))
          clearToken()
          {
            const redirect = router.currentRoute?.value?.fullPath || '/'
            router.push(`/login?redirect=${encodeURIComponent(redirect)}`)
          }
          break
        case 403:
          showToast(t('http.forbidden'))
          break
        case 404:
          showToast(t('http.notFound'))
          break
        case 500:
          showToast(t('http.serverError'))
          break
        default:
          showToast(data.message || t('http.requestFailed'))
      }
    } else if (error.message.includes('timeout')) {
      showToast(t('http.timeout'))
    } else if (error.message.includes('Network Error')) {
      showToast(t('http.networkError'))
    } else {
      showToast(t('http.retryLater'))
    }
    
    return Promise.reject(error)
  }
)

export default service
