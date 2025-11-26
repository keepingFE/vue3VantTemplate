/**
 * 复制 PDF.js worker 文件到 public 目录
 * 用于本地加载 worker，避免 CDN 加载失败
 */

const fs = require('fs')
const path = require('path')

// 源文件路径 - PDF.js 2.x 使用 .js 扩展名（非压缩版）
const sourceFile = path.join(__dirname, '..', 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.js')

// 目标文件路径
const destFile = path.join(__dirname, '..', 'public', 'pdf.worker.js')

try {
  // 检查源文件是否存在
  if (!fs.existsSync(sourceFile)) {
    console.error('❌ 源文件不存在:', sourceFile)
    console.log('💡 请先安装依赖: npm install')
    process.exit(1)
  }

  // 确保 public 目录存在
  const publicDir = path.dirname(destFile)
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true })
  }

  // 复制文件
  fs.copyFileSync(sourceFile, destFile)
  console.log('✅ PDF.js worker 文件复制成功!')
  console.log('   源文件:', sourceFile)
  console.log('   目标文件:', destFile)

  // 获取文件大小
  const stats = fs.statSync(destFile)
  const fileSizeInKB = (stats.size / 1024).toFixed(2)
  console.log(`   文件大小: ${fileSizeInKB} KB`)
} catch (error) {
  console.error('❌ 复制文件失败:', error.message)
  process.exit(1)
}

