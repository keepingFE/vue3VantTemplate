<template>
    <div class="product-detail">
        <van-nav-bar :title="product.name || $t('product.detail')" left-arrow fixed placeholder
            @click-left="onClickLeft">
            <template #right>
                <van-icon name="share-o" size="18" />
            </template>
        </van-nav-bar>

        <div class="content" v-if="product.id">
            <!-- 商品轮播图 -->
            <van-swipe class="my-swipe" :autoplay="3000" indicator-color="white">
                <van-swipe-item v-for="(image, index) in product.images" :key="index">
                    <van-image :src="image" fit="cover" width="100%" height="375" />
                </van-swipe-item>
            </van-swipe>

            <!-- 价格和标题信息 -->
            <div class="info-card">
                <div class="price-row">
                    <span class="currency">¥</span>
                    <span class="price">{{ product.price }}</span>
                    <van-tag type="danger" plain v-if="product.discount" class="discount-tag">
                        {{ $t('product.discount') }}
                    </van-tag>
                    <div class="original-price" v-if="product.originalPrice">
                        ¥{{ product.originalPrice }}
                    </div>
                </div>
                <div class="title">{{ product.name }}</div>
                <div class="subtitle">{{ product.description }}</div>
            </div>

            <!-- 规格选择 -->
            <div class="sku-card" @click="showSku = true">
                <div class="label">{{ $t('product.select') }}</div>
                <div class="value">{{ selectedSku || $t('product.selectSku') }}</div>
                <van-icon name="arrow" class="arrow" />
            </div>

            <!-- 地址 -->
            <div class="address-card" @click="goAddressList">
                <div class="row">
                    <div class="label">{{ $t('product.delivery') }}</div>
                    <div class="value">
                        <div class="location">{{ addressStore.currentAddress?.address || '请选择收货地址' }}</div>
                        <div class="delivery-time">23:00前下单，预计明天(12月09日)送达</div>
                    </div>
                    <van-icon name="arrow" class="arrow" />
                </div>
                <div class="service-tags">
                    <div class="tag"><van-icon name="passed" /> 99元免运费</div>
                    <div class="tag"><van-icon name="passed" /> 京东发货&售后</div>
                    <div class="tag"><van-icon name="passed" /> 7天无理由退货</div>
                </div>
            </div>

            <!-- 商品详情图 -->
            <div class="detail-images">
                <div class="section-title">{{ $t('product.detail') }}</div>
                <div class="images">
                    <!-- 模拟详情长图 -->
                    <van-image v-for="n in 3" :key="n" :src="product.image" width="100%" fit="cover" />
                </div>
            </div>
        </div>

        <van-skeleton title :row="3" v-else class="skeleton" />

        <!-- 底部动作栏 -->
        <van-action-bar>
            <van-action-bar-icon icon="shop-o" :text="$t('product.shop')" />
            <van-action-bar-icon icon="chat-o" :text="$t('product.service')" />
            <van-action-bar-icon class="cart-icon" icon="cart-o" :text="$t('product.cart')" :badge="cartBadge"
                @click="onClickCart" />
            <van-action-bar-button type="warning" :text="$t('product.addToCart')" @click="onAddCart" />
            <van-action-bar-button type="danger" :text="$t('product.buyNow')" @click="onBuy" />
        </van-action-bar>

        <!-- SKU 弹窗 -->
        <van-action-sheet v-model:show="showSku" :title="$t('product.selectSku')">
            <div class="sku-content">
                <div class="sku-header">
                    <van-image :src="product.image" class="sku-img" />
                    <div class="sku-info">
                        <div class="price">¥{{ product.price }}</div>
                        <div class="selected">{{ $t('product.selected') }}: {{ selectedColor }} {{ selectedSize }} {{
                            selectedModel }}</div>
                    </div>
                </div>
                <div class="sku-group">
                    <div class="group-title">{{ $t('product.color') }}</div>
                    <div class="tags">
                        <span v-for="color in colors" :key="color" class="tag"
                            :class="{ active: selectedColor === color }" @click="selectedColor = color">
                            {{ color }}
                        </span>
                    </div>
                </div>
                <div class="sku-group">
                    <div class="group-title">{{ $t('product.model') }}</div>
                    <div class="tags">
                        <span v-for="model in models" :key="model" class="tag"
                            :class="{ active: selectedModel === model }" @click="selectedModel = model">
                            {{ model }}
                        </span>
                    </div>
                </div>
                <div class="sku-group">
                    <div class="group-title">{{ $t('product.size') }}</div>
                    <div class="tags">
                        <span v-for="size in sizes" :key="size" class="tag" :class="{ active: selectedSize === size }"
                            @click="selectedSize = size">
                            {{ size }}
                        </span>
                    </div>
                </div>
                <div class="sku-count">
                    <span>{{ $t('product.quantity') }}</span>
                    <van-stepper size="small" v-model="buyCount" />
                </div>
                <div class="sku-group">
                    <div class="group-title">{{ $t('product.paymentMethod') }}</div>
                    <div class="payment-methods">
                        <div v-for="method in paymentMethods" :key="method.value" class="payment-item"
                            :class="{ active: selectedPaymentMethod === method.value }"
                            @click="selectedPaymentMethod = method.value">
                            <van-icon :name="method.icon" :color="method.color" size="20" class="icon" />
                            <span class="name">{{ $t('product.' + method.value) }}</span>
                            <van-icon name="success" class="check" v-if="selectedPaymentMethod === method.value" />
                        </div>
                    </div>
                </div>
                <van-button size="small" round block type="danger" @click="addToCart">
                    {{ $t('common.confirm') }}
                </van-button>
            </div>
        </van-action-sheet>

        <!-- 悬浮购物车按钮 -->
        <div v-if="product.id" class="floating-cart-wrapper" :style="floatingCartStyle" @click="onClickCart">
            <van-badge :content="cartBadge" :show-zero="false" max="99">
                <van-icon name="cart-o" size="24" color="#fff" />
            </van-badge>
        </div>

        <!-- 抛物线动画球 -->
        <div v-if="showBall" class="ball-container" :style="ballStyle">
            <div class="inner-ball" :style="innerBallStyle">
                <img :src="product.image" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useI18n } from 'vue-i18n'
import { useAddressStore } from '@/store/modules/address'
import { useCartStore } from '@/store/modules/cart'
import productImage from '@/assets/images/picture.jpg'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const addressStore = useAddressStore()
const cartStore = useCartStore()

// 悬浮购物车按钮位置
const floatingCartStyle = computed(() => ({
    position: 'fixed',
    right: '16px',
    bottom: '120px',
    zIndex: 999
}))

const product = ref({})
const showSku = ref(false)
const buyCount = ref(1)
const selectedColor = ref('黑色')
const selectedSize = ref('标准版')
const selectedModel = ref('型号A')

// 使用 cart store 的商品数量
const cartBadge = computed(() => cartStore.cartCount || '')

const colors = ['黑色', '白色', '银色']
const sizes = ['标准版', '套装版', '尊享版']
const models = ['型号A', '型号B', '型号C']

const selectedSku = computed(() => {
    return `${selectedColor.value}, ${selectedSize.value}, ${selectedModel.value}, ${buyCount.value}件, ${t('product.' + selectedPaymentMethod.value)}`
})

const paymentMethods = [
    { value: 'wechatPay', icon: 'wechat', color: '#07c160' },
    { value: 'alipay', icon: 'alipay', color: '#1677ff' },
    { value: 'bankCard', icon: 'card', color: '#ffc107' }
]
const selectedPaymentMethod = ref('wechatPay')

// 动画相关状态
const showBall = ref(false)
const ballStyle = ref({
    left: '0px',
    top: '0px',
    transform: 'translate3d(0,0,0)',
    opacity: 0,
    transition: 'none'
})
const innerBallStyle = ref({
    transform: 'translate3d(0,0,0)',
    transition: 'none'
})

const onClickLeft = () => {
    router.back()
}

const onClickCart = () => {
    router.push('/cart')
}

const goAddressList = () => {
    router.push('/address/list')
}

const onAddCart = () => {
    showSku.value = true
}

const onBuy = () => {
    showToast(t('product.added'))
}

const addToCart = async (e) => {
    // 获取点击位置作为起始点
    // e.clientX 可能不准，如果点击的是按钮内部的span
    // 使用 getBoundingClientRect 获取按钮中心更好
    let startX, startY;
    if (e && e.target) {
        // 如果是点击事件
        const rect = e.target.getBoundingClientRect();
        // 如果点击的是按钮内部文字，rect可能是文字的rect，向上找按钮
        const btn = e.target.closest('.van-button');
        if (btn) {
            const btnRect = btn.getBoundingClientRect();
            startX = btnRect.left + btnRect.width / 2;
            startY = btnRect.top + btnRect.height / 2;
        } else {
            startX = e.clientX;
            startY = e.clientY;
        }
    } else {
        startX = window.innerWidth / 2;
        startY = window.innerHeight / 2;
    }


    // 添加到购物车 store
    const cartItem = {
        id: product.value.id,
        name: product.value.name,
        price: product.value.price,
        count: buyCount.value,
        image: product.value.image,
        sku: `${selectedColor.value}, ${selectedSize.value}, ${selectedModel.value}`
    }
    cartStore.addToCart(cartItem)

    // 关闭SKU弹窗
    showSku.value = false

    // 延迟执行动画
    await nextTick()
    startAnimation(startX, startY)
}

const startAnimation = async (startX, startY) => {
    // 寻找目标：优先 Action Bar 中的购物车
    // 增加 .van-action-bar-icon 选择器
    let target = document.querySelector('.van-action-bar-icon.cart-icon .van-icon')
    // 如果找不到指定的class，尝试通用选择器
    if (!target) {
        target = document.querySelector('.van-action-bar-icon .van-icon-cart-o')
    }
    // 如果找不到，尝试找悬浮球
    if ((!target || target.offsetParent === null)) {
        target = document.querySelector('.van-floating-bubble')
    }

    // 如果还是找不到（比如action bar被遮挡），就飞到底部中间
    let endX, endY;
    if (target && target.offsetParent !== null) {
        const rect = target.getBoundingClientRect()
        endX = rect.left + rect.width / 2
        endY = rect.top + rect.height / 2
    } else {
        // Fallback: bottom center + offset
        endX = window.innerWidth * 0.4; // Slightly left of center usually
        endY = window.innerHeight - 30;
    }

    // 计算
    const offsetX = endX - startX
    const offsetY = endY - startY

    // Initialize
    showBall.value = true
    ballStyle.value = {
        left: `${startX}px`,
        top: `${startY}px`,
        transform: 'translate3d(0,0,0)',
        opacity: 1,
        transition: 'none'
    }
    innerBallStyle.value = {
        transform: 'translate3d(0,0,0)',
        transition: 'none'
    }

    // Wait for DOM update
    await nextTick()

    // Force layout
    document.body.offsetHeight

    // Animate
    ballStyle.value = {
        left: `${startX}px`,
        top: `${startY}px`,
        transform: `translate3d(${offsetX}px, 0, 0) scale(0.1)`,
        opacity: 0.5,
        transition: 'transform 0.5s linear, opacity 0.5s linear'
    }
    // Cubic bezier for gravity effect on Y
    innerBallStyle.value = {
        transform: `translate3d(0, ${offsetY}px, 0)`,
        transition: 'transform 0.5s cubic-bezier(0.5, -0.2, 1, 1)'
    }

    // Cleanup
    setTimeout(() => {
        showBall.value = false
        showToast({
            message: t('product.added'),
            icon: 'success'
        })
    }, 500)
}

onMounted(() => {
    // 模拟获取商品详情
    const id = route.params.id
    // 实际项目中应调用API
    setTimeout(() => {
        product.value = {
            id,
            name: '高端智能手表 Pro Max 2025新款',
            description: '全新升级 / 超长续航 / 视网膜屏幕 / 50米防水 / 多功能NFC',
            price: 2999,
            originalPrice: 3599,
            discount: true,
            image: productImage, // 使用本地图片
            images: [productImage, productImage, productImage], // 模拟轮播图
            sales: 1000
        }
    }, 500)
})
</script>

<style lang="scss" scoped>
.product-detail {
    min-height: 100vh;
    background-color: #f7f8fa;
    padding-bottom: 50px;

    .content {
        padding-bottom: 20px;
    }

    .info-card {
        background: #fff;
        padding: 12px 16px;
        margin-bottom: 10px;
        border-radius: 0 0 12px 12px;

        .price-row {
            display: flex;
            align-items: baseline;
            margin-bottom: 8px;

            .currency {
                font-size: 16px;
                color: var(--van-danger-color);
                font-weight: bold;
            }

            .price {
                font-size: 24px;
                color: var(--van-danger-color);
                font-weight: bold;
                margin-right: 8px;
            }

            .original-price {
                font-size: 12px;
                color: #999;
                text-decoration: line-through;
                margin-left: 8px;
            }
        }

        .title {
            font-size: 16px;
            font-weight: 700;
            color: #333;
            line-height: 1.4;
            margin-bottom: 8px;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }

        .subtitle {
            font-size: 12px;
            color: #666;
            line-height: 1.4;
        }
    }

    .sku-card,
    .address-card {
        background: #fff;
        padding: 12px 16px;
        margin-bottom: 10px;
        border-radius: 12px;
    }

    .sku-card {
        display: flex;
        align-items: center;

        .label {
            width: 40px;
            font-size: 13px;
            color: #999;
            font-weight: bold;
        }

        .value {
            flex: 1;
            font-size: 13px;
            color: #333;
            font-weight: bold;
        }

        .arrow {
            color: #999;
        }
    }

    .address-card {
        .row {
            display: flex;
            margin-bottom: 12px;

            .label {
                width: 40px;
                font-size: 13px;
                color: #999;
                font-weight: bold;
                margin-top: 2px;
            }

            .value {
                flex: 1;

                .location {
                    font-size: 13px;
                    color: #333;
                    font-weight: bold;
                    margin-bottom: 4px;
                }

                .delivery-time {
                    font-size: 12px;
                    color: #999;
                }
            }

            .arrow {
                color: #999;
                margin-top: 2px;
            }
        }

        .service-tags {
            display: flex;
            flex-wrap: wrap;
            background: #fcfcfc;
            padding: 8px;
            border-radius: 4px;

            .tag {
                font-size: 11px;
                color: #666;
                margin-right: 12px;
                display: flex;
                align-items: center;

                .van-icon {
                    color: var(--van-danger-color);
                    margin-right: 2px;
                }
            }
        }
    }

    .detail-images {
        background: #fff;
        margin-top: 10px;
        padding-top: 10px;

        .section-title {
            padding: 0 16px 10px;
            font-size: 14px;
            font-weight: bold;
            color: #333;
            position: relative;

            &::before {
                content: '';
                display: inline-block;
                width: 3px;
                height: 14px;
                background: var(--van-danger-color);
                vertical-align: middle;
                margin-right: 8px;
                border-radius: 2px;
            }
        }

        .images {
            font-size: 0; // Remove gap between images
        }
    }

    .skeleton {
        padding: 20px;
        background: #fff;
    }

    .sku-content {
        padding: 16px;
        padding-bottom: 80px;
        min-height: 400px;
        position: relative;

        .sku-header {
            display: flex;
            margin-bottom: 24px;

            .sku-img {
                width: 80px;
                height: 80px;
                border-radius: 8px;
                overflow: hidden;
                margin-right: 12px;
            }

            .sku-info {
                display: flex;
                flex-direction: column;
                justify-content: flex-end;

                .price {
                    font-size: 20px;
                    color: var(--van-danger-color);
                    font-weight: bold;
                    margin-bottom: 4px;

                    &::before {
                        content: '¥';
                        font-size: 14px;
                    }
                }

                .selected {
                    font-size: 12px;
                    color: #666;
                }
            }
        }

        .sku-group {
            margin-bottom: 20px;

            .group-title {
                font-size: 13px;
                color: #333;
                font-weight: bold;
                margin-bottom: 12px;
            }

            .tags {
                display: flex;
                flex-wrap: wrap;

                .tag {
                    padding: 6px 16px;
                    background: #f2f2f2;
                    border-radius: 16px;
                    font-size: 12px;
                    color: #333;
                    margin-right: 12px;
                    margin-bottom: 8px;
                    border: 1px solid transparent;

                    &.active {
                        background: #ffebeb;
                        color: var(--van-danger-color);
                        border-color: var(--van-danger-color);
                    }
                }
            }
        }

        .sku-count {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 20px;
            margin-bottom: 20px;

            span {
                font-size: 13px;
                font-weight: bold;
            }
        }

        .payment-methods {
            display: flex;
            flex-direction: column;
            gap: 10px;

            .payment-item {
                display: flex;
                align-items: center;
                padding: 12px;
                background: #f7f8fa;
                border-radius: 8px;
                border: 1px solid transparent;
                transition: all 0.3s;

                .icon {
                    margin-right: 10px;
                }

                .name {
                    flex: 1;
                    font-size: 14px;
                    color: #333;
                }

                .check {
                    color: var(--van-danger-color);
                    font-size: 16px;
                }

                &.active {
                    background: #fff5f5;
                    border-color: var(--van-danger-color);

                    .name {
                        color: var(--van-danger-color);
                        font-weight: bold;
                    }
                }
            }
        }

        .sku-actions {
            position: absolute;
            bottom: 10px;
            left: 16px;
            right: 16px;
        }
    }

    // 悬浮购物车按钮
    .floating-cart-wrapper {
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, #ee0a24 0%, #ff6034 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(238, 10, 36, 0.4);
        cursor: pointer;
        transition: all 0.3s ease;

        &:active {
            transform: scale(0.95);
        }

        :deep(.van-badge) {
            .van-badge__wrapper {
                display: flex;
                align-items: center;
                justify-content: center;
            }
        }
    }

    // 抛物线动画球
    .ball-container {
        position: fixed;
        z-index: 9999;
        pointer-events: none;

        .inner-ball {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);

            img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
        }
    }
}
</style>
