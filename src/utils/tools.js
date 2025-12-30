/**
 * 通用工具函数
 */

/**
 * 防抖函数（生产级）
 * @param {Function} fn - 需要防抖的函数
 * @param {number} delay - 延迟时间（毫秒）
 * @param {Object} options - 配置选项
 * @param {boolean} options.leading - 是否在延迟开始前调用（首次立即执行）
 * @param {boolean} options.trailing - 是否在延迟结束后调用（默认 true）
 * @param {number} options.maxWait - 最大等待时间，超过后强制执行
 * @returns {Function} 返回防抖后的函数，包含 cancel 和 flush 方法
 */
export function debounce(fn, delay = 300, options = {}) {
  if (typeof fn !== 'function') {
    throw new TypeError('Expected a function')
  }
  
  delay = Number(delay) || 0
  if (delay < 0) {
    delay = 0
  }
  
  const { leading = false, trailing = true, maxWait } = options
  
  // leading 和 trailing 不能同时为 false
  if (!leading && !trailing) {
    console.warn('debounce: leading and trailing cannot both be false')
  }
  
  let timer = null
  let lastCallTime = 0
  let lastInvokeTime = 0
  let lastArgs = null
  let lastThis = null
  let result = undefined

  function invokeFunc(time) {
    const args = lastArgs
    const thisArg = lastThis
    lastArgs = lastThis = null
    lastInvokeTime = time
    result = fn.apply(thisArg, args)
    return result
  }

  function startTimer(pendingFunc, wait) {
    if (timer !== null) {
      clearTimeout(timer)
    }
    timer = setTimeout(pendingFunc, wait)
  }

  function remainingWait(time) {
    const timeSinceLastCall = time - lastCallTime
    const timeSinceLastInvoke = time - lastInvokeTime
    const timeWaiting = delay - timeSinceLastCall

    return maxWait !== undefined
      ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
      : timeWaiting
  }

  function shouldInvoke(time) {
    const timeSinceLastCall = time - lastCallTime
    const timeSinceLastInvoke = time - lastInvokeTime

    return (
      lastCallTime === 0 ||
      timeSinceLastCall >= delay ||
      timeSinceLastCall < 0 ||
      (maxWait !== undefined && timeSinceLastInvoke >= maxWait)
    )
  }

  function timerExpired() {
    const time = Date.now()
    if (shouldInvoke(time)) {
      return trailingEdge(time)
    }
    const wait = remainingWait(time)
    startTimer(timerExpired, wait > 0 ? wait : 0)
  }

  function leadingEdge(time) {
    lastInvokeTime = time
    startTimer(timerExpired, delay)
    return leading ? invokeFunc(time) : result
  }

  function trailingEdge(time) {
    timer = null
    // trailing 且有新的参数，且不是刚刚 leading 执行过
    if (trailing && lastArgs) {
      return invokeFunc(time)
    }
    lastArgs = lastThis = null
    return result
  }

  function cancel() {
    if (timer !== null) {
      clearTimeout(timer)
      timer = null
    }
    lastCallTime = 0
    lastInvokeTime = 0
    lastArgs = lastThis = null
  }

  function flush() {
    return timer === null ? result : trailingEdge(Date.now())
  }

  function debounced(...args) {
    const time = Date.now()
    const isInvoking = shouldInvoke(time)

    lastArgs = args
    lastThis = this
    lastCallTime = time

    if (isInvoking) {
      if (timer === null) {
        return leadingEdge(lastCallTime)
      }
      if (maxWait !== undefined) {
        startTimer(timerExpired, delay)
        return invokeFunc(lastCallTime)
      }
    }
    startTimer(timerExpired, delay)
    return result
  }

  debounced.cancel = cancel
  debounced.flush = flush

  return debounced
}

/**
 * 节流函数（生产级）
 * @param {Function} fn - 需要节流的函数
 * @param {number} delay - 节流时间（毫秒）
 * @param {Object} options - 配置选项
 * @param {boolean} options.leading - 是否在节流开始前调用（首次立即执行，默认 true）
 * @param {boolean} options.trailing - 是否在节流结束后调用（默认 true）
 * @returns {Function} 返回节流后的函数，包含 cancel 方法
 */
export function throttle(fn, delay = 1000, options = {}) {
  if (typeof fn !== 'function') {
    throw new TypeError('Expected a function')
  }
  
  delay = Number(delay) || 0
  if (delay < 0) {
    delay = 0
  }
  
  const { leading = true, trailing = true } = options
  
  // leading 和 trailing 不能同时为 false
  if (!leading && !trailing) {
    console.warn('throttle: leading and trailing cannot both be false')
  }
  
  let timer = null
  let lastCallTime = 0
  let lastArgs = null
  let lastThis = null
  let result = undefined

  function invokeFunc(time) {
    const args = lastArgs
    const thisArg = lastThis
    lastArgs = lastThis = null
    lastCallTime = time
    result = fn.apply(thisArg, args)
    return result
  }

  function startTimer(pendingFunc, wait) {
    if (timer !== null) {
      clearTimeout(timer)
    }
    timer = setTimeout(pendingFunc, wait)
  }

  function remainingWait(time) {
    const timeSinceLastCall = time - lastCallTime
    return delay - timeSinceLastCall
  }

  function shouldInvoke(time) {
    const timeSinceLastCall = time - lastCallTime
    return lastCallTime === 0 || timeSinceLastCall >= delay || timeSinceLastCall < 0
  }

  function timerExpired() {
    const time = Date.now()
    if (shouldInvoke(time)) {
      return trailingEdge(time)
    }
    const wait = remainingWait(time)
    startTimer(timerExpired, wait > 0 ? wait : 0)
  }

  function trailingEdge(time) {
    timer = null
    if (trailing && lastArgs) {
      return invokeFunc(time)
    }
    lastArgs = lastThis = null
    return result
  }

  function cancel() {
    if (timer !== null) {
      clearTimeout(timer)
      timer = null
    }
    lastCallTime = 0
    lastArgs = lastThis = null
  }

  function throttled(...args) {
    const time = Date.now()
    const isInvoking = shouldInvoke(time)
    const isFirstCall = lastCallTime === 0

    lastArgs = args
    lastThis = this

    if (isInvoking) {
      // 首次调用或超过节流时间
      if (leading || !isFirstCall) {
        // 可以立即执行
        result = invokeFunc(time)
      } else {
        // leading=false 且首次调用，只更新时间，不执行
        lastCallTime = time
        // 设置 trailing 定时器
        if (trailing) {
          startTimer(timerExpired, delay)
        }
      }
    } else if (trailing) {
      // 在节流期间的调用，设置 trailing 定时器
      if (timer === null) {
        startTimer(timerExpired, remainingWait(time))
      }
    }
    
    return result
  }

  throttled.cancel = cancel

  return throttled
}

/**
 * 深拷贝
 * @param {any} obj
 * @returns {any}
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj)
  if (obj instanceof RegExp) return new RegExp(obj)
  if (obj instanceof Array) return obj.map(item => deepClone(item))
  
  const cloneObj = {}
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloneObj[key] = deepClone(obj[key])
    }
  }
  return cloneObj
}

/**
 * 格式化日期
 * @param {Date|string|number} date
 * @param {string} format
 * @returns {string}
 */
export function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hour = String(d.getHours()).padStart(2, '0')
  const minute = String(d.getMinutes()).padStart(2, '0')
  const second = String(d.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hour)
    .replace('mm', minute)
    .replace('ss', second)
}

/**
 * 获取 URL 参数
 * @param {string} name
 * @returns {string|null}
 */
export function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search)
  return params.get(name)
}

/**
 * 设置 URL 参数
 * @param {object} params
 */
export function setQueryParams(params) {
  const url = new URL(window.location.href)
  Object.keys(params).forEach(key => {
    url.searchParams.set(key, params[key])
  })
  window.history.pushState({}, '', url)
}

/**
 * 数字格式化（千分位）
 * @param {number} num
 * @returns {string}
 */
export function thousandSeparator(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * 文件大小格式化
 * @param {number} bytes
 * @returns {string}
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i]
}


/**
 * 保留小数点位数
 * @param {number|string} num
 * @param {number} precision
 * @returns {string}
 */
export function formatDecimal(num, precision = 2) {
  const n = Number(num)
  if (isNaN(n)) return ''
  return n.toFixed(precision)
}
