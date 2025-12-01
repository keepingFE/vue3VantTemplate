<template>
    <van-popup :show="show" @update:show="$emit('update:show', $event)" position="bottom" round>
        <van-area v-model="areaValueStr" :area-list="areaListData" :title="title || $t('user.selectAddress')"
            @confirm="onConfirm" @cancel="onCancel" @change="onAreaChange" />
    </van-popup>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { areaList } from '@vant/area-data'

const props = defineProps({
    // 控制地址选择器弹窗的显示与隐藏
    show: {
        type: Boolean,
        default: false
    },
    // 绑定的地址值，格式为省市区代码数组，如 ['110000', '110100', '110101']
    modelValue: {
        type: Array,
        default: () => []
    },
    // 选择器弹窗的标题
    title: {
        type: String,
        default: ''
    }
})

const emit = defineEmits(['update:show', 'update:modelValue', 'confirm', 'cancel'])

const { t } = useI18n()

// 确保 areaList 数据可用
const areaListData = areaList || {}

// 地址选择器的值（字符串格式，用于 van-area 组件）
const areaValueStr = ref('')

/**
 * 将数组格式的地区代码转换为字符串格式
 * @param {Array} codes - 地区代码数组，如 ['110000', '110100', '110101']
 * @returns {string} 字符串格式，如 '110000,110100,110101'
 */
const codesToStr = (codes) => {
    if (!codes || !Array.isArray(codes) || codes.length === 0) {
        return ''
    }
    return codes.join(',')
}

/**
 * 将字符串格式的地区代码转换为数组格式
 * @param {string} str - 字符串格式，如 '110000,110100,110101'
 * @returns {Array} 地区代码数组，如 ['110000', '110100', '110101']
 */
const strToCodes = (str) => {
    if (!str || typeof str !== 'string') {
        return []
    }
    return str.split(',').filter(code => code.trim() !== '')
}

// 监听 modelValue 变化，同步到 areaValueStr
watch(
    () => props.modelValue,
    (val) => {
        const str = codesToStr(val)
        if (areaValueStr.value !== str) {
            areaValueStr.value = str
        }
    },
    { immediate: true, deep: true }
)

// 监听弹窗显示状态，当打开时同步值
watch(
    () => props.show,
    (val) => {
        if (val) {
            areaValueStr.value = codesToStr(props.modelValue)
        }
    }
)

/**
 * 根据省市区代码获取地址文本
 * @param {Array} codes - 省市区代码数组
 * @returns {string} 地址文本，如 "北京市 北京市 东城区"
 */
const getAddressText = (codes) => {
    if (!codes || codes.length === 0) {
        return ''
    }

    const provinceCode = codes[0]
    const cityCode = codes[1]
    const districtCode = codes[2]

    const province = areaListData.province_list?.[provinceCode] || ''
    const city = areaListData.city_list?.[cityCode] || ''
    const district = areaListData.county_list?.[districtCode] || ''

    const addressParts = [province, city, district].filter(Boolean)
    return addressParts.join(' ')
}

// 存储当前选中的完整值（用于在 confirm 时获取）
const currentSelectedValues = ref([])

/**
 * 地区选择变化事件
 * @param {Object} event - 事件对象
 */
const onAreaChange = (event) => {
    // van-area 的 change 事件返回 { selectedValues, selectedOptions }
    if (event && event.selectedValues && Array.isArray(event.selectedValues)) {
        currentSelectedValues.value = [...event.selectedValues]
    }
}

/**
 * 确认选择
 * @param {Object} event - 事件对象，包含 selectedValues 和 selectedOptions
 */
const onConfirm = (event) => {
    // van-area 的 confirm 事件返回 { selectedValues, selectedOptions }
    // selectedValues 是选中的值数组（字符串数组），如 ['110000', '110100', '110101']
    // 优先使用 event.selectedValues，其次使用 currentSelectedValues，最后使用 areaValueStr
    let codes = []

    if (event && event.selectedValues && Array.isArray(event.selectedValues)) {
        // 使用事件返回的完整值数组
        codes = [...event.selectedValues]
    } else if (currentSelectedValues.value && currentSelectedValues.value.length > 0) {
        // 使用 change 事件中保存的值
        codes = [...currentSelectedValues.value]
    } else if (event && Array.isArray(event)) {
        // 如果 event 本身就是数组
        codes = [...event]
    } else {
        // 否则使用 areaValueStr 转换
        codes = strToCodes(areaValueStr.value)
    }

    const addressText = getAddressText(codes)

    // 更新到父组件
    emit('update:modelValue', codes)
    emit('confirm', { codes, text: addressText })
    emit('update:show', false)
}

/**
 * 取消选择
 */
const onCancel = () => {
    emit('cancel')
    emit('update:show', false)
}
</script>
