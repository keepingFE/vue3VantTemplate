<template>
  <div class="login-container">
    <div class="login-header">
      <h1 class="login-title">{{ $t('login.title') }}</h1>
    </div>

    <van-form @submit="handleLogin" class="login-form">
      <van-cell-group inset>
        <van-field v-model="loginForm.username" name="username" :label="$t('login.username')"
          :placeholder="$t('login.usernamePlaceholder')"
          :rules="[{ required: true, message: $t('login.usernameRequired') }]" clearable />
        <van-field v-model="loginForm.password" type="password" name="password" :label="$t('login.password')"
          :placeholder="$t('login.passwordPlaceholder')"
          :rules="[{ required: true, message: $t('login.passwordRequired') }]" clearable />
      </van-cell-group>
      <van-cell-group inset>
        <div class="login-options">
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
  </div>
</template>

<script setup>
  import { reactive, ref } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { useUserStore } from '@/store/modules/user'
  import { showToast } from 'vant'
  import { useI18n } from 'vue-i18n'

  const router = useRouter()
  const route = useRoute()
  const userStore = useUserStore()
  const { t } = useI18n()

  const loading = ref(false)
  const loginForm = reactive({
    username: '',
    password: '',
    rememberMe: false
  })

  const handleLogin = async () => {
    loading.value = true

    try {
      await userStore.login({
        username: loginForm.username,
        password: loginForm.password
      })

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
</script>

<style lang="scss" scoped>
  .login-container {
    min-height: 100vh;
    padding: $spacing-xl;
    background: linear-gradient(135deg, var(--theme-color-lighter) 0%, var(--bg-white) 100%);

    .login-header {
      padding: 60px 0 40px;
      text-align: center;

      .login-title {
        font-size: 28px;
        font-weight: 600;
        color: var(--text-primary);
        margin: 0;
      }
    }

    .login-form {

      // 错误抖动动画
      &.shake {
        animation: shake 0.5s ease-in-out;
      }

      // 输入框样式优化
      :deep(.van-cell-group) {
        .van-field {

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

      .login-options {
        padding: $spacing-md 0;
        display: flex;
        justify-content: space-between;
        align-items: center;

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

        :deep(.van-button) {

          // 加载状态样式
          &.van-button--loading {
            opacity: 0.8;
          }
        }
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
