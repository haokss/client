<template>
  <div class="p-6">
    <el-card>
      <!-- 搜索 & 操作 -->
      <div class="flex justify-between mb-4">
        <div class="flex gap-2 items-center">
          <el-input v-model="search.name" placeholder="请输入姓名" clearable style="width: 160px" />
          <el-select v-model="search.stage" placeholder="选择阶段" clearable style="width: 160px">
            <el-option label="小学" value="小学" />
            <el-option label="初中" value="初中" />
            <el-option label="高中" value="高中" />
            <el-option label="大学" value="大学" />
          </el-select>
          <el-button type="primary" @click="fetchData">搜索</el-button>
          <el-button type="success" @click="openDialog()">添加同学</el-button>
          <el-button type="danger" :disabled="!multipleSelection.length" @click="batchRemove">批量删除</el-button>
        </div>
      </div>

      <!-- 表格 -->
      <el-table :data="tableData" stripe border @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column label="姓名" prop="name" />
        <el-table-column label="阶段" prop="stage" />
        <el-table-column label="就读学校" prop="school" />
        <el-table-column label="班级" prop="className" />
        <el-table-column label="联系方式" prop="phone" />
        <el-table-column label="操作" width="180">
          <template #default="scope">
            <el-button size="small" @click="openDialog(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="remove(scope.row.ID)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        class="mt-4"
        layout="prev, pager, next"
        :total="total"
        :current-page="page"
        :page-size="pageSize"
        @current-change="handlePageChange"
      />
    </el-card>

    <el-drawer
      v-model="drawerVisible"
      :title="form.id ? '编辑同学' : '添加同学'"
      direction="rtl"
      size="500px"
      destroy-on-close
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px" class="pr-6">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="阶段" prop="stage">
          <el-select v-model="form.stage" placeholder="请选择阶段">
            <el-option label="小学" value="小学" />
            <el-option label="初中" value="初中" />
            <el-option label="高中" value="高中" />
            <el-option label="大学" value="大学" />
          </el-select>
        </el-form-item>
        <el-form-item label="就读学校" prop="school">
          <el-input v-model="form.school" />
        </el-form-item>
        <el-form-item label="班级" prop="className">
          <el-input v-model="form.className" />
        </el-form-item>
        <el-form-item label="联系方式" prop="phone">
          <el-input v-model="form.phone" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="flex justify-end gap-2 px-6 pb-4">
          <el-button @click="drawerVisible = false">取消</el-button>
          <el-button type="primary" @click="submit">保存</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

// 数据源和分页
const tableData = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = 5
const search = ref({ name: '', stage: '' })

// 表单
const form = ref({})
const drawerVisible = ref(false)
const formRef = ref()
const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  stage: [{ required: true, message: '请选择阶段', trigger: 'change' }],
  school: [{ required: true, message: '请输入学校', trigger: 'blur' }],
  className: [{ required: true, message: '请输入班级', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入联系方式', trigger: 'blur' }],
}

// 获取数据（从后端）
const fetchData = async () => {
  try {
    const token = sessionStorage.getItem('token')
    if (!token) {
      ElMessage.error('用户未登录!')
      return
    }
    const res = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/api/v1/classmate/list`, {
      params: {
        name: search.value.name,
        stage: search.value.stage,
        page: page.value,
        pageSize,
      },
      headers: {
        Authorization: token,
      },
    })
    const data = res.data.data;
    tableData.value = data.list;
    total.value = data.total;
  } catch (error) {
    ElMessage.error('获取数据失败')
  }
}

// 分页切换
const handlePageChange = (p) => {
  page.value = p
  fetchData()
}

// 打开抽屉
const openDialog = (row = {}) => {
  form.value = { ...row }
  drawerVisible.value = true
}

// 提交表单
const submit = () => {
  formRef.value.validate(async (valid) => {
    if (!valid) return
    try {
      const token = sessionStorage.getItem('token')
      if (!token) {
        ElMessage.error('用户未登录!')
        return
      }
      if (form.value.id) {
        await axios.put(`${process.env.VUE_APP_API_BASE_URL}/api/v1/classmates/${form.value.id}`, form.value, {
          headers: {Authorization: token }})
      } else {
        await axios.post(`${process.env.VUE_APP_API_BASE_URL}/api/v1/classmate`, form.value, {
          headers: {Authorization: token }})
      }
      drawerVisible.value = false
      ElMessage.success('保存成功')
      fetchData()
    } catch (error) {
      ElMessage.error('保存失败')
    }
  })
}

// ----------------------------------------------------删除
const multipleSelection = ref([])

const handleSelectionChange = (val) => {
  multipleSelection.value = val
}

const batchRemove = () => {
  if (!multipleSelection.value.length) return
  ElMessageBox.confirm(`确定要删除这 ${multipleSelection.value.length} 个同学吗？`, '批量删除确认', {
    type: 'warning',
  }).then(async () => {
    try {
      const token = sessionStorage.getItem('token')
      const ids = multipleSelection.value.map(item => item.ID)
      await axios.delete(`${process.env.VUE_APP_API_BASE_URL}/api/v1/classmate/batch_delete`, {
        data: { ids },
        headers: { Authorization: token },
      })
      ElMessage.success('批量删除成功')
      fetchData()
    } catch (error) {
      ElMessage.error('批量删除失败')
    }
  })
}

const remove = async (id) => {
  ElMessageBox.confirm('确定删除该同学吗？', '警告', { type: 'warning' }).then(async () => {
    try {
      await axios.delete(`/api/v1/classmates/${id}`)
      ElMessage.success('删除成功')
      fetchData()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  })
}

// 初始加载
fetchData()
</script>
