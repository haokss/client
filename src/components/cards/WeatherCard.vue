<template>
<el-card class="weather-card grid-item">
  <template #header>
    <div class="weather-header">
      <span>今日天气</span>
      <el-button type="text" @click="refreshWeather">刷新</el-button>
    </div>
  </template>
  <div class="weather-body">
    <div class="weather-main">
      <div class="weather-icon">
        <i :class="weatherIcon" style="font-size: 48px;"></i>
      </div>
      <div class="weather-info">
        <div class="temperature">{{ weatherData.temperature }}°C</div>
        <div class="condition">{{ weatherData.condition }}</div>
        <div class="location-time">{{ location }} · {{ currentTime }}</div>
      </div>
    </div>
    <div class="weather-details">
      <div class="detail-item">
        <span>湿度</span>
        <span>{{ weatherData.humidity }}%</span>
      </div>
      <div class="detail-item">
        <span>风速</span>
        <span>{{ weatherData.windSpeed }} km/h</span>
      </div>
      <div class="detail-item">
        <span>空气质量</span>
        <span>{{ weatherData.airQuality }}</span>
      </div>
    </div>
  </div>
</el-card>

</template>

<script setup>
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useDateFormat, useNow } from '@vueuse/core'

const currentTime = useDateFormat(useNow(), 'HH:mm')
const location = '郑州' // 后续可以替换为实际定位城市

const weatherData = ref({
  temperature: 24,
  condition: '晴',
  humidity: 65,
  windSpeed: 10,
  airQuality: '优',
  icon: 'sunny'
})

const weatherIcon = computed(() => {
  const icons = {
    sunny: 'mdi:weather-sunny',
    cloudy: 'mdi:weather-cloudy',
    rainy: 'mdi:weather-pouring',
    snowy: 'mdi:weather-snowy'
  }
  return icons[weatherData.value.icon] || 'mdi:weather-sunny'
})

const refreshWeather = () => {
  const conditions = ['晴', '多云', '小雨', '阴']
  const icons = ['sunny', 'cloudy', 'rainy', 'cloudy']
  const index = Math.floor(Math.random() * conditions.length)

  weatherData.value = {
    temperature: Math.floor(Math.random() * 15) + 15,
    condition: conditions[index],
    humidity: Math.floor(Math.random() * 30) + 50,
    windSpeed: Math.floor(Math.random() * 20) + 5,
    airQuality: ['优', '良', '轻度污染'][Math.floor(Math.random() * 3)],
    icon: icons[index]
  }
}
</script>

<style scoped>
.weather-card {
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s, box-shadow 0.3s;
}
.weather-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.weather-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.weather-body {
  padding: 10px;
}

.location-time {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
}

.weather-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 15px;
}

.weather-icon {
  margin-bottom: 10px;
  color: #ffa500;
}

.weather-info {
  flex: 1;
}

.temperature {
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 5px;
  color: var(--el-text-color-primary);
}

.condition {
  font-size: 18px;
  color: var(--el-text-color-secondary);
}

.weather-details {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  background-color: var(--el-bg-color-page);
  border-radius: 6px;
}

.detail-item span:first-child {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-bottom: 4px;
}

.detail-item span:last-child {
  font-size: 14px;
  font-weight: 500;
}
</style>
