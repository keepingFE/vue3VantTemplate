<template>
  <div class="rich-text-demo">
    <van-nav-bar title="富文本编辑器示例" left-arrow @click-left="handleBack" />
    
    <div class="demo-container">
      <van-cell-group title="基础用法">
        <van-cell>
          <RichTextEditor 
            v-model="content1" 
            placeholder="请输入内容..." 
            @change="handleChange" 
          />
        </van-cell>
      </van-cell-group>
      
      <van-cell-group title="带字符计数">
        <van-cell>
          <RichTextEditor 
            v-model="content2" 
            :max-length="200" 
            :show-char-count="true" 
          />
        </van-cell>
      </van-cell-group>
      
      <van-cell-group title="只读模式">
        <van-cell>
          <RichTextEditor 
            v-model="content3" 
            :read-only="true" 
          />
        </van-cell>
      </van-cell-group>
      
      <van-cell-group title="自定义工具栏">
        <van-cell>
          <RichTextEditor 
            v-model="content4" 
            :options="customOptions" 
          />
        </van-cell>
      </van-cell-group>
      
      <van-cell-group title="内容预览">
        <van-cell>
          <div class="preview-content" v-html="content1"></div>
        </van-cell>
      </van-cell-group>
      
      <div class="action-buttons">
        <van-button type="primary" block @click="showContent">显示内容</van-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import RichTextEditor from '@/components/common/RichTextEditor.vue'

defineOptions({
  name: 'RichTextDemo'
})

const router = useRouter()

// 示例内容
const content1 = ref('<p>这是<strong>基础用法</strong>的示例内容</p>')
const content2 = ref('<p>这里限制了<em>200个字符</em></p>')
const content3 = ref('<p>这是<u>只读模式</u>的内容，无法编辑</p>')
const content4 = ref('<p>这是使用<em>自定义工具栏</em>的示例</p>')

// 自定义工具栏配置
const customOptions = {
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ]
  }
}

// 处理内容变化
const handleChange = ({ html, text }) => {
  console.log('内容变化:', { html, text })
}

// 显示内容
const showContent = () => {
  showToast(`内容长度: ${content1.value.length}`)
}

// 返回
const handleBack = () => {
  router.back()
}
</script>

<style lang="scss" scoped>
.rich-text-demo {
  min-height: 100vh;
  background-color: #f7f8fa;
  
  .demo-container {
    padding: 12px;
    
    .van-cell-group {
      margin-bottom: 16px;
    }
    
    .preview-content {
      padding: 12px;
      background-color: #fff;
      border-radius: 4px;
      min-height: 60px;
      
      :deep(p) {
        margin: 0 0 8px 0;
        
        &:last-child {
          margin-bottom: 0;
        }
      }
    }
    
    .action-buttons {
      margin-top: 24px;
      padding: 0 16px;
    }
  }
}
</style>