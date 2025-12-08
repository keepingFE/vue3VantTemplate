<template>
    <div class="order-container">
        <van-nav-bar :title="$t('order.title')" fixed placeholder left-arrow @click-left="onClickLeft" />

        <van-tabs v-model:active="activeTab" sticky offset-top="46px" @change="onTabChange">
            <van-tab :title="$t('order.all')" name="all">
                <order-list :orders="filteredOrders" @view-detail="viewDetail" />
            </van-tab>
            <van-tab :title="$t('order.pending')" name="pending">
                <order-list :orders="filteredOrders" @view-detail="viewDetail" />
            </van-tab>
            <van-tab :title="$t('order.paid')" name="paid">
                <order-list :orders="filteredOrders" @view-detail="viewDetail" />
            </van-tab>
            <van-tab :title="$t('order.shipped')" name="shipped">
                <order-list :orders="filteredOrders" @view-detail="viewDetail" />
            </van-tab>
            <van-tab :title="$t('order.completed')" name="completed">
                <order-list :orders="filteredOrders" @view-detail="viewDetail" />
            </van-tab>
        </van-tabs>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import OrderList from './components/OrderList.vue'
import productImage from '@/assets/images/picture.jpg'

defineOptions({
    name: 'OrderIndex'
})

const router = useRouter()
const { t } = useI18n()

const activeTab = ref('all')
const orders = ref([])

// 模拟订单数据
const mockOrders = [
    {
        id: '202512081001',
        status: 'pending',
        statusText: '待支付',
        createTime: '2025-12-08 16:30:25',
        totalAmount: 2999,
        items: [
            {
                id: 1,
                name: '高端智能手表 Pro Max 2025新款',
                image: productImage,
                price: 2999,
                count: 1,
                sku: '黑色, 标准版, 型号A'
            }
        ]
    },
    {
        id: '202512081002',
        status: 'paid',
        statusText: '待发货',
        createTime: '2025-12-08 15:20:15',
        totalAmount: 5998,
        items: [
            {
                id: 1,
                name: '高端智能手表 Pro Max 2025新款',
                image: productImage,
                price: 2999,
                count: 2,
                sku: '白色, 套装版, 型号B'
            }
        ]
    },
    {
        id: '202512071003',
        status: 'shipped',
        statusText: '运输中',
        createTime: '2025-12-07 14:10:30',
        totalAmount: 2999,
        items: [
            {
                id: 1,
                name: '高端智能手表 Pro Max 2025新款',
                image: productImage,
                price: 2999,
                count: 1,
                sku: '银色, 尊享版, 型号C'
            }
        ]
    },
    {
        id: '202512061004',
        status: 'completed',
        statusText: '已完成',
        createTime: '2025-12-06 10:05:20',
        totalAmount: 8997,
        items: [
            {
                id: 1,
                name: '高端智能手表 Pro Max 2025新款',
                image: productImage,
                price: 2999,
                count: 3,
                sku: '黑色, 标准版, 型号A'
            }
        ]
    }
]

const filteredOrders = computed(() => {
    if (activeTab.value === 'all') {
        return orders.value
    }
    return orders.value.filter(order => order.status === activeTab.value)
})

const onClickLeft = () => {
    router.back()
}

const onTabChange = (name) => {
    console.log('Tab changed to:', name)
}

const viewDetail = (orderId) => {
    router.push(`/order/detail/${orderId}`)
}

onMounted(() => {
    // 模拟加载订单数据
    setTimeout(() => {
        orders.value = mockOrders
    }, 300)
})
</script>

<style lang="scss" scoped>
.order-container {
    min-height: 100vh;
    background-color: var(--van-background-2);
    padding-bottom: 20px;
}
</style>
