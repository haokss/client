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

  const series = props.chartData.datasets.map(dataset => ({
    name: dataset.label,
    type: 'bar',
    data: dataset.data,
    itemStyle: {
      color: dataset.backgroundColor
    }
  }))

  chartInstance.setOption({
    tooltip: { trigger: 'axis' },
    legend: {
      data: props.chartData.datasets.map(d => d.label)
    },
    xAxis: {
      type: 'category',
      data: props.chartData.labels
    },
    yAxis: { type: 'value' },
    series
  })
}


onMounted(() => {
  initChart()
})

watch(() => props.chartData, () => {
  updateChart()
}, { deep: true })
</script>
