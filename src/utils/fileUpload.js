import axios from 'axios'
import { calculateChunkMD5 } from './fileMd5'

/**
 * 大文件上传类
 */
export class LargeFileUploader {
  constructor(options = {}) {
    this.file = options.file // 文件对象
    this.fileMD5 = options.fileMD5 // 文件MD5值
    this.chunkSize = options.chunkSize || 2 * 1024 * 1024 // 默认2MB
    this.uploadUrl = options.uploadUrl || '/api/upload/chunk' // 上传接口
    this.mergeUrl = options.mergeUrl || '/api/upload/merge' // 合并接口
    this.checkUrl = options.checkUrl || '/api/upload/check' // 检查接口
    this.concurrent = options.concurrent || 3 // 并发数
    this.onProgress = options.onProgress || (() => {}) // 进度回调
    this.onSuccess = options.onSuccess || (() => {}) // 成功回调
    this.onError = options.onError || (() => {}) // 失败回调
    
    this.chunks = [] // 文件分块数组
    this.uploadedChunks = new Set() // 已上传的块
    this.uploading = false // 上传状态
    this.paused = false // 暂停状态
    this.abortControllers = [] // 取消控制器
  }

  /**
   * 创建文件分块
   */
  createFileChunks() {
    const chunks = []
    const chunkCount = Math.ceil(this.file.size / this.chunkSize)

    for (let i = 0; i < chunkCount; i++) {
      const start = i * this.chunkSize
      const end = Math.min(start + this.chunkSize, this.file.size)
      chunks.push({
        index: i,
        chunk: this.file.slice(start, end),
        start,
        end,
        uploaded: false
      })
    }

    this.chunks = chunks
    return chunks
  }

  /**
   * 检查文件是否已上传（秒传）
   */
  async checkFileExists() {
    try {
      const response = await axios.post(this.checkUrl, {
        fileMD5: this.fileMD5,
        fileName: this.file.name,
        fileSize: this.file.size
      })

      // 兼容不同的响应格式
      const data = response.data.data || response.data

      if (data.exists) {
        return {
          exists: true,
          uploadedChunks: data.uploadedChunks || [],
          url: data.url
        }
      }

      return {
        exists: false,
        uploadedChunks: data.uploadedChunks || []
      }
    } catch (error) {
      console.error('检查文件失败:', error)
      return { exists: false, uploadedChunks: [] }
    }
  }

  /**
   * 上传单个分块
   */
  async uploadChunk(chunkData) {
    const { index, chunk } = chunkData
    const formData = new FormData()
    
    // 计算分块MD5
    const chunkMD5 = await calculateChunkMD5(chunk)

    formData.append('file', chunk)
    formData.append('fileMD5', this.fileMD5)
    formData.append('fileName', this.file.name)
    formData.append('chunkIndex', index)
    formData.append('chunkMD5', chunkMD5)
    formData.append('totalChunks', this.chunks.length)

    const controller = new AbortController()
    this.abortControllers.push(controller)

    try {
      // 将参数同时也拼接到 URL 中，方便 Mock 接口获取（兜底方案）
      const queryParams = `?fileMD5=${this.fileMD5}&chunkIndex=${index}&totalChunks=${this.chunks.length}`
      
      await axios.post(this.uploadUrl + queryParams, formData, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          // 这里可以记录每个分块的上传进度
        }
      })

      this.uploadedChunks.add(index)
      chunkData.uploaded = true
      this.updateProgress()
      
      return { success: true, index }
    } catch (error) {
      if (error.name === 'CanceledError') {
        console.log(`分块 ${index} 上传已取消`)
      } else {
        console.error(`分块 ${index} 上传失败:`, error)
      }
      return { success: false, index, error }
    }
  }

  /**
   * 更新总体进度
   */
  updateProgress() {
    const progress = Math.floor((this.uploadedChunks.size / this.chunks.length) * 100)
    this.onProgress(progress, this.uploadedChunks.size, this.chunks.length)
  }

  /**
   * 并发上传所有分块
   */
  async uploadAllChunks() {
    const pendingChunks = this.chunks.filter(
      chunk => !this.uploadedChunks.has(chunk.index)
    )

    const uploadQueue = [...pendingChunks]
    const executing = []

    while (uploadQueue.length > 0 || executing.length > 0) {
      // 检查是否暂停
      if (this.paused) {
        await new Promise(resolve => {
          const checkPause = setInterval(() => {
            if (!this.paused) {
              clearInterval(checkPause)
              resolve()
            }
          }, 100)
        })
      }

      // 控制并发数
      while (executing.length < this.concurrent && uploadQueue.length > 0) {
        const chunk = uploadQueue.shift()
        const promise = this.uploadChunk(chunk).then(
          result => {
            executing.splice(executing.indexOf(promise), 1)
            return result
          }
        )
        executing.push(promise)
      }

      if (executing.length > 0) {
        await Promise.race(executing)
      }
    }

    // 等待所有上传完成
    if (executing.length > 0) {
      await Promise.all(executing)
    }
  }

  /**
   * 合并文件分块
   */
  async mergeChunks() {
    try {
      const response = await axios.post(this.mergeUrl, {
        fileMD5: this.fileMD5,
        fileName: this.file.name,
        fileSize: this.file.size,
        totalChunks: this.chunks.length
      })

      // 兼容不同的响应格式
      return response.data.data || response.data
    } catch (error) {
      console.error('合并文件失败:', error)
      throw error
    }
  }

  /**
   * 开始上传
   */
  async start() {
    try {
      this.uploading = true
      this.paused = false

      // 创建分块
      this.createFileChunks()

      // 检查文件是否已上传
      const checkResult = await this.checkFileExists()
      
      // 如果文件已存在（秒传）
      if (checkResult.exists) {
        this.onProgress(100, this.chunks.length, this.chunks.length)
        this.onSuccess({
          url: checkResult.url,
          message: '文件秒传成功'
        })
        return
      }

      // 标记已上传的分块
      if (checkResult.uploadedChunks && checkResult.uploadedChunks.length > 0) {
        checkResult.uploadedChunks.forEach(index => {
          this.uploadedChunks.add(index)
          if (this.chunks[index]) {
            this.chunks[index].uploaded = true
          }
        })
        this.updateProgress()
      }

      // 上传所有分块
      await this.uploadAllChunks()

      // 检查是否所有分块都上传成功
      if (this.uploadedChunks.size !== this.chunks.length) {
        throw new Error('部分分块上传失败')
      }

      // 合并文件
      const mergeResult = await this.mergeChunks()

      this.uploading = false
      this.onSuccess(mergeResult)
    } catch (error) {
      this.uploading = false
      this.onError(error)
    }
  }

  /**
   * 暂停上传
   */
  pause() {
    this.paused = true
    // 取消所有正在进行的请求
    this.abortControllers.forEach(controller => {
      controller.abort()
    })
    this.abortControllers = []
  }

  /**
   * 恢复上传
   */
  resume() {
    if (this.uploading && this.paused) {
      this.paused = false
    }
  }

  /**
   * 取消上传
   */
  cancel() {
    this.uploading = false
    this.paused = false
    // 取消所有正在进行的请求
    this.abortControllers.forEach(controller => {
      controller.abort()
    })
    this.abortControllers = []
  }

  /**
   * 重试上传失败的分块
   */
  async retryFailed() {
    if (this.uploading) {
      return
    }
    await this.start()
  }
}
