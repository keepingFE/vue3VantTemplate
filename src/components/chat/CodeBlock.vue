<template>
    <div class="code-block-wrapper">
        <div class="code-header">
            <span class="language-label">{{ language || 'text' }}</span>
            <div class="copy-btn" @click="handleCopy">
                <van-icon :name="copied ? 'success' : 'description'" />
                <span>{{ copied ? '已复制' : '复制' }}</span>
            </div>
        </div>
        <pre><code ref="codeRef" :class="`language-${language}`" v-html="highlightedCode"></code></pre>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css' // Using Atom One Dark theme

const props = defineProps({
    code: {
        type: String,
        required: true
    },
    language: {
        type: String,
        default: ''
    }
})

const codeRef = ref(null)
const copied = ref(false)

const highlightedCode = computed(() => {
    if (props.language && hljs.getLanguage(props.language)) {
        try {
            return hljs.highlight(props.code, { language: props.language }).value
        } catch (e) {
            console.warn('Highlighting failed:', e)
        }
    }
    // Fallback or auto-detection could go here, but for now just escape HTML
    return escapeHtml(props.code)
})

const escapeHtml = (unsafe) => {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

const handleCopy = async () => {
    try {
        await navigator.clipboard.writeText(props.code)
        copied.value = true
        setTimeout(() => {
            copied.value = false
        }, 2000)
    } catch (err) {
        console.error('Failed to copy code:', err)
    }
}
</script>

<style lang="scss" scoped>
.code-block-wrapper {
    margin: 12px 0;
    border-radius: 8px;
    overflow: hidden;
    background-color: #282c34; // Matches atom-one-dark background
    font-family: 'Fira Code', monospace;

    .code-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        background-color: #21252b;
        color: #abb2bf;
        font-size: 12px;
        border-bottom: 1px solid #3e4451;

        .language-label {
            text-transform: uppercase;
            font-weight: bold;
            color: #98c379;
        }

        .copy-btn {
            display: flex;
            align-items: center;
            gap: 4px;
            cursor: pointer;
            opacity: 0.7;
            transition: opacity 0.2s;

            &:hover {
                opacity: 1;
            }

            .van-icon {
                font-size: 14px;
            }
        }
    }

    pre {
        margin: 0;
        padding: 12px;
        overflow-x: auto;

        code {
            font-family: inherit;
            font-size: 13px;
            line-height: 1.5;
            background: transparent;
            padding: 0;
        }
    }
}
</style>
