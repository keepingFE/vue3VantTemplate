/**
 * 大文件上传 Mock 接口
 */

// 模拟存储已上传的文件信息
const uploadedFiles = new Map()
const uploadedChunks = new Map()

export default [
  {
    url: '/api/upload/check',
    method: 'post',
    timeout: 300,
    response: ({ body }) => {
      const { fileMD5, fileName, fileSize } = body

      // 检查文件是否已完全上传
      const fileInfo = uploadedFiles.get(fileMD5)
      if (fileInfo && fileInfo.completed) {
        return {
          code: 200,
          data: {
            exists: true,
            url: fileInfo.url,
            uploadedChunks: []
          },
          message: '文件已存在'
        }
      }

      // 检查已上传的分块
      const chunks = uploadedChunks.get(fileMD5) || []
      
      return {
        code: 200,
        data: {
          exists: false,
          uploadedChunks: chunks
        },
        message: '文件不存在'
      }
    }
  },
  {
    url: '/api/upload/chunk',
    method: 'post',
    timeout: 500,
    response: ({ body, query }) => {
      // 辅助函数：获取参数
      const getParam = (key) => {
        // 1. 尝试从 FormData 获取
        if (body && typeof body.get === 'function') {
          return body.get(key)
        }
        // 2. 尝试从普通对象获取
        if (body && body[key] !== undefined) {
          return body[key]
        }
        // 3. 尝试从 Query 获取
        if (query && query[key] !== undefined) {
          return query[key]
        }
        return undefined
      }

      const fileMD5 = getParam('fileMD5')
      const chunkIndex = parseInt(getParam('chunkIndex'))
      const fileName = getParam('fileName')
      const totalChunks = parseInt(getParam('totalChunks'))

      if (!fileMD5 || chunkIndex === undefined) {
        return {
          code: 400,
          data: null,
          message: '参数错误'
        }
      }

      // 记录已上传的分块
      if (!uploadedChunks.has(fileMD5)) {
        uploadedChunks.set(fileMD5, [])
      }
      
      const chunks = uploadedChunks.get(fileMD5)
      if (!chunks.includes(chunkIndex)) {
        chunks.push(chunkIndex)
      }

      // 模拟偶尔失败（10%概率）
      if (Math.random() < 0.05) {
        return {
          code: 500,
          data: null,
          message: `分块 ${chunkIndex} 上传失败`
        }
      }

      return {
        code: 200,
        data: {
          chunkIndex,
          uploaded: true
        },
        message: `分块 ${chunkIndex} 上传成功`
      }
    }
  },
  {
    url: '/api/upload/merge',
    method: 'post',
    timeout: 1000,
    response: ({ body }) => {
      const { fileMD5, fileName, fileSize, totalChunks } = body

      if (!fileMD5 || !fileName) {
        return {
          code: 400,
          data: null,
          message: '参数错误'
        }
      }

      // 检查所有分块是否都已上传
      const chunks = uploadedChunks.get(fileMD5) || []
      if (chunks.length !== totalChunks) {
        return {
          code: 400,
          data: null,
          message: `分块不完整，已上传 ${chunks.length}/${totalChunks}`
        }
      }

      // 生成文件URL
      const fileUrl = `https://cdn.example.com/files/${fileMD5}/${fileName}`

      // 保存文件信息
      uploadedFiles.set(fileMD5, {
        fileName,
        fileSize,
        url: fileUrl,
        completed: true,
        uploadTime: new Date().toISOString()
      })

      // 清除分块记录（可选）
      // uploadedChunks.delete(fileMD5)

      return {
        code: 200,
        data: {
          url: fileUrl,
          fileName,
          fileSize
        },
        message: '文件合并成功'
      }
    }
  }
]
