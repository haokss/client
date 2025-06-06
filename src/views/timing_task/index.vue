<template>
  <div class="card-wrapper">
      <el-card style="height: 100%; display: flex; flex-direction: column;">
        <div style="display: flex; gap: 10px; flex-wrap: wrap">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索提醒名称或内容"
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
        <el-select v-model="statusFilter" placeholder="提醒状态" style="width: 120px" clearable>
          <el-option label="未完成" :value="0" />
          <el-option label="已完成" :value="1" />
        </el-select>
          <el-button type="primary" @click="createTask">新建提醒</el-button>
          <el-button plain type="danger" @click="deleteSelectedTasks" :disabled="selectedTasks.length === 0">
            删除提醒
          </el-button>
        </div>
        <!-- 表格 -->
          <el-table
            ref="tableRef"
            row-key="date"
            :data="tableData"
            style="width: 100%"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55" />
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
              prop="tag"
              label="类型"
              width="120"
              :filters="typeFilters"
              :filter-method="filterType"
            >
              <template #default="scope">
                <el-tag
                  :type="getTypeTagType(scope.row.type)"
                  disable-transitions
                  >{{ getTypeName(scope.row.type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="content" label="内容" sortable :formatter="formatter" />

            <el-table-column
              prop="tag"
              label="状态"
              width="100"
              :filters="statusFilters"
              :filter-method="filterStatus"
            >
              <template #default="scope">
                <el-tag
                  :type="scope.row.status === 0 ? 'warning' : 'success'"
                  disable-transitions
                  >{{ scope.row.status === 0 ? '未完成' : '已完成'}}</el-tag
                >
              </template>
            </el-table-column>
            <el-table-column fixed="right" label="操作" min-width="120">
              <template #default="scope">
                <el-button link type="primary" size="small" @click="editTask(scope.row)">编辑</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
          <!-- 分页 -->
        <div class="demo-pagination-block">
          <el-pagination
            v-model:current-page="currentPage4"
            v-model:page-size="pageSize4"
            :page-sizes="[10, 20, 30, 50]"
            :size="size"
            :disabled="disabled"
            :background="background"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
  </div>
    <el-drawer v-model="drawerVisible" :title="isEditMode ? '编辑定时提醒' : '新建定时提醒'" size="50%" :with-header="true">
    <el-form :model="form" label-width="auto" style="max-width: 600px">
      <el-form-item label="提醒名称">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="提前">
        <el-input-number v-model="form.early_time" :min="0" :max="10" />
      </el-form-item>
      <el-form-item label="开始时间">
        <el-col :span="11">
          <el-date-picker
            v-model="form.start_date"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
            :disabled-date="disablePastDates"
          />
        </el-col>
        <el-col :span="2" class="text-center">-</el-col>
        <el-col :span="11">
          <el-time-picker
            v-model="form.start_time"
            placeholder="选择小时"
            style="width: 100%"
            format="HH:mm"
            :disabled-hours="disablePastHours"
            :disabled-minutes="disablePastMinutes"
            :disabled-seconds="() => []"
          />
        </el-col>
      </el-form-item>
      <el-form-item label="结束时间">
        <el-col :span="11">
          <el-date-picker
            v-model="form.end_date"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
            :disabled-date="disableBeforeStartDate"
          />
        </el-col>
        <el-col :span="2" class="text-center">-</el-col>
        <el-col :span="11">
          <el-time-picker
            v-model="form.end_time"
            placeholder="选择小时"
            style="width: 100%"
            format="HH:mm"
            :disabled-hours="disableBeforeStartHours"
            :disabled-minutes="disableBeforeStartMinutes"
            :disabled-seconds="() => []"
          />
        </el-col>
      </el-form-item>
      <el-form-item label="类型">
        <el-select v-model="form.type" placeholder="Select" style="width: 240px">
          <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="内容">
        <el-input v-model="form.desc" type="textarea" />
      </el-form-item>
      <el-form-item label="重复频率">
        <el-select v-model="form.repeat_type" placeholder="请选择" style="width: 240px">
          <el-option
            v-for="item in repeatTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="提醒方式">
        <el-select v-model="form.notify_way" placeholder="请选择提醒方式" style="width: 240px">
          <el-option :label="'站内信'" :value="0" />
          <el-option :label="'邮件'" :value="1" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">提交</el-button>
        <el-button @click="drawerVisible = false">取消</el-button>
      </el-form-item>
    </el-form>
  </el-drawer>
</template>

<script setup>
import { ref, onMounted,reactive } from 'vue'
import axios from 'axios'
import router from "@/router";
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { formatLocalDateTime, formatTime } from '@/utils/time'

// 添加时区插件
dayjs.extend(utc)
dayjs.extend(timezone)

// 表格数据
const tableData = ref([])
const total = ref(0)
const currentPage = ref(1)  // 当前页
const pageSize = ref(10)    // 每页条数
const loading = ref(false)
const drawerVisible = ref(false)
const selectedTasks = ref([])  // 存储选中的任务

const tasks_form =ref({
    page_num: currentPage.value,
    page_size: 10,
})

// -----------------------------状态过滤选项
const form = reactive({
  name: '',
  region: '',
  notify_way: 0,
  early_time: 0,
  start_date: null,
  start_time: null,
  end_date: null,
  end_time: null,
  delivery: false,
  type: 0,
  desc: '',
  repeat_type: 'once',
})

const repeatTypeOptions = [
  { value: 'once', label: '仅此一次' },
  { value: 'daily', label: '每天一次' },
  { value: 'weekly', label: '每周一次' },
  { value: 'monthly', label: '每月一次' },
  { value: 'yearly', label: '每年一次' }
]

const typeOptions = [
  { value: 0, label: '日程' },
  { value: 1, label: '生日' },
  { value: 2, label: '纪念日' },
  { value: 3, label: '倒数日' }
]

const statusFilters = [
  { text: '未完成', value: 0 },
  { text: '已完成', value: 1 }
]
// 类型过滤选项
const typeFilters = [
  { text: '日程', value: 0 },
  { text: '生日', value: 1 },
  { text: '纪念日', value: 2 },
  { text: '倒数日', value: 3 }
]

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
// 获取类型对应的标签样式
const getTypeTagType = (type) => {
  const typeTagMap = {
    0: '',        // 默认样式
    1: 'success', // 绿色
    2: 'info',    // 蓝色
    3: 'danger'   // 红色
  }
  return typeTagMap[type] || ''
}
// -----------------------------------------------获取任务数据
const fetchTasks = async () => {
  try {
    const token = sessionStorage.getItem('token'); 
    if (!token) {
      ElMessage.error('用户未登录!');
      return;
    }
    loading.value = true
    // 更新当前页,每页条数
    tasks_form.value.page_num = currentPage.value   
    tasks_form.value.page_size = pageSize.value     
    const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/api/v1/timing_tasks`, tasks_form.value, {
      headers: {
        'Authorization': `${token}`
      }
    })

    if (response.data.code === 200) {
      // 接受任务为空
      if (!response.data.data?.item || response.data.data.item.length === 0) {
        // ElMessage.info('当前没有任务数据');
        tableData.value = [];
        total.value = 0;
        return;
      }

      tableData.value = response.data.data.item.map(item => ({
        id: item.id,
        name: item.title,
        content: item.content,
        type: item.type,
        status: item.code,
        early_time: item.early_time,
        start_time: item.start_time,
        end_time: item.end_time,
        date: item.create_time,
        repeat_type: item.repeat_type || 'once',
      }))
      total.value = response.data.data.total
    }
  } catch (error) {
    ElMessage.error('获取任务失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

// -----------------------------------------过滤方法
const filterStatus = (value, row) => {
  return row.status === value
}
const filterType = (value, row) => {
  return row.type === value
}

// -----------------------------------------分页处理
const handleSizeChange = (newSize) => {
  pageSize.value = newSize 
  fetchTasks()
}
const handleCurrentChange = (newPage) => {
  currentPage.value = newPage
  fetchTasks()
}

// 初始化加载数据
onMounted(() => {
  fetchTasks()
})

// -------------------------------------------新建任务
const createTask = () => {
  resetForm()                 // 清空表单数据
  isEditMode.value = false    // 退出编辑模式
  editingTaskId.value = null  // 清除编辑ID
  drawerVisible.value = true  // 打开抽屉
}

// 点击提交
const onSubmit = async () => {
  try {
    const startTime = formatLocalDateTime(form.start_date, form.start_time)
    const endTime = formatLocalDateTime(form.end_date, form.end_time)
    if (!startTime || !endTime) {
      ElMessage.error('开始/结束时间格式错误')
      return
    }

    const data = {
      title: form.name,
      content: form.desc,
      notify_way: form.notify_way,
      early_time: form.early_time,
      start_time: startTime,
      end_time: endTime,
      type: form.type,
      repeat_type: form.repeat_type,
    }

    const token = sessionStorage.getItem('token')
    let response

    if (isEditMode.value && editingTaskId.value) {
      // 编辑任务
      response = await axios.put(`${process.env.VUE_APP_API_BASE_URL}/api/v1/timing_task/${editingTaskId.value}`, data, {
        headers: { Authorization: `${token}` },
      })
    } else {
      // 新建任务
      response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/api/v1/timing_task`, data, {
        headers: { Authorization: `${token}` },
      })
    }

    if (response.data.code === 200) {
      ElMessage.success(isEditMode.value ? '任务更新成功!' : '任务创建成功!')
      fetchTasks()
      drawerVisible.value = false
      resetForm()
    } else {
      ElMessage.error((isEditMode.value ? '任务更新失败' : '任务创建失败'))
    }
  } catch (error) {
    ElMessage.error('提交失败: ' + error.message)
  }
}

//----------------------------------------编辑定时任务
const isEditMode = ref(false)
const editingTaskId = ref(null)

const editTask = (row) => {
  isEditMode.value = true
  editingTaskId.value = row.id

  // 分拆开始时间和结束时间
  const start = dayjs(row.start_time)
  const end = dayjs(row.end_time)
  console.log(form);
  form.name = row.name
  form.early_time = row.early_time
  form.start_date = start.toDate()
  form.start_time = start.toDate()
  form.end_date = end.toDate()
  form.end_time = end.toDate()
  form.type = row.type
  form.desc = row.content
  form.repeat_type = row.repeat_type || 'once'

  drawerVisible.value = true
}


const resetForm = () => {
  form.name = ''
  form.early_time = 0
  form.start_date = null
  form.start_time = null
  form.end_date = null
  form.end_time = null
  form.type = 0
  form.desc = ''
  isEditMode.value = false
  editingTaskId.value = null
  form.repeat_type = 'once'
}


// -------------------------------------------------删除函数
const handleSelectionChange = (selection) => {
  selectedTasks.value = selection
}

const deleteSelectedTasks = async () => {
  if (selectedTasks.value.length === 0) return

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedTasks.value.length} 个任务吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    const idsToDelete = selectedTasks.value.map(task => task.id)
    const token = sessionStorage.getItem('token')

    const response = await axios.post(
      `${process.env.VUE_APP_API_BASE_URL}/api/v1/timing_task/delete_batch`,
      { ids: idsToDelete },
      {
        headers: {
          Authorization: `${token}`,
        },
      }
    )

    if (response.data.code === 200) {
      ElMessage.success('批量删除成功')
      fetchTasks()
      selectedTasks.value = []
    } else {
      ElMessage.error('删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败: ' + error.message)
    }
  }
}

// -------------------------------------------时间选中限制
const disablePastDates = (date) => {
  return date < new Date().setHours(0, 0, 0, 0)
}

const disablePastHours = () => {
  const now = new Date()
  const selectedDate = form.start_date
  if (dayjs(selectedDate).isSame(dayjs(), 'day')) {
    const hours = []
    for (let i = 0; i < now.getHours(); i++) {
      hours.push(i)
    }
    return hours
  }
  return []
}

const disablePastMinutes = (hour) => {
  const now = new Date()
  const selectedDate = form.start_date
  if (dayjs(selectedDate).isSame(dayjs(), 'day') && hour === now.getHours()) {
    const minutes = []
    for (let i = 0; i < now.getMinutes(); i++) {
      minutes.push(i)
    }
    return minutes
  }
  return []
}

const disableBeforeStartDate = (date) => {
  return date < form.start_date
}

const disableBeforeStartHours = () => {
  const start = dayjs(form.start_date).isSame(form.end_date, 'day') ? dayjs(form.start_time).hour() : 0
  const hours = []
  for (let i = 0; i < start; i++) {
    hours.push(i)
  }
  return hours
}

const disableBeforeStartMinutes = (hour) => {
  const startHour = dayjs(form.start_time).hour()
  const startMinute = dayjs(form.start_time).minute()
  if (hour === startHour) {
    const minutes = []
    for (let i = 0; i < startMinute; i++) {
      minutes.push(i)
    }
    return minutes
  }
  return []
}

</script>


<style scoped>

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

.card-wrapper {
  height: calc(100vh - 120px);
}
</style>