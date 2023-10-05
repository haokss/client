<template>
    <el-menu
    :default-active="activeIndex"
    class="el-menu-demo"
    mode="horizontal"
    :ellipsis="false"
    @select="handleSelect"
  >
    <div></div>
    <el-menu-item index="0">Logo</el-menu-item>
    <el-menu-item index="1" @click="handleHome" >首页</el-menu-item> -->
    <!-- <div>欢迎{{ baseList.username }}</div> -->
    <span style="color:rgb(0, 0, 0)">欢迎{{ baseList.username }}</span>
      <el-dropdown size="large">

        <div class="block"><el-avatar :size="45" :src="circleUrl" /></div>

        <template  #dropdown>
                  
            <el-dropdown-item  @click="handleUser">个人中心</el-dropdown-item>
            <el-dropdown-item>拓展</el-dropdown-item>
            <el-dropdown-item type="primary" @click="handleDes">退出</el-dropdown-item>
        </template>
      </el-dropdown>
  </el-menu>
  
</template>

<script setup>
import router from '@/router';
import {user_Base} from '@/api/user_base'
import { reactive,ref } from 'vue'
import { ElMessage } from 'element-plus'


const baseList = ref([])
// //处理注销函数
const handleDes=()=>{
  sessionStorage.clear()
  ElMessage.success("退出成功！")
  router.replace('/login')
   .catch(error => ElMessage.error(`登录失败: ${error.message}`));
}
const handleUser=()=>{
  router.replace('/user')
   .catch(error => ElMessage.error(`${error.message}`));
}
const handleHome=()=>{
  router.replace('/')
   .catch(error => ElMessage.error(`${error.message}`));
}
//用户基本信息
const initBaseList = async()=>{
  const storedBaseInfo = sessionStorage.getItem("user_base_info")
  if(storedBaseInfo){
    baseList.value = JSON.parse(storedBaseInfo) // json to object
  }
  // console.log(baseList)
}

let base_info ={}
base_info=sessionStorage.getItem("user_base_info")

const circleUrl='https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg'

initBaseList()



</script>


