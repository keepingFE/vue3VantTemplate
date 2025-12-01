/**
 * 大文件上传后端实现示例 (Node.js + Express)
 * 
 * 安装依赖:
 * npm install express multer fs-extra
 */

const express = require('express')
const multer = require('multer')
const fs = require('fs-extra')
const path = require('path')

const app = express()
const upload = multer({ dest: 'uploads/temp/' })

// 存储路径配置
const UPLOAD_DIR = path.join(__dirname, 'uploads')
const TEMP_DIR = path.join(UPLOAD_DIR, 'temp')
const CHUNK_DIR = path.join(UPLOAD_DIR, 'chunks')
const FILE_DIR = path.join(UPLOAD_DIR, 'files')

// 确保目录存在
fs.ensureDirSync(TEMP_DIR)
fs.ensureDirSync(CHUNK_DIR)
fs.ensureDirSync(FILE_DIR)

app.use(express.json())

// 1. 检查文件接口
app.post('/api/upload/check', async (req, res) => {
  try {
    const { fileMD5, fileName, fileSize } = req.body

    // 检查文件是否已存在
    const filePath = path.join(FILE_DIR, fileMD5, fileName)
    const exists = await fs.pathExists(filePath)

    if (exists) {
      // 文件已存在，返回秒传
      return res.json({
        code: 200,
        data: {
          exists: true,
          url: `/files/${fileMD5}/${fileName}`,
          uploadedChunks: []
        },
        message: '文件已存在'
      })
    }

    // 检查已上传的分块
    const chunkDir = path.join(CHUNK_DIR, fileMD5)
    const uploadedChunks = []

    if (await fs.pathExists(chunkDir)) {
      const chunks = await fs.readdir(chunkDir)
      chunks.forEach(chunk => {
        const match = chunk.match(/^chunk-(\d+)$/)
        if (match) {
          uploadedChunks.push(parseInt(match[1]))
        }
      })
    }

    res.json({
      code: 200,
      data: {
        exists: false,
        uploadedChunks
      },
      message: '文件不存在'
    })
  } catch (error) {
    console.error('检查文件失败:', error)
    res.status(500).json({
      code: 500,
      data: null,
      message: error.message
    })
  }
})

// 2. 上传分片接口
app.post('/api/upload/chunk', upload.single('file'), async (req, res) => {
  try {
    const { fileMD5, fileName, chunkIndex, chunkMD5, totalChunks } = req.body
    const chunkFile = req.file

    if (!chunkFile || !fileMD5 || chunkIndex === undefined) {
      return res.status(400).json({
        code: 400,
        data: null,
        message: '参数错误'
      })
    }

    // 创建分块存储目录
    const chunkDir = path.join(CHUNK_DIR, fileMD5)
    await fs.ensureDir(chunkDir)

    // 移动分块文件
    const chunkPath = path.join(chunkDir, `chunk-${chunkIndex}`)
    await fs.move(chunkFile.path, chunkPath, { overwrite: true })

    // TODO: 可以在这里验证分块MD5
    // const actualMD5 = await calculateFileMD5(chunkPath)
    // if (actualMD5 !== chunkMD5) {
    //   throw new Error('分块MD5校验失败')
    // }

    res.json({
      code: 200,
      data: {
        chunkIndex: parseInt(chunkIndex),
        uploaded: true
      },
      message: `分块 ${chunkIndex} 上传成功`
    })
  } catch (error) {
    console.error('上传分块失败:', error)
    res.status(500).json({
      code: 500,
      data: null,
      message: error.message
    })
  }
})

// 3. 合并文件接口
app.post('/api/upload/merge', async (req, res) => {
  try {
    const { fileMD5, fileName, fileSize, totalChunks } = req.body

    if (!fileMD5 || !fileName || !totalChunks) {
      return res.status(400).json({
        code: 400,
        data: null,
        message: '参数错误'
      })
    }

    const chunkDir = path.join(CHUNK_DIR, fileMD5)
    const fileDir = path.join(FILE_DIR, fileMD5)
    const filePath = path.join(fileDir, fileName)

    // 检查所有分块是否都已上传
    const chunks = []
    for (let i = 0; i < totalChunks; i++) {
      const chunkPath = path.join(chunkDir, `chunk-${i}`)
      if (!await fs.pathExists(chunkPath)) {
        return res.status(400).json({
          code: 400,
          data: null,
          message: `分块 ${i} 不存在`
        })
      }
      chunks.push(chunkPath)
    }

    // 创建文件目录
    await fs.ensureDir(fileDir)

    // 合并文件
    const writeStream = fs.createWriteStream(filePath)
    
    for (let i = 0; i < chunks.length; i++) {
      const chunkPath = chunks[i]
      const chunkBuffer = await fs.readFile(chunkPath)
      writeStream.write(chunkBuffer)
    }

    writeStream.end()

    // 等待写入完成
    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve)
      writeStream.on('error', reject)
    })

    // 验证文件大小
    const stats = await fs.stat(filePath)
    if (stats.size !== parseInt(fileSize)) {
      console.warn(`文件大小不匹配: 预期=${fileSize}, 实际=${stats.size}`)
    }

    // TODO: 可以在这里验证文件MD5
    // const actualMD5 = await calculateFileMD5(filePath)
    // if (actualMD5 !== fileMD5) {
    //   throw new Error('文件MD5校验失败')
    // }

    // 删除分块文件
    await fs.remove(chunkDir)

    res.json({
      code: 200,
      data: {
        url: `/files/${fileMD5}/${fileName}`,
        fileName,
        fileSize: stats.size
      },
      message: '文件合并成功'
    })
  } catch (error) {
    console.error('合并文件失败:', error)
    res.status(500).json({
      code: 500,
      data: null,
      message: error.message
    })
  }
})

// 静态文件访问
app.use('/files', express.static(FILE_DIR))

// 启动服务器
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`)
  console.log(`上传目录: ${UPLOAD_DIR}`)
})

// MD5计算辅助函数 (可选)
const crypto = require('crypto')

async function calculateFileMD5(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('md5')
    const stream = fs.createReadStream(filePath)
    
    stream.on('data', chunk => hash.update(chunk))
    stream.on('end', () => resolve(hash.digest('hex')))
    stream.on('error', reject)
  })
}

module.exports = app
