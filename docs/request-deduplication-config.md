# 请求去重配置说明

## 概述

请求去重功能已改造为可配置模式，支持灵活的全局配置和单个请求级别的控制。

## 配置文件位置

`src/config/request.config.js`

## 配置项说明

### 1. 去重配置 (deduplication)

```javascript
deduplication: {
  // 是否启用全局请求去重
  enabled: true,
  
  // 是否显示重复请求提示
  showToast: true,
  
  // 去重策略
  strategy: 'all',
  
  // 白名单
  whitelist: ['/upload', '/download'],
  
  // 黑名单
  blacklist: [],
  
  // 特殊请求类型配置
  skipSpecialRequests: {
    formData: true,
    blob: true,
    arraybuffer: true
  }
}
```

#### 去重策略 (strategy)

- `'all'`: 完整匹配（method + url + params + data）- 默认
- `'same-params'`: 仅匹配 method + url + params
- `'same-url'`: 仅匹配 method + url

#### 白名单 (whitelist)

不进行去重的 URL 列表，支持：
- 字符串匹配（包含即可）：`'/upload'`
- 正则表达式：`/^\/api\/log/`

#### 黑名单 (blacklist)

强制进行去重的 URL 列表，优先级高于白名单。

### 2. 超时配置 (timeout)

```javascript
timeout: {
  default: 15000,      // 默认超时 15 秒
  upload: 300000,      // 上传超时 5 分钟
  download: 60000      // 下载超时 1 分钟
}
```

### 3. Loading 配置

```javascript
loading: {
  enabled: true,       // 是否显示 loading
  forbidClick: true,   // 是否禁止点击
  duration: 0          // 持续时间
}
```

### 4. Token 刷新配置

```javascript
tokenRefresh: {
  enabled: true,              // 是否启用自动刷新
  advanceTime: 300,           // 提前刷新时间（秒）
  timeout: 30000,             // 刷新超时时间（毫秒）
  showToast: true             // 是否显示刷新提示
}
```

## 单个请求级别控制

### 允许重复请求

```javascript
// 方式 1：完全跳过去重
request({
  url: '/api/data',
  method: 'post',
  allowDuplicate: true  // 允许重复请求
})

// 方式 2：不显示重复提示
request({
  url: '/api/data',
  method: 'post',
  showDuplicateToast: false  // 不显示提示
})
```

### 自定义 Loading

```javascript
// 不显示 loading
request({
  url: '/api/data',
  loading: false
})

// 使用默认 loading（根据全局配置）
request({
  url: '/api/data'
})
```

## 使用场景示例

### 场景 1：轮询接口不去重

```javascript
// 在配置文件中添加到白名单
whitelist: [
  '/api/polling',
  '/api/heartbeat'
]
```

### 场景 2：关键接口强制去重

```javascript
// 在配置文件中添加到黑名单
blacklist: [
  '/api/payment',
  '/api/order/submit'
]
```

### 场景 3：仅根据 URL 去重

```javascript
// 修改去重策略
deduplication: {
  strategy: 'same-url'  // 只要 URL 相同就认为是重复请求
}
```

### 场景 4：临时允许某个请求重复

```javascript
// 在调用时传入配置
import request from '@/api/request'

request({
  url: '/api/data',
  method: 'post',
  data: { id: 1 },
  allowDuplicate: true  // 这个请求允许重复
})
```

### 场景 5：关闭全局去重

```javascript
// 在配置文件中关闭
deduplication: {
  enabled: false  // 全局关闭去重功能
}
```

## 优先级说明

配置优先级从高到低：

1. 请求级别配置（`allowDuplicate`）
2. 特殊请求类型（FormData、Blob 等）
3. 黑名单（`blacklist`）
4. 白名单（`whitelist`）
5. 全局配置（`enabled`）

## 注意事项

1. 文件上传（FormData）、文件下载（Blob/ArrayBuffer）默认不去重
2. 白名单支持字符串包含匹配和正则表达式
3. 黑名单优先级高于白名单
4. 去重策略影响请求唯一标识的生成方式
5. 修改配置文件后需要重启开发服务器

## 调试建议

在开发环境中，可以通过浏览器控制台查看去重日志：

```javascript
// 被拦截的重复请求会输出警告
console.warn('检测到重复请求，已拦截：', url)
```

可以在配置文件中临时关闭去重功能进行调试：

```javascript
deduplication: {
  enabled: false  // 临时关闭
}
```
