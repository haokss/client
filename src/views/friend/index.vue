<template>
  <div class="p-6">
    <el-card>
      <div class="flex justify-between mb-4">
        <el-input v-model="search.name" placeholder="姓名" clearable class="w-60" />
        <el-button type="primary" @click="fetchData">搜索</el-button>
        <el-button type="success" @click="openDialog()">+ 添加朋友</el-button>
      </div>

      <el-table :data="tableData" stripe border>
        <el-table-column label="姓名" prop="name" />
        <el-table-column label="联系方式" prop="phone" />
        <el-table-column label="生日" prop="birthday" />
        <el-table-column label="兴趣爱好" prop="hobby" />
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button size="small" @click="openDialog(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="remove(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

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
    <el-dialog :title="form.id ? '编辑朋友' : '添加朋友'" v-model="dialogVisible" width="500px">
      <el-form :model="form" label-width="90px" :rules="rules" ref="formRef">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="联系方式" prop="phone">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="生日" prop="birthday">
          <el-date-picker v-model="form.birthday" type="date" placeholder="选择生日" />
        </el-form-item>
        <el-form-item label="兴趣爱好" prop="hobby">
          <el-input v-model="form.hobby" />
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

const tableData = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = 10
const search = ref({ name: '' })

const dialogVisible = ref(false)
const form = ref({})
const formRef = ref()
const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入联系方式', trigger: 'blur' }],
}

const fetchData = () => {
  const mock = [...Array(12)].map((_, i) => ({
    id: i + 1,
    name: `朋友${i + 1}`,
    phone: '13800000000',
    birthday: '2000-01-01',
    hobby: '旅游，音乐',
  }))
  tableData.value = mock.slice((page.value - 1) * pageSize, page.value * pageSize)
  total.value = mock.length
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
    if (valid) {
      if (!form.value.id) {
        form.value.id = Date.now()
        tableData.value.unshift(form.value)
      } else {
        const index = tableData.value.findIndex(i => i.id === form.value.id)
        if (index > -1) tableData.value[index] = { ...form.value }
      }
      dialogVisible.value = false
      ElMessage.success('保存成功')
    }
  })
}

const remove = (id) => {
  ElMessageBox.confirm('确认删除该朋友吗？', '提示', { type: 'warning' }).then(() => {
    tableData.value = tableData.value.filter(i => i.id !== id)
    ElMessage.success('删除成功')
  })
}

fetchData()
</script>
