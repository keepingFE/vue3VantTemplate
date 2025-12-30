<template>
    <div class="activity-detail">
        <van-nav-bar :title="$t('activity.detailTitle')" left-arrow fixed placeholder @click-left="handleBack"
            @click-right="showShare = true">
            <template #right>
                <van-icon name="share-o" size="18" />
            </template>
        </van-nav-bar>

        <div class="content" v-if="activity">
            <!-- Header Image -->
            <div class="header-image">
                <van-image :src="activity.image" fit="cover" width="100%" height="240" @click="previewImage" />
                <div class="status-tag" :class="activity.status">
                    {{ getStatusText(activity.status) }}
                </div>
            </div>

            <!-- Title Section -->
            <div class="section title-section">
                <div class="price-row" v-if="activity.discount">
                    <span class="currency">¥</span>
                    <span class="price">299</span>
                    <span class="original-price">¥599</span>
                    <van-tag type="danger" round>{{ activity.discount }}</van-tag>
                </div>
                <h1 class="title">{{ activity.title }}</h1>
                <div class="subtitle">{{ activity.description }}</div>

                <div class="tags">
                    <van-tag v-for="tag in activity.tags" :key="tag" plain type="primary" class="tag-item">
                        {{ tag }}
                    </van-tag>
                </div>
            </div>

            <!-- Time and Location -->
            <div class="section info-section">
                <van-cell-group inset>
                    <van-cell icon="clock-o" :title="formatTimeRange(activity.startTime, activity.endTime)" is-link />
                    <van-cell icon="location-o" :title="activity.location" is-link :label="'距离: 2.5km'" />
                    <van-cell icon="friends-o" :title="`${activity.participants} 人已参与`" is-link>
                        <template #right-icon>
                            <div class="avatars">
                                <van-image v-for="i in 3" :key="i" round width="20" height="20"
                                    :src="`https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg`"
                                    style="margin-left: -8px; border: 1px solid #fff;" />
                            </div>
                            <van-icon name="arrow" style="margin-left: 4px; color: #969799;" />
                        </template>
                    </van-cell>
                </van-cell-group>
            </div>

            <!-- Details Content -->
            <div class="section detail-content">
                <div class="section-header">活动详情</div>
                <div class="rich-text">
                    <p>这里是活动的详细介绍。包括活动日程、嘉宾阵容和特别优惠。</p>
                    <p>
                        1. 早鸟票现已开售。<br>
                        2. 前100名参与者将获得精美礼品。<br>
                        3. 提供免费停车位。
                    </p>
                    <van-image src="https://fastly.jsdelivr.net/npm/@vant/assets/apple-1.jpeg" radius="8"
                        style="margin-top: 10px;" />
                    <p style="margin-top: 10px;">不要错过这个与志同道合的人交流的绝佳机会。</p>
                </div>
            </div>
        </div>

        <van-skeleton title avatar :row="3" v-else style="margin-top: 20px" />

        <!-- Action Bar -->
        <van-action-bar>
            <van-action-bar-icon icon="chat-o" text="客服" />
            <van-action-bar-icon icon="star-o" text="收藏" />
            <van-action-bar-button type="warning" text="分享" @click="showShare = true" />
            <van-action-bar-button type="danger" :text="actionButtonText" @click="handleJoin"
                :disabled="activity?.status === 'ended'" />
        </van-action-bar>

        <!-- Share Sheet -->
        <van-share-sheet v-model:show="showShare" title="立即分享给好友" :options="shareOptions" @select="onSelectShare" />
    </div>
</template>

<script setup>
    import { ref, onMounted, computed } from 'vue'
    import { useRoute, useRouter } from 'vue-router'
    import { showToast, showImagePreview } from 'vant'

    defineOptions({
        name: 'ActivityDetail'
    })

    const route = useRoute()
    const router = useRouter()
    const activityId = route.params.id
    const activity = ref(null)
    const showShare = ref(false)

    const shareOptions = [
        { name: '微信', icon: 'wechat' },
        { name: '微博', icon: 'weibo' },
        { name: '复制链接', icon: 'link' },
        { name: '生成海报', icon: 'poster' },
    ]

    // Mock Data Fetch
    const fetchActivity = () => {
        // Simulate API call
        setTimeout(() => {
            activity.value = {
                id: activityId,
                title: '双十二超级购物节',
                description: '全场5折起，消费满300减50，更有神秘大礼包等你抢购！',
                image: 'https://fastly.jsdelivr.net/npm/@vant/assets/apple-1.jpeg',
                status: 'ongoing',
                startTime: Date.now() - 86400000,
                endTime: Date.now() + 259200000,
                location: '线上商城',
                tags: ['限时抢购', '全场5折', '满减'],
                participants: 12580,
                discount: '满300减50'
            }
        }, 500)
    }

    const getStatusText = (status) => {
        const map = {
            ongoing: '进行中',
            upcoming: '即将开始',
            ended: '已结束'
        }
        return map[status] || status
    }

    const actionButtonText = computed(() => {
        if (!activity.value) return '立即报名'
        if (activity.value.status === 'ended') return '已结束'
        if (activity.value.status === 'upcoming') return '提醒我'
        return '立即报名'
    })

    const formatTimeRange = (start, end) => {
        if (!start || !end) return ''
        const s = new Date(start)
        const e = new Date(end)
        return `${s.getMonth() + 1}/${s.getDate()} ${s.getHours()}:${s.getMinutes()} - ${e.getMonth() + 1}/${e.getDate()} ${e.getHours()}:${e.getMinutes()}`
    }

    const handleBack = () => router.back()

    const previewImage = () => {
        if (activity.value?.image) {
            showImagePreview([activity.value.image])
        }
    }

    const handleJoin = () => {
        showToast('报名成功！')
        // 延迟跳转到我参加的活动页面
        setTimeout(() => {
            router.push('/activity/my-activities')
        }, 1500)
    }

    const onSelectShare = (option) => {
        showToast(option.name)
        showShare.value = false
    }

    onMounted(() => {
        fetchActivity()
    })
</script>

<style lang="scss" scoped>
    .activity-detail {
        min-height: 100vh;
        background-color: #f7f8fa;
        padding-bottom: 80px;

        .header-image {
            position: relative;

            .status-tag {
                position: absolute;
                bottom: 16px;
                right: 16px;
                padding: 4px 12px;
                background: rgba(0, 0, 0, 0.6);
                color: #fff;
                border-radius: 16px;
                font-size: 12px;
                backdrop-filter: blur(4px);

                &.ongoing {
                    background: linear-gradient(135deg, #ff6b6b, #ee5a24);
                    opacity: 1;
                }
            }
        }

        .section {
            background: #fff;
            margin-bottom: 12px;
            padding: 16px;

            &.title-section {
                border-radius: 0 0 16px 16px;
                padding-top: 20px;

                .price-row {
                    color: #ee0a24;
                    display: flex;
                    align-items: flex-end;
                    margin-bottom: 8px;

                    .currency {
                        font-size: 14px;
                        margin-bottom: 2px;
                    }

                    .price {
                        font-size: 24px;
                        font-weight: bold;
                        margin-right: 8px;
                    }

                    .original-price {
                        font-size: 12px;
                        color: #999;
                        text-decoration: line-through;
                        margin-right: 8px;
                        margin-bottom: 4px;
                    }
                }

                .title {
                    font-size: 18px;
                    font-weight: bold;
                    color: #323233;
                    line-height: 1.4;
                    margin-bottom: 8px;
                }

                .subtitle {
                    font-size: 13px;
                    color: #666;
                    margin-bottom: 12px;
                }

                .tags {
                    display: flex;
                    gap: 8px;
                }
            }

            &.info-section {
                padding: 0;
                background: transparent;

                :deep(.van-cell-group) {
                    margin: 0;
                }
            }

            &.detail-content {
                border-radius: 16px;
                margin: 12px;

                .section-header {
                    font-size: 16px;
                    font-weight: bold;
                    margin-bottom: 16px;
                    position: relative;
                    padding-left: 10px;

                    &::before {
                        content: '';
                        position: absolute;
                        left: 0;
                        top: 4px;
                        bottom: 4px;
                        width: 3px;
                        background: #ee0a24;
                        border-radius: 2px;
                    }
                }

                .rich-text {
                    font-size: 14px;
                    color: #666;
                    line-height: 1.6;
                }
            }
        }
    }
</style>
