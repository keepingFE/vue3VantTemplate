<template>
  <div class="layout-container">
    <router-view v-slot="{ Component, route }">
      <keep-alive :include="cachedViews">
        <component :is="Component" :key="route.name" />
      </keep-alive>
    </router-view>
    <!-- 底部导航菜单 -->
    <van-tabbar v-model="active" route fixed placeholder>
      <van-tabbar-item v-for="item in tabbarItems" :key="item.name" :to="item.to" :icon="item.icon">
        {{ item.text }}
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useKeepAliveStore } from '@/store/modules/keepAlive'

const { t } = useI18n()
const active = ref(0)
const keepAliveStore = useKeepAliveStore()

// 需要缓存的视图
const cachedViews = computed(() => keepAliveStore.getCachedViews)

const tabbarItems = [
  {
    name: 'home',
    to: '/home',
    icon: 'home-o',
    text: t('route.home')
  },
  {
    name: 'list',
    to: '/list',
    icon: 'bars',
    text: t('route.list')
  },
  {
    name: 'chart',
    to: '/chart',
    icon: 'chart-trending-o',
    text: t('route.chart')
  },
  {
    name: 'product',
    to: '/product',
    icon: 'shopping-cart-o',
    text: t('route.product')
  },
  {
    name: 'user',
    to: '/user',
    icon: 'user-o',
    text: t('route.user')
  }
]
</script>

<style lang="scss" scoped>
.layout-container {
  min-height: 100vh;
  background-color: var(--bg-color);
}
</style>
