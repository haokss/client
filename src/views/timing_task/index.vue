<template>
  <el-button @click="createTask">新建任务</el-button>
  <el-button @click="deleteSelectedTasks" :disabled="selectedTasks.length === 0">
    删除活动
  </el-button>
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
        <template #default>
          <el-button link type="primary" size="small" @click="handleClick">详情</el-button>
          <el-button link type="primary" size="small">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>
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
    <el-drawer v-model="drawerVisible" title="新建定时活动" size="50%" :with-header="true">
    <el-form :model="form" label-width="auto" style="max-width: 600px">
      <el-form-item label="任务名称">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="提醒">
        <el-input-number v-model="form.early_time" :min="0" :max="10" />
      </el-form-item>
      <el-form-item label="开始时间">
        <el-col :span="11">
          <el-date-picker v-model="form.start_date" type="date" placeholder="选择日期" style="width: 100%" />
        </el-col>
        <el-col :span="2" class="text-center">-</el-col>
        <el-col :span="11">
          <el-time-picker v-model="form.start_time" placeholder="选择小时" style="width: 100%" format="HH:mm" />
        </el-col>
      </el-form-item>
      <el-form-item label="结束时间">
        <el-col :span="11">
          <el-date-picker v-model="form.end_date" type="date" placeholder="选择日期" style="width: 100%" />
        </el-col>
        <el-col :span="2" class="text-center">-</el-col>
        <el-col :span="11">
          <el-time-picker v-model="form.end_time" placeholder="选择小时" style="width: 100%" format="HH:mm" />
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
})


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
        start_time: item.start_time,
        end_time: item.end_time,
        date: item.create_time
      }))
      total.value = response.data.data.total
    }
  } catch (error) {
    ElMessage.error('获取任务失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

// ------------------------时间戳格式化方法
const formatTime = (isoString) => {
  if (!isoString) return '--'
  // 将UTC时间转换为本地时间
  return dayjs(isoString).utc().local().format('YYYY-MM-DD HH:mm:ss')
}

// -------------------------过滤方法
const filterStatus = (value, row) => {
  return row.status === value
}
const filterType = (value, row) => {
  return row.type === value
}

// -------------------------分页处理
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

// -----------------------------新建任务
const createTask = () => {
  drawerVisible.value = true  // 打开抽屉
}

// 点击提交
const onSubmit = async () => {
  try {
    // 格式化开始时间和结束时间
    const startTime = formatLocalDateTime(form.start_date, form.start_time)
    const endTime = formatLocalDateTime(form.end_date, form.end_time)
    if (!startTime || !endTime) {
      ElMessage.error('开始/结束时间格式错误')
      return
    }
    // 构造请求体数据
    const data = {
        title: form.name,        // 任务名称
        content: form.desc,      // 任务内容
        notify_way: form.notify_way, // 提醒方式
        early_time: form.early_time, 
        start_time: startTime, // 开始时间
        end_time: endTime, // 结束时间
        type: form.type, // 任务类型
    }
    // 发起 POST 请求
    const token = sessionStorage.getItem('token') // 假设你存储了用户的 token
    const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/api/v1/timing_task`, data, {
      headers: {
        'Authorization': `${token}`,  // 使用 Bearer token 进行身份验证
      },
    })
    // 处理响应
    if (response.data.code === 200) {
      ElMessage.success('任务创建成功!')
      fetchTasks()
      drawerVisible.value = false 
    } else {
      ElMessage.error('任务创建失败')
    }
  } catch (error) {
    ElMessage.error('提交任务失败: ' + error.message)
  }
}

// 格式化日期时间为带有时区的时间字符串
const formatLocalDateTime = (date, time) => {
  // dayjs 对象转 Date
  const d = dayjs(date).toDate()
  const t = dayjs(time).toDate()

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(t.getHours()).padStart(2, '0')
  const minutes = String(t.getMinutes()).padStart(2, '0')
  const seconds = String(t.getSeconds()).padStart(2, '0')

  const timezoneOffset = d.getTimezoneOffset()
  const offsetHours = Math.abs(Math.floor(timezoneOffset / 60)).toString().padStart(2, '0')
  const offsetMinutes = Math.abs(timezoneOffset % 60).toString().padStart(2, '0')
  const offsetSign = timezoneOffset > 0 ? '-' : '+'

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${offsetSign}${offsetHours}:${offsetMinutes}`
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

// -----------------------------------其它
const showDetail = (row) => {
  // 查看详情逻辑
  console.log('查看详情:', row)
}

const editTask = (row) => {
  // 编辑任务逻辑
  console.log('编辑任务:', row)
}
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