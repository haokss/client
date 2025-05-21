<template>
  <div class="p-6">
    <div class="card-wrapper">
      <el-card style="height: 100%; display: flex; flex-direction: column;">
        <!-- 搜索与新增 -->
        <div class="flex justify-between mb-4">
          <div class="flex gap-2 items-center flex-wrap">
            <el-input v-model="search.name" placeholder="请输入姓名" clearable style="width: 160px" />
            <el-input v-model="search.company" placeholder="请输入工作单位" clearable style="width: 200px" />
            <el-button type="primary" :loading="loading" @click="onSearch">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
            <el-button type="success" @click="openDrawer">添加同事</el-button>
            <el-button plain type="danger" :disabled="!multipleSelection.length" @click="batchRemove">批量删除</el-button>
          </div>
        </div>

        <!-- 表格 -->
        <el-table
          ref="tableRef"
          :data="tableData"
          stripe
          v-loading="loading"
          row-key="id"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="40" />
          <el-table-column label="姓名" prop="name" />
          <el-table-column label="工作单位" prop="company" />
          <el-table-column label="职位" prop="position" />
          <el-table-column label="手机号" prop="phone" />
          <el-table-column label="邮箱" prop="email" />
          <el-table-column label="操作" width="160">
            <template #default="scope">
              <el-button size="small" @click="openDrawer(scope.row)">编辑</el-button>
              <el-button size="small" type="danger" @click="remove(scope.row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
      <!-- 分页 -->
      <el-pagination
        class="mt-4"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        :page-sizes="[10, 20, 30, 50]"
        :page-size="pageSize"
        :current-page="page"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 抽屉表单 -->
    <el-drawer
      v-model="drawerVisible"
      :title="form.id ? '编辑同事' : '添加同事'"
      direction="rtl"
      size="500px"
    >
      <el-form :model="form" label-width="90px" :rules="rules" ref="formRef" class="pr-6">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="工作单位" prop="company">
          <el-input v-model="form.company" />
        </el-form-item>
        <el-form-item label="职位" prop="position">
          <el-input v-model="form.position" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="w-full flex justify-end gap-2 pr-6 pb-4">
          <el-button @click="drawerVisible = false">取消</el-button>
          <el-button type="primary" @click="submit">保存</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

const tableRef = ref()
const tableData = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

const loading = ref(false)
const multipleSelection = ref([])

const handleSelectionChange = (val) => {
  multipleSelection.value = val
  console.log('当前选中项:', val)
}

const search = ref({
  name: '',
  company: '',
})

const form = ref({})
const formRef = ref()
const drawerVisible = ref(false)

const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
}

const fetchData = async () => {
  loading.value = true
  try {
    const token = sessionStorage.getItem('token')
    if (!token) {
      ElMessage.error('用户未登录!')
      return
    }

    const res = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/api/v1/colleagues`, {
      params: {
        page: page.value,
        page_size: pageSize.value,
        name: search.value.name,
        company: search.value.company,
      },
      headers: {
        Authorization: token,
      },
    })

    tableData.value = res.data?.data?.list || []
    total.value = res.data?.data?.total || 0

    await nextTick()
    tableRef.value?.clearSelection()
  } catch (err) {
    ElMessage.error('获取数据失败: ' + (err.response?.data?.message || err.message))
    if (err.response?.status === 401) {
      router.push('/login')
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})

const handlePageChange = (p) => {
  page.value = p
  fetchData()
}

const onSearch = () => {
  page.value = 1
  fetchData()
}

const resetSearch = () => {
  search.value.name = ''
  search.value.company = ''
  onSearch()
}

const openDrawer = (row = {}) => {
  form.value = { ...row }
  drawerVisible.value = true
}

const submit = () => {
  formRef.value.validate(async (valid) => {
    if (!valid) return
    const token = sessionStorage.getItem('token')
    if (!token) {
      ElMessage.error('用户未登录!')
      return
    }
    try {
      if (!form.value.id) {
        const res = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/api/v1/colleague`, form.value, {
          headers: { Authorization: token },
        })
        form.value.id = res.data.id
        tableData.value.unshift({ ...form.value })
        ElMessage.success('添加成功')
      } else {
        await axios.put(`${process.env.VUE_APP_API_BASE_URL}/api/v1/colleague/${form.value.id}`, form.value, {
          headers: { Authorization: token },
        })
        const index = tableData.value.findIndex((i) => i.id === form.value.id)
        if (index > -1) tableData.value[index] = { ...form.value }
        ElMessage.success('更新成功')
      }

      await nextTick()
      tableRef.value?.clearSelection()

      drawerVisible.value = false
    } catch (err) {
      ElMessage.error('提交失败')
      console.error(err)
    }
  })
}

const batchRemove = async () => {
  if (multipleSelection.value.length === 0) {
    return ElMessage.warning('请至少选择一项')
  }

  try {
    await ElMessageBox.confirm(`确认删除选中的 ${multipleSelection.value.length} 项吗？`, '提示', {
      type: 'warning',
    })

    const token = sessionStorage.getItem('token')
    const ids = multipleSelection.value.map(item => item.id)

    const res = await axios.delete(`${process.env.VUE_APP_API_BASE_URL}/api/v1/colleague/batch`, {
      headers: { 
        Authorization: token,
        'Content-Type': 'application/json' 
      },
      data: { ids }
    })

    if (res.data.code === 200) {
      ElMessage.success('删除成功')
      fetchData()
      multipleSelection.value = []
    }
  } catch (err) {
    if (err !== 'cancel') {
      console.error('删除失败:', err)
      ElMessage.error(err.response?.data?.message || '删除失败')
    }
  }
}

// ------------------------------------------------删除函数
const remove = async (id) => {
  try {
    await ElMessageBox.confirm('确认删除该同事吗？', '提示', {
      type: 'warning',
    })

    const token = sessionStorage.getItem('token')
    await axios.delete(`${process.env.VUE_APP_API_BASE_URL}/api/v1/colleague/batch`, {
      headers: { Authorization: token },
      data: { ids: [id] }
    })

    ElMessage.success('删除成功')
    fetchData()
  } catch (err) {
    // 判断不是取消或点击空白关闭
    if (err !== 'cancel' && err !== 'close') {
      ElMessage.error('删除失败')
      console.error(err)
    }
  }
}


// -------------------------------------------------分页大小变化
const handleSizeChange = (size) => {
  page.value = 1
  pageSize.value = size
  fetchData()
}

</script>

<style scoped>
.card-wrapper {
  height: calc(100vh - 120px); /* 调整这个值来预留 header、padding、分页高度 */
}
</style>