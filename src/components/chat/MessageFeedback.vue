<template>
    <div class="message-feedback">
        <div class="feedback-actions">
            <!-- Copy Button -->
            <div class="action-item" @click="handleCopy" title="复制">
                <van-icon :name="copied ? 'success' : 'description'" :class="{ 'is-copied': copied }" />
                <span v-if="showLabels" class="action-label">{{ copied ? '已复制' : '复制' }}</span>
            </div>

            <!-- Like Button -->
            <div class="action-item" :class="{ active: status === 'liked' }" @click="handleLike" title="点赞">
                <van-icon :name="status === 'liked' ? 'good-job' : 'good-job-o'" />
                <span v-if="showLabels" class="action-label">点赞</span>
            </div>

            <!-- Dislike Button -->
            <div class="action-item" :class="{ active: status === 'disliked' }" @click="handleDislike" title="踩">
                <van-icon :name="status === 'disliked' ? 'good-job' : 'good-job-o'" style="transform: rotate(180deg);" />
                <span v-if="showLabels" class="action-label">踩</span>
            </div>

            <!-- Regenerate Button (Optional) -->
            <div v-if="allowRegenerate" class="action-item" @click="handleRegenerate" title="重新生成">
                <van-icon name="replay" />
                <span v-if="showLabels" class="action-label">重试</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { showToast } from 'vant'

const props = defineProps({
    content: {
        type: String,
        required: true
    },
    messageId: {
        type: [String, Number],
        default: ''
    },
    initialStatus: {
        type: String, // 'liked', 'disliked', 'none'
        default: 'none'
    },
    allowRegenerate: {
        type: Boolean,
        default: false
    },
    showLabels: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['like', 'dislike', 'copy', 'regenerate'])

const status = ref(props.initialStatus)
const copied = ref(false)

const handleCopy = async () => {
    try {
        await navigator.clipboard.writeText(props.content)
        copied.value = true
        emit('copy', props.content)
        
        setTimeout(() => {
            copied.value = false
        }, 2000)
    } catch (err) {
        showToast('复制失败')
        console.error('Failed to copy:', err)
    }
}

const handleLike = () => {
    if (status.value === 'liked') {
        status.value = 'none'
    } else {
        status.value = 'liked'
    }
    emit('like', { id: props.messageId, status: status.value })
}

const handleDislike = () => {
    if (status.value === 'disliked') {
        status.value = 'none'
    } else {
        status.value = 'disliked'
    }
    emit('dislike', { id: props.messageId, status: status.value })
}

const handleRegenerate = () => {
    emit('regenerate', props.messageId)
}
</script>

<style lang="scss" scoped>
.message-feedback {
    margin-top: 8px;
    
    .feedback-actions {
        display: flex;
        align-items: center;
        gap: 16px;
        
        .action-item {
            display: flex;
            align-items: center;
            gap: 4px;
            cursor: pointer;
            color: #999;
            font-size: 14px;
            transition: all 0.2s;
            padding: 4px;
            border-radius: 4px;
            
            &:hover {
                background-color: rgba(0, 0, 0, 0.05);
                color: #666;
            }
            
            &.active {
                color: var(--van-primary-color);
                
                .van-icon {
                    font-weight: bold;
                }
            }
            
            .is-copied {
                color: var(--van-success-color);
            }
            
            .action-label {
                font-size: 12px;
            }
            
            .van-icon {
                font-size: 16px;
            }
        }
    }
}
</style>
