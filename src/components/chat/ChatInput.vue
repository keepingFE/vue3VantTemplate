<template>
    <div class="chat-input">
        <div class="input-wrapper">
            <div class="voice-button" @click="handleVoiceClick">
                <van-icon name="audio" class="voice-icon" />
            </div>
            <van-field 
                v-model="inputValue"
                type="textarea"
                :placeholder="placeholder"
                rows="1"
                autosize
                :maxlength="maxLength"
                @keydown="handleKeyDown"
                class="message-input"
            />
            <div v-if="!inputValue || !inputValue.trim()" class="add-button" @click="handleAddClick">
                <van-icon name="plus" class="add-icon" />
            </div>
            <div v-else class="send-button" @click="handleSendClick">
                发送
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'

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
    }
})

const emit = defineEmits(['update:modelValue', 'send', 'voice-click', 'add-click'])

const inputValue = ref(props.modelValue)

const handleKeyDown = (event) => {
    // Ctrl/Cmd + Enter to send
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault()
        emit('send', inputValue.value)
    }
}

const handleVoiceClick = () => {
    emit('voice-click')
}

const handleAddClick = () => {
    emit('add-click')
}

const handleSendClick = () => {
    if (inputValue.value.trim()) {
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
    background: #fff;
    border-top: 1px solid #f0f0f0;

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
            height: 32px;
            padding: 0 16px;
            border-radius: 16px;
            background: #1989fa;
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.3s ease;
            flex-shrink: 0;
            margin-bottom: 4px; // Align with input bottom
            
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
