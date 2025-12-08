<template>
    <div class="typing-bubble">
        <!-- Dot animation indicator mode -->
        <div v-if="mode === 'indicator'" class="typing-indicator">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
        </div>

        <!-- Text typing animation mode -->
        <div v-else class="bubble-content">
            <span class="text" v-text="displayedText"></span>
        </div>
    </div>
</template>

<script setup>
    import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

    const props = defineProps({
        // Text content to type out
        text: {
            type: String,
            default: ''
        },
        // Mode: 'indicator' for animated dots, 'typing' for text animation
        mode: {
            type: String,
            default: 'typing',
            validator: (value) => ['indicator', 'typing'].includes(value)
        },
        // Base speed of typing animation (milliseconds per character)
        typingSpeed: {
            type: Number,
            default: 80
        },
        // Auto start typing animation on mount
        autoStart: {
            type: Boolean,
            default: true
        },
        // Show blinking cursor while typing
        showCursor: {
            type: Boolean,
            default: false
        },
        // Delay before starting typing (milliseconds)
        startDelay: {
            type: Number,
            default: 0
        }
    })

    const emit = defineEmits(['typing-start', 'typing-complete', 'typing-char'])

    const displayedText = ref('')
    const isTyping = ref(false)
    let typingTimeout = null
    let startDelayTimeout = null

    const typeNextChar = () => {
        if (props.mode !== 'typing') return

        const currentLength = displayedText.value.length
        const targetText = props.text || ''

        if (currentLength < targetText.length) {
            const char = targetText[currentLength]
            displayedText.value += char
            emit('typing-char', { char, index: currentLength })

            // Calculate dynamic delay for natural typing effect
            let delay = props.typingSpeed

            // Add variance
            delay += Math.random() * 20 - 10

            // Pause longer on punctuation
            if (['.', '!', '?', '。', '！', '？', '\n'].includes(char)) {
                delay += 200
            } else if ([',', '，', ';', '；'].includes(char)) {
                delay += 100
            }

            typingTimeout = setTimeout(typeNextChar, delay)
        } else {
            stopTyping()
        }
    }

    const startTyping = () => {
        if (isTyping.value || props.mode === 'indicator') return

        clearTimeout(startDelayTimeout)
        clearTimeout(typingTimeout)

        const begin = () => {
            isTyping.value = true
            emit('typing-start')
            typeNextChar()
        }

        // Only apply start delay if we are starting from the beginning
        if (displayedText.value.length === 0 && props.startDelay > 0) {
            startDelayTimeout = setTimeout(begin, props.startDelay)
        } else {
            begin()
        }
    }

    const stopTyping = () => {
        clearTimeout(typingTimeout)
        clearTimeout(startDelayTimeout)
        if (isTyping.value) {
            isTyping.value = false
            emit('typing-complete')
        }
    }

    const reset = () => {
        stopTyping()
        displayedText.value = ''
    }

    // Watch for text changes
    watch(() => props.text, (newText) => {
        if (props.mode !== 'typing') return

        // If new text is a continuation of displayed text, just ensure we keep typing
        if (newText.startsWith(displayedText.value)) {
            if (!isTyping.value && displayedText.value.length < newText.length) {
                startTyping()
            }
            // If already typing, the loop will automatically pick up the new length
        } else {
            // Text content changed completely, reset and restart
            reset()
            if (props.autoStart) {
                startTyping()
            }
        }
    })

    // Watch for mode changes
    watch(() => props.mode, (newMode) => {
        if (newMode === 'typing' && props.autoStart) {
            reset()
            startTyping()
        } else {
            reset()
        }
    })

    onMounted(() => {
        if (props.autoStart && props.mode === 'typing' && props.text) {
            startTyping()
        }
    })

    onBeforeUnmount(() => {
        clearTimeout(typingTimeout)
        clearTimeout(startDelayTimeout)
    })

    // Expose methods for parent components
    defineExpose({
        startTyping,
        stopTyping,
        reset
    })
</script>

<style lang="scss" scoped>
    .typing-bubble {
        display: inline-block;

        // Dot animation indicator
        .typing-indicator {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 8px 12px;

            .dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background-color: #c0c4cc;
                animation: typing-dot 1.4s infinite;

                &:nth-child(1) {
                    animation-delay: 0s;
                }

                &:nth-child(2) {
                    animation-delay: 0.2s;
                }

                &:nth-child(3) {
                    animation-delay: 0.4s;
                }
            }
        }

        // Text typing content
        .bubble-content {
            display: inline-block;
            position: relative;

            .text {
                white-space: pre-wrap;
                word-break: break-word;
                line-height: 1.6;
            }

            .cursor {
                display: inline-block;
                width: 2px;
                height: 1.2em;
                background-color: currentColor;
                margin-left: 2px;
                animation: blink 1s infinite;
                vertical-align: text-bottom;
            }
        }
    }

    // Dot bounce animation
    @keyframes typing-dot {

        0%,
        60%,
        100% {
            transform: translateY(0);
            opacity: 0.6;
        }

        30% {
            transform: translateY(-8px);
            opacity: 1;
        }
    }

    // Cursor blink animation
    @keyframes blink {

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
