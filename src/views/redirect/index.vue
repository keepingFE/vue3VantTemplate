<template>
    <div></div>
</template>

<script setup>
import { onBeforeMount } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

onBeforeMount(() => {
    const { params, query } = route
    const { path } = params
    // path 是一个数组，需要用 / 连接
    const targetPath = Array.isArray(path) ? '/' + path.join('/') : '/' + path
    router.replace({ path: targetPath, query })
})
</script>
