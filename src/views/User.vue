<template>
    <el-header>
    <Header></Header>
    </el-header>
    <div class="user" style="margin-top: 40px; box-shadow: 12px 12px 12px 12px rgba(0,0,0,0.1)">
      <div class="son title">
        <span class="tips">个人信息</span>
      </div>
      <div class="son avatar">
          <el-upload
          class="avatar-uploader"
          :action="uploadAction"
          :show-file-list="false"
          :on-success="handleAvatarSuccess"
          :before-upload="beforeAvatarUpload"
          :headers="uploadHeaders"
          >
          <div class="block"><el-avatar :size="80" :src="imageUrl" /></div>
          </el-upload>
      </div>
      <div class="son data">
        <el-divider><el-icon><star-filled /></el-icon></el-divider> 
        <div v-if="userInfo">
        昵称<el-input v-model="userInfo.user_name" placeholder="昵称" /><el-divider />
        联系方式<el-input v-model="userInfo.phone" placeholder="联系方式" /><el-divider />
        个人邮箱<el-input v-model="userInfo.email" placeholder="个人邮箱" />
        </div>
        <el-divider><el-icon><star-filled /></el-icon></el-divider>
      <el-button type="primary" @click="handleChange">修改</el-button>
      </div>
  </div>
</template>

<script setup>
import Header from '../layout/Header'
import { ref, computed} from 'vue'
import { StarFilled } from '@element-plus/icons-vue'
import axios from "axios";
import { ElMessage } from 'element-plus'

// ---------------------初始化信息
const uploadAction = `${process.env.VUE_APP_API_BASE_URL}/api/v1/upload/ava`
const userInfo = ref(null)
const imageUrl = ref('')
const token = sessionStorage.getItem('token')


// 上传请求头
const uploadHeaders = computed(() => ({
  Authorization: token,
}))

//-----------------------获取用户基本信息
const fetchUserInfo = async () => {
  const token = sessionStorage.getItem('token');
  if (!token) {
    ElMessage.error('用户未登录!');
    return;
  }
  
  try {
    const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/api/v1/user_info`, {
      headers: {
        'Authorization': `${token}`
      }
    });
    if (response.data.code == 200) {
      imageUrl.value = response.data.data.ava_url;
      userInfo.value = response.data.data;
      console.log(userInfo.value.user_name);
    } else {
      ElMessage.error('获取用户信息失败');
    }
  } catch (error) {
    ElMessage.error(`获取用户信息失败: ${error.message}`);
  }
};
// 用户基本信息
const initBaseList = async () => {
    await fetchUserInfo();
};

initBaseList()

// ------------------------------修改用户信息
function handleChange (){
  axios.put(`${process.env.VUE_APP_API_BASE_URL}/api/v1/user_info`, userInfo.value, {
    headers: {
        'Authorization': `${token}`
      }
    })
    .then(response => {
      const { data, headers } = response;
      if (data.code === 200) {
        ElMessage.success(data.msg)
      } else {
        ElMessage.error(data.msg)
      }
    })
    .catch(error => console.error(`登录失败: ${error.message}`));
}

// ------------------------用户头像信息
// 上传成功回调
const handleAvatarSuccess = (response) => {
  if (response.code === 200) {
    imageUrl.value = response.data.url
    ElMessage.success("头像上传成功")
  } else {
    ElMessage.error(response.msg)
  }
}

// 上传前校验信息
const beforeAvatarUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2 // 限制文件大小为 2MB

  if (!isImage) {
    ElMessage.error("只能上传图片文件")
  }
  if (!isLt2M) {
    ElMessage.error("图片大小不能超过 2MB")
  }
  return isImage && isLt2M
}

</script>
<style scoped>
.user{
    margin: auto;
    height: 800px;
    width: 850px;
    background-color: rgb(230, 202, 160);
    position: relative;
}
.tips{
  display: flex;
  line-height: 100px;
  text-align: center;
  font-size: 30px;
}
.son{
    position: absolute;
}
.title{
    height: 80px;
    width: 850px;
    background-color: rgb(255, 255, 255);
    text-align: center;
}
.avatar{
    height: px;
    top: 80px;
    height: 720px;
    width: 100px;
    background-color:rgb(255, 255, 255);
}
.data{
    top: 80px;
    left: 100px;
    height: 720px;
    width: 750px;
    background-color:rgb(255, 255, 255);
    position: absolute;
}
.block{
  line-height: 300px;
}
</style>