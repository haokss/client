<template>
  <div class="p-6">
    <el-card>
      <!-- 搜索 & 操作 -->
      <div class="flex justify-between items-center mb-4">
        <el-input v-model="search.name" placeholder="输入姓名搜索" clearable class="w-60" />
        <div>
          <el-button type="primary" @click="fetchData">搜索</el-button>
          <el-button type="success" @click="openDialog()">+ 添加同学</el-button>
        </div>
      </div>

      <!-- 表格 -->
      <el-table :data="tableData" stripe border>
        <el-table-column label="姓名" prop="name" />
        <el-table-column label="就读学校" prop="school" />
        <el-table-column label="班级" prop="className" />
        <el-table-column label="联系方式" prop="phone" />
        <el-table-column label="操作" width="180">
          <template #default="scope">
            <el-button size="small" @click="openDialog(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="remove(scope.row.id)">删除</el-button>
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

    <!-- 弹窗 -->
    <el-dialog :title="form.id ? '编辑同学' : '添加同学'" v-model="dialogVisible" width="500px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" />
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
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 模拟数据 & 状态
const tableData = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = 5
const search = ref({ name: '' })

// 表单 & 弹窗
const form = ref({})
const dialogVisible = ref(false)
const formRef = ref()
const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  school: [{ required: true, message: '请输入学校', trigger: 'blur' }],
  className: [{ required: true, message: '请输入班级', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入联系方式', trigger: 'blur' }],
}

// 模拟请求
const fetchData = () => {
  // 模拟全部数据
  const allData = [...Array(15)].map((_, i) => ({
    id: i + 1,
    name: `同学${i + 1}`,
    school: `学校${i % 3 + 1}`,
    className: `${(i % 5) + 1}班`,
    phone: `1380000${i.toString().padStart(4, '0')}`,
  }))
  const filtered = search.value.name
    ? allData.filter(item => item.name.includes(search.value.name))
    : allData

  total.value = filtered.length
  tableData.value = filtered.slice((page.value - 1) * pageSize, page.value * pageSize)
}

const handlePageChange = (p) => {
  page.value = p
  fetchData()
}

const openDialog = (row = {}) => {
  form.value = { ...row }
  dialogVisible.value = true
}

const submit = () => {
  formRef.value.validate((valid) => {
    if (!valid) return
    if (form.value.id) {
      // 编辑
      const index = tableData.value.findIndex(item => item.id === form.value.id)
      if (index !== -1) tableData.value[index] = { ...form.value }
    } else {
      // 新增
      form.value.id = Date.now()
      tableData.value.unshift({ ...form.value })
      total.value++
    }
    dialogVisible.value = false
    ElMessage.success('保存成功')
  })
}

const remove = (id) => {
  ElMessageBox.confirm('确定删除该同学吗？', '警告', { type: 'warning' }).then(() => {
    tableData.value = tableData.value.filter(item => item.id !== id)
    total.value--
    ElMessage.success('删除成功')
  })
}

fetchData()
</script>

<style scoped>
/* 可选样式增强 */
</style>
