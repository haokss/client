<template>
  <div ref="chartRef" style="width: 100%; height: 100%;"></div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  chartData: Object
})

const chartRef = ref(null)
let chartInstance = null

const initChart = () => {
  if (chartRef.value) {
    chartInstance = echarts.init(chartRef.value)
    updateChart()
  }
}

const updateChart = () => {
  if (!chartInstance) return

  chartInstance.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['收入', '支出'] },
    xAxis: { type: 'category', data: props.chartData.dates },
    yAxis: { type: 'value' },
    series: [
      { name: '收入', type: 'line', data: props.chartData.income },
      { name: '支出', type: 'line', data: props.chartData.expense }
    ]
  })
}

onMounted(() => {
  initChart()
})

watch(() => props.chartData, () => {
  updateChart()
}, { deep: true })
</script>
