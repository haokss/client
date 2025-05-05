<template>
  <div>
    <!-- 工具栏 -->
    <div class="toolbar">
      <div style="display: flex; gap: 10px; flex-wrap: wrap">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索任务名称或内容"
          clearable
          @input="handleSearch"
          style="width: 200px"
        />
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 240px"
          unlink-panels
          value-format="YYYY-MM-DD"
        />
        <el-select v-model="statusFilter" placeholder="任务状态" style="width: 120px" clearable>
          <el-option label="未完成" :value="0" />
          <el-option label="已完成" :value="1" />
        </el-select>
      </div>
      <el-button type="primary" @click="drawerVisible = true">新建任务</el-button>
    </div>

    <!-- 固定高度卡片区域 + 分页 -->
    <div class="task-container">
      <el-row :gutter="20">
        <el-col v-for="task in pagedTasks" :key="task.id" :span="8" class="task-card">
          <el-card shadow="hover">
            <div class="card-header">
              <span class="task-title">{{ task.name }}</span>
              <el-tag :type="task.status === 0 ? 'warning' : 'success'" size="small">
                {{ task.status === 0 ? '未完成' : '已完成' }}
              </el-tag>
            </div>
            <div class="task-content">{{ task.content }}</div>
            <div class="task-footer">
              <span class="task-date">{{ task.date }}</span>
              <div>
                <el-button link size="small" @click="deleteTask(task)">删除</el-button>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 分页器 -->
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :page-sizes="[6, 12, 18]"
      layout="total, sizes, prev, pager, next, jumper"
      :total="filteredTasks.length"
      :background="true"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />

    <!-- 新建任务抽屉 -->
    <el-drawer v-model="drawerVisible" title="新建任务" direction="rtl" size="40%">
      <el-form :model="form" label-width="100px">
        <el-form-item label="任务名称">
          <el-input v-model="form.name" placeholder="请输入任务名称" />
        </el-form-item>
        <el-form-item label="计划时间">
          <el-date-picker
            v-model="form.date"
            type="datetime"
            placeholder="选择时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="任务状态">
          <el-switch v-model="form.status" active-text="已完成" inactive-text="未完成" />
        </el-form-item>
        <el-form-item label="任务内容">
          <el-input v-model="form.desc" type="textarea" placeholder="请输入任务内容" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">提交</el-button>
          <el-button @click="drawerVisible = false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'

const tableData = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(6) // 每页默认显示6个卡片
const searchKeyword = ref('')
const drawerVisible = ref(false)

const form = reactive({
  name: '',
  date: '',
  status: false,
  desc: '',
})

const dateRange = ref([])
const statusFilter = ref(null)

const fetchTasks = async () => {
  const token = sessionStorage.getItem('token')
  if (!token) return ElMessage.error('未登录')

  try {
    const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/api/v1/tasks`, {}, {
      headers: { Authorization: token },
    })

    if (response.data.code === 200) {
      tableData.value = response.data.data.item.map(item => ({
        id: item.id,
        name: item.title,
        content: item.content,
        status: item.code,
        date: formatTimestamp(item.create_time),
      }))
      total.value = response.data.data.total
    }
  } catch (error) {
    ElMessage.error('获取任务失败: ' + error.message)
  }
}

const formatTimestamp = (ts) => {
  const date = new Date(ts * 1000)
  return date.toLocaleDateString()
}

const filteredTasks = computed(() => {
  return tableData.value.filter(task => {
    const keywordMatch = task.name.includes(searchKeyword.value) || task.content.includes(searchKeyword.value)

    const dateMatch = (() => {
      if (dateRange.value.length !== 2) return true
      const taskDate = new Date(task.date).getTime()
      const start = new Date(dateRange.value[0]).getTime()
      const end = new Date(dateRange.value[1]).getTime()
      return taskDate >= start && taskDate <= end
    })()

    const statusMatch = statusFilter.value === null ? true : task.status === statusFilter.value

    return keywordMatch && dateMatch && statusMatch
  })
})

// 分页后的任务
const pagedTasks = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredTasks.value.slice(start, end)
})

const onSubmit = async () => {
  const token = sessionStorage.getItem('token')
  if (!form.name || !form.desc) return ElMessage.warning('请填写任务名称和内容')

  const data = {
    title: form.name,
    content: form.desc,
    code: form.status ? 1 : 0,
  }

  try {
    const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/api/v1/task`, data, {
      headers: { Authorization: token },
    })
    if (response.data.code === 200) {
      ElMessage.success('创建成功')
      drawerVisible.value = false
      fetchTasks()
    } else {
      ElMessage.error('创建失败')
    }
  } catch (err) {
    ElMessage.error('提交出错: ' + err.message)
  }
}

const handleSizeChange = (val) => {
  pageSize.value = val
}
const handleCurrentChange = (val) => {
  currentPage.value = val
}

const deleteTask = async (task) => {
  ElMessageBox.confirm(`确认删除任务「${task.name}」吗？`, '删除确认', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    const token = sessionStorage.getItem('token')
    try {
      const response = await axios.delete(`${process.env.VUE_APP_API_BASE_URL}/api/v1/task/${task.id}`, {
        headers: { Authorization: token },
      })
      if (response.data.code === 200) {
        ElMessage.success('删除成功')
        fetchTasks()
      } else {
        ElMessage.error('删除失败：' + response.data.message)
      }
    } catch (error) {
      ElMessage.error('请求失败：' + error.message)
    }
  })
}

onMounted(fetchTasks)
</script>

<style scoped>
.task-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.task-title {
  font-weight: bold;
  font-size: 16px;
}

.task-container {
  height: 600px;
  overflow: hidden;
  margin-bottom: 80px; /* 为底部分页器预留空间 */
}

.task-footer {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

/* 关键：卡片容器限制高度 + 滚动 */
.task-container {
  max-height: 600px;
  overflow-y: auto;
  margin-bottom: 20px;
}

.pagination-wrapper {
  position: fixed;
  bottom: 20px;
  left: 0;
  width: 100%;
  text-align: center;
  background-color: #fff; /* 可选：防止透明 */
  z-index: 999;
  padding: 10px 0;
  box-shadow: 0 -1px 6px rgba(0, 0, 0, 0.1);
}
</style>
