<template>
    <div class="waterfall-container" ref="containerRef">
        <div class="waterfall-column" v-for="(column, colIndex) in columns" :key="colIndex"
            :style="{ width: columnWidth }">
            <div class="waterfall-item" v-for="(item, index) in column" :key="item.id || index"
                @click="handleClick(item, index)">
                <div class="image-wrapper">
                    <img :src="item.src" :alt="item.alt || ''" @load="(e) => handleImageLoad(e, item)"
                        @error="handleImageError" loading="lazy" />
                    <div v-if="item.loading" class="loading-mask">
                        <span class="loading-icon"></span>
                    </div>
                </div>
                <div v-if="showInfo && !item.loading && (item.title || item.description)" class="image-info">
                    <div v-if="item.title" class="image-title">{{ item.title }}</div>
                    <div v-if="item.description" class="image-desc">{{ item.description }}</div>
                </div>
                <slot name="item" :item="item" :index="index"></slot>
            </div>
        </div>

        <!-- 预览弹窗 -->
        <teleport to="body">
            <div v-if="previewVisible" class="preview-overlay" @click="closePreview">
                <div class="preview-content" @click.stop>
                    <img :src="previewImage?.src" :alt="previewImage?.alt || ''" />
                    <span class="preview-close" @click="closePreview">&times;</span>
                </div>
            </div>
        </teleport>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'

const props = defineProps({
    // 图片列表
    images: {
        type: Array,
        default: () => []
    },
    // 列数
    columnCount: {
        type: Number,
        default: 3
    },
    // 列间距
    gap: {
        type: Number,
        default: 16
    },
    // 是否显示图片信息
    showInfo: {
        type: Boolean,
        default: true
    },
    // 是否启用预览
    preview: {
        type: Boolean,
        default: true
    }
})

const emit = defineEmits(['click', 'load', 'error'])

const containerRef = ref(null)
const columns = ref([])
const columnHeights = ref([])
const previewVisible = ref(false)
const previewImage = ref(null)

// 计算每列宽度
const columnWidth = computed(() => {
    return `calc((100% - ${(props.columnCount - 1) * props.gap}px) / ${props.columnCount})`
})

// 初始化列
const initColumns = () => {
    columns.value = Array.from({ length: props.columnCount }, () => [])
    columnHeights.value = Array(props.columnCount).fill(0)
}

// 获取最短列索引
const getShortestColumnIndex = () => {
    let minHeight = columnHeights.value[0]
    let minIndex = 0
    for (let i = 1; i < columnHeights.value.length; i++) {
        if (columnHeights.value[i] < minHeight) {
            minHeight = columnHeights.value[i]
            minIndex = i
        }
    }
    return minIndex
}

// 分配图片到各列（按行顺序：从左到右，一行一行）
const distributeImages = () => {
    initColumns()

    props.images.forEach((image, index) => {
        // 按行顺序分配：第0张到第0列，第1张到第1列...循环
        const colIndex = index % props.columnCount
        columns.value[colIndex].push({ ...image, loading: true })
    })
}

// 图片加载完成
const handleImageLoad = (e, item) => {
    item.loading = false
    emit('load', { item, event: e })
}

// 图片加载失败
const handleImageError = (e) => {
    emit('error', e)
}

// 点击图片
const handleClick = (item, index) => {
    emit('click', { item, index })
    if (props.preview) {
        previewImage.value = item
        previewVisible.value = true
    }
}

// 关闭预览
const closePreview = () => {
    previewVisible.value = false
    previewImage.value = null
}

// ESC 关闭预览
const handleKeydown = (e) => {
    if (e.key === 'Escape' && previewVisible.value) {
        closePreview()
    }
}

// 监听图片列表变化
watch(() => props.images, () => {
    nextTick(() => {
        distributeImages()
    })
}, { deep: true, immediate: true })

// 监听列数变化
watch(() => props.columnCount, () => {
    nextTick(() => {
        distributeImages()
    })
})

onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
    document.removeEventListener('keydown', handleKeydown)
})

// 暴露方法
defineExpose({
    refresh: distributeImages
})
</script>

<style scoped>
.waterfall-container {
    display: flex;
    gap: v-bind('gap + "px"');
    width: 100%;
}

.waterfall-column {
    display: flex;
    flex-direction: column;
    gap: v-bind('gap + "px"');
}

.waterfall-item {
    break-inside: avoid;
    border-radius: 8px;
    overflow: hidden;
    background: #f5f5f5;
    cursor: pointer;
    transition: transform 0.3s, box-shadow 0.3s;
}

.waterfall-item:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.image-wrapper {
    position: relative;
    width: 100%;
}

.image-wrapper img {
    display: block;
    width: 100%;
    height: auto;
}

.loading-mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.8);
}

.loading-icon {
    width: 24px;
    height: 24px;
    border: 2px solid #e0e0e0;
    border-top-color: #409eff;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.image-info {
    padding: 12px;
    background: #fff;
}

.image-title {
    font-size: 14px;
    font-weight: 500;
    color: #333;
    margin-bottom: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.image-desc {
    font-size: 12px;
    color: #999;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
}

/* 预览弹窗 */
.preview-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
}

.preview-content {
    position: relative;
    max-width: 90vw;
    max-height: 90vh;
}

.preview-content img {
    max-width: 100%;
    max-height: 90vh;
    object-fit: contain;
}

.preview-close {
    position: absolute;
    top: -40px;
    right: 0;
    font-size: 32px;
    color: #fff;
    cursor: pointer;
    line-height: 1;
}

.preview-close:hover {
    color: #409eff;
}
</style>
