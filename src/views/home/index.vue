<template>
  <div class="home-container">
    <van-nav-bar :title="$t('route.home')" fixed placeholder />

    <div class="home-content">
      <!-- 轮播图 -->
      <van-swipe class="home-swipe" :autoplay="3000" indicator-color="white">
        <van-swipe-item v-for="item in banners" :key="item.id">
          <div class="swipe-item" :style="{ backgroundColor: item.color }">
            {{ item.title }}
          </div>
        </van-swipe-item>
      </van-swipe>

      <!-- 功能网格 -->
      <van-grid :column-num="4" class="home-grid">
        <van-grid-item v-for="item in features" :key="item.id" :icon="item.icon" :text="item.text"
          @click="handleFeatureClick(item)" />
      </van-grid>

      <!-- 内容列表 -->
      <div class="home-list">
        <van-cell-group inset>
          <van-cell v-for="item in list" :key="item.id" :title="item.title" :label="item.description" is-link
            @click="handleItemClick(item)" />
        </van-cell-group>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { showToast } from 'vant'

// 轮播图数据
const banners = ref([
  { id: 1, title: 'Banner 1', color: '#1989fa' },
  { id: 2, title: 'Banner 2', color: '#07c160' },
  { id: 3, title: 'Banner 3', color: '#ff976a' }
])

// 功能网格数据
const features = ref([
  { id: 1, icon: 'home-o', text: '功能1' },
  { id: 2, icon: 'search', text: '功能2' },
  { id: 3, icon: 'friends-o', text: '功能3' },
  { id: 4, icon: 'setting-o', text: '功能4' },
  { id: 5, icon: 'photo-o', text: '功能5' },
  { id: 6, icon: 'chat-o', text: '功能6' },
  { id: 7, icon: 'star-o', text: '功能7' },
  { id: 8, icon: 'more-o', text: '更多' }
])

// 列表数据
const list = ref([
  { id: 1, title: '列表项 1', description: '这是列表项 1 的描述' },
  { id: 2, title: '列表项 2', description: '这是列表项 2 的描述' },
  { id: 3, title: '列表项 3', description: '这是列表项 3 的描述' },
  { id: 4, title: '列表项 4', description: '这是列表项 4 的描述' }
])

const handleFeatureClick = (item) => {
  showToast(item.text)
}

const handleItemClick = (item) => {
  showToast(item.description)
}
</script>

<style lang="scss" scoped>
.home-container {
  min-height: 100vh;
  background-color: var(--bg-color);

  .home-content {
    padding-bottom: 60px;

    .home-swipe {
      height: 200px;

      .swipe-item {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: #fff;
        font-size: 20px;
        font-weight: 600;
      }
    }

    .home-grid {
      margin: $spacing-md 0;
    }

    .home-list {
      margin-top: $spacing-md;
    }
  }
}
</style>
