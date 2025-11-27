<template>
  <div class="layout-container">
    <router-view />
    <!-- 底部导航菜单 -->
    <van-tabbar v-model="active" route fixed placeholder>
      <van-tabbar-item v-for="item in tabbarItems" :key="item.name" :to="item.to" :icon="item.icon">
        {{ item.text }}
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const active = ref(0)

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
    name: 'message',
    to: '/message',
    icon: 'chat-o',
    text: t('route.message')
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
