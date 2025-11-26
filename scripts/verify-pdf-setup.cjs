/**
 * 验证 PDF.js 本地配置是否正确
 */

const fs = require('fs')
const path = require('path')

console.log('🔍 验证 PDF.js 本地配置...\n')

let hasError = false

// 1. 检查 worker 文件
const workerFile = path.join(__dirname, '..', 'public', 'pdf.worker.min.mjs')
if (fs.existsSync(workerFile)) {
  const stats = fs.statSync(workerFile)
  const fileSizeInKB = (stats.size / 1024).toFixed(2)
  console.log('✅ Worker 文件存在')
  console.log(`   路径: ${workerFile}`)
  console.log(`   大小: ${fileSizeInKB} KB`)
} else {
  console.log('❌ Worker 文件不存在')
  console.log(`   期望路径: ${workerFile}`)
  console.log('   请运行: node scripts/copy-pdf-worker.cjs')
  hasError = true
}

console.log()

// 2. 检查组件配置
const componentFile = path.join(__dirname, '..', 'src', 'components', 'common', 'PdfPreview.vue')
if (fs.existsSync(componentFile)) {
  const content = fs.readFileSync(componentFile, 'utf-8')
  
  // 检查是否使用本地 worker
  if (content.includes("workerSrc = '/pdf.worker.min.mjs'")) {
    console.log('✅ 组件配置正确（使用本地 worker）')
  } else if (content.includes('cdnjs.cloudflare.com')) {
    console.log('⚠️  组件仍在使用 CDN worker')
    console.log('   建议修改为本地加载')
    hasError = true
  } else {
    console.log('⚠️  无法确定 worker 配置')
  }
} else {
  console.log('❌ 组件文件不存在')
  console.log(`   期望路径: ${componentFile}`)
  hasError = true
}

console.log()

// 3. 检查 package.json
const packageFile = path.join(__dirname, '..', 'package.json')
if (fs.existsSync(packageFile)) {
  const packageJson = JSON.parse(fs.readFileSync(packageFile, 'utf-8'))
  
  if (packageJson.scripts && packageJson.scripts.postinstall) {
    console.log('✅ postinstall 钩子已配置')
    console.log(`   命令: ${packageJson.scripts.postinstall}`)
  } else {
    console.log('⚠️  未配置 postinstall 钩子')
    console.log('   建议添加自动复制脚本')
  }
  
  if (packageJson.dependencies && packageJson.dependencies['pdfjs-dist']) {
    console.log('✅ pdfjs-dist 已安装')
    console.log(`   版本: ${packageJson.dependencies['pdfjs-dist']}`)
  } else {
    console.log('❌ pdfjs-dist 未安装')
    hasError = true
  }
} else {
  console.log('❌ package.json 不存在')
  hasError = true
}

console.log()

// 4. 检查测试 PDF 文件
const testPdfFile = path.join(__dirname, '..', 'public', 'test.pdf')
if (fs.existsSync(testPdfFile)) {
  const stats = fs.statSync(testPdfFile)
  const fileSizeInKB = (stats.size / 1024).toFixed(2)
  console.log('✅ 测试 PDF 文件存在')
  console.log(`   路径: ${testPdfFile}`)
  console.log(`   大小: ${fileSizeInKB} KB`)
} else {
  console.log('⚠️  测试 PDF 文件不存在')
  console.log(`   期望路径: ${testPdfFile}`)
  console.log('   可以添加一个测试 PDF 文件用于测试')
}

console.log()
console.log('━'.repeat(50))

if (hasError) {
  console.log('❌ 验证失败，请修复上述问题')
  process.exit(1)
} else {
  console.log('✅ 所有检查通过！PDF.js 本地配置正确')
  console.log('\n📝 下一步：')
  console.log('   1. 启动开发服务器: npm run dev')
  console.log('   2. 访问 PDF 预览页面测试')
  console.log('   3. 检查浏览器控制台是否有错误')
}

