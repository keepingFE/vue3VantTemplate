<template>
  <div class="app-wrapper">
    <van-config-provider :theme-vars="themeVars">
      <router-view v-slot="{ Component, route }">
        <keep-alive :include="cachedViews">
          <component :is="Component" :key="route.path" />
        </keep-alive>
      </router-view>
    </van-config-provider>
  </div>
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
  warningColor: '#ff976a'
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
  display: flex;
  justify-content: center;
  background-color: #f0f0f0;
}

.app-wrapper {
  width: 100%;
  max-width: 750px;
  /* PC 端固定 750px，移动端自适应 */
  height: 100vh;
  background-color: var(--bg-color);
  box-sizing: border-box;
  position: relative;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  /* PC端添加阴影效果 */
}

/* 移动端去除阴影 */
@media (max-width: 750px) {
  #app {
    background-color: var(--bg-color);
  }

  .app-wrapper {
    box-shadow: none;
  }
}

/* 居中固定的底部导航栏，避免 PC 端撑满全屏 */
:deep(.van-tabbar) {
  left: 50%;
  right: auto;
  transform: translateX(-50%);
  width: 100%;
  max-width: 750px;
}
</style>
