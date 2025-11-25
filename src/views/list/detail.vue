<template>
  <div class="detail-container">
    <van-nav-bar
      :title="$t('common.detail')"
      left-arrow
      fixed
      placeholder
      @click-left="onClickLeft"
    />

    <div class="detail-content">
      <!-- 加载状态 -->
      <van-loading v-if="loading" class="loading-wrapper" vertical>
        {{ $t('common.loading') }}
      </van-loading>

      <!-- 详情内容 -->
      <template v-else-if="detail">
        <!-- 头部信息 -->
        <div class="detail-header">
          <van-icon :name="detail.icon" class="detail-icon" />
          <h2 class="detail-title">{{ detail.title }}</h2>
          <van-tag :type="getStatusType(detail.status)" size="medium">
            {{ detail.status }}
          </van-tag>
        </div>

        <!-- 基本信息 -->
        <van-cell-group inset :title="$t('common.basicInfo')">
          <van-cell title="ID" :value="detail.id" />
          <van-cell :title="$t('common.status')" :value="detail.status" />
          <van-cell :title="$t('common.createTime')" :value="detail.createTime" />
          <van-cell :title="$t('common.updateTime')" :value="detail.updateTime" />
        </van-cell-group>

        <!-- 详细描述 -->
        <van-cell-group inset :title="$t('common.description')">
          <div class="description-content">
            <p>{{ detail.description }}</p>
            <p class="detail-text">{{ detail.detailContent }}</p>
          </div>
        </van-cell-group>

        <!-- 附加信息 -->
        <van-cell-group inset :title="$t('common.additionalInfo')">
          <van-cell :title="$t('common.category')" :value="detail.category" />
          <van-cell :title="$t('common.priority')" :value="detail.priority" />
          <van-cell :title="$t('common.assignee')" :value="detail.assignee" />
        </van-cell-group>

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <van-button type="primary" block @click="handleEdit">
            {{ $t('common.edit') }}
          </van-button>
          <van-button type="danger" block plain @click="handleDelete">
            {{ $t('common.delete') }}
          </van-button>
        </div>
      </template>

      <!-- 空状态 -->
      <van-empty v-else :description="$t('common.noData')" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

// 详情数据
const detail = ref(null)
const loading = ref(true)

// 模拟详情数据
const mockDetails = {
  1: {
    id: 1,
    title: '列表项 1',
    description: '这是列表项 1 的详细描述',
    status: '进行中',
    icon: 'notes-o',
    createTime: '2025-11-20 10:30:00',
    updateTime: '2025-11-25 09:00:00',
    category: '工作任务',
    priority: '高',
    assignee: '张三',
    detailContent: '这是一个详细的内容描述。这个任务需要在本周内完成，包括需求分析、设计方案、开发实现和测试验证等多个环节。请确保按时完成各个里程碑节点。'
  },
  2: {
    id: 2,
    title: '列表项 2',
    description: '这是列表项 2 的详细描述',
    status: '已完成',
    icon: 'completed',
    createTime: '2025-11-18 14:20:00',
    updateTime: '2025-11-24 16:30:00',
    category: '项目管理',
    priority: '中',
    assignee: '李四',
    detailContent: '该项目已经顺利完成所有阶段的工作，包括前期调研、方案设计、开发实施、测试验收等环节。项目成果已经交付客户并获得好评。'
  },
  3: {
    id: 3,
    title: '列表项 3',
    description: '这是列表项 3 的详细描述',
    status: '待处理',
    icon: 'clock-o',
    createTime: '2025-11-25 08:00:00',
    updateTime: '2025-11-25 08:00:00',
    category: '日常事务',
    priority: '低',
    assignee: '王五',
    detailContent: '这是一个新创建的任务，等待相关人员进行处理。任务内容包括文档整理、资料归档等日常性工作。'
  }
}

// 根据状态获取标签类型
const getStatusType = (status) => {
  const statusMap = {
    '进行中': 'primary',
    '已完成': 'success',
    '待处理': 'warning'
  }
  return statusMap[status] || 'default'
}

// 加载详情数据
const loadDetail = () => {
  loading.value = true
  const id = route.params.id

  // 模拟异步加载
  setTimeout(() => {
    // 如果 mockDetails 中没有对应 id，则生成默认数据
    if (mockDetails[id]) {
      detail.value = mockDetails[id]
    } else {
      detail.value = {
        id: parseInt(id),
        title: `列表项 ${id}`,
        description: `这是列表项 ${id} 的详细描述`,
        status: ['进行中', '已完成', '待处理'][id % 3],
        icon: ['notes-o', 'completed', 'clock-o'][id % 3],
        createTime: '2025-11-25 09:00:00',
        updateTime: '2025-11-25 09:00:00',
        category: '默认分类',
        priority: '中',
        assignee: '未分配',
        detailContent: `这是列表项 ${id} 的详细内容描述。包含了该项目的完整信息和相关说明。`
      }
    }
    loading.value = false
  }, 500)
}

// 返回上一页
const onClickLeft = () => {
  router.back()
}

// 编辑
const handleEdit = () => {
  showToast(t('common.editSuccess'))
}

// 删除
const handleDelete = () => {
  showConfirmDialog({
    title: t('common.tips'),
    message: t('common.deleteConfirm')
  })
    .then(() => {
      showToast(t('common.deleteSuccess'))
      setTimeout(() => {
        router.back()
      }, 1000)
    })
    .catch(() => {
      // 取消删除
    })
}

// 组件挂载时加载数据
onMounted(() => {
  loadDetail()
})
</script>

<style lang="scss" scoped>
.detail-container {
  min-height: 100vh;
  background-color: var(--bg-color);
  padding-bottom: $spacing-lg;

  .detail-content {
    .loading-wrapper {
      padding: 100px 0;
      text-align: center;
    }

    .detail-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: $spacing-xl $spacing-lg;
      text-align: center;
      color: #fff;
      margin-bottom: $spacing-lg;

      .detail-icon {
        font-size: 48px;
        margin-bottom: $spacing-md;
      }

      .detail-title {
        font-size: 24px;
        font-weight: 600;
        margin: $spacing-md 0;
      }

      :deep(.van-tag) {
        margin-top: $spacing-sm;
      }
    }

    :deep(.van-cell-group) {
      margin-bottom: $spacing-lg;
    }

    .description-content {
      padding: $spacing-md $spacing-lg;
      line-height: 1.6;
      color: var(--van-text-color);

      p {
        margin-bottom: $spacing-md;
      }

      .detail-text {
        color: var(--van-text-color-2);
        font-size: 14px;
      }
    }

    .action-buttons {
      padding: $spacing-lg;

      .van-button {
        margin-bottom: $spacing-md;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }
}
</style>
