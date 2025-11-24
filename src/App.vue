<template>
  <van-config-provider :theme-vars="themeVars">
    <router-view v-slot="{ Component, route }">
      <keep-alive :include="cachedViews">
        <component :is="Component" :key="route.path" />
      </keep-alive>
    </router-view>
  </van-config-provider>
</template>

<script setup>
import { computed } from 'vue'
import { useAppStore } from '@/store/modules/app'

const appStore = useAppStore()

// Vant 主题变量
const themeVars = computed(() => ({
  primaryColor: appStore.themeColor.primary,
  successColor: '#07c160',
  dangerColor: '#ee0a24',
  warningColor: '#ff976a',
  textColor: 'var(--text-primary)',
  backgroundColor: 'var(--bg-color)',
  borderColor: 'var(--border-color)'
}))

// 需要缓存的视图
const cachedViews = computed(() => {
  // 这里可以根据路由配置动态获取需要缓存的组件
  return ['Home', 'User']
})
</script>

<style lang="scss">
#app {
  width: 100%;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
    'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
    'Noto Color Emoji';
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>

