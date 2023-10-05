import axios from "axios";
import { ElMessage } from 'element-plus'
const request = axios.create({
    baseURL:"http://43.143.200.197:8878",
    timeout:5000,
})
//添加拦截请求
// request.interceptors.request.use(function(config){
//     //添加token请求头
//     config.headers.Authorization = localStorage.getItem('token')
//     return config;
// })


//响应请求拦截器
request.interceptors.response.use((response)=>{
    const {data}=response
    console.log(data) 
    if(data.code === 200){
        ElMessage.success(data.msg)
        // const session_id = getSessionIdFromHeaders(headers);
        // localStorage.setItem('token',data.token)
        sessionStorage.setItem('session_id',data.session)
        return data
    }else{
        ElMessage.error(data.msg)
        // return Promise.reject(new Error(data.message))
    }
},error=>{
    console.log(error)
    error.response && ElMessage.error(error.response)
    return Promise.reject(new Error(error.response))
})

//导出
export default request;