<template>
    <div class="my-activities-container">
        <van-nav-bar title="我参加的活动" left-arrow fixed placeholder @click-left="handleBack" />

        <van-tabs v-model:active="activeTab" sticky @change="handleTabChange" color="var(--theme-color)">
            <van-tab title="进行中">
                <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
                    <van-list v-model:loading="loading" :finished="finished" :finished-text="$t('common.noMore')"
                        @load="onLoad">
                        <div class="activity-list">
                            <van-empty v-if="ongoingActivities.length === 0" description="暂无进行中的活动" />
                            <activity-card v-for="activity in ongoingActivities" :key="activity.id" :activity="activity"
                                @click="handleActivityClick(activity)" />
                        </div>
                    </van-list>
                </van-pull-refresh>
            </van-tab>

            <van-tab title="已结束">
                <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
                    <van-list v-model:loading="loading" :finished="finished" :finished-text="$t('common.noMore')"
                        @load="onLoad">
                        <div class="activity-list">
                            <van-empty v-if="endedActivities.length === 0" description="暂无已结束的活动" />
                            <activity-card v-for="activity in endedActivities" :key="activity.id" :activity="activity"
                                @click="handleActivityClick(activity)" />
                        </div>
                    </van-list>
                </van-pull-refresh>
            </van-tab>
        </van-tabs>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { showToast } from 'vant'
import ActivityCard from './components/ActivityCard.vue'

defineOptions({
    name: 'MyActivities'
})

const router = useRouter()
const { t } = useI18n()

const activeTab = ref(0)
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)

// 我参加的活动列表（模拟数据）
const myActivities = ref([
    {
        id: 1,
        title: '双十二超级购物节',
        description: '全场5折起，满300减50，更有神秘大礼包等你抢购！',
        image: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
        status: 'ongoing',
        startTime: Date.now() - 86400000,
        endTime: Date.now() + 259200000,
        location: '线上活动',
        tags: ['限时抢购', '全场5折', '满减'],
        participants: 12580,
        discount: '满300减50',
        joinTime: Date.now() - 3600000,
        orderNo: 'ACT202412090001'
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
        joinTime: Date.now() - 7200000,
        orderNo: 'ACT202412090002'
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
        joinTime: Date.now() - 864000000,
        orderNo: 'ACT202412010001'
    }
])

// 进行中的活动
const ongoingActivities = computed(() => {
    return myActivities.value.filter(item => item.status === 'ongoing')
})

// 已结束的活动
const endedActivities = computed(() => {
    return myActivities.value.filter(item => item.status === 'ended')
})

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
.my-activities-container {
    min-height: 100vh;
    background-color: var(--bg-color, #f7f8fa);
    padding-bottom: 20px;

    .activity-list {
        padding: $spacing-md;
    }
}
</style>
