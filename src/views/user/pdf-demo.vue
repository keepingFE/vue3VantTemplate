<template>
  <div class="pdf-demo-page">
    <van-nav-bar title="PDF预览" left-text="返回" left-arrow @click-left="$router.go(-1)" />

    <div class="demo-content">
      <van-cell-group inset>
        <van-field v-model="pdfUrl" label="PDF地址" placeholder="请输入PDF地址" />
        <van-cell>
          <van-button type="primary" block @click="previewPdf">预览PDF</van-button>
        </van-cell>
      </van-cell-group>
    </div>
    <!-- PDF预览弹窗 -->
    <van-popup v-model:show="showPdfPreview" position="right" :style="{ width: '100%', height: '100%' }">
      <PdfPreview :src="currentPdfUrl" :title="pdfTitle" @back="closePdfPreview" />
    </van-popup>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import PdfPreview from '@/components/common/PdfView'

const pdfUrl = ref('/test.pdf')
const showPdfPreview = ref(false)
const currentPdfUrl = ref('')
const pdfTitle = ref('PDF预览')

// 预览PDF
const previewPdf = () => {
  if (!pdfUrl.value) {
    return
  }
  currentPdfUrl.value = pdfUrl.value
  pdfTitle.value = 'PDF预览'
  showPdfPreview.value = true
}

// 加载本地PDF
const loadLocalPdf = () => {
  // 本地PDF文件放在public目录下
  currentPdfUrl.value = '/test.pdf'
  pdfTitle.value = '本地PDF'
  showPdfPreview.value = true
}

// 关闭PDF预览
const closePdfPreview = () => {
  showPdfPreview.value = false
}
</script>

<style scoped>
.pdf-demo-page {
  height: 100vh;
  background-color: #f7f8fa;
}

.demo-content {
  padding: 16px 0;
}
</style>
