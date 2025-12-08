<template>
    <div class="register-container">
        <div class="register-header">
            <h1 class="register-title">{{ $t('register.title') }}</h1>
        </div>

        <!-- 语言切换 -->
        <div class="lang-switch">
            <van-popover v-model:show="showLangPopover" :actions="langActions" @select="onSelectLang"
                placement="bottom-end" theme="light">
                <template #reference>
                    <div class="lang-btn">
                        <van-icon name="exchange" size="20" />
                        <span class="lang-text">{{ currentLangText }}</span>
                    </div>
                </template>
            </van-popover>
        </div>

        <van-form @submit="handleRegister" class="register-form">
            <van-cell-group>
                <van-field v-model="registerForm.username" name="username" :label="$t('register.username')"
                    :placeholder="$t('register.usernamePlaceholder')" :rules="[
                        { required: true, message: $t('register.usernameRequired') },
                        {
                            validator: validateUsername,
                            message: $t('register.usernameLength')
                        }
                    ]" clearable />

                <van-field v-model="registerForm.email" name="email" :label="$t('register.email')"
                    :placeholder="$t('register.emailPlaceholder')" :rules="[
                        { required: true, message: $t('register.emailRequired') },
                        {
                            validator: validateEmail,
                            message: $t('register.invalidEmail')
                        }
                    ]" clearable />

                <van-field v-model="registerForm.phone" name="phone" :label="$t('register.phone')"
                    :placeholder="$t('register.phonePlaceholder')" :rules="[
                        { required: true, message: $t('register.phoneRequired') },
                        {
                            validator: validatePhone,
                            message: $t('register.invalidPhone')
                        }
                    ]" clearable />

                <van-field v-model="registerForm.verifyCode" name="verifyCode" :label="$t('register.verifyCode')"
                    :placeholder="$t('register.verifyCodePlaceholder')"
                    :rules="[{ required: true, message: $t('register.verifyCodeRequired') }]" clearable
                    style="--van-field-input-width: calc(100% - 100px)">
                    <template #button>
                        <CountdownButton :target="registerForm.phone" @send="handleSendVerifyCode"
                            :disabled="!registerForm.phone" class="verify-code-btn" />
                    </template>
                </van-field>

                <van-field v-model="registerForm.password" type="password" name="password"
                    :label="$t('register.password')" :placeholder="$t('register.passwordPlaceholder')" :rules="[
                        { required: true, message: $t('register.passwordRequired') },
                        {
                            validator: validatePassword,
                            message: $t('register.passwordLength')
                        }
                    ]" clearable />

                <van-field v-model="registerForm.confirmPassword" type="password" name="confirmPassword"
                    :label="$t('register.confirmPassword')" :placeholder="$t('register.confirmPasswordPlaceholder')"
                    :rules="[
                        { required: true, message: $t('register.confirmPasswordRequired') },
                        {
                            validator: validateConfirmPassword,
                            message: $t('register.passwordNotMatch')
                        }
                    ]" clearable />

                <div class="agreement-cell">
                    <van-checkbox v-model="registerForm.agreement">
                        <span class="agreement-text">
                            {{ $t('register.agreement') }}
                            <span class="agreement-link">{{ $t('register.userAgreement') }}</span>
                            <span class="agreement-link">{{ $t('register.privacyPolicy') }}</span>
                        </span>
                    </van-checkbox>
                </div>
            </van-cell-group>

            <div class="register-button">
                <van-button round block type="primary" native-type="submit" :loading="loading">
                    {{ $t('register.registerBtn') }}
                </van-button>
            </div>

            <div class="login-link">
                <span>{{ $t('login.hasAccount') }}</span>
                <router-link to="/login" class="link-text">{{ $t('login.goLogin') }}</router-link>
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
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import { showToast } from 'vant'
import { useI18n } from 'vue-i18n'
import { setLocale } from '@/locales'
import CountdownButton from '@/components/common/CountdownButton.vue'
import packageInfo from '../../../package.json'

const router = useRouter()
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
const registerForm = reactive({
    username: '',
    email: '',
    phone: '',
    verifyCode: '',
    password: '',
    confirmPassword: '',
    agreement: false
})

// 验证用户名长度
const validateUsername = (value) => {
    return value.length >= 3 && value.length <= 20
}

// 验证邮箱格式
const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value)
}

// 验证手机号格式
const validatePhone = (value) => {
    const phoneRegex = /^1[3-9]\d{9}$/
    return phoneRegex.test(value)
}

// 验证密码长度
const validatePassword = (value) => {
    return value.length >= 6 && value.length <= 20
}

// 验证确认密码
const validateConfirmPassword = (value) => {
    return value === registerForm.password
}

// 发送验证码
const handleSendVerifyCode = async (target) => {
    console.log('发送验证码到:', target)
    // 实际项目中，这里应该调用API
    // 例如: await sendVerifyCodeAPI(target)
    return Promise.resolve()
}

const handleRegister = async () => {
    // 检查是否同意协议
    if (!registerForm.agreement) {
        showToast(t('register.agreementRequired'))
        return
    }

    loading.value = true

    try {
        // 这里应该调用注册API
        // await userStore.register({
        //   username: registerForm.username,
        //   email: registerForm.email,
        //   phone: registerForm.phone,
        //   verifyCode: registerForm.verifyCode,
        //   password: registerForm.password
        // })

        // 模拟注册成功
        await new Promise(resolve => setTimeout(resolve, 1000))

        showToast(t('register.registerSuccess'))

        // 注册成功后跳转到登录页
        setTimeout(() => {
            router.push('/login')
        }, 1500)
    } catch (error) {
        showToast(error.message || t('register.registerFailed'))
    } finally {
        loading.value = false
    }
}
</script>

<style lang="scss" scoped>
.register-container {
    position: relative;
    min-height: 100vh;
    padding: $spacing-lg 16px;
    background: linear-gradient(to bottom, #1e88e5, #42a5f5, #90caf9);
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .register-form {
        max-width: 400px;
        margin: 0 auto;
        padding: 20px 0;
        border-radius: 15px;
        overflow: hidden;
        background-color: #fff;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .register-header {
        padding: 60px 0 40px;
        text-align: center;

        .register-title {
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

    .register-form {
        :deep(.van-cell-group) {
            width: 100%;
            border-radius: 15px;
            overflow: hidden;

            .van-field {
                --van-field-label-width: 90px;

                &.van-field--error {
                    background-color: rgba(255, 245, 245, 0.9);

                    .van-field__control {
                        color: var(--danger-color);
                    }

                    .van-field__label {
                        color: var(--danger-color);
                    }
                }

                .van-field__error-message {
                    color: var(--danger-color);
                    font-size: 12px;
                    animation: fadeIn 0.3s ease-in-out;
                }
            }
        }

        .agreement-cell {
            padding: var(--van-cell-vertical-padding) var(--van-cell-horizontal-padding);
            display: flex;
            justify-content: flex-start;
            align-items: center;

            :deep(.van-checkbox) {
                .van-checkbox__label {
                    font-size: 13px;
                    color: var(--text-regular);
                    line-height: 1.5;

                    .agreement-text {
                        display: inline;

                        .agreement-link {
                            color: var(--primary-color);
                            font-weight: 500;
                        }
                    }
                }
            }
        }

        .register-button {
            margin-top: $spacing-lg;
            padding: 0 16px;

            :deep(.van-button) {
                &.van-button--loading {
                    opacity: 0.8;
                }
            }
        }

        .login-link {
            text-align: center;
            margin-top: $spacing-md;
            font-size: 14px;
            color: var(--text-regular);

            .link-text {
                color: var(--primary-color);
                font-weight: 500;
                margin-left: 4px;
                text-decoration: none;
            }
        }

        :deep(.verify-code-btn) {
            min-width: 80px;
            max-width: 100px;
            padding: 0 8px;
            font-size: clamp(11px, 2.8vw, 13px);
            white-space: nowrap;

            .van-button {
                padding: 0 4px;
                font-size: inherit;
            }
        }
    }

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
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}
</style>
