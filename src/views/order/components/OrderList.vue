<template>
    <div class="order-list">
        <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
            <van-list v-model:loading="loading" :finished="finished" :finished-text="$t('common.noMore')"
                @load="onLoad">
                <div v-if="orders.length > 0">
                    <div v-for="order in orders" :key="order.id" class="order-card">
                        <div class="order-header">
                            <div class="order-info">
                                <span class="order-id">{{ $t('order.orderNo') }}: {{ order.id }}</span>
                                <span class="order-time">{{ order.createTime }}</span>
                            </div>
                            <van-tag :type="getStatusType(order.status)" size="medium">
                                {{ order.statusText }}
                            </van-tag>
                        </div>

                        <div class="order-items">
                            <div v-for="item in order.items" :key="item.id" class="order-item"
                                @click="$emit('view-detail', order.id)">
                                <van-image :src="item.image" fit="cover" class="item-image" />
                                <div class="item-info">
                                    <div class="item-name">{{ item.name }}</div>
                                    <div class="item-sku">{{ item.sku }}</div>
                                    <div class="item-price-count">
                                        <span class="price">¥{{ item.price }}</span>
                                        <span class="count">x{{ item.count }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="order-footer">
                            <div class="total-amount">
                                {{ $t('order.totalAmount') }}: <span class="amount">¥{{ order.totalAmount }}</span>
                            </div>
                            <div class="order-actions">
                                <van-button v-if="order.status === 'pending'" size="small" type="default"
                                    @click.stop="cancelOrder(order.id)">
                                    {{ $t('order.cancel') }}
                                </van-button>
                                <van-button v-if="order.status === 'pending'" size="small" type="danger"
                                    @click.stop="payOrder(order.id)">
                                    {{ $t('order.pay') }}
                                </van-button>
                                <van-button v-if="order.status === 'shipped'" size="small" type="primary"
                                    @click.stop="confirmReceipt(order.id)">
                                    {{ $t('order.confirmReceipt') }}
                                </van-button>
                                <van-button v-if="order.status === 'completed'" size="small" type="default"
                                    @click.stop="buyAgain(order.id)">
                                    {{ $t('order.buyAgain') }}
                                </van-button>
                                <van-button size="small" plain type="primary"
                                    @click.stop="$emit('view-detail', order.id)">
                                    {{ $t('order.viewDetail') }}
                                </van-button>
                            </div>
                        </div>
                    </div>
                </div>
                <van-empty v-else :description="$t('order.noOrders')" />
            </van-list>
        </van-pull-refresh>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import { useI18n } from 'vue-i18n'

defineOptions({
    name: 'OrderList'
})

const props = defineProps({
    orders: {
        type: Array,
        default: () => []
    }
})

const emit = defineEmits(['view-detail'])

const { t } = useI18n()
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)

const getStatusType = (status) => {
    const typeMap = {
        pending: 'warning',
        paid: 'primary',
        shipped: 'primary',
        completed: 'success',
        cancelled: 'default'
    }
    return typeMap[status] || 'default'
}

const onLoad = () => {
    setTimeout(() => {
        loading.value = false
        finished.value = true
    }, 500)
}

const onRefresh = () => {
    setTimeout(() => {
        refreshing.value = false
        showToast(t('common.refreshSuccess'))
    }, 1000)
}

const cancelOrder = async (orderId) => {
    try {
        await showConfirmDialog({
            title: t('common.tips'),
            message: t('order.cancelConfirm')
        })
        showToast(t('order.cancelSuccess'))
    } catch (error) {
        console.log('Cancel order cancelled')
    }
}

const payOrder = (orderId) => {
    showToast(t('order.paymentProcessing'))
}

const confirmReceipt = async (orderId) => {
    try {
        await showConfirmDialog({
            title: t('common.tips'),
            message: t('order.confirmReceiptTip')
        })
        showToast(t('order.receiptSuccess'))
    } catch (error) {
        console.log('Confirm receipt cancelled')
    }
}

const buyAgain = (orderId) => {
    showToast(t('order.addedToCart'))
}
</script>

<style lang="scss" scoped>
.order-list {
    .order-card {
        background: #fff;
        margin: 10px;
        border-radius: 12px;
        overflow: hidden;

        .order-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 16px;
            border-bottom: 1px solid #f7f8fa;

            .order-info {
                display: flex;
                flex-direction: column;
                gap: 4px;

                .order-id {
                    font-size: 13px;
                    font-weight: bold;
                    color: #333;
                }

                .order-time {
                    font-size: 11px;
                    color: #999;
                }
            }
        }

        .order-items {
            .order-item {
                display: flex;
                padding: 12px 16px;
                border-bottom: 1px solid #f7f8fa;

                &:last-child {
                    border-bottom: none;
                }

                .item-image {
                    width: 70px;
                    height: 70px;
                    border-radius: 8px;
                    overflow: hidden;
                    margin-right: 12px;
                    flex-shrink: 0;
                }

                .item-info {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;

                    .item-name {
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

                    .item-sku {
                        font-size: 11px;
                        color: #999;
                        background: #f7f8fa;
                        padding: 2px 6px;
                        border-radius: 4px;
                        align-self: flex-start;
                        margin: 4px 0;
                    }

                    .item-price-count {
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

        .order-footer {
            padding: 12px 16px;
            background: #fafafa;

            .total-amount {
                text-align: right;
                font-size: 13px;
                color: #666;
                margin-bottom: 12px;

                .amount {
                    font-size: 16px;
                    color: var(--van-danger-color);
                    font-weight: bold;
                }
            }

            .order-actions {
                display: flex;
                justify-content: flex-end;
                gap: 8px;
            }
        }
    }
}
</style>
