<template>
    <div class="register">
      <el-form ref="formRef" :model="form" :rules="rules" class="register-form">
        <div class="title-container">
          <h3 class="title">用户注册</h3>
        </div>
        <el-form-item label="用户名:" prop="username">
          <el-input v-model="form.username" class="styled-input" />
        </el-form-item>
        <el-form-item label="密码: " prop="password">
            <el-input v-model="form.password" :type="passwordType" class="styled-input" />
            <svg-icon :icon="passwordType === 'password' ? 'eye' : 'eye-open'" @click="changeType" class="password-toggle-icon" />
        </el-form-item>
        <el-form-item label="确认密码:" prop="password">
            <el-input v-model="form.password_repeat" :type="passwordType" class="styled-input" />
            <svg-icon :icon="passwordType === 'password' ? 'eye' : 'eye-open'" @click="changeType" class="password-toggle-icon" />
        </el-form-item>
        <div class="button-container">
          <el-button type="primary" @click="handleRegister">注册</el-button>
          <el-button type="primary" @click="handleReturn">返回</el-button>
        </div>
      </el-form>
    </div>
  </template>
  
<script setup >
import { Register } from "@/api/register";
import { ref } from "vue";
import router from "@/router";
import  qs from 'qs'
import axios from "axios";
import { ElMessage } from 'element-plus'

const form =ref({
    username:'',
    password:'',
    password_repeat:'',
})
const rules =ref({
    username: [
    { min: 6, max: 12, message: '长度必须在6-12之间', trigger: 'blur' },
  ],  
}) 

const formRef = ref(null)

// 登录方法，获取 session_id 并存储到 sessionStorage 中
function handleRegister (){
    axios.post('http://43.143.200.197:8878/api/register', form.value)
        .then(response => {
        const { data, headers } = response;
        if (data.code === 201) {
            // const session_id = getSessionIdFromHeaders(headers);
            //设置了空的session_id,通过白名单验证
            // sessionStorage.setItem('session_id', data.session_id);
            // console.log('登录成功，session_id: ', session_id);
            ElMessage.success(data.msg)
            router.replace('/login')   
        } else {
            ElMessage.error(data.msg)
        }
        })
        .catch(error => console.error(`登录失败: ${error.message}`));
}
// //注册处理函数
// const handleRegister=()=>{
//     formRef.value.validate(async(valid)=>{
//         if(valid){
//             await Register(form.value)  
//         }
//         else{
//             console.log('error sumbit!')
//             return false
//         }
//     })
// }

//注册返回处理函数
const handleReturn=()=>{
    formRef.value.validate(async(valid)=>{
        if(valid){
            router.replace('/login')       
        }
        else{
            return false
        }
    })
}
const passwordType = ref('password')
const changeType = ()=>{
    if(passwordType.value === 'password'){
        passwordType.value = 'text'
    }else{
        passwordType.value = 'password'
    }
}
</script>


<style scoped>
.register {
  background-image: url(../assets/Login_bg.jpg);
  background-size: cover;
  background-position: center;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.register-form {
  background-color: rgba(255, 255, 255, 0.9);
  width: 400px;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
}

.title-container {
  text-align: center;
  margin-bottom: 20px;
}

.title {
  font-size: 24px;
  color: #333;
}

.styled-input {
  width: 100%;
  display: flex;
  align-items: center;
}

.svg-icon {
  margin-right: 10px;
  fill: #888;
}

.password-toggle-icon {
  cursor: pointer;
}

.button-container {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
}

</style>