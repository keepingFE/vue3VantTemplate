<template>
  <div class="chart-container">
    <van-nav-bar :title="$t('route.chart')" fixed placeholder />

    <div class="content">
      <!-- 折线图 -->
      <div class="chart-card">
        <div class="chart-title">血压监测</div>
        <v-chart class="chart" :option="lineOption" autoresize />
      </div>

      <!-- 柱状图 -->
      <div class="chart-card">
        <div class="chart-title">销售数据对比</div>
        <v-chart class="chart" :option="barOption" autoresize />
      </div>

      <!-- 饼图 -->
      <div class="chart-card">
        <div class="chart-title">用户来源分布</div>
        <v-chart class="chart" :option="pieOption" autoresize />
      </div>

      <!-- 环形图 -->
      <div class="chart-card">
        <div class="chart-title">设备占比</div>
        <v-chart class="chart" :option="doughnutOption" autoresize />
      </div>

      <!-- 面积图 -->
      <div class="chart-card">
        <div class="chart-title">收入趋势</div>
        <v-chart class="chart" :option="areaOption" autoresize />
      </div>

      <!-- 雷达图 -->
      <div class="chart-card">
        <div class="chart-title">能力雷达</div>
        <v-chart class="chart" :option="radarOption" autoresize />
      </div>

      <!-- 地图 -->
      <div class="chart-card">
        <div class="chart-title">全国业务热力</div>
        <v-chart v-if="isMapReady" class="chart" :option="mapOption" autoresize />
        <div v-else class="chart map-loading">地图加载中...</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { use, registerMap } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart, PieChart, RadarChart, MapChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  MarkAreaComponent,
  MarkLineComponent,
  VisualMapComponent,
  GeoComponent
} from 'echarts/components'
import { LegacyGridContainLabel } from 'echarts/features'
import VChart from 'vue-echarts'

// 按需注册 ECharts 组件
use([
  CanvasRenderer,
  LineChart,
  BarChart,
  PieChart,
  RadarChart,
  MapChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  MarkAreaComponent,
  MarkLineComponent,
  VisualMapComponent,
  GeoComponent,
  LegacyGridContainLabel
])

const isMapReady = ref(false)
let hasRegisteredChinaMap = false

// 加载并注册中国地图
const loadChinaMap = async () => {
  if (hasRegisteredChinaMap) {
    isMapReady.value = true
    return
  }
  try {
    const response = await fetch('https://geo.datav.aliyun.com/areas_v3/bound/geojson?code=100000_full')
    if (!response.ok) {
      throw new Error('地图数据请求失败')
    }
    const geoJson = await response.json()
    registerMap('china', geoJson)
    hasRegisteredChinaMap = true
    isMapReady.value = true
  } catch (error) {
    console.error('地图数据加载失败', error)
  }
}

onMounted(() => {
  loadChinaMap()
})

// 折线图配置
const lineOption = ref({
  tooltip: {
    trigger: 'axis',
    formatter: (params) => {
      let result = `${params[0].axisValue}<br/>`
      params.forEach(item => {
        result += `${item.marker}${item.seriesName}: ${item.value} mmHg<br/>`
      })
      return result
    }
  },
  legend: {
    data: ['收缩压 (高压)', '舒张压 (低压)'],
    top: '0%',
    right: '4%'
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: ['2020-10-23', '2020-11-23', '2020-12-23', '2021-01-23', '2021-02-23', '2021-03-23', '2021-04-23']
  },
  yAxis: {
    type: 'value',
    name: 'mmHg',
    nameLocation: 'end',
    nameTextStyle: {
      align: 'right',
      padding: [0, 0, 5, 0]
    },
    axisLabel: {
      formatter: '{value}'
    }
  },
  series: [
    {
      name: '收缩压 (高压)',
      type: 'line',
      data: [115, 95, 145, 130, 110, 92, 150],
      smooth: true,
      shape: 'circle', // 使用圆形布局
      gridSize: 10, // 网格大小
      lineStyle: {
        color: "#FF3141FF", // 第一条线的颜色
      },
      itemStyle: {
        color: "#FF3141FF", // 第一条线的颜色
      },
      markArea: {
        data: [
          [
            {
              yAxis: '90', //开始
              itemStyle: {
                color: '#FF3141FF',
                opacity: 0.1
              }
            },
            {
              yAxis: '140'
            }
          ]
        ]
      }
    },
    {
      name: '舒张压 (低压)',
      type: 'line',
      data: [65, 95, 68, 55, 52, 68, 85],
      smooth: true,
      itemStyle: {
        color: '#1989fa'
      },
      lineStyle: {
        width: 3
      },
      symbolSize: 8,
      lineStyle: {
        color: "#105cdf", // 第一条线的颜色
      },
      itemStyle: {
        color: "#105cdf", // 第一条线的颜色
      },
      markArea: {
        data: [
          [
            {
              yAxis: '60', //开始
              itemStyle: {
                color: '#105cdf',
                opacity: 0.1
              }
            },
            {
              yAxis: '90'
            }
          ]
        ]
      }
    }
  ]
})

// 柱状图配置
const barOption = ref({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  legend: {
    data: ['2023年', '2024年'],
    top: '0%',
    right: '4%'
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: ['1月', '2月', '3月', '4月', '5月', '6月']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: '2023年',
      type: 'bar',
      data: [320, 302, 301, 334, 390, 330],
      itemStyle: {
        color: '#1989fa'
      }
    },
    {
      name: '2024年',
      type: 'bar',
      data: [420, 402, 401, 434, 490, 530],
      itemStyle: {
        color: '#07c160'
      }
    }
  ]
})

// 饼图配置
const pieOption = ref({
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b}: {c} ({d}%)'
  },
  legend: {
    orient: 'horizontal',
    bottom: '0%'
  },
  series: [
    {
      name: '用户来源',
      type: 'pie',
      radius: '60%',
      center: ['50%', '45%'],
      data: [
        { value: 1048, name: '搜索引擎', itemStyle: { color: '#1989fa' } },
        { value: 735, name: '直接访问', itemStyle: { color: '#07c160' } },
        { value: 580, name: '邮件营销', itemStyle: { color: '#ff976a' } },
        { value: 484, name: '联盟广告', itemStyle: { color: '#ee0a24' } },
        { value: 300, name: '视频广告', itemStyle: { color: '#ffd21e' } }
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }
  ]
})

// 环形图配置
const doughnutOption = ref({
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b}: {c} ({d}%)'
  },
  legend: {
    orient: 'horizontal',
    bottom: '0%'
  },
  series: [
    {
      name: '设备占比',
      type: 'pie',
      radius: ['40%', '60%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: false,
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 20,
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: false
      },
      data: [
        { value: 3350, name: 'iOS', itemStyle: { color: '#1989fa' } },
        { value: 2548, name: 'Android', itemStyle: { color: '#07c160' } },
        { value: 1580, name: 'Web', itemStyle: { color: '#ff976a' } },
        { value: 484, name: '其他', itemStyle: { color: '#ee0a24' } }
      ]
    }
  ]
})

// 面积图配置
const areaOption = ref({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross'
    }
  },
  legend: {
    data: ['收入'],
    top: '0%',
    right: '4%'
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      formatter: '{value} 万'
    }
  },
  series: [
    {
      name: '收入',
      type: 'line',
      data: [30, 45, 38, 52, 48, 65, 72, 68, 85, 92, 88, 105],
      smooth: true,
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            {
              offset: 0,
              color: 'rgba(25, 137, 250, 0.3)'
            },
            {
              offset: 1,
              color: 'rgba(25, 137, 250, 0.05)'
            }
          ]
        }
      },
      itemStyle: {
        color: '#1989fa'
      }
    }
  ]
})

// 雷达图配置
const radarOption = ref({
  tooltip: {
    trigger: 'item'
  },
  legend: {
    bottom: '0%',
    data: ['团队 A', '团队 B']
  },
  radar: {
    indicator: [
      { name: '产品', max: 100 },
      { name: '研发', max: 100 },
      { name: '运营', max: 100 },
      { name: '市场', max: 100 },
      { name: '销售', max: 100 }
    ],
    radius: '60%'
  },
  series: [
    {
      name: '团队能力对比',
      type: 'radar',
      data: [
        {
          value: [80, 90, 70, 85, 75],
          name: '团队 A',
          itemStyle: { color: '#1989fa' }
        },
        {
          value: [70, 85, 85, 65, 90],
          name: '团队 B',
          itemStyle: { color: '#07c160' }
        }
      ]
    }
  ]
})

// 地图配置
// 地图 tooltip 文案处理
const formatMapTooltip = params => {
  const value = Number.isFinite(params.value) ? params.value : 0
  return `${params.name}<br/>业务量：${value}`
}

const mapOption = ref({
  tooltip: {
    trigger: 'item',
    formatter: formatMapTooltip
  },
  visualMap: {
    min: 0,
    max: 1000,
    left: 'left',
    bottom: '5%',
    text: ['高', '低'],
    calculable: true,
    inRange: {
      color: ['#e0ffff', '#007bff']
    }
  },
  series: [
    {
      name: '业务热度',
      type: 'map',
      map: 'china',
      roam: true,
      label: {
        show: false
      },
      itemStyle: {
        emphasis: {
          areaColor: '#ff5722'
        }
      },
      data: [
        { name: '北京市', value: 820 },
        { name: '上海市', value: 750 },
        { name: '广东省', value: 960 },
        { name: '浙江省', value: 680 },
        { name: '江苏省', value: 720 },
        { name: '四川省', value: 580 },
        { name: '湖北省', value: 430 },
        { name: '河南省', value: 510 },
        { name: '陕西省', value: 460 }
      ]
    }
  ]
})
</script>

<style lang="scss" scoped>
.chart-container {
  min-height: 100vh;
  background-color: var(--bg-color);

  .content {
    padding: 16px;

    .chart-card {
      background: #fff;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

      &:last-of-type {
        margin-bottom: 0;
      }

      .chart-title {
        font-size: 16px;
        font-weight: 600;
        color: #323233;
        margin-bottom: 12px;
        padding-left: 8px;
        border-left: 3px solid #1989fa;
      }

      .chart {
        width: 100%;
        height: 300px;
      }

      .map-loading {
        display: flex;
        align-items: center;
        justify-content: center;
        color: #969799;
        background-color: #f7f7f7;
      }
    }
  }
}

// 暗黑模式适配
@media (prefers-color-scheme: dark) {
  .chart-container {
    .content {
      .chart-card {
        background: #1e1e1e;

        .chart-title {
          color: #e5e5e5;
        }
      }
    }
  }
}
</style>
