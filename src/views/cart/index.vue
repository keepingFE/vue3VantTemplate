<template>
    <div class="cart-container">
        <van-nav-bar :title="$t('route.cart')" fixed placeholder left-arrow @click-left="onClickLeft">
            <template #right>
                <van-button v-if="cartStore.cartList.length > 0" type="danger" size="small" plain @click="clearAll">
                    清空
                </van-button>
            </template>
        </van-nav-bar>

        <div class="cart-content" v-if="cartStore.cartList.length > 0">
            <van-checkbox-group v-model="checkedResult" ref="checkboxGroup">
                <div v-for="item in cartStore.cartList" :key="item.id" class="cart-item">
                    <van-swipe-cell>
                        <div class="item-content">
                            <van-checkbox size="small" :name="item.id" class="checkbox" />
                            <van-image :src="item.image" fit="cover" class="product-image" @click="goDetail(item.id)" />
                            <div class="product-info">
                                <div class="product-title" @click="goDetail(item.id)">{{ item.name }}</div>
                                <div class="product-sku">{{ item.sku }}</div>
                                <div class="price-stepper">
                                    <div class="price">¥{{ item.price }}</div>
                                    <van-stepper size="small" v-model="item.count" theme="round" button-size="22"
                                        disable-input @change="(val) => cartStore.updateItemCount(item.id, val)" />
                                </div>
                            </div>
                        </div>
                        <template #right>
                            <van-button square text="删除" type="danger" class="delete-button"
                                @click="deleteItem(item)" />
                        </template>
                    </van-swipe-cell>
                </div>
            </van-checkbox-group>

            <!-- 底部提交栏 -->
            <van-submit-bar :price="totalPrice" button-text="提交订单" @submit="onSubmit">
                <van-checkbox size="small" v-model="checkedAll" @click="toggleAll">全选</van-checkbox>
            </van-submit-bar>
        </div>

        <van-empty v-else description="购物车空空如也" class="empty-cart">
            <van-button round type="danger" class="bottom-button" @click="goHome">
                去逛逛
            </van-button>
        </van-empty>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showDialog } from 'vant'
import { useI18n } from 'vue-i18n'
import { useCartStore } from '@/store/modules/cart'

defineOptions({
    name: 'Cart'
})

const router = useRouter()
const { t } = useI18n()
const cartStore = useCartStore()

const checkedResult = ref(cartStore.cartList.map(item => item.id))
const checkboxGroup = ref(null)

const checkedAll = computed({
    get: () => cartStore.cartList.length > 0 && checkedResult.value.length === cartStore.cartList.length,
    set: (val) => {
        if (val) {
            checkedResult.value = cartStore.cartList.map(item => item.id)
        } else {
            checkedResult.value = []
        }
    }
})

const totalPrice = computed(() => {
    return cartStore.cartList
        .filter(item => checkedResult.value.includes(item.id))
        .reduce((total, item) => total + item.price * item.count * 100, 0)
})

const toggleAll = () => {
    // handled by computed setter
}

const onClickLeft = () => {
    router.back()
}

const goDetail = (id) => {
    router.push(`/product/detail/${id}`)
}

const goHome = () => {
    router.push('/product')
}

const deleteItem = (item) => {
    showDialog({
        title: '提示',
        message: '确认将该商品移出购物车吗？',
        showCancelButton: true
    }).then(() => {
        cartStore.removeItem(item.id)
        checkedResult.value = checkedResult.value.filter(id => id !== item.id)
        showToast('删除成功')
    }).catch(() => {
        // cleanup
    })
}

const clearAll = () => {
    showDialog({
        title: '提示',
        message: '确认清空购物车吗？',
        showCancelButton: true
    }).then(() => {
        cartStore.clearCart()
        checkedResult.value = []
        showToast('已清空购物车')
    }).catch(() => {
        // cleanup
    })
}

const onSubmit = () => {
    if (checkedResult.value.length === 0) {
        showToast('请选择商品')
        return
    }

    // 模拟提交订单
    showToast({
        message: t('order.submitSuccess'),
        icon: 'success',
        onClose: () => {
            // 清空已选中的购物车商品
            checkedResult.value.forEach(id => {
                cartStore.removeItem(id)
            })
            checkedResult.value = []

            // 跳转到订单列表页面
            router.push('/order/list')
        }
    })
}
</script>

<style lang="scss" scoped>
.cart-container {
    min-height: 100vh;
    background-color: var(--van-background-2);
    padding-bottom: 100px;
}

.cart-content {
    .cart-item {
        margin: 10px;
        background: #fff;
        border-radius: 12px;
        overflow: hidden;

        .item-content {
            display: flex;
            align-items: center;
            padding: 10px;

            .checkbox {
                margin-right: 10px;
            }

            .product-image {
                width: 88px;
                height: 88px;
                border-radius: 8px;
                overflow: hidden;
                margin-right: 10px;
                flex-shrink: 0;
            }

            .product-info {
                flex: 1;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                height: 88px;

                .product-title {
                    font-size: 14px;
                    font-weight: bold;
                    color: #333;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    line-height: 1.4;
                }

                .product-sku {
                    font-size: 12px;
                    color: #999;
                    background: #f7f8fa;
                    padding: 2px 6px;
                    border-radius: 4px;
                    align-self: flex-start;
                    margin: 4px 0;
                }

                .price-stepper {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;

                    .price {
                        font-size: 16px;
                        color: var(--van-danger-color);
                        font-weight: bold;
                    }
                }
            }
        }

        .delete-button {
            height: 100%;
        }
    }
}

.empty-cart {
    padding-top: 100px;
    background: #fff;
    min-height: calc(100vh - 46px);

    .bottom-button {
        width: 160px;
        height: 40px;
    }
}

:deep(.van-submit-bar) {
    bottom: 0;
}
</style>
