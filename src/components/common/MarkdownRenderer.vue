<template>
  <div class="markdown-container" v-html="renderedMarkdown"></div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'

const props = defineProps({
  content: {
    type: String,
    default: ''
  }
})

// 初始化 markdown-it 实例
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre class="hljs"><code>' +
          hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
          '</code></pre>'
      } catch (__) { }
    }
    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>'
  }
})

// 渲染后的 Markdown 内容
const renderedMarkdown = computed(() => {
  if (!props.content) return ''
  return md.render(props.content)
})
</script>

<style lang="scss" scoped>
.markdown-container {
  line-height: 1.6;
  color: var(--text-primary);
  word-wrap: break-word;
  font-size: $font-size-base;

  :deep(h1) {
    font-size: 1.5em;
    font-weight: bold;
    margin: 0.67em 0;
    padding-bottom: 0.3em;
    border-bottom: 1px solid var(--border-color);
  }

  :deep(h2) {
    font-size: 1.3em;
    font-weight: bold;
    margin: 0.83em 0;
    padding-bottom: 0.3em;
    border-bottom: 1px solid var(--border-color);
  }

  :deep(h3) {
    font-size: 1.1em;
    font-weight: bold;
    margin: 1em 0;
  }

  :deep(h4) {
    font-size: 1em;
    font-weight: bold;
    margin: 1.33em 0;
  }

  :deep(h5) {
    font-size: 0.9em;
    font-weight: bold;
    margin: 1.67em 0;
  }

  :deep(h6) {
    font-size: 0.85em;
    font-weight: bold;
    margin: 2.33em 0;
  }

  :deep(p) {
    margin: 1em 0;
  }

  :deep(ul),
  :deep(ol) {
    padding-left: 2em;
    margin: 1em 0;
  }

  :deep(li) {
    margin: 0.5em 0;
  }

  :deep(blockquote) {
    margin: 1em 0;
    padding: 0.5em 1em;
    border-left: 4px solid var(--theme-color);
    background-color: var(--bg-color);
    color: var(--text-secondary);
  }

  :deep(code) {
    padding: 0.2em 0.4em;
    margin: 0;
    font-size: 85%;
    background-color: rgba(175, 184, 193, 0.2);
    border-radius: 3px;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  }

  :deep(pre) {
    padding: 1em;
    overflow: auto;
    font-size: 85%;
    line-height: 1.45;
    background-color: var(--bg-color);
    border-radius: 6px;
    margin: 1em 0;

    code {
      padding: 0;
      background: none;
    }
  }

  :deep(table) {
    border-collapse: collapse;
    width: 100%;
    margin: 1em 0;
  }

  :deep(th),
  :deep(td) {
    border: 1px solid var(--border-color);
    padding: 0.5em 1em;
    text-align: left;
  }

  :deep(th) {
    background-color: var(--bg-color);
    font-weight: bold;
  }

  :deep(a) {
    color: var(--theme-color);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  :deep(img) {
    max-width: 100%;
    height: auto;
    display: block;
    margin: 1em auto;
    border-radius: 4px;
  }

  :deep(hr) {
    height: 2px;
    padding: 0;
    margin: 2em 0;
    background-color: var(--border-color);
    border: 0;
  }

  // 代码高亮样式
  :deep(.hljs) {
    background: var(--bg-color);
    color: var(--text-primary);
  }
}
</style>