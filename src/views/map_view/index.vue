<template>
  <div class="map-container">
    <!-- <el-card style="height: 100%; display: flex; flex-direction: column;"> -->
      <div class="sidebar">
        <el-card v-for="(points, type) in groupedPoints" :key="type" class="type-card">
          <template #header>
            <div class="card-header">
              <span>{{ type }}</span>
              <el-button size="small" type="primary" @click="addPoint(type)">新增</el-button>
            </div>
          </template>
          <el-scrollbar class="point-list">
            <div v-for="point in points" :key="point.id" class="point-item">
              <span @click="focusPoint(point)">{{ point.name }}</span>
              <div class="actions">
                <el-button size="small" @click="editPoint(point)">编辑</el-button>
                <el-button size="small" type="danger" @click="deletePoint(point)">删除</el-button>
              </div>
            </div>
          </el-scrollbar>
        </el-card>
      </div>
      <div class="map" ref="mapContainer"></div>
    <!-- </el-card> -->
    <!-- 抽屉组件 -->
    <el-drawer
      v-model="drawerVisible"
      title="新增/编辑点位"
      size="25%"
      :before-close="resetForm"
      direction="rtl">
      <el-form :model="form">
        <el-form-item label="名称">
          <el-input v-model="form.name" />
        </el-form-item>

        <!-- 动态选择人员 -->
        <el-form-item label="选择人员">
          <el-select v-model="form.selectedPeople" multiple placeholder="请选择人员">
            <el-option
              v-for="person in availablePeople"
              :key="person.id"
              :label="person.relation ? `${person.name} (${person.relation})` : person.name"
              :value="person.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="drawerVisible = false">取消</el-button>
        <el-button type="primary" @click="savePoint">保存</el-button>
      </template>
    </el-drawer>
  </div>
</template>


<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import axios from 'axios'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { ElMessage } from 'element-plus'

const mapContainer = ref(null)
const map = ref(null)
const dialogVisible = ref(false)
const editingPoint = ref(null)
const unsetRelatives = ref([])
const drawerVisible = ref(false)
const form = reactive({
  name: '',
  type: '',
  latlng: null,
  selectedPeople: [] // 存储所选人员的 id 列表
})

const pointTypes = ['亲属', '同事', '朋友', '同学']
const pointColors = {
  '亲属': 'red',
  '同事': 'blue',
  '朋友': 'green',
  '同学': 'orange'
}

// 已设置点位的人员数据
const points = reactive([])

// 所有类型人员数据（包括未设置点位的）
const people = reactive({
  '亲属': [
    { id: 1, name: '爸爸' },
    { id: 2, name: '妈妈' },
    { id: 3, name: '哥哥' },
    { id: 4, name: '姐姐' },
    { id: 5, name: '弟弟' }
  ],
  '同事': [
    { id: 6, name: '张三' },
    { id: 7, name: '李四' },
    { id: 8, name: '王五' }
  ],
  '朋友': [
    { id: 9, name: '刘备' },
    { id: 10, name: '关羽' },
    { id: 11, name: '张飞' }
  ],
  '同学': [
    { id: 12, name: '小明' },
    { id: 13, name: '小红' },
    { id: 14, name: '小刚' }
  ]
})

const groupedPoints = computed(() => {
  const groups = {}
  pointTypes.forEach(type => { groups[type] = [] })

  points.forEach(p => {
    if (groups[p.type]) {
      groups[p.type].push(p)
    } else {
      console.warn('未知的点类型:', p)
    }
  })

  return groups
})

function initMap() {
  map.value = L.map(mapContainer.value).setView([34.3416, 108.9398], 5)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map.value)

  map.value.on('click', e => {
    ElMessage.info('请在左侧选择要新增的类型')
  })

  updateMarkers()
}

async function addPoint(type) {
  form.type = type
  form.selectedPeople = [] // 清空所选人员

  // 获取未设置点位的人员
  await fetchUnsetPeople(type)

  map.value.once('click', e => {
    form.name = ''
    form.latlng = e.latlng
    editingPoint.value = null
    drawerVisible.value = true
  })
  ElMessage.info(`点击地图选择 ${type} 点位位置`)
}

// --------------------------------------------------------新增/修改一个点位操作
async function savePoint() {
  if (!form.name.trim()) {
    ElMessage.warning('请输入名称')
    return
  }

  if (form.selectedPeople.length === 0) {
    ElMessage.warning('请选择至少一个人员')
    return
  }

  const newPoint = {
    name: form.name,
    type: form.type,
    latlng: form.latlng,
    selectedPeople: form.selectedPeople
  }

  try {
    const token = sessionStorage.getItem('token')
    if (!token) {
      ElMessage.error('未登录，无法保存')
      return
    }

    let res;
    if (editingPoint.value) {
      // 修改点位
      res = await axios.put(`${process.env.VUE_APP_API_BASE_URL}/api/v1/relative/point/${editingPoint.value.id}`, newPoint, {
        headers: {
          Authorization: token
        }
      })
    } else {
      // 新增点位
      res = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/api/v1/relative/point`, newPoint, {
        headers: {
          Authorization: token
        }
      })
    }

    if (res.data.code === 200) {
      if (editingPoint.value) {
        // 修改成功后更新本地数据
        const index = points.findIndex(p => p.id === editingPoint.value.id)
        if (index !== -1) {
          points[index] = res.data.data // 更新本地数据
        }
      } else {
        // 新增点位，添加到本地
        points.push(res.data.data)
      }
      ElMessage.success('点位保存成功')
      dialogVisible.value = false
      resetForm()
      fetchAllPoints()
      // updateMarkers()
    } else {
      ElMessage.error('保存点位失败')
    }
  } catch (err) {
    console.error(err)
    ElMessage.error('接口请求失败')
  }
}


function editPoint(point) {
  form.name = point.name
  form.type = point.type
  form.latlng = point.latlng
  form.selectedPeople = point.selectedPeople
  editingPoint.value = point
  drawerVisible.value = true
}


// ----------------------------------------------------删除点位
async function deletePoint(point) {
  const index = points.indexOf(point)
  if (index !== -1) {
    points.splice(index, 1)
  }
  updateMarkers()

  try {
    const token = sessionStorage.getItem('token')
    if (!token) {
      ElMessage.error('未登录，无法删除')
      return
    }

    const res = await axios.delete(`${process.env.VUE_APP_API_BASE_URL}/api/v1/relative/point/${point.id}`, {
      headers: {
        Authorization: token
      }
    })

    if (res.data.code === 200) {
      ElMessage.success('点位删除成功')
      updateMarkers()
    } else {
      ElMessage.error('删除点位失败')
    }
  } catch (err) {
    console.error(err)
    ElMessage.error('接口请求失败')
  }
}

function focusPoint(point) {
  map.value.setView(point.latlng, 12)
}

function resetForm() {
  form.name = ''
  form.type = ''
  form.latlng = null
  form.selectedPeople = []
  drawerVisible.value = false
}

// --------------------------------------------获取所有未设置点位的人员，根据选中类型确定
async function fetchUnsetPeople(type) {
  try {
    const token = sessionStorage.getItem('token')
    if (!token) {
      ElMessage.error('未登录，无法保存')
      return
    }

    let url = ''
    switch (type) {
      case '同事':
        url = `${process.env.VUE_APP_API_BASE_URL}/api/v1/relative/unset_map_colleague`
        break
      case '朋友':
        url = `${process.env.VUE_APP_API_BASE_URL}/api/v1/relative/unset_map_friend`
        break
      case '同学':
        url = `${process.env.VUE_APP_API_BASE_URL}/api/v1/relative/unset_map_classmate`
        break
      default:
        url = `${process.env.VUE_APP_API_BASE_URL}/api/v1/relative/unset_map_relative`
    }

    const res = await axios.get(url, {
      headers: {
        Authorization: token
      }
    })
    
    if (res.data.code === 200) {
      // 根据返回的数据更新人员列表
      unsetRelatives.value = res.data.data
      console.log('保存到 unsetRelatives:', unsetRelatives.value)
    } else {
      ElMessage.error(`获取未设置地图的${type}失败`)
    }
  } catch (err) {
    console.error(err)
    ElMessage.error('接口请求失败')
  }
}

// 动态获取选择人员的列表
const availablePeople = computed(() => {
  return unsetRelatives.value
})

const markers = reactive([])

function updateMarkers() {
  markers.forEach(m => m.remove())
  markers.length = 0

  points.forEach(p => {
    if (!p.latlng || !p.latlng.lat || !p.latlng.lng) {
      console.error(`无效的 latlng，点位名称：${p.name}`)
      return
    }

    const marker = L.circleMarker(p.latlng, {
      radius: 8,
      color: pointColors[p.type],
      fillColor: pointColors[p.type],
      fillOpacity: 0.8
    }).addTo(map.value).bindPopup(`${p.type}: ${p.name}`)
    markers.push(marker)
  })
}


// --------------------------------------------加载所有的点位
async function fetchAllPoints() {
  try {
    const token = sessionStorage.getItem('token')
    if (!token) {
      ElMessage.error('未登录，无法获取点位')
      return
    }

    const res = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/api/v1/relative/point`, {
      headers: {
        Authorization: token
      }
    })

    if (res.data.code === 200) {
      points.length = 0 // 清空已有的
      res.data.data.forEach(p => {
        points.push({
          id: p.id,
          name: p.name,
          type: p.type,
          latlng: {
            lat: p.lat, // 后端返回的字段需要是 lat/lng
            lng: p.lng
          },
          selectedPeople: p.selectedPeople // 假设后端返回的是 id 数组或字符串
        })
      })
      updateMarkers()
      ElMessage.success('加载点位成功')
      console.log('后端返回:', res.data.data)
    } else {
      ElMessage.error('获取点位失败')
    }
  } catch (err) {
    console.error(err)
    ElMessage.error('接口请求失败')
  }
}


onMounted(() => {
  initMap()
  fetchAllPoints()
})
</script>

<style scoped>
.map-container {
  display: flex;
  height: 100vh;
}
.sidebar {
  width: 300px;
  overflow-y: auto;
  background: #f9f9f9;
  padding: 10px;
}
.type-card {
  margin-bottom: 10px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.point-list {
  max-height: 200px;
}
.point-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}
.map {
  flex: 1;
}
.actions > .el-button {
  margin-left: 4px;
}
</style>
