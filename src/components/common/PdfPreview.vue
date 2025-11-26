<template>
  <div class="pdf-preview">
    <van-nav-bar :title="title" left-text="返回" left-arrow @click-left="onClickLeft" />

    <div class="pdf-container" ref="pdfContainer">
      <div v-if="loading" class="loading-container">
        <van-loading type="spinner" color="#1989fa" size="24px">加载中...</van-loading>
      </div>

      <div v-if="error" class="error-container">
        <van-empty image="error" description="PDF加载失败" />
        <van-button type="primary" size="small" @click="retryLoad">重试</van-button>
      </div>

      <div v-if="!loading && !error" class="pdf-content">
        <div class="pdf-controls">
          <van-button size="small" @click="prevPage" :disabled="currentPage <= 1">
            上一页
          </van-button>
          <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
          <van-button size="small" @click="nextPage" :disabled="currentPage >= totalPages">
            下一页
          </van-button>
          <van-button size="small" @click="zoomOut" :disabled="scale <= 0.5">缩小</van-button>
          <span class="zoom-info">{{ Math.round(scale * 100) }}%</span>
          <van-button size="small" @click="zoomIn" :disabled="scale >= 5">放大</van-button>
        </div>

        <div class="pdf-canvas-container" ref="canvasContainer">
          <canvas ref="pdfCanvas"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, shallowRef, onMounted, watch, markRaw, nextTick } from 'vue'
import { showToast } from 'vant'
import * as pdfjsLib from 'pdfjs-dist'

// 设置 PDF.js worker - 使用本地文件（PDF.js 2.16.105）
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.js'

const props = defineProps({
  src: {
    type: String,
    required: true
  },
  title: {
    type: String,
    default: 'PDF预览'
  }
})

const emit = defineEmits(['back'])

const pdfContainer = ref(null)
const canvasContainer = ref(null)
const pdfCanvas = ref(null)

const loading = ref(true)
const error = ref(false)
const currentPage = ref(1)
const totalPages = ref(0)
const scale = ref(1.5)
// 使用 shallowRef 避免 PDF.js 对象被 Vue 响应式系统深度包装
const pdfDocument = shallowRef(null)

// 加载PDF文档
const loadPdf = async () => {
  try {
    loading.value = true
    error.value = false

    console.log('开始加载PDF:', props.src)

    // 使用简化的配置，避免加载额外资源导致的问题
    const loadingTask = pdfjsLib.getDocument({
      url: props.src,
      // 移除 cMapUrl 配置，避免加载外部资源失败
      // 如果需要支持中文等特殊字符，可以按需添加
      verbosity: 0 // 减少控制台输出
    })

    // 使用 markRaw 标记 PDF 文档对象，防止被 Vue 响应式系统包装
    const doc = await loadingTask.promise
    pdfDocument.value = markRaw(doc)
    console.log('PDF加载成功，总页数:', pdfDocument.value.numPages)
    totalPages.value = pdfDocument.value.numPages

    // 先设置 loading 为 false，让 Canvas 元素渲染出来
    loading.value = false

    // 等待 DOM 更新完成
    await nextTick()

    // 渲染第一页
    await renderPage(currentPage.value)
  } catch (err) {
    console.error('PDF加载失败:', err)
    console.log('错误类型:', err.name)
    console.log('错误信息:', err.message)
    loading.value = false
    error.value = true

    // 根据错误类型显示更具体的错误信息
    let errorMsg = 'PDF加载失败'
    if (err.name === 'UnknownErrorException') {
      errorMsg = 'PDF文件格式错误或已损坏'
    } else if (err.name === 'InvalidPDFException') {
      errorMsg = '无效的PDF文件'
    } else if (err.name === 'MissingPDFException') {
      errorMsg = '找不到PDF文件'
    } else if (err.message && err.message.includes('fetch')) {
      errorMsg = 'PDF文件加载失败，请检查网络连接'
    }

    showToast({ type: 'fail', message: errorMsg })
  }
}

// 渲染指定页面
const renderPage = async (pageNum) => {
  try {
    console.log('开始渲染页面:', pageNum, '缩放比例:', scale.value)

    if (!pdfDocument.value) {
      throw new Error('PDF文档未加载')
    }

    const page = await pdfDocument.value.getPage(pageNum)

    // PDF.js 2.x 版本使用不同的 API
    const viewport = page.getViewport({ scale: scale.value })

    const canvas = pdfCanvas.value
    if (!canvas) {
      throw new Error('Canvas元素未找到')
    }

    const context = canvas.getContext('2d')
    if (!context) {
      throw new Error('无法获取Canvas上下文')
    }

    // 设置canvas尺寸
    canvas.height = viewport.height
    canvas.width = viewport.width

    console.log('Canvas尺寸:', canvas.width, 'x', canvas.height)

    // 清除canvas内容
    context.clearRect(0, 0, canvas.width, canvas.height)

    const renderContext = {
      canvasContext: context,
      viewport: viewport
    }

    const renderTask = page.render(renderContext)
    await renderTask.promise

    console.log('页面渲染成功:', pageNum)

    // 滚动到顶部
    if (canvasContainer.value) {
      canvasContainer.value.scrollTop = 0
    }
  } catch (err) {
    console.error('页面渲染失败:', err)
    showToast({ type: 'fail', message: `第${pageNum}页渲染失败` })
  }
}

// 上一页
const prevPage = () => {
  if (currentPage.value <= 1) return
  currentPage.value--
  renderPage(currentPage.value)
}

// 下一页
const nextPage = () => {
  if (currentPage.value >= totalPages.value) return
  currentPage.value++
  renderPage(currentPage.value)
}

// 放大
const zoomIn = () => {
  const newScale = Math.min(scale.value + 0.5, 5)
  console.log('放大：', scale.value, '->', newScale)
  scale.value = newScale
  renderPage(currentPage.value)
}

// 缩小
const zoomOut = () => {
  const newScale = Math.max(scale.value - 0.5, 0.5)
  console.log('缩小：', scale.value, '->', newScale)
  scale.value = newScale
  renderPage(currentPage.value)
}

// 重试加载
const retryLoad = () => {
  loadPdf()
}

// 返回按钮点击事件
const onClickLeft = () => {
  emit('back')
}

// 监听src变化，重新加载PDF
watch(() => props.src, () => {
  if (props.src) {
    currentPage.value = 1
    loadPdf()
  }
})

onMounted(() => {
  if (props.src) {
    loadPdf()
  }
})
</script>

<style scoped>
.pdf-preview {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.pdf-container {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  gap: 16px;
}

.pdf-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.pdf-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  gap: 8px;
  background-color: #f7f8fa;
  border-bottom: 1px solid #ebedf0;
}

.page-info {
  font-size: 14px;
  color: #323233;
  margin: 0 8px;
  min-width: 50px;
  text-align: center;
}

.zoom-info {
  font-size: 14px;
  color: #1989fa;
  font-weight: 600;
  margin: 0 8px;
  min-width: 50px;
  text-align: center;
}

.pdf-canvas-container {
  flex: 1;
  overflow: auto;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 10px;
  background-color: #f7f8fa;
}

canvas {
  /* 关键修复：不设置任何width/height限制，让canvas按照实际渲染尺寸显示 */
  /* 这样缩放时canvas的实际尺寸才能生效 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  background-color: white;
  display: block;
  /* 确保canvas不会被压缩 */
  flex-shrink: 0;
}
</style>