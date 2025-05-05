<template>
  <div class="photo-wall">
    <el-upload
      class="upload-demo"
      :action="uploadAction"
      :on-success="handleUploadSuccess"
      :before-upload="beforeUpload"
      :show-file-list="false"
      :headers="uploadHeaders"
    >
      <el-button type="primary">上传照片</el-button>
    </el-upload>

    <!-- 照片展示墙 -->
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
            <span class="photo-title">{{ photo.title }}</span>
            <span class="photo-description">{{ photo.description }}</span>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import axios from "axios";
// 上传接口
const uploadAction = `${process.env.VUE_APP_API_BASE_URL}/api/v1/upload/image`
const token = sessionStorage.getItem('token')

// 上传请求头
const uploadHeaders = computed(() => ({
  Authorization: token,
}))


// 照片数据
const photos = ref([])
// 预览图片列表
const previewList = ref(photos.value.map(photo => photo.url))

// ---------------------------------历史图片获取
const fetchImage = async () => {
  try {
    const response = await axios.get(uploadAction, {
      headers: {
        'Authorization': `${token}`
      }
    });
    if (response.data.code == 200) {
      const data = response.data.data
      photos.value = data.urls.map(item => ({
        url: item.url,
        title: item.image_name,
        description: item.description
      }))
      // 更新预览列表
      previewList.value = photos.value.map(photo => photo.url)

    } else {
      ElMessage.error('获取用户信息失败');
    }
  } catch (error) {
    ElMessage.error(`获取用户信息失败: ${error.message}`);
  }
};
// 图片基本信息
const initBaseList = async () => {
    await fetchImage();
};

// ---------------------------------图片上传
// 上传前校验
const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2 // 限制文件大小为 2MB

  if (!isImage) {
    ElMessage.error('只能上传图片文件')
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB')
  }
  return isImage && isLt2M
}

// 上传成功回调
const handleUploadSuccess = (response, file) => {
  if (response.code === 200) {
    // 将新照片添加到照片墙
    photos.value.push({
      url: response.data.url,
      title: '',
      description: '',
    })
    // 更新预览列表
    previewList.value = photos.value.map(photo => photo.url)
    ElMessage.success('上传成功')
  } else {
    ElMessage.error('上传失败')
  }
}

//---------------------------立即请求
initBaseList()

</script>

<style scoped>
.photo-wall {
  padding: 20px;
}

.upload-demo {
  margin-bottom: 20px;
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
  margin-bottom: 5px;
}

.photo-description {
  font-size: 14px;
  color: #666;
}
</style>