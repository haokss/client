import request from "@/utils/req.js";
//导出登陆方法
export const user_Base = (data) =>{
    return request({
        url:'/api/userinfo',
        method:'GET',
        data
    })
}