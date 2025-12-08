<template>
    <div class="video-player-container">
        <video ref="videoRef" class="video-js vjs-big-play-centered" :poster="poster">
            <source v-if="src" :src="src" :type="type" />
            <p class="vjs-no-js">
                您的浏览器不支持视频播放，请升级浏览器
            </p>
        </video>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'

const props = defineProps({
    // 视频地址
    src: {
        type: String,
        default: ''
    },
    // 视频类型
    type: {
        type: String,
        default: 'video/mp4'
    },
    // 封面图
    poster: {
        type: String,
        default: ''
    },
    // 宽度
    width: {
        type: [String, Number],
        default: '100%'
    },
    // 高度
    height: {
        type: [String, Number],
        default: 'auto'
    },
    // 是否自动播放
    autoplay: {
        type: Boolean,
        default: false
    },
    // 是否显示控制栏
    controls: {
        type: Boolean,
        default: true
    },
    // 是否循环播放
    loop: {
        type: Boolean,
        default: false
    },
    // 是否静音
    muted: {
        type: Boolean,
        default: false
    },
    // 预加载模式: auto | metadata | none
    preload: {
        type: String,
        default: 'auto'
    },
    // 播放速率选项
    playbackRates: {
        type: Array,
        default: () => [0.5, 1, 1.5, 2]
    },
    // 是否支持画中画
    pip: {
        type: Boolean,
        default: true
    }
})

const emit = defineEmits(['ready', 'play', 'pause', 'ended', 'timeupdate', 'error'])

const videoRef = ref(null)
let player = null

// 初始化播放器
const initPlayer = () => {
    if (!videoRef.value) return

    const options = {
        autoplay: props.autoplay,
        controls: props.controls,
        loop: props.loop,
        muted: props.muted,
        preload: props.preload,
        playbackRates: props.playbackRates,
        fluid: props.width === '100%',
        responsive: true,
        language: 'zh-CN',
        controlBar: {
            pictureInPictureToggle: props.pip
        }
    }

    if (props.width !== '100%') {
        options.width = typeof props.width === 'number' ? props.width : parseInt(props.width)
    }
    if (props.height !== 'auto') {
        options.height = typeof props.height === 'number' ? props.height : parseInt(props.height)
    }

    player = videojs(videoRef.value, options, function () {
        emit('ready', this)
    })

    // 绑定事件
    player.on('play', () => emit('play', player))
    player.on('pause', () => emit('pause', player))
    player.on('ended', () => emit('ended', player))
    player.on('timeupdate', () => emit('timeupdate', { currentTime: player.currentTime(), duration: player.duration() }))
    player.on('error', () => emit('error', player.error()))
}

// 暴露方法
const play = () => player?.play()
const pause = () => player?.pause()
const seek = (time) => player?.currentTime(time)
const setVolume = (vol) => player?.volume(vol)
const getCurrentTime = () => player?.currentTime() || 0
const getDuration = () => player?.duration() || 0
const setPlaybackRate = (rate) => player?.playbackRate(rate)

defineExpose({
    play,
    pause,
    seek,
    setVolume,
    getCurrentTime,
    getDuration,
    setPlaybackRate,
    getPlayer: () => player
})

// 监听 src 变化
watch(() => props.src, (newSrc) => {
    if (player && newSrc) {
        player.src({ src: newSrc, type: props.type })
    }
})

onMounted(() => {
    initPlayer()
})

onBeforeUnmount(() => {
    if (player) {
        player.dispose()
        player = null
    }
})
</script>

<style scoped>
.video-player-container {
    width: 100%;
}

.video-player-container :deep(.video-js) {
    width: 100%;
    border-radius: 8px;
    overflow: hidden;
}

.video-player-container :deep(.vjs-big-play-button) {
    border-radius: 50%;
    width: 60px;
    height: 60px;
    line-height: 60px;
    margin-left: -30px;
    margin-top: -30px;
}
</style>
