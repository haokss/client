<template>
  <div class="dashboard-container">
    <!-- 顶部数据概览 -->
    <el-row :gutter="20" class="mb-20">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #409EFF20;">
              <el-icon color="#409EFF" :size="24"><Calendar /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">总活动数</div>
              <div class="stat-value">{{ stats.totalTasks }}</div>
              <div class="stat-compare">
                <span :class="stats.taskChange >= 0 ? 'up' : 'down'">
                  {{ Math.abs(stats.taskChange) }}%
                  <el-icon :name="stats.taskChange >= 0 ? 'CaretTop' : 'CaretBottom'" />
                </span>
                较上月
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #67C23A20;">
              <el-icon color="#67C23A" :size="24"><Checked /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">已完成</div>
              <div class="stat-value">{{ stats.completedTasks }}</div>
              <div class="stat-rate">
                完成率 {{ stats.completionRate }}%
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
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
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #F56C6C20;">
              <el-icon color="#F56C6C" :size="24"><Warning /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">逾期活动</div>
              <div class="stat-value">{{ stats.overdueTasks }}</div>
              <div class="stat-compare">
                <span :class="stats.overdueChange >= 0 ? 'up' : 'down'">
                  {{ Math.abs(stats.overdueChange) }}%
                  <el-icon :name="stats.overdueChange >= 0 ? 'CaretTop' : 'CaretBottom'" />
                </span>
                较上周
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 中间图表区 -->
    <el-row :gutter="20" class="mb-20">
      <el-col :span="16">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span>计划活动趋势</span>
              <el-select v-model="trendTimeRange" size="small" style="width: 120px">
                <el-option label="近7天" value="7d" />
                <el-option label="近30天" value="30d" />
                <el-option label="近90天" value="90d" />
              </el-select>
            </div>
          </template>
          <div class="chart-container">
            <line-chart :chart-data="trendChartData" />
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span>定时活动类型分布</span>
            </div>
          </template>
          <div class="chart-container">
            <pie-chart :chart-data="typeDistributionData" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 底部表格区 -->
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card shadow="hover" class="table-card">
          <template #header>
            <div class="card-header">
              <span>即将到期活动</span>
              <el-button type="text" @click="viewAllUpcoming">查看全部</el-button>
            </div>
          </template>
          <el-table :data="upcomingTasks" height="300" style="width: 100%">
            <el-table-column prop="name" label="活动名称" width="180" />
            <el-table-column prop="end_time" label="截止时间" width="180">
              <template #default="{row}">
                {{ formatTime(row.end_time) }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{row}">
                <el-tag :type="row.status === 0 ? 'warning' : 'success'" size="small">
                  {{ row.status === 0 ? '未完成' : '已完成' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80">
              <template #default="{row}">
                <el-button link type="primary" size="small" @click="viewTaskDetail(row)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover" class="table-card">
          <template #header>
            <div class="card-header">
              <span>高优先级活动</span>
              <el-button type="text" @click="viewAllHighPriority">查看全部</el-button>
            </div>
          </template>
          <el-table :data="highPriorityTasks" height="300" style="width: 100%">
            <el-table-column prop="name" label="活动名称" width="180" />
            <el-table-column prop="type" label="类型" width="120">
              <template #default="{row}">
                <el-tag :type="getTypeTagType(row.type)" size="small">
                  {{ getTypeName(row.type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="end_time" label="截止时间" width="180">
              <template #default="{row}">
                {{ formatTime(row.end_time) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80">
              <template #default="{row}">
                <el-button link type="primary" size="small" @click="viewTaskDetail(row)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { Calendar, Checked, Clock, Warning, CaretTop, CaretBottom } from '@element-plus/icons-vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import LineChart from '@/components/charts/LineChart.vue'
import PieChart from '@/components/charts/PieChart.vue'

// 数据状态
const stats = reactive({
  totalTasks: 0,
  completedTasks: 0,
  inProgressTasks: 0,
  overdueTasks: 0,
  completionRate: 0,
  taskChange: 0,
  progressChange: 0,
  overdueChange: 0
})

const trendTimeRange = ref('30d')
const trendChartData = reactive({
  dates: [],
  completed: [],
  created: []
})

const typeDistributionData = reactive({
  labels: [],
  data: []
})

const upcomingTasks = ref([])
const highPriorityTasks = ref([])

// 获取统计数据
const fetchStats = async () => {
  try {
    const token = sessionStorage.getItem('token')
    const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/api/v1/tasks/stats`, {
      headers: { Authorization: token }
    })
    
    if (response.data.code === 200) {
      Object.assign(stats, response.data.data)
    }
  } catch (error) {
    ElMessage.error('获取统计数据失败: ' + error.message)
  }
}

// 获取趋势数据
const fetchTrendData = async () => {
  try {
    const token = sessionStorage.getItem('token')
    const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/api/v1/tasks/trend`, {
      params: { range: trendTimeRange.value },
      headers: { Authorization: token }
    })
    
    if (response.data.code === 200) {
      trendChartData.dates = response.data.data.dates
      trendChartData.completed = response.data.data.completed
      trendChartData.created = response.data.data.created
    }
  } catch (error) {
    ElMessage.error('获取趋势数据失败: ' + error.message)
  }
}

// 获取类型分布数据
const fetchTypeDistribution = async () => {
  try {
    const token = sessionStorage.getItem('token')
    const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/api/v1/tasks/type-distribution`, {
      headers: { Authorization: token }
    })
    
    if (response.data.code === 200) {
      const { counts, types } = response.data.data

      // 更新 typeDistributionData
      typeDistributionData.labels = types.map(type => getTypeName(type)) // 将类型转化为标签
      typeDistributionData.data = counts // 直接使用 counts 作为数据
    }
  } catch (error) {
    ElMessage.error('获取类型分布数据失败: ' + error.message)
  }
}


// 获取即将到期活动
const fetchUpcomingTasks = async () => {
  try {
    const token = sessionStorage.getItem('token')
    const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/api/v1/tasks/upcoming`, {
      headers: { Authorization: token }
    })
    
    if (response.data.code === 200) {
      upcomingTasks.value = response.data.data
    }
  } catch (error) {
    ElMessage.error('获取即将到期活动失败: ' + error.message)
  }
}

// 获取高优先级活动
const fetchHighPriorityTasks = async () => {
  try {
    const token = sessionStorage.getItem('token')
    const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/api/v1/tasks/high-priority`, {
      headers: { Authorization: token }
    })
    
    if (response.data.code === 200) {
      highPriorityTasks.value = response.data.data
    }
  } catch (error) {
    ElMessage.error('获取高优先级活动失败: ' + error.message)
  }
}

// 时间格式化
const formatTime = (timestamp) => {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm')
}

// 查看活动详情
const viewTaskDetail = (task) => {
  // 跳转到活动详情页或打开抽屉
  console.log('查看活动详情:', task)
}

// 查看全部即将到期活动
const viewAllUpcoming = () => {
  // 跳转到活动列表页并筛选即将到期活动
  console.log('查看全部即将到期活动')
}

// 查看全部高优先级活动
const viewAllHighPriority = () => {
  // 跳转到活动列表页并筛选高优先级活动
  console.log('查看全部高优先级活动')
}

// 从之前的代码中复用这些方法
const getTypeName = (type) => {
  const typeMap = {
    0: '日程',
    1: '生日',
    2: '纪念日',
    3: '倒数日'
  }
  return typeMap[type] || '未知类型'
}

const getTypeTagType = (type) => {
  const typeTagMap = {
    0: '',        // 默认样式
    1: 'success', // 绿色
    2: 'info',    // 蓝色
    3: 'danger'   // 红色
  }
  return typeTagMap[type] || ''
}

// 初始化加载数据
onMounted(() => {
  fetchStats()
  fetchTrendData()
  fetchTypeDistribution()
  fetchUpcomingTasks()
  fetchHighPriorityTasks()
})
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
  background-color: #f5f7fa;
}

.mb-20 {
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 8px;
  border: none;
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
  margin-right: 16px;
}

.stat-info {
  flex: 1;
}

.stat-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 4px;
}

.stat-rate, .stat-compare {
  font-size: 12px;
  color: #909399;
}

.stat-rate {
  color: #67C23A;
}

.up {
  color: #F56C6C;
}

.down {
  color: #67C23A;
}

.chart-card, .table-card {
  border-radius: 8px;
  border: none;
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  height: 300px;
}
</style>