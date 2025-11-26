<template>
    <div class="chat-demo">
        <Chat :title="chatTitle" :messages="chatMessages" :is-loading="isLoading" :is-sending="isSending"
            :user-avatar="userAvatar" :bot-avatar="botAvatar" @send-message="handleSendMessage" />
    </div>
</template>

<script setup>
    import { ref, computed } from 'vue'
    import Chat from '@/components/chat/Chat.vue'
    import { showToast } from 'vant'

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

    // 头像配置
    const userAvatar = ref('https://picsum.photos/seed/user123/100/100.jpg')
    const botAvatar = ref('https://picsum.photos/seed/bot456/100/100.jpg')

    // 动态标题
    const chatTitle = computed(() => {
        return isLoading.value ? 'AI 助手 (思考中...)' : 'AI 助手'
    })

    // Simulated API call
    const simulateAiResponse = async (userMessage) => {
        isLoading.value = true

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000))

        // Simulated responses
        const responses = [
            '这是一个很好的问题！我来帮您解答。',
            '我理解您的意思。根据我的知识库，...',
            '您可以尝试以下方法来解决这个问题：',
            '感谢您的提问，这是一个常见的问题。',
            `您说的 "${userMessage}" 很有意思，让我想想...`,
            '根据我的分析，这个问题有几个可能的解决方案。',
            '让我为您详细解释一下这个概念。',
            '这是一个复杂的话题，我会尽量简单地解释。'
        ]

        const randomResponse = responses[Math.floor(Math.random() * responses.length)]

        chatMessages.value.push({
            type: 'bot',
            content: randomResponse,
            avatar: botAvatar.value,
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
            avatar: userAvatar.value,
            time: new Date()
        })

        isSending.value = true

        try {
            // Simulate API call
            await simulateAiResponse(message)
        } catch (error) {
            console.error('Error sending message:', error)
            showToast('发送失败，请重试')

            // 添加系统错误消息
            chatMessages.value.push({
                type: 'system',
                content: '消息发送失败，请重试',
                time: new Date()
            })
        } finally {
            isSending.value = false
        }
    }
</script>

<style lang="scss" scoped>
    .chat-demo {
        display: flex;
        flex-direction: column;
        height: 100vh;
        background-color: var(--bg-color);
    }
</style>
