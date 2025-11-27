<template>
  <div class="test-typing-container">
    <van-nav-bar
      title="打字机效果测试"
      left-text="返回"
      left-arrow
      @click-left="onClickLeft"
    />
    
    <div class="content">
      <h2>打字机效果演示</h2>
      <div class="typing-text">{{ displayText }}</div>
      <van-button type="primary" @click="startTyping">开始打字效果</van-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const displayText = ref('')
const fullText = '这是一个打字机效果的演示文本，用于测试文字逐字显示的效果。'
let typingTimer = null

const onClickLeft = () => {
  router.back()
}

const startTyping = () => {
  displayText.value = ''
  let index = 0
  
  if (typingTimer) {
    clearInterval(typingTimer)
  }
  
  typingTimer = setInterval(() => {
    if (index < fullText.length) {
      displayText.value += fullText[index]
      index++
    } else {
      clearInterval(typingTimer)
    }
  }, 100)
}
</script>

<style scoped>
.test-typing-container {
  padding: 0;
  min-height: 100vh;
  background-color: #f7f8fa;
}

.content {
  padding: 20px;
}

h2 {
  margin-bottom: 20px;
  text-align: center;
}

.typing-text {
  min-height: 60px;
  padding: 15px;
  background-color: #fff;
  border-radius: 8px;
  margin-bottom: 20px;
  line-height: 1.5;
}
</style>