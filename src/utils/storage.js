/**
 * 本地存储工具函数
 */

/**
 * localStorage 封装
 */
export const storage = {
  /**
   * 设置存储
   * @param {string} key
   * @param {any} value
   */
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('localStorage set error:', error)
    }
  },

  /**
   * 获取存储
   * @param {string} key
   * @returns {any}
   */
  get(key) {
    try {
      const value = localStorage.getItem(key)
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.error('localStorage get error:', error)
      return null
    }
  },

  /**
   * 删除存储
   * @param {string} key
   */
  remove(key) {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('localStorage remove error:', error)
    }
  },

  /**
   * 清空存储
   */
  clear() {
    try {
      localStorage.clear()
    } catch (error) {
      console.error('localStorage clear error:', error)
    }
  }
}

/**
 * sessionStorage 封装
 */
export const session = {
  /**
   * 设置存储
   * @param {string} key
   * @param {any} value
   */
  set(key, value) {
    try {
      sessionStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('sessionStorage set error:', error)
    }
  },

  /**
   * 获取存储
   * @param {string} key
   * @returns {any}
   */
  get(key) {
    try {
      const value = sessionStorage.getItem(key)
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.error('sessionStorage get error:', error)
      return null
    }
  },

  /**
   * 删除存储
   * @param {string} key
   */
  remove(key) {
    try {
      sessionStorage.removeItem(key)
    } catch (error) {
      console.error('sessionStorage remove error:', error)
    }
  },

  /**
   * 清空存储
   */
  clear() {
    try {
      sessionStorage.clear()
    } catch (error) {
      console.error('sessionStorage clear error:', error)
    }
  }
}

