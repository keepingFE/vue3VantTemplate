<template>
    <div class="ai-chat-container">
        <van-nav-bar :title="$t('route.aiChat')" fixed placeholder left-arrow @click-left="handleGoBack" />

        <Chat title="AI 助手" :messages="chatMessages" :is-loading="isLoading" :is-sending="isSending"
            @send-message="handleSendMessage" />
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
const chatMessages = ref([
    {
        type: 'bot',
        content: '你好！我是 AI 助手，有什么我可以帮助你的吗？',
        avatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
        time: new Date()
    }
])

const isLoading = ref(false)
const isSending = ref(false)

// Simulated API call
const simulateAiResponse = async (userMessage) => {
    isLoading.value = true

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Simulated responses
    const responses = [
        '这是一个很好的问题！我来帮您解答。',
        '我理解您的意思。根据我的知识库，...',
        '您可以尝试以下方法来解决这个问题：',
        '感谢您的提问，这是一个常见的问题。',
        `您说的 "${userMessage}" 很有意思，让我想想...`
    ]

    const randomResponse = responses[Math.floor(Math.random() * responses.length)]

    chatMessages.value.push({
        type: 'bot',
        content: randomResponse,
        avatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
        time: new Date(),
        typing: true // 启用打字效果
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
</script>

<style lang="scss" scoped>
.ai-chat-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: var(--bg-color);
}
</style>
