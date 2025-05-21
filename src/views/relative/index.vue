<template>
  <div class="family-tree-container" @click="hideContextMenu">
    <div class="card-wrapper">
      <el-card style="height: 100%; display: flex; flex-direction: column;">
        <el-row :gutter="20">
          <!-- 左侧树 -->
          <el-col :span="8">
            <el-tree
              ref="treeRef"
              :data="treeData"
              :props="defaultProps"
              node-key="id"
              highlight-current
              draggable
              default-expand-all
              @node-click="handleNodeClick"
              @node-contextmenu="handleRightClick"
            />
          </el-col>

          <!-- 右侧表格 -->
          <el-col :span="16" style="height: calc(100vh - 150px); display: flex; flex-direction: column;">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索姓名、关系或性别"
              clearable
              style="margin-bottom: 15px; width: 300px"
            />
            <div style="flex: 1; overflow: auto;">
            <el-table 
              :data="filteredMembers" 
              :row-style="{ height: '120px' }"
              highlight-current-row 
              @row-click="handleRowClick"
              style="width: 100%;">
              @current-change="handleCurrentChange"
              <el-table-column type="index" label="#" width="50" />
              <el-table-column label="头像" width="120">
                <template #default="scope">
                <el-avatar
                  shape="square"
                  style="width: 85px; height: 110px; object-fit: cover; border-radius: 4px"
                  :src="scope.row.avatar || defaultAvatar"
                />
                </template>
              </el-table-column>
              <el-table-column prop="name" label="姓名" />
              <el-table-column prop="relation" label="亲属关系" />
              <el-table-column prop="gender" label="性别" />
              <el-table-column prop="address" label="住址" />
              <el-table-column prop="contact" label="联系方式" />
              <el-table-column prop="wechat" label="微信号" />
              <el-table-column prop="hasDebtRelation" label="借贷关系">
                <template #default="scope">
                  {{ scope.row.hasDebtRelation ? '是' : '否' }}
                </template>
              </el-table-column>
              <el-table-column prop="note" label="备注" />
            </el-table>
            </div>
          </el-col>
        </el-row>
      </el-card>
    </div>
    <!-- 右键菜单 -->
    <ul
      v-if="contextMenu.visible"
      class="context-menu"
      :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }"
    >
      <li @click="editNode">编辑节点</li>
      <li @click="addChild">添加子节点</li>
      <!-- <li @click="addParent">添加父节点</li> -->
      <li @click="addSibling">添加兄弟节点</li>
      <li @click="removeRelation">删除节点</li>
    </ul>
    <!-- 编辑抽屉 -->
    <el-drawer
      v-model="editDialog.visible"
      :title="editDialog.mode === 'edit' ? '编辑节点信息' : '新增节点信息'"
      width="600px"
      :before-close="beforeClose"
    >
    <el-row>
      <!-- 左侧头像 -->
      <el-col :span="6" style="display: flex; justify-content: center; align-items: start;">
        <el-upload
          class="avatar-uploader"
          :action="uploadAction"
          :headers="uploadHeaders"
          :show-file-list="false"
          :on-success="handleAvatarSuccess"
          :before-upload="beforeAvatarUpload"
        >
          <img
            v-if="editDialog.form.avatar"
            :src="editDialog.form.avatar"
            class="avatar"
            style="width: 120px; height: 120px; border-radius: 8px; object-fit: cover; cursor: pointer;"
          />
          <el-icon v-else style="font-size: 120px; cursor: pointer;"><Plus /></el-icon>
        </el-upload>
      </el-col>

      <!-- 右侧表单 -->
      <el-col :span="18">
        <el-form :model="editDialog.form" label-width="80px">
          <el-form-item label="姓名">
            <el-input v-model="editDialog.form.name" />
          </el-form-item>
          <el-form-item label="亲属关系">
            <el-input v-model="editDialog.form.relation" />
          </el-form-item>
          <el-form-item label="性别">
            <el-select v-model="editDialog.form.gender">
              <el-option label="男" value="男" />
              <el-option label="女" value="女" />
              <el-option label="未知" value="未知" />
            </el-select>
          </el-form-item>
          <el-form-item label="住址">
            <el-input v-model="editDialog.form.address" />
          </el-form-item>
          <el-form-item label="联系方式">
            <el-input v-model="editDialog.form.contact" />
          </el-form-item>
          <el-form-item label="微信号">
            <el-input v-model="editDialog.form.wechat" />
          </el-form-item>
          <el-form-item label="借贷关系">
            <el-switch v-model="editDialog.form.hasDebtRelation" />
          </el-form-item>
          <el-form-item label="借贷类型" v-if="editDialog.form.hasDebtRelation">
            <el-input v-model="editDialog.form.debtType" />
          </el-form-item>
          <el-form-item label="借贷凭证" v-if="editDialog.form.hasDebtRelation">
            <el-input v-model="editDialog.form.debtProof" />
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="editDialog.form.note" />
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>

    <!-- 底部按钮 -->
    <template #footer>
      <el-button @click="editDialog.visible = false">取消</el-button>
      <el-button type="primary" @click="saveNodeEdit">保存</el-button>
    </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, nextTick, onMounted } from 'vue'
import axios from 'axios'

const treeRef = ref(null)
const defaultProps = {
  children: 'children',
  label: 'name',
}

const uploadAction = `${process.env.VUE_APP_API_BASE_URL}/api/v1/upload/ava`
const defaultAvatar = 'http://127.0.0.1:8099/www/default/assets_task_01jtdrj5mvf2ws7bxw3jx21478_1746366227_img_0.png'

const treeData = ref([
  {
    id: 0,
    name: '张三',
    relation: '本人',
    gender: '男',
    address: '郑州市金水区',
    contact: '13800000001',
    wechat: 'zhangsan_wechat',
    hasDebtRelation: false,
    debtType: '',
    debtProof: '',
    note: '无',
    avatar: '',
    children: [],
  },
])


function handleCurrentChange(currentRow) {
  currentNode.value = currentRow
}

const currentNode = ref(null)
const searchKeyword = ref('')

const contextMenu = reactive({
  visible: false,
  x: 0,
  y: 0,
  node: null,
})

const editDialog = reactive({
  visible: false,
  mode: 'edit',
  form: {
    id: null,
    name: '',
    relation: '',
    gender: '',
    address: '',
    contact: '',
    wechat: '',
    hasDebtRelation: false,
    debtType: '',
    debtProof: '',
    note: '',
    avatar: '',
  },
})

const flattenTree = (nodes) => {
  const result = []
  const dfs = (list) => {
    list.forEach((node) => {
      result.push(node)
      if (node.children?.length) dfs(node.children)
    })
  }
  dfs(nodes)
  return result
}

const filteredMembers = computed(() =>
  flattenTree(treeData.value).filter((item) => {
    if (!searchKeyword.value) return true
    const keyword = searchKeyword.value.toLowerCase()
    return (
      (item.name || '').toLowerCase().includes(keyword) ||
      (item.relation || '').toLowerCase().includes(keyword) ||
      (item.gender || '').toLowerCase().includes(keyword)
    )
  })
)

function handleNodeClick(data) {
  currentNode.value = data
  // 查找并高亮对应的表格行
  const index = filteredMembers.value.findIndex(item => item.id === data.id)
  if (index !== -1) {
    // 获取表格实例并设置当前行
    const table = document.querySelector('.el-table__body-wrapper')
    const rows = table.querySelectorAll('tr.el-table__row')
    if (rows[index]) {
      // 先移除所有高亮
      rows.forEach(row => row.classList.remove('current-row'))
      // 添加当前行高亮
      rows[index].classList.add('current-row')
    }
  }
  
  // 填充编辑表单
  Object.assign(editDialog.form, data)
}

function handleRowClick(row) {
  currentNode.value = row
  // 同时选中对应的树节点
  if (treeRef.value) {
    treeRef.value.setCurrentKey(row.id)
  }
  // 填充抽屉表单数据
  Object.assign(editDialog.form, row)
  editDialog.visible = true
}

function handleRightClick(event, nodeData, treeNode) {
  event.preventDefault()
  contextMenu.visible = true
  contextMenu.x = event.clientX
  contextMenu.y = event.clientY
  contextMenu.node = treeNode  // 保存树节点实例
}

function hideContextMenu() {
  contextMenu.visible = false
}

// -----------------------------------------上传/修改节点信息
async function saveNodeEdit() {
  const token = sessionStorage.getItem('token')
  if (!token) {
    ElMessage.error('未登录，无法保存')
    return
  }

  try {
    let res
    if (editDialog.mode === 'edit') {
      // 编辑模式
      const id = editDialog.form.id
      res = await axios.put(
        `${process.env.VUE_APP_API_BASE_URL}/api/v1/relative_info/${id}`,
        editDialog.form,
        {
          headers: { Authorization: token }
        }
      )

      if (res.data.code === 200) {
        ElMessage.success('更新成功')
        Object.assign(contextMenu.node.data, editDialog.form)
        editDialog.visible = false
        await loadTreeData()
      } else {
        ElMessage.error(res.data.msg || '更新失败')
      }

    } else if (editDialog.mode === 'create') {
      // 添加模式
      res = await axios.post(
        `${process.env.VUE_APP_API_BASE_URL}/api/v1/relative_info`,
        editDialog.form,
        {
          headers: { Authorization: token }
        }
      )

      if (res.data.code === 200) {
        ElMessage.success('添加成功')

        const newNode = res.data.data
        const parentId = editDialog.form.parentId

        // 插入到树中
        const insertToTree = (nodes) => {
          for (const node of nodes) {
            if (node.id === parentId) {
              if (!Array.isArray(node.children)) node.children = []
              node.children.push(newNode)
              return true
            }
            if (node.children && insertToTree(node.children)) return true
          }
          return false
        }

        insertToTree(treeData.value)
        currentNode.value = newNode
        Object.assign(editDialog.form, newNode)

        // 如果有 treeRef，则选中它（高亮）
        nextTick(() => {
          treeRef.value?.setCurrentKey(newNode.id)
        })

        editDialog.visible = false
      } else {
        ElMessage.error(res.data.msg || '添加失败')
      }
    }
  } catch (err) {
    ElMessage.error(err.response?.data?.msg || err.message || '请求失败')
  }
}

// -----------------------------------------头像信息上传
const token = sessionStorage.getItem('token')

// 上传请求头
const uploadHeaders = computed(() => ({
  Authorization: token,
}))

function handleAvatarSuccess(res) {
  if (res.code === 200 && res.data.url) {
    editDialog.form.avatar = res.data.url
    ElMessage.success('头像上传成功')
  } else {
    ElMessage.error(res.msg || '头像上传失败')
  }
}

function beforeAvatarUpload(file) {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片格式')
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB')
  }
  return isImage && isLt2M
}


//------------------------------------------加载所有的节点
async function loadTreeData() {
  const token = sessionStorage.getItem('token')
  if (!token) {
    ElMessage.error('请先登录')
    return
  }

  try {
    const res = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/api/v1/relative_info`, {
      headers: {
        Authorization: token
      }
    })
    if (res.data.code === 200) {
      treeData.value = res.data.data || []
    } else {
      ElMessage.error(res.data.msg || '获取亲属树失败')
    }
  } catch (err) {
    ElMessage.error(err.message || '请求失败')
  }
}

onMounted(() => {
  loadTreeData()
})

// -----------------------------------------添加子节点操作
function addChild() {
  const treeNode = contextMenu.node
  if (!treeNode) return

  Object.assign(editDialog.form, {
    id: null,
    name: '',
    relation: '子女',
    gender: '未知',
    address: '',
    contact: '',
    wechat: '',
    hasDebtRelation: false,
    debtType: '',
    debtProof: '',
    note: '',
    avatar: '',
    parentId: treeNode.data.id
  })

  editDialog.mode = 'create'  // 标记为创建模式
  editDialog.visible = true
}

// ----------------------------------------------添加兄弟节点
async function addSibling() {
  const treeNode = contextMenu.node
  if (!treeNode) return

  const token = sessionStorage.getItem('token')
  if (!token) {
    ElMessage.error('用户未登录!')
    return
  }

  const parentNode = treeNode.parent
  const newNode = {
    name: '新兄弟节点',
    relation: '兄弟',
    gender: '未知',
    address: '',
    contact: '',
    wechat: '',
    hasDebtRelation: false,
    debtType: '',
    debtProof: '',
    note: '',
    avatar: '',
    parentId: parentNode ? parentNode.data.id : null
  }

  try {
    const res = await axios.post(
      `${process.env.VUE_APP_API_BASE_URL}/api/v1/relative_info`,
      newNode,
      {
        headers: {
          Authorization: token
        }
      }
    )

    if (res.data.code === 200) {
      const savedNode = res.data.data
      newNode.id = savedNode.id
      newNode.children = []

      if (parentNode) {
        parentNode.data.children = [...parentNode.data.children, newNode]
      } else {
        treeData.value = [...treeData.value, newNode]
      }

      treeData.value = [...treeData.value]
      ElMessage.success('兄弟节点添加成功')
    } else {
      ElMessage.error(res.data.msg || '添加失败')
    }
  } catch (err) {
    ElMessage.error(err.message || '请求失败')
  }

  hideContextMenu()
}

// --------------------------------------------删除亲属关系
async function removeRelation() {
  const treeNode = contextMenu.node
  if (!treeNode) return

  const token = sessionStorage.getItem('token')
  if (!token) {
    ElMessage.error('未登录，无法删除')
    return
  }

  // 收集所有要删除的节点 ID
  const idsToDelete = []
  const collectIds = (node) => {
    idsToDelete.push(node.id)
    if (Array.isArray(node.children)) {
      node.children.forEach(child => collectIds(child))
    }
  }
  collectIds(treeNode.data)

  try {
    const res = await axios.delete(
      `${process.env.VUE_APP_API_BASE_URL}/api/v1/relative_info`,
      {
        data: { ids: idsToDelete },
        headers: {
          Authorization: token
        }
      }
    )

    if (res.data.code === 200) {
      ElMessage.success('删除成功')

      // 前端同步删除
      const parentNode = treeNode.parent
      if (parentNode) {
        parentNode.data.children = parentNode.data.children.filter(
          item => item.id !== treeNode.data.id
        )
      } else {
        treeData.value = treeData.value.filter(
          item => item.id !== treeNode.data.id
        )
      }

      // 强制刷新视图
      treeData.value = [...treeData.value]
      hideContextMenu()
    } else {
      ElMessage.error(res.data.msg || '删除失败')
    }
  } catch (err) {
    ElMessage.error(err.response?.data?.msg || err.message || '请求失败')
  }
}

</script>

<style scoped>

.card-wrapper {
  height: calc(100vh - 100px); /* 调整这个值来预留 header、padding、分页高度 */
}

.el-table__body tr.current-row > td {
  background-color: #f5f7fa !important;
}

.context-menu {
  position: absolute;
  background: white;
  border: 1px solid #ccc;
  padding: 10px;
  list-style: none;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
.context-menu li {
  padding: 5px 10px;
  cursor: pointer;
}
.context-menu li:hover {
  background-color: #f5f5f5;
}
.avatar-uploader .avatar {
  width: 100px;
  height: 100px;
  display: block;
  border-radius: 50%;
}
</style>
