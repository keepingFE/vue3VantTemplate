<template>
  <div class="profile-page">
    <van-nav-bar :title="$t('user.profile')" left-arrow fixed placeholder @click-left="handleBack" />

    <div class="profile-content">
      <!-- Avatar Section -->
      <div class="avatar-section">
        <van-uploader :after-read="handleAvatarUpload" :max-count="1" :preview-image="false" accept="image/*"
          result-type="dataUrl">
          <div class="avatar-wrapper">
            <van-image round width="100" height="100" fit="cover" :src="form.avatar || defaultAvatar" />
            <div class="camera-icon">
              <van-icon name="photograph" />
            </div>
          </div>
        </van-uploader>
      </div>

      <van-form @submit="handleSubmit">
        <!-- Basic Info -->
        <div class="section-title">
          {{ $t('user.basicInfo') }}
        </div>
        <van-cell-group inset>
          <!-- Name -->
          <van-field v-model="form.name" name="name" :label="$t('user.nameLabel')"
            :placeholder="$t('user.namePlaceholder')" input-align="right" maxlength="20" show-word-limit />

          <!-- Username -->
          <van-field v-model="form.username" name="username" :label="$t('user.usernameLabel')"
            :placeholder="$t('user.usernameLabel')" input-align="right"
            :rules="[{ required: true, message: $t('validation.required') }]" />

          <!-- Gender -->
          <van-field v-model="genderText" is-link readonly name="gender" :label="$t('user.genderLabel')"
            :placeholder="$t('user.selectGender')" input-align="right" @click="showGenderSheet = true" />

          <!-- Birthday -->
          <van-field v-model="form.birthday" is-link readonly name="birthday" :label="$t('user.birthdayLabel')"
            :placeholder="$t('user.selectBirthday')" input-align="right" @click="showBirthdayPicker = true" />

          <!-- Bio -->
          <van-field v-model="form.bio" name="bio" :label="$t('user.bioLabel')" :placeholder="$t('user.bioLabel')"
            type="textarea" rows="2" autosize maxlength="100" show-word-limit input-align="right" />

          <!-- Job -->
          <van-field v-model="form.job" name="job" :label="$t('user.jobLabel')" :placeholder="$t('user.jobPlaceholder')"
            input-align="right" maxlength="50" show-word-limit />

          <!-- Homepage -->
          <van-field v-model="form.homepage" name="homepage" type="url" :label="$t('user.homepageLabel')"
            :placeholder="$t('user.homepagePlaceholder')" input-align="right"
            :rules="[{ validator: validateURL, message: $t('validation.url') }]" />
        </van-cell-group>

        <!-- Contact Info -->
        <div class="section-title">
          {{ $t('user.contactInfo') }}
        </div>
        <van-cell-group inset>
          <!-- Email -->
          <van-field v-model="form.email" name="email" type="email" :label="$t('user.emailLabel')"
            :placeholder="$t('user.emailLabel')" input-align="right" :rules="[
              { required: true, message: $t('validation.required') },
              { validator: validateEmail, message: $t('validation.email') }
            ]" />
          <!-- Phone -->
          <van-field v-model="form.phone" name="phone" type="tel" :label="$t('user.phoneLabel')"
            :placeholder="$t('user.phoneLabel')" input-align="right"
            :rules="[{ validator: validatePhone, message: $t('validation.phone') }]" />
          <!-- WeChat -->
          <van-field v-model="form.wechat" name="wechat" :label="$t('user.wechatLabel')"
            :placeholder="$t('user.wechatPlaceholder')" input-align="right" maxlength="50" />
        </van-cell-group>

        <!-- Address Info -->
        <div class="section-title">
          {{ $t('user.addressLabel') }}
        </div>
        <van-cell-group inset>
          <!-- Area Picker -->
          <van-field :model-value="areaText" is-link readonly name="addressArea" :label="$t('user.addressAreaLabel')"
            :placeholder="$t('user.selectArea')" input-align="right" @click="showAreaPicker = true" />
          <!-- Address Detail -->
          <van-field v-model="form.addressDetail" name="addressDetail" :label="$t('user.addressDetailLabel')"
            :placeholder="$t('user.addressDetailPlaceholder')" input-align="right" maxlength="100" show-word-limit />
        </van-cell-group>

        <div class="submit-bar">
          <van-button block round type="primary" native-type="submit" :loading="saving">
            {{ $t('user.saveProfile') }}
          </van-button>
        </div>
      </van-form>
    </div>

    <!-- Gender Action Sheet -->
    <van-action-sheet v-model:show="showGenderSheet" :actions="genderActions" @select="onGenderSelect"
      :cancel-text="$t('common.cancel')" close-on-click-action />

    <!-- Birthday Picker -->
    <BirthdayPicker v-model:show="showBirthdayPicker" v-model:modelValue="form.birthday"
      :title="$t('user.selectBirthday')" format="YYYY-MM-DD HH:mm:ss" />

    <!-- Area Picker -->
    <AddressPicker v-model:show="showAreaPicker" :modelValue="form.addressArea" :title="$t('user.selectArea')"
      @update:modelValue="handleAreaUpdate" @confirm="onAreaConfirm" />
  </div>
</template>

<script setup>
defineOptions({
  name: 'UserProfile'
})

import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useUserStore } from '@/store/modules/user'
import { useI18n } from 'vue-i18n'
import { isValidPhone, isValidURL } from '@/utils/validate'
import BirthdayPicker from '@/components/common/BirthdayPicker.vue'
import AddressPicker from '@/components/common/AddressPicker.vue'
import { areaList } from '@vant/area-data'

const router = useRouter()
const userStore = useUserStore()
const { t } = useI18n()

const defaultAvatar = 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'
const saving = ref(false)
const showGenderSheet = ref(false)
const showBirthdayPicker = ref(false)
const showAreaPicker = ref(false)

const form = reactive({
  avatar: '',
  name: '', // 姓名
  username: '',
  email: '',
  phone: '',
  wechat: '', // 微信号
  bio: '',
  gender: 0, // 0: Secret, 1: Male, 2: Female
  birthday: '',
  job: '', // 工作岗位
  homepage: '', // 个人主页
  addressArea: [], // 省市区代码数组，如 ['110000', '110100', '110101']
  addressDetail: '' // 详细地址
})

const genderActions = computed(() => [
  { name: t('user.male'), value: 1 },
  { name: t('user.female'), value: 2 },
  { name: t('user.secret'), value: 0 }
])

const genderText = computed(() => {
  const action = genderActions.value.find(item => item.value === form.gender)
  return action ? action.name : t('user.secret')
})

// 获取省市区文本显示
const areaText = computed(() => {
  if (!form.addressArea || !Array.isArray(form.addressArea) || form.addressArea.length < 3) {
    return ''
  }

  const provinceCode = form.addressArea[0]
  const cityCode = form.addressArea[1]
  const districtCode = form.addressArea[2]

  // 确保 areaList 数据存在
  if (!areaList || !areaList.province_list) {
    return ''
  }

  const province = areaList.province_list[provinceCode] || ''
  const city = areaList.city_list?.[cityCode] || ''
  const district = areaList.county_list?.[districtCode] || ''

  const addressParts = [province, city, district].filter(Boolean)
  return addressParts.join(' ')
})

const lastUpdateTime = computed(() => userStore.userInfo?.updateTime || '')

const syncForm = (info) => {
  if (!info) return
  form.avatar = info.avatar || ''
  form.name = info.name || ''
  form.username = info.username || ''
  form.email = info.email || ''
  form.phone = info.phone || ''
  form.wechat = info.wechat || ''
  form.bio = info.bio || ''
  form.gender = info.gender !== undefined ? info.gender : 0
  form.birthday = info.birthday || ''
  form.job = info.job || ''
  form.homepage = info.homepage || ''
  form.addressArea = info.addressArea && Array.isArray(info.addressArea) ? [...info.addressArea] : []
  form.addressDetail = info.addressDetail || ''
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
const validatePhone = (val) => !val || isValidPhone(val)
const validateURL = (val) => !val || isValidURL(val)

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

const onGenderSelect = (action) => {
  form.gender = action.value
}

// 处理省市区更新（确保响应式更新）
const handleAreaUpdate = (codes) => {
  if (codes && Array.isArray(codes) && codes.length >= 3) {
    // 创建新数组以确保响应式更新
    form.addressArea = [...codes]
  } else {
    form.addressArea = []
  }
}

// 省市区选择确认
const onAreaConfirm = (data) => {
  // handleAreaUpdate 已经通过 @update:modelValue 处理了更新
  // 这里可以做一些额外的处理，比如验证等
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
  background-color: var(--bg-color, #f7f8fa);
  padding-bottom: 40px;
}

.profile-content {
  padding-top: $spacing-md;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-xl 0;
  background-color: transparent;

  .avatar-wrapper {
    position: relative;
    border: 4px solid #fff;
    border-radius: 50%;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 108px;
    height: 108px;

    .camera-icon {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 32px;
      height: 32px;
      background-color: var(--van-primary-color);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      border: 2px solid #fff;
      font-size: 18px;
    }
  }
}

.section-title {
  padding: $spacing-md $spacing-lg $spacing-xs;
  font-size: $font-size-md;
  font-weight: 600;
  color: var(--text-primary);
}

.submit-bar {
  margin: $spacing-xl $spacing-lg;
}
</style>
