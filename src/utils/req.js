import axios from "axios";
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

//导出
export default request;