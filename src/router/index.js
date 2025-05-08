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
        name:'home_page',
        component: () => import('@/views/home_page')
      },
      {
        path:'/image',
        name:'image',
        component: () => import('@/views/file_manager/image')
      },
      {
        path:'/connect',
        name:'connect',
        component: () => import('@/views/connect')
      },      
      {
        path:'/task',
        name:'task',
        component: () => import('@/views/task'),
      },
      {
        path:'/relative',
        name:'relative',
        component: () => import('@/views/relative')
      },
      {
        path:'/colleague',
        name:'colleague',
        component: () => import('@/views/colleague')
      },
      {
        path:'/classmate',
        name:'classmate',
        component: () => import('@/views/classmate')
      },
      {
        path:'/friend',
        name:'friend',
        component: () => import('@/views/friend')
      },
      {
        path:'/bill',
        name:'bill',
        component: () => import('@/views/bill')
      },
      {
        path:'/timing_task',
        name:'timing_task',
        component: () => import('@/views/timing_task'),
      },
      {
        path:'/task_statistics',
        name:'task_statistics',
        component: () => import('@/views/task_statistics'),
      },
      {
        path:'/map_view',
        name:'map_view',
        component: () => import('@/views/map_view'),
      },
      {
        path:'/setting',
        name:'setting',
        component: () => import('@/views/setting')
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
  routes,
})

export default router
