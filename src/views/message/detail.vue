<template>
  <div class="message-detail-container">
    <van-nav-bar :title="$t('messages.messageDetail')" left-arrow fixed placeholder @click-left="onClickLeft" />

    <div v-if="message" class="message-detail-content">
      <!-- 消息头部 -->
      <div class="message-header">
        <div class="message-icon-wrapper">
          <van-icon :name="getMessageIcon(message.type)" size="40" color="#1989fa" />
        </div>
        <h2 class="message-title">{{ message.title }}</h2>
        <div class="message-meta">
          <van-tag :type="getMessageTypeColor(message.type)">
            {{ getMessageTypeText(message.type) }}
          </van-tag>
          <span class="message-time">{{ formatFullTime(message.time) }}</span>
        </div>
      </div>

      <!-- 消息内容 -->
      <div class="message-body">
        <van-cell-group inset>
          <van-cell :title="$t('messages.sender')" :value="message.sender || '系统'" />
          <van-cell :title="$t('messages.time')" :value="formatFullTime(message.time)" />
          <van-cell :title="$t('common.status')">
            <template #value>
              <van-tag :type="message.isRead ? 'success' : 'warning'">
                {{ message.isRead ? $t('messages.read') : $t('messages.unread') }}
              </van-tag>
            </template>
          </van-cell>
        </van-cell-group>

        <van-cell-group inset class="content-group">
          <van-cell :title="$t('messages.content')" />
          <div class="message-content">
            <p>{{ message.content }}</p>
            <div v-if="message.detail" class="message-detail">
              <p>{{ message.detail }}</p>
            </div>
          </div>
        </van-cell-group>

        <!-- 附加信息 -->
        <van-cell-group v-if="message.attachments && message.attachments.length > 0" inset>
          <van-cell title="附件" />
          <div class="attachments">
            <van-tag v-for="(attachment, index) in message.attachments" :key="index" type="primary" plain size="large"
              class="attachment-item">
              <van-icon name="description" />
              {{ attachment }}
            </van-tag>
          </div>
        </van-cell-group>
      </div>

      <!-- 操作按钮 -->
      <div class="message-actions">
        <van-button size="small" v-if="!message.isRead" type="primary" block @click="markAsRead">
          {{ $t('messages.markAsRead') }}
        </van-button>
        <van-button size="small" type="danger" block plain @click="deleteMessage">
          {{ $t('messages.delete') }}
        </van-button>
      </div>
    </div>

    <!-- 加载状态 -->
    <van-loading v-else type="spinner" size="24px" vertical class="loading-wrapper">
      {{ $t('common.loading') }}
    </van-loading>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()

const message = ref(null)

// 模拟消息数据
const mockMessages = {
  1: {
    id: 1,
    type: 'system',
    title: '系统通知',
    content: '您的账户已成功登录，欢迎回来！',
    detail: '登录时间：2025-11-25 10:30:00\n登录地点：中国 广东省 深圳市\n登录设备：Windows PC\nIP地址：192.168.1.100',
    time: new Date().getTime() - 1000 * 60 * 5,
    isRead: false,
    sender: '系统管理员'
  },
  2: {
    id: 2,
    type: 'notification',
    title: '新消息提醒',
    content: '您有一条新的评论待查看',
    detail: '用户"李四"在您的文章"Vue3 开发实践"下发表了评论：\n\n"这篇文章写得很好，学到了很多知识，感谢分享！"',
    time: new Date().getTime() - 1000 * 60 * 30,
    isRead: false,
    sender: '消息中心'
  },
  3: {
    id: 3,
    type: 'system',
    title: '版本更新',
    content: '系统已更新到最新版本 v2.0.0',
    detail: '更新内容：\n1. 优化了用户界面设计\n2. 修复了已知的bug\n3. 提升了系统性能\n4. 新增了消息中心功能\n5. 支持主题切换',
    time: new Date().getTime() - 1000 * 60 * 60 * 2,
    isRead: true,
    sender: '系统管理员',
    attachments: ['更新日志.pdf', '使用指南.pdf']
  },
  4: {
    id: 4,
    type: 'notification',
    title: '活动通知',
    content: '双十一活动即将开始，敬请期待！',
    detail: '活动时间：2025年11月11日 00:00 - 23:59\n活动内容：全场商品5折起\n参与方式：登录即可参与\n注意事项：活动期间订单较多，请耐心等待',
    time: new Date().getTime() - 1000 * 60 * 60 * 5,
    isRead: false,
    sender: '运营团队'
  },
  5: {
    id: 5,
    type: 'system',
    title: '安全提醒',
    content: '检测到您的账户在新设备登录',
    detail: '如果这不是您本人的操作，请立即修改密码并联系客服。\n\n登录信息：\n设备：iPhone 13 Pro\n地点：中国 北京市\n时间：2025-11-24 18:30:00',
    time: new Date().getTime() - 1000 * 60 * 60 * 24,
    isRead: true,
    sender: '安全中心'
  },
  6: {
    id: 6,
    type: 'notification',
    title: '订单通知',
    content: '您的订单已发货，请注意查收',
    detail: '订单号：202511240001\n物流公司：顺丰速运\n运单号：SF1234567890\n预计送达时间：2025-11-26',
    time: new Date().getTime() - 1000 * 60 * 60 * 24 * 2,
    isRead: true,
    sender: '订单中心'
  },
  7: {
    id: 7,
    type: 'system',
    title: '维护通知',
    content: '系统将于今晚 22:00 进行维护',
    detail: '维护时间：2025-11-25 22:00 - 23:00\n维护内容：数据库优化、服务器升级\n影响范围：维护期间系统将暂停服务\n温馨提示：请提前保存您的工作',
    time: new Date().getTime() - 1000 * 60 * 60 * 24 * 3,
    isRead: false,
    sender: '技术团队'
  },
  8: {
    id: 8,
    type: 'notification',
    title: '好友申请',
    content: '用户 "张三" 请求添加您为好友',
    detail: '用户信息：\n昵称：张三\n地区：广东省 深圳市\n共同好友：5人\n\n附加消息：你好，我们是同行，希望能成为好友！',
    time: new Date().getTime() - 1000 * 60 * 60 * 24 * 5,
    isRead: true,
    sender: '好友系统'
  }
}

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

// 获取消息类型颜色
const getMessageTypeColor = (type) => {
  const colorMap = {
    system: 'primary',
    notification: 'success',
    announcement: 'warning'
  }
  return colorMap[type] || 'default'
}

// 格式化完整时间
const formatFullTime = (timestamp) => {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 返回上一页
const onClickLeft = () => {
  router.back()
}

// 标记为已读
const markAsRead = () => {
  message.value.isRead = true
  showToast(t('messages.markAsRead'))
}

// 删除消息
const deleteMessage = () => {
  showConfirmDialog({
    title: t('common.tips'),
    message: t('common.deleteConfirm')
  })
    .then(() => {
      showToast(t('common.deleteSuccess'))
      setTimeout(() => {
        router.back()
      }, 500)
    })
    .catch(() => {
      // 取消删除
    })
}

// 加载消息详情
onMounted(() => {
  const id = parseInt(route.params.id)
  setTimeout(() => {
    message.value = mockMessages[id] || null
    if (!message.value) {
      showToast('消息不存在')
      router.back()
    }
  }, 300)
})
</script>

<style lang="scss" scoped>
.message-detail-container {
  min-height: 100vh;
  background-color: var(--bg-color);

  .message-detail-content {
    padding-bottom: 80px;

    .message-header {
      text-align: center;
      padding: $spacing-lg;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;

      .message-icon-wrapper {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 80px;
        height: 80px;
        background-color: rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        margin-bottom: $spacing-md;
      }

      .message-title {
        font-size: 20px;
        font-weight: 600;
        margin: $spacing-md 0;
      }

      .message-meta {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: $spacing-md;
        font-size: 14px;
        opacity: 0.9;

        .message-time {
          color: rgba(255, 255, 255, 0.8);
        }
      }
    }

    .message-body {
      padding: $spacing-md;

      :deep(.van-cell-group) {
        margin-bottom: $spacing-md;
      }

      .content-group {
        .message-content {
          padding: $spacing-md;
          line-height: 1.6;
          color: var(--van-text-color);

          p {
            margin: 0 0 $spacing-md 0;
            white-space: pre-wrap;
            word-break: break-word;
          }

          .message-detail {
            margin-top: $spacing-md;
            padding: $spacing-md;
            background-color: var(--van-background-2);
            border-radius: 8px;
            font-size: 14px;
            color: var(--van-text-color-2);

            p {
              margin: 0;
            }
          }
        }
      }

      .attachments {
        padding: $spacing-md;
        display: flex;
        flex-direction: column;
        gap: $spacing-sm;

        .attachment-item {
          display: flex;
          align-items: center;
          gap: $spacing-xs;
          padding: $spacing-sm $spacing-md;
        }
      }
    }

    .message-actions {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      padding: $spacing-md;
      background-color: var(--van-background-2);
      border-top: 1px solid var(--van-border-color);
      display: flex;
      flex-direction: column;
      gap: $spacing-sm;
      z-index: 999;
    }
  }

  .loading-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
  }
}
</style>
