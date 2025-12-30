# 路由缓存使用指南

## 概述

项目已优化路由缓存机制，支持基于路由配置的动态缓存管理。

## 功能特性

- ✅ 基于路由 `meta.keepAlive` 配置自动缓存
- ✅ 动态添加/移除缓存
- ✅ 刷新指定页面
- ✅ 关闭当前/其他/所有缓存页面
- ✅ 提供便捷的 Hook 函数
- ✅ 自动保持滚动位置

## 配置方式

### 1. 在路由配置中启用缓存

在 `src/router/routes.js` 中，为需要缓存的路由添加 `meta.keepAlive: true`：

```javascript
{
  path: '/home',
  name: 'Home',
  component: () => import('@/views/home/index.vue'),
  meta: {
    title: '首页',
    keepAlive: true  // 启用缓存
  }
}
```

### 2. 组件必须设置 name

被缓存的组件必须设置 `name` 选项，且与路由的 `name` 一致：

```vue
<script setup>
defineOptions({
  name: 'Home'  // 必须与路由 name 一致
})
</script>
```

**重要提示**：
- 组件的 `name` 必须与路由配置中的 `name` 完全一致（区分大小写）
- `keep-alive` 通过组件的 `name` 来匹配缓存，而不是通过路由路径

## 使用方法

### 在组件中使用 Hook

```vue
<script setup>
import { useKeepAlive } from '@/hooks/useKeepAlive'

const { refreshPage, closePage, closeOthers, closeAll } = useKeepAlive()

// 刷新当前页面
const handleRefresh = () => {
  refreshPage()
}

// 关闭当前页面并返回
const handleClose = () => {
  closePage()
}

// 关闭其他页面（保留当前）
const handleCloseOthers = () => {
  closeOthers()
}

// 关闭所有缓存页面
const handleCloseAll = () => {
  closeAll()
}
</script>

<template>
  <div>
    <van-button @click="handleRefresh">刷新页面</van-button>
    <van-button @click="handleClose">关闭页面</van-button>
    <van-button @click="handleCloseOthers">关闭其他</van-button>
    <van-button @click="handleCloseAll">关闭所有</van-button>
  </div>
</template>
```

### 直接使用 Store

```vue
<script setup>
import { useKeepAliveStore } from '@/store/modules/keepAlive'

const keepAliveStore = useKeepAliveStore()

// 添加缓存
keepAliveStore.addCachedView('Home')

// 移除缓存
keepAliveStore.removeCachedView('Home')

// 清空所有缓存
keepAliveStore.clearCachedViews()

// 获取缓存列表
const cachedViews = keepAliveStore.getCachedViews
</script>
```

## API 说明

### useKeepAlive Hook

| 方法 | 参数 | 说明 |
|------|------|------|
| `refreshPage` | `name?: string` | 刷新页面（移除缓存后重新加载） |
| `closePage` | `name?: string` | 关闭页面并返回 |
| `closeOthers` | `name?: string` | 关闭其他页面（保留指定页面） |
| `closeAll` | - | 关闭所有缓存页面 |
| `addCache` | `name: string` | 添加缓存 |
| `removeCache` | `name: string` | 移除缓存 |

### useKeepAliveStore

| 方法 | 参数 | 说明 |
|------|------|------|
| `addCachedView` | `name: string` | 添加缓存视图 |
| `removeCachedView` | `name: string` | 移除缓存视图 |
| `clearCachedViews` | - | 清空所有缓存 |
| `removeOthersCachedViews` | `name?: string` | 移除其他缓存 |
| `addMultipleCachedViews` | `names: string[]` | 批量添加缓存 |

## 注意事项

1. **组件 name 必须与路由 name 一致**
   - `keep-alive` 通过组件的 `name` 来匹配缓存
   - 确保路由配置的 `name` 与组件的 `name` 完全一致（区分大小写）
   - 示例：路由 `name: 'Home'` → 组件 `defineOptions({ name: 'Home' })`

2. **不要使用 route.path 作为 key**
   - ❌ 错误：`:key="route.path"` 会破坏缓存
   - ✅ 正确：`:key="route.name"` 或不设置 key

3. **缓存的生命周期**
   - 首次进入：`onMounted`
   - 从缓存激活：`onActivated`
   - 离开但保持缓存：`onDeactivated`
   - 完全销毁：`onUnmounted`

4. **数据刷新策略**
   - 在 `onActivated` 中处理需要刷新的数据
   - 避免在 `onMounted` 中请求每次都需要更新的数据
   - 可以使用标志位控制是否需要刷新

5. **滚动位置**
   - 缓存的页面会自动保持滚动位置
   - 如果需要每次都滚动到顶部，不要启用缓存
   - 或在 `onActivated` 中手动滚动：`window.scrollTo(0, 0)`

6. **动态路由参数**
   - 如果路由包含参数（如 `/detail/:id`），建议不要缓存
   - 或者使用 `route.fullPath` 作为 key（但会失去缓存优势）
   - 最佳实践：列表页缓存，详情页不缓存

## 示例场景

### 列表页缓存，详情页不缓存

```javascript
// 路由配置
{
  path: '/list',
  name: 'List',
  component: () => import('@/views/list/index.vue'),
  meta: {
    keepAlive: true  // 列表页缓存
  }
},
{
  path: '/list/detail/:id',
  name: 'ListDetail',
  component: () => import('@/views/list/detail.vue'),
  meta: {
    keepAlive: false  // 详情页不缓存
  }
}
```

### 从详情页返回时刷新列表

```vue
<!-- ListDetail.vue -->
<script setup>
import { useKeepAlive } from '@/hooks/useKeepAlive'
import { useRouter } from 'vue-router'

const router = useRouter()
const { removeCache } = useKeepAlive()

const handleBack = () => {
  // 移除列表页缓存，返回时会重新加载
  removeCache('List')
  router.back()
}
</script>
```

### 在列表页处理激活事件

```vue
<!-- List.vue -->
<script setup>
import { onActivated, onMounted } from 'vue'

// 首次加载
onMounted(() => {
  loadData()
})

// 从缓存激活时
onActivated(() => {
  // 可以选择性刷新数据
  if (needRefresh.value) {
    loadData()
    needRefresh.value = false
  }
})
</script>
```

## 工作原理

1. **路由跳转时**：
   - `router.afterEach` 守卫检查目标路由的 `meta.keepAlive`
   - 如果为 `true`，将路由的 `name` 添加到 `keepAliveStore.cachedViews`
   - Store 会自动去重，避免重复添加

2. **组件渲染时**：
   - `App.vue` 中的 `<keep-alive>` 通过 `include` 属性绑定 `cachedViews`
   - Vue 会缓存 `name` 在 `cachedViews` 中的组件实例
   - 使用 `route.name` 作为组件的 key，确保缓存正常工作

3. **滚动位置保持**：
   - 首次进入页面：滚动到顶部
   - 从缓存恢复：保持原来的滚动位置
   - 非缓存页面：每次都滚动到顶部

4. **动态管理**：
   - 通过 Hook 或 Store 方法可以动态管理缓存列表
   - 移除缓存后，下次进入会重新创建组件实例

## 关键实现细节

### 0. 嵌套路由的 keep-alive 位置 ⚠️ 重要！

**项目使用了嵌套路由结构**：
```
App.vue
  └─ Layout 组件
      └─ Home/List/User 等子路由组件
```

**关键点**：`keep-alive` 必须放在 `Layout.vue` 中，而不是 `App.vue` 中！

**原因**：
- `keep-alive` 只对**直接子组件**生效
- 如果放在 `App.vue`，只会缓存 `Layout` 组件本身
- 不会缓存 `Layout` 内部的子路由组件（Home、List 等）

**正确实现**：
```vue
<!-- Layout.vue -->
<router-view v-slot="{ Component, route }">
  <keep-alive :include="cachedViews">
    <component :is="Component" :key="route.name" />
  </keep-alive>
</router-view>
```

详见：[嵌套路由缓存关键问题](./keep-alive-critical-fix.md)

### 1. 组件 key 的选择

```vue
<!-- App.vue -->
<keep-alive :include="cachedViews">
  <component :is="Component" :key="route.name" />
</keep-alive>
```

**为什么使用 `route.name` 而不是 `route.path`？**

- ✅ `route.name`：同一个组件在不同路由下会被视为同一个实例，缓存正常工作
- ❌ `route.path`：每次路径变化都会创建新实例，破坏缓存机制

### 2. 滚动位置管理

```javascript
// router/guards.js
router.afterEach((to, from) => {
  const wasAlreadyCached = keepAliveStore.cachedViews.includes(to.name)
  
  // 只有在非缓存页面或首次进入时才滚动到顶部
  if (!to.meta?.keepAlive || !wasAlreadyCached) {
    window.scrollTo(0, 0)
  }
})
```

这样可以确保：
- 首次访问页面：滚动到顶部
- 从缓存恢复：保持之前的滚动位置
- 非缓存页面：每次都滚动到顶部

### 3. 刷新页面的实现

```javascript
// hooks/useKeepAlive.js
const refreshPage = async (name) => {
  // 1. 移除缓存
  keepAliveStore.removeCachedView(componentName)
  
  // 2. 通过重定向页面刷新
  await router.replace({
    path: '/redirect' + path,
    query
  })
}
```

刷新流程：
1. 从缓存列表中移除组件
2. 跳转到 redirect 页面
3. redirect 页面立即跳转回原页面
4. 由于缓存已被移除，组件会重新创建

## 调试技巧

在浏览器控制台查看当前缓存的组件：

```javascript
// 获取缓存列表
import { useKeepAliveStore } from '@/store/modules/keepAlive'
const store = useKeepAliveStore()
console.log(store.cachedViews)
```
