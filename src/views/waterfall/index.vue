<template>
    <div class="waterfall-page">
        <van-nav-bar title="图片瀑布流" left-arrow @click-left="router.back()" fixed placeholder />

        <div class="page-content">
            <!-- 列数控制 -->
            <div class="control-bar">
                <span class="label">列数：</span>
                <van-stepper size="small" v-model="columnCount" :min="2" :max="5" />
            </div>

            <!-- 瀑布流组件 -->
            <WaterfallImageList :images="imageList" :column-count="columnCount" :gap="12" @click="handleImageClick" />
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import WaterfallImageList from '@/components/common/WaterfallImageList.vue'

const router = useRouter()
const columnCount = ref(2)

// 示例图片数据（使用 picsum 随机图片）
const imageList = ref([
    { id: 1, src: 'https://picsum.photos/400/300?random=1', title: '风景图片', description: '美丽的自然风光' },
    { id: 2, src: 'https://picsum.photos/400/500?random=2', title: '城市夜景', description: '繁华都市的夜晚' },
    { id: 3, src: 'https://picsum.photos/400/350?random=3', title: '海边日落', description: '金色的海岸线' },
    { id: 4, src: 'https://picsum.photos/400/450?random=4', title: '山间小路', description: '通往远方的道路' },
    { id: 5, src: 'https://picsum.photos/400/280?random=5', title: '花卉特写', description: '春天的气息' },
    { id: 6, src: 'https://picsum.photos/400/380?random=6', title: '建筑艺术', description: '现代建筑之美' },
    { id: 7, src: 'https://picsum.photos/400/420?random=7', title: '森林深处', description: '神秘的绿色世界' },
    { id: 8, src: 'https://picsum.photos/400/320?random=8', title: '湖光山色', description: '宁静的湖畔' },
    { id: 9, src: 'https://picsum.photos/400/480?random=9', title: '星空银河', description: '浩瀚的宇宙' },
    { id: 10, src: 'https://picsum.photos/400/360?random=10', title: '古镇风情', description: '历史的印记' },
    { id: 11, src: 'https://picsum.photos/400/400?random=11', title: '美食诱惑', description: '舌尖上的美味' },
    { id: 12, src: 'https://picsum.photos/400/340?random=12', title: '动物世界', description: '可爱的生灵' }
])

const handleImageClick = ({ item }) => {
    console.log('点击图片:', item)
}
</script>

<style lang="scss" scoped>
.waterfall-page {
    min-height: 100vh;
    background-color: var(--bg-color);
}

.page-content {
    padding: 12px;
}

.control-bar {
    display: flex;
    align-items: center;
    padding: 12px;
    background: #fff;
    border-radius: 8px;
    margin-bottom: 12px;

    .label {
        font-size: 14px;
        color: #333;
        margin-right: 12px;
    }
}
</style>
