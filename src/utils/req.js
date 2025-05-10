import axios from "axios";
const request = axios.create({
    baseURL:`${process.env.VUE_APP_API_BASE_URL}`,
    timeout:5000,
})

//导出
export default request;