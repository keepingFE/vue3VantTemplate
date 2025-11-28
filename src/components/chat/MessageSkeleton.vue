<template>
    <div class="message-skeleton">
        <div class="avatar-skeleton"></div>
        <div class="content-skeleton">
            <div class="line" style="width: 60%"></div>
            <div class="line" style="width: 90%"></div>
            <div class="line" style="width: 75%"></div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.message-skeleton {
    display: flex;
    gap: 12px;
    padding: 16px;
    align-items: flex-start;
    animation: pulse 1.5s infinite ease-in-out;
    
    .avatar-skeleton {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background-color: #f0f0f0;
        flex-shrink: 0;
    }
    
    .content-skeleton {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 8px;
        
        .line {
            height: 14px;
            background-color: #f0f0f0;
            border-radius: 4px;
        }
    }
}

@keyframes pulse {
    0% {
        opacity: 0.6;
    }
    50% {
        opacity: 1;
    }
    100% {
        opacity: 0.6;
    }
}
</style>
