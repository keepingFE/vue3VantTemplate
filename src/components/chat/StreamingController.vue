<template>
    <div class="streaming-controller" v-if="status !== 'stopped'">
        <div class="status-indicator">
            <van-loading type="spinner" size="14px" v-if="status === 'generating'" />
            <span class="status-text">
                {{ status === 'generating' ? '正在生成...' : '已暂停' }}
            </span>
        </div>
        
        <div class="controls">
            <van-button 
                v-if="status === 'generating'" 
                icon="pause" 
                size="mini" 
                round 
                @click="$emit('pause')"
                title="暂停"
            />
            <van-button 
                v-else 
                icon="play" 
                size="mini" 
                round 
                @click="$emit('resume')"
                title="继续"
            />
            <van-button 
                icon="stop" 
                size="mini" 
                round 
                type="danger" 
                plain
                @click="$emit('stop')"
                title="停止"
            />
        </div>
    </div>
</template>

<script setup>
defineProps({
    status: {
        type: String,
        default: 'stopped', // 'generating', 'paused', 'stopped'
        validator: (value) => ['generating', 'paused', 'stopped'].includes(value)
    }
})

defineEmits(['pause', 'resume', 'stop'])
</script>

<style lang="scss" scoped>
.streaming-controller {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    padding: 6px 12px;
    background-color: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(4px);
    border-radius: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border: 1px solid #eee;
    
    .status-indicator {
        display: flex;
        align-items: center;
        gap: 6px;
        
        .status-text {
            font-size: 12px;
            color: #666;
        }
    }
    
    .controls {
        display: flex;
        gap: 8px;
        
        :deep(.van-button) {
            width: 24px;
            height: 24px;
            border: none;
            background-color: #f5f5f5;
            color: #666;
            
            &.van-button--danger {
                color: #ff4d4f;
                background-color: rgba(255, 77, 79, 0.1);
            }
            
            &:active {
                opacity: 0.8;
            }
        }
    }
}
</style>
