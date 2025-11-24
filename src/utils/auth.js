/**
 * Token 工具函数
 * 避免请求与 Store 循环依赖
 */

const TOKEN_KEY = 'user-store' // 与 pinia 持久化 key 保持一致

/**
 * 获取 Token
 * @returns {string} token
 */
export const getToken = () => {
  const cache = localStorage.getItem(TOKEN_KEY)
  if (!cache) return ''
  try {
    const parsed = JSON.parse(cache)
    return parsed?.token || ''
  } catch (error) {
    console.error('Token 解析失败：', error)
    return ''
  }
}

/**
 * 设置 Token
 * @param {string} token
 */
export const setToken = (token) => {
  if (!token) {
    localStorage.removeItem(TOKEN_KEY)
    return
  }
  localStorage.setItem(TOKEN_KEY, JSON.stringify({ token }))
}

/**
 * 清除 Token
 */
export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY)
}

