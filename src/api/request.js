/**
 * Axios 请求封装
 */

import axios from 'axios'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { 
  getToken, 
  clearToken, 
  isTokenExpiringSoon, 
  setToken,
  getRefreshingStatus,
  setRefreshingStatus,
  subscribeTokenRefresh,
  onTokenRefreshed,
  onTokenRefreshFailed
} from '@/utils/auth'
import router from '@/router'
import i18n from '@/locales'
import requestConfig from '@/config/request.config'

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
  timeout: requestConfig.timeout.default,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
})

// 请求去重 Map，存储进行中的请求
const pendingRequests = new Map()

/**
 * 生成请求唯一标识
 * @param {Object} config - axios 请求配置
 * @returns {string} 请求唯一标识
 */
const generateRequestKey = (config) => {
  const { method, url, params, data } = config
  const strategy = requestConfig.deduplication.strategy
  
  // 基础 key：method + url
  let key = `${method}:${url}`
  
  // 根据策略添加更多信息
  if (strategy === 'all' || strategy === 'same-params') {
    // 安全地序列化参数
    let paramsStr = ''
    try {
      paramsStr = params ? JSON.stringify(params) : ''
    } catch (e) {
      paramsStr = String(params)
    }
    key += `:${paramsStr}`
  }
  
  if (strategy === 'all') {
    // 安全地序列化 data
    let dataStr = ''
    try {
      // 如果是 FormData，不序列化（特殊请求不会去重，这里只是占位）
      dataStr = data instanceof FormData ? 'FormData' : (data ? JSON.stringify(data) : '')
    } catch (e) {
      dataStr = String(data)
    }
    key += `:${dataStr}`
  }
  
  return key
}

/**
 * 判断 URL 是否匹配列表（支持字符串和正则）
 * @param {string} url - 请求 URL
 * @param {Array} list - 匹配列表
 * @returns {boolean} 是否匹配
 */
const matchUrlList = (url, list) => {
  if (!url || !Array.isArray(list) || list.length === 0) {
    return false
  }
  
  return list.some(pattern => {
    if (typeof pattern === 'string') {
      // 字符串匹配：包含即可
      return url.includes(pattern)
    } else if (pattern instanceof RegExp) {
      // 正则匹配
      return pattern.test(url)
    }
    return false
  })
}

/**
 * 判断是否为特殊请求（不需要去重）
 * @param {Object} config - axios 请求配置
 * @returns {boolean} 是否为特殊请求
 */
const isSpecialRequest = (config) => {
  const skipConfig = requestConfig.deduplication.skipSpecialRequests
  
  // 文件上传请求（FormData）
  if (skipConfig.formData && config.data instanceof FormData) {
    return true
  }
  
  // 文件下载/导出请求（responseType 为 blob 或 arraybuffer）
  if (skipConfig.blob && config.responseType === 'blob') {
    return true
  }
  
  if (skipConfig.arraybuffer && config.responseType === 'arraybuffer') {
    return true
  }
  
  return false
}

/**
 * 判断请求是否需要去重
 * @param {Object} config - axios 请求配置
 * @returns {boolean} 是否需要去重
 */
const shouldDeduplicate = (config) => {
  // 全局未启用去重
  if (!requestConfig.deduplication.enabled) {
    return false
  }
  
  // 请求配置中明确允许重复
  if (config.allowDuplicate === true) {
    return false
  }
  
  // 特殊请求类型
  if (isSpecialRequest(config)) {
    return false
  }
  
  const url = config.url || ''
  
  // 黑名单优先：在黑名单中的必须去重
  if (matchUrlList(url, requestConfig.deduplication.blacklist)) {
    return true
  }
  
  // 白名单：在白名单中的不去重
  if (matchUrlList(url, requestConfig.deduplication.whitelist)) {
    return false
  }
  
  // 默认需要去重
  return true
}

/**
 * 添加请求到 pending 队列
 * @param {Object} config - axios 请求配置
 * @returns {boolean} 是否为重复请求
 */
const addPendingRequest = (config) => {
  // 判断是否需要去重
  if (!shouldDeduplicate(config)) {
    return false
  }
  
  const requestKey = generateRequestKey(config)
  
  if (pendingRequests.has(requestKey)) {
    // 存在相同的请求，返回 true 表示重复
    return true
  }
  
  // 将当前请求添加到 pending 队列
  pendingRequests.set(requestKey, config)
  return false
}

/**
 * 从 pending 队列中移除请求
 * @param {Object} config - axios 请求配置
 */
const removePendingRequest = (config) => {
  // 不需要去重的请求，无需移除
  if (!shouldDeduplicate(config)) {
    return
  }
  
  const requestKey = generateRequestKey(config)
  pendingRequests.delete(requestKey)
}

/**
 * 刷新 Token
 * @returns {Promise<string>} 新的 token
 */
const refreshTokenRequest = async () => {
  try {
    // 直接调用刷新接口，避免循环依赖
    const response = await axios.post(
      `${resolveBaseURL()}/user/refresh-token`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('app-token')}`,
          'Content-Type': 'application/json;charset=UTF-8'
        }
      }
    )
    
    const { code, data } = response.data
    if (code === 200 || code === 0) {
      return data.token || data
    }
    throw new Error('Token refresh failed')
  } catch (error) {
    console.error('刷新 token 失败：', error)
    throw error
  }
}

// 请求拦截器
service.interceptors.request.use(
  async config => {
    // 添加 token
    const token = getToken()
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
      
      // 检查 token 是否即将过期（提前 5 分钟提醒）
      if (isTokenExpiringSoon() && !config.url.includes('/user/refresh-token')) {
        // 如果正在刷新，将请求加入等待队列
        if (getRefreshingStatus()) {
          // 等待 token 刷新完成或失败
          try {
            await new Promise((resolve, reject) => {
              let timeout
              let unsubscribe
              
              // 订阅刷新成功/失败事件
              unsubscribe = subscribeTokenRefresh((newToken) => {
                // 清理超时定时器
                if (timeout) {
                  clearTimeout(timeout)
                  timeout = null
                }
                
                // 取消订阅，避免内存泄漏
                if (unsubscribe && typeof unsubscribe === 'function') {
                  unsubscribe()
                }
                
                if (newToken) {
                  // 刷新成功
                  config.headers['Authorization'] = `Bearer ${newToken}`
                  resolve()
                } else {
                  // 刷新失败（如果 auth.js 支持传递 null 表示失败）
                  reject(new Error('Token refresh failed'))
                }
              })
              
              // 设置超时机制作为兜底
              timeout = setTimeout(() => {
                // 取消订阅
                if (unsubscribe && typeof unsubscribe === 'function') {
                  unsubscribe()
                }
                reject(new Error('Token refresh timeout'))
              }, 30000) // 30 秒超时
            })
          } catch (error) {
            // Token 刷新失败或超时，清除 token 并跳转登录
            clearToken()
            showToast(t('http.tokenRefreshFailed'))
            const redirect = router.currentRoute?.value?.fullPath || '/'
            router.push(`/login?redirect=${encodeURIComponent(redirect)}`)
            return Promise.reject(error)
          }
          // token 刷新完成后，继续执行后续逻辑（不 return，让代码继续往下走）
        } else {
          // 开始刷新 token
          setRefreshingStatus(true)
          
          try {
            console.log(t('http.tokenExpiringSoon'))
            showToast({
              message: t('http.tokenExpiringSoon'),
              duration: 1500
            })
            
            const newToken = await refreshTokenRequest()
            
            // 更新 token（默认 2 小时有效期）
            setToken(newToken, 7200)
            
            // 更新当前请求的 token
            config.headers['Authorization'] = `Bearer ${newToken}`
            
            // 通知所有等待的请求
            onTokenRefreshed(newToken)
            
            showToast({
              message: t('http.tokenRefreshSuccess'),
              duration: 1500
            })
            
            console.log('Token 刷新成功')
          } catch (error) {
            // 刷新失败，清除 token 并跳转登录
            onTokenRefreshFailed()
            clearToken()
            
            showToast(t('http.tokenRefreshFailed'))
            
            const redirect = router.currentRoute?.value?.fullPath || '/'
            router.push(`/login?redirect=${encodeURIComponent(redirect)}`)
            
            return Promise.reject(error)
          } finally {
            setRefreshingStatus(false)
          }
        }
      }
    }
    
    // 检查是否为重复请求（在 token 处理之后检查）
    if (addPendingRequest(config)) {
      // 重复请求，直接拦截，不发送请求
      console.warn('检测到重复请求，已拦截：', config.url)
      
      // 根据配置决定是否显示提示
      const showToastConfig = config.showDuplicateToast !== undefined 
        ? config.showDuplicateToast 
        : requestConfig.deduplication.showToast
      
      if (showToastConfig) {
        showToast({
          message: t('http.duplicateRequest') || '请求进行中，请勿重复操作',
          duration: 1000
        })
      }
      
      return Promise.reject({ 
        isDuplicate: true, 
        message: t('http.duplicateRequest') || '请求进行中，请勿重复操作',
        config 
      })
    }
    
    // 添加时间戳防止缓存
    config.headers['X-Request-Time'] = Date.now().toString()
    
    // 添加请求 ID 用于追踪和调试
    config.headers['X-Request-ID'] = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    // 显示 loading
    const showLoading = config.loading !== undefined ? config.loading : requestConfig.loading.enabled
    if (showLoading !== false) {
      showLoadingToast({
        message: t('http.loading'),
        forbidClick: requestConfig.loading.forbidClick,
        duration: requestConfig.loading.duration
      })
    }
    
    return config
  },
  error => {
    // 请求失败时也要移除 pending 请求
    if (error.config) {
      removePendingRequest(error.config)
    }
    
    closeToast()
    console.error(t('http.requestError'), error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    // 请求成功，移除 pending 请求
    removePendingRequest(response.config)
    closeToast()
    
    // 文件下载/导出请求，直接返回响应对象
    if (response.config.responseType === 'blob' || response.config.responseType === 'arraybuffer') {
      return response
    }
    
    // 检查响应数据是否存在
    if (!response.data) {
      showToast(t('http.requestFailed'))
      return Promise.reject(new Error('Response data is empty'))
    }
    
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
    // 请求失败，移除 pending 请求
    if (error.config) {
      removePendingRequest(error.config)
    }
    
    // 如果是重复请求被拦截，不显示错误提示
    if (error.isDuplicate) {
      return Promise.reject(error)
    }
    
    closeToast()
    
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 400:
          showToast((data && data.message) || t('http.badRequest'))
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
          showToast((data && data.message) || t('http.requestFailed'))
      }
    } else if (error.message && error.message.includes('timeout')) {
      showToast(t('http.timeout'))
    } else if (error.message && error.message.includes('Network Error')) {
      showToast(t('http.networkError'))
    } else {
      showToast(t('http.retryLater'))
    }
    
    return Promise.reject(error)
  }
)

/**
 * 文件下载辅助方法
 * @param {string} url - 下载地址
 * @param {Object} params - 请求参数
 * @param {string} filename - 文件名（可选，会从响应头中获取）
 * @returns {Promise}
 */
export const downloadFile = async (url, params = {}, filename = '') => {
  try {
    const response = await service({
      url,
      method: 'get',
      params,
      responseType: 'blob',
      timeout: requestConfig.timeout.download
    })
    
    // 从响应头获取文件名
    if (!filename) {
      const contentDisposition = response.headers['content-disposition']
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
        if (filenameMatch && filenameMatch[1]) {
          filename = decodeURIComponent(filenameMatch[1].replace(/['"]/g, ''))
        }
      }
    }
    
    // 创建下载链接
    const blob = new Blob([response.data])
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename || `download_${Date.now()}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
    
    showToast({
      message: t('http.downloadSuccess') || '下载成功',
      duration: 1500
    })
    
    return response
  } catch (error) {
    console.error('文件下载失败：', error)
    showToast(t('http.downloadFailed') || '下载失败')
    throw error
  }
}

/**
 * 文件上传辅助方法
 * @param {string} url - 上传地址
 * @param {FormData} formData - 表单数据
 * @param {Function} onProgress - 上传进度回调
 * @returns {Promise}
 */
export const uploadFile = (url, formData, onProgress) => {
  return service({
    url,
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: requestConfig.timeout.upload,
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress(percentCompleted)
      }
    }
  })
}

export default service
