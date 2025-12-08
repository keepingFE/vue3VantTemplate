<template>
  <div class="user-container">
    <van-nav-bar :title="$t('route.user')" fixed placeholder />

    <div class="user-content">
      <!-- 用户信息卡片 -->
      <div class="user-card">
        <div class="user-avatar">
          <van-image round width="80" height="80" :src="defaultAvatar" />
        </div>
        <div class="user-info">
          <div class="user-name">
            {{ userStore.username || $t('user.guest') }}
          </div>
          <div class="user-desc">
            {{ userStore.userInfo?.email || $t('user.notLoggedIn') }}
          </div>
        </div>
      </div>

      <!-- 设置列表 -->
      <van-cell-group inset class="user-settings">
        <van-cell :title="$t('user.profile')" icon="user-o" is-link @click="handleProfile" />
        <van-cell :title="$t('order.title')" icon="orders-o" is-link @click="handleOrders" />
        <van-cell :title="$t('user.pdfPreview')" icon="description-o" is-link @click="handlePdfDemo" />
        <van-cell :title="$t('user.markdownPreview')" icon="notes-o" is-link @click="handleMarkdownDemo" />
        <van-cell title="大文件上传" icon="upgrade" is-link @click="handleLargeFileUpload" />
        <van-cell title="精彩活动" icon="fire-o" is-link @click="handleActivity" />
        <van-cell title="图片瀑布流" icon="photo-o" is-link @click="handleWaterfall" />
        <van-cell :title="$t('user.chat')" icon="chat-o" is-link @click="handleChat" />
        <van-cell :title="$t('user.aiChat')" icon="service-o" is-link @click="handleAiChat" />
        <van-cell :title="$t('user.theme')" icon="brush-o" is-link @click="showThemePopup = true" />
        <van-cell :title="$t('user.language')" icon="guide-o" is-link @click="showLanguagePopup = true" />
      </van-cell-group>


      <!-- 退出登录 -->
      <div class="user-logout" v-if="userStore.isLoggedIn">
        <van-button block round type="danger" @click="handleLogout">
          {{ $t('user.logout') }}
        </van-button>
      </div>

      <!-- 登录按钮 -->
      <div class="user-login" v-else>
        <van-button block round type="primary" @click="handleLogin">
          {{ $t('route.login') }}
        </van-button>
      </div>
    </div>

    <!-- 主题选择弹窗 -->
    <van-popup v-model:show="showThemePopup" position="bottom" round>
      <van-picker :title="$t('user.themeColor')" :columns="themeColors" @confirm="handleThemeConfirm"
        @cancel="showThemePopup = false" />
    </van-popup>

    <!-- 语言选择弹窗 -->
    <van-popup v-model:show="showLanguagePopup" position="bottom" round>
      <van-picker :title="$t('user.language')" :columns="languageOptions" @confirm="handleLanguageConfirm"
        @cancel="showLanguagePopup = false" />
    </van-popup>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import { useTheme } from '@/hooks/useTheme'
import { setLocale } from '@/locales'
import { showToast, showConfirmDialog } from 'vant'
import { useI18n } from 'vue-i18n'
import { languages } from '@/config'

const defaultAvatar = new URL('@/assets/images/person.png', import.meta.url).href
const router = useRouter()
const userStore = useUserStore()
const { changeThemeColor, getAllThemeColors } = useTheme()
const { t } = useI18n()

const showThemePopup = ref(false)
const showLanguagePopup = ref(false)

// 主题色选项
const themeColors = getAllThemeColors().map(item => ({
  text: item.name,
  value: item.key
}))

// 语言选项
const languageOptions = languages(t)

const handleProfile = () => {
  router.push('/user/profile')
}

const handlePdfDemo = () => {
  router.push('/user/pdfPreview')
}

const handleMarkdownDemo = () => {
  router.push('/markdown')
}

const handleChat = () => {
  router.push('/message')
}

const handleAiChat = () => {
  router.push('/ai-chat')
}

const handleLargeFileUpload = () => {
  router.push('/upload/large-file')
}

const handleActivity = () => {
  router.push('/activity/list')
}

const handleWaterfall = () => {
  router.push('/waterfall')
}

const handleOrders = () => {
  router.push('/order/list')
}


const handleSettings = () => {
  showToast(t('common.success'))
}

const handleThemeConfirm = ({ selectedOptions }) => {
  const colorKey = selectedOptions[0].value
  changeThemeColor(colorKey)
  showThemePopup.value = false
  showToast(t('common.success'))
}

const handleLanguageConfirm = ({ selectedOptions }) => {
  const locale = selectedOptions[0].value
  setLocale(locale)
  showLanguagePopup.value = false
  showToast(t('common.success'))
}

const handleLogin = () => {
  router.push('/login')
}

const handleLogout = async () => {
  try {
    await showConfirmDialog({
      title: t('common.tips'),
      message: t('user.logoutConfirm')
    })
    await userStore.logout()
    showToast(t('user.logoutSuccess'))
    router.push('/login')
  } catch (error) {
    console.log(error)
  }
}
</script>

<style lang="scss" scoped>
.user-container {
  background-color: var(--bg-color);

  .user-content {
    .user-card {
      background: linear-gradient(135deg, var(--theme-color) 0%, var(--theme-color-dark) 100%);
      padding: $spacing-xl;
      display: flex;
      align-items: center;
      margin-bottom: $spacing-md;

      .user-avatar {
        margin-right: $spacing-md;
      }

      .user-info {
        flex: 1;

        .user-name {
          font-size: $font-size-xl;
          font-weight: 600;
          color: #fff;
          margin-bottom: $spacing-xs;
        }

        .user-desc {
          font-size: $font-size-sm;
          color: rgba(255, 255, 255, 0.8);
        }
      }
    }

    .user-settings {
      margin-bottom: $spacing-md;
    }

    .user-logout,
    .user-login {
      padding: $spacing-md;
    }
  }
}
</style>
