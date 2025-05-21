<template>
  <div class="stat-wrapper">

    <el-card shadow="hover" class="stat-card">
      <div class="stat-content">
        <div class="stat-icon" style="background-color: #409EFF20;">
          <el-icon color="#409EFF" :size="24"><Calendar /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-title">总活动数</div>
          <div class="stat-compare">较上月</div>
        </div>
      </div>
    </el-card>

    <el-card shadow="hover" class="stat-card">
      <div class="stat-content">
        <div class="stat-icon" style="background-color: #E6A23C20;">
          <el-icon color="#E6A23C" :size="24"><Clock /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-title">进行中</div>
          <div class="stat-value">{{ stats.inProgressTasks }}</div>
          <div class="stat-compare">
            <span :class="stats.progressChange >= 0 ? 'up' : 'down'">
              {{ Math.abs(stats.progressChange) }}%
              <el-icon :name="stats.progressChange >= 0 ? 'CaretTop' : 'CaretBottom'" />
            </span>
            较上周
          </div>
        </div>
      </div>
    </el-card>

        <el-card shadow="hover" class="stat-card">
      <div class="stat-content">
        <div class="stat-icon" style="background-color: #67C23A20;">
          <el-icon color="#67C23A" :size="24"><Money /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-title">总收入</div>
          <div class="stat-compare">较上月</div>
        </div>
      </div>
    </el-card>

    <el-card shadow="hover" class="stat-card">
      <div class="stat-content">
        <div class="stat-icon" style="background-color: #F56C6C20;">
          <el-icon color="#F56C6C" :size="24"><ShoppingCart /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-title">总支出</div>
          <div class="stat-compare">较上月</div>
        </div>
      </div>
    </el-card>
    
  </div>
</template>

<script setup>
import { Money, ShoppingCart, Calendar, Clock, CaretTop, CaretBottom } from '@element-plus/icons-vue'

const stats = {
  inProgressTasks: 15,
  progressChange: 12,
}
</script>

<style scoped>
.stat-wrapper {
  display: flex;
  gap: 20px;
  justify-content: space-between;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.stat-card {
  flex: 1;
  min-width: 220px;
}

.stat-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.stat-info {
  flex: 1;
}

.stat-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 6px;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: var(--el-color-primary);
  margin-bottom: 4px;
}

.stat-compare {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.up {
  color: #67C23A;
}

.down {
  color: #F56C6C;
}
</style>
