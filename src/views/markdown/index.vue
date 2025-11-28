<template>
    <div class="markdown-demo-page">
        <van-nav-bar title="Markdown 预览" left-arrow fixed placeholder @click-left="handleBack" />

        <div class="content">
            <MarkdownRenderer :content="markdownContent" />
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import MarkdownRenderer from '@/components/common/MarkdownRenderer.vue'

const router = useRouter()

const handleBack = () => {
    router.back()
}

const markdownContent = ref(`
# Markdown 功能演示

这是一个 **MarkdownRenderer** 组件的全面演示。

## 1. 文本样式

支持 **加粗**、*斜体*、~~删除线~~ 以及 \`行内代码\`。

## 2. 列表展示

### 无序列表
- 项目 A
- 项目 B
  - 子项目 B-1
  - 子项目 B-2
- 项目 C

### 有序列表
1. 第一步
2. 第二步
3. 第三步

### 任务列表
- [x] 已完成任务
- [ ] 待办任务
- [ ] 进行中任务

## 3. 代码高亮

### JavaScript
\`\`\`javascript
// 这是一个问候函数
function sayHello(name) {
  console.log(\`Hello, \${name}!\`);
  return true;
}

sayHello('Vue 3');
\`\`\`

### CSS
\`\`\`css
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f2f5;
}
\`\`\`

## 4. 表格样式

| 左对齐 | 居中对齐 | 右对齐 |
| :--- | :---: | ---: |
| 单元格 1 | 单元格 2 | 单元格 3 |
| 内容 A | 内容 B | 内容 C |
| 文本 | 文本 | 文本 |

## 5. 引用

> 这是一个引用块。
> 它可以跨越多行。
>
> > 支持嵌套引用。

## 6. 链接与图片

### 超链接
访问 [Vue.js 官网](https://vuejs.org/) 或 [Vant UI](https://vant-ui.github.io/vant/)。

### 图片展示
![Vant Logo](https://fastly.jsdelivr.net/npm/@vant/assets/logo.png)

## 7. 分割线

---

以上是演示内容的结尾。
`)
</script>

<style lang="scss" scoped>
.markdown-demo-page {
    min-height: 100vh;
    background-color: var(--bg-color, #fff);

    .content {
        padding: 16px;
    }
}
</style>
