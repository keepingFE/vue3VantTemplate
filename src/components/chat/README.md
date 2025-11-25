# Chat Component

一个功能完整的聊天组件，基于 ChatUI 的设计理念，支持多种消息类型、实时输入、消息滚动等功能。

## 功能特性

- ✅ 支持多种消息类型（用户、机器人/助手、系统消息）
- ✅ 实时消息滚动到最新位置
- ✅ 支持加载状态和发送状态（带打字气泡动画）
- ✅ 支持文字打字机效果（逐字显示）
- ✅ 响应式设计，适配各种屏幕
- ✅ 键盘快捷发送（Ctrl/Cmd + Enter）
- ✅ 消息长度验证
- ✅ 支持自定义头部
- ✅ 消息时间戳显示
- ✅ 用户头像显示

## 基础用法

```vue
<template>
  <Chat
    title="对话"
    :messages="messages"
    @send-message="handleSendMessage"
  />
</template>

<script setup>
import { ref } from 'vue'
import Chat from '@/components/chat/Chat.vue'

const messages = ref([
  {
    type: 'bot',
    content: '你好！请问有什么我可以帮助你的吗？',
    time: new Date()
  }
])

const handleSendMessage = (message) => {
  // 添加用户消息
  messages.value.push({
    type: 'user',
    content: message,
    time: new Date()
  })

  // 发送到服务器或处理逻辑
  // ...

  // 模拟 AI 响应
  setTimeout(() => {
    messages.value.push({
      type: 'bot',
      content: '这是一个示例响应',
      time: new Date()
    })
  }, 1000)
}
</script>
```

## Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `title` | 聊天窗口标题 | String | '对话' |
| `messages` | 消息数组 | Array | [] |
| `isLoading` | 是否正在加载回复（显示打字气泡） | Boolean | false |
| `isSending` | 是否正在发送消息 | Boolean | false |
| `placeholder` | 输入框占位符 | String | '输入消息...' |
| `maxLength` | 消息最大长度 | Number | 500 |
| `typingSpeed` | 打字效果速度（毫秒/字符） | Number | 50 |

## Events

| 事件名 | 说明 | 参数 |
|--------|------|------|
| `send-message` | 用户发送消息时触发 | message (消息内容) |

## Message 对象结构

```typescript
{
  type: 'user' | 'bot' | 'assistant' | 'system',  // 必须
  content: string,                                   // 必须
  avatar?: string,                                   // 可选，头像 URL
  time?: Date | string,                              // 可选，消息时间
  typing?: boolean,                                  // 可选，是否启用打字效果（仅对 bot/assistant 有效）
}
```

### Message 类型说明

- **user**: 用户消息，显示在右侧，背景为主题色
- **bot**: 机器人消息，显示在左侧，背景为灰色，支持打字效果
- **assistant**: 助手消息，同 bot，支持打字效果
- **system**: 系统消息，居中显示，灰色背景

## 使用示例

### 1. 基础聊天

```vue
<template>
  <Chat
    title="AI 助手"
    :messages="messages"
    @send-message="handleSendMessage"
  />
</template>

<script setup>
import { ref } from 'vue'
import Chat from '@/components/chat/Chat.vue'

const messages = ref([])

const handleSendMessage = async (message) => {
  messages.value.push({
    type: 'user',
    content: message,
    time: new Date()
  })

  // 调用 API
  const response = await fetchAiResponse(message)
  
  messages.value.push({
    type: 'bot',
    content: response,
    time: new Date()
  })
}
</script>
```

### 2. 带加载状态

```vue
<template>
  <Chat
    title="对话"
    :messages="messages"
    :is-loading="isLoading"
    @send-message="handleSendMessage"
  />
</template>

<script setup>
import { ref } from 'vue'
import Chat from '@/components/chat/Chat.vue'

const messages = ref([])
const isLoading = ref(false)

const handleSendMessage = async (message) => {
  messages.value.push({
    type: 'user',
    content: message
  })

  isLoading.value = true

  try {
    const response = await fetchAiResponse(message)
    messages.value.push({
      type: 'bot',
      content: response
    })
  } finally {
    isLoading.value = false
  }
}
</script>
```

### 3. 带用户头像

```vue
<template>
  <Chat
    :messages="messages"
    @send-message="handleSendMessage"
  />
</template>

<script setup>
import { ref } from 'vue'
import Chat from '@/components/chat/Chat.vue'
import { useUserStore } from '@/store/modules/user'

const userStore = useUserStore()
const messages = ref([])

const handleSendMessage = (message) => {
  messages.value.push({
    type: 'user',
    content: message,
    avatar: userStore.userInfo?.avatar,
    time: new Date()
  })

  // 处理消息...
}
</script>
```

### 4. 带打字效果的消息

```vue
<template>
  <Chat
    :messages="messages"
    :is-loading="isLoading"
    :typing-speed="50"
    @send-message="handleSendMessage"
  />
</template>

<script setup>
import { ref } from 'vue'
import Chat from '@/components/chat/Chat.vue'

const messages = ref([])
const isLoading = ref(false)

const handleSendMessage = async (message) => {
  messages.value.push({
    type: 'user',
    content: message
  })

  isLoading.value = true

  // 模拟 API 调用
  const response = await fetchAiResponse(message)

  // 添加带打字效果的机器人消息
  messages.value.push({
    type: 'bot',
    content: response,
    typing: true,  // 启用打字效果
    avatar: 'https://example.com/bot-avatar.png',
    time: new Date()
  })

  isLoading.value = false
}
</script>
```

**打字效果说明：**
- 设置 `typing: true` 启用打字效果
- 使用 `typingSpeed` prop 调整打字速度（默认 50ms/字符）
- 打字过程中会显示闪烁的光标
- 仅对 `bot` 和 `assistant` 类型的消息有效

### 5. 系统消息

```javascript
messages.value.push({
  type: 'system',
  content: '你已加入群聊'
})

messages.value.push({
  type: 'system',
  content: '用户 X 离开了群聊'
})
```

## 键盘快捷键

- **Ctrl/Cmd + Enter**: 快速发送消息

## 样式定制

组件使用 CSS 变量，可以通过修改以下变量来定制样式：

```css
:root {
  --theme-color: #1890ff;      /* 主题色 */
  --bg-color: #f5f5f5;         /* 背景色 */
}
```

## 完整示例

详见 `ChatDemo.vue` 文件中的完整示例。

## 特别注意

1. 消息必须包含 `type` 和 `content` 字段
2. 消息时间可以是 `Date` 对象或格式化的时间字符串
3. 确保在添加消息后，组件会自动滚动到最新消息
4. 建议在发送消息前进行内容验证和清理
