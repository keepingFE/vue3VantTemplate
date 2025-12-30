<template>
    <div class="product-container">
        <van-nav-bar :title="$t('route.product')" fixed placeholder />

        <div class="product-content">
            <!-- 搜索栏 -->
            <div class="search-wrapper">
                <van-search size="small" v-model="searchValue" :placeholder="$t('common.search')" show-action
                    @search="onSearch">
                    <template #action>
                        <div @click="onSearch">{{ $t('common.search') }}</div>
                    </template>
                </van-search>
                <!-- 布局切换按钮 -->
                <div class="layout-toggle" @click="toggleLayout">
                    <van-icon :name="layoutMode === 'double' ? 'bars' : 'apps-o'" size="20" />
                </div>
            </div>

            <!-- 分类标签 -->
            <van-tabs v-model:active="activeCategory" sticky @change="onCategoryChange">
                <van-tab v-for="category in categories" :key="category.id" :title="category.name" />
            </van-tabs>

            <!-- 排序栏 -->
            <div class="sort-bar">
                <div class="sort-item" :class="{ active: sortType === 'default' }" @click="handleSort('default')">
                    <span>{{ $t('product.sort.default') }}</span>
                </div>
                <div class="sort-item" :class="{ active: sortType === 'sales' }" @click="handleSort('sales')">
                    <span>{{ $t('product.sort.sales') }}</span>
                    <van-icon v-if="sortType === 'sales'" :name="sortOrder === 'desc' ? 'arrow-down' : 'arrow-up'"
                        size="12" />
                </div>
                <div class="sort-item" :class="{ active: sortType === 'price' }" @click="handleSort('price')">
                    <span>{{ $t('product.sort.price') }}</span>
                    <van-icon v-if="sortType === 'price'" :name="sortOrder === 'desc' ? 'arrow-down' : 'arrow-up'"
                        size="12" />
                </div>
                <van-dropdown-menu>
                    <van-dropdown-item v-model="brandFilter" :options="brandOptions" @change="onBrandChange">
                        <template #title>
                            <span :class="{ 'active-text': brandFilter }">{{ $t('product.sort.brand') }}</span>
                        </template>
                    </van-dropdown-item>
                    <van-dropdown-item v-model="materialFilter" :options="materialOptions" @change="onMaterialChange">
                        <template #title>
                            <span :class="{ 'active-text': materialFilter }">{{ $t('product.sort.material') }}</span>
                        </template>
                    </van-dropdown-item>
                </van-dropdown-menu>
                <!-- 筛选按钮 -->
                <div class="sort-item filter-btn" :class="{ active: hasActiveFilter }" @click="openFilterPopup">
                    <van-icon name="filter-o" size="16" />
                    <span>{{ $t('product.filter.title') }}</span>
                    <van-badge v-if="filterCount > 0" :content="filterCount" />
                </div>
            </div>

            <!-- 商品列表 -->
            <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
                <van-list v-model:loading="loading" :finished="finished" :finished-text="$t('common.noMore')"
                    @load="onLoad">
                    <div :class="['product-grid', `layout-${layoutMode}`]">
                        <div v-for="item in productList" :key="item.id" class="product-card"
                            @click="handleProductClick(item)">
                            <van-image :src="item.image" fit="cover" class="product-image">
                                <template v-slot:loading>
                                    <van-loading type="spinner" size="20" />
                                </template>
                            </van-image>
                            <div class="product-info">
                                <div class="product-name">{{ item.name }}</div>
                                <div class="product-desc">{{ item.description }}</div>
                                <div class="product-footer">
                                    <span class="product-price">¥{{ item.price }}</span>
                                    <span class="product-sales">{{ item.sales }}人付款</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </van-list>
            </van-pull-refresh>

            <!-- 空状态 -->
            <van-empty v-if="!loading && productList.length === 0" :description="$t('common.noData')" />
        </div>

        <!-- 筛选弹窗 -->
        <van-popup v-model:show="showFilterPopup" position="right" :style="{ width: '80%', height: '100%' }">
            <div class="filter-popup">
                <div class="filter-header">
                    <span class="filter-title">{{ $t('product.filter.title') }}</span>
                    <van-icon name="cross" size="20" @click="showFilterPopup = false" />
                </div>

                <div class="filter-content">
                    <!-- 价格区间 -->
                    <div class="filter-section">
                        <div class="section-title">{{ $t('product.filter.priceRange') }}</div>
                        <div class="price-range">
                            <van-field size="small" v-model="tempFilters.minPrice" type="number"
                                :placeholder="$t('product.filter.minPrice')" />
                            <span class="price-separator">-</span>
                            <van-field size="small" v-model="tempFilters.maxPrice" type="number"
                                :placeholder="$t('product.filter.maxPrice')" />
                        </div>
                    </div>

                    <!-- 季节筛选 -->
                    <div class="filter-section">
                        <div class="section-title">{{ $t('product.filter.season') }}</div>
                        <div class="filter-tags">
                            <div v-for="season in seasonOptions" :key="season.value" class="filter-tag"
                                :class="{ active: tempFilters.season === season.value }"
                                @click="tempFilters.season = season.value">
                                {{ season.text }}
                            </div>
                        </div>
                    </div>

                    <!-- 人群筛选 -->
                    <div class="filter-section">
                        <div class="section-title">{{ $t('product.filter.crowd') }}</div>
                        <div class="filter-tags">
                            <div v-for="crowd in crowdOptions" :key="crowd.value" class="filter-tag"
                                :class="{ active: tempFilters.crowd === crowd.value }"
                                @click="tempFilters.crowd = crowd.value">
                                {{ crowd.text }}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="filter-footer">
                    <van-button size="small" block plain @click="resetFilters">{{ $t('product.filter.reset')
                        }}</van-button>
                    <van-button size="small" block type="primary" @click="applyFilters">{{ $t('product.filter.confirm')
                    }}</van-button>
                </div>
            </div>
        </van-popup>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useI18n } from 'vue-i18n'
import productImage from '@/assets/images/picture.jpg'

defineOptions({
    name: 'Product'
})

const router = useRouter()
const { t } = useI18n()

const searchValue = ref('')
const activeCategory = ref(0)
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const productList = ref([])
const page = ref(1)
const pageSize = 10

// 布局模式：single-单列，double-双列
const layoutMode = ref(localStorage.getItem('productLayoutMode') || 'double')

// 排序相关
const sortType = ref('default') // default, sales, price
const sortOrder = ref('desc') // asc, desc
const brandFilter = ref('') // 品牌筛选
const materialFilter = ref('') // 材质筛选

// 品牌选项
const brandOptions = ref([
    { text: '全部品牌', value: '' },
    { text: 'Apple', value: 'Apple' },
    { text: 'Samsung', value: 'Samsung' },
    { text: 'Xiaomi', value: 'Xiaomi' },
    { text: 'Huawei', value: 'Huawei' },
    { text: 'Sony', value: 'Sony' }
])

// 材质选项
const materialOptions = ref([
    { text: '全部材质', value: '' },
    { text: '金属', value: '金属' },
    { text: '塑料', value: '塑料' },
    { text: '玻璃', value: '玻璃' },
    { text: '陶瓷', value: '陶瓷' },
    { text: '不锈钢', value: '不锈钢' }
])

// 筛选弹窗显示状态
const showFilterPopup = ref(false)

// 筛选条件
const filters = ref({
    minPrice: '',
    maxPrice: '',
    season: '',
    crowd: ''
})

// 临时筛选条件（用于弹窗）
const tempFilters = ref({
    minPrice: '',
    maxPrice: '',
    season: '',
    crowd: ''
})

// 季节选项
const seasonOptions = computed(() => [
    { text: t('product.filter.allSeasons'), value: '' },
    { text: t('product.filter.spring'), value: 'spring' },
    { text: t('product.filter.summer'), value: 'summer' },
    { text: t('product.filter.autumn'), value: 'autumn' },
    { text: t('product.filter.winter'), value: 'winter' }
])

// 人群选项
const crowdOptions = computed(() => [
    { text: t('product.filter.allCrowds'), value: '' },
    { text: t('product.filter.men'), value: 'men' },
    { text: t('product.filter.women'), value: 'women' },
    { text: t('product.filter.kids'), value: 'kids' },
    { text: t('product.filter.elderly'), value: 'elderly' },
    { text: t('product.filter.unisex'), value: 'unisex' }
])

// 计算筛选条件数量
const filterCount = computed(() => {
    let count = 0
    if (filters.value.minPrice || filters.value.maxPrice) count++
    if (filters.value.season) count++
    if (filters.value.crowd) count++
    return count
})

// 是否有激活的筛选
const hasActiveFilter = computed(() => filterCount.value > 0)

// 分类数据
const categories = ref([
    { id: 0, name: '全部' },
    { id: 1, name: '热销' },
    { id: 2, name: '新品' },
    { id: 3, name: '优惠' }
])

// 模拟商品数据
const mockProducts = [
    {
        id: 1,
        name: '高端智能手表 Pro Max',
        description: '健康监测/运动追踪/超长续航',
        price: 2999,
        sales: 1234,
        image: productImage,
        category: 1,
        brand: 'Apple',
        material: '金属',
        season: 'spring',
        crowd: 'unisex'
    },
    {
        id: 2,
        name: '无线降噪耳机 Air',
        description: '主动降噪/高保真音质/30小时续航',
        price: 1299,
        sales: 2568,
        image: productImage,
        category: 1,
        brand: 'Sony',
        material: '塑料',
        season: 'summer',
        crowd: 'unisex'
    },
    {
        id: 3,
        name: '便携充电宝 20000mAh',
        description: '大容量/快充/多设备兼容',
        price: 199,
        sales: 8956,
        image: productImage,
        category: 3,
        brand: 'Xiaomi',
        material: '金属',
        season: 'autumn',
        crowd: 'unisex'
    },
    {
        id: 4,
        name: '智能台灯 护眼版',
        description: 'LED护眼/无级调光/定时关灯',
        price: 299,
        sales: 3421,
        image: productImage,
        category: 2,
        brand: 'Xiaomi',
        material: '塑料',
        season: 'winter',
        crowd: 'kids'
    },
    {
        id: 5,
        name: '机械键盘 青轴版',
        description: 'RGB背光/热插拔/人体工程学',
        price: 599,
        sales: 1823,
        image: productImage,
        category: 2,
        brand: 'Samsung',
        material: '金属',
        season: 'spring',
        crowd: 'men'
    },
    {
        id: 6,
        name: '蓝牙音箱 迷你版',
        description: 'IPX7防水/360度环绕/12小时续航',
        price: 399,
        sales: 4567,
        image: productImage,
        category: 3,
        brand: 'Sony',
        material: '塑料',
        season: 'summer',
        crowd: 'women'
    },
    {
        id: 7,
        name: '运动手环 青春版',
        description: '心率监测/睡眠追踪/防水',
        price: 149,
        sales: 12890,
        image: productImage,
        category: 1,
        brand: 'Xiaomi',
        material: '塑料',
        season: 'autumn',
        crowd: 'kids'
    },
    {
        id: 8,
        name: '复古胶片相机',
        description: '一次成像/自动曝光/闪光灯',
        price: 459,
        sales: 2341,
        image: productImage,
        category: 2,
        brand: 'Huawei',
        material: '金属',
        season: 'winter',
        crowd: 'elderly'
    },
    {
        id: 9,
        name: '无线鼠标 静音版',
        description: '人体工学/低功耗/多设备切换',
        price: 129,
        sales: 6782,
        image: productImage,
        category: 3,
        brand: 'Samsung',
        material: '塑料',
        season: 'spring',
        crowd: 'men'
    },
    {
        id: 10,
        name: '便携咖啡杯',
        description: '保温保冷/304不锈钢/500ml',
        price: 89,
        sales: 15678,
        image: productImage,
        category: 3,
        brand: 'Huawei',
        material: '不锈钢',
        season: 'winter',
        crowd: 'women'
    }
]

// 切换布局模式
const toggleLayout = () => {
    layoutMode.value = layoutMode.value === 'double' ? 'single' : 'double'
    localStorage.setItem('productLayoutMode', layoutMode.value)
}

// 加载商品数据
const loadProducts = async () => {
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 500))

    let filteredProducts = [...mockProducts]

    // 根据分类过滤
    if (activeCategory.value !== 0) {
        filteredProducts = filteredProducts.filter(p => p.category === activeCategory.value)
    }

    // 根据关键词搜索
    if (searchValue.value) {
        const keyword = searchValue.value.toLowerCase()
        filteredProducts = filteredProducts.filter(
            p =>
                p.name.toLowerCase().includes(keyword) ||
                p.description.toLowerCase().includes(keyword)
        )
    }

    // 根据品牌筛选
    if (brandFilter.value) {
        filteredProducts = filteredProducts.filter(p => p.brand === brandFilter.value)
    }

    // 根据材质筛选
    if (materialFilter.value) {
        filteredProducts = filteredProducts.filter(p => p.material === materialFilter.value)
    }

    // 根据价格区间筛选
    if (filters.value.minPrice) {
        const minPrice = parseFloat(filters.value.minPrice)
        filteredProducts = filteredProducts.filter(p => p.price >= minPrice)
    }
    if (filters.value.maxPrice) {
        const maxPrice = parseFloat(filters.value.maxPrice)
        filteredProducts = filteredProducts.filter(p => p.price <= maxPrice)
    }

    // 根据季节筛选
    if (filters.value.season) {
        filteredProducts = filteredProducts.filter(p => p.season === filters.value.season)
    }

    // 根据人群筛选
    if (filters.value.crowd) {
        filteredProducts = filteredProducts.filter(p => p.crowd === filters.value.crowd)
    }

    // 排序处理
    if (sortType.value === 'sales') {
        filteredProducts.sort((a, b) => {
            return sortOrder.value === 'desc' ? b.sales - a.sales : a.sales - b.sales
        })
    } else if (sortType.value === 'price') {
        filteredProducts.sort((a, b) => {
            return sortOrder.value === 'desc' ? b.price - a.price : a.price - b.price
        })
    }

    // 分页处理
    const start = (page.value - 1) * pageSize
    const end = start + pageSize
    const pageData = filteredProducts.slice(start, end)

    if (page.value === 1) {
        productList.value = pageData
    } else {
        productList.value.push(...pageData)
    }

    // 检查是否已加载完
    if (productList.value.length >= filteredProducts.length) {
        finished.value = true
    }

    loading.value = false
    refreshing.value = false
}

// 下拉刷新
const onRefresh = () => {
    page.value = 1
    finished.value = false
    loadProducts()
}

// 上拉加载
const onLoad = () => {
    loadProducts()
    page.value++
}

// 搜索
const onSearch = () => {
    page.value = 1
    finished.value = false
    productList.value = []
    loading.value = true
    loadProducts()
}

// 切换分类
const onCategoryChange = () => {
    page.value = 1
    finished.value = false
    productList.value = []
    loading.value = true
    loadProducts()
}

// 处理排序
const handleSort = (type) => {
    if (sortType.value === type && type !== 'default') {
        // 如果点击的是当前排序类型，切换排序方向
        sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
    } else {
        // 切换排序类型
        sortType.value = type
        sortOrder.value = 'desc' // 默认降序
    }

    // 重新加载数据
    page.value = 1
    finished.value = false
    productList.value = []
    loading.value = true
    loadProducts()
}

// 品牌筛选变化
const onBrandChange = () => {
    page.value = 1
    finished.value = false
    productList.value = []
    loading.value = true
    loadProducts()
}

// 材质筛选变化
const onMaterialChange = () => {
    page.value = 1
    finished.value = false
    productList.value = []
    loading.value = true
    loadProducts()
}

// 点击商品
const handleProductClick = (item) => {
    // 跳转到商品详情页
    router.push(`/product/detail/${item.id}`)
}

// 应用筛选
const applyFilters = () => {
    // 验证价格区间
    if (tempFilters.value.minPrice && tempFilters.value.maxPrice) {
        const minPrice = parseFloat(tempFilters.value.minPrice)
        const maxPrice = parseFloat(tempFilters.value.maxPrice)
        if (minPrice > maxPrice) {
            showToast(t('product.filter.priceError'))
            return
        }
    }

    // 应用筛选条件
    filters.value = { ...tempFilters.value }
    showFilterPopup.value = false

    // 重新加载数据
    page.value = 1
    finished.value = false
    productList.value = []
    loading.value = true
    loadProducts()
}

// 重置筛选
const resetFilters = () => {
    tempFilters.value = {
        minPrice: '',
        maxPrice: '',
        season: '',
        crowd: ''
    }
}

// 监听筛选弹窗打开，同步临时筛选条件
const openFilterPopup = () => {
    tempFilters.value = { ...filters.value }
    showFilterPopup.value = true
}

onMounted(() => {
    // 初始化时自动加载
    loading.value = true
    loadProducts()
})
</script>

<style lang="scss" scoped>
.product-container {
    min-height: 100vh;
    background-color: var(--van-background);
    padding-bottom: 50px;

    .product-content {

        // 搜索栏容器
        .search-wrapper {
            display: flex;
            align-items: center;
            background-color: var(--van-background-2);
            padding-right: 12px;

            :deep(.van-search) {
                flex: 1;
                padding: 8px 0 8px 16px;
            }

            .layout-toggle {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 40px;
                height: 40px;
                cursor: pointer;
                color: var(--van-text-color);
                transition: all 0.3s;
                border-radius: 8px;

                &:active {
                    background-color: var(--van-gray-2);
                    transform: scale(0.95);
                }

                :deep(.van-icon) {
                    transition: transform 0.3s;
                }

                &:hover :deep(.van-icon) {
                    transform: rotate(180deg);
                }
            }
        }

        :deep(.van-tabs__nav) {
            background-color: var(--van-background-2);
        }

        // 排序栏
        .sort-bar {
            display: flex;
            align-items: center;
            background-color: var(--van-background-2);
            border-bottom: 1px solid var(--van-gray-2);
            position: sticky;
            top: 46px;
            z-index: 99;

            .sort-item {
                flex: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 4px;
                height: 44px;
                font-size: 14px;
                color: var(--van-text-color);
                cursor: pointer;
                transition: all 0.3s;
                position: relative;

                &.active {
                    color: var(--van-primary-color);
                    font-weight: 600;

                    &::after {
                        content: '';
                        position: absolute;
                        bottom: 0;
                        left: 50%;
                        transform: translateX(-50%);
                        width: 20px;
                        height: 2px;
                        background-color: var(--van-primary-color);
                        border-radius: 2px;
                    }
                }

                &:active {
                    background-color: var(--van-gray-1);
                }

                :deep(.van-icon) {
                    transition: transform 0.3s;
                }
            }

            :deep(.van-dropdown-menu) {
                flex: 2;
                background-color: transparent;

                .van-dropdown-menu__bar {
                    height: 44px;
                    background-color: transparent;
                    box-shadow: none;
                }

                .van-dropdown-menu__title {
                    font-size: 14px;
                    color: var(--van-text-color);

                    &.van-dropdown-menu__title--active {
                        color: var(--van-primary-color);
                        font-weight: 600;
                    }
                }

                .active-text {
                    color: var(--van-primary-color);
                    font-weight: 600;
                }
            }

            // 筛选按钮
            .filter-btn {
                flex: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 4px;
                position: relative;

                :deep(.van-badge) {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                }
            }
        }
    }

    // 筛选弹窗
    .filter-popup {
        height: 100%;
        display: flex;
        flex-direction: column;
        background-color: var(--van-background);

        .filter-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px;
            background-color: var(--van-background-2);
            border-bottom: 1px solid var(--van-gray-2);

            .filter-title {
                font-size: 16px;
                font-weight: 600;
                color: var(--van-text-color);
            }

            .van-icon {
                cursor: pointer;
                color: var(--van-text-color-2);
                transition: color 0.3s;

                &:active {
                    color: var(--van-text-color);
                }
            }
        }

        .filter-content {
            flex: 1;
            overflow-y: auto;
            padding: 16px;

            .filter-section {
                margin-bottom: 24px;

                .section-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--van-text-color);
                    margin-bottom: 12px;
                }

                // 价格区间
                .price-range {
                    display: flex;
                    align-items: center;
                    gap: 8px;

                    :deep(.van-field) {
                        flex: 1;
                        background-color: var(--van-background-2);
                        border-radius: 8px;
                        padding: 8px 12px;
                    }

                    .price-separator {
                        color: var(--van-text-color-2);
                        font-size: 14px;
                    }
                }

                // 筛选标签
                .filter-tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;

                    .filter-tag {
                        padding: 8px 16px;
                        background-color: var(--van-background-2);
                        border: 1px solid var(--van-gray-3);
                        border-radius: 20px;
                        font-size: 13px;
                        color: var(--van-text-color-2);
                        cursor: pointer;
                        transition: all 0.3s;

                        &:active {
                            transform: scale(0.95);
                        }

                        &.active {
                            background-color: var(--van-primary-color);
                            border-color: var(--van-primary-color);
                            color: #fff;
                        }
                    }
                }
            }
        }

        .filter-footer {
            display: flex;
            gap: 12px;
            padding: 16px;
            background-color: var(--van-background-2);
            border-top: 1px solid var(--van-gray-2);

            :deep(.van-button) {
                flex: 1;
            }
        }
    }

    // 商品网格布局
    .product-grid {
        padding: 12px;
        transition: all 0.3s ease;

        // 双列布局（默认）
        &.layout-double {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;

            .product-card {
                display: flex;
                flex-direction: column;
                background: var(--van-background-2);
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
                transition: transform 0.2s, box-shadow 0.2s;

                &:active {
                    transform: scale(0.98);
                    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
                }

                .product-image {
                    width: 100%;
                    height: 160px;
                }

                .product-info {
                    padding: 12px;

                    .product-name {
                        font-size: 14px;
                        font-weight: 600;
                        color: var(--van-text-color);
                        margin-bottom: 6px;
                        display: -webkit-box;
                        -webkit-line-clamp: 2;
                        -webkit-box-orient: vertical;
                        line-clamp: 2;
                        overflow: hidden;
                        line-height: 1.4;
                    }

                    .product-desc {
                        font-size: 12px;
                        color: var(--van-text-color-2);
                        margin-bottom: 8px;
                        display: -webkit-box;
                        -webkit-line-clamp: 1;
                        -webkit-box-orient: vertical;
                        line-clamp: 1;
                        overflow: hidden;
                    }

                    .product-footer {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;

                        .product-price {
                            font-size: 16px;
                            font-weight: bold;
                            color: var(--van-danger-color);
                        }

                        .product-sales {
                            font-size: 11px;
                            color: var(--van-text-color-3);
                        }
                    }
                }
            }
        }

        // 单列布局
        &.layout-single {
            display: flex;
            flex-direction: column;
            gap: 12px;

            .product-card {
                display: flex;
                flex-direction: row;
                background: var(--van-background-2);
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
                transition: transform 0.2s, box-shadow 0.2s;

                &:active {
                    transform: scale(0.99);
                    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
                }

                .product-image {
                    width: 140px;
                    height: 140px;
                    flex-shrink: 0;
                }

                .product-info {
                    flex: 1;
                    padding: 12px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;

                    .product-name {
                        font-size: 15px;
                        font-weight: 600;
                        color: var(--van-text-color);
                        margin-bottom: 8px;
                        display: -webkit-box;
                        -webkit-line-clamp: 2;
                        -webkit-box-orient: vertical;
                        line-clamp: 2;
                        overflow: hidden;
                        line-height: 1.5;
                    }

                    .product-desc {
                        font-size: 13px;
                        color: var(--van-text-color-2);
                        margin-bottom: 12px;
                        display: -webkit-box;
                        -webkit-line-clamp: 2;
                        -webkit-box-orient: vertical;
                        line-clamp: 2;
                        overflow: hidden;
                        line-height: 1.4;
                    }

                    .product-footer {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-end;

                        .product-price {
                            font-size: 18px;
                            font-weight: bold;
                            color: var(--van-danger-color);
                        }

                        .product-sales {
                            font-size: 12px;
                            color: var(--van-text-color-3);
                        }
                    }
                }
            }
        }
    }

    :deep(.van-empty) {
        padding: 60px 0;
    }
}
</style>
