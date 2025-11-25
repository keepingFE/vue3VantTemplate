<template>
  <div class="list-container">
    <van-nav-bar :title="$t('route.list')" fixed placeholder />

    <div class="list-content">
      <!-- 搜索栏 -->
      <van-search
        v-model="searchValue"
        :placeholder="$t('common.search')"
        show-action
        @search="onSearch"
      >
        <template #action>
          <div @click="onSearch">{{ $t('common.search') }}</div>
        </template>
      </van-search>

      <!-- 下拉刷新 -->
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <!-- 上拉加载 -->
        <van-list
          v-model:loading="loading"
          :finished="finished"
          :finished-text="$t('common.noMore')"
          @load="onLoad"
        >
          <van-cell-group inset>
            <van-cell
              v-for="item in list"
              :key="item.id"
              :title="item.title"
              :label="item.description"
              :value="item.status"
              is-link
              @click="handleItemClick(item)"
            >
              <template #icon>
                <van-icon :name="item.icon" class="item-icon" />
              </template>
            </van-cell>
          </van-cell-group>
        </van-list>
      </van-pull-refresh>

      <!-- 空状态 -->
      <van-empty
        v-if="!loading && list.length === 0"
        :description="$t('common.noData')"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { t } = useI18n()

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
  { id: 1, title: '列表项 1', description: '这是列表项 1 的详细描述', status: '进行中', icon: 'notes-o' },
  { id: 2, title: '列表项 2', description: '这是列表项 2 的详细描述', status: '已完成', icon: 'completed' },
  { id: 3, title: '列表项 3', description: '这是列表项 3 的详细描述', status: '待处理', icon: 'clock-o' },
  { id: 4, title: '列表项 4', description: '这是列表项 4 的详细描述', status: '进行中', icon: 'notes-o' },
  { id: 5, title: '列表项 5', description: '这是列表项 5 的详细描述', status: '已完成', icon: 'completed' },
  { id: 6, title: '列表项 6', description: '这是列表项 6 的详细描述', status: '待处理', icon: 'clock-o' },
  { id: 7, title: '列表项 7', description: '这是列表项 7 的详细描述', status: '进行中', icon: 'notes-o' },
  { id: 8, title: '列表项 8', description: '这是列表项 8 的详细描述', status: '已完成', icon: 'completed' },
  { id: 9, title: '列表项 9', description: '这是列表项 9 的详细描述', status: '待处理', icon: 'clock-o' },
  { id: 10, title: '列表项 10', description: '这是列表项 10 的详细描述', status: '进行中', icon: 'notes-o' },
  { id: 11, title: '列表项 11', description: '这是列表项 11 的详细描述', status: '已完成', icon: 'completed' },
  { id: 12, title: '列表项 12', description: '这是列表项 12 的详细描述', status: '待处理', icon: 'clock-o' },
  { id: 13, title: '列表项 13', description: '这是列表项 13 的详细描述', status: '进行中', icon: 'notes-o' },
  { id: 14, title: '列表项 14', description: '这是列表项 14 的详细描述', status: '已完成', icon: 'completed' },
  { id: 15, title: '列表项 15', description: '这是列表项 15 的详细描述', status: '待处理', icon: 'clock-o' }
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

// 加载数据
const onLoad = () => {
  setTimeout(() => {
    const start = (page.value - 1) * pageSize
    const end = start + pageSize
    const newData = mockData.slice(start, end)

    if (newData.length > 0) {
      list.value = [...list.value, ...newData]
      page.value++
    }

    loading.value = false

    if (list.value.length >= mockData.length) {
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
    const filtered = mockData.filter(
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
</script>

<style lang="scss" scoped>
.list-container {
  min-height: 100vh;
  background-color: var(--bg-color);

  .list-content {
    padding-bottom: 60px;

    .item-icon {
      margin-right: $spacing-sm;
      font-size: 20px;
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
