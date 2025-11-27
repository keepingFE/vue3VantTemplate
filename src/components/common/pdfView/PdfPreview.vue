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
          <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
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
          <van-button
            size="small"
            icon="down"
            @click="downloadPdf"
            type="primary"
            title="下载PDF"
          />
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

/**
 * PDF 预览组件 - 性能优化版
 *
 * 优化策略：
 * 1. IntersectionObserver 懒加载：只渲染可见区域的页面
 * 2. Canvas 回收机制：限制同时渲染的页面数量（MAX_RENDERED_PAGES）
 * 3. 优先级渲染：根据页面可见比例优先渲染完全可见的页面
 * 4. 延迟清理：避免频繁进出视口时重复渲染
 * 5. 防抖优化：缩放操作使用防抖，避免频繁渲染
 * 6. 内存释放：清除不可见页面的 Canvas 内容以释放内存
 *
 * 适用场景：支持 100+ 页的大型 PDF 文件预览
 */

// 设置 PDF.js worker - 使用本地文件（PDF.js 2.16.105）
// 使用相对路径引用同目录下的 worker 文件
import workerUrl from './pdf.worker.js?url'
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

const props = defineProps({
  src: {
    type: String,
    required: true
  },
  title: {
    type: String,
    default: 'PDF预览'
  },
  maxRenderedPages: {
    type: Number,
    default: 10, // 默认最多同时渲染10页，可根据设备性能调整
    validator: value => value > 0
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
let renderQueue = [] // 渲染队列
let activeRenderCount = 0 // 当前正在渲染的页面数量
const MAX_CONCURRENT_RENDERS = 2 // 最大并发渲染数量


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

// 清除指定页面的渲染内容
const clearPage = pageNum => {
  const canvas = canvasRefs.value[pageNum]
  if (!canvas) return

  const context = canvas.getContext('2d')
  if (!context) return

  // 清除canvas内容并重置尺寸以释放内存
  context.clearRect(0, 0, canvas.width, canvas.height)
  canvas.width = 0
  canvas.height = 0

  renderedPages.value.delete(pageNum)
}

// Canvas 回收机制：限制同时渲染的页面数量
const recycleCanvasIfNeeded = () => {
  if (renderedPages.value.size <= props.maxRenderedPages) return

  // 找出不在可见区域的已渲染页面
  const visiblePageNums = new Set(Object.keys(visibleRatios.value).map(p => parseInt(p)))
  const renderedPageNums = Array.from(renderedPages.value)

  // 找出需要清除的页面（已渲染但不可见）
  const pagesToClear = renderedPageNums.filter(pageNum => !visiblePageNums.has(pageNum))

  // 按照距离当前页的远近排序，优先清除距离最远的
  pagesToClear.sort((a, b) => {
    const distA = Math.abs(a - currentPage.value)
    const distB = Math.abs(b - currentPage.value)
    return distB - distA
  })

  // 清除多余的页面，保持在限制范围内
  const numToClear = renderedPages.value.size - props.maxRenderedPages
  for (let i = 0; i < Math.min(numToClear, pagesToClear.length); i++) {
    clearPage(pagesToClear[i])
  }
}

// 处理渲染队列
const processRenderQueue = async () => {
  while (renderQueue.length > 0 && activeRenderCount < MAX_CONCURRENT_RENDERS) {
    const pageNum = renderQueue.shift()
    if (pageNum && !renderedPages.value.has(pageNum)) {
      activeRenderCount++
      doRenderPage(pageNum).finally(() => {
        activeRenderCount--
        processRenderQueue() // 继续处理队列
      })
    }
  }
}

// 将页面加入渲染队列
const queueRenderPage = (pageNum) => {
  // 如果已经在队列中或已经渲染，跳过
  if (renderQueue.includes(pageNum) || renderedPages.value.has(pageNum)) {
    return
  }
  renderQueue.push(pageNum)
  processRenderQueue()
}

// 实际执行渲染的函数
const doRenderPage = async pageNum => {
  // 如果已经渲染过，跳过
  if (renderedPages.value.has(pageNum)) return

  // 如果该页面正在渲染，先取消之前的渲染任务
  if (renderTasks[pageNum]) {
    try {
      await renderTasks[pageNum].cancel()
    } catch (e) {
      // 取消渲染会抛出异常，忽略即可
    }
    delete renderTasks[pageNum]
    
    // 等待一小段时间，确保取消操作完全完成
    await new Promise(resolve => setTimeout(resolve, 50))
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

    // 再次检查是否有渲染任务（双重检查，防止竞态条件）
    if (renderTasks[pageNum]) {
      console.warn(`页面 ${pageNum} 仍在渲染中，跳过`)
      return
    }

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

    // 渲染完成后检查是否需要回收 Canvas
    recycleCanvasIfNeeded()
  } catch (err) {
    // 清理失败的渲染任务
    if (renderTasks[pageNum]) {
      delete renderTasks[pageNum]
    }
    
    // 忽略取消渲染的错误
    if (err?.name === 'RenderingCancelledException') {
      return
    }
    console.error(`第${pageNum}页渲染失败:`, err)
  }
}

// 渲染指定页面（保持原有接口，内部使用队列）
const renderPage = (pageNum) => {
  queueRenderPage(pageNum)
}

// 初始化 IntersectionObserver 实现懒加载
const initIntersectionObserver = () => {
  if (observer) {
    observer.disconnect()
  }

  const options = {
    root: canvasContainer.value,
    rootMargin: '200px', // 增加预加载范围
    threshold: [0, 0.25, 0.5, 0.75, 1] // 减少阈值数量以提升性能
  }

  observer = new IntersectionObserver(entries => {
    // 收集需要渲染的页面，按优先级排序
    const pagesToRender = []
    const pagesToUnload = []

    entries.forEach(entry => {
      const pageNum = parseInt(entry.target.dataset.page)
      if (!pageNum) return

      if (entry.isIntersecting) {
        visibleRatios.value[pageNum] = entry.intersectionRatio
        // 根据可见比例设置优先级
        pagesToRender.push({
          pageNum,
          priority: entry.intersectionRatio
        })
      } else {
        delete visibleRatios.value[pageNum]
        // 页面离开视口，标记为可卸载
        if (renderedPages.value.has(pageNum)) {
          pagesToUnload.push(pageNum)
        }
      }
    })

    // 按优先级排序（可见比例高的优先渲染）
    pagesToRender.sort((a, b) => b.priority - a.priority)

    // 优先渲染可见页面
    pagesToRender.forEach(({ pageNum }) => {
      renderPage(pageNum)
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

    // 延迟清理不可见页面，避免频繁进出视口时重复渲染
    setTimeout(() => {
      pagesToUnload.forEach(pageNum => {
        // 再次确认页面仍然不可见
        if (!visibleRatios.value[pageNum] && renderedPages.value.size > props.maxRenderedPages) {
          clearPage(pageNum)
        }
      })
    }, 1000)
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
  // 只清除已渲染的页面，不清除 Set
  // 这样可以避免重复渲染不可见页面
  const visiblePageNums = Object.keys(visibleRatios.value).map(p => parseInt(p))

  // 清除所有已渲染页面的内容
  renderedPages.value.forEach(pageNum => {
    const canvas = canvasRefs.value[pageNum]
    if (canvas) {
      const context = canvas.getContext('2d')
      if (context) {
        context.clearRect(0, 0, canvas.width, canvas.height)
        canvas.width = 0
        canvas.height = 0
      }
    }
  })

  // 清空已渲染记录
  renderedPages.value.clear()

  // 只重新渲染可见页面
  visiblePageNums.forEach(pageNum => {
    renderPage(pageNum)
  })
}

// 移除上一页/下一页函数
// const prevPage = ...
// const nextPage = ...

// 放大
const zoomIn = () => {
  const newScale = Math.min(scale.value + 0.5, 5)
  console.log('放大：', scale.value, '->', newScale)
  scale.value = newScale
  // 使用防抖优化，避免快速点击时频繁渲染
  debounceRerenderVisiblePages()
}

// 缩小
const zoomOut = () => {
  const newScale = Math.max(scale.value - 0.5, 0.5)
  console.log('缩小：', scale.value, '->', newScale)
  scale.value = newScale
  // 使用防抖优化，避免快速点击时频繁渲染
  debounceRerenderVisiblePages()
}

// 防抖重新渲染
let rerenderTimer = null
const debounceRerenderVisiblePages = () => {
  if (rerenderTimer) {
    clearTimeout(rerenderTimer)
  }
  rerenderTimer = setTimeout(() => {
    rerenderVisiblePages()
  }, 300)
}

// 回到第一页（带平滑滚动动画）
const scrollToTop = () => {
  if (canvasContainer.value) {
    canvasContainer.value.scrollTo({
      top: 0,
      behavior: 'smooth' // 平滑滚动动画
    })
    // currentPage 会通过 IntersectionObserver 自动更新
  }
}

// 自适应宽度（重置）
const fitToWidth = async () => {
  if (!pdfDocument.value) return

  try {
    const page = await pdfDocument.value.getPage(1) // 使用第一页计算，避免等待当前页加载
    const originalViewport = page.getViewport({ scale: 1.0 })

    if (canvasContainer.value) {
      const containerWidth = canvasContainer.value.clientWidth
      // 减去左右 padding (20px) + 预留滚动条宽度及安全边距 (20px) = 40px
      if (containerWidth > 0 && originalViewport.width > 0) {
        scale.value = (containerWidth - 40) / originalViewport.width
        console.log('重置自适应比例:', scale.value)
        debounceRerenderVisiblePages()
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

// 下载PDF文件
const downloadPdf = async () => {
  try {
    showToast({ type: 'loading', message: '准备下载...', duration: 0 })

    // 获取PDF文件
    const response = await fetch(props.src)
    if (!response.ok) {
      throw new Error('下载失败')
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)

    // 创建下载链接
    const link = document.createElement('a')
    link.href = url

    // 从URL中提取文件名，如果没有则使用默认名称
    const urlPath = props.src.split('?')[0] // 去除查询参数
    const fileName = urlPath.substring(urlPath.lastIndexOf('/') + 1) || 'document.pdf'
    link.download = fileName

    // 触发下载
    document.body.appendChild(link)
    link.click()

    // 清理
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    showToast({ type: 'success', message: '下载成功' })
  } catch (err) {
    console.error('PDF下载失败:', err)
    showToast({ type: 'fail', message: 'PDF下载失败' })
  }
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
