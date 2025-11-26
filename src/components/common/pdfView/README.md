# PDF 预览组件

## 📁 文件说明

- `PdfPreview.vue` - PDF 预览组件（性能优化版）
- `pdf.worker.js` - PDF.js Worker 文件（本地引用）
- `index.js` - 组件导出文件

## 🚀 使用方法

```vue
<template>
  <PdfPreview 
    :src="pdfUrl" 
    title="PDF预览" 
    :max-rendered-pages="10"
    @back="handleBack" 
  />
</template>

<script setup>
import PdfPreview from '@/components/common/pdfView'

const pdfUrl = ref('/test.pdf')

const handleBack = () => {
  // 处理返回逻辑
}
</script>
```

## 📋 Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| src | PDF 文件地址（必填） | String | - |
| title | 标题 | String | 'PDF预览' |
| maxRenderedPages | 最大同时渲染的页面数量 | Number | 10 |

## 🎯 Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| back | 点击返回按钮时触发 | - |

## ⚡ 性能优化

本组件针对大型 PDF 文件（100+ 页）进行了以下优化：

1. **IntersectionObserver 懒加载** - 只渲染可见区域的页面
2. **Canvas 回收机制** - 限制同时渲染的页面数量，自动清理不可见页面
3. **优先级渲染** - 根据页面可见比例优先渲染完全可见的页面
4. **延迟清理** - 避免频繁进出视口时重复渲染
5. **防抖优化** - 缩放操作使用防抖，避免频繁渲染
6. **内存释放** - 清除不可见页面的 Canvas 内容以释放内存

## 🔧 配置说明

### maxRenderedPages 参数调整建议

- **低端设备**：建议设置为 5-8 页
- **中端设备**：建议设置为 10-15 页（默认）
- **高端设备**：可设置为 20-30 页

```vue
<!-- 低端设备 -->
<PdfPreview :src="pdfUrl" :max-rendered-pages="5" />

<!-- 高端设备 -->
<PdfPreview :src="pdfUrl" :max-rendered-pages="20" />
```

## 📦 依赖

- `pdfjs-dist`: ^2.16.105
- `vant`: ^4.8.0

## 🔗 Worker 文件说明

`pdf.worker.js` 文件是从 `pdfjs-dist` 包中复制而来，放在组件同目录下以便本地引用，避免 CDN 加载失败的问题。

组件会自动使用相对路径引用该 Worker 文件：

```javascript
import workerUrl from './pdf.worker.js?url'
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl
```

## 📝 注意事项

1. PDF 文件需要支持跨域访问（CORS）
2. 建议将大型 PDF 文件放在 CDN 或静态资源服务器上
3. 本地测试可将 PDF 文件放在 `public` 目录下
4. Worker 文件会随组件一起打包，无需额外配置

