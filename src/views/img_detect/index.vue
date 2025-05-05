
<template>
    <el-upload
    class="upload-demo"
    drag
    action="{{apiBaseUrlapi}}/yolov5/test"
    method= 'POST'
    name="img"
    :on-success="handleSuccess"
    >
    <el-icon class="el-icon--upload"><upload-filled /></el-icon>
    <div class="el-upload__text" >
        拖拽上传待检测图片 或 <em>点击上传</em>
    </div>
    <template #tip>
        <div class="el-upload__tip">
        jpg/png 文件必须小于 500kb, 并且文件名不带有空格
        </div>
    </template>
    </el-upload>
    <div class="demo-image__placeholder">
        <div class="block">
        <span class="demonstration">上传图片</span>
        <el-image :src="state.detectSrc">
            <template #placeholder>
            <el-icon><icon-picture /></el-icon>
            </template>
        </el-image>
        </div>                                                    
        <div class="block">
        <span class="demonstration">检测图片</span>
        <el-image :src="state.detectSrc">
            <template #placeholder>
            <el-icon><icon-picture /></el-icon>
            </template>
        </el-image>
        </div>
    </div>
        <el-table :data="detectList.value" height="250" style="width: 100%">
        <el-table-column prop="img_name" label="图片名" width="180" />
        <el-table-column prop="object" label="object" width="180" />
        <el-table-column prop="percentage" label="percentage(%)" />
        </el-table>
            
</template>


<script setup>
import router from '@/router';
import { reactive,ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import { UploadFilled } from '@element-plus/icons-vue'
import { Picture as IconPicture } from '@element-plus/icons-vue'

const apiBaseUrl = computed(() => process.env.VUE_APP_API_BASE_URL);

// 用户推断表单数据
const detectList = reactive([])

const state = reactive({
  src: '', // 上传的图片的 URL
  detectSrc: null, // 检测后的图片的 URL
})
// 上传图片并获取检测结果
const handleSuccess = (response, file) => {
  console.log('上传成功：', response, file)
  // 将上传成功的文件信息存储到 fileList 变量中
  // 文件信息包括文件的 URL、名称、大小和类型
  if(response.code == 400)
    return ElMessage.warning(response.msg)
  ElMessage.success(response.msg)
  state.src = URL.createObjectURL(file.raw)
  detectList.value =  response.detect_dic
  try{
  // 解码base64编码的图像数据
  const imgData = response.image_data
  const imgUrl = `data:image/png;base64,${imgData}`
  state.detectSrc = imgUrl
  }catch(error){
    ElMessage.error(response.msg)
  }
}

const baseList = ref([])
//处理注销函数
const handleDes=()=>{
  sessionStorage.clear()
  ElMessage.success("注销成功！")
  router.replace('/login')
   .catch(error => ElMessage.error(`登录失败: ${error.message}`));
}


// //用户基本信息
// const initBaseList = async()=>{
//   baseList.value= await (await user_Base()).data
//   console.log(await user_Base())
// }
// const circleUrl='https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg'

// initBaseList()

// //监听检测图片上传数据
// const fileList = ref([])

// const uploadFile = async (file) => {
//   const url = 'http://127.0.0.1:8080/api/yolov5/test'
//   const formData = new FormData()
//   formData.append('file', file)
//   const config = {
//     headers: { 'content-type': 'multipart/form-data' }
//   }
//   try {
//     const response = await axios.post(url, formData, config)
//     console.log('上传成功：', response)
//     return response.data
//   } catch (error) {
//     console.log('上传失败：', error)
//   }
// }


</script>

<style>
.demo-image__placeholder .block {
  padding: 80px 0;
  text-align: center;
  border-right: solid 1px var(--el-border-color);
  display: inline-block;
  width: 49%;
  box-sizing: border-box;
  vertical-align: top;
}
.demo-image__placeholder .el-image {
  padding: 0 5px;
  max-width: 640px;
  max-height: 640px;
}
.demo-image__placeholder.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
  font-size: 14px;
}
</style>