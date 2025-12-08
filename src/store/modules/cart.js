import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import productImage from '@/assets/images/picture.jpg'

export const useCartStore = defineStore('cart', () => {
    // 购物车列表
    const cartList = ref([
        {
            id: 1,
            name: '高端智能手表 Pro Max 2025新款',
            price: 2999,
            count: 1,
            image: productImage,
            sku: '黑色, 标准版'
        },
        {
            id: 2,
            name: '无线降噪耳机 Air',
            price: 1299,
            count: 2,
            image: productImage,
            sku: '白色'
        }
    ])

    // 购物车商品总数量
    const cartCount = computed(() => {
        return cartList.value.reduce((total, item) => total + item.count, 0)
    })

    // 添加商品到购物车
    const addToCart = (product) => {
        const existItem = cartList.value.find(item => 
            item.id === product.id && item.sku === product.sku
        )
        
        if (existItem) {
            existItem.count += product.count || 1
        } else {
            cartList.value.push({
                id: product.id || Date.now(),
                name: product.name,
                price: product.price,
                count: product.count || 1,
                image: product.image,
                sku: product.sku
            })
        }
    }

    // 删除单个商品
    const removeItem = (itemId) => {
        const index = cartList.value.findIndex(item => item.id === itemId)
        if (index > -1) {
            cartList.value.splice(index, 1)
        }
    }

    // 清空购物车
    const clearCart = () => {
        cartList.value = []
    }

    // 更新商品数量
    const updateItemCount = (itemId, count) => {
        const item = cartList.value.find(item => item.id === itemId)
        if (item) {
            item.count = count
        }
    }

    return {
        cartList,
        cartCount,
        addToCart,
        removeItem,
        clearCart,
        updateItemCount
    }
}, {
    persist: true // 持久化存储
})
