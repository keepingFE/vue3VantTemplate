<template>
    <div class="large-file-upload">
        <!-- 上传触发按钮 -->
        <div class="upload-trigger" @click="triggerUpload" v-if="!fileList.length">
            <van-icon name="plus" class="upload-icon" />
            <div class="upload-text">{{ uploadText }}</div>
            <div class="upload-tip">{{ uploadTip }}</div>
        </div>

        <!-- 文件选择 -->
        <input ref="fileInput" type="file" :accept="accept" :multiple="multiple" @change="handleFileChange"
            style="display: none" />

        <!-- 文件列表 -->
        <div class="file-list" v-if="fileList.length">
            <div class="file-item" v-for="(item, index) in fileList" :key="item.id">
                <!-- 文件信息 -->
                <div class="file-info">
                    <van-icon :name="getFileIcon(item.file)" class="file-icon" />
                    <div class="file-details">
                        <div class="file-name">{{ item.file.name }}</div>
                        <div class="file-size">{{ formatFileSize(item.file.size) }}</div>
                    </div>
                </div>

                <!-- MD5计算进度 -->
                <div class="md5-progress" v-if="item.status === 'calculating'">
                    <van-progress :percentage="item.md5Progress" stroke-width="4" color="#1989fa" />
                    <div class="progress-text">计算MD5中... {{ item.md5Progress }}%</div>
                </div>

                <!-- 上传进度 -->
                <div class="upload-progress" v-if="item.status === 'uploading' || item.status === 'paused'"></div>
                <van-progress :percentage="item.uploadProgress" stroke-width="4"
                    :color="item.status === 'paused' ? '#ff976a' : '#1989fa'" />
                <div class="progress-info">
                    <span class="progress-text">
                        {{ item.status === 'paused' ? '已暂停' : '上传中' }}
                        {{ item.uploadProgress }}%
                    </span>
                    <span class="chunk-info">
                        {{ item.uploadedChunks }}/{{ item.totalChunks }} 块
                    </span>
                </div>
            </div>

            <!-- 成功状态 -->
            <div class="upload-success" v-if="item.status === 'success'">
                <van-icon name="success" color="#07c160" />
                <span class="success-text">上传成功</span>
            </div>

            <!-- 失败状态 -->
            <div class="upload-error" v-if="item.status === 'error'">
                <van-icon name="close" color="#ee0a24" />
                <span class="error-text">上传失败: {{ item.errorMsg }}</span>
            </div>

            <!-- 操作按钮 -->
            <div class="file-actions">
                <!-- 暂停 -->
                <van-button v-if="item.status === 'uploading'" size="small" type="warning" @click="pauseUpload(item)">
                    暂停
                </van-button>

                <!-- 继续 -->
                <van-button v-if="item.status === 'paused'" size="small" type="primary" @click="resumeUpload(item)">
                    继续
                </van-button>

                <!-- 重试 -->
                <van-button v-if="item.status === 'error'" size="small" type="primary" @click="retryUpload(item)">
                    重试
                </van-button>

                <!-- 删除 -->
                <van-button v-if="['success', 'error', 'paused'].includes(item.status)" size="small" type="danger"
                    @click="removeFile(index)">
                    删除
                </van-button>

                <!-- 预览 -->
                <van-button v-if="item.status === 'success' && item.url && isImage(item.file)" size="small"
                    @click="previewFile(item)">
                    预览
                </van-button>
            </div>
        </div>

        <!-- 添加更多文件 -->
        <div class="add-more" @click="triggerUpload" v-if="multiple">
            <van-icon name="plus" />
            <span>添加文件</span>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onUnmounted } from 'vue'
import { showToast, showDialog, showImagePreview } from 'vant'
import { calculateFileMD5 } from '@/utils/fileMd5'
import { LargeFileUploader } from '@/utils/fileUpload'

const props = defineProps({
    // 上传按钮文字
    uploadText: {
        type: String,
        default: '上传大文件'
    },
    // 上传提示文字
    uploadTip: {
        type: String,
        default: '支持断点续传、秒传'
    },
    // 接受的文件类型
    accept: {
        type: String,
        default: '*'
    },
    // 是否支持多选
    multiple: {
        type: Boolean,
        default: false
    },
    // 文件大小限制（MB）
    maxSize: {
        type: Number,
        default: 1024 // 默认1GB
    },
    // 分片大小（MB）
    chunkSize: {
        type: Number,
        default: 2 // 默认2MB
    },
    // 并发数
    concurrent: {
        type: Number,
        default: 3
    },
    // 上传接口
    uploadUrl: {
        type: String,
        default: '/api/upload/chunk'
    },
    // 合并接口
    mergeUrl: {
        type: String,
        default: '/api/upload/merge'
    },
    // 检查接口
    checkUrl: {
        type: String,
        default: '/api/upload/check'
    }
})

const emit = defineEmits(['success', 'error', 'progress'])

const fileInput = ref(null)
const fileList = ref([])
let fileIdCounter = 0

// 触发文件选择
const triggerUpload = () => {
    fileInput.value?.click()
}

// 检查是否存在相同MD5的文件（精确判断重复）
const findDuplicateByMD5 = (md5) => {
    return fileList.value.find(item => item.fileMD5 === md5 && item.status !== 'error')
}

// 处理文件选择
const handleFileChange = async (event) => {
    const files = Array.from(event.target.files)

    for (const file of files) {
        // 验证文件大小
        if (file.size > props.maxSize * 1024 * 1024) {
            showToast(`文件 ${file.name} 超过大小限制 ${props.maxSize}MB`)
            continue
        }

        // 创建文件项
        const fileItem = {
            id: ++fileIdCounter,
            file,
            status: 'calculating', // calculating, uploading, paused, success, error
            md5Progress: 0,
            uploadProgress: 0,
            uploadedChunks: 0,
            totalChunks: 0,
            fileMD5: '',
            uploader: null,
            errorMsg: '',
            url: ''
        }

        fileList.value.push(fileItem)

        // 获取响应式对象（关键修复）
        const reactiveFileItem = fileList.value[fileList.value.length - 1]

        // 开始上传流程
        await startUploadProcess(reactiveFileItem)
    }

    // 清空input
    event.target.value = ''
}

// 开始上传流程
const startUploadProcess = async (fileItem) => {
    try {
        // 1. 计算文件MD5
        fileItem.status = 'calculating'
        fileItem.fileMD5 = await calculateFileMD5(fileItem.file, (progress) => {
            fileItem.md5Progress = progress
        })

        // 2. 检查是否存在相同MD5的文件（精确判断重复）
        const duplicateFile = findDuplicateByMD5(fileItem.fileMD5)
        if (duplicateFile && duplicateFile.id !== fileItem.id) {
            // 移除当前文件项
            const index = fileList.value.findIndex(f => f.id === fileItem.id)
            if (index > -1) {
                fileList.value.splice(index, 1)
            }
            showToast(`文件内容与 "${duplicateFile.file.name}" 相同，已自动去重`)
            return
        }

        // 4. 创建上传器
        const uploader = new LargeFileUploader({
            file: fileItem.file,
            fileMD5: fileItem.fileMD5,
            chunkSize: props.chunkSize * 1024 * 1024,
            uploadUrl: props.uploadUrl,
            mergeUrl: props.mergeUrl,
            checkUrl: props.checkUrl,
            concurrent: props.concurrent,
            onProgress: (progress, uploadedChunks, totalChunks) => {
                fileItem.uploadProgress = progress
                fileItem.uploadedChunks = uploadedChunks
                fileItem.totalChunks = totalChunks
                emit('progress', fileItem, progress)
            },
            onSuccess: (result) => {
                fileItem.status = 'success'
                fileItem.url = result.url
                showToast({
                    message: result.message || '上传成功',
                    icon: 'success'
                })
                emit('success', fileItem, result)
            },
            onError: (error) => {
                fileItem.status = 'error'
                fileItem.errorMsg = error.message || '上传失败'
                showToast({
                    message: fileItem.errorMsg,
                    icon: 'fail'
                })
                emit('error', fileItem, error)
            }
        })

        fileItem.uploader = uploader
        fileItem.status = 'uploading'

        // 5. 开始上传
        await uploader.start()
    } catch (error) {
        fileItem.status = 'error'
        fileItem.errorMsg = error.message || 'MD5计算失败'
        showToast({
            message: fileItem.errorMsg,
            icon: 'fail'
        })
    }
}

// 暂停上传
const pauseUpload = (fileItem) => {
    if (fileItem.uploader) {
        fileItem.uploader.pause()
        fileItem.status = 'paused'
        showToast('已暂停上传')
    }
}

// 恢复上传
const resumeUpload = async (fileItem) => {
    if (fileItem.uploader) {
        fileItem.uploader.resume()
        showToast('继续上传')

        // 重新启动上传流程（从断点处继续）
        try {
            await fileItem.uploader.start()
            // 上传开始成功后再更新状态，避免状态闪烁
            if (fileItem.status !== 'success' && fileItem.status !== 'error') {
                fileItem.status = 'uploading'
            }
        } catch (error) {
            fileItem.status = 'error'
            fileItem.errorMsg = error.message || '上传失败'
            showToast({
                message: fileItem.errorMsg,
                icon: 'fail'
            })
        }
    }
}

// 重试上传
const retryUpload = async (fileItem) => {
    // 如果已经有MD5值，不需要重新计算
    if (fileItem.fileMD5 && fileItem.uploader) {
        fileItem.status = 'uploading'
        fileItem.errorMsg = ''
        try {
            await fileItem.uploader.start()
        } catch (error) {
            fileItem.status = 'error'
            fileItem.errorMsg = error.message || '上传失败'
            showToast({
                message: fileItem.errorMsg,
                icon: 'fail'
            })
        }
    } else {
        // 如果没有MD5值，重新开始整个流程
        await startUploadProcess(fileItem)
    }
}

// 删除文件
const removeFile = (index) => {
    const fileItem = fileList.value[index]
    const fileId = fileItem.id // 先保存文件ID，避免异步操作时index变化

    showDialog({
        title: '提示',
        message: '确定删除该文件吗？',
    }).then(() => {
        // 通过ID查找当前索引，确保删除正确的文件
        const currentIndex = fileList.value.findIndex(f => f.id === fileId)
        if (currentIndex > -1) {
            const item = fileList.value[currentIndex]
            if (item.uploader) {
                item.uploader.cancel()
            }
            fileList.value.splice(currentIndex, 1)
        }
    }).catch(() => {
        // 取消删除
    })
}

// 判断是否为图片
const isImage = (file) => {
    if (!file) return false
    // 优先使用 mime type
    if (file.type && file.type.startsWith('image/')) return true
    // 降级使用扩展名
    const ext = file.name.split('.').pop().toLowerCase()
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)
}

// 预览文件
const previewFile = (fileItem) => {
    if (fileItem.file && isImage(fileItem.file)) {
        // 使用本地预览，体验更好且无需依赖后端返回的URL是否可访问
        const blobUrl = URL.createObjectURL(fileItem.file)
        showImagePreview({
            images: [blobUrl],
            onClose: () => URL.revokeObjectURL(blobUrl) // 关闭时释放内存，避免内存泄漏
        })
    } else if (fileItem.url) {
        showImagePreview([fileItem.url])
    }
}

// 获取文件图标
const getFileIcon = (file) => {
    const ext = file.name.split('.').pop().toLowerCase()
    const iconMap = {
        // 视频
        mp4: 'video-o',
        avi: 'video-o',
        mov: 'video-o',
        // 图片
        jpg: 'photo-o',
        jpeg: 'photo-o',
        png: 'photo-o',
        gif: 'photo-o',
        // 文档
        pdf: 'notes-o',
        doc: 'notes-o',
        docx: 'notes-o',
        xls: 'notes-o',
        xlsx: 'notes-o',
        // 压缩包
        zip: 'bag-o',
        rar: 'bag-o',
        '7z': 'bag-o',
        // 默认
        default: 'description'
    }
    return iconMap[ext] || iconMap.default
}

// 格式化文件大小
const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i]
}

// 组件卸载时清理所有上传任务，避免内存泄漏和后台请求继续发送
onUnmounted(() => {
    fileList.value.forEach(item => {
        if (item.uploader) {
            item.uploader.cancel()
        }
    })
})

// 暴露方法给父组件
defineExpose({
    triggerUpload,
    fileList
})
</script>

<style lang="scss" scoped>
.large-file-upload {
    padding: 16px;

    .upload-trigger {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 200px;
        border: 2px dashed #dcdee0;
        border-radius: 8px;
        background: #f7f8fa;
        cursor: pointer;
        transition: all 0.3s;

        &:active {
            background: #ebedf0;
            border-color: #c8c9cc;
        }

        .upload-icon {
            font-size: 48px;
            color: #969799;
            margin-bottom: 12px;
        }

        .upload-text {
            font-size: 16px;
            color: #323233;
            margin-bottom: 8px;
            font-weight: 500;
        }

        .upload-tip {
            font-size: 12px;
            color: #969799;
        }
    }

    .file-list {
        .file-item {
            background: #fff;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

            .file-info {
                display: flex;
                align-items: center;
                margin-bottom: 12px;

                .file-icon {
                    font-size: 40px;
                    color: #1989fa;
                    margin-right: 12px;
                }

                .file-details {
                    flex: 1;
                    min-width: 0;

                    .file-name {
                        font-size: 14px;
                        color: #323233;
                        font-weight: 500;
                        margin-bottom: 4px;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }

                    .file-size {
                        font-size: 12px;
                        color: #969799;
                    }
                }
            }

            .md5-progress,
            .upload-progress {
                margin-bottom: 12px;

                .progress-text {
                    font-size: 12px;
                    color: #969799;
                    margin-top: 4px;
                }

                .progress-info {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 4px;

                    .progress-text,
                    .chunk-info {
                        font-size: 12px;
                        color: #969799;
                    }
                }
            }

            .upload-success,
            .upload-error {
                display: flex;
                align-items: center;
                margin-bottom: 12px;
                font-size: 14px;

                .van-icon {
                    margin-right: 8px;
                }
            }

            .file-actions {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;

                .van-button {
                    flex: 1;
                    min-width: 70px;
                }
            }
        }

        .add-more {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 16px;
            border: 1px dashed #dcdee0;
            border-radius: 8px;
            color: #969799;
            cursor: pointer;
            transition: all 0.3s;

            &:active {
                background: #f7f8fa;
            }

            .van-icon {
                margin-right: 8px;
            }

            span {
                font-size: 14px;
            }
        }
    }
}
</style>
