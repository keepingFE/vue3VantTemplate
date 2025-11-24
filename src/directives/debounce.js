/**
 * 防抖指令
 * 使用：v-debounce:500="handleClick"
 */

export const debounce = {
  mounted(el, binding) {
    let timer
    const delay = binding.arg || 300
    
    el.addEventListener('click', () => {
      if (timer) clearTimeout(timer)
      
      timer = setTimeout(() => {
        binding.value()
      }, delay)
    })
  }
}

