<template>
  <el-card class="calendar-card">
    <template #header>
        <div>日历</div>
    </template>
    <el-calendar v-model="currentDate">
      <template #date-cell="{ data }">
        <div class="calendar-day" :class="getDayClass(data)">
          <div class="day-number">{{ data.day.split('-').slice(2).join('-') }}</div>
          <div v-if="hasEvent(data.day)" class="day-event"></div>
          <!-- 显示待办任务数量 -->
          <div v-if="getTaskCount(data.day) > 0" class="task-count">
            待办{{ getTaskCount(data.day) }}项
          </div>
        </div>
      </template>
    </el-calendar>
  </el-card>
</template>

<script setup>
import { ref } from 'vue'

const currentDate = ref(new Date())

// 示例的待办任务数据，日期为键，任务数量为值
const todoTasks = {
  '2025-05-15': 2,
  '2025-05-20': 1,
  '2025-05-25': 3,
}

// 切换到上个月
const prevMonth = () => {
  const date = new Date(currentDate.value)
  date.setMonth(date.getMonth() - 1)
  currentDate.value = date
}

// 切换到下个月
const nextMonth = () => {
  const date = new Date(currentDate.value)
  date.setMonth(date.getMonth() + 1)
  currentDate.value = date
}

// 获取每一天的样式
const getDayClass = (data) => {
  const classes = []
  if (data.isSelected) classes.push('is-selected')
  if (data.type === 'current-month') classes.push('current-month')
  if (hasEvent(data.day)) classes.push('has-event')
  return classes.join(' ')
}

// 判断某天是否有事件（这里可以用于待办任务）
const hasEvent = (day) => {
  return todoTasks.hasOwnProperty(day) && todoTasks[day] > 0
}

// 获取某天的待办任务数量
const getTaskCount = (day) => {
  return todoTasks[day] || 0
}
</script>

<style scoped>
.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.calendar-day {
  height: 100%;
  padding: 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.day-number {
  font-size: 14px;
  margin-bottom: 2px;
}

.day-event {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--el-color-primary);
}

.is-selected .day-number {
  color: var(--el-color-primary);
  font-weight: bold;
}

.task-count {
  margin-top: 5px;
  font-size: 12px;
  color: #ff9900;
  font-weight: bold;
}
</style>
