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
          <span class="page-info">第 {{ currentPage }} 页 / 共 {{ totalPages }} 页</span>
          <van-button
            size="small"
            icon="arrow-up"
            @click="scrollToTop"
            v-if="totalPages > 1"
            title="回到首页"
          />
          <van-button size="small" icon="minus" @click="zoomOut" :disabled="scale <= 0.5" />
          <span class="zoom-info">{{ Math.round(scale * 100) }}%</span>
          <van-button size="small" icon="plus" @click="zoomIn" :disabled="scale >= 5" />
          <van-button size="small" icon="replay" @click="fitToWidth" />
        </div>

        <!-- 进度条 -->
        <div class="pdf-progress-bar">
          <div class="pdf-progress-inner" :style="{ width: scrollProgress + '%' }"></div>
        </div>

        <div class="pdf-canvas-container" ref="canvasContainer" @scroll="onScroll">
          <div
            v-for="pageNum in totalPages"
            :key="pageNum"
            class="pdf-page-wrapper"
            :data-page="pageNum"
            :style="{ minHeight: pageHeights[pageNum] ? pageHeights[pageNum] + 'px' : '200px' }"
          >
            <canvas :ref="el => setCanvasRef(el, pageNum)"></canvas>
          </div>
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
const canvasRefs = ref({})
const pageHeights = ref({}) // 存储每页的高度，用于占位
const renderedPages = ref(new Set()) // 记录已渲染的页面
const visibleRatios = ref({}) // 记录页面可见比例
let observer = null // IntersectionObserver 实例
const renderTasks = {} // 存储渲染任务，用于取消

const setCanvasRef = (el, pageNum) => {
  if (el) {
    canvasRefs.value[pageNum] = el
  }
}

const loading = ref(true)
const error = ref(false)
const currentPage = ref(1)
const totalPages = ref(0)
const scale = ref(1.0)
const scrollProgress = ref(0)
// 使用 shallowRef 避免 PDF.js 对象被 Vue 响应式系统深度包装
const pdfDocument = shallowRef(null)

// 加载PDF文档
const loadPdf = async () => {
  try {
    loading.value = true
    error.value = false
    scrollProgress.value = 0

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

    // 计算自适应缩放比例
    await fitToWidth()

    // 初始化 IntersectionObserver
    initIntersectionObserver()
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
// 渲染指定页面
const renderPage = async pageNum => {
  // 如果已经渲染过且缩放比例没变，就不重复渲染
  if (renderedPages.value.has(pageNum)) return

  // 如果该页面正在渲染，取消之前的渲染任务
  if (renderTasks[pageNum]) {
    try {
      await renderTasks[pageNum].cancel()
    } catch (e) {
      // 取消渲染会抛出异常，忽略即可
    }
    delete renderTasks[pageNum]
  }

  try {
    if (!pdfDocument.value) return

    const page = await pdfDocument.value.getPage(pageNum)
    const viewport = page.getViewport({ scale: scale.value })

    // 更新页面高度占位
    pageHeights.value[pageNum] = viewport.height

    const canvas = canvasRefs.value[pageNum]
    if (!canvas) return

    const context = canvas.getContext('2d')
    if (!context) return

    canvas.height = viewport.height
    canvas.width = viewport.width

    // 清除canvas内容
    context.clearRect(0, 0, canvas.width, canvas.height)

    const renderContext = {
      canvasContext: context,
      viewport: viewport
    }

    // 保存渲染任务
    const renderTask = page.render(renderContext)
    renderTasks[pageNum] = renderTask

    await renderTask.promise

    delete renderTasks[pageNum]
    renderedPages.value.add(pageNum)
  } catch (err) {
    // 忽略取消渲染的错误
    if (err?.name === 'RenderingCancelledException') {
      return
    }
    console.error(`第${pageNum}页渲染失败:`, err)
  }
}

// 初始化 IntersectionObserver 实现懒加载
const initIntersectionObserver = () => {
  if (observer) {
    observer.disconnect()
  }

  const options = {
    root: canvasContainer.value,
    rootMargin: '100px',
    threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]
  }

  observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const pageNum = parseInt(entry.target.dataset.page)
      if (!pageNum) return

      if (entry.isIntersecting) {
        renderPage(pageNum)
        visibleRatios.value[pageNum] = entry.intersectionRatio
      } else {
        delete visibleRatios.value[pageNum]
      }
    })

    // 找出可见比例最大的页面作为当前页
    let maxRatio = 0
    let maxPage = currentPage.value

    for (const [pageNum, ratio] of Object.entries(visibleRatios.value)) {
      if (ratio > maxRatio) {
        maxRatio = ratio
        maxPage = parseInt(pageNum)
      }
    }

    if (maxPage !== currentPage.value) {
      currentPage.value = maxPage
    }
  }, options)

  // 观察所有页面容器
  nextTick(() => {
    const pages = canvasContainer.value.querySelectorAll('.pdf-page-wrapper')
    pages.forEach(page => observer.observe(page))
  })
}

// 监听滚动更新当前页码（辅助 IntersectionObserver）
const onScroll = e => {
  const target = e.target
  if (target) {
    const totalScroll = target.scrollHeight - target.clientHeight
    if (totalScroll > 0) {
      // 计算滚动百分比
      const progress = (target.scrollTop / totalScroll) * 100
      scrollProgress.value = Math.min(100, Math.max(0, progress))
    } else {
      scrollProgress.value = 0
    }
  }
}

// 重新渲染所有可见页面（用于缩放后）
const rerenderVisiblePages = () => {
  renderedPages.value.clear()
  // 重新初始化观察者会触发可见页面的渲染
  initIntersectionObserver()
}

// 移除上一页/下一页函数
// const prevPage = ...
// const nextPage = ...

// 放大
const zoomIn = () => {
  const newScale = Math.min(scale.value + 0.5, 5)
  console.log('放大：', scale.value, '->', newScale)
  scale.value = newScale
  rerenderVisiblePages()
}

// 缩小
const zoomOut = () => {
  const newScale = Math.max(scale.value - 0.5, 0.5)
  console.log('缩小：', scale.value, '->', newScale)
  scale.value = newScale
  rerenderVisiblePages()
}

// 回到第一页
const scrollToTop = () => {
  if (canvasContainer.value) {
    canvasContainer.value.scrollTop = 0
    currentPage.value = 1
  }
}

// 自适应宽度（重置）
const fitToWidth = async () => {
  if (!pdfDocument.value) return

  try {
    const page = await pdfDocument.value.getPage(currentPage.value)
    const originalViewport = page.getViewport({ scale: 1.0 })

    if (canvasContainer.value) {
      const containerWidth = canvasContainer.value.clientWidth
      // 减去左右 padding (20px) + 预留滚动条宽度及安全边距 (20px) = 40px
      if (containerWidth > 0 && originalViewport.width > 0) {
        scale.value = (containerWidth - 40) / originalViewport.width
        console.log('重置自适应比例:', scale.value)
        rerenderVisiblePages()
      }
    }
  } catch (err) {
    console.error('自适应计算失败:', err)
  }
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
watch(
  () => props.src,
  () => {
    if (props.src) {
      currentPage.value = 1
      loadPdf()
    }
  }
)

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

.pdf-progress-bar {
  height: 3px;
  background-color: #ebedf0;
  width: 100%;
  position: relative;
  z-index: 10;
}

.pdf-progress-inner {
  height: 100%;
  background-color: #1989fa;
  transition: width 0.1s linear;
}

.page-info {
  font-size: 14px;
  color: #323233;
  margin: 0 8px;
  min-width: 50px;
  text-align: center;
  font-variant-numeric: tabular-nums; /* 防止数字宽度变化导致抖动 */
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
  flex-direction: column;
  /* 移除 align-items: center，避免放大后左侧被裁剪且无法滚动 */
  /* align-items: center; */
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

.pdf-page-wrapper {
  margin-bottom: 16px;
  display: flex;
  justify-content: center;
  /* 确保宽度至少为100%，允许内容撑开 */
  min-width: 100%;
  width: fit-content;
  /* 在父容器中居中 */
  margin-left: auto;
  margin-right: auto;
}
</style>
