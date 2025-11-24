<template>
  <div class="profile-page">
    <van-nav-bar :title="$t('user.profile')" left-arrow fixed placeholder @click-left="handleBack" />

    <div class="profile-content">
      <section class="profile-section">
        <div class="profile-section__title">{{ $t('user.avatar') }}</div>
        <div class="profile-avatar-card">
          <van-image round width="80" height="80" :src="form.avatar || defaultAvatar" />
          <div class="profile-avatar-card__action">
            <div class="avatar-tip">{{ $t('user.avatarTip') }}</div>
            <van-uploader :after-read="handleAvatarUpload" :max-count="1" :preview-image="false" accept="image/*"
              result-type="dataUrl">
              <template #default>
                <van-button size="small" plain type="primary">
                  {{ $t('user.changeAvatar') }}
                </van-button>
              </template>
            </van-uploader>
          </div>
        </div>
      </section>

      <van-form @submit="handleSubmit">
        <section class="profile-section">
          <div class="profile-section__title">{{ $t('user.basicInfo') }}</div>
          <van-cell-group inset>
            <van-field v-model="form.username" name="username" :label="$t('user.usernameLabel')" clearable maxlength="20"
              :rules="[{ required: true, message: $t('validation.required') }]" />
            <van-field v-model="form.bio" name="bio" :label="$t('user.bioLabel')" type="textarea" rows="3"
              :maxlength="100" show-word-limit />
          </van-cell-group>
        </section>

        <section class="profile-section">
          <div class="profile-section__title">{{ $t('user.contactInfo') }}</div>
          <van-cell-group inset>
            <van-field v-model="form.email" name="email" type="email" :label="$t('user.emailLabel')" clearable
              :rules="[{ required: true, message: $t('validation.required') }, { validator: validateEmail, message: $t('validation.email') }]" />
            <van-field v-model="form.phone" name="phone" type="tel" :label="$t('user.phoneLabel')" clearable
              :rules="[{ validator: validatePhone, message: $t('validation.phone') }]" />
          </van-cell-group>
        </section>

        <div class="profile-updated" v-if="lastUpdateTime">
          {{ $t('user.updateTime') }}{{ lastUpdateTime }}
        </div>

        <div class="profile-actions">
          <van-button block round type="primary" native-type="submit" :loading="saving">
            {{ $t('user.saveProfile') }}
          </van-button>
        </div>
      </van-form>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useUserStore } from '@/store/modules/user'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const userStore = useUserStore()
const { t } = useI18n()

const defaultAvatar = 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'
const saving = ref(false)
const form = reactive({
  avatar: '',
  username: '',
  email: '',
  phone: '',
  bio: ''
})

const lastUpdateTime = computed(() => userStore.userInfo?.updateTime || '')

const syncForm = (info) => {
  if (!info) return
  form.avatar = info.avatar || ''
  form.username = info.username || ''
  form.email = info.email || ''
  form.phone = info.phone || ''
  form.bio = info.bio || ''
}

watch(
  () => userStore.userInfo,
  (info) => {
    if (info) {
      syncForm(info)
    }
  },
  { immediate: true }
)

onMounted(async () => {
  if (!userStore.userInfo) {
    try {
      const info = await userStore.getUserInfo()
      syncForm(info)
    } catch (error) {
      console.error('[profile] getUserInfo failed', error)
    }
  }
})

const validateEmail = (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
const validatePhone = (val) => !val || /^1[3-9]\d{9}$/.test(val)

const handleAvatarUpload = (file) => {
  const target = Array.isArray(file) ? file[0] : file
  if (!target) return

  if (target.content) {
    form.avatar = target.content
    showToast(t('message.operationSuccess'))
    return
  }

  if (target.file) {
    const reader = new FileReader()
    reader.onload = (event) => {
      form.avatar = event.target?.result || ''
      showToast(t('message.operationSuccess'))
    }
    reader.onerror = () => {
      showToast(t('message.operationFailed'))
    }
    reader.readAsDataURL(target.file)
  }
}

const handleSubmit = async () => {
  saving.value = true
  try {
    await userStore.updateUserInfo({ ...form })
    showToast(t('message.updateSuccess'))
  } catch (error) {
    showToast(error.message || t('message.operationFailed'))
  } finally {
    saving.value = false
  }
}

const handleBack = () => {
  router.back()
}
</script>

<style lang="scss" scoped>
.profile-page {
  min-height: 100vh;
  background-color: var(--bg-color);
}

.profile-content {
  padding: $spacing-md;
  padding-bottom: 80px;
}

.profile-section {
  margin-bottom: $spacing-lg;

  &__title {
    font-size: $font-size-base;
    font-weight: 600;
    color: var(--text-secondary);
    margin-bottom: $spacing-sm;
  }
}

.profile-avatar-card {
  display: flex;
  align-items: center;
  padding: $spacing-md;
  background-color: var(--bg-white);
  border-radius: $border-radius-lg;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.04);

  &__action {
    margin-left: $spacing-md;
  }

  .avatar-tip {
    font-size: 12px;
    color: var(--text-regular);
    margin-bottom: $spacing-xs;
  }
}

.profile-updated {
  font-size: 12px;
  color: var(--text-regular);
  text-align: center;
  margin-bottom: $spacing-sm;
}

.profile-actions {
  padding: 0 $spacing-sm;
}
</style>
