<template>
    <div class="activity-card" @click="$emit('click')">
        <!-- 活动图片 -->
        <div class="activity-image-wrapper">
            <van-image :src="activity.image" fit="cover" class="activity-image">
                <template #loading>
                    <van-loading type="spinner" size="20" />
                </template>
            </van-image>
            <!-- 活动状态标签 -->
            <div class="activity-status" :class="`status-${activity.status}`">
                {{ getStatusText(activity.status) }}
            </div>
            <!-- 倒计时 -->
            <div v-if="activity.status === 'ongoing'" class="countdown-wrapper">
                <van-count-down :time="activity.endTime - Date.now()" format="还剩 DD 天 HH:mm:ss" />
            </div>
        </div>

        <!-- 活动信息 -->
        <div class="activity-info">
            <div class="activity-title">{{ activity.title }}</div>
            <div class="activity-desc">{{ activity.description }}</div>

            <div class="activity-meta">
                <div class="meta-item">
                    <van-icon name="clock-o" />
                    <span>{{ formatTime(activity.startTime) }} - {{ formatTime(activity.endTime) }}</span>
                </div>
                <div class="meta-item">
                    <van-icon name="location-o" />
                    <span>{{ activity.location }}</span>
                </div>
                <div class="meta-item" v-if="activity.joinTime">
                    <van-icon name="success" />
                    <span>报名时间: {{ formatTime(activity.joinTime) }}</span>
                </div>
            </div>

            <!-- 活动标签 -->
            <div class="activity-tags">
                <van-tag v-for="tag in activity.tags" :key="tag" type="primary" plain size="medium">
                    {{ tag }}
                </van-tag>
            </div>

            <!-- 参与人数和优惠信息 -->
            <div class="activity-footer">
                <div class="participants">
                    <van-icon name="friends-o" />
                    <span>{{ activity.participants }}人已参与</span>
                </div>
                <div class="discount" v-if="activity.discount">
                    <span class="discount-tag">{{ activity.discount }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
defineOptions({
    name: 'ActivityCard'
})

defineProps({
    activity: {
        type: Object,
        required: true
    }
})

defineEmits(['click'])

// 获取状态文本
const getStatusText = (status) => {
    const statusMap = {
        ongoing: '进行中',
        upcoming: '即将开始',
        ended: '已结束'
    }
    return statusMap[status] || ''
}

// 格式化时间
const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hour = String(date.getHours()).padStart(2, '0')
    const minute = String(date.getMinutes()).padStart(2, '0')
    return `${month}-${day} ${hour}:${minute}`
}
</script>

<style lang="scss" scoped>
.activity-card {
    background-color: #fff;
    border-radius: 12px;
    margin-bottom: $spacing-md;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    transition: transform 0.3s ease;

    &:active {
        transform: scale(0.98);
    }

    .activity-image-wrapper {
        position: relative;
        height: 200px;
        overflow: hidden;

        .activity-image {
            width: 100%;
            height: 100%;
        }

        .activity-status {
            position: absolute;
            top: 12px;
            left: 12px;
            padding: 4px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            color: #fff;

            &.status-ongoing {
                background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
            }

            &.status-upcoming {
                background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            }

            &.status-ended {
                background: linear-gradient(135deg, #999 0%, #666 100%);
            }
        }

        .countdown-wrapper {
            position: absolute;
            bottom: 12px;
            left: 12px;
            right: 12px;
            padding: 8px 12px;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(10px);
            border-radius: 8px;
            color: #fff;
            font-size: 13px;
            font-weight: 600;
        }
    }

    .activity-info {
        padding: $spacing-md;

        .activity-title {
            font-size: 17px;
            font-weight: 700;
            color: var(--text-primary, #333);
            margin-bottom: $spacing-xs;
            display: -webkit-box;
            -webkit-line-clamp: 1;
            line-clamp: 1;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }

        .activity-desc {
            font-size: 14px;
            color: var(--text-secondary, #666);
            margin-bottom: $spacing-md;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            line-height: 1.6;
        }

        .activity-meta {
            margin-bottom: $spacing-sm;

            .meta-item {
                display: flex;
                align-items: center;
                font-size: 12px;
                color: var(--text-tertiary, #999);
                margin-bottom: 6px;

                .van-icon {
                    margin-right: 6px;
                    font-size: 14px;
                }
            }
        }

        .activity-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-bottom: $spacing-md;

            .van-tag {
                font-size: 11px;
            }
        }

        .activity-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: $spacing-sm;
            border-top: 1px solid var(--border-color, #eee);

            .participants {
                display: flex;
                align-items: center;
                font-size: 13px;
                color: var(--text-secondary, #666);

                .van-icon {
                    margin-right: 6px;
                    font-size: 16px;
                    color: var(--theme-color);
                }
            }

            .discount {
                .discount-tag {
                    display: inline-block;
                    padding: 4px 12px;
                    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
                    color: #fff;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 700;
                }
            }
        }
    }
}
</style>
