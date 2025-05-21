<template>
  <div class="home-container">
    <!-- 统计卡片 -->
    <StatsCard class="stats-card" />

    <!-- 主体区域 -->
    <div class="main-section">
      <!-- 左侧：日历 -->
      <CalendarCard class="calendar-card" />

      <!-- 右侧：跳转按钮、天气和待办事项 -->
      <div class="right-panel">
        <!-- 顶部一行：跳转按钮 + 天气卡片 -->
        <div class="top-row">
            <!-- 轮播图 -->
            <WeatherCard class="weather-card" />
            <div class="carousel-container">
              <el-carousel height="240px" :interval="4000" arrow="always">
                <el-carousel-item v-for="(item, index) in carouseData" :key="index">
                  <img :src="item.url" alt="轮播图" class="carousel-image"/>
                </el-carousel-item>
              </el-carousel>
            </div>  
      </div>
        <!-- 下方：待办事项 -->
        <TodoCard class="todo-card" />
      </div>
    </div>


  </div>
</template>

<script setup>
import CalendarCard from '@/components/cards/CalendarCard.vue'
import WeatherCard from '@/components/cards/WeatherCard.vue'
import TodoCard from '@/components/cards/TodoCard.vue'
import QuickActionsCard from '@/components/cards/QuickActionsCard.vue'
import StatsCard from '@/components/cards/StatsCard.vue'

const carouseData = [
  { url: require("@/assets/001.jpg") },
  { url: require("@/assets/002.jpg") },
  { url: require("@/assets/003.jpg") },
  { url: require("@/assets/004.jpg") },
]


</script>

<style scoped>
/* .home-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
} */

/* 主体区域布局 */
.main-section {
  display: grid;
  grid-template-columns: 2fr 3fr;
  gap: 20px;
  margin-top: 20px;
}

/* 右侧内容垂直布局 */
.right-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 顶部一行：跳转按钮 + 天气卡片 */
.top-row {
  display: flex;
  gap: 20px;
  align-items: center;
}

/* 日历跳转按钮卡片 */
.calendar-nav {
  flex-shrink: 0;
  padding: 12px;
  background-color: var(--el-bg-color);
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* 快捷入口位置 */
.quick-actions-card {
  margin-top: 30px;
}

.carousel-container {
  flex: 1;
  height: 240px;
  min-width: 0; /* 避免超出flex容器导致隐藏 */
  overflow: hidden;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}



/* 卡片统一样式 */
.stats-card,
.calendar-card,
.weather-card,
.todo-card,
.quick-actions-card {
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stats-card:hover,
.calendar-card:hover,
.weather-card:hover,
.todo-card:hover,
.quick-actions-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
}

/* 响应式布局 */
@media (max-width: 992px) {
  .main-section {
    grid-template-columns: 1fr;
  }

  .top-row {
    flex-direction: column;
  }
}
</style>
