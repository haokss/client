import request from "@/utils/request.js";
//导出登陆方法
export const Login = (data) =>{
    return request({
        url:'/api/login',
        method:'POST',
        data
    })
}