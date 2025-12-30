<template>
  <div class="rich-text-editor" :class="editorClasses">
    <!-- 加载状态 -->
    <div v-if="loading" class="editor-loading">
      <div class="loading-spinner"></div>
      <span class="loading-text">编辑器加载中...</span>
    </div>

    <!-- 自定义工具栏 -->
    <div v-if="!loading && toolbar !== false" ref="customToolbar" class="custom-toolbar">
      <!-- 文本格式 -->
      <div class="toolbar-group">
        <span class="group-label">格式</span>
        <select class="ql-header" title="标题">
          <option value="">正文</option>
          <option value="1">标题 1</option>
          <option value="2">标题 2</option>
          <option value="3">标题 3</option>
          <option value="4">标题 4</option>
          <option value="5">标题 5</option>
          <option value="6">标题 6</option>
        </select>
        <select class="ql-size" title="字号">
          <option value="small">小</option>
          <option selected>正常</option>
          <option value="large">大</option>
          <option value="huge">特大</option>
        </select>
      </div>

      <!-- 字体样式 -->
      <div class="toolbar-group">
        <span class="group-label">样式</span>
        <button class="ql-bold" title="粗体"></button>
        <button class="ql-italic" title="斜体"></button>
        <button class="ql-underline" title="下划线"></button>
        <button class="ql-strike" title="删除线"></button>
        <select class="ql-color" title="文字颜色"></select>
        <select class="ql-background" title="背景颜色"></select>
      </div>

      <!-- 对齐方式 -->
      <div class="toolbar-group">
        <span class="group-label">对齐</span>
        <select class="ql-align" title="对齐方式">
          <option selected></option>
          <option value="center"></option>
          <option value="right"></option>
          <option value="justify"></option>
        </select>
      </div>

      <!-- 列表和缩进 -->
      <div class="toolbar-group">
        <span class="group-label">列表</span>
        <button class="ql-list" value="ordered" title="有序列表"></button>
        <button class="ql-list" value="bullet" title="无序列表"></button>
        <button class="ql-indent" value="-1" title="减少缩进"></button>
        <button class="ql-indent" value="+1" title="增加缩进"></button>
      </div>

      <!-- 插入元素 -->
      <div class="toolbar-group">
        <span class="group-label">插入</span>
        <button class="ql-link" title="插入链接"></button>
        <button class="ql-image" title="插入图片"></button>
        <button class="ql-video" title="插入视频"></button>
        <button class="ql-blockquote" title="引用"></button>
        <button class="ql-code-block" title="代码块"></button>
      </div>

      <!-- 其他功能 -->
      <div class="toolbar-group">
        <span class="group-label">更多</span>
        <button class="ql-script" value="sub" title="下标"></button>
        <button class="ql-script" value="super" title="上标"></button>
        <button class="ql-formula" title="公式"></button>
        <button class="ql-clean" title="清除格式"></button>
      </div>

      <!-- 全屏按钮 -->
      <div class="toolbar-group toolbar-actions">
        <button class="toolbar-btn" @click="toggleFullscreen" title="全屏">
          <svg v-if="!isFullscreen" viewBox="0 0 24 24" width="16" height="16">
            <path fill="currentColor"
              d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
          </svg>
          <svg v-else viewBox="0 0 24 24" width="16" height="16">
            <path fill="currentColor"
              d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
          </svg>
        </button>
        <button v-if="showWordCount" class="toolbar-btn" @click="showStatistics" title="统计信息">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path fill="currentColor"
              d="M16,11V3H8v6H2v12h20V11H16z M10,5h4v14h-4V5z M4,11h4v8H4V11z M20,19h-4v-6h4V19z" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 编辑器容器 -->
    <div ref="editorContainer" class="editor-container" :style="{ minHeight: minHeight }"></div>

    <!-- 底部状态栏 -->
    <div v-if="showStatusBar" class="editor-status-bar">
      <div class="status-left">
        <span v-if="showCharCount" class="status-item char-count" :class="{ 'is-exceeded': isExceeded }">
          <svg viewBox="0 0 24 24" width="14" height="14">
            <path fill="currentColor"
              d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
          {{ charCount }}/{{ maxLength }} 字符
        </span>
        <span v-if="showWordCount" class="status-item">
          <svg viewBox="0 0 24 24" width="14" height="14">
            <path fill="currentColor" d="M3,3H21V5H3V3M3,7H15V9H3V7M3,11H21V13H3V11M3,15H15V17H3V15M3,19H21V21H3V19Z" />
          </svg>
          {{ wordCount }} 词
        </span>
        <span v-if="autoSave && lastSaveTime" class="status-item auto-save-status">
          <svg viewBox="0 0 24 24" width="14" height="14">
            <path fill="currentColor"
              d="M15,9H5V5H15M12,19A3,3 0 0,1 9,16A3,3 0 0,1 12,13A3,3 0 0,1 15,16A3,3 0 0,1 12,19M17,3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V7L17,3Z" />
          </svg>
          已保存 {{ lastSaveTime }}
        </span>
      </div>
      <div class="status-right">
        <span v-if="readOnly" class="status-item readonly-badge">
          <svg viewBox="0 0 24 24" width="14" height="14">
            <path fill="currentColor"
              d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z" />
          </svg>
          只读
        </span>
      </div>
    </div>

    <!-- 统计信息弹窗 -->
    <div v-if="showStats" class="statistics-modal" @click.self="showStats = false">
      <div class="statistics-content">
        <div class="statistics-header">
          <h3>文档统计</h3>
          <button class="close-btn" @click="showStats = false">×</button>
        </div>
        <div class="statistics-body">
          <div class="stat-item">
            <span class="stat-label">字符数：</span>
            <span class="stat-value">{{ charCount }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">词数：</span>
            <span class="stat-value">{{ wordCount }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">段落数：</span>
            <span class="stat-value">{{ paragraphCount }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">行数：</span>
            <span class="stat-value">{{ lineCount }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed, nextTick, shallowRef } from 'vue'
import Quill from 'quill'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'

// 定义props
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '请输入内容...'
  },
  maxLength: {
    type: Number,
    default: 10000
  },
  showCharCount: {
    type: Boolean,
    default: true
  },
  showWordCount: {
    type: Boolean,
    default: true
  },
  showStatusBar: {
    type: Boolean,
    default: true
  },
  readOnly: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  theme: {
    type: String,
    default: 'snow',
    validator: (value) => ['snow', 'bubble'].includes(value)
  },
  minHeight: {
    type: String,
    default: '300px'
  },
  toolbar: {
    type: [Array, String, Boolean],
    default: 'full'
  },
  options: {
    type: Object,
    default: () => ({})
  },
  autoSave: {
    type: Boolean,
    default: false
  },
  autoSaveDelay: {
    type: Number,
    default: 3000
  },
  imageHandler: {
    type: Function,
    default: null
  }
})

// 定义emits
const emit = defineEmits(['update:modelValue', 'change', 'ready', 'focus', 'blur', 'autoSave', 'exceed'])

// 响应式数据
const editorContainer = ref(null)
const customToolbar = ref(null)
const quill = shallowRef(null)
const isMobile = ref(window.innerWidth <= 768)
const loading = ref(true)
const charCount = ref(0)
const wordCount = ref(0)
const paragraphCount = ref(0)
const lineCount = ref(0)
const isFullscreen = ref(false)
const showStats = ref(false)
const lastSaveTime = ref('')
const resizeObserver = ref(null)

// 计算属性
const isExceeded = computed(() => charCount.value > props.maxLength)

const editorClasses = computed(() => ({
  'is-mobile': isMobile.value,
  'is-disabled': props.disabled,
  'is-readonly': props.readOnly,
  'is-fullscreen': isFullscreen.value
}))

// 工具函数
const debounce = (fn, delay) => {
  let timer = null
  return function (...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}

const throttle = (fn, delay) => {
  let lastTime = 0
  return function (...args) {
    const now = Date.now()
    if (now - lastTime >= delay) {
      lastTime = now
      fn.apply(this, args)
    }
  }
}

const formatTime = (date) => {
  const now = new Date()
  const diff = now - date
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return date.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

// 更新统计信息
const updateStatistics = () => {
  if (!quill.value) return

  const text = quill.value.getText()
  charCount.value = Math.max(0, text.trim().length)

  // 计算词数（中文按字符，英文按单词）
  const chineseChars = text.match(/[\u4e00-\u9fa5]/g) || []
  const englishWords = text.match(/[a-zA-Z]+/g) || []
  wordCount.value = chineseChars.length + englishWords.length

  // 计算段落数
  const content = quill.value.getContents()
  paragraphCount.value = content.ops.filter(op => op.insert && op.insert === '\n').length

  // 计算行数
  lineCount.value = text.split('\n').filter(line => line.trim()).length
}

// 全屏切换
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  if (isFullscreen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

// 显示统计信息
const showStatistics = () => {
  updateStatistics()
  showStats.value = true
}

// 检测移动设备
const checkMobile = throttle(() => {
  isMobile.value = window.innerWidth <= 768
}, 200)

// 自动保存
const triggerAutoSave = debounce(() => {
  if (props.autoSave && quill.value) {
    const html = quill.value.root.innerHTML
    const text = quill.value.getText()
    lastSaveTime.value = formatTime(new Date())
    emit('autoSave', { html, text })
  }
}, props.autoSaveDelay)

// 自定义图片处理
const handleImageUpload = () => {
  if (props.imageHandler) {
    props.imageHandler((url) => {
      if (quill.value && url) {
        const range = quill.value.getSelection(true)
        quill.value.insertEmbed(range.index, 'image', url)
        quill.value.setSelection(range.index + 1)
      }
    })
  } else {
    const input = document.createElement('input')
    input.setAttribute('type', 'file')
    input.setAttribute('accept', 'image/*')
    input.click()

    input.onchange = () => {
      const file = input.files[0]
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          alert('图片大小不能超过5MB')
          return
        }
        const reader = new FileReader()
        reader.onload = (e) => {
          if (quill.value) {
            const range = quill.value.getSelection(true)
            quill.value.insertEmbed(range.index, 'image', e.target.result)
            quill.value.setSelection(range.index + 1)
          }
        }
        reader.readAsDataURL(file)
      }
    }
  }
}

// 初始化编辑器
const initEditor = async () => {
  if (!editorContainer.value) return

  loading.value = true

  try {
    const defaultOptions = {
      theme: props.theme,
      placeholder: props.placeholder,
      readOnly: props.readOnly || props.disabled,
      modules: {
        toolbar: {
          container: customToolbar.value,
          handlers: {
            image: handleImageUpload
          }
        }
      }
    }

    const options = {
      ...defaultOptions,
      ...props.options,
      modules: {
        ...defaultOptions.modules,
        ...(props.options.modules || {})
      }
    }

    quill.value = new Quill(editorContainer.value, options)

    if (props.modelValue) {
      quill.value.root.innerHTML = props.modelValue
    }

    updateStatistics()

    let isComposing = false

    quill.value.on('text-change', (delta, oldDelta, source) => {
      if (isComposing) return

      updateStatistics()
      const html = quill.value.root.innerHTML
      const text = quill.value.getText()

      if (charCount.value > props.maxLength) {
        emit('exceed', charCount.value)
        quill.value.setContents(oldDelta)
        updateStatistics()
        return
      }

      if (source === 'user') {
        emit('update:modelValue', html)
        emit('change', { html, text, delta, source })
        triggerAutoSave()
      }
    })

    quill.value.on('selection-change', (range, oldRange, source) => {
      if (range && !oldRange) {
        emit('focus', { range, source })
      } else if (!range && oldRange) {
        emit('blur', { range: oldRange, source })
      }
    })

    const editor = quill.value.root
    editor.addEventListener('compositionstart', () => {
      isComposing = true
    })
    editor.addEventListener('compositionend', () => {
      isComposing = false
      updateStatistics()
    })

    emit('ready', quill.value)
  } catch (error) {
    console.error('富文本编辑器初始化失败:', error)
  } finally {
    loading.value = false
  }
}

// 监听变化
watch(() => props.modelValue, (newValue) => {
  if (!quill.value) return

  const currentValue = quill.value.root.innerHTML
  if (newValue !== currentValue) {
    const selection = quill.value.getSelection()
    quill.value.root.innerHTML = newValue || ''
    updateStatistics()
    if (selection) {
      nextTick(() => {
        quill.value?.setSelection(selection.index, selection.length)
      })
    }
  }
})

watch(() => [props.readOnly, props.disabled], ([newReadOnly, newDisabled]) => {
  if (quill.value) {
    quill.value.enable(!newReadOnly && !newDisabled)
  }
})

// 生命周期
onMounted(async () => {
  window.addEventListener('resize', checkMobile)
  await initEditor()

  if (editorContainer.value && window.ResizeObserver) {
    resizeObserver.value = new ResizeObserver(() => {
      if (quill.value) {
        quill.value.root.style.minHeight = props.minHeight
      }
    })
    resizeObserver.value.observe(editorContainer.value)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkMobile)
  document.body.style.overflow = ''

  if (resizeObserver.value) {
    resizeObserver.value.disconnect()
  }

  if (quill.value) {
    quill.value.off('text-change')
    quill.value.off('selection-change')
    quill.value = null
  }
})

// 暴露方法
defineExpose({
  getQuill: () => quill.value,
  getContent: () => quill.value?.root.innerHTML || '',
  getText: () => quill.value?.getText() || '',
  getLength: () => quill.value?.getLength() || 0,
  setContent: (content) => {
    if (quill.value) {
      quill.value.root.innerHTML = content
      updateStatistics()
    }
  },
  insertText: (index, text) => quill.value?.insertText(index, text),
  insertEmbed: (index, type, value) => quill.value?.insertEmbed(index, type, value),
  deleteText: (index, length) => quill.value?.deleteText(index, length),
  format: (name, value) => quill.value?.format(name, value),
  getSelection: () => quill.value?.getSelection(),
  setSelection: (index, length) => quill.value?.setSelection(index, length),
  focus: () => quill.value?.focus(),
  blur: () => quill.value?.blur(),
  enable: (enabled = true) => quill.value?.enable(enabled),
  disable: () => quill.value?.enable(false),
  clear: () => {
    if (quill.value) {
      quill.value.setText('')
      updateStatistics()
    }
  },
  toggleFullscreen,
  getStatistics: () => ({
    charCount: charCount.value,
    wordCount: wordCount.value,
    paragraphCount: paragraphCount.value,
    lineCount: lineCount.value
  })
})
</script>

<style lang="scss" scoped>
.rich-text-editor {
  position: relative;
  width: 100%;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;

  &.is-disabled {
    opacity: 0.6;
    pointer-events: none;
  }

  &.is-fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
    border-radius: 0;
    box-shadow: none;

    .editor-container {
      height: calc(100vh - 120px);
      min-height: auto;

      :deep(.ql-editor) {
        height: 100%;
        max-height: none;
      }
    }
  }

  // 加载状态
  .editor-loading {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.95);
    z-index: 100;
    border-radius: 8px;

    .loading-spinner {
      width: 48px;
      height: 48px;
      border: 4px solid #f0f0f0;
      border-top: 4px solid #409eff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    .loading-text {
      margin-top: 16px;
      font-size: 14px;
      color: #666;
    }
  }

  // 自定义工具栏
  .custom-toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: linear-gradient(to bottom, #fafafa, #f5f5f5);
    border-bottom: 1px solid #e0e0e0;
    border-radius: 8px 8px 0 0;

    .toolbar-group {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      background: #fff;
      border-radius: 6px;
      border: 1px solid #e8e8e8;
      position: relative;

      .group-label {
        font-size: 11px;
        color: #999;
        margin-right: 4px;
        font-weight: 500;
        white-space: nowrap;
      }

      button,
      select {
        border: none;
        background: transparent;
        cursor: pointer;
        padding: 6px;
        border-radius: 4px;
        transition: all 0.2s ease;
        color: #333;

        &:hover {
          background: #f0f0f0;
          color: #409eff;
        }

        &.ql-active {
          background: #409eff;
          color: #fff;
        }
      }

      select {
        padding: 4px 8px;
        font-size: 13px;
        min-width: 80px;

        &.ql-header {
          min-width: 90px;
        }

        &.ql-size {
          min-width: 70px;
        }
      }
    }

    .toolbar-actions {
      margin-left: auto;
      border: none;
      background: transparent;
      padding: 0;
      gap: 6px;

      .toolbar-btn {
        padding: 8px;
        background: #fff;
        border: 1px solid #e8e8e8;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;

        svg {
          display: block;
        }

        &:hover {
          background: #409eff;
          border-color: #409eff;
          color: #fff;

          svg {
            color: #fff;
          }
        }
      }
    }
  }

  // 编辑器容器
  .editor-container {
    width: 100%;
    transition: all 0.3s ease;

    :deep(.ql-container) {
      border: none;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    }

    :deep(.ql-editor) {
      min-height: 300px;
      max-height: 600px;
      font-size: 15px;
      line-height: 1.8;
      padding: 20px 24px;
      overflow-y: auto;
      color: #333;

      &:focus {
        outline: none;
      }

      // 标题样式
      h1,
      h2,
      h3,
      h4,
      h5,
      h6 {
        font-weight: 600;
        margin: 16px 0 8px;
        color: #1a1a1a;
      }

      h1 {
        font-size: 28px;
      }

      h2 {
        font-size: 24px;
      }

      h3 {
        font-size: 20px;
      }

      h4 {
        font-size: 18px;
      }

      h5 {
        font-size: 16px;
      }

      h6 {
        font-size: 14px;
      }

      // 段落
      p {
        margin: 8px 0;
      }

      // 列表
      ul,
      ol {
        padding-left: 24px;
        margin: 12px 0;

        li {
          margin: 6px 0;
          line-height: 1.8;
        }
      }

      // 引用块
      blockquote {
        border-left: 4px solid #409eff;
        padding: 12px 16px;
        margin: 16px 0;
        background: #f7f9fc;
        color: #555;
        font-style: italic;
        border-radius: 0 4px 4px 0;
      }

      // 代码块
      pre.ql-syntax {
        background: #282c34;
        color: #abb2bf;
        border-radius: 6px;
        padding: 16px;
        margin: 16px 0;
        overflow-x: auto;
        font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
        font-size: 14px;
        line-height: 1.6;

        &::-webkit-scrollbar {
          height: 8px;
        }

        &::-webkit-scrollbar-thumb {
          background: #4b5263;
          border-radius: 4px;
        }
      }

      // 行内代码
      code {
        background: #f5f5f5;
        padding: 2px 6px;
        border-radius: 3px;
        font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
        font-size: 0.9em;
        color: #e83e8c;
      }

      // 链接
      a {
        color: #409eff;
        text-decoration: none;
        border-bottom: 1px solid transparent;
        transition: all 0.2s ease;

        &:hover {
          border-bottom-color: #409eff;
        }
      }

      // 图片
      img {
        max-width: 100%;
        height: auto;
        display: block;
        margin: 16px auto;
        border-radius: 6px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      // 视频
      iframe {
        max-width: 100%;
        margin: 16px 0;
        border-radius: 6px;
      }

      // 分隔线
      hr {
        border: none;
        border-top: 2px solid #e8e8e8;
        margin: 24px 0;
      }

      // 表格
      table {
        border-collapse: collapse;
        width: 100%;
        margin: 16px 0;

        td,
        th {
          border: 1px solid #e8e8e8;
          padding: 8px 12px;
        }

        th {
          background: #f5f5f5;
          font-weight: 600;
        }
      }
    }

    // 占位符样式
    :deep(.ql-editor.ql-blank::before) {
      font-style: normal;
      color: #bbb;
      left: 24px;
      right: 24px;
    }

    // 禁用状态
    :deep(.ql-editor.ql-disabled) {
      background: #fafafa;
      cursor: not-allowed;
    }
  }

  // 底部状态栏
  .editor-status-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    background: #fafafa;
    border-top: 1px solid #e8e8e8;
    border-radius: 0 0 8px 8px;
    font-size: 12px;
    color: #666;

    .status-left,
    .status-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .status-item {
      display: flex;
      align-items: center;
      gap: 4px;

      svg {
        opacity: 0.6;
      }

      &.char-count.is-exceeded {
        color: #f56c6c;
        font-weight: 600;

        svg {
          opacity: 1;
        }
      }

      &.auto-save-status {
        color: #67c23a;

        svg {
          opacity: 1;
        }
      }
    }

    .readonly-badge {
      padding: 2px 8px;
      background: #e6a23c;
      color: #fff;
      border-radius: 4px;
      font-weight: 500;
    }
  }

  // 统计信息弹窗
  .statistics-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: fadeIn 0.2s ease;

    .statistics-content {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      width: 90%;
      max-width: 400px;
      animation: slideUp 0.3s ease;

      .statistics-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 20px 24px;
        border-bottom: 1px solid #e8e8e8;

        h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #333;
        }

        .close-btn {
          width: 32px;
          height: 32px;
          border: none;
          background: #f5f5f5;
          border-radius: 50%;
          font-size: 24px;
          line-height: 1;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #666;

          &:hover {
            background: #e8e8e8;
            color: #333;
          }
        }
      }

      .statistics-body {
        padding: 24px;

        .stat-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #f5f5f5;

          &:last-child {
            border-bottom: none;
          }

          .stat-label {
            font-size: 14px;
            color: #666;
          }

          .stat-value {
            font-size: 18px;
            font-weight: 600;
            color: #409eff;
          }
        }
      }
    }
  }

  // 移动端优化
  &.is-mobile {
    .custom-toolbar {
      padding: 8px;
      gap: 4px;

      .toolbar-group {
        padding: 2px 4px;
        gap: 2px;

        .group-label {
          display: none;
        }

        button,
        select {
          padding: 8px;
        }
      }
    }

    .editor-container {
      :deep(.ql-editor) {
        font-size: 16px;
        padding: 16px;
        -webkit-text-size-adjust: 100%;
      }
    }

    .editor-status-bar {
      flex-direction: column;
      gap: 8px;
      align-items: flex-start;

      .status-left,
      .status-right {
        width: 100%;
        justify-content: space-between;
      }
    }
  }
}

// 全局Quill样式
:deep(.ql-tooltip) {
  z-index: 10001;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  border-radius: 6px;
  border: 1px solid #e8e8e8;
  background: #fff;
  padding: 8px 12px;

  input[type="text"] {
    border: 1px solid #e8e8e8;
    border-radius: 4px;
    padding: 6px 10px;
    font-size: 13px;

    &:focus {
      border-color: #409eff;
      outline: none;
    }
  }

  .ql-action,
  .ql-remove {
    &::before {
      margin-left: 8px;
    }
  }

  @media (max-width: 768px) {
    left: 10px !important;
    right: 10px !important;
    width: auto !important;
  }
}

// 颜色选择器
:deep(.ql-picker-options) {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  padding: 8px;
}

// 滚动条样式
:deep(.ql-editor) {
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background: #d0d0d0;
    border-radius: 4px;

    &:hover {
      background: #b0b0b0;
    }
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }
}

// 动画
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
