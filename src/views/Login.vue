<template>
    <div class="login">
        <el-form ref="formRef" :model="form" :rules="rules" class="login-form">
        <div class="title-container">
          <h3 class="title">用户登陆</h3>
        </div>
        <el-form-item label="用户名:" prop="user_name" class="styled-input">
        <svg-icon class="svg-container" icon="user"></svg-icon>
        <el-input v-model="form.user_name" />
        </el-form-item>

        <el-form-item label="密码:" prop="password" class="styled-input"  >
        <el-input v-model="form.password" :type="passwordType" />
        <svg-icon :icon="passwordType === 'password'? 'eye':'eye-open'"
         @click="changeType">
        </svg-icon>
        </el-form-item>
        <div class="button-container">
            <el-button type="primary" @click="handleLogin">登陆</el-button>
            <el-button type="primary" @click="handleRegister">注册</el-button>
        </div>
    </el-form>
    </div>
</template>

<script setup >
// import { Login} from "@/api/login";
import { ref, computed } from "vue";
// import { useStore } from "vuex";
import router from "@/router";
import axios from "axios";
import { ElMessage } from 'element-plus'
import { getUserRole } from '@/utils/auth'

const form =ref({
    user_name:'',
    password:''
})

const rules =ref({
    user_name: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    // { min: 5, max: 12, message: '用户名长度在5-12之间', trigger: 'blur' },
  ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' }
    ],    
})

// 登录方法，获取 session_id 并存储到 sessionStorage 中
function handleLogin (){
  axios.post(`${process.env.VUE_APP_API_BASE_URL}/api/v1/user/login`, form.value)
    .then(response => {
      const { data, headers } = response;
      if (data.code === 200) {
        // 设置token
        sessionStorage.setItem('token', data.data.token);
        // 取出用户名
        const username = data.data.user.user_name; 
        ElMessage.success(data.msg)
        console.log('登录成功，准备跳转');
        const role = getUserRole();
        if (role === 'admin') {
          router.replace('/admin/home_page');
        } else {
          router.replace('/');
        }
        console.log('跳转完成'); 
      } else {
        ElMessage.error(data.msg)
      }
    })
    .catch(error => console.error(`登录失败: ${error.message}`));
}

// 注册转跳处理函数
const handleRegister = ()=>{
    router.replace('register')
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
.login {
  background-image: url(../assets/Login_bg.jpg);
  background-size: cover;               /* 让背景图覆盖整个容器 */
  background-position: center;          /* 居中显示图片 */
  background-repeat: no-repeat;         /* 不重复 */
  background-attachment: fixed;         /* 背景固定，页面滚动时不动 */
  
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.login-form {
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