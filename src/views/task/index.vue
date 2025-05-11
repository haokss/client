<template>
  <div>
    <!-- 工具栏 -->
    <div class="toolbar">
      <div style="display: flex; gap: 10px; flex-wrap: wrap">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索活动名称或内容"
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
        <el-select v-model="statusFilter" placeholder="活动状态" style="width: 120px" clearable>
          <el-option label="未完成" :value="0" />
          <el-option label="已完成" :value="1" />
        </el-select>
        <el-button type="primary" @click="drawerVisible = true">新建活动</el-button>
      </div>
    </div>

    <!-- 固定高度卡片区域 + 分页 -->
    <div class="task-container">
      <template v-if="pagedTasks.length > 0">
      <el-row :gutter="20">
        <el-col v-for="task in pagedTasks" :key="task.id" :span="8" class="task-card">
          <el-card shadow="hover">
            <div class="card-header">
              <span class="task-title">{{ task.name }}</span>
              <el-tag :type="task.status === 0 ? 'warning' : 'success'" size="small">
                {{ task.status === 0 ? '未完成' : '已完成' }}
              </el-tag>
              <el-tag v-if="isOverdue(task)" type="danger" size="small">逾期</el-tag>
            </div>
            <div class="task-content">{{ task.content }}</div>
            <div class="task-footer">
              <span class="task-date">{{ task.date }}</span>
              <div>
                <el-button link size="small" @click="viewTask(task)">编辑</el-button>
                <el-button link size="small" @click="deleteTask(task)">删除</el-button>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
      </template>
      <template v-else>
        <div class="empty-state">
          <el-empty description="暂无活动" />
        </div>
      </template>
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

    <!-- 新建活动抽屉 -->
    <el-drawer v-model="drawerVisible" :title="isEditMode ? '编辑活动' : '新建活动'" direction="rtl" size="40%">
      <el-form :model="form" label-width="100px">
        <el-form-item label="活动名称">
          <el-input v-model="form.name" placeholder="请输入活动名称" />
        </el-form-item>
        <el-form-item label="开始时间">
          <el-date-picker
            v-model="form.date"
            type="date"
            placeholder="选择时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-date-picker
            v-model="form.endTime"
            type="date"
            placeholder="选择结束时间（不选则为开始时间）"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="优先级">
          <div style="width: 100%">
            <el-slider
              v-model="form.priority"
              :min="0"
              :max="5"
              show-stops
              :marks="{
                0: '最高',
                1: '高',
                2: '中高',
                3: '中',
                4: '中低',
                5: '最低'
              }"
            />
            <div style="text-align: right; font-size: 12px; color: #999;">（0 为最高优先级，5 为最低优先级）</div>
          </div>
        </el-form-item>
        <el-form-item label="活动状态">
          <el-switch v-model="form.status" active-text="已完成" inactive-text="未完成" />
        </el-form-item>
        <el-form-item label="活动内容">
          <el-input v-model="form.desc" type="textarea" placeholder="请输入活动内容" />
        </el-form-item>
        <el-form-item label="是否提醒">
        <el-switch v-model="form.isNotify" active-text="开启" inactive-text="关闭" />
        </el-form-item>

        <el-form-item label="提醒方式">
          <el-select v-model="form.notifyWay" placeholder="选择提醒方式" style="width: 100%" :disabled="!form.isNotify">
            <el-option label="站内信" :value="0" />
            <el-option label="邮件" :value="1" />
          </el-select>
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
  id: null,
  name: '',
  date: '',       // StartTime
  endTime: '',    // 新增
  status: false,
  desc: '',
  priority: 5,    // 新增
  isNotify: false, // 新增，用布尔值表示
  notifyWay: 0,   // 新增
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
      tableData.value = (response.data.data.item ?? []).map(item => ({
        id: item.id,
        name: item.title,
        content: item.content,
        status: item.code,
        date: formatTimestamp(item.create_time),
        endTime: item.end_time,  // 新增，秒级时间戳
      }))
      total.value = response.data.data.total
    }
  } catch (error) {
    ElMessage.error('获取活动失败: ' + error.message)
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

// 分页后的活动
const pagedTasks = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredTasks.value.slice(start, end)
})

// --------------------------------------------------新增和修改活动提交
const onSubmit = async () => {
  const token = sessionStorage.getItem('token')
  if (!form.name || !form.desc) return ElMessage.warning('请填写活动名称和内容')

  const data = {
      title: form.name,
      content: form.desc,
      code: form.status ? 1 : 0,
      priority: form.priority,
      is_notify: form.isNotify ? 1 : 0,
      notify_way: form.notifyWay,
      start_time: Math.floor(new Date(form.date).setHours(0, 0, 0, 0) / 1000),
      end_time: form.endTime
        ? Math.floor(new Date(form.endTime).setHours(0, 0, 0, 0) / 1000)
        : Math.floor(new Date(form.date).setHours(0, 0, 0, 0) / 1000),
  }

  try {
    let response
    if (isEditMode.value && form.id) {
      response = await axios.put(`${process.env.VUE_APP_API_BASE_URL}/api/v1/task/${form.id}`, data, {
        headers: { Authorization: token },
      })
    } else {
      response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/api/v1/task`, data, {
        headers: { Authorization: token },
      })
    }

    if (response.data.code === 200) {
      ElMessage.success(isEditMode.value ? '更新成功' : '创建成功')
      drawerVisible.value = false
      resetForm()
      fetchTasks()
    } else {
      ElMessage.error((isEditMode.value ? '更新失败：' : '创建失败：') + response.data.message)
    }
  } catch (err) {
    ElMessage.error('提交出错: ' + err.message)
  }
}

const resetForm = () => {
  form.id = null
  form.name = ''
  form.date = ''
  form.status = false
  form.desc = ''
  isEditMode.value = false
}

const handleSizeChange = (val) => {
  pageSize.value = val
}
const handleCurrentChange = (val) => {
  currentPage.value = val
}

const deleteTask = async (task) => {
  ElMessageBox.confirm(`确认删除活动「${task.name}」吗？`, '删除确认', {
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

//---------------------------------------编辑活动
const isEditMode = ref(false)  // 判断是新建还是编辑

const viewTask = async (task) => {
  const token = sessionStorage.getItem('token')
  try {
    const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/api/v1/task/${task.id}`, {
      headers: { Authorization: token },
    })
    if (response.data.code === 200) {
      const data = response.data.data
      form.id = data.id
      form.name = data.title
      form.date = new Date(data.create_time * 1000)  // 注意转换时间戳
      form.status = data.code === 1
      form.desc = data.content
      form.priority = data.priority ?? 5
      form.isNotify = data.is_notify === 1
      form.notifyWay = data.notify_way ?? 0
      form.endTime = data.end_time ? new Date(data.end_time * 1000) : new Date(data.create_time * 1000)
      isEditMode.value = true
      drawerVisible.value = true
    } else {
      ElMessage.error('获取活动详情失败：' + response.data.message)
    }
  } catch (error) {
    ElMessage.error('请求失败：' + error.message)
  }
}

//-------------------------------------逾期判断函数
const isOverdue = (task) => {
  const now = Math.floor(Date.now() / 1000)  // 当前时间（秒）
  return task.status === 0 && task.endTime && now > task.endTime
}

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

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 80px 0;
}
</style>
