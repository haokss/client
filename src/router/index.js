import { createRouter, createWebHashHistory } from 'vue-router'
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import Notfound from "../views/404.vue";
import User from "../views/User.vue"
const routes = [
  {
    path: '/login',
    name: 'login',
    component: Login
  },
  {
    path: '/register',
    name: 'register',
    component: Register
  },
  {
    path: '/user',
    name: 'user',
    component: User
  },
  {
    path: '/',
    name: 'home_page',
    component:()=>import('../layout'),
    redirect:  '/home_page',
    children:[
      {
        path:'/home_page',
        name:'/home_page',
        component: () => import('@/views/home_page')
      },
      {
        path:'/img',
        name:'/img',
        component: () => import('@/views/img_detect')
      },
      {
        path:'/connect',
        name:'/connect',
        component: () => import('@/views/connect')
      },      
      {
        path:'/other',
        name:'/other',
        component: () => import('@/views/other')
      },
      {
        path:'/about',
        name:'/about',
        component: () => import('@/views/about')
      }
    ]
  },
  {
    path: '/:pathMatch(.*)',
    name: '/404',
    component: Notfound
  }

]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
