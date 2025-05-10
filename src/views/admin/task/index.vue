<template>
  <div>
    <!-- 工具栏 -->
    <div class="toolbar">
      <div style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center">
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
        <el-select v-model="statusFilter" placeholder="审核状态" style="width: 150px" clearable>
          <el-option label="未审核" :value="0" />
          <el-option label="审核通过" :value="1" />
          <el-option label="审核未通过" :value="2" />
        </el-select>
        <el-button type="success" @click="batchAudit(1)" :disabled="multipleSelection.length === 0">
          批量审核通过
        </el-button>
        <el-button type="danger" @click="batchAudit(2)" :disabled="multipleSelection.length === 0">
          批量审核不通过
        </el-button>
      </div>
    </div>

    <!-- 活动表格 -->
    <el-table
      :data="pagedTasks"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="50" />
      <el-table-column prop="username" label="用户名" width="150" />
      <el-table-column prop="name" label="活动名称" width="180" />
      <el-table-column prop="startDate" label="开始时间" width="150" />
      <el-table-column prop="endDate" label="结束时间" width="150" />
      <el-table-column prop="content" label="活动内容" />
      <el-table-column label="审核状态" width="120">
        <template #default="scope">
          <el-tag
            :type="scope.row.is_checked === 0 ? 'info' : (scope.row.is_checked === 1 ? 'success' : 'danger')"
          >
            {{ scope.row.is_checked === 0 ? '未审核' : (scope.row.is_checked === 1 ? '审核通过' : '审核未通过') }}
          </el-tag>
        </template>
      </el-table-column>
        <el-table-column label="操作" width="260">
          <template #default="scope">
            <el-button
              size="small"
              @click="batchAuditSingle(scope.row, 1)"
            >
              审核通过
            </el-button>
            <el-button
              size="small"
              @click="batchAuditSingle(scope.row, 2)"
            >
              审核不通过
            </el-button>
            <el-button
              size="small"
              @click="deleteTask(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
    </el-table>

    <!-- 分页器 -->
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :page-sizes="[5, 10, 20]"
      layout="total, sizes, prev, pager, next, jumper"
      :total="filteredTasks.length"
      :background="true"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'

const tableData = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const searchKeyword = ref('')
const dateRange = ref([])
const statusFilter = ref(null)
const multipleSelection = ref([])

const fetchTasks = async () => {
  const token = sessionStorage.getItem('token')
  if (!token) return ElMessage.error('未登录')

  try {
    const res = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/api/v1/admin/task/all_tasks`, {
      headers: { Authorization: token },
    })
    if (res.data.code === 200) {
      tableData.value = res.data.data.tasks.map(item => ({
        id: item.id,
        name: item.title,
        content: item.content,
        username: item.user_name,
        user_id: item.uid, 
        status: item.status,
        is_checked: item.is_checked,
        startDate: formatDate(item.start_time),
        endDate: item.end_time ? formatDate(item.end_time) : '-',
      }))
    }
  } catch (err) {
    ElMessage.error('获取任务失败：' + err.message)
  }
}

const formatDate = ts => {
  const date = new Date(ts * 1000)
  return date.toLocaleDateString()
}

const filteredTasks = computed(() => {
  return tableData.value.filter(task => {
    const keywordMatch = task.name.includes(searchKeyword.value) || task.content.includes(searchKeyword.value)
    const dateMatch = (() => {
      if (dateRange.value.length !== 2) return true
      const taskTime = new Date(task.startDate).getTime()
      const start = new Date(dateRange.value[0]).getTime()
      const end = new Date(dateRange.value[1]).getTime()
      return taskTime >= start && taskTime <= end
    })()
    const statusMatch = statusFilter.value === null ? true : task.is_checked === statusFilter.value
    return keywordMatch && dateMatch && statusMatch
  })
})

const pagedTasks = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredTasks.value.slice(start, end)
})

const handleSizeChange = val => { pageSize.value = val }
const handleCurrentChange = val => { currentPage.value = val }
const handleSelectionChange = val => { multipleSelection.value = val }

const batchAuditSingle = async (task, checkStatus) => {
  multipleSelection.value = [task]
  await batchAudit(checkStatus)
  multipleSelection.value = []
}

const deleteTask = async task => {
  ElMessageBox.confirm(`确认删除活动「${task.name}」吗？`, '删除确认', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    const token = sessionStorage.getItem('token')
    try {
      const res = await axios.delete(`${process.env.VUE_APP_API_BASE_URL}/api/v1/task/${task.id}`, {
        headers: { Authorization: token },
      })
      if (res.data.code === 200) {
        ElMessage.success('删除成功')
        fetchTasks()
      } else {
        ElMessage.error('删除失败：' + res.data.message)
      }
    } catch (err) {
      ElMessage.error('请求失败：' + err.message)
    }
  })
}

// -------------------------------------------提交审核
const batchAudit = async (checkStatus) => {
  if (multipleSelection.value.length === 0) {
    return ElMessage.warning('请先选择要审核的任务')
  }

  // 分组 { userId: [taskId1, taskId2, ...] }
  const grouped = {}
  multipleSelection.value.forEach(task => {
    if (!grouped[task.user_id]) {
      grouped[task.user_id] = []
    }
    grouped[task.user_id].push(task.id)
  })

  // 构造 audit_items
  const auditItems = Object.entries(grouped).map(([userId, taskIds]) => ({
    target_user_id: Number(userId),
    task_id: taskIds,
  }))

  const token = sessionStorage.getItem('token')
  if (!token) return ElMessage.error('未登录')

  try {
    const res = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/api/v1/admin/task/audit/batch`, {
      is_checked: checkStatus,
      audit_items: auditItems,
    }, {
      headers: { Authorization: token },
    })

    if (res.data.code === 200) {
      ElMessage.success('批量审核成功')
      fetchTasks()
    } else {
      ElMessage.error('审核失败：' + res.data.message)
    }
  } catch (err) {
    ElMessage.error('请求失败：' + err.message)
  }
}


onMounted(fetchTasks)
</script>

<style scoped>
.toolbar {
  margin-bottom: 20px;
}
</style>
