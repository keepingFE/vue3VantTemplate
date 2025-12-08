<template>
    <div class="activity-container">
        <van-nav-bar :title="$t('activity.title')" left-arrow fixed placeholder @click-left="handleBack" />

        <div class="activity-content">
            <!-- 轮播图 -->
            <van-swipe class="banner-swipe" :autoplay="3000" indicator-color="white">
                <van-swipe-item v-for="(banner, index) in banners" :key="index">
                    <van-image :src="banner.image" fit="cover" class="banner-image"
                        @click="handleBannerClick(banner)" />
                </van-swipe-item>
            </van-swipe>

            <!-- 活动分类标签 -->
            <van-tabs v-model:active="activeTab" sticky @change="handleTabChange" color="var(--theme-color)">
                <van-tab v-for="category in categories" :key="category.id" :title="category.name">
                    <!-- 活动列表 -->
                    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
                        <van-list v-model:loading="loading" :finished="finished" :finished-text="$t('common.noMore')"
                            @load="onLoad">
                            <div class="activity-list">
                                <div v-for="activity in filteredActivities" :key="activity.id" class="activity-card"
                                    @click="handleActivityClick(activity)">
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
                                            <van-count-down :time="activity.endTime - Date.now()"
                                                format="还剩 DD 天 HH:mm:ss" />
                                        </div>
                                    </div>

                                    <!-- 活动信息 -->
                                    <div class="activity-info">
                                        <div class="activity-title">{{ activity.title }}</div>
                                        <div class="activity-desc">{{ activity.description }}</div>

                                        <div class="activity-meta">
                                            <div class="meta-item">
                                                <van-icon name="clock-o" />
                                                <span>{{ formatTime(activity.startTime) }} - {{
                                                    formatTime(activity.endTime) }}</span>
                                            </div>
                                            <div class="meta-item">
                                                <van-icon name="location-o" />
                                                <span>{{ activity.location }}</span>
                                            </div>
                                        </div>

                                        <!-- 活动标签 -->
                                        <div class="activity-tags">
                                            <van-tag v-for="tag in activity.tags" :key="tag" type="primary" plain
                                                size="medium">
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
                            </div>
                        </van-list>
                    </van-pull-refresh>
                </van-tab>
            </van-tabs>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { showToast } from 'vant'

defineOptions({
    name: 'ActivityList'
})

const router = useRouter()
const { t } = useI18n()

const activeTab = ref(0)
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)

// 轮播图数据
const banners = ref([
    {
        id: 1,
        image: 'https://fastly.jsdelivr.net/npm/@vant/assets/apple-1.jpeg',
        link: '/activity/detail/1'
    },
    {
        id: 2,
        image: 'https://fastly.jsdelivr.net/npm/@vant/assets/apple-2.jpeg',
        link: '/activity/detail/2'
    },
    {
        id: 3,
        image: 'https://fastly.jsdelivr.net/npm/@vant/assets/apple-3.jpeg',
        link: '/activity/detail/3'
    }
])

// 活动分类
const categories = ref([
    { id: 0, name: '全部活动' },
    { id: 1, name: '进行中' },
    { id: 2, name: '即将开始' },
    { id: 3, name: '已结束' }
])

// 活动列表数据（模拟数据）
const activities = ref([
    {
        id: 1,
        title: '双十二超级购物节',
        description: '全场5折起，满300减50，更有神秘大礼包等你抢购！',
        image: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
        status: 'ongoing', // ongoing, upcoming, ended
        startTime: Date.now() - 86400000,
        endTime: Date.now() + 259200000,
        location: '线上活动',
        tags: ['限时抢购', '全场5折', '满减'],
        participants: 12580,
        discount: '满300减50',
        categoryId: 1
    },
    {
        id: 2,
        title: '新年焕新季',
        description: '迎接新年，焕新好物，家电数码低至3折，爆款直降1000元！',
        image: 'https://fastly.jsdelivr.net/npm/@vant/assets/apple-1.jpeg',
        status: 'upcoming',
        startTime: Date.now() + 172800000,
        endTime: Date.now() + 604800000,
        location: '全国门店',
        tags: ['新年特惠', '家电数码', '直降'],
        participants: 5680,
        discount: '低至3折',
        categoryId: 2
    },
    {
        id: 3,
        title: '圣诞狂欢夜',
        description: '圣诞节特别活动，全场商品买一送一，更有抽奖活动等你来参加！',
        image: 'https://fastly.jsdelivr.net/npm/@vant/assets/apple-2.jpeg',
        status: 'ended',
        startTime: Date.now() - 604800000,
        endTime: Date.now() - 172800000,
        location: '线上+线下',
        tags: ['圣诞特惠', '买一送一', '抽奖'],
        participants: 28900,
        discount: '买一送一',
        categoryId: 3
    },
    {
        id: 4,
        title: '品牌super day',
        description: '大牌联合，超级优惠日，精选品牌商品低至5折！',
        image: 'https://fastly.jsdelivr.net/npm/@vant/assets/apple-3.jpeg',
        status: 'ongoing',
        startTime: Date.now() - 43200000,
        endTime: Date.now() + 172800000,
        location: '线上活动',
        tags: ['品牌日', '大牌联合', '5折起'],
        participants: 15680,
        discount: '低至5折',
        categoryId: 1
    },
    {
        id: 5,
        title: '会员专享日',
        description: '会员专属福利，额外9.5折优惠，积分翻倍，尊享好礼！',
        image: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
        status: 'ongoing',
        startTime: Date.now() - 21600000,
        endTime: Date.now() + 345600000,
        location: '线上活动',
        tags: ['会员专享', '积分翻倍', '额外9.5折'],
        participants: 8900,
        discount: '额外9.5折',
        categoryId: 1
    },
    {
        id: 6,
        title: '年货节',
        description: '年货大集结，食品、生活用品、家居好物应有尽有！',
        image: 'https://fastly.jsdelivr.net/npm/@vant/assets/apple-1.jpeg',
        status: 'upcoming',
        startTime: Date.now() + 259200000,
        endTime: Date.now() + 864000000,
        location: '全国门店',
        tags: ['年货节', '食品', '家居'],
        participants: 3200,
        discount: '满199减30',
        categoryId: 2
    }
])

// 根据当前分类过滤活动
const filteredActivities = computed(() => {
    const categoryId = categories.value[activeTab.value].id
    if (categoryId === 0) {
        return activities.value
    }
    return activities.value.filter(item => item.categoryId === categoryId)
})

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

// 标签页切换
const handleTabChange = (index) => {
    activeTab.value = index
}

// 下拉刷新
const onRefresh = () => {
    setTimeout(() => {
        showToast(t('common.success'))
        refreshing.value = false
    }, 1000)
}

// 加载更多
const onLoad = () => {
    setTimeout(() => {
        loading.value = false
        finished.value = true
    }, 1000)
}

// 点击轮播图
const handleBannerClick = (banner) => {
    if (banner.link) {
        router.push(banner.link)
    }
}

// 点击活动卡片
const handleActivityClick = (activity) => {
    router.push(`/activity/detail/${activity.id}`)
}

// 返回
const handleBack = () => {
    router.back()
}

onMounted(() => {
    // 初始化数据
})
</script>

<style lang="scss" scoped>
.activity-container {
    min-height: 100vh;
    background-color: var(--bg-color, #f7f8fa);
    padding-bottom: 20px;
}

.activity-content {
    .banner-swipe {
        height: 180px;
        margin-bottom: $spacing-md;

        .banner-image {
            width: 100%;
            height: 100%;
        }
    }

    .activity-list {
        padding: 0 $spacing-md;

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
    }
}
</style>
