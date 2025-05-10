import { createRouter, createWebHashHistory } from 'vue-router'
import { isAdmin, getUserRole } from '@/utils/auth'
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
        path:'/bill_statistics',
        name:'bill_statistics',
        component: () => import('@/views/bill_statistics')
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
      },
      {
        path:'/admin/home_page',
        name:'admin/home_page',
        component: () => import('@/views/admin/home_page')
      },
      {
        path:'/admin/user_manager',
        name:'admin/user_manager',
        component: () => import('@/views/admin/user_manager')
      },
      {
        path:'/admin/task',
        name:'admin/task',
        component: () => import('@/views/admin/task')
      },
      {
        path:'/admin/timing_task',
        name:'admin/timing_task',
        component: () => import('@/views/admin/timing_task')
      },
      {
        path:'/admin/relative',
        name:'admin/relative',
        component: () => import('@/views/admin/relative')
      },
      {
        path:'/admin/colleague',
        name:'admin/colleague',
        component: () => import('@/views/admin/colleague')
      },
      {
        path:'/admin/image',
        name:'admin/image',
        component: () => import('@/views/admin/image')
      },
      {
        path:'/admin/classmate',
        name:'admin/classmate',
        component: () => import('@/views/admin/classmate')
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

router.beforeEach((to, from, next) => {
  const token = sessionStorage.getItem('token');
  const role = getUserRole();

  if (!token && to.path !== '/login' && to.path !== '/register') {
    // 未登录 → 跳登录
    next('/login');
  } else if (to.path.startsWith('/admin')) {
    // 访问 /admin 界面
    if (role === 'admin') {
      next();
    } else {
      // 普通用户不能进,跳普通首页
      next('/home_page');
    }
  } else if (!to.path.startsWith('/admin') && role === 'admin') {
    // 管理员访问普通界面,跳管理员首页
    next('/admin/home_page');
  } else {
    // 其他情况正常放行
    next();
  }
});

export default router
