<template>
    <div class="welcome-section">
        <div class="robot-avatar">
            <div class="avatar-container">
                <van-icon name="user-circle-o" class="robot-icon" />
            </div>
        </div>
        <div class="welcome-text">
            {{ welcomeMessage }}
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    welcomeMessage: {
        type: String,
        default: '您好，我是你的AI健康助手~'
    },
    avatarUrl: {
        type: String,
        default: ''
    }
})
</script>

<style lang="scss" scoped>
.welcome-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px 16px 16px;

    .robot-avatar {
        margin-bottom: 12px;

        .avatar-container {
            width: 64px;
            height: 64px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 16px;
            border: 2px dashed #999;
            display: flex;
            align-items: center;
            justify-content: center;

            .robot-icon {
                font-size: 36px;
                color: #fff;
            }
        }
    }

    .welcome-text {
        font-size: 16px;
        color: #333;
        text-align: center;
        line-height: 1.5;
    }
}
</style>
