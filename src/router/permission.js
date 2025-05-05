import router from "./index";

//创建白名单
const whiteList = ['/login','/register']
router.beforeEach((to,from,next)=>{
    if(sessionStorage.getItem('token')){
        if(to.path === '/login'){
            next('/')
        }else{
            next()
        }
    }else{
        if(whiteList.includes(to.path)){
            next()
        }else{
            next('/login')
        }
    }
})