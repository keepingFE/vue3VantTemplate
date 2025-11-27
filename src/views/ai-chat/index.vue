<template>
    <div class="ai-chat-container">
        <Chat 
            title="AI健康助手" 
            :messages="chatMessages" 
            :is-loading="isLoading" 
            :is-sending="isSending"
            welcome-message="您好，我是你的AI健康助手~"
            report-button-text="报告解读"
            placeholder="请输入消息..."
            @send-message="handleSendMessage"
            @back="handleGoBack"
            @menu="handleMenu"
            @question-click="handleQuestionClick"
            @report-click="handleReportClick"
            @upload-option="handleUploadOption"
            @nav-click="handleNavClick"
            @voice-click="handleVoiceClick"
            @add-click="handleAddClick"
            @send-file="handleSendFile"
            @update:messages="chatMessages = $event"
        />
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Chat from '@/components/chat/Chat.vue'
import { showToast } from 'vant'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { t } = useI18n()

// State
const chatMessages = ref([])

const isLoading = ref(false)
const isSending = ref(false)

// Simulated API call
const simulateAiResponse = async (userMessage) => {
    isLoading.value = true

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Simulated responses
    const responses = [
        '这是一个很好的问题！根据您的情况，我建议您注意以下几点：\n1. 保持规律的作息时间\n2. 适量运动\n3. 均衡饮食',
        '我理解您的意思。根据我的知识库，这种情况是比较常见的。建议您可以：\n• 多喝水\n• 保持良好心态\n• 必要时咨询专业医生',
        '您可以尝试以下方法来改善：\n① 调整饮食结构\n② 增加户外活动\n③ 保持心情愉悦',
        '感谢您的提问，这是一个常见的健康问题。让我为您详细解答...',
        `关于 "${userMessage}" 这个问题，我的建议是：注意日常保健，保持健康的生活方式。`
    ]

    const randomResponse = responses[Math.floor(Math.random() * responses.length)]

    chatMessages.value.push({
        type: 'bot',
        content: randomResponse,
        avatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
        time: new Date(),
        typing: true, // 启用打字效果
        typingSpeed: 30
    })

    isLoading.value = false
}

// Handle send message
const handleSendMessage = async (message) => {
    // Add user message
    chatMessages.value.push({
        type: 'user',
        content: message,
        avatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
        time: new Date()
    })

    isSending.value = true

    try {
        // Simulate API call
        await simulateAiResponse(message)
    } catch (error) {
        console.error('Error sending message:', error)
        showToast('发送失败，请重试')
    } finally {
        isSending.value = false
    }
}

// Handle go back
const handleGoBack = () => {
    router.back()
}

// Handle menu
const handleMenu = () => {
    showToast('菜单功能')
}

// Handle question click
const handleQuestionClick = (question) => {
    console.log('Question clicked:', question)
    // Question will be auto-sent by Chat component
}

// Handle report click
const handleReportClick = () => {
    showToast('报告解读功能开发中...')
}

// Handle upload option
const handleUploadOption = (option) => {
    console.log('Upload option:', option)
    
    if (option.type === 'file') {
        // Simulate file upload
        chatMessages.value.push({
            type: 'file',
            fileType: 'pdf',
            fileName: '高血压饮食.PDF',
            avatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
            time: new Date()
        })
        
        // Simulate AI response after upload
        setTimeout(() => {
            chatMessages.value.push({
                type: 'bot',
                content: '收到您的文件，正在为您分析...',
                avatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
                time: new Date(),
                typing: true
            })
        }, 1000)
    } else {
        showToast(`${option.text}功能开发中...`)
    }
}

// Handle nav click
const handleNavClick = (navItem) => {
    console.log('Navigation clicked:', navItem)
    showToast(`切换到：${navItem.text}`)
}

// Handle voice click
const handleVoiceClick = () => {
    showToast('语音输入功能开发中...')
}

// Handle send file
const handleSendFile = (file) => {
    // Create file message
    chatMessages.value.push({
        type: 'file',
        fileType: file.name.split('.').pop(),
        fileName: file.name,
        avatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
        time: new Date()
    })
    
    // Simulate AI response
    setTimeout(() => {
        chatMessages.value.push({
            type: 'bot',
            content: '收到您的文件，正在为您分析...',
            avatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
            time: new Date(),
            typing: true
        })
    }, 1000)
}

// Handle add click
const handleAddClick = () => {
    showToast('添加功能开发中...')
}
</script>

<style lang="scss" scoped>
.ai-chat-container {
    width: 100%;
    height: 100vh;
    overflow: hidden;
}
</style>

