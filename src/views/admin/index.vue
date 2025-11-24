<template>
  <div class="admin-container">
    <van-nav-bar :title="$t('route.admin')" fixed placeholder left-arrow @click-left="handleBack" />
    
    <div class="admin-content">
      <van-cell-group inset>
        <van-cell title="管理功能 1" is-link />
        <van-cell title="管理功能 2" is-link />
        <van-cell title="管理功能 3" is-link />
        <van-cell title="管理功能 4" is-link />
      </van-cell-group>
      
      <van-empty
        class="admin-empty"
        description="仅管理员可访问"
      />
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const handleBack = () => {
  router.back()
}
</script>

<style lang="scss" scoped>
.admin-container {
  min-height: 100vh;
  background-color: var(--bg-color);
  
  .admin-content {
    padding: $spacing-md 0;
    
    .admin-empty {
      margin-top: $spacing-xl;
    }
  }
}
</style>

