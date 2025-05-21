<template>
  <div class="p-6">
    <div class="card-wrapper">
      <el-card style="height: 100%; display: flex; flex-direction: column;">
        <!-- 搜索与操作 -->
        <div class="flex justify-between mb-4">
          <div class="flex gap-2 items-center">
            <el-input v-model="search.name" placeholder="请输入姓名" clearable style="width: 160px" />
            <el-button type="primary" :loading="loading" @click="onSearch">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
            <el-button type="success" @click="openDrawer()">添加朋友</el-button>
            <el-button plain type="danger" :disabled="!multipleSelection.length" @click="batchRemove">批量删除</el-button>
          </div>
        </div>

        <!-- 表格 -->
        <el-table
          :data="tableData"
          stripe
          row-key="id"
          v-loading="loading"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="50" />
          <el-table-column label="姓名" prop="name" />
          <el-table-column label="联系方式" prop="phone" />
          <el-table-column label="生日" prop="birthday" :formatter="(row, column, cellValue) => formatDate(cellValue)" />
          <el-table-column label="兴趣爱好" prop="hobby" />
          <el-table-column label="操作" width="150">
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
        :page-sizes="[10, 20, 30, 50]"
        :total="total"
        :page-size="pageSize"
        :current-page="page"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>
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
import CryptoJS from 'crypto-js'
import { formatLocalDateTime, formatDate } from '@/utils/time'
import { encryptField, decryptField } from '@/utils/encryption'


const tableData = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
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
        page_size: pageSize.value,
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
      const encryptedForm = {
        name: encryptField(form.value.name),
        phone: encryptField(form.value.phone),
        birthday: encryptField(formatLocalDateTime(form.value.birthday)),
        hobby: encryptField(form.value.hobby),
      }
      if (!form.value.id) {
        await axios.post(`${process.env.VUE_APP_API_BASE_URL}/api/v1/friend`, encryptedForm, {
          headers: { Authorization: token },
        })
        ElMessage.success('添加成功')
      } else {
        await axios.put(`${process.env.VUE_APP_API_BASE_URL}/api/v1/friend/${form.value.id}`, form.value, {
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
    await axios.delete(`${process.env.VUE_APP_API_BASE_URL}/api/v1/friend/batch_delete`, {
      headers: { Authorization: token },
      data: { ids:[id] },
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
    const ids = multipleSelection.value.map(item => item.id)
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

// -------------------------------------------------分页大小变化
const handleSizeChange = (size) => {
  page.value = 1
  pageSize.value = size
  fetchData()
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.card-wrapper {
  height: calc(100vh - 120px); /* 调整这个值来预留 header、padding、分页高度 */
}
</style>
