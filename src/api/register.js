import request from "@/utils/req_user";
//导出注册方法
export const Register = (data) =>{
    return request({
        url:'/api/register',
        method:'POST',
        data
    })
}