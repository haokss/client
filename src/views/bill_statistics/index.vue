<template>
  <div class="dashboard-container">
    <!-- 顶部数据概览卡片 -->
    <el-row :gutter="20" class="mb-20">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #67C23A20;">
              <el-icon color="#67C23A" :size="24"><Money /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">总收入</div>
              <div class="stat-value">¥{{ formatAmount(stats.totalIncome) }}</div>
              <div class="stat-compare">
                <span :class="stats.incomeChange >= 0 ? 'up' : 'down'">
                  {{ Math.abs(stats.incomeChange) }}%
                  <el-icon :name="stats.incomeChange >= 0 ? 'CaretTop' : 'CaretBottom'" />
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
            <div class="stat-icon" style="background-color: #F56C6C20;">
              <el-icon color="#F56C6C" :size="24"><ShoppingCart /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">总支出</div>
              <div class="stat-value">¥{{ formatAmount(stats.totalExpense) }}</div>
              <div class="stat-compare">
                <span :class="stats.expenseChange >= 0 ? 'up' : 'down'">
                  {{ Math.abs(stats.expenseChange) }}%
                  <el-icon :name="stats.expenseChange >= 0 ? 'CaretTop' : 'CaretBottom'" />
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
            <div class="stat-icon" style="background-color: #409EFF20;">
              <el-icon color="#409EFF" :size="24"><PieChart /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">交易笔数</div>
              <div class="stat-value">{{ stats.totalTransactions }}</div>
              <div class="stat-compare">
                <span :class="stats.transactionChange >= 0 ? 'up' : 'down'">
                  {{ Math.abs(stats.transactionChange) }}%
                  <el-icon :name="stats.transactionChange >= 0 ? 'CaretTop' : 'CaretBottom'" />
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
            <div class="stat-icon" style="background-color: #E6A23C20;">
              <el-icon color="#E6A23C" :size="24"><TrendCharts /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">净收支</div>
              <div class="stat-value" :class="stats.netIncome >= 0 ? 'positive' : 'negative'">
                {{ stats.netIncome >= 0 ? '+' : '' }}¥{{ formatAmount(stats.netIncome) }}
              </div>
              <div class="stat-compare">
                <span :class="stats.netChange >= 0 ? 'up' : 'down'">
                  {{ Math.abs(stats.netChange) }}%
                  <el-icon :name="stats.netChange >= 0 ? 'CaretTop' : 'CaretBottom'" />
                </span>
                较上月
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
              <span>收支趋势</span>
              <el-select v-model="timeRange" size="small" style="width: 120px">
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
              <span>收支比例</span>
            </div>
          </template>
          <div class="chart-container">
            <pie-chart :chart-data="incomeExpenseRatio" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 底部分类统计区 -->
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card shadow="hover" class="category-card">
          <template #header>
            <div class="card-header">
              <span>收/支分类</span>
            </div>
          </template>
          <div class="chart-container">
            <bar-chart :chart-data="combinedCategoryData" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 交易排行榜 -->
    <el-card shadow="hover" class="mt-20">
      <template #header>
        <div class="card-header">
          <span>大额交易排行</span>
          <el-button type="text" @click="viewAllTransactions">查看全部</el-button>
        </div>
      </template>
      <el-table :data="topTransactions" style="width: 100%">
        <el-table-column prop="transactionTime" label="交易时间" width="180" />
        <el-table-column prop="counterparty" label="交易对方" width="150" />
        <el-table-column prop="product" label="商品" width="150" />
        <el-table-column prop="incomeExpense" label="类型" width="100">
          <template #default="{row}">
            <el-tag :type="row.incomeExpense === '收入' ? 'success' : 'danger'" size="small">
              {{ row.incomeExpense }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="金额(元)" width="150">
          <template #default="{row}">
            <span :class="row.incomeExpense === '收入' ? 'income' : 'expense'">
              {{ row.incomeExpense === '收入' ? '+' : '-' }}¥{{ formatAmount(row.amount) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="paymentMethod" label="支付方式" width="120" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { Money, ShoppingCart, TrendCharts } from '@element-plus/icons-vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import LineChart from '@/components/bill_charts/BillLineChart.vue'
import PieChart from '@/components/bill_charts/BillPieChart.vue'
import BarChart from '@/components/bill_charts/BillBarChart.vue'

// 数据状态
const stats = reactive({
  totalIncome: 0,
  totalExpense: 0,
  totalTransactions: 0,
  netIncome: 0,
  incomeChange: 0,
  expenseChange: 0,
  transactionChange: 0,
  netChange: 0
})

const timeRange = ref('30d')
const trendChartData = reactive({
  dates: [],
  income: [],
  expense: []
})

const incomeExpenseRatio = reactive({
  labels: ['收入', '支出'],
  data: []
})

const combinedCategoryData = reactive({
  labels: [],
  datasets: []
})

const incomeCategoryData = reactive({
  labels: [],
  data: []
})

const expenseCategoryData = reactive({
  labels: [],
  data: []
})

const topTransactions = ref([])

// 格式化金额
const formatAmount = (amount) => {
  return Number(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 获取统计数据
const fetchStats = async () => {
  try {
    const token = sessionStorage.getItem('token')
    const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/api/v1/bills/stats`, {
      headers: { Authorization: token },
      params: { range: timeRange.value }
    })
    
    if (response.data.code === 200) {
      Object.assign(stats, response.data.data.stats)
      
      // 填充趋势数据
      trendChartData.dates = response.data.data.trend.dates || []
      trendChartData.income = response.data.data.trend.income || []
      trendChartData.expense = response.data.data.trend.expense || []
      
      // 填充收支比例
      incomeExpenseRatio.data = [
        response.data.data.stats.totalIncome,
        response.data.data.stats.totalExpense
      ]
      
      // 填充分类数据
      const incomeMap = new Map()
      response.data.data.incomeCategories.forEach(item => {
        incomeMap.set(item.category, item.amount)
      })

      const expenseMap = new Map()
      response.data.data.expenseCategories.forEach(item => {
        expenseMap.set(item.category, item.amount)
      })

      const allCategories = Array.from(new Set([
        ...incomeMap.keys(),
        ...expenseMap.keys()
      ]))

      combinedCategoryData.labels = allCategories
      combinedCategoryData.datasets = [
        {
          label: '收入',
          backgroundColor: '#67C23A',
          data: allCategories.map(cat => incomeMap.get(cat) || 0)
        },
        {
          label: '支出',
          backgroundColor: '#F56C6C',
          data: allCategories.map(cat => expenseMap.get(cat) || 0)
        }
      ]
      
      // 填充交易排行
      topTransactions.value = response.data.data.topTransactions
    }
  } catch (error) {
    ElMessage.error('获取统计数据失败: ' + error.message)
  }
}

// 查看全部交易
const viewAllTransactions = () => {
  // 跳转到账单列表页
  console.log('跳转到账单列表')
}

// 初始化加载数据
onMounted(() => {
  fetchStats()
})

// 监听时间范围变化
watch(timeRange, fetchStats)
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
  background-color: #f5f7fa;
}

.mb-20 {
  margin-bottom: 20px;
}

.mt-20 {
  margin-top: 20px;
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

.stat-value.positive {
  color: #67C23A;
}

.stat-value.negative {
  color: #F56C6C;
}

.stat-compare {
  font-size: 12px;
  color: #909399;
}

.up {
  color: #67C23A;
}

.down {
  color: #F56C6C;
}

.chart-card, .category-card {
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

.income {
  color: #67C23A;
}

.expense {
  color: #F56C6C;
}
</style>