<template>
    <div class="upload-demo-page">
        <!-- 页面头部 -->
        <van-nav-bar title="大文件上传示例" left-arrow @click-left="onClickLeft" />

        <!-- 内容区域 -->
        <div class="demo-content">
            <!-- 功能说明 -->
            <div class="feature-card">
                <h3>功能特性</h3>
                <van-cell-group :border="false">
                    <van-cell title="✅ 分片上传" label="大文件自动分片，支持2MB每片" />
                    <van-cell title="✅ 断点续传" label="上传中断后可继续上传" />
                    <van-cell title="✅ 秒传功能" label="相同文件MD5秒传" />
                    <van-cell title="✅ 暂停/恢复" label="可随时暂停和恢复上传" />
                    <van-cell title="✅ 并发控制" label="支持3个分片并发上传" />
                    <van-cell title="✅ 进度显示" label="实时显示上传进度" />
                </van-cell-group>
            </div>

            <!-- 上传组件 -->
            <div class="upload-section">
                <h3>上传文件</h3>
                <LargeFileUpload ref="uploaderRef" :multiple="true" :max-size="1024" :chunk-size="2" :concurrent="3"
                    upload-text="选择大文件上传" upload-tip="支持断点续传、秒传，单文件最大1GB" accept="*" @success="handleSuccess"
                    @error="handleError" @progress="handleProgress" />
            </div>

            <!-- 统计信息 -->
            <div class="stats-card" v-if="stats.totalFiles > 0">
                <h3>上传统计</h3>
                <van-cell-group :border="false">
                    <van-cell title="总文件数" :value="stats.totalFiles" />
                    <van-cell title="成功上传" :value="stats.successFiles" value-class="success-text" />
                    <van-cell title="上传中" :value="stats.uploadingFiles" value-class="uploading-text" />
                    <van-cell title="失败" :value="stats.errorFiles" value-class="error-text" />
                </van-cell-group>
            </div>

            <!-- 使用说明 -->
            <div class="usage-card">
                <h3>使用说明</h3>
                <div class="usage-content">
                    <p><strong>1. 选择文件</strong></p>
                    <p>点击上传区域选择需要上传的大文件，支持多选。</p>

                    <p><strong>2. MD5计算</strong></p>
                    <p>系统会自动计算文件MD5值，用于秒传和文件校验。</p>

                    <p><strong>3. 分片上传</strong></p>
                    <p>文件会被分成2MB的小片段并发上传，提高上传速度。</p>

                    <p><strong>4. 暂停/恢复</strong></p>
                    <p>上传过程中可以随时暂停，下次继续上传会从断点处继续。</p>

                    <p><strong>5. 秒传</strong></p>
                    <p>如果服务器已存在相同MD5的文件，会直接返回，实现秒传。</p>
                </div>
            </div>

            <!-- API说明 -->
            <div class="api-card">
                <h3>API接口说明</h3>
                <div class="api-content">
                    <p><strong>需要后端实现以下接口：</strong></p>

                    <div class="api-item">
                        <div class="api-title">1. 检查文件接口</div>
                        <div class="api-detail">
                            <p>POST /api/upload/check</p>
                            <p>参数: { fileMD5, fileName, fileSize }</p>
                            <p>返回: { exists, uploadedChunks?, url? }</p>
                        </div>
                    </div>

                    <div class="api-item">
                        <div class="api-title">2. 上传分片接口</div>
                        <div class="api-detail">
                            <p>POST /api/upload/chunk</p>
                            <p>参数: FormData(file, fileMD5, fileName, chunkIndex, chunkMD5, totalChunks)</p>
                            <p>返回: { success }</p>
                        </div>
                    </div>

                    <div class="api-item">
                        <div class="api-title">3. 合并文件接口</div>
                        <div class="api-detail">
                            <p>POST /api/upload/merge</p>
                            <p>参数: { fileMD5, fileName, fileSize, totalChunks }</p>
                            <p>返回: { url, message }</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import LargeFileUpload from '@/components/common/LargeFileUpload.vue'

const router = useRouter()
const uploaderRef = ref(null)

// 返回上一页
const onClickLeft = () => {
    router.back()
}

// 统计信息
const stats = computed(() => {
    if (!uploaderRef.value?.fileList) {
        return {
            totalFiles: 0,
            successFiles: 0,
            uploadingFiles: 0,
            errorFiles: 0
        }
    }

    const fileList = uploaderRef.value.fileList
    return {
        totalFiles: fileList.length,
        successFiles: fileList.filter(f => f.status === 'success').length,
        uploadingFiles: fileList.filter(f => ['calculating', 'uploading'].includes(f.status)).length,
        errorFiles: fileList.filter(f => f.status === 'error').length
    }
})

// 上传成功
const handleSuccess = (fileItem, result) => {
    console.log('上传成功:', fileItem, result)
}

// 上传失败
const handleError = (fileItem, error) => {
    console.error('上传失败:', fileItem, error)
}

// 上传进度
const handleProgress = (fileItem, progress) => {
    console.log('上传进度:', fileItem.file.name, progress + '%')
}
</script>

<style lang="scss" scoped>
.upload-demo-page {
    min-height: 100vh;
    background: #f7f8fa;

    .demo-content {
        padding-bottom: 20px;

        h3 {
            font-size: 16px;
            font-weight: 600;
            color: #323233;
            margin: 0 0 12px 0;
            padding: 0 16px;
        }

        .feature-card,
        .upload-section,
        .stats-card,
        .usage-card,
        .api-card {
            margin: 16px 0;
            background: #fff;
            padding: 16px 0;
        }

        .upload-section {
            padding: 16px;
        }

        .stats-card {
            :deep(.success-text) {
                color: #07c160;
                font-weight: 500;
            }

            :deep(.uploading-text) {
                color: #1989fa;
                font-weight: 500;
            }

            :deep(.error-text) {
                color: #ee0a24;
                font-weight: 500;
            }
        }

        .usage-card,
        .api-card {

            .usage-content,
            .api-content {
                padding: 0 16px;
                font-size: 14px;
                line-height: 1.6;
                color: #646566;

                p {
                    margin: 8px 0;

                    strong {
                        color: #323233;
                        font-weight: 600;
                    }
                }
            }

            .api-item {
                margin: 16px 0;
                padding: 12px;
                background: #f7f8fa;
                border-radius: 8px;

                .api-title {
                    font-weight: 600;
                    color: #323233;
                    margin-bottom: 8px;
                }

                .api-detail {
                    p {
                        margin: 4px 0;
                        font-size: 13px;
                        font-family: 'Courier New', monospace;
                        color: #646566;
                    }
                }
            }
        }
    }
}
</style>
