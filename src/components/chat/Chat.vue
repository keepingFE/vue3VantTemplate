<template>
    <div class="chat-container">
        <!-- Header -->
        <ChatHeader :title="title" @back="handleBack" @menu="handleMenu" />

        <!-- Messages Area -->
        <div class="chat-messages" ref="messagesContainer">
            <!-- Welcome Section (shown when no messages) -->
            <template v-if="messages.length === 0">
                <WelcomeSection :welcome-message="welcomeMessage" />
                <!-- 快捷问题 -->
                <QuickQuestions :questions="quickQuestions" @question-click="handleQuestionClick" />
                <!-- 上传文件 -->
                <UploadOptions :options="uploadOptions" @option-click="handleUploadOption" />
            </template>

            <!-- 消息列表 -->
            <template v-else>
                <MessageItem v-for="(message, index) in messages" :key="index" :message="message"
                    :user-avatar="userAvatar" :bot-avatar="botAvatar" @typing-complete="onTypingComplete(index)" />
            </template>
        </div>

        <!-- Chat Input -->
        <ChatInput
            v-model="inputValue" 
            :placeholder="placeholder" 
            :max-length="maxLength" 
            :images="pendingImages"
            :files="pendingFiles"
            @send="sendMessage"
            @voice-click="handleVoiceClick" 
            @add-click="handleAddClick"
            @remove-image="handleRemoveImage"
            @remove-file="handleRemoveFile"
        />

        <!-- Hidden File Input -->
        <input type="file" ref="fileInput" :accept="fileInputAccept" style="display: none" @change="handleFileChange" />
    </div>
</template>

<script setup>
    import { ref, watch, nextTick } from 'vue'
    import { showToast } from 'vant'
    import { useI18n } from 'vue-i18n'
    import { useRouter } from 'vue-router'

    // Import components
    import ChatHeader from './ChatHeader.vue'
    import WelcomeSection from './WelcomeSection.vue'
    import QuickQuestions from './QuickQuestions.vue'
    import UploadOptions from './UploadOptions.vue'
    import BottomNavigation from './BottomNavigation.vue'
    import ChatInput from './ChatInput.vue'
    import MessageItem from './MessageItem.vue'

    const { t } = useI18n()
    const router = useRouter()

    // Props
    const props = defineProps({
        title: {
            type: String,
            default: 'AI健康助手'
        },
        messages: {
            type: Array,
            default: () => []
        },
        isLoading: {
            type: Boolean,
            default: false
        },
        isSending: {
            type: Boolean,
            default: false
        },
        placeholder: {
            type: String,
            default: '请输入消息...'
        },
        maxLength: {
            type: Number,
            default: 500
        },
        userAvatar: {
            type: String,
            default: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'
        },
        botAvatar: {
            type: String,
            default: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'
        },
        welcomeMessage: {
            type: String,
            default: '您好，我是你的AI健康助手~'
        }
    })

    // Emits
    const emit = defineEmits([
        'send-message',
        'update:messages',
        'back',
        'menu',
        'question-click',
        'upload-option',
        'nav-click',
        'voice-click',
        'add-click',
        'send-file'
    ])

    // Refs
    const messagesContainer = ref(null)
    const inputValue = ref('')
    const fileInput = ref(null)
    const fileInputAccept = ref('*/*')
    const pendingImages = ref([])
    const pendingFiles = ref([])

    // Data
    const quickQuestions = ref([
        { text: '高血压饮食应注意什么？', value: 'hypertension_diet' },
        { text: '三伏天养生注意事项？', value: 'summer_health' },
        { text: '吃哪些食物有助于降低血糖？', value: 'lower_blood_sugar' }
    ])

    const uploadOptions = ref([
        { text: '上传报告照片', icon: 'photo-o', action: '去上传', type: 'photo' },
        { text: '拍照上传报告', icon: 'photograph', action: '去拍照', type: 'camera' },
        { text: '上传报告文件', icon: 'description', action: '去上传', type: 'file' }
    ])

    const navItems = ref([
        { text: '健康咨询', icon: 'chat-o', active: true, type: 'consult' },
        { text: '报告解读', icon: 'description', badge: '54人', active: false, type: 'report' },
        { text: '智能导诊', icon: 'orders-o', badge: '64人', active: false, type: 'guide' }
    ])

    // Methods
    const handleBack = () => {
        emit('back')
        router.back()
    }

    const handleMenu = () => {
        emit('menu')
        showToast('菜单功能')
    }

    const handleQuestionClick = (question) => {
        emit('question-click', question)
        sendMessage(question.text)
    }

    const handleReportClick = () => {
        emit('report-click')
        showToast('报告解读功能')
    }

    const handleUploadOption = (option) => {
        if (option.type === 'photo' || option.type === 'camera') {
            fileInputAccept.value = 'image/*'
        } else {
            fileInputAccept.value = '*/*'
        }
        nextTick(() => {
            fileInput.value.click()
        })
    }

    const handleNavClick = (item) => {
        emit('nav-click', item)
        navItems.value.forEach(nav => {
            nav.active = nav.type === item.type
        })
    }

    const handleVoiceClick = () => {
        emit('voice-click')
        showToast('语音输入功能')
    }

    const handleAddClick = () => {
        fileInputAccept.value = '*/*'
        nextTick(() => {
            fileInput.value.click()
        })
    }

    const handleFileChange = (event) => {
        const file = event.target.files[0]
        if (!file) return

        if (file.type.startsWith('image/')) {
            const reader = new FileReader()
            reader.onload = (e) => {
                pendingImages.value.push({
                    name: file.name,
                    url: e.target.result,
                    file: file
                })
            }
            reader.readAsDataURL(file)
        } else {
            pendingFiles.value.push({
                name: file.name,
                file: file
            })
        }
        
        event.target.value = ''
    }

    const handleRemoveImage = (index) => {
        pendingImages.value.splice(index, 1)
    }

    const handleRemoveFile = (index) => {
        pendingFiles.value.splice(index, 1)
    }

    const sendMessage = (messageText) => {
        const message = messageText || inputValue.value.trim()

        if (!message && pendingImages.value.length === 0 && pendingFiles.value.length === 0) {
            showToast(t('chat.emptyContent') || '请输入内容')
            return
        }

        if (message && message.length > props.maxLength) {
            showToast(t('chat.maxLengthError', { max: props.maxLength }) || `内容不能超过${props.maxLength}字`)
            return
        }

        if (message) {
            emit('send-message', message)
        }

        // Send pending files
        pendingImages.value.forEach(img => emit('send-file', img.file))
        pendingFiles.value.forEach(file => emit('send-file', file.file))

        inputValue.value = ''
        pendingImages.value = []
        pendingFiles.value = []
        scrollToBottom()
    }

    // 打字完成回调
    const onTypingComplete = (messageIndex) => {
        const updatedMessages = [...props.messages]
        if (updatedMessages[messageIndex]) {
            updatedMessages[messageIndex].typingComplete = true
            emit('update:messages', updatedMessages)
        }
    }

    const scrollToBottom = () => {
        nextTick(() => {
            if (messagesContainer.value) {
                messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
            }
        })
    }

    watch(
        () => props.isLoading,
        () => {
            scrollToBottom()
        }
    )

</script>


<style lang="scss" scoped>
    .chat-container {
        display: flex;
        flex-direction: column;
        height: 100vh;
        background: linear-gradient(180deg, #e3f2fd 0%, #f5f5f5 100%);

        .chat-messages {
            flex: 1;
            overflow-y: auto;
            overflow-x: hidden;
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 12px;

            &::-webkit-scrollbar {
                width: 4px;
            }

            &::-webkit-scrollbar-thumb {
                background: rgba(0, 0, 0, 0.2);
                border-radius: 4px;
            }

            &::-webkit-scrollbar-track {
                background: transparent;
            }
        }
    }
</style>
