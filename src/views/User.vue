<template>
    <el-header>
    <Header></Header>
    </el-header>
    <div class="user" style="box-shadow: 12px 12px 12px 12px rgba(0,0,0,0.1)">
        <div class="son title">
          <span class="tips">个人信息</span>
        </div>
        <div class="son avatar">
            <el-upload
            class="avatar-uploader"
            action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15"
            :show-file-list="false"
            >
            <div class="block"><el-avatar :size="80" :src="imageUrl" /></div>
            </el-upload>
        </div>
        <div class="son data">
          <el-divider>
            <el-icon><star-filled /></el-icon>
          </el-divider>
          昵称<el-input v-model="user_info.nickname" placeholder="昵称" />
            <el-divider />
          联系方式<el-input v-model="user_info.phone_number" placeholder="联系方式" />
            <el-divider />
          个人邮箱<el-input v-model="user_info.e_mail" placeholder="个人邮箱" />
          <el-divider>
            <el-icon><star-filled /></el-icon>
          </el-divider>

          简介<el-input
              v-model="user_info.intro"
              :rows="2"
              type="textarea"
              placeholder="简单介绍一下自己吧"
          />
        <el-button type="primary" @click="handleChange">修改</el-button>
        </div>
    

  </div>
</template>

<script setup>
import Header from '../layout/Header'
import { ref } from 'vue'
import { StarFilled } from '@element-plus/icons-vue'
import axios from "axios";
import { ElMessage } from 'element-plus'
const imageUrl='https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg'

const baseList = ref({})
//用户基本信息
const initBaseList = async()=>{
  const storedBaseInfo = sessionStorage.getItem("user_base_info")
  if(storedBaseInfo){
    baseList.value = JSON.parse(storedBaseInfo) // json to object
  }
}
initBaseList()

const username = baseList.value.username
const user_info= baseList
user_info.username=username
// 修改用户信息
function handleChange (){
  axios.post('http://43.143.200.197:8878/api/userinfo_update', user_info.value)
    .then(response => {
      const { data, headers } = response;
      if (data.code === 200) {
        ElMessage.success(data.msg)
        sessionStorage.setItem('user_base_info', JSON.stringify(data.user_base_info));
      } else {
        console.log(user_info.value)
        ElMessage.error(data.msg)
      }
    })
    .catch(error => console.error(`登录失败: ${error.message}`));
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