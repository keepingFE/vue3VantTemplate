<template>
    <div class="message-item" :class="message.type">
        <!-- User Message -->
        <div v-if="message.type === 'user'" class="message-group">
            <div class="message-content user-message">
                <div class="bubble-wrap">
                    <div class="message-bubble">
                        <div class="bubble-text">{{ message.content }}</div>
                    </div>
                </div>
                <van-image 
                    :src="message.avatar || userAvatar" 
                    round 
                    width="32" 
                    height="32"
                    class="message-avatar user-avatar" 
                />
            </div>
        </div>

        <!-- Bot/Assistant Message -->
        <div v-else-if="message.type === 'bot' || message.type === 'assistant'" class="message-group">
            <div class="message-content bot-message">
                <van-image 
                    :src="message.avatar || botAvatar" 
                    round 
                    width="32" 
                    height="32"
                    class="message-avatar" 
                />
                <div class="bubble-wrap">
                    <div class="message-bubble">
                        <div class="bubble-text">
                            <span>{{ message.content }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- System Message -->
        <div v-else-if="message.type === 'system'" class="message-group">
            <div class="message-content system-message">
                <div class="system-content">{{ message.content }}</div>
            </div>
        </div>

        <!-- File Message -->
        <div v-else-if="message.type === 'file'" class="message-group">
            <div class="message-content user-message">
                <div class="bubble-wrap">
                    <div class="message-bubble file-bubble">
                        <div class="file-info">
                            <div class="file-icon-wrapper">
                                <van-icon :name="getFileIcon(message.fileType)" size="24" />
                                <span class="file-type-text" v-if="message.fileType">{{ message.fileType.toUpperCase() }}</span>
                            </div>
                            <div class="file-name">{{ message.fileName }}</div>
                        </div>
                    </div>
                </div>
                <van-image 
                    :src="message.avatar || userAvatar" 
                    round 
                    width="32" 
                    height="32"
                    class="message-avatar user-avatar" 
                />
            </div>
        </div>

        <!-- Default Text Message -->
        <div v-else class="message-group">
            <div class="message-content user-message">
                <div class="bubble-wrap">
                    <div class="message-bubble">
                        <div class="bubble-text">{{ message.content }}</div>
                    </div>
                </div>
                <van-image 
                    :src="message.avatar || userAvatar" 
                    round 
                    width="32" 
                    height="32"
                    class="message-avatar user-avatar" 
                />
            </div>
        </div>
    </div>
</template>

<script setup>

const props = defineProps({
    message: {
        type: Object,
        required: true
    },
    userAvatar: {
        type: String,
        default: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'
    },
    botAvatar: {
        type: String,
        default: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'
    }
})



const getFileIcon = (fileType) => {
    if (!fileType) return 'description'
    
    const type = fileType.toLowerCase()
    const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp']
    
    if (imageTypes.includes(type)) {
        return 'photo'
    }
    
    return 'description'
}
</script>

<style lang="scss" scoped>
.message-item {
    display: flex;
    flex-direction: column;
    margin-bottom: 8px;

    &.user,
    &.file {
        align-items: flex-end;

        .message-group {
            width: 100%;
        }
    }

    &.bot,
    &.assistant {
        align-items: flex-start;
    }

    &.system {
        align-items: center;
    }

    .message-group {
        display: flex;
        flex-direction: column;
        align-items: inherit;
        padding-bottom: 20px;
    }

    .message-content {
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        gap: 8px;
        width: 80%;

        &.bot-message {
            width: 90%;
        }

        .bubble-wrap {
            display: block;
            width: 100%;
            position: relative;
        }

        .message-bubble {
            padding: 10px 14px;
            border-radius: 12px;
            word-break: break-word;
            white-space: pre-wrap;
            line-height: 1.4;
            font-size: 14px;
            margin-top: 12px;
        }

        &.user-message .message-bubble {
            background-color: var(--theme-color);
            color: #fff;
            border-top-right-radius: 0;
            border-top-left-radius: 12px;
            border-bottom-left-radius: 12px;
            border-bottom-right-radius: 12px;
        }

        &.bot-message .message-bubble {
            background-color: #f0f0f0;
            color: #333;
            position: relative;
            border-top-left-radius: 0;
            border-top-right-radius: 18px;
            border-bottom-right-radius: 18px;
            border-bottom-left-radius: 18px;
        }

        .bubble-text {
            overflow-wrap: break-word;
        }

        .message-avatar {
            flex-shrink: 0;
            align-self: flex-start;

            &.user-avatar {
                order: 2;
            }
        }
    }

    .system-content {
        padding: 8px 12px;
        background-color: #f5f5f5;
        color: #999;
        font-size: 12px;
        border-radius: 8px;
        text-align: center;
    }

    .file-bubble {
        padding: 12px !important;
        min-width: 200px;
        
        .file-info {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .file-icon-wrapper {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            
            .van-icon {
                color: #fff;
            }

            .file-type-text {
                position: absolute;
                bottom: 8px;
                left: 50%;
                transform: translateX(-50%) scale(0.6);
                font-size: 10px;
                font-weight: bold;
                color: #fff;
                background: rgba(0, 0, 0, 0.3);
                padding: 0 2px;
                border-radius: 2px;
                line-height: 1;
            }
        }

        .file-name {
            flex: 1;
            color: #fff;
            font-size: 14px;
            line-height: 1.4;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            line-clamp: 2;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            text-align: left;
        }
    }
}
</style>
