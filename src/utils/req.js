import axios from "axios";
const request = axios.create({
    baseURL:`${process.env.VUE_APP_API_BASE_URL}`,
    timeout:5000,
})
//添加拦截请求
// request.interceptors.request.use(function(config){
//     //添加token请求头
//     config.headers.Authorization = localStorage.getItem('token')
//     return config;
// })

//导出
export default request;