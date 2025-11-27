<template>
  <div>
    <van-popup :show="show" @update:show="$emit('update:show', $event)" position="bottom" round>
      <van-picker v-model="pickerValue" :columns="pickerColumns" :title="title || $t('user.selectBirthday')"
        @confirm="onConfirm" @cancel="onCancel" @change="onPickerChange" />
    </van-popup>
  </div>
</template>

<script setup>
  import { ref, watch, defineProps, defineEmits, computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  const props = defineProps({
    // 控制日期时间选择器弹窗的显示与隐藏
    show: {
      type: Boolean,
      default: false
    },
    // 绑定的日期时间值，遵循指定的格式
    modelValue: {
      type: String,
      default: ''
    },
    // 选择器弹窗的标题，默认使用国际化文本
    title: {
      type: String,
      default: ''
    },
    // 定义选择器显示的列类型，可配置年、月、日、时、分、秒的任意组合
    columnsType: {
      type: Array,
      default: () => ['year', 'month', 'day', 'hour', 'minute', 'second']
    },
    // 日期时间的显示格式，遵循特定的占位符规则
    format: {
      type: String,
      default: 'YYYY-MM-DD HH:mm:ss'
    },
    // 可选择的最小日期，默认为1900年1月1日
    minDate: {
      type: String,
      default: '1900-01-01'
    },
    // 可选择的最大日期，默认为9999年12月31日
    maxDate: {
      type: String,
      default: '9999-12-31'
    }
  })

  const emit = defineEmits(['update:show', 'update:modelValue', 'confirm', 'cancel'])

  const { t } = useI18n()

  // ==================== 日期工具函数 ====================

  /**
   * 根据格式字符串格式化日期时间
   * @param {Object} dateObj - 日期对象，包含year, month, day, hour, minute, second
   * @param {string} formatStr - 格式字符串，如 'YYYY-MM-DD HH:mm:ss'
   * @returns {string} 格式化后的日期字符串
   */
  const formatDateTime = (dateObj, formatStr) => {
    const { year, month, day, hour, minute, second } = dateObj

    return formatStr
      .replace(/YYYY/g, year)
      .replace(/MM/g, month)
      .replace(/DD/g, day)
      .replace(/HH/g, hour)
      .replace(/mm/g, minute)
      .replace(/ss/g, second)
  }

  /**
   * 根据格式字符串解析日期字符串
   * @param {string} dateStr - 日期字符串
   * @param {string} formatStr - 格式字符串
   * @returns {Object|null} 解析后的日期对象或null
   */
  const parseDateTime = (dateStr, formatStr) => {
    if (!dateStr) return null

    // Create a regex pattern based on the format string
    const pattern = formatStr
      .replace(/YYYY/g, '(\\d{4})')
      .replace(/MM/g, '(\\d{2})')
      .replace(/DD/g, '(\\d{2})')
      .replace(/HH/g, '(\\d{2})')
      .replace(/mm/g, '(\\d{2})')
      .replace(/ss/g, '(\\d{2})')
      .replace(/[- :]/g, '[- :]')

    const regex = new RegExp(`^${pattern}$`)
    const match = dateStr.match(regex)

    if (!match) return null

    // Extract values based on format order
    const formatParts = formatStr.split(/[- :]/)
    const dateValues = match.slice(1)

    const result = {
      year: '2000',
      month: '01',
      day: '01',
      hour: '00',
      minute: '00',
      second: '00'
    }

    formatParts.forEach((part, index) => {
      if (dateValues[index]) {
        if (part === 'YYYY') result.year = dateValues[index]
        else if (part === 'MM') result.month = dateValues[index]
        else if (part === 'DD') result.day = dateValues[index]
        else if (part === 'HH') result.hour = dateValues[index]
        else if (part === 'mm') result.minute = dateValues[index]
        else if (part === 'ss') result.second = dateValues[index]
      }
    })

    return result
  }

  // ==================== 日期范围验证函数 ====================

  /**
   * 解析最小和最大日期
   */
  const parsedMinDate = computed(() => {
    return parseDateTime(props.minDate, 'YYYY-MM-DD') || { year: '1900', month: '01', day: '01' }
  })

  const parsedMaxDate = computed(() => {
    return parseDateTime(props.maxDate, 'YYYY-MM-DD') || { year: '9999', month: '12', day: '31' }
  })

  /**
   * 检查日期是否在有效范围内
   * @param {Object} date - 日期对象
   * @returns {Object} 调整后的日期对象
   */
  const ensureDateInRange = (date) => {
    const minDate = parsedMinDate.value
    const maxDate = parsedMaxDate.value
    const result = { ...date }

    // 检查年份是否超出范围
    if (parseInt(result.year) < parseInt(minDate.year)) {
      result.year = minDate.year
      result.month = minDate.month
      result.day = minDate.day
    } else if (parseInt(result.year) > parseInt(maxDate.year)) {
      result.year = maxDate.year
      result.month = maxDate.month
      result.day = maxDate.day
    }
    // 检查月份是否超出范围（同年份）
    else if (parseInt(result.year) === parseInt(minDate.year) &&
      parseInt(result.month) < parseInt(minDate.month)) {
      result.month = minDate.month
      result.day = minDate.day
    } else if (parseInt(result.year) === parseInt(maxDate.year) &&
      parseInt(result.month) > parseInt(maxDate.month)) {
      result.month = maxDate.month
      result.day = maxDate.day
    }
    // 检查日期是否超出范围（同年份和月份）
    else if (parseInt(result.year) === parseInt(minDate.year) &&
      parseInt(result.month) === parseInt(minDate.month) &&
      parseInt(result.day) < parseInt(minDate.day)) {
      result.day = minDate.day
    } else if (parseInt(result.year) === parseInt(maxDate.year) &&
      parseInt(result.month) === parseInt(maxDate.month) &&
      parseInt(result.day) > parseInt(maxDate.day)) {
      result.day = maxDate.day
    }

    return result
  }

  // ==================== 选择器数据生成函数 ====================

  // 年份范围
  const minYear = ref(1900)
  const maxYear = ref(new Date().getFullYear())

  // 根据props更新年份范围
  watch([parsedMinDate, parsedMaxDate], ([minDate, maxDate]) => {
    minYear.value = parseInt(minDate.year)
    maxYear.value = parseInt(maxDate.year)
  }, { immediate: true })

  /**
   * 生成范围数组
   * @param {number} start - 起始值
   * @param {number} end - 结束值
   * @param {Function} disabledFn - 判断是否禁用的函数
   * @returns {Array} 选项数组
   */
  const makeRange = (start, end, disabledFn = null) => {
    const result = []
    for (let i = start; i <= end; i++) {
      const val = i.toString().padStart(2, '0')
      const item = { text: val, value: val }

      // 检查是否应该禁用此选项
      if (disabledFn && disabledFn(i)) {
        item.disabled = true
      }

      result.push(item)
    }
    return result
  }

  /**
   * 获取天数选项
   * @param {number} year - 年份
   * @param {number} month - 月份
   * @returns {Array} 天数选项数组
   */
  const getDays = (year, month) => {
    const dayCount = new Date(year, month, 0).getDate()

    // 检查是否需要根据最小/最大日期禁用某些天
    const disabledFn = (day) => {
      const currentYear = parseInt(year)
      const currentMonth = parseInt(month)

      // 检查最小日期
      if (currentYear === parseInt(parsedMinDate.value.year) &&
        currentMonth === parseInt(parsedMinDate.value.month) &&
        day < parseInt(parsedMinDate.value.day)) {
        return true
      }

      // 检查最大日期
      if (currentYear === parseInt(parsedMaxDate.value.year) &&
        currentMonth === parseInt(parsedMaxDate.value.month) &&
        day > parseInt(parsedMaxDate.value.day)) {
        return true
      }

      return false
    }

    return makeRange(1, dayCount, disabledFn)
  }

  // 计算属性：年份、月份、小时、分钟、秒选项
  const years = computed(() => {
    // 年份不需要禁用函数，因为我们已经限制了范围
    return makeRange(minYear.value, maxYear.value)
  })

  const months = computed(() => {
    const disabledFn = (month) => {
      const currentYear = parseInt(internalDate.value.year)

      // 检查最小日期
      if (currentYear === parseInt(parsedMinDate.value.year) &&
        month < parseInt(parsedMinDate.value.month)) {
        return true
      }

      // 检查最大日期
      if (currentYear === parseInt(parsedMaxDate.value.year) &&
        month > parseInt(parsedMaxDate.value.month)) {
        return true
      }

      return false
    }

    return makeRange(1, 12, disabledFn)
  })

  const hours = makeRange(0, 23)
  const minutes = makeRange(0, 59)
  const seconds = makeRange(0, 59)

  // 列映射
  const columnMap = computed(() => ({
    year: years.value,
    month: months.value,
    day: [],
    hour: hours,
    minute: minutes,
    second: seconds
  }))

  // ==================== 组件状态和计算属性 ====================

  // 选择器值和列
  const pickerValue = ref([])
  const pickerColumns = ref([])

  // 内部状态，用于跟踪日期（即使列被隐藏）
  const internalDate = ref({
    year: new Date().getFullYear().toString(),
    month: (new Date().getMonth() + 1).toString().padStart(2, '0'),
    day: new Date().getDate().toString().padStart(2, '0'),
    hour: new Date().getHours().toString().padStart(2, '0'),
    minute: new Date().getMinutes().toString().padStart(2, '0'),
    second: new Date().getSeconds().toString().padStart(2, '0')
  })

  // ==================== 选择器初始化和更新逻辑 ====================

  /**
   * 初始化选择器
   */
  const initPicker = () => {
    const columns = []
    const values = []
    const columnMapValue = columnMap.value

    props.columnsType.forEach(type => {
      if (type === 'day') {
        columns.push(getDays(parseInt(internalDate.value.year), parseInt(internalDate.value.month)))
      } else if (columnMapValue[type]) {
        columns.push(columnMapValue[type])
      }
      values.push(internalDate.value[type])
    })

    pickerColumns.value = columns
    pickerValue.value = values
  }

  /**
   * 更新选择器列
   * @param {string} type - 列类型
   * @param {number} index - 列索引
   */
  const updatePickerColumn = (type, index) => {
    if (type === 'day') {
      pickerColumns.value[index] = getDays(parseInt(internalDate.value.year), parseInt(internalDate.value.month))
    } else if (type === 'month') {
      pickerColumns.value[index] = months.value
    }
  }

  /**
   * 验证并修正选择器值
   * @param {string} type - 类型
   * @param {number} index - 索引
   * @param {Array} columns - 列数据
   */
  const validateAndFixPickerValue = (type, index, columns) => {
    const currentValue = internalDate.value[type]
    const isValueDisabled = columns.some(col => col.value === currentValue && col.disabled)

    if (isValueDisabled) {
      // 找到第一个未禁用的值
      const validValue = columns.find(col => !col.disabled)
      if (validValue) {
        internalDate.value[type] = validValue.value
        const newValues = [...pickerValue.value]
        newValues[index] = validValue.value
        pickerValue.value = newValues
      }
    }
  }

  // ==================== 事件处理函数 ====================

  /**
   * 选择器变化处理
   * @param {Object} event - 事件对象
   */
  const onPickerChange = ({ selectedValues }) => {
    // 根据可见列更新内部状态
    props.columnsType.forEach((type, index) => {
      internalDate.value[type] = selectedValues[index]
    })

    // 重新计算日列（如果需要）
    const dayIndex = props.columnsType.indexOf('day')
    if (dayIndex > -1) {
      updatePickerColumn('day', dayIndex)

      // 确保所选日期对新月份有效
      const days = pickerColumns.value[dayIndex]
      const currentDay = parseInt(internalDate.value.day)
      const maxDay = days.length

      if (currentDay > maxDay) {
        const newDay = maxDay.toString().padStart(2, '0')
        internalDate.value.day = newDay
        const newValues = [...pickerValue.value]
        newValues[dayIndex] = newDay
        pickerValue.value = newValues
      }
    }

    // 如果年份改变，重新计算月列
    const monthIndex = props.columnsType.indexOf('month')
    const yearIndex = props.columnsType.indexOf('year')
    if (monthIndex > -1 && yearIndex > -1) {
      updatePickerColumn('month', monthIndex)

      // 确保所选月份对新年份有效
      validateAndFixPickerValue('month', monthIndex, pickerColumns.value[monthIndex])
    }
  }

  /**
   * 确认选择
   * @param {Object} event - 事件对象
   */
  const onConfirm = ({ selectedValues }) => {
    // 最后一次更新内部状态
    props.columnsType.forEach((type, index) => {
      internalDate.value[type] = selectedValues[index]
    })

    const dateStr = formatDateTime(internalDate.value, props.format)

    emit('update:modelValue', dateStr)
    emit('confirm', dateStr)
    emit('update:show', false)
  }

  /**
   * 取消选择
   */
  const onCancel = () => {
    emit('cancel')
    emit('update:show', false)
  }



  // ==================== 监听器 ====================

  // 当弹窗打开时，同步pickerValue与modelValue
  watch(() => props.show, (val) => {
    if (val) {
      if (props.modelValue) {
        const parsedDate = parseDateTime(props.modelValue, props.format)
        if (parsedDate) {
          // 确保解析的日期在最小/最大范围内
          internalDate.value = ensureDateInRange(parsedDate)
        }
      } else {
        // 默认为当前时间，但确保在范围内
        const now = new Date()
        const currentDate = {
          year: now.getFullYear().toString(),
          month: (now.getMonth() + 1).toString().padStart(2, '0'),
          day: now.getDate().toString().padStart(2, '0'),
          hour: now.getHours().toString().padStart(2, '0'),
          minute: now.getMinutes().toString().padStart(2, '0'),
          second: now.getSeconds().toString().padStart(2, '0')
        }

        internalDate.value = ensureDateInRange(currentDate)
      }

      initPicker()
    }
  })
</script>