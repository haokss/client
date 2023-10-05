<template>
    <div class="login">
        <el-form ref="formRef" :model="form" :rules="rules" class="login-form">
        <div class="title-container">
          <h3 class="title">用户登陆</h3>
        </div>
        <el-form-item label="用户名:" prop="username" class="styled-input">
        <svg-icon class="svg-container" icon="user"></svg-icon>
        <el-input v-model="form.username" />
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
import { ref } from "vue";
// import { useStore } from "vuex";
import router from "@/router";
import axios from "axios";
import { ElMessage } from 'element-plus'


const request = axios.create({
    baseURL:"http://43.143.200.197",
    timeout:5000,
})
// const store = useStore()

const form =ref({
    username:'',
    password:''
})
const rules =ref({
    username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 6, max: 12, message: '用户名长度在6-12之间', trigger: 'blur' },
  ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' }
    ],    
})

//http://43.143.200.197:8878/api/login
// 登录方法，获取 session_id 并存储到 sessionStorage 中
function handleLogin (){
  axios.post('http://localhost:8080/api/login', form.value)
    .then(response => {
      const { data, headers } = response;
      if (data.code === 200) {
        // const session_id = getSessionIdFromHeaders(headers);
        //设置了空的session_id,通过白名单验证

        sessionStorage.setItem('session_id', data.session_id.username);
        sessionStorage.setItem('user_base_info', JSON.stringify(data.user_base_info));

        // console.log('登录成功，session_id: ', session_id);
        ElMessage.success(data.msg)
        router.replace('/')   
      } else {
        ElMessage.error(data.msg)
      }
    })
    .catch(error => console.error(`登录失败: ${error.message}`));
}

//注册转跳处理函数
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

// // 从响应头中解析 session_id
// function getSessionIdFromHeaders(headers) {
//   console.log("headers:`",headers)
//   const cookie = headers['set-ookie'];
//   console.log("cookie:",cookie)
//   if (cookie) {
//     const matches = cookie[0].match(/session_id=(\w+)/);
//     if (matches) {
//       return matches[1];
//     }
//   }
//   console.error('无法解析 session_id');
// }
</script>
<style scoped>
.login {
  background-image: url(../assets/Login_bg.jpg);
  background-size: cover;
  background-position: center;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
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