<template>
    <div class="chat-container">
        <!-- Chat Header -->
        <!-- <div class="chat-header">
            <slot name="header">
                <div class="header-title">{{ title }}</div>
            </slot>
        </div> -->

        <!-- Messages Area -->
        <div class="chat-messages" ref="messagesContainer">
            <div v-if="messages.length === 0" class="empty-state">
                <van-empty description="暂无消息" />
            </div>
            <div v-for="(message, index) in messages" :key="index" class="message-item" :class="message.type">
                <!-- User Message -->
                <div v-if="message.type === 'user'" class="message-group">
                    <div class="message-content user-message">
                        <div class="bubble-wrap">
                            <div class="message-bubble">
                                <div class="bubble-text">{{ message.content }}</div>
                            </div>
                            <div v-if="message.time" class="message-time">{{ formatTime(message.time) }}</div>
                        </div>
                        <van-image v-if="message.avatar" :src="message.avatar" round width="32" height="32"
                            class="message-avatar user-avatar" />
                    </div>
                </div>

                <!-- Bot/Assistant Message -->
                <div v-else-if="message.type === 'bot' || message.type === 'assistant'" class="message-group">
                    <div class="message-content bot-message">
                        <van-image :src="message.avatar" round width="32" height="32" class="message-avatar" />
                        <div class="bubble-wrap">
                            <div class="message-bubble">
                                <div class="bubble-text">
                                    <span>
                                        {{ message.content }}
                                    </span>
                                </div>
                            </div>
                            <div v-if="message.time" class="message-time">{{ formatTime(message.time) }}</div>
                        </div>
                    </div>
                </div>

                <!-- System Message -->
                <div v-else-if="message.type === 'system'" class="message-group">
                    <div class="message-content system-message">
                        <div class="system-content">{{ message.content }}</div>
                    </div>
                </div>

                <!-- Text Message (default) -->
                <div v-else class="message-group">
                    <div class="message-content user-message">
                        <div class="bubble-wrap">
                            <div class="message-bubble">
                                <div class="bubble-text">{{ message.content }}</div>
                            </div>
                            <div v-if="message.time" class="message-time">{{ formatTime(message.time) }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Input Area (shown by default) -->
        <div class="chat-input-area">
            <div class="input-wrapper">
                <van-field ref="inputField" v-model="inputValue" type="textarea" placeholder="请输入消息..." rows="1"
                    autosize maxlength="500" @keydown="handleKeyDown" class="message-input" />
                <!-- Send button with fade-in animation -->
                <Transition name="fade-send">
                    <van-button v-if="inputValue.trim()" type="primary" size="small" round :loading="isSending"
                        @click="sendMessage" class="send-btn">
                        发送
                    </van-button>
                </Transition>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, watch, nextTick, onUnmounted } from 'vue'
import { showToast } from 'vant'

// Props
const props = defineProps({
    title: {
        type: String,
        default: '对话'
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
        default: '输入消息...'
    },
    maxLength: {
        type: Number,
        default: 500
    },
    typingSpeed: {
        type: Number,
        default: 50 // 打字速度（毫秒/字符）
    }
})

// Emits
const emit = defineEmits(['send-message', 'update:messages'])

// Refs
const messagesContainer = ref(null)
const inputValue = ref('')
const showInput = ref(true) /* show input by default */
const inputField = ref(null)

// Typing effect state
const typingStates = ref({}) // 存储每条消息的打字状态
const typingTimers = ref({}) // 存储打字定时器

// Methods
const sendMessage = () => {
    const message = inputValue.value.trim()

    if (!message) {
        showToast('请输入消息内容')
        return
    }

    if (message.length > props.maxLength) {
        showToast(`消息长度不能超过${props.maxLength}个字符`)
        return
    }

    emit('send-message', message)
    inputValue.value = ''
    scrollToBottom()
}

const toggleInput = (visible) => {
    showInput.value = visible
    if (visible) {
        nextTick(() => {
            if (inputField.value && inputField.value.focus) {
                // van-field exposes focus via ref on its input element in some setups; try both
                try { inputField.value.focus() } catch (e) { }
                const el = inputField.value?.$el?.querySelector('textarea, input')
                if (el) el.focus()
            }
        })
    }
}

const handleKeyDown = (event) => {
    // Ctrl/Cmd + Enter to send
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault()
        sendMessage()
    }
}

const formatTime = (time) => {
    if (typeof time === 'string') {
        return time
    }
    if (time instanceof Date) {
        return time.toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }
    return ''
}

const scrollToBottom = () => {
    nextTick(() => {
        if (messagesContainer.value) {
            messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
        }
    })
}

// 获取打字显示的文本
const getTypingText = (message, index) => {
    const key = `${index}-${message.content}`
    const state = typingStates.value[key]
    if (!state) return ''
    return message.content.substring(0, state.currentIndex)
}

// 检查是否正在打字
const isTyping = (message, index) => {
    const key = `${index}-${message.content}`
    const state = typingStates.value[key]
    return state && state.currentIndex < message.content.length
}

// 开始打字效果
const startTyping = (message, index) => {
    const key = `${index}-${message.content}`

    // 如果已经有打字状态，不重复开始
    if (typingStates.value[key]) return

    // 初始化打字状态
    typingStates.value[key] = {
        currentIndex: 0,
        isComplete: false
    }

    // 清除可能存在的旧定时器
    if (typingTimers.value[key]) {
        clearInterval(typingTimers.value[key])
    }

    // 创建打字定时器
    typingTimers.value[key] = setInterval(() => {
        const state = typingStates.value[key]
        if (state.currentIndex < message.content.length) {
            state.currentIndex++
            scrollToBottom() // 打字过程中保持滚动到底部
        } else {
            // 打字完成
            state.isComplete = true
            clearInterval(typingTimers.value[key])
            delete typingTimers.value[key]
        }
    }, props.typingSpeed)
}

// 清理所有打字定时器
const clearAllTypingTimers = () => {
    Object.keys(typingTimers.value).forEach(key => {
        clearInterval(typingTimers.value[key])
    })
    typingTimers.value = {}
}

// Watch messages to auto-scroll and start typing effect
watch(
    () => props.messages,
    (newMessages, oldMessages) => {
        scrollToBottom()

        // 检查是否有新的机器人消息需要打字效果
        if (newMessages.length > (oldMessages?.length || 0)) {
            const lastMessage = newMessages[newMessages.length - 1]
            const lastIndex = newMessages.length - 1

            // 如果是机器人消息且设置了 typing 属性
            if ((lastMessage.type === 'bot' || lastMessage.type === 'assistant') && lastMessage.typing) {
                nextTick(() => {
                    startTyping(lastMessage, lastIndex)
                })
            }
        }
    },
    { deep: true }
)

// Watch loading state to auto-scroll
watch(
    () => props.isLoading,
    () => {
        scrollToBottom()
    }
)

// 组件卸载时清理定时器
onUnmounted(() => {
    clearAllTypingTimers()
})
</script>

<style lang="scss" scoped>
.chat-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: var(--bg-color);

    .chat-header {
        padding: 12px 16px;
        background-color: var(--theme-color);
        color: #fff;
        font-size: 16px;
        font-weight: 600;
        border-bottom: 1px solid #eee;

        .header-title {
            text-align: center;
        }
    }

    .chat-messages {
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;

        .empty-state {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
        }

        .message-item {
            display: flex;
            flex-direction: column;
            margin-bottom: 8px;

            &.user {
                align-items: flex-end;
            }

            &.bot,
            &.assistant {
                align-items: flex-start;
            }

            &.system {
                align-items: center;
            }

            &.loading {
                align-items: flex-start;
            }

            .message-group {
                display: flex;
                flex-direction: column;
                align-items: inherit;
                padding-bottom: 20px;
            }

            .message-content {
                display: flex;
                align-items: flex-start;
                gap: 8px;
                max-width: 80%;

                &.user-message {
                    flex-direction: row;
                    margin-left: auto;
                }

                &.bot-message {
                    flex-direction: row;
                }

                .bubble-wrap {
                    display: inline-block;
                    position: relative;
                    padding-top: 18px;
                    vertical-align: top;
                }

                .message-bubble {
                    display: block;
                    padding: 10px 14px;
                    border-radius: 18px;
                    max-width: 100%;
                    word-break: normal;
                    overflow-wrap: break-word;
                    white-space: normal;
                    line-height: 1.4;
                    font-size: 14px;
                    margin-top: 6px;
                }

                &.user-message .bubble-wrap {
                    .message-time {
                        position: absolute;
                        top: 0;
                        right: 0;
                        font-size: 12px;
                        color: #999;
                    }
                }

                &.user-message .message-bubble {
                    background-color: var(--theme-color);
                    color: #fff;
                    border-top-right-radius: 0;
                    border-top-left-radius: 18px;
                    border-bottom-left-radius: 18px;
                    border-bottom-right-radius: 18px;
                }

                &.bot-message .message-bubble {
                    background-color: #f0f0f0;
                    color: #333;
                    position: relative;
                    border-top-left-radius: 0;
                    border-top-right-radius: 18px;
                    border-bottom-right-radius: 18px;
                    border-bottom-left-radius: 18px;
                }

                .message-content.bot-message .message-bubble::before {
                    content: '';
                    position: absolute;
                    top: 6px;
                    left: -8px;
                    width: 0;
                    height: 0;
                    border-top: 8px solid transparent;
                    border-bottom: 8px solid transparent;
                    border-left: 8px solid #f0f0f0;
                }

                .bubble-text {
                    display: block;
                }

                .message-time {
                    position: absolute;
                    top: 0;
                    font-size: 12px;
                    color: #999;
                }

                .message-content.bot-message .message-time {
                    left: 0;
                    right: auto;
                    text-align: left;
                }

                .message-item.user .message-time {
                    right: 0;
                }

                .message-avatar {
                    flex-shrink: 0;
                    align-self: flex-start;

                    &.user-avatar {
                        order: 2;
                        margin-right: 30px;
                    }
                }
            }

            .system-content {
                padding: 8px 12px;
                background-color: #f5f5f5;
                color: #999;
                font-size: 12px;
                border-radius: 8px;
                text-align: center;
            }
        }
    }

    .chat-input-area {
        background-color: #fff;
        border-top: 1px solid #eee;
        transition: transform 0.18s ease, opacity 0.18s ease;

        .input-wrapper {
            display: flex;
            align-items: center;

            :deep(.van-field) {
                flex: 1;
            }

            :deep(.van-field__control) {
                padding: 8px 12px;
                border: 1px solid #ddd;
                border-radius: 8px;
                resize: none;
                font-size: 14px;
                overflow: hidden;

                &:focus {
                    border-color: var(--theme-color);
                }
            }

            .send-btn {
                flex-shrink: 0;
                min-width: 60px;
                margin-right: 15px;
            }
        }
    }
}

/* Fade-in animation for send button */
.fade-send-enter-active,
.fade-send-leave-active {
    transition: opacity 0.3s ease;
}

.fade-send-enter-from,
.fade-send-leave-to {
    opacity: 0;
}

.fade-send-enter-to,
.fade-send-leave-from {
    opacity: 1;
}

/* Typing cursor animation */
.typing-cursor {
    display: inline-block;
    margin-left: 2px;
    animation: cursorBlink 0.8s infinite;
    font-weight: 100;
}

@keyframes cursorBlink {

    0%,
    49% {
        opacity: 1;
    }

    50%,
    100% {
        opacity: 0;
    }
}
</style>
