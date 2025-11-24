/**
 * 请求 Hook
 */

import { ref } from 'vue'
import { showToast } from 'vant'

export function useRequest(apiFunc, options = {}) {
  const loading = ref(false)
  const data = ref(null)
  const error = ref(null)
  
  const execute = async (...args) => {
    loading.value = true
    error.value = null
    
    try {
      const result = await apiFunc(...args)
      data.value = result
      
      if (options.onSuccess) {
        options.onSuccess(result)
      }
      
      return result
    } catch (err) {
      error.value = err
      
      if (options.onError) {
        options.onError(err)
      } else if (options.showError !== false) {
        showToast(err.message || '请求失败')
      }
      
      throw err
    } finally {
      loading.value = false
    }
  }
  
  return {
    loading,
    data,
    error,
    execute
  }
}

