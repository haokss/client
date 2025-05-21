<template>
  <div class="p-6">
    <div class="card-wrapper">
      <el-card style="height: 100%; display: flex; flex-direction: column;">
      <div class="flex justify-between mb-4">
        <div class="flex gap-2 items-center">
          <el-input v-model="search.username" placeholder="请输入用户名" clearable style="width: 160px" />
          <el-button type="primary" :loading="loading" @click="onSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
          <el-button type="success" @click="openDrawer()">添加用户</el-button>
        </div>
      </div>

      <!-- 表格 -->
      <div style="flex: 1; overflow: auto;">
        <el-table
          :data="tableData"
          stripe
          row-key="id"
          v-loading="loading"
          @selection-change="handleSelectionChange"
          style="min-width: 100%"
        >
          <el-table-column type="selection" width="50" />
          <el-table-column label="用户名" prop="username" />
          <el-table-column label="联系方式" prop="phone" />
          <el-table-column label="邮箱" prop="email" />
          <el-table-column label="角色" prop="role">
            <template #default="scope">
              <span>{{ scope.row.role === 1 ? '普通用户' : '管理员' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180">
            <template #default="scope">
              <div class="flex gap-2">
                <el-button
                  size="small"
                  type="primary"
                  @click="scope.row.username !== 'admin' && openDrawer(scope.row)"
                  :disabled="scope.row.username === 'admin'">
                  编辑
                </el-button>
                <el-button
                  size="small"
                  type="warning"
                  @click="scope.row.username !== 'admin' && resetPassword(scope.row.id)"
                  :disabled="scope.row.username === 'admin'">
                  重置密码
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
    <!-- 分页 -->
    <el-pagination
      class="mt-4"
      layout="prev, pager, next"
      :total="total"
      :page-size="pageSize"
      :current-page="page"
      @current-change="handlePageChange"
    />
  </div>
    <!-- 抽屉 -->
    <el-drawer
      v-model="drawerVisible"
      :title="form.id ? '编辑用户' : '添加用户'"
      size="500px"
      direction="rtl"
    >
      <el-form :model="form" label-width="90px" :rules="rules" ref="formRef">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" />
        </el-form-item>
          <el-form-item label="联系方式" prop="phone">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" placeholder="选择角色">
            <el-option label="普通用户" value="user" />
            <el-option label="管理员" value="admin" />
          </el-select>
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
const search = ref({ username: '' })

const multipleSelection = ref([])
const handleSelectionChange = (val) => {
  multipleSelection.value = val
}

const drawerVisible = ref(false)
const form = ref({
  username: '',
  phone: '',
  email: '',
  role: '',
})
const formRef = ref()
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
}

const fetchData = async () => {
  loading.value = true
  try {
    const token = sessionStorage.getItem('token')
    const res = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/api/v1/admin/users`, {
      params: {
        page: page.value,
        page_size: pageSize,
        username: search.value.username,
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
  search.value.username = ''
  onSearch()
}

const openDrawer = (row = {}) => {
  if (row.id) {
    // 编辑模式，转换角色数字为字符串
    form.value = {
      id: row.id,
      username: row.username,
      phone: row.phone,
      email: row.email,
      role: row.role === 1 ? 'user' : 'admin',
    }
  } else {
    // 新增模式，清空表单
    form.value = {
      username: '',
      phone: '',
      email: '',
      role: '',
    }
  }
  drawerVisible.value = true
}

const submit = () => {
  formRef.value.validate(async (valid) => {
    if (!valid) return
    const token = sessionStorage.getItem('token')

    // 提交时把 role 转为数字
    const submitData = {
      ...form.value,
      role: form.value.role === 'user' ? 1 : 2,
    }

    try {
      if (!form.value.id) {
        await axios.post(`${process.env.VUE_APP_API_BASE_URL}/api/v1/user`, submitData, {
          headers: { Authorization: token },
        })
        ElMessage.success('添加成功')
      } else {
        await axios.put(`${process.env.VUE_APP_API_BASE_URL}/api/v1/admin/user/${form.value.id}`, submitData, {
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
    await ElMessageBox.confirm('确认删除该用户吗？', '提示', { type: 'warning' })
    const token = sessionStorage.getItem('token')
    await axios.delete(`${process.env.VUE_APP_API_BASE_URL}/api/v1/users/${id}`, {
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
    const ids = multipleSelection.value.map(item => item.id)
    await axios.delete(`${process.env.VUE_APP_API_BASE_URL}/api/v1/user/batch_delete`, {
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

const resetPassword = async (id) => {
  try {
    await ElMessageBox.confirm('确认重置该用户密码吗？', '提示', { type: 'warning' })
    const token = sessionStorage.getItem('token')
    await axios.post(`${process.env.VUE_APP_API_BASE_URL}/api/v1/admin/user/reset_password/${id}`, {}, {
      headers: { Authorization: token },
    })
    ElMessage.success('密码重置成功（新密码已发送至邮箱）')
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error('重置失败: ' + (err.response?.data?.message || err.message))
    }
  }
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
