<template>
    <div class="upload-preview">
        <!-- Image Grid -->
        <div class="preview-grid">
            <div v-for="(image, index) in images" :key="index" class="preview-item image-preview" @click="handleImagePreview(index)">
                <img :src="image.url" :alt="image.name" />
                <div class="delete-btn" @click.stop="$emit('remove-image', index)">
                    <van-icon name="cross" size="8" color="#fff" />
                </div>
            </div>

            <!-- Add Button -->
            <div class="preview-item add-btn" @click="$emit('add')">
                <van-icon name="plus" size="24" color="#9aa0b5" />
            </div>
        </div>

        <!-- File List -->
        <div class="file-list" v-if="files.length > 0">
            <div v-for="(file, index) in files" :key="index" class="file-item">
                <div class="file-icon">
                    <span class="file-tag">
                        {{ getFileExtension(file.name) }}
                    </span>
                </div>
                <span class="file-name">
                    {{ file.name }}
                </span>
                <div class="delete-btn-file" @click.stop="$emit('remove-file', index)">
                    <van-icon name="cross" size="10" color="#999" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { showImagePreview } from 'vant'

const props = defineProps({
    images: {
        type: Array,
        default: () => []
    },
    files: {
        type: Array,
        default: () => []
    }
})

defineEmits(['remove-image', 'remove-file', 'add'])

const getFileExtension = (filename) => {
    return filename.split('.').pop().toUpperCase().slice(0, 4)
}

const handleImagePreview = (index) => {
    showImagePreview({
        images: props.images.map(img => img.url),
        startPosition: index,
        closeable: true
    })
}
</script>

<style lang="scss" scoped>
.upload-preview {
    width: fit-content;
    margin: 0 auto;
    width: 100%;

    .preview-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 8px;
        justify-content: flex-start;
    }

    .preview-item {
        width: 60px;
        height: 60px;
        border-radius: 8px;
        position: relative;
        flex-shrink: 0;
        
        &.image-preview {
            overflow: hidden;
            
            img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            .delete-btn {
                position: absolute;
                top: 2px;
                right: 2px;
                width: 16px;
                height: 16px;
                background: rgba(0, 0, 0, 0.6);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                z-index: 1;
            }
        }

        &.add-btn {
            border: 1px dashed #dcdfe6;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            background: #f8f9fa;
            border-radius: 8px;

            &:active {
                background: #f0f0f0;
            }
        }
    }

    .file-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        
        .file-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 4px 0;
            position: relative;

            .file-icon {
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #fff;
                border: 1px dashed #dcdfe6;
                border-radius: 4px;
                flex-shrink: 0;
                
                .file-tag {
                    font-size: 10px;
                    font-weight: bold;
                    color: #1989fa;
                    text-align: center;
                }
            }

            .file-name {
                font-size: 14px;
                color: #323233;
                flex: 1;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                margin-right: 24px;
            }

            .delete-btn-file {
                position: absolute;
                right: 0;
                top: 50%;
                transform: translateY(-50%);
                padding: 4px;
                cursor: pointer;
            }
        }
    }
}
</style>
