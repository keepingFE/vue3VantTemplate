<template>
    <div class="error-message">
        <div class="error-content">
            <van-icon name="warning-o" class="error-icon" />
            <div class="text-content">
                <div class="error-title">{{ title || '出错了' }}</div>
                <div class="error-desc">{{ message }}</div>
            </div>
        </div>
        <van-button 
            v-if="allowRetry" 
            size="small" 
            type="primary" 
            plain 
            class="retry-btn"
            @click="$emit('retry')"
        >
            重试
        </van-button>
    </div>
</template>

<script setup>
defineProps({
    message: {
        type: String,
        default: '网络连接异常，请稍后重试'
    },
    title: {
        type: String,
        default: ''
    },
    allowRetry: {
        type: Boolean,
        default: true
    }
})

defineEmits(['retry'])
</script>

<style lang="scss" scoped>
.error-message {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    padding: 12px;
    background-color: #fff2f0;
    border: 1px solid #ffccc7;
    border-radius: 8px;
    margin: 8px 0;
    max-width: 85%;

    .error-content {
        display: flex;
        gap: 8px;
        align-items: flex-start;
        
        .error-icon {
            color: #ff4d4f;
            font-size: 18px;
            margin-top: 2px;
        }
        
        .text-content {
            .error-title {
                font-weight: 500;
                color: #ff4d4f;
                font-size: 14px;
                margin-bottom: 2px;
            }
            
            .error-desc {
                color: #666;
                font-size: 13px;
                line-height: 1.4;
            }
        }
    }
    
    .retry-btn {
        align-self: flex-end;
        height: 28px;
        padding: 0 12px;
        font-size: 12px;
    }
}
</style>
