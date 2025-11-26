<template>
    <div class="chat-container">
        <!-- Messages Area -->
        <div class="chat-messages" ref="messagesContainer">
            <div v-if="messages.length === 0" class="empty-state">
                <van-empty :description="$t('chat.noMessages')" />
            </div>
            <div v-for="(message, index) in messages" :key="index" class="message-item" :class="message.type">
                <!-- User Message -->
                <div v-if="message.type === 'user'" class="message-group">
                    <div class="message-content user-message">
                        <div class="bubble-wrap">
                            <div class="message-bubble">
                                <div class="bubble-text">{{ message.content }}</div>
                            </div>
                        </div>
                        <van-image :src="message.avatar || userAvatar" round width="32" height="32"
                            class="message-avatar user-avatar" />
                    </div>
                </div>

                <!-- Bot/Assistant Message -->
                <div v-else-if="message.type === 'bot' || message.type === 'assistant'" class="message-group">
                    <div class="message-content bot-message">
                        <van-image :src="message.avatar || botAvatar" round width="32" height="32"
                            class="message-avatar" />
                        <div class="bubble-wrap">
                            <div class="message-bubble">
                                <div class="bubble-text">
                                    <span>
                                        {{ message.content }}
                                    </span>
                                </div>
                            </div>
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
                        </div>
                        <van-image :src="message.avatar || userAvatar" round width="32" height="32"
                            class="message-avatar user-avatar" />
                    </div>
                </div>
            </div>
        </div>

        <!-- Input Area (shown by default) -->
        <div class="chat-input-area">
            <div class="input-wrapper">
                <van-field ref="inputField" v-model="inputValue" type="textarea" :placeholder="$t('chat.placeholder')"
                    rows="1" autosize maxlength="500" @keydown="handleKeyDown" class="message-input" />
                <!-- Send button with fade-in animation -->
                <Transition name="fade-send">
                    <van-button v-if="inputValue.trim()" type="primary" size="small" round :loading="isSending"
                        @click="sendMessage" class="send-btn">
                        {{ $t('chat.send') }}
                    </van-button>
                </Transition>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { ref, reactive, watch, nextTick, onUnmounted } from 'vue'
    import { showToast } from 'vant'
    import { useI18n } from 'vue-i18n'

    const { t } = useI18n()

    // Props
    const props = defineProps({
        title: {
            type: String,
            default: 'chat.title'
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
            default: 'chat.inputPlaceholder'
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
        }
    })

    // Emits
    const emit = defineEmits(['send-message', 'update:messages'])

    // Refs
    const messagesContainer = ref(null)
    const inputValue = ref('')
    const showInput = ref(true)
    const inputField = ref(null)


    // Methods
    const sendMessage = () => {
        const message = inputValue.value.trim()

        if (!message) {
            showToast(t('chat.emptyContent'))
            return
        }

        if (message.length > props.maxLength) {
            showToast(t('chat.maxLengthError', { max: props.maxLength }))
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

                    .message-group {
                        width: 100%;
                    }
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
                    flex-direction: row;
                    align-items: flex-start;
                    gap: 8px;
                    width: 80%;

                    &.bot-message {
                        width: 90%;
                    }

                    .bubble-wrap {
                        display: block;
                        width: 100%;
                        position: relative;
                    }

                    .message-bubble {
                        padding: 10px 14px;
                        border-radius: 12px;
                        word-break: break-word;
                        white-space: pre-wrap;
                        line-height: 1.4;
                        font-size: 14px;
                        margin-top: 12px;
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
                        border-top-left-radius: 12px;
                        border-bottom-left-radius: 12px;
                        border-bottom-right-radius: 12px;
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
                        overflow-wrap: break-word;
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
