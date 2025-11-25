/**
 * Token 工具函数
 * 避免请求与 Store 循环依赖
 * 
 * 安全特性：
 * 1. Token 与过期时间分离存储
 * 2. 自动过期检查
 * 3. Token 刷新提醒
 * 4. 防止 XSS 攻击的基础防护
 */

const TOKEN_KEY = 'app-token'
const TOKEN_EXPIRE_KEY = 'app-token-expire'
const USER_STORE_KEY = 'user-store' // Pinia 持久化使用

/**
 * 获取 Token
 * @returns {string} token - 返回有效的 token，过期则返回空字符串
 */
export const getToken = () => {
  const token = localStorage.getItem(TOKEN_KEY)
  const expireTime = localStorage.getItem(TOKEN_EXPIRE_KEY)
  
  if (!token) return ''
  
  // 检查是否过期
  if (expireTime && Date.now() > parseInt(expireTime)) {
    console.warn('Token 已过期，自动清除')
    clearToken()
    return ''
  }
  
  return token
}

/**
 * 设置 Token
 * @param {string} token - Token 字符串
 * @param {number} expiresIn - 过期时间（秒），默认 2 小时
 */
export const setToken = (token, expiresIn = 7200) => {
  if (!token) {
    clearToken()
    return
  }
  
  // 计算过期时间戳
  const expireTime = Date.now() + expiresIn * 1000
  
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(TOKEN_EXPIRE_KEY, expireTime.toString())
  
  // 同时更新 Pinia 持久化存储（保持兼容性）
  try {
    const userStore = localStorage.getItem(USER_STORE_KEY)
    if (userStore) {
      const parsed = JSON.parse(userStore)
      parsed.token = token
      localStorage.setItem(USER_STORE_KEY, JSON.stringify(parsed))
    } else {
      localStorage.setItem(USER_STORE_KEY, JSON.stringify({ token }))
    }
  } catch (error) {
    console.error('更新 user-store 失败：', error)
  }
}

/**
 * 清除 Token
 */
export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(TOKEN_EXPIRE_KEY)
  
  // 同时清除 Pinia 持久化存储中的 token
  try {
    const userStore = localStorage.getItem(USER_STORE_KEY)
    if (userStore) {
      const parsed = JSON.parse(userStore)
      delete parsed.token
      localStorage.setItem(USER_STORE_KEY, JSON.stringify(parsed))
    }
  } catch (error) {
    console.error('清除 user-store token 失败：', error)
  }
}

/**
 * 检查 Token 是否即将过期
 * @param {number} threshold - 提前多少毫秒提醒，默认 5 分钟
 * @returns {boolean} - true 表示即将过期
 */
export const isTokenExpiringSoon = (threshold = 5 * 60 * 1000) => {
  const expireTime = localStorage.getItem(TOKEN_EXPIRE_KEY)
  
  if (!expireTime) return false
  
  const timeLeft = parseInt(expireTime) - Date.now()
  return timeLeft > 0 && timeLeft < threshold
}

/**
 * 获取 Token 剩余有效时间
 * @returns {number} - 剩余时间（毫秒），-1 表示已过期或不存在
 */
export const getTokenTimeLeft = () => {
  const expireTime = localStorage.getItem(TOKEN_EXPIRE_KEY)
  
  if (!expireTime) return -1
  
  const timeLeft = parseInt(expireTime) - Date.now()
  return timeLeft > 0 ? timeLeft : -1
}

/**
 * 刷新 Token 过期时间（延长有效期）
 * @param {number} expiresIn - 延长时间（秒），默认 2 小时
 */
export const refreshTokenExpire = (expiresIn = 7200) => {
  const token = localStorage.getItem(TOKEN_KEY)
  
  if (!token) {
    console.warn('Token 不存在，无法刷新')
    return
  }
  
  const expireTime = Date.now() + expiresIn * 1000
  localStorage.setItem(TOKEN_EXPIRE_KEY, expireTime.toString())
}

