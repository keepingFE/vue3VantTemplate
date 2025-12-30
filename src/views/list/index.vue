<template>
  <div class="list-container">
    <van-nav-bar :title="$t('route.list')" fixed placeholder>
      <template #right>
        <van-icon name="replay" size="18" @click="handleRefreshPage" />
      </template>
    </van-nav-bar>

    <!-- 固定区域：Tab 和搜索栏 -->
    <div class="fixed-header">
      <!-- Tab 切换 -->
      <van-tabs v-model:active="activeTab" @change="onTabChange">
        <van-tab title="全部" name="all"></van-tab>
        <van-tab title="进行中" name="ongoing"></van-tab>
        <van-tab title="已完成" name="completed"></van-tab>
        <van-tab title="待处理" name="pending"></van-tab>
      </van-tabs>

      <!-- 搜索栏 -->
      <van-search v-model="searchValue" :placeholder="$t('common.search')" show-action @search="onSearch">
        <template #action>
          <div @click="onSearch">{{ $t('common.search') }}</div>
        </template>
      </van-search>
    </div>

    <div class="list-content">

      <!-- 下拉刷新 -->
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <!-- 上拉加载 -->
        <van-list v-model:loading="loading" :finished="finished" :finished-text="$t('common.noMore')" @load="onLoad">
          <van-cell-group inset>
            <van-cell v-for="item in list" :key="item.id" :title="item.title" :label="item.description"
              :value="item.status" is-link @click="handleItemClick(item)">
              <template #icon>
                <van-image v-if="item.image" :src="item.image" width="60" height="60" fit="cover" radius="4"
                  class="item-image" />
                <van-icon v-else :name="item.icon" class="item-icon" />
              </template>
            </van-cell>
          </van-cell-group>
        </van-list>
      </van-pull-refresh>

      <!-- 空状态 -->
      <van-empty v-if="!loading && list.length === 0" :description="$t('common.noData')" />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useI18n } from 'vue-i18n'
import { useKeepAlive } from '@/hooks/useKeepAlive'

defineOptions({
  name: 'List'
})

const router = useRouter()
const { t } = useI18n()
const { refreshPage } = useKeepAlive()

// Tab 激活状态
const activeTab = ref('all')

// 搜索值
const searchValue = ref('')

// 列表数据
const list = ref([])

// 加载状态
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)

// 分页参数
const page = ref(1)
const pageSize = 10

// 模拟数据
const mockData = [
  { id: 1, title: '列表项 1', description: '这是列表项 1 的详细描述', status: '进行中', icon: 'notes-o', image: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg' },
  { id: 2, title: '列表项 2', description: '这是列表项 2 的详细描述', status: '已完成', icon: 'completed', image: 'https://fastly.jsdelivr.net/npm/@vant/assets/apple-1.jpeg' },
  { id: 3, title: '列表项 3', description: '这是列表项 3 的详细描述', status: '待处理', icon: 'clock-o', image: 'https://fastly.jsdelivr.net/npm/@vant/assets/apple-2.jpeg' },
  { id: 4, title: '列表项 4', description: '这是列表项 4 的详细描述', status: '进行中', icon: 'notes-o', image: 'https://fastly.jsdelivr.net/npm/@vant/assets/apple-3.jpeg' },
  { id: 5, title: '列表项 5', description: '这是列表项 5 的详细描述', status: '已完成', icon: 'completed', image: 'https://fastly.jsdelivr.net/npm/@vant/assets/apple-4.jpeg' },
  { id: 6, title: '列表项 6', description: '这是列表项 6 的详细描述', status: '待处理', icon: 'clock-o', image: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg' },
  { id: 7, title: '列表项 7', description: '这是列表项 7 的详细描述', status: '进行中', icon: 'notes-o', image: 'https://fastly.jsdelivr.net/npm/@vant/assets/apple-1.jpeg' },
  { id: 8, title: '列表项 8', description: '这是列表项 8 的详细描述', status: '已完成', icon: 'completed', image: 'https://fastly.jsdelivr.net/npm/@vant/assets/apple-2.jpeg' },
  { id: 9, title: '列表项 9', description: '这是列表项 9 的详细描述', status: '待处理', icon: 'clock-o', image: 'https://fastly.jsdelivr.net/npm/@vant/assets/apple-3.jpeg' },
  { id: 10, title: '列表项 10', description: '这是列表项 10 的详细描述', status: '进行中', icon: 'notes-o', image: 'https://fastly.jsdelivr.net/npm/@vant/assets/apple-4.jpeg' },
  { id: 11, title: '列表项 11', description: '这是列表项 11 的详细描述', status: '已完成', icon: 'completed', image: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg' },
  { id: 12, title: '列表项 12', description: '这是列表项 12 的详细描述', status: '待处理', icon: 'clock-o', image: 'https://fastly.jsdelivr.net/npm/@vant/assets/apple-1.jpeg' },
  { id: 13, title: '列表项 13', description: '这是列表项 13 的详细描述', status: '进行中', icon: 'notes-o', image: 'https://fastly.jsdelivr.net/npm/@vant/assets/apple-2.jpeg' },
  { id: 14, title: '列表项 14', description: '这是列表项 14 的详细描述', status: '已完成', icon: 'completed', image: 'https://fastly.jsdelivr.net/npm/@vant/assets/apple-3.jpeg' },
  { id: 15, title: '列表项 15', description: '这是列表项 15 的详细描述', status: '待处理', icon: 'clock-o', image: 'https://fastly.jsdelivr.net/npm/@vant/assets/apple-4.jpeg' }
]

// 监听搜索框变化，当清空时重新加载列表
watch(searchValue, (newValue, oldValue) => {
  // 当搜索框从有内容变为空时，重新加载列表
  if (oldValue && !newValue.trim()) {
    list.value = []
    page.value = 1
    finished.value = false
    loading.value = true
    onLoad()
  }
})

// 获取过滤后的数据
const getFilteredData = () => {
  if (activeTab.value === 'all') {
    return mockData
  }
  const statusMap = {
    ongoing: '进行中',
    completed: '已完成',
    pending: '待处理'
  }
  return mockData.filter(item => item.status === statusMap[activeTab.value])
}

// Tab 切换
const onTabChange = () => {
  list.value = []
  page.value = 1
  finished.value = false
  loading.value = true
  onLoad()
}

// 加载数据
const onLoad = () => {
  setTimeout(() => {
    const filteredData = getFilteredData()
    const start = (page.value - 1) * pageSize
    const end = start + pageSize
    const newData = filteredData.slice(start, end)

    if (newData.length > 0) {
      list.value = [...list.value, ...newData]
      page.value++
    }

    loading.value = false

    if (list.value.length >= filteredData.length) {
      finished.value = true
    }
  }, 500)
}

// 下拉刷新
const onRefresh = () => {
  setTimeout(() => {
    list.value = []
    page.value = 1
    finished.value = false
    loading.value = true
    refreshing.value = false
    onLoad()
    showToast(t('common.refreshSuccess'))
  }, 500)
}

// 搜索
const onSearch = () => {
  if (searchValue.value.trim()) {
    const filteredData = getFilteredData()
    const filtered = filteredData.filter(
      (item) =>
        item.title.includes(searchValue.value) ||
        item.description.includes(searchValue.value)
    )
    list.value = filtered
    finished.value = true
    showToast(`找到 ${filtered.length} 条结果`)
  } else {
    list.value = []
    page.value = 1
    finished.value = false
    onLoad()
  }
}

// 点击列表项
const handleItemClick = (item) => {
  router.push({
    name: 'ListDetail',
    params: { id: item.id }
  })
}

// 刷新页面（清除缓存重新加载）
const handleRefreshPage = () => {
  refreshPage()
}

// 页面激活时的处理（从缓存恢复时触发）
onActivated(() => {
  console.log('List 页面从缓存激活')
  // 可以在这里处理需要刷新的数据
})
</script>

<style lang="scss" scoped>
.list-container {
  min-height: 100vh;
  background-color: var(--bg-color);

  .fixed-header {
    position: sticky;
    top: 46px; // 导航栏高度
    z-index: 99;
    background-color: var(--bg-color);
  }

  .list-content {
    padding-bottom: 60px;

    .item-icon {
      margin-right: $spacing-sm;
      font-size: 20px;
    }

    .item-image {
      margin-right: $spacing-sm;
      border-radius: 4px;
    }

    :deep(.van-cell-group) {
      margin-top: $spacing-md;
    }

    :deep(.van-empty) {
      padding: 60px 0;
    }
  }
}
</style>
