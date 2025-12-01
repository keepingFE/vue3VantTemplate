# 大文件上传组件使用文档

## 功能特性

### ✅ 核心功能
- **分片上传**: 大文件自动分片，默认2MB每片，减少单次请求压力
- **断点续传**: 上传中断后可继续上传，不需要重新开始
- **秒传功能**: 基于文件MD5检测，相同文件直接返回
- **暂停/恢复**: 支持随时暂停和恢复上传任务
- **并发控制**: 支持配置并发上传数量，默认3个分片并发
- **进度显示**: 实时显示MD5计算和上传进度
- **错误重试**: 支持失败分片自动/手动重试
- **多文件上传**: 支持同时上传多个文件

## 快速开始

### 1. 组件引入

```vue
<template>
  <LargeFileUpload
    :multiple="true"
    :max-size="1024"
    :chunk-size="2"
    :concurrent="3"
    upload-text="选择大文件上传"
    upload-tip="支持断点续传、秒传"
    @success="handleSuccess"
    @error="handleError"
    @progress="handleProgress"
  />
</template>

<script setup>
import LargeFileUpload from '@/components/common/LargeFileUpload.vue'

const handleSuccess = (fileItem, result) => {
  console.log('上传成功:', fileItem, result)
}

const handleError = (fileItem, error) => {
  console.error('上传失败:', fileItem, error)
}

const handleProgress = (fileItem, progress) => {
  console.log('上传进度:', fileItem.file.name, progress + '%')
}
</script>
```

### 2. 组件Props

| 参数 | 说明 | 类型 | 默认值 |
|-----|------|------|--------|
| uploadText | 上传按钮文字 | String | '上传大文件' |
| uploadTip | 上传提示文字 | String | '支持断点续传、秒传' |
| accept | 接受的文件类型 | String | '*' |
| multiple | 是否支持多选 | Boolean | false |
| maxSize | 文件大小限制(MB) | Number | 1024 |
| chunkSize | 分片大小(MB) | Number | 2 |
| concurrent | 并发数 | Number | 3 |
| uploadUrl | 上传接口 | String | '/api/upload/chunk' |
| mergeUrl | 合并接口 | String | '/api/upload/merge' |
| checkUrl | 检查接口 | String | '/api/upload/check' |

### 3. 组件Events

| 事件名 | 说明 | 回调参数 |
|-------|------|---------|
| success | 上传成功 | (fileItem, result) |
| error | 上传失败 | (fileItem, error) |
| progress | 上传进度变化 | (fileItem, progress) |

### 4. 组件Methods

通过ref可以访问组件的方法：

```vue
<template>
  <LargeFileUpload ref="uploaderRef" />
  <button @click="uploaderRef.triggerUpload()">手动触发上传</button>
</template>

<script setup>
import { ref } from 'vue'

const uploaderRef = ref(null)
</script>
```

| 方法名 | 说明 | 参数 |
|-------|------|------|
| triggerUpload | 触发文件选择 | - |
| fileList | 获取文件列表 | - |

## 后端接口要求

### 1. 检查文件接口

**请求**
```
POST /api/upload/check
Content-Type: application/json

{
  "fileMD5": "文件MD5值",
  "fileName": "文件名",
  "fileSize": 文件大小(字节)
}
```

**响应**
```json
{
  "code": 200,
  "data": {
    "exists": false,  // 文件是否已存在(秒传)
    "uploadedChunks": [0, 1, 2],  // 已上传的分块索引
    "url": "文件URL"  // 如果exists为true时返回
  },
  "message": "success"
}
```

### 2. 上传分片接口

**请求**
```
POST /api/upload/chunk
Content-Type: multipart/form-data

file: 分片文件
fileMD5: 文件MD5值
fileName: 文件名
chunkIndex: 分片索引
chunkMD5: 分片MD5值
totalChunks: 总分片数
```

**响应**
```json
{
  "code": 200,
  "data": {
    "chunkIndex": 0,
    "uploaded": true
  },
  "message": "success"
}
```

### 3. 合并文件接口

**请求**
```
POST /api/upload/merge
Content-Type: application/json

{
  "fileMD5": "文件MD5值",
  "fileName": "文件名",
  "fileSize": 文件大小(字节),
  "totalChunks": 总分片数
}
```

**响应**
```json
{
  "code": 200,
  "data": {
    "url": "文件访问URL",
    "fileName": "文件名",
    "fileSize": 文件大小
  },
  "message": "文件合并成功"
}
```

## 工作流程

```
1. 用户选择文件
   ↓
2. 计算文件MD5值 (用于秒传和校验)
   ↓
3. 调用检查接口
   ├─ 文件已存在 → 秒传成功
   └─ 文件不存在 → 继续上传
       ↓
4. 文件分片
   ↓
5. 并发上传分片 (支持暂停/恢复)
   ↓
6. 所有分片上传完成
   ↓
7. 调用合并接口
   ↓
8. 上传成功
```

## 文件状态说明

| 状态 | 说明 |
|-----|------|
| calculating | MD5计算中 |
| uploading | 上传中 |
| paused | 已暂停 |
| success | 上传成功 |
| error | 上传失败 |

## 高级用法

### 自定义接受文件类型

```vue
<LargeFileUpload
  accept="video/*,image/*"
  upload-text="上传视频或图片"
/>
```

### 限制文件大小

```vue
<LargeFileUpload
  :max-size="500"
  upload-tip="最大支持500MB"
/>
```

### 调整分片大小和并发数

```vue
<LargeFileUpload
  :chunk-size="5"
  :concurrent="5"
/>
```

## 开发和测试

项目已配置Mock接口，可以直接进行测试：

1. 启动开发服务器
```bash
npm run dev
```

2. 访问示例页面
```
访问: 我的 → 大文件上传
路径: /upload/large-file
```

3. Mock接口位置
```
mock/upload.js
```

## 注意事项

1. **文件MD5计算**：大文件MD5计算可能需要一些时间，请耐心等待
2. **浏览器内存**：超大文件(>2GB)可能会占用较多浏览器内存
3. **网络稳定性**：建议在稳定的网络环境下上传大文件
4. **后端配置**：需要后端配置相应的分片存储和合并逻辑
5. **跨域问题**：确保后端接口支持跨域请求
6. **超时设置**：建议后端设置合理的请求超时时间

## 依赖说明

- **spark-md5**: 用于计算文件MD5值
- **axios**: HTTP请求库
- **vant**: UI组件库

## 浏览器兼容性

- Chrome >= 60
- Firefox >= 60
- Safari >= 12
- Edge >= 79

## 后续优化方向

- [ ] 支持拖拽上传
- [ ] 支持粘贴上传
- [ ] 上传队列管理
- [ ] 上传速度显示
- [ ] 剩余时间估算
- [ ] WebWorker计算MD5
- [ ] 上传历史记录
- [ ] 断点续传持久化

## 问题反馈

如有问题或建议，请联系开发团队。
