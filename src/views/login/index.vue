<template>
  <div class="login-container">
    <div class="login-header">
      <h1 class="login-title">{{ $t('login.title') }}</h1>
    </div>

    <!-- 语言切换 -->
    <div class="lang-switch">
      <van-popover v-model:show="showLangPopover" :actions="langActions" @select="onSelectLang" placement="bottom-end"
        theme="light">
        <template #reference>
          <div class="lang-btn">
            <van-icon name="exchange" size="20" />
            <span class="lang-text">{{ currentLangText }}</span>
          </div>
        </template>
      </van-popover>
    </div>

    <van-form @submit="handleLogin" class="login-form">
      <van-cell-group>
        <van-field v-model="loginForm.username" name="username" :label="$t('login.username')"
          :placeholder="$t('login.usernamePlaceholder')"
          :rules="[{ required: true, message: $t('login.usernameRequired') }]" clearable />
        <van-field v-model="loginForm.password" type="password" name="password" :label="$t('login.password')"
          :placeholder="$t('login.passwordPlaceholder')"
          :rules="[{ required: true, message: $t('login.passwordRequired') }]" clearable />
        <van-field v-model="loginForm.phone" name="phone" :label="$t('login.phone')"
          :placeholder="$t('login.phonePlaceholder')" :rules="[{ required: true, message: $t('login.phoneRequired') }]"
          clearable />
        <van-field v-model="loginForm.verifyCode" name="verifyCode" :label="$t('login.verifyCode')"
          :placeholder="$t('login.verifyCodePlaceholder')"
          :rules="[{ required: true, message: $t('login.verifyCodeRequired') }]" clearable
          style="--van-field-input-width: calc(100% - 100px)">
          <template #button>
            <CountdownButton :target="loginForm.phone" @send="handleSendVerifyCode" :disabled="!loginForm.phone"
              class="verify-code-btn" />
          </template>
        </van-field>
        <div class="remember-me-cell">
          <van-checkbox v-model="loginForm.rememberMe">
            {{ $t('login.rememberMe') }}
          </van-checkbox>
        </div>
      </van-cell-group>
      <div class="login-button">
        <van-button round block type="primary" native-type="submit" :loading="loading">
          {{ $t('login.loginBtn') }}
        </van-button>
      </div>
    </van-form>

    <!-- 版权和版本信息 -->
    <div class="copyright-info">
      <p>© 2025 Vue3 Vant Mobile Template</p>
      <p>Version: {{ appVersion }}</p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import { showToast } from 'vant'
import { useI18n } from 'vue-i18n'
import { setLocale } from '@/locales'
import CountdownButton from '@/components/common/CountdownButton.vue'
import packageInfo from '../../../package.json'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const { t, locale } = useI18n()

const showLangPopover = ref(false)
const langActions = [
  { text: '简体中文', value: 'zh-CN' },
  { text: 'English', value: 'en-US' }
]

const currentLangText = computed(() => {
  const lang = langActions.find(item => item.value === locale.value)
  return lang ? lang.text : 'Language'
})

const onSelectLang = (action) => {
  setLocale(action.value)
}

const loading = ref(false)
const appVersion = ref(packageInfo.version)
const loginForm = reactive({
  username: 'admin',
  password: '123456',
  phone: '13656789878',
  verifyCode: '1234',
  rememberMe: false
})

// 页面加载时检查本地存储，自动填充已保存的用户名和密码
onMounted(() => {
  const savedUsername = localStorage.getItem('remembered_username')
  const savedPassword = localStorage.getItem('remembered_password')
  const savedPhone = localStorage.getItem('remembered_phone')

  if (savedUsername) {
    loginForm.username = savedUsername
    loginForm.rememberMe = true
  }

  if (savedPassword) {
    loginForm.password = savedPassword
  }

  if (savedPhone) {
    loginForm.phone = savedPhone
  }
})

const handleLogin = async () => {
  loading.value = true

  try {
    await userStore.login({
      username: loginForm.username,
      password: loginForm.password,
      phone: loginForm.phone,
      verifyCode: loginForm.verifyCode
    })

    // 根据记住我选项决定是否保存登录信息
    if (loginForm.rememberMe) {
      localStorage.setItem('remembered_username', loginForm.username)
      localStorage.setItem('remembered_password', loginForm.password)
      localStorage.setItem('remembered_phone', loginForm.phone)
    } else {
      // 如果没有勾选记住我，清除已保存的信息
      localStorage.removeItem('remembered_username')
      localStorage.removeItem('remembered_password')
      localStorage.removeItem('remembered_phone')
    }

    showToast(t('login.loginSuccess'))

    // 跳转到重定向页面或首页
    const redirect = route.query.redirect || '/'
    router.push(redirect)
  } catch (error) {
    showToast(error.message || t('login.loginFailed'))
  } finally {
    loading.value = false
  }
}

// 发送验证码
const handleSendVerifyCode = async target => {
  // 这里可以调用API发送验证码
  console.log('发送验证码到:', target)
  // 实际项目中，这里应该调用API
  // 例如: await sendVerifyCodeAPI(target)
  return Promise.resolve()
}
</script>

<style lang="scss" scoped>
.login-container {
  position: relative;
  min-height: 100vh;
  padding: $spacing-lg 16px;
  background: linear-gradient(to bottom, #1e88e5, #42a5f5, #90caf9);
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  .login-form {
    max-width: 400px;
    margin: 0 auto;
    padding: 20px 0;
    border-radius: 15px;
    overflow: hidden;
    background-color: #fff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .login-header {
    padding: 60px 0 40px;
    text-align: center;

    .login-title {
      font-size: 28px;
      font-weight: 600;
      color: white;
      margin: 0;
    }
  }

  .lang-switch {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 10;

    .lang-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      color: rgba(255, 255, 255, 0.9);
      font-size: 14px;
      padding: 6px 12px;
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      backdrop-filter: blur(4px);
      cursor: pointer;
      transition: all 0.3s ease;

      &:active {
        background-color: rgba(255, 255, 255, 0.2);
        transform: scale(0.95);
      }

      .lang-text {
        font-weight: 500;
      }
    }
  }

  .login-form {

    // 错误抖动动画
    &.shake {
      animation: shake 0.5s ease-in-out;
    }

    // 输入框样式优化
    :deep(.van-cell-group) {
      width: 100%;
      border-radius: 15px;
      overflow: hidden;

      .van-field {
        --van-field-label-width: 90px;

        // 错误状态样式
        &.van-field--error {
          background-color: rgba(255, 245, 245, 0.9);

          .van-field__control {
            color: var(--danger-color);
          }

          .van-field__label {
            color: var(--danger-color);
          }
        }

        // 错误信息样式
        .van-field__error-message {
          color: var(--danger-color);
          font-size: 12px;
          animation: fadeIn 0.3s ease-in-out;
        }
      }
    }

    .remember-me-container,
    .remember-me-cell {
      padding: var(--van-cell-vertical-padding) var(--van-cell-horizontal-padding); // 使用Vant的默认padding值
      display: flex;
      justify-content: flex-start;
      align-items: center;
      margin-left: 0; // 去掉左侧margin

      // 优化复选框字体大小，与输入框保持一致
      :deep(.van-checkbox) {
        .van-checkbox__label {
          font-size: 14px;
          color: var(--text-regular);
        }
      }
    }

    .login-button {
      margin-top: $spacing-lg;
      padding: 0 16px; // 添加内边距，确保按钮不会贴边

      :deep(.van-button) {

        // 加载状态样式
        &.van-button--loading {
          opacity: 0.8;
        }
      }
    }

    // 验证码按钮响应式样式
    :deep(.verify-code-btn) {
      min-width: 80px;
      max-width: 100px;
      padding: 0 8px;
      font-size: clamp(11px, 2.8vw, 13px); // 响应式字体大小
      white-space: nowrap; // 防止文字换行

      .van-button {
        padding: 0 4px;
        font-size: inherit;
      }
    }
  }

  // 版权和版本信息样式
  .copyright-info {
    text-align: center;
    padding: 20px 0;
    color: rgba(255, 255, 255, 1);
    font-size: 12px;
    line-height: 1.5;

    p {
      margin: 5px 0;
    }
  }

  // 登录成功动画
  .success-animation {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.9);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    animation: fadeIn 0.5s ease-in-out;

    .success-icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background-color: var(--success-color);
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: $spacing-lg;
      animation: scaleIn 0.5s ease-in-out;

      :deep(.van-icon) {
        font-size: 40px;
        color: white;
      }
    }

    .success-text {
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary);
      animation: slideUp 0.5s ease-in-out;
    }
  }
}

// 动画定义
@keyframes shake {

  0%,
  100% {
    transform: translateX(0);
  }

  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-5px);
  }

  20%,
  40%,
  60%,
  80% {
    transform: translateX(5px);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes scaleIn {
  from {
    transform: scale(0);
  }

  to {
    transform: scale(1);
  }
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
