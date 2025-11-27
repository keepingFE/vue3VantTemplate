<template>
    <div class="chat-header">
        <van-icon name="arrow-left" class="header-icon" @click="handleBack" />
        <div class="header-title">{{ title }}</div>
        <van-icon name="ellipsis" class="header-icon" @click="handleMenu" />
    </div>
</template>

<script setup>
const props = defineProps({
    title: {
        type: String,
        default: 'AI健康助手'
    }
})

const emit = defineEmits(['back', 'menu'])

const handleBack = () => {
    emit('back')
}

const handleMenu = () => {
    emit('menu')
}
</script>

<style lang="scss" scoped>
.chat-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background-color: #fff;
    border-bottom: 1px solid #f0f0f0;

    .header-icon {
        font-size: 20px;
        color: #333;
        cursor: pointer;
        
        &:hover {
            opacity: 0.7;
        }
    }

    .header-title {
        flex: 1;
        text-align: center;
        font-size: 17px;
        font-weight: 600;
        color: #333;
    }
}
</style>
