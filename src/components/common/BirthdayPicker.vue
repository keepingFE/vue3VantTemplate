<template>
  <van-popup :show="show" @update:show="$emit('update:show', $event)" position="bottom" round>
    <van-picker v-model="pickerValue" :columns="pickerColumns" :title="title || $t('user.selectBirthday')"
      @confirm="onConfirm" @cancel="onCancel" @change="onPickerChange" />
  </van-popup>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  modelValue: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:show', 'update:modelValue', 'confirm', 'cancel'])

const { t } = useI18n()

// Date Picker config
const minYear = 1900
const maxYear = new Date().getFullYear()

const makeRange = (start, end) => {
  const result = []
  for (let i = start; i <= end; i++) {
    const val = i.toString().padStart(2, '0')
    result.push({ text: val, value: val })
  }
  return result
}

const getDays = (year, month) => {
  const dayCount = new Date(year, month, 0).getDate()
  return makeRange(1, dayCount)
}

const years = makeRange(minYear, maxYear)
const months = makeRange(1, 12)
const hours = makeRange(0, 23)
const minutes = makeRange(0, 59)
const seconds = makeRange(0, 59)

const pickerValue = ref(['2000', '01', '01', '00', '00', '00'])
const pickerColumns = ref([
  years,
  months,
  getDays(2000, 1),
  hours,
  minutes,
  seconds
])

const onPickerChange = ({ selectedValues }) => {
  const [year, month] = selectedValues
  // Update days column (index 2)
  pickerColumns.value[2] = getDays(parseInt(year), parseInt(month))
}

const onConfirm = ({ selectedValues }) => {
  const [y, m, d, h, min, s] = selectedValues
  const dateStr = `${y}-${m}-${d} ${h}:${min}:${s}`
  emit('update:modelValue', dateStr)
  emit('confirm', dateStr)
  emit('update:show', false)
}

const onCancel = () => {
  emit('cancel')
  emit('update:show', false)
}

// Sync pickerValue with modelValue when popup opens
watch(() => props.show, (val) => {
  if (val) {
    if (props.modelValue) {
      const [date, time] = props.modelValue.split(' ')
      if (date && time) {
        pickerValue.value = [...date.split('-'), ...time.split(':')]
        // Ensure days column is correct
        pickerColumns.value[2] = getDays(parseInt(pickerValue.value[0]), parseInt(pickerValue.value[1]))
        return
      }
    }

    // Default to now if parsing fails or empty
    const now = new Date()
    const y = now.getFullYear().toString()
    const m = (now.getMonth() + 1).toString().padStart(2, '0')
    const d = now.getDate().toString().padStart(2, '0')
    pickerValue.value = [y, m, d, '00', '00', '00']
    pickerColumns.value[2] = getDays(parseInt(y), parseInt(m))
  }
})
</script>
