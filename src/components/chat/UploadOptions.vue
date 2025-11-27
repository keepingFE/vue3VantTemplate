<template>
    <div class="upload-options">
        <div class="upload-hint">你好，请将需要解读的报告发送给我~</div>
        <div class="upload-list">
            <div 
                v-for="(option, index) in options" 
                :key="index"
                class="upload-item"
                @click="handleOptionClick(option)"
            >
                <van-icon :name="option.icon" class="upload-icon" />
                <span class="upload-text">{{ option.text }}</span>
                <span class="upload-action">{{ option.action }}</span>
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    options: {
        type: Array,
        default: () => [
            { 
                text: '上传报告照片', 
                icon: 'photo-o', 
                action: '去上传',
                type: 'photo'
            },
            { 
                text: '拍照上传报告', 
                icon: 'photograph', 
                action: '去拍照',
                type: 'camera'
            },
            { 
                text: '上传报告文件', 
                icon: 'description', 
                action: '去上传',
                type: 'file'
            }
        ]
    }
})

const emit = defineEmits(['option-click'])

const handleOptionClick = (option) => {
    emit('option-click', option)
}
</script>

<style lang="scss" scoped>
.upload-options {
    padding: 16px;
    background: #fff;
    border-radius: 16px;
    margin: 0 16px 16px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);

    .upload-hint {
        font-size: 13px;
        color: #666;
        margin-bottom: 12px;
        line-height: 1.5;
    }

    .upload-list {
        display: flex;
        flex-direction: column;
        gap: 12px;

        .upload-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 0;
            cursor: pointer;

            .upload-icon {
                font-size: 20px;
                color: #666;
                flex-shrink: 0;
            }

            .upload-text {
                flex: 1;
                font-size: 15px;
                color: #333;
            }

            .upload-action {
                font-size: 14px;
                color: #2196f3;
            }

            &:hover {
                .upload-action {
                    text-decoration: underline;
                }
            }
        }
    }
}
</style>
