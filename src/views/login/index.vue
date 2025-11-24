<template>
  <div class="login-container">
    <div class="login-header">
      <h1 class="login-title">{{ $t('login.title') }}</h1>
    </div>
    
    <van-form @submit="handleLogin" class="login-form">
      <van-cell-group inset>
        <van-field
          v-model="loginForm.username"
          name="username"
          :label="$t('login.username')"
          :placeholder="$t('login.usernamePlaceholder')"
          :rules="[{ required: true, message: $t('login.usernameRequired') }]"
          clearable
        />
        <van-field
          v-model="loginForm.password"
          type="password"
          name="password"
          :label="$t('login.password')"
          :placeholder="$t('login.passwordPlaceholder')"
          :rules="[{ required: true, message: $t('login.passwordRequired') }]"
          clearable
        />
      </van-cell-group>
      
      <div class="login-options">
        <van-checkbox v-model="loginForm.rememberMe">
          {{ $t('login.rememberMe') }}
        </van-checkbox>
      </div>
      
      <div class="login-button">
        <van-button
          round
          block
          type="primary"
          native-type="submit"
          :loading="loading"
        >
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
    .login-options {
      padding: $spacing-md 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .login-button {
      margin-top: $spacing-lg;
    }
  }
}
</style>

