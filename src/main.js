import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import store from './store'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@/router/permission'
import axios from "axios";

// axios.defaults.withCredentials = true; // 发送凭据
axios.defaults.xsrfCookieName = 'session:'; // 以‘session:’识别会话
axios.defaults.baseURL = '/api'

createApp(App).use(store).use(router).use(ElementPlus).mount('#app')
