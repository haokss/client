import axios from "axios";
import { ElMessage } from 'element-plus'
import router from "@/router";
const request = axios.create({
    baseURL:`${process.env.VUE_APP_API_BASE_URL}`,
    timeout:5000,
})
//响应请求拦截器
request.interceptors.response.use((response)=>{
    const {data}=response
    if(data.code === 201){
        ElMessage.success(data.msg)
        router.replace('/login')  
        return data
    }else{
        ElMessage.error(data.msg)
    }
},error=>{
    console.log(error)
    error.response && ElMessage.error(error.response)
    return Promise.reject(new Error(error.response))
})


//导出
export default request;