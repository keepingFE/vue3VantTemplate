<template>
  <div class="error-container">
    <van-empty
      class="error-empty"
      image="error"
      :description="$t('route.notFound')"
    >
      <van-button
        round
        type="primary"
        class="error-button"
        @click="handleBack"
      >
        {{ $t('common.back') }}
      </van-button>
    </van-empty>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const handleBack = () => {
  router.push('/')
}
</script>

<style lang="scss" scoped>
.error-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-color);
  
  .error-empty {
    .error-button {
      width: 160px;
    }
  }
}
</style>

