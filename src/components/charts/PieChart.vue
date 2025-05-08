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
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center'
    },
    series: [
      {
        name: '任务类型',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: props.chartData.labels.map((label, index) => ({
          value: props.chartData.data[index],
          name: label
        }))
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