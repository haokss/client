<template>
  <div class="p-6">
    <el-card>
      <!-- 搜索与操作 -->
      <div class="flex justify-between mb-4">
        <div class="flex gap-2 items-center">
          <el-input v-model="search.name" placeholder="请输入姓名" clearable style="width: 160px" />
          <el-button type="primary" :loading="loading" @click="onSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </div>
        <div class="flex gap-2">
          <el-button type="success" @click="openDrawer()">添加朋友</el-button>
          <el-button plain type="danger" :disabled="!multipleSelection.length" @click="batchRemove">批量删除</el-button>
        </div>
      </div>

      <!-- 表格 -->
      <el-table
        :data="tableData"
        stripe
        border
        row-key="id"
        v-loading="loading"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column label="姓名" prop="name" />
        <el-table-column label="联系方式" prop="phone" />
        <el-table-column label="生日" prop="birthday" />
        <el-table-column label="兴趣爱好" prop="hobby" />
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button size="small" @click="openDrawer(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="remove(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        class="mt-4"
        layout="prev, pager, next"
        :total="total"
        :page-size="pageSize"
        :current-page="page"
        @current-change="handlePageChange"
      />
    </el-card>

    <!-- 抽屉 -->
    <el-drawer
      v-model="drawerVisible"
      :title="form.id ? '编辑朋友' : '添加朋友'"
      size="500px"
      direction="rtl"
    >
      <el-form :model="form" label-width="90px" :rules="rules" ref="formRef">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="联系方式" prop="phone">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="生日" prop="birthday">
          <el-date-picker v-model="form.birthday" type="date" placeholder="选择生日" style="width: 100%" />
        </el-form-item>
        <el-form-item label="兴趣爱好" prop="hobby">
          <el-input v-model="form.hobby" />
        </el-form-item>
        <el-form-item>
          <el-button @click="drawerVisible = false">取消</el-button>
          <el-button type="primary" @click="submit">保存</el-button>
        </el-form-item>
      </el-form>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

const tableData = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = 10
const loading = ref(false)
const search = ref({ name: '' })

const multipleSelection = ref([])
const handleSelectionChange = (val) => {
  multipleSelection.value = val
}

const drawerVisible = ref(false)
const form = ref({})
const formRef = ref()
const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入联系方式', trigger: 'blur' }],
}

const fetchData = async () => {
  loading.value = true
  try {
    const token = sessionStorage.getItem('token')
    const res = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/api/v1/friend/list`, {
      params: {
        page: page.value,
        page_size: pageSize,
        name: search.value.name,
      },
      headers: {
        Authorization: token,
      },
    })
    tableData.value = res.data?.data?.list || []
    total.value = res.data?.data?.total || 0
  } catch (err) {
    ElMessage.error('获取数据失败: ' + (err.response?.data?.message || err.message))
  } finally {
    loading.value = false
  }
}

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
    try {
      if (!form.value.id) {
        await axios.post(`${process.env.VUE_APP_API_BASE_URL}/api/v1/friend`, form.value, {
          headers: { Authorization: token },
        })
        ElMessage.success('添加成功')
      } else {
        await axios.put(`${process.env.VUE_APP_API_BASE_URL}/api/v1/friends/${form.value.id}`, form.value, {
          headers: { Authorization: token },
        })
        ElMessage.success('更新成功')
      }
      drawerVisible.value = false
      fetchData()
    } catch (err) {
      ElMessage.error('提交失败: ' + (err.response?.data?.message || err.message))
    }
  })
}

const remove = async (id) => {
  try {
    await ElMessageBox.confirm('确认删除该朋友吗？', '提示', { type: 'warning' })
    const token = sessionStorage.getItem('token')
    await axios.delete(`${process.env.VUE_APP_API_BASE_URL}/api/v1/friends/${id}`, {
      headers: { Authorization: token },
    })
    ElMessage.success('删除成功')
    fetchData()
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error('删除失败: ' + (err.response?.data?.message || err.message))
    }
  }
}

const batchRemove = async () => {
  if (!multipleSelection.value.length) {
    return ElMessage.warning('请至少选择一项')
  }

  try {
    await ElMessageBox.confirm(`确认删除选中的 ${multipleSelection.value.length} 项吗？`, '提示', {
      type: 'warning',
    })
    const token = sessionStorage.getItem('token')
    const ids = multipleSelection.value.map(item => item.ID)
    await axios.delete(`${process.env.VUE_APP_API_BASE_URL}/api/v1/friend/batch_delete`, {
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
      data: { ids },
    })
    ElMessage.success('删除成功')
    multipleSelection.value = []
    fetchData()
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error('删除失败: ' + (err.response?.data?.message || err.message))
    }
  }
}

onMounted(() => {
  fetchData()
})
</script>
