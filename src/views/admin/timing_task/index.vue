<template>
  <div class="task-management-container">
    <!-- 操作按钮区域 -->
    <div class="action-buttons">
      <el-button 
        type="success" 
        @click="batchApproveTasks(true)" 
        :disabled="selectedTasks.length === 0"
      >
        批量通过
      </el-button>
      <el-button 
        type="danger" 
        @click="batchApproveTasks(false)" 
        :disabled="selectedTasks.length === 0"
      >
        批量拒绝
      </el-button>
      <el-button 
        type="warning" 
        @click="deleteSelectedTasks" 
        :disabled="selectedTasks.length === 0"
      >
        批量删除
      </el-button>
    </div>

    <!-- 任务表格 -->
    <el-table
      ref="tableRef"
      row-key="id"
      :data="tableData"
      style="width: 100%"
      @selection-change="handleSelectionChange"
      v-loading="loading"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="user_name" label="用户名称" sortable width="180" />
      <el-table-column
        prop="start_time"
        label="开始时间"
        sortable
        width="180"
        :formatter="(row) => formatTime(row.start_time)"
      />
      <el-table-column
        prop="end_time"
        label="结束时间"
        sortable
        width="180"
        :formatter="(row) => formatTime(row.end_time)"
      />
      <el-table-column prop="name" label="任务名称" sortable width="180" />
      <el-table-column
        prop="type"
        label="类型"
        width="120"
        :filters="typeFilters"
        :filter-method="filterType"
      >
        <template #default="scope">
          <el-tag :type="getTypeTagType(scope.row.type)" disable-transitions>
            {{ getTypeName(scope.row.type) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="content" label="内容" />

      <!-- 审核状态列 -->
      <el-table-column
        prop="status"
        label="审核状态"
        width="120"
        :filters="statusFilters"
        :filter-method="filterStatus"
      >
        <template #default="scope">
          <el-tag :type="getStatusTagType(scope.row.is_checked)" disable-transitions>
            {{ getStatusName(scope.row.is_checked) }}
          </el-tag>
        </template>
      </el-table-column>

      <!-- 操作列（审核通过/拒绝 + 删除） -->
      <el-table-column fixed="right" label="操作" width="350">
        <template #default="scope">
          <el-button
            size="small"
            @click="approveTask(scope.row, true)"
            :disabled="scope.row.is_checked !== 0"
          >
            审核通过
          </el-button>
          <el-button
            size="small"
            @click="approveTask(scope.row, false)"
            :disabled="scope.row.is_checked !== 0"
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

    <!-- 分页 -->
    <div class="pagination-block">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 30, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 新建/编辑任务抽屉（保留原有逻辑） -->
    <el-drawer v-model="drawerVisible" :title="isEditMode ? '编辑任务' : '新建任务'" size="50%">
      <!-- 表单内容保持不变 -->
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

// ---------------------------- 表格数据 & 分页
const tableData = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)
const selectedTasks = ref([]) // 选中的任务

// ---------------------------- 审核状态选项
const statusFilters = [
  { text: '待审核', value: 0 },
  { text: '已通过', value: 1 },
  { text: '已拒绝', value: 2 }
]

const handleSelectionChange = (selection) => {
  selectedTasks.value = selection
}

const formatTime = (time) => {
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
}

// 获取类型名称
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

// ---------------------------- 获取审核状态名称
const getStatusName = (status) => {
  const statusMap = { 0: '待审核', 1: '已通过', 2: '已拒绝' }
  return statusMap[status] || '未知状态'
}

// ---------------------------- 获取审核状态标签样式
const getStatusTagType = (status) => {
  const statusTagMap = { 0: 'warning', 1: 'success', 2: 'danger' }
  return statusTagMap[status] || ''
}

// ---------------------------- 获取任务数据
const fetchTasks = async () => {
  try {
    loading.value = true
    const token = sessionStorage.getItem('token')
    const response = await axios.post(
      `${process.env.VUE_APP_API_BASE_URL}/api/v1/admin/timing_task/all_timing_tasks`,
      { page_num: currentPage.value, page_size: pageSize.value },
      { headers: { Authorization: token } }
    )
    if (response.data.code === 200) {
      tableData.value = response.data.data?.timing_tasks?.map(item => ({
        id: item.id,
        user_name : item.user_name,
        name: item.title,
        content: item.content,
        type: item.type,
        is_checked: item.is_checked,
        start_time: item.start_time,
        end_time: item.end_time
      })) || []
      total.value = response.data.data?.total || 0
    }
  } catch (error) {
    ElMessage.error('获取任务失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

// ---------------------------- 单个任务审核
const approveTask = async (task, isApproved) => {
  try {
    const token = sessionStorage.getItem('token')
    const response = await axios.post(
      `${process.env.VUE_APP_API_BASE_URL}/api/v1/admin/timing_task/audit/batch`,
      {
        is_checked: isApproved ? 1 : 2,
        audit_items: [
          {
            target_user_id: task.uid, // 确保接口需要 uid，这里需要从接口返回中提供
            task_id: [task.id]
          }
        ]
      },
      { headers: { Authorization: token } }
    )

    if (response.data.code === 200) {
      ElMessage.success(`任务已${isApproved ? '通过' : '拒绝'}`)
      fetchTasks()
    } else {
      ElMessage.error('操作失败: ' + response.data.msg)
    }
  } catch (error) {
    ElMessage.error('操作失败: ' + error.message)
  }
}

// ---------------------------- 批量审核
const batchApproveTasks = async (isApproved) => {
  if (selectedTasks.value.length === 0) return

  try {
    await ElMessageBox.confirm(
      `确定要${isApproved ? '通过' : '拒绝'} ${selectedTasks.value.length} 个任务吗？`,
      '提示',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
    )

    const token = sessionStorage.getItem('token')

    // 按用户分组
    const auditItemsMap = {}
    selectedTasks.value.forEach(task => {
      if (!auditItemsMap[task.uid]) {
        auditItemsMap[task.uid] = []
      }
      auditItemsMap[task.uid].push(task.id)
    })

    const auditItems = Object.keys(auditItemsMap).map(userId => ({
      target_user_id: Number(userId),
      task_id: auditItemsMap[userId]
    }))

    const response = await axios.post(
      `${process.env.VUE_APP_API_BASE_URL}/api/v1/admin/timing_task/audit/batch`,
      {
        is_checked: isApproved ? 1 : 2,
        audit_items: auditItems
      },
      { headers: { Authorization: token } }
    )

    if (response.data.code === 200) {
      ElMessage.success(`批量${isApproved ? '通过' : '拒绝'}成功`)
      fetchTasks()
      selectedTasks.value = []
    } else {
      ElMessage.error('操作失败: ' + response.data.msg)
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败: ' + error.message)
    }
  }
}


// ---------------------------- 删除任务
const deleteTask = async (task) => {
  try {
    await ElMessageBox.confirm(`确定删除任务 "${task.name}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const token = sessionStorage.getItem('token')
    const response = await axios.post(
      `${process.env.VUE_APP_API_BASE_URL}/api/v1/timing_task/delete`,
      { id: task.id },
      { headers: { Authorization: token } }
    )

    if (response.data.code === 200) {
      ElMessage.success('删除成功')
      fetchTasks()
    } else {
      ElMessage.error('删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败: ' + error.message)
    }
  }
}

// ---------------------------- 初始化加载
onMounted(() => {
  fetchTasks()
})
</script>
<style scoped>
.el-pagination {
  margin-top: 20px;
  justify-content: flex-end;
}

.scrollbar-demo-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50px;
  margin: 10px;
  text-align: center;
  border-radius: 4px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}
</style>