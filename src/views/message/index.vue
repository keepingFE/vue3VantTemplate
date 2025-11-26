<template>
  <div class="message-container">
    <van-nav-bar :title="$t('messages.title')" fixed placeholder />

    <div class="message-content">
      <!-- 固定区域：消息分类标签 + 操作按钮 -->
      <div class="sticky-header">
        <!-- 消息分类标签 -->
        <van-tabs v-model:active="activeTab" @change="onTabChange">
          <van-tab :title="$t('messages.all')" name="all" />
          <van-tab :title="$t('messages.unread')" name="unread">
            <template #title>
              {{ $t('messages.unread') }}
              <van-badge v-if="unreadCount > 0" :content="unreadCount" :max="99" class="unread-count-badge" />
            </template>
          </van-tab>
          <van-tab :title="$t('messages.system')" name="system" />
          <van-tab :title="$t('messages.notification')" name="notification" />
        </van-tabs>

        <!-- 操作按钮 -->
        <div v-if="messageList.length > 0" class="message-actions">
          <span class="action-btn" @click="markAllAsRead" :class="{ disabled: unreadCount === 0 }">
            {{ $t('messages.markAllAsRead') }}
          </span>
          <span class="action-divider">|</span>
          <span class="action-btn danger" @click="clearAllMessages">
            {{ $t('messages.deleteAll') }}
          </span>
        </div>
      </div>

      <!-- 下拉刷新 -->
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <!-- 上拉加载 -->
        <van-list v-model:loading="loading" :finished="finished" :finished-text="$t('common.noMore')" @load="onLoad">
          <van-cell-group inset>
            <van-swipe-cell v-for="item in messageList" :key="item.id">
              <van-cell :title="item.title" :label="item.content" :value="formatTime(item.time)" is-link
                @click="handleMessageClick(item)" :class="{ 'unread-message': !item.isRead }">
                <template #icon>
                  <van-badge v-if="!item.isRead" dot>
                    <van-icon :name="getMessageIcon(item.type)" class="message-icon" />
                  </van-badge>
                  <van-icon v-else :name="getMessageIcon(item.type)" class="message-icon" />
                </template>
                <template #label>
                  <div class="message-label">
                    <span class="message-type">{{ getMessageTypeText(item.type) }}</span>
                    <span class="message-content">{{ item.content }}</span>
                  </div>
                </template>
              </van-cell>
              <template #right>
                <van-button square type="primary" :text="$t('messages.markAsRead')" class="swipe-button"
                  @click="markAsRead(item)" v-if="!item.isRead" />
                <van-button square type="danger" :text="$t('messages.delete')" class="swipe-button"
                  @click="deleteMessage(item)" />
              </template>
            </van-swipe-cell>
          </van-cell-group>
        </van-list>
      </van-pull-refresh>

      <!-- 空状态 -->
      <van-empty v-if="!loading && messageList.length === 0" :description="$t('messages.noMessages')" image="search" />
    </div>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { showToast, showConfirmDialog } from 'vant'
  import { useI18n } from 'vue-i18n'

  const router = useRouter()
  const { t } = useI18n()

  // 当前激活的标签
  const activeTab = ref('all')

  // 消息列表
  const messageList = ref([])
  const allMessages = ref([])

  // 加载状态
  const loading = ref(false)
  const finished = ref(false)
  const refreshing = ref(false)

  // 分页参数
  const page = ref(1)
  const pageSize = 10

  // 未读消息数量
  const unreadCount = computed(() => {
    return allMessages.value.filter(msg => !msg.isRead).length
  })

  // 模拟消息数据
  const mockMessages = [
    {
      id: 1,
      type: 'system',
      title: '系统通知',
      content: '您的账户已成功登录，欢迎回来！',
      time: new Date().getTime() - 1000 * 60 * 5,
      isRead: false
    },
    {
      id: 2,
      type: 'notification',
      title: '新消息提醒',
      content: '您有一条新的评论待查看',
      time: new Date().getTime() - 1000 * 60 * 30,
      isRead: false
    },
    {
      id: 3,
      type: 'system',
      title: '版本更新',
      content: '系统已更新到最新版本 v2.0.0',
      time: new Date().getTime() - 1000 * 60 * 60 * 2,
      isRead: true
    },
    {
      id: 4,
      type: 'notification',
      title: '活动通知',
      content: '双十一活动即将开始，敬请期待！',
      time: new Date().getTime() - 1000 * 60 * 60 * 5,
      isRead: false
    },
    {
      id: 5,
      type: 'system',
      title: '安全提醒',
      content: '检测到您的账户在新设备登录',
      time: new Date().getTime() - 1000 * 60 * 60 * 24,
      isRead: true
    },
    {
      id: 6,
      type: 'notification',
      title: '订单通知',
      content: '您的订单已发货，请注意查收',
      time: new Date().getTime() - 1000 * 60 * 60 * 24 * 2,
      isRead: true
    },
    {
      id: 7,
      type: 'system',
      title: '维护通知',
      content: '系统将于今晚 22:00 进行维护',
      time: new Date().getTime() - 1000 * 60 * 60 * 24 * 3,
      isRead: false
    },
    {
      id: 8,
      type: 'notification',
      title: '好友申请',
      content: '用户 "张三" 请求添加您为好友',
      time: new Date().getTime() - 1000 * 60 * 60 * 24 * 5,
      isRead: true
    }
  ]

  // 初始化
  allMessages.value = [...mockMessages]

  // 获取消息图标
  const getMessageIcon = (type) => {
    const iconMap = {
      system: 'bell',
      notification: 'volume-o',
      announcement: 'bullhorn-o'
    }
    return iconMap[type] || 'chat-o'
  }

  // 获取消息类型文本
  const getMessageTypeText = (type) => {
    const typeMap = {
      system: t('messages.system'),
      notification: t('messages.notification'),
      announcement: t('messages.announcement')
    }
    return typeMap[type] || ''
  }

  // 格式化时间
  const formatTime = (timestamp) => {
    const now = new Date().getTime()
    const diff = now - timestamp
    const minute = 1000 * 60
    const hour = minute * 60
    const day = hour * 24

    if (diff < minute) {
      return '刚刚'
    } else if (diff < hour) {
      return `${Math.floor(diff / minute)}分钟前`
    } else if (diff < day) {
      return `${Math.floor(diff / hour)}小时前`
    } else if (diff < day * 7) {
      return `${Math.floor(diff / day)}天前`
    } else {
      const date = new Date(timestamp)
      return `${date.getMonth() + 1}-${date.getDate()}`
    }
  }

  // 过滤消息
  const filterMessages = () => {
    let filtered = [...allMessages.value]

    if (activeTab.value === 'unread') {
      filtered = filtered.filter(msg => !msg.isRead)
    } else if (activeTab.value !== 'all') {
      filtered = filtered.filter(msg => msg.type === activeTab.value)
    }

    return filtered
  }

  // 加载数据
  const onLoad = () => {
    setTimeout(() => {
      const filtered = filterMessages()
      const start = (page.value - 1) * pageSize
      const end = start + pageSize
      const newData = filtered.slice(start, end)

      if (newData.length > 0) {
        messageList.value = [...messageList.value, ...newData]
        page.value++
      }

      loading.value = false

      if (messageList.value.length >= filtered.length) {
        finished.value = true
      }
    }, 500)
  }

  // 下拉刷新
  const onRefresh = () => {
    setTimeout(() => {
      messageList.value = []
      page.value = 1
      finished.value = false
      loading.value = true
      refreshing.value = false
      onLoad()
      showToast(t('common.refreshSuccess'))
    }, 500)
  }

  // 切换标签
  const onTabChange = () => {
    messageList.value = []
    page.value = 1
    finished.value = false
    loading.value = true
    onLoad()
  }

  // 点击消息
  const handleMessageClick = (item) => {
    // 标记为已读
    if (!item.isRead) {
      item.isRead = true
    }

    // 跳转到详情页
    router.push({
      name: 'MessageDetail',
      params: { id: item.id }
    })
  }

  // 标记为已读
  const markAsRead = (item) => {
    item.isRead = true
    showToast(t('messages.markAsRead'))
  }

  // 删除消息
  const deleteMessage = (item) => {
    showConfirmDialog({
      title: t('common.tips'),
      message: t('common.deleteConfirm')
    })
      .then(() => {
        const index = allMessages.value.findIndex(msg => msg.id === item.id)
        if (index > -1) {
          allMessages.value.splice(index, 1)
        }

        const listIndex = messageList.value.findIndex(msg => msg.id === item.id)
        if (listIndex > -1) {
          messageList.value.splice(listIndex, 1)
        }

        showToast(t('common.deleteSuccess'))
      })
      .catch(() => {
        // 取消删除
      })
  }

  // 全部标记为已读
  const markAllAsRead = () => {
    allMessages.value.forEach(msg => {
      msg.isRead = true
    })
    messageList.value.forEach(msg => {
      msg.isRead = true
    })
    showToast(t('messages.markAllAsRead'))
  }

  // 清空所有消息
  const clearAllMessages = () => {
    showConfirmDialog({
      title: t('common.tips'),
      message: '确定要清空所有消息吗？'
    })
      .then(() => {
        allMessages.value = []
        messageList.value = []
        showToast(t('messages.deleteAll'))
      })
      .catch(() => {
        // 取消
      })
  }
</script>

<style lang="scss" scoped>
  .message-container {
    min-height: 100vh;
    background-color: var(--bg-color);

    .message-content {

      // 固定头部区域
      .sticky-header {
        position: sticky;
        top: 46px; // NavBar 的高度
        z-index: 99;
        background-color: var(--van-background-2);
      }

      .message-icon {
        margin-right: $spacing-sm;
        font-size: 20px;
        color: var(--van-primary-color);
      }

      .unread-message {
        background-color: rgba(25, 137, 250, 0.05);

        :deep(.van-cell__title) {
          font-weight: 600;
        }
      }

      .message-label {
        display: flex;
        flex-direction: column;
        gap: 4px;

        .message-type {
          font-size: 12px;
          color: var(--van-primary-color);
        }

        .message-content {
          font-size: 14px;
          color: var(--van-text-color-2);
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          line-clamp: 3;
          -webkit-box-orient: vertical;
          word-break: break-word;
          line-height: 1.4;
        }
      }

      .swipe-button {
        height: 100%;
      }

      :deep(.van-cell-group) {
        margin-top: $spacing-md;
      }

      :deep(.van-empty) {
        padding: 60px 0;
      }

      :deep(.van-tabs__nav) {
        background-color: var(--van-background-2);
      }

      // 确保 tab 标题不会裁剪徽章
      :deep(.van-tab__text) {
        overflow: visible;
      }

      :deep(.van-tabs__wrap) {
        overflow: visible;
      }

      .unread-count-badge {
        margin-left: 4px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        position: relative;
        top: -2px;
        vertical-align: middle;

        :deep(.van-badge__content) {
          position: static;
          transform: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 18px;
          height: 18px;
          padding: 0 5px;
          border-radius: 9px;
          font-size: 11px;
          line-height: 1;
          box-sizing: border-box;
          white-space: nowrap;
        }
      }

      .message-actions {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 8px;
        padding: 6px $spacing-md;
        background-color: var(--van-background-2);
        font-size: 14px;
        line-height: 1.2;
        min-height: 45px;

        .action-btn {
          color: var(--van-primary-color);
          cursor: pointer;
          user-select: none;
          transition: opacity 0.3s;
          padding: 4px 0;
          line-height: 1.5;

          &:active {
            opacity: 0.7;
          }

          &.disabled {
            color: var(--van-text-color-3);
            cursor: not-allowed;
            opacity: 0.5;
          }

          &.danger {
            color: var(--van-danger-color);
          }
        }

        .action-divider {
          color: var(--van-border-color);
        }
      }
    }
  }
</style>
