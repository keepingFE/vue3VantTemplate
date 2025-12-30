<template>
    <div class="chat-input">
        <!-- Upload Preview -->
        <div v-if="showPreview" class="preview-container">
            <UploadPreview :images="images" :files="files" @remove-image="handleRemoveImage"
                @remove-file="handleRemoveFile" @add="handleAddClick" />
        </div>

        <div class="input-wrapper">
            <div class="voice-button" @click="handleVoiceClick">
                <van-icon name="audio" class="voice-icon" />
            </div>
            <van-field size="small" v-model="inputValue" type="textarea" :placeholder="placeholder" rows="1" autosize
                :maxlength="maxLength" @keydown="handleKeyDown" class="message-input" />
            <div v-if="!inputValue && !hasContent" class="add-button" @click="handleAddClick">
                <van-icon name="plus" class="add-icon" />
            </div>
            <div v-else class="send-button" @click="handleSendClick">
                <van-icon name="arrow-up" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import UploadPreview from './UploadPreview.vue'

const props = defineProps({
    placeholder: {
        type: String,
        default: '请输入消息...'
    },
    maxLength: {
        type: Number,
        default: 500
    },
    modelValue: {
        type: String,
        default: ''
    },
    images: {
        type: Array,
        default: () => []
    },
    files: {
        type: Array,
        default: () => []
    }
})

const emit = defineEmits(['update:modelValue', 'send', 'voice-click', 'add-click', 'remove-image', 'remove-file'])

const inputValue = ref(props.modelValue)

const showPreview = computed(() => props.images.length > 0 || props.files.length > 0)
const hasContent = computed(() => inputValue.value.trim() || showPreview.value)

const handleKeyDown = (event) => {
    // Ctrl/Cmd + Enter to send
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault()
        handleSendClick()
    }
}

const handleVoiceClick = () => {
    emit('voice-click')
}

const handleAddClick = () => {
    emit('add-click')
}

const handleRemoveImage = (index) => {
    emit('remove-image', index)
}

const handleRemoveFile = (index) => {
    emit('remove-file', index)
}

const handleSendClick = () => {
    if (hasContent.value) {
        emit('send', inputValue.value)
    }
}

watch(() => props.modelValue, (newVal) => {
    inputValue.value = newVal
})

watch(inputValue, (newVal) => {
    emit('update:modelValue', newVal)
})
</script>

<style lang="scss" scoped>
.chat-input {
    background: #f7f8fa;
    border-top: 1px solid #ebedf0;
    padding-bottom: constant(safe-area-inset-bottom);
    padding-bottom: env(safe-area-inset-bottom);

    .preview-container {
        padding: 12px 12px 0;
    }

    .input-wrapper {
        display: flex;
        align-items: flex-end;
        gap: 8px;
        padding: 8px 12px;

        .voice-button,
        .add-button {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: #f5f5f5;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;
            flex-shrink: 0;
            margin-bottom: 2px; // Align with input bottom

            .voice-icon,
            .add-icon {
                font-size: 20px;
                color: #666;
            }

            &:hover {
                background: #e0e0e0;
            }

            &:active {
                transform: scale(0.95);
            }
        }

        .send-button {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: #1989fa;
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            cursor: pointer;
            transition: all 0.3s ease;
            flex-shrink: 0;
            margin-bottom: 2px; // Align with input bottom

            &:active {
                opacity: 0.8;
                transform: scale(0.95);
            }
        }

        :deep(.van-field) {
            flex: 1;
            background: #f5f5f5;
            border-radius: 18px;
            padding: 0 12px;
            align-items: center;
        }

        :deep(.van-field__control) {
            padding: 8px 0;
            font-size: 14px;
            resize: none;
            max-height: 100px;
            background: transparent;
        }
    }
}
</style>
