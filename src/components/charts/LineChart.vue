<template>
  <div ref="chart" style="width: 100%; height: 100%;"></div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  chartData: {
    type: Object,
    required: true
  }
})

const chart = ref(null)
let myChart = null

const renderChart = () => {
  if (!myChart) return
  
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['完成任务', '新增任务']
    },
    xAxis: {
      type: 'category',
      data: props.chartData.dates
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '完成任务',
        type: 'line',
        data: props.chartData.completed,
        itemStyle: {
          color: '#67C23A'
        }
      },
      {
        name: '新增任务',
        type: 'line',
        data: props.chartData.created,
        itemStyle: {
          color: '#409EFF'
        }
      }
    ]
  }
  myChart.setOption(option)
}

onMounted(() => {
  myChart = echarts.init(chart.value)
  renderChart()
  
  // 响应窗口大小变化
  window.addEventListener('resize', () => {
    myChart.resize()
  })
})

watch(() => props.chartData, () => {
  renderChart()
}, { deep: true })
</script>