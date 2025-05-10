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
  if (!chartInstance || !props.chartData || !Array.isArray(props.chartData.data)) return

  chartInstance.setOption({
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left' },
    series: [
      {
        name: '收支比例',
        type: 'pie',
        radius: '50%',
        data: [
          { value: props.chartData.data[0] || 0, name: '收入' },
          { value: props.chartData.data[1] || 0, name: '支出' }
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
}


onMounted(() => {
  initChart()
})

watch(() => props.chartData, () => {
  updateChart()
}, { deep: true })
</script>
