<template>
  <div class="photo-review-wall">
    <!-- 搜索区域 -->
    <div class="search-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="请输入图片名或描述进行搜索"
        class="search-input"
        clearable
        @clear="handleSearch"
        @keyup.enter.native="handleSearch"
      >
        <template #append>
          <el-button icon="el-icon-search" @click="handleSearch">搜索</el-button>
        </template>
      </el-input>
    </div>

    <!-- 图片展示区域 -->
    <el-row :gutter="20">
      <el-col
        v-for="(photo, index) in photos"
        :key="photo.url"
        :xs="24" :sm="12" :md="8" :lg="6" :xl="4"
      >
        <el-card class="photo-card">
          <el-image
            :src="photo.url"
            fit="cover"
            class="photo-image"
            :preview-src-list="previewList"
            :initial-index="index"
          />
          <div class="photo-info">
            <span class="photo-title">{{ photo.title || '未命名' }}</span>
            <span class="photo-description">{{ photo.description || '暂无描述' }}</span>
            <span class="photo-uploader">上传者：{{ photo.uploader || '未知' }}</span>
            <span class="photo-time">上传时间：{{ formatTime(photo.uploadTime) }}</span>
          </div>

          <div class="photo-actions" v-if="photo.reviewStatus === 'unreviewed'">
            <el-button type="success" size="small" @click="approvePhoto(photo)">审核通过</el-button>
            <el-button type="danger" size="small" @click="rejectPhoto(photo)">审核不通过</el-button>
          </div>

          <div class="photo-reviewed" v-else>
            <el-tag type="success" v-if="photo.reviewStatus === 'approved'">已通过</el-tag>
            <el-tag type="danger" v-else-if="photo.reviewStatus === 'rejected'">已拒绝</el-tag>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 分页器 -->
    <div class="pagination">
      <el-pagination
        background
        layout="prev, pager, next, sizes, total"
        :total="total"
        :page-size="pageSize"
        :current-page="currentPage"
        :page-sizes="[8, 16, 24]"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

// Token 和请求头
const token = sessionStorage.getItem('token')
const uploadHeaders = computed(() => ({ Authorization: token }))

// 搜索关键字
const searchKeyword = ref('')

// 图片数组和分页参数
const photos = ref([])
const previewList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(8)

// 格式化时间
const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleString()
}

// 审核状态转换
const mapCheckStatus = (isChecked) => {
  if (isChecked === 1) return 'approved'
  if (isChecked === 2) return 'rejected'
  return 'unreviewed'
}

// 获取图片数据
const fetchImage = async () => {
  try {
    const response = await axios.get(
      `${process.env.VUE_APP_API_BASE_URL}/api/v1/admin/upload/image`,
      {
        headers: uploadHeaders.value,
        params: {
          page: currentPage.value,
          page_size: pageSize.value,
          keyword: searchKeyword.value || ''
        }
      }
    )

    if (response.data.code === 200) {
      const data = response.data.data
      total.value = data.total || data.urls.length

      photos.value = data.urls.map(item => ({
        id: item.id,
        uid: item.uid,
        url: item.url,
        title: item.image_name,
        description: item.description,
        uploader: item.user_name,
        uploadTime: item.upload_time,
        reviewStatus: mapCheckStatus(item.is_checked)
      }))

      previewList.value = photos.value.map(p => p.url)
    } else {
      ElMessage.error('获取图片失败')
    }
  } catch (error) {
    ElMessage.error(`获取图片失败: ${error.message}`)
  }
}

// 搜索操作
const handleSearch = () => {
  currentPage.value = 1
  fetchImage()
}

// 分页操作
const handlePageChange = (page) => {
  currentPage.value = page
  fetchImage()
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  fetchImage()
}

// 审核请求封装
const auditPhoto = async (photo, isChecked) => {
  try {
    await ElMessageBox.confirm(
      `确定要${isChecked === 1 ? '通过' : '拒绝'}审核【${photo.title || '未命名'}】？`,
      '确认审核',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const res = await axios.post(
      `${process.env.VUE_APP_API_BASE_URL}/api/v1/admin/upload/image/audit/batch`,
      {
        is_checked: isChecked,
        audit_items: [
          {
            uid: photo.uid,
            image_ids: [photo.id]
          }
        ]
      },
      {
        headers: uploadHeaders.value
      }
    )

    if (res.data.code === 200) {
      photo.reviewStatus = isChecked === 1 ? 'approved' : 'rejected'
      ElMessage.success(`审核成功：${photo.title || '未命名'}`)
    } else {
      ElMessage.error(res.data.msg || '审核失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`审核失败：${error.message}`)
    }
  }
}

// 审核通过
const approvePhoto = (photo) => {
  auditPhoto(photo, 1)
}

// 审核拒绝
const rejectPhoto = (photo) => {
  auditPhoto(photo, 2)
}

// 初始化加载
fetchImage()
</script>

<style scoped>
.photo-review-wall {
  padding: 20px;
}
.search-bar {
  margin-bottom: 20px;
}
.search-input {
  width: 400px;
}
.photo-card {
  margin-bottom: 20px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}
.photo-image {
  width: 100%;
  height: 200px;
}
.photo-info {
  padding: 10px;
  background-color: #f5f7fa;
}
.photo-title {
  font-size: 16px;
  font-weight: bold;
  display: block;
}
.photo-description,
.photo-uploader,
.photo-time {
  font-size: 14px;
  color: #666;
  display: block;
  margin-top: 4px;
}
.photo-actions {
  display: flex;
  justify-content: space-between;
  padding: 10px;
}
.photo-reviewed {
  text-align: center;
  padding: 10px;
}
.pagination {
  margin-top: 20px;
  text-align: center;
}
</style>
