<template>
  <div class="photo-review-wall">
    <el-row :gutter="20">
      <el-col
        v-for="(photo, index) in photos"
        :key="index"
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
          <div class="photo-actions" v-if="!photo.reviewed">
            <el-button type="success" size="small" @click="approvePhoto(index)">通过</el-button>
            <el-button type="danger" size="small" @click="rejectPhoto(index)">拒绝</el-button>
          </div>
          <div class="photo-reviewed" v-else>
            <el-tag type="success" v-if="photo.reviewStatus === 'approved'">已通过</el-tag>
            <el-tag type="danger" v-else-if="photo.reviewStatus === 'rejected'">已拒绝</el-tag>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

// 上传接口
const token = sessionStorage.getItem('token')

const uploadHeaders = computed(() => ({
  Authorization: token,
}))

// 照片数据
const photos = ref([])

// 预览图片列表
const previewList = ref([])

// 格式化时间
const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleString()
}

// 获取待审核图片
const fetchImage = async () => {
  try {
    const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/api/v1/admin/upload/image`, {
      headers: { Authorization: `${token}` }
    })
    if (response.data.code === 200) {
      const data = response.data.data
      photos.value = data.urls.map(item => ({
        url: item.url,
        title: item.image_name,
        description: item.description,
        uploader: item.uploader,            // 假设后端提供
        uploadTime: item.upload_time,       // 假设后端提供
        reviewed: false,                    // 前端状态：是否已审核
        reviewStatus: '',                   // 'approved' or 'rejected'
      }))
      previewList.value = photos.value.map(photo => photo.url)
    } else {
      ElMessage.error('获取图片失败')
    }
  } catch (error) {
    ElMessage.error(`获取图片失败: ${error.message}`)
  }
}

// 审核操作：通过
const approvePhoto = (index) => {
  photos.value[index].reviewed = true
  photos.value[index].reviewStatus = 'approved'
  ElMessage.success(`照片【${photos.value[index].title || '未命名'}】已通过审核`)
  // TODO: 可调用后端接口通知审核通过
}

// 审核操作：拒绝
const rejectPhoto = (index) => {
  photos.value[index].reviewed = true
  photos.value[index].reviewStatus = 'rejected'
  ElMessage.warning(`照片【${photos.value[index].title || '未命名'}】已被拒绝`)
  // TODO: 可调用后端接口通知审核拒绝
}

// 初始化加载
fetchImage()
</script>

<style scoped>
.photo-review-wall {
  padding: 20px;
}

.photo-card {
  margin-bottom: 20px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.photo-image {
  width: 100%;
  height: 200px;
  display: block;
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
</style>
