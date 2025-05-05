import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import store from './store'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import '@/router/permission'
import axios from "axios";
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/dist/index.css';

// axios.defaults.withCredentials = true; // 发送凭据
axios.defaults.xsrfCookieName = 'session:'; // 以‘session:’识别会话
axios.defaults.baseURL = '/api'

const app = createApp(App);

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

createApp(App).
    use(store).
    use(router).
    use(ElementPlus, {
    locale: zhCn,
    }).
    mount('#app')
