<template>
  <div class="detail-container">
    <van-nav-bar :title="$t('common.detail')" left-arrow fixed placeholder @click-left="onClickLeft" />

    <div class="detail-content">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <!-- 头部骨架屏 -->
        <div class="skeleton-header">
          <van-skeleton avatar :avatar-size="48" title :row="1" />
        </div>

        <!-- 内容骨架屏 -->
        <van-cell-group inset>
          <van-skeleton title :row="3" />
        </van-cell-group>

        <van-cell-group inset>
          <van-skeleton title :row="2" />
        </van-cell-group>

        <van-cell-group inset>
          <van-skeleton title :row="4" />
        </van-cell-group>

        <van-cell-group inset>
          <van-skeleton title :row="3" />
        </van-cell-group>

        <!-- 按钮骨架屏 -->
        <div class="skeleton-buttons">
          <van-skeleton round />
          <van-skeleton round />
        </div>
      </div>

      <!-- 详情内容 -->
      <template v-else-if="detail">
        <!-- 头部信息 -->
        <div class="detail-header">
          <van-icon :name="detail.icon" class="detail-icon" />
          <h2 class="detail-title">{{ detail.title }}</h2>
          <van-tag :type="getStatusType(detail.status)" size="medium" class="status-tag">
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
            <div class="markdown-section">
              <markdown-renderer :content="detail.detailContent" />
            </div>
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
          <van-button type="primary" block @click="handleEdit" class="edit-button">
            <template #icon>
              <van-icon name="edit" />
            </template>
            {{ $t('common.edit') }}
          </van-button>
          <van-button type="danger" block plain @click="handleDelete" class="delete-button">
            <template #icon>
              <van-icon name="delete-o" />
            </template>
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
  import MarkdownRenderer from '@/components/common/MarkdownRenderer.vue'

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
      detailContent: `# 项目任务详情

## 任务概述
这是一个**重要**的项目任务，需要在本周内完成。任务包含以下几个主要部分：

1. 需求分析
2. 设计方案
3. 开发实现
4. 测试验证

## 技术要求
- 前端使用 Vue3 + Vant4
- 后端采用 Node.js + Express
- 数据库使用 MongoDB

## 代码示例
\`\`\`javascript
// 示例代码
function formatDate(date) {
  return new Date(date).toLocaleDateString();
}
\`\`\`

## 注意事项
> 请确保按时完成各个里程碑节点，如有问题及时沟通。

**截止日期**: 2025-11-30`
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
      detailContent: `# 项目完成报告

## 项目概述
该项目已经**顺利完成**所有阶段的工作，包括前期调研、方案设计、开发实施、测试验收等环节。

## 完成情况
| 阶段 | 完成度 | 负责人 | 完成时间 |
|------|--------|--------|----------|
| 需求分析 | 100% | 张三 | 2025-11-20 |
| 方案设计 | 100% | 李四 | 2025-11-22 |
| 开发实施 | 100% | 王五 | 2025-11-23 |
| 测试验收 | 100% | 赵六 | 2025-11-24 |

## 项目成果
- [x] 完成系统架构设计
- [x] 实现核心功能模块
- [x] 通过所有测试用例
- [x] 部署到生产环境

## 客户反馈
> 项目成果已经交付客户并获得好评，客户表示非常满意。

**项目评价**: ⭐⭐⭐⭐⭐`
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
      detailContent: `# 日常任务清单

## 任务描述
这是一个新创建的任务，等待相关人员进行处理。任务内容包括文档整理、资料归档等日常性工作。

## 任务列表
- [ ] 整理项目文档
- [ ] 归档相关资料
- [ ] 更新项目进度表
- [ ] 准备下周工作计划

## 参考资料
1. [项目管理指南](https://example.com)
2. [文档规范标准](https://example.com)

## 联系方式
如有问题，请联系：
- 邮箱：admin@example.com
- 电话：123-456-7890

---
*创建时间：2025-11-25*`
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

    // 响应式布局
    @media (max-width: 768px) {
      .detail-content {
        .detail-header {
          padding: $spacing-lg $spacing-md;

          .detail-icon {
            font-size: 40px;
          }

          .detail-title {
            font-size: 20px;
          }
        }

        :deep(.van-cell-group) {
          margin: 0 $spacing-sm $spacing-lg;

          .van-cell {
            padding: $spacing-sm $spacing-md;
            font-size: $font-size-sm;
          }
        }

        .description-content {
          margin: $spacing-sm;
          padding: $spacing-md;

          .markdown-section {
            padding: $spacing-sm;
            font-size: $font-size-sm;
            line-height: 1.6;
          }
        }

        .action-buttons {
          padding: $spacing-md;
          gap: $spacing-sm;

          .van-button {
            height: 44px;
            font-size: $font-size-sm;
          }
        }
      }
    }

    // 大屏幕优化
    @media (min-width: 1200px) {
      max-width: 800px;
      margin: 0 auto;
      box-shadow: $box-shadow-lg;
      border-radius: $border-radius-xl;
      overflow: hidden;
    }

    .detail-content {
      .loading-container {
        padding: $spacing-lg 0;

        .skeleton-header {
          background: linear-gradient(135deg, var(--theme-color) 0%, var(--theme-color-lighter) 100%);
          padding: $spacing-xl $spacing-lg;
          margin-bottom: $spacing-lg;
          border-radius: $border-radius-lg;

          :deep(.van-skeleton) {
            --van-skeleton-avatar-background: rgba(255, 255, 255, 0.3);
            --van-skeleton-paragraph-background: rgba(255, 255, 255, 0.3);
          }
        }

        .skeleton-buttons {
          padding: $spacing-lg;
          display: flex;
          flex-direction: column;
          gap: $spacing-md;

          :deep(.van-skeleton) {
            height: 50px;
            border-radius: $border-radius-lg;
          }
        }
      }

      .detail-header {
        background: linear-gradient(135deg, var(--theme-color) 0%, var(--theme-color-lighter) 100%);
        padding: $spacing-xl $spacing-lg;
        text-align: center;
        color: #fff;
        margin-bottom: $spacing-lg;
        position: relative;
        overflow: hidden;

        // 添加装饰性背景元素
        &::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -10%;
          width: 200px;
          height: 200px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
        }

        &::after {
          content: '';
          position: absolute;
          bottom: -30%;
          left: -5%;
          width: 150px;
          height: 150px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 50%;
        }

        .detail-icon {
          font-size: 48px;
          margin-bottom: $spacing-md;
          position: relative;
          z-index: 1;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
        }

        .detail-title {
          font-size: 24px;
          font-weight: 600;
          margin: $spacing-md 0;
          position: relative;
          z-index: 1;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }

        :deep(.van-tag) {
          margin-top: $spacing-sm;
          position: relative;
          z-index: 1;
          font-weight: 500;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;

          &.status-tag {
            animation: pulse 2s infinite;
            padding: 6px 12px;
            font-size: 14px;

            &:hover {
              transform: scale(1.05);
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
            }

            &--primary {
              background-color: var(--theme-color);
              border-color: var(--theme-color);
            }

            &--success {
              background-color: var(--success-color);
              border-color: var(--success-color);
            }

            &--warning {
              background-color: var(--warning-color);
              border-color: var(--warning-color);
            }
          }
        }

        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4);
          }

          70% {
            box-shadow: 0 0 0 10px rgba(255, 255, 255, 0);
          }

          100% {
            box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
          }
        }
      }

      :deep(.van-cell-group) {
        margin-bottom: $spacing-lg;
        border-radius: $border-radius-lg;
        overflow: hidden;
        box-shadow: $box-shadow-sm;
        transition: all 0.3s ease;

        &:hover {
          box-shadow: $box-shadow-md;
          transform: translateY(-2px);
        }

        .van-cell-group__title {
          padding: $spacing-md $spacing-lg;
          background-color: var(--bg-color);
          font-weight: 600;
          color: var(--text-primary);
          border-bottom: 1px solid var(--border-color);
        }

        .van-cell {
          padding: $spacing-md $spacing-lg;
          transition: background-color 0.2s ease;

          &:hover {
            background-color: var(--theme-color-lighter);
          }

          &:not(:last-child)::after {
            left: $spacing-lg;
            right: $spacing-lg;
            border-color: var(--border-color);
          }
        }
      }

      .description-content {
        padding: $spacing-lg;
        line-height: 1.6;
        color: var(--text-primary);
        background-color: var(--bg-white);
        border-radius: $border-radius-lg;
        box-shadow: $box-shadow-sm;
        margin: $spacing-md $spacing-lg;
        transition: all 0.3s ease;

        &:hover {
          box-shadow: $box-shadow-md;
          transform: translateY(-2px);
        }

        p {
          margin-bottom: $spacing-md;
          text-align: justify;
        }

        .detail-text {
          color: var(--text-regular);
          font-size: $font-size-base;
          line-height: 1.8;
          padding: $spacing-md;
          background-color: var(--bg-color);
          border-radius: $border-radius-md;
          border-left: 3px solid var(--theme-color);
        }
      }

      .action-buttons {
        padding: $spacing-lg;
        display: flex;
        flex-direction: column;
        gap: $spacing-md;

        .van-button {
          height: 50px;
          border-radius: $border-radius-lg;
          font-weight: 500;
          font-size: $font-size-md;
          transition: all 0.3s ease;
          box-shadow: $box-shadow-sm;

          &:hover {
            transform: translateY(-2px);
            box-shadow: $box-shadow-md;
          }

          &:active {
            transform: translateY(0);
            box-shadow: $box-shadow-sm;
          }

          &.edit-button {
            background: linear-gradient(135deg, var(--theme-color) 0%, var(--theme-color-light) 100%);
            border: none;

            &:hover {
              background: linear-gradient(135deg, var(--theme-color-light) 0%, var(--theme-color) 100%);
            }
          }

          &.delete-button {
            border-color: var(--danger-color);
            color: var(--danger-color);

            &:hover {
              background-color: var(--danger-color);
              color: white;
            }
          }

          .van-icon {
            margin-right: $spacing-sm;
            font-size: 18px;
          }
        }
      }
    }
  }
</style>
