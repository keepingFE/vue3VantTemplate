<template>
    <div class="order-detail-container">
        <van-nav-bar :title="$t('order.viewDetail')" fixed placeholder left-arrow @click-left="onClickLeft" />

        <div class="order-content" v-if="order">
            <!-- 订单状态 -->
            <div class="status-card">
                <van-icon name="checked" size="48" :color="getStatusColor(order.status)" />
                <div class="status-text">{{ order.statusText }}</div>
                <div class="status-desc" v-if="order.status === 'pending'">
                    请尽快完成支付
                </div>
                <div class="status-desc" v-else-if="order.status === 'shipped'">
                    商品正在配送中，请耐心等待
                </div>
            </div>

            <!-- 收货地址 -->
            <div class="address-card">
                <div class="card-title">
                    <van-icon name="location-o" />
                    收货信息
                </div>
                <div class="address-info">
                    <div class="receiver">
                        <span class="name">张三</span>
                        <span class="phone">138****8888</span>
                    </div>
                    <div class="address">北京市朝阳区某某街道某某小区1号楼101室</div>
                </div>
            </div>

            <!-- 商品信息 -->
            <div class="goods-card">
                <div class="card-title">商品信息</div>
                <div class="goods-list">
                    <div v-for="item in order.items" :key="item.id" class="goods-item">
                        <van-image :src="item.image" fit="cover" class="goods-image" />
                        <div class="goods-info">
                            <div class="goods-name">{{ item.name }}</div>
                            <div class="goods-sku">{{ item.sku }}</div>
                            <div class="goods-price-count">
                                <span class="price">¥{{ item.price }}</span>
                                <span class="count">x{{ item.count }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 订单信息 -->
            <div class="info-card">
                <div class="card-title">订单信息</div>
                <van-cell-group inset>
                    <van-cell title="订单号" :value="order.id" />
                    <van-cell title="创建时间" :value="order.createTime" />
                    <van-cell title="支付方式" value="微信支付" v-if="order.status !== 'pending'" />
                </van-cell-group>
            </div>

            <!-- 费用明细 -->
            <div class="price-card">
                <div class="card-title">费用明细</div>
                <div class="price-item">
                    <span>商品总价</span>
                    <span>¥{{ order.totalAmount }}</span>
                </div>
                <div class="price-item">
                    <span>运费</span>
                    <span>¥0.00</span>
                </div>
                <div class="price-total">
                    <span>实付款</span>
                    <span class="total-amount">¥{{ order.totalAmount }}</span>
                </div>
            </div>
        </div>

        <!-- 底部操作栏 -->
        <div class="footer-actions" v-if="order">
            <van-button v-if="order.status === 'pending'" type="default" @click="cancelOrder">
                {{ $t('order.cancel') }}
            </van-button>
            <van-button v-if="order.status === 'pending'" type="danger" @click="payOrder">
                {{ $t('order.pay') }}
            </van-button>
            <van-button v-if="order.status === 'shipped'" type="primary" @click="confirmReceipt">
                {{ $t('order.confirmReceipt') }}
            </van-button>
            <van-button v-if="order.status === 'completed'" type="default" @click="buyAgain">
                {{ $t('order.buyAgain') }}
            </van-button>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { useI18n } from 'vue-i18n'
import productImage from '@/assets/images/picture.jpg'

defineOptions({
    name: 'OrderDetail'
})

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const order = ref(null)

// 模拟订单数据
const mockOrders = {
    '202512081001': {
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
    '202512081002': {
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
    '202512071003': {
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
    '202512061004': {
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
}

const getStatusColor = (status) => {
    const colorMap = {
        pending: '#ff976a',
        paid: '#1989fa',
        shipped: '#1989fa',
        completed: '#07c160',
        cancelled: '#969799'
    }
    return colorMap[status] || '#969799'
}

const onClickLeft = () => {
    router.back()
}

const cancelOrder = async () => {
    try {
        await showConfirmDialog({
            title: t('common.tips'),
            message: t('order.cancelConfirm')
        })
        showToast(t('order.cancelSuccess'))
        router.back()
    } catch (error) {
        console.log('Cancel order cancelled')
    }
}

const payOrder = () => {
    showToast(t('order.paymentProcessing'))
}

const confirmReceipt = async () => {
    try {
        await showConfirmDialog({
            title: t('common.tips'),
            message: t('order.confirmReceiptTip')
        })
        showToast(t('order.receiptSuccess'))
        router.back()
    } catch (error) {
        console.log('Confirm receipt cancelled')
    }
}

const buyAgain = () => {
    showToast(t('order.addedToCart'))
}

onMounted(() => {
    const orderId = route.params.id
    setTimeout(() => {
        order.value = mockOrders[orderId] || null
    }, 300)
})
</script>

<style lang="scss" scoped>
.order-detail-container {
    min-height: 100vh;
    background-color: var(--van-background-2);
    padding-bottom: 70px;

    .order-content {
        .status-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 30px 16px;
            text-align: center;
            color: #fff;
            margin-bottom: 10px;

            .status-text {
                font-size: 20px;
                font-weight: bold;
                margin: 12px 0 8px;
            }

            .status-desc {
                font-size: 13px;
                opacity: 0.9;
            }
        }

        .address-card,
        .goods-card,
        .info-card,
        .price-card {
            background: #fff;
            margin-bottom: 10px;
            padding: 16px;

            .card-title {
                font-size: 15px;
                font-weight: bold;
                color: #333;
                margin-bottom: 12px;
                display: flex;
                align-items: center;
                gap: 6px;
            }
        }

        .address-card {
            .address-info {
                .receiver {
                    font-size: 14px;
                    font-weight: bold;
                    color: #333;
                    margin-bottom: 8px;

                    .name {
                        margin-right: 12px;
                    }

                    .phone {
                        color: #666;
                    }
                }

                .address {
                    font-size: 13px;
                    color: #666;
                    line-height: 1.6;
                }
            }
        }

        .goods-card {
            .goods-list {
                .goods-item {
                    display: flex;
                    padding: 12px 0;
                    border-bottom: 1px solid #f7f8fa;

                    &:last-child {
                        border-bottom: none;
                        padding-bottom: 0;
                    }

                    &:first-child {
                        padding-top: 0;
                    }

                    .goods-image {
                        width: 70px;
                        height: 70px;
                        border-radius: 8px;
                        overflow: hidden;
                        margin-right: 12px;
                        flex-shrink: 0;
                    }

                    .goods-info {
                        flex: 1;
                        display: flex;
                        flex-direction: column;
                        justify-content: space-between;

                        .goods-name {
                            font-size: 13px;
                            font-weight: bold;
                            color: #333;
                            display: -webkit-box;
                            -webkit-line-clamp: 2;
                            line-clamp: 2;
                            -webkit-box-orient: vertical;
                            overflow: hidden;
                            line-height: 1.4;
                        }

                        .goods-sku {
                            font-size: 11px;
                            color: #999;
                            background: #f7f8fa;
                            padding: 2px 6px;
                            border-radius: 4px;
                            align-self: flex-start;
                            margin: 4px 0;
                        }

                        .goods-price-count {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;

                            .price {
                                font-size: 14px;
                                color: var(--van-danger-color);
                                font-weight: bold;
                            }

                            .count {
                                font-size: 12px;
                                color: #999;
                            }
                        }
                    }
                }
            }
        }

        .price-card {
            .price-item {
                display: flex;
                justify-content: space-between;
                font-size: 13px;
                color: #666;
                margin-bottom: 8px;
            }

            .price-total {
                display: flex;
                justify-content: space-between;
                font-size: 14px;
                color: #333;
                font-weight: bold;
                margin-top: 12px;
                padding-top: 12px;
                border-top: 1px solid #f7f8fa;

                .total-amount {
                    font-size: 18px;
                    color: var(--van-danger-color);
                }
            }
        }
    }

    .footer-actions {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: #fff;
        padding: 12px 16px;
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
        z-index: 100;
    }
}
</style>
