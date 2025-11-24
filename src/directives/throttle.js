/**
 * 节流指令
 * 使用：v-throttle:1000="handleClick"
 */

export const throttle = {
  mounted(el, binding) {
    let timer
    const delay = binding.arg || 1000
    
    el.addEventListener('click', () => {
      if (!timer) {
        timer = setTimeout(() => {
          binding.value()
          timer = null
        }, delay)
      }
    })
  }
}

