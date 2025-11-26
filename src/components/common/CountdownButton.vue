<template>
  <van-button :type="buttonType" size="small" :disabled="disabled || counting" :loading="loading"
    @click="handleSendCode">
    {{ buttonText }}
  </van-button>
</template>

<script setup>
  import { ref, computed, onUnmounted, onMounted } from 'vue'
  import { showToast } from 'vant'
  import { useI18n } from 'vue-i18n'

  const { t } = useI18n()

  const props = defineProps({
    // 手机号或邮箱
    target: {
      type: String,
      required: true
    },
    // 倒计时时长（秒）
    countdown: {
      type: Number,
      default: 60
    },
    // 按钮类型
    buttonType: {
      type: String,
      default: 'primary'
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false
    },
    // 验证码类型（sms/email）
    codeType: {
      type: String,
      default: 'sms',
      validator: (value) => ['sms', 'email'].includes(value)
    }
  })

  const emit = defineEmits(['send'])

  // 倒计时状态
  const counting = ref(false)
  const loading = ref(false)
  const count = ref(0)
  const timer = ref(null)

  // 本地存储键名
  const getStorageKey = () => {
    return `countdown_${props.codeType}_${props.target}`
  }

  // 按钮文本
  const buttonText = computed(() => {
    if (loading.value) return t('common.loading')
    if (counting.value) return `${count.value}${t('common.secondsLater')}`
    return t('login.sendVerifyCode')
  })

  // 保存倒计时状态到本地存储
  const saveCountdownState = () => {
    if (counting.value && count.value > 0) {
      const state = {
        counting: true,
        count: count.value,
        timestamp: Date.now()
      }
      localStorage.setItem(getStorageKey(), JSON.stringify(state))
    } else {
      localStorage.removeItem(getStorageKey())
    }
  }

  // 从本地存储恢复倒计时状态
  const restoreCountdownState = () => {
    const savedState = localStorage.getItem(getStorageKey())
    if (savedState) {
      try {
        const state = JSON.parse(savedState)
        if (state.counting && state.timestamp) {
          // 计算已经过去的时间
          const elapsedSeconds = Math.floor((Date.now() - state.timestamp) / 1000)
          const remainingCount = Math.max(0, state.count - elapsedSeconds)

          if (remainingCount > 0) {
            counting.value = true
            count.value = remainingCount
            startCountdown(remainingCount)
          } else {
            // 倒计时已结束，清除存储
            localStorage.removeItem(getStorageKey())
          }
        }
      } catch (error) {
        console.error('Failed to restore countdown state:', error)
        localStorage.removeItem(getStorageKey())
      }
    }
  }

  // 发送验证码
  const handleSendCode = async () => {
    // 验证目标
    if (!props.target) {
      showToast(props.codeType === 'sms' ? t('login.phoneRequired') : t('login.emailRequired'))
      return
    }

    // 验证手机号格式
    if (props.codeType === 'sms' && !/^1[3-9]\d{9}$/.test(props.target)) {
      showToast(t('login.invalidPhone'))
      return
    }

    // 验证邮箱格式
    if (props.codeType === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(props.target)) {
      showToast(t('login.invalidEmail'))
      return
    }

    loading.value = true

    try {
      // 触发发送验证码事件
      await emit('send', props.target)

      // 开始倒计时
      startCountdown(props.countdown)

      showToast(t('login.sendVerifyCodeSuccess'))
    } catch (error) {
      showToast(error.message || t('login.sendVerifyCodeFailed'))
    } finally {
      loading.value = false
    }
  }

  // 开始倒计时
  const startCountdown = (initialCount = props.countdown) => {
    counting.value = true
    count.value = initialCount

    // 保存初始状态
    saveCountdownState()

    timer.value = setInterval(() => {
      count.value--

      // 每次更新都保存状态
      saveCountdownState()

      if (count.value <= 0) {
        clearInterval(timer.value)
        counting.value = false
        // 倒计时结束时清除存储
        localStorage.removeItem(getStorageKey())
      }
    }, 1000)
  }

  // 清理定时器
  const clearTimer = () => {
    if (timer.value) {
      clearInterval(timer.value)
      timer.value = null
    }
  }

  // 组件挂载时恢复倒计时状态
  onMounted(() => {
    restoreCountdownState()
  })

  // 组件卸载时清理定时器
  onUnmounted(() => {
    clearTimer()
  })
</script>

<style lang="scss" scoped>
  // 组件样式可以根据需要自定义
</style>