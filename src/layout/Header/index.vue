<template>
  <div class="header-container">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item v-for="(item, index) in breadcrumbItems" :key="index">
        {{ item }}
      </el-breadcrumb-item>
    </el-breadcrumb>
    <div class="right-section">
      <el-badge :value="unreadCount" :max="99" class="item" :hidden="unreadCount === 0">
        <el-icon 
          :size="24" 
          color="#409EFF" 
          @click="handleBellClick" 
          style="cursor: pointer;"
        ><Bell /></el-icon>
      </el-badge>
    <el-menu
      :default-active="activeIndex"
      class="el-menu-demo"
      mode="horizontal"
      :ellipsis="false"
      @select="handleSelect"
    >

      <div class="flex-grow"></div> <!-- 弹性填充 -->
      <div class="welcome-text-container">
        <span v-if="baseList.data" style="color: rgb(0, 0, 0)">{{ baseList.data.user_name }}</span>
        <span v-else>加载中...</span>
      </div>
        <el-dropdown size="large">
          <div class="block"><el-avatar :size="45" :src="circleUrl" /></div>
          <template  #dropdown>                  
              <el-dropdown-item  @click="handleUser">个人中心</el-dropdown-item>
              <el-dropdown-item type="primary" @click="handleDes">退出</el-dropdown-item>
          </template>
        </el-dropdown>
    </el-menu>
    </div>
    <!-- 消息提示弹窗 -->
  <!-- 消息弹窗部分修改 -->
  <el-dialog v-model="dialogVisible" title="系统消息" width="600px">
    <div class="message-container">
      <div class="message-sidebar">
        <el-scrollbar height="400px">
          <el-menu 
            :default-active="selectedMessage?.id" 
            class="message-menu"
          >
            <el-menu-item
              v-for="(message, index) in messages"
              :key="message.id"
              :index="String(message.id)"
              @click="selectMessage(index)"
              :class="{ 'unread-message': !message.read }"
            >
              <div class="message-entry">
                <span class="message-time-tag">{{ message.time }}</span>
                <span class="message-title">{{ message.title }}</span>
              </div>
            </el-menu-item>
          </el-menu>
        </el-scrollbar>
      </div>

      <div class="message-detail" v-if="selectedMessage">
        <h3>{{ selectedMessage.title }}</h3>
        <p>{{ selectedMessage.content }}</p>
        <el-divider />
        <p class="message-time-detail">通知时间：{{ selectedMessage.time }}</p>
      </div>
      <div v-else class="empty-message">
        暂无选中消息
      </div>
    </div>

    <template #footer>
      <el-button type="primary" @click="markAllRead">一键已读</el-button>
      <el-button @click="dialogVisible = false">关闭</el-button>
    </template>
  </el-dialog>
  </div>
</template>

<script setup>
import router from '@/router';
import {user_Base} from '@/api/user_base'
import axios from 'axios'
import { reactive, ref, watch, onMounted, computed} from 'vue'
import { ElMessage, ElNotification } from 'element-plus'
import { useRoute } from 'vue-router'
import { Bell } from '@element-plus/icons-vue';

// 用户基本信息定义
const circleUrl = ref('https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg')
const baseList = ref([])

// //处理注销函数
const handleDes=()=>{
  sessionStorage.clear()
  ElMessage.success("退出成功！")
  router.replace('/login')
   .catch(error => ElMessage.error(`登录失败: ${error.message}`));
}
const handleUser=()=>{
  router.replace('/user')
   .catch(error => ElMessage.error(`${error.message}`));
}

const handleHome=()=>{
  router.replace('/')
   .catch(error => ElMessage.error(`${error.message}`));
}

// 获取用户基本信息
const fetchUserInfo = async () => {
  const token = sessionStorage.getItem('token');
  if (!token) {
    ElMessage.error('用户未登录!');
    return;
  }
  
  try {
    const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/api/v1/user_info`, {
      headers: {
        'Authorization': `${token}`
      }
    });
    if (response.data) {
      baseList.value = response.data;
      circleUrl.value = response.data.data.ava_url;
      // localStorage.setItem('avatar', circleUrl.value);
    } else {
      ElMessage.error('获取用户信息失败');
    }
  } catch (error) {
    ElMessage.error(`获取用户信息失败: ${error.message}`);
  }
};

// 用户基本信息
const initBaseList = async () => {
    await fetchUserInfo();
};

initBaseList()

// ------------------------------------动态面包屑路由，获取当前路由信息
const route = useRoute()
const breadcrumbItems = ref([])

// 根据路由路径更新面包屑
const updateBreadcrumb = () => {
  const path = route.path.split('/').filter(Boolean)
  breadcrumbItems.value = path.map(p => {
    // 将路径中的每一部分转化为首字母大写并显示
    return p.charAt(0).toUpperCase() + p.slice(1)
  })
}

onMounted(() => {
  updateBreadcrumb()
})

// 监听路由变化，动态更新面包屑
watch(route, updateBreadcrumb)


const handleBellClick = () => {
  dialogVisible.value = true;
  fetchNotifications()
};

// -------------------------------获取当前通知
const fetchNotifications = async () => {
  const token = sessionStorage.getItem('token');
  try {
    const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/api/v1/notifications`, {
      headers: {
        Authorization: token
      }
    });
    if (response.data.code === 200 && Array.isArray(response.data.data)) {
      // 格式化后端返回的数据合并进消息列表
      const fetchedMessages = response.data.data.map(n => {
        let parsedData = {};
        try {
          parsedData = JSON.parse(n.data);
        } catch (e) {
          parsedData = { title: '无标题', content: '无内容' };
        }

        return {
          id: n.id,
          title: parsedData.title || '无标题',
          content: parsedData.content || '无内容',
          time: n.created_at 
            ? new Date(n.created_at * 1000).toLocaleString()  // 时间戳为秒，需乘1000
            : new Date().toLocaleString(),
          read: n.is_read
        };
      });

      // 避免重复加载（如刷新后新增的消息可能已存在于 SSE 中）
      const existingIds = new Set(messages.value.map(m => m.id));
      const newMessages = fetchedMessages.filter(m => !existingIds.has(m.id));

      messages.value = [...newMessages, ...messages.value];
    } else {
      ElMessage.error("获取通知失败");
    }
  } catch (error) {
    ElMessage.error("加载通知失败: " + error.message);
  }
};

// -------------------------------SSE机制获取消息通知和消息弹窗处理
const token = sessionStorage.getItem('token'); 
const dialogVisible = ref(false);
const messages = ref([]); 
const selectedMessage = ref(null);

// 添加消息到列表并触发通知
const addMessage = (messageData) => {
  const newMessage = {
    id: messageData.id || Date.now(), // 优先使用真实 ID
    title: messageData.title || '新通知',
    content: messageData.content || '您有新的消息',
    time: messageData.time || new Date().toLocaleString(),
    read: false
  };

  // 去重：如果已有相同 id，则不添加
  if (messages.value.some(msg => msg.id === newMessage.id)) return;

  messages.value.unshift(newMessage);
  selectedMessage.value = newMessage;

  if (!document.hidden) {
    ElNotification({
      title: newMessage.title,
      message: newMessage.content,
      type: 'info',
      duration: 5000
    });
  }
};

// ---------------------------------------------------------SSE消息处理统一修改
const handleSSEMessage = (e, eventType = 'message') => {
  try {
    const data = JSON.parse(e.data);
    addMessage({
      id: data.id, // 由后端推送的真实 ID
      title: data.title,
      content: data.content,
      time: data.timestamp ? new Date(data.timestamp).toLocaleString() : null
    });
  } catch (err) {
    console.error("JSON解析失败:", e.data);
  }
};

// 初始化EventSource
const initSSE = () => {
  const token = sessionStorage.getItem('token');
  if (!token) return;

  const eventSource = new EventSource(`${process.env.VUE_APP_API_BASE_URL}/api/v1/push/notifications?token=${token}`);

  // 通用消息处理
  eventSource.onmessage = (e) => handleSSEMessage(e);

  // 特定事件处理
  const handleSpecificEvent = (e) => handleSSEMessage(e, e.type);
  ['instant_notification', 'new_year_notification'].forEach(eventName => {
    eventSource.addEventListener(eventName, handleSpecificEvent);
  });

  // 心跳处理
  eventSource.addEventListener('ping', () => {
    console.log("SSE连接保持活跃");
  });

  // 错误处理
  eventSource.onerror = (e) => {
    console.error("SSE连接错误:", e);
    ElNotification({
      title: '连接错误',
      message: '与服务器的连接已断开，请刷新页面重试。',
      type: 'error',
      duration: 5000,
    });
    eventSource.close();
  };

  return eventSource;
};

// 初始化SSE连接
let eventSource = null;
onMounted(() => {
  eventSource = initSSE();
});


// -------------------------------------------计算未读数量
const unreadCount = computed(() => {
  return messages.value.filter(msg => !msg.read).length;
});

// -------------------------------------------标记所有已读
const markAllRead = async () => {
  try {
    await axios.post(`${process.env.VUE_APP_API_BASE_URL}/api/v1/notifications/read_all`, {}, {
      headers: {
        Authorization: sessionStorage.getItem('token')
      }
    });

    messages.value = messages.value.map(msg => ({
      ...msg,
      read: true
    }));
    ElMessage.success("已标记所有消息为已读");
  } catch (err) {
    ElMessage.error("一键已读失败: " + err.message);
  }
};


// -----------------------------------------选中消息处理
const selectMessage = async (index) => {
  const selected = messages.value[index];
  selectedMessage.value = selected;

  if (!selected.read) {
    messages.value[index].read = true;

    // 发请求标记已读
    try {
      await axios.post(`${process.env.VUE_APP_API_BASE_URL}/api/v1/notification/read/${selected.id}`, {}, {
        headers: {
          Authorization: sessionStorage.getItem('token')
        }
      });
    } catch (err) {
      ElMessage.error("标记已读失败: " + err.message);
    }
  }
};


</script>

<style>

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  width: 100%;
  box-sizing: border-box;
}

.el-breadcrumb {
  display: flex;
  justify-content: flex-start;
}

.flex-grow {
  flex-grow: 1;
  flex: 1;
}

.el-menu{
  align-items: center;
}

.message-container {
  display: flex;
  gap: 16px;
}
.message-sidebar {
  width: 40%;
  border-right: 1px solid #eee;
}
.message-menu {
  width: 100%;
}
.message-time {
  float: right;
  font-size: 12px;
}
.message-detail {
  flex: 1;
  padding: 10px;
}
.message-time-detail {
  color: gray;
  font-size: 12px;
}

.right-section {
  display: flex;
  align-items: center;
  gap: 20px; /* 调整 Bell 图标和菜单的间距 */
}


/* 添加未读消息样式 */
.unread-message {
  background-color: #f5f7fa;
  font-weight: 500;
}

.empty-message {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #909399;
}

.message-entry {
  display: flex;
  flex-direction: column;
  line-height: 1.4;
}

.message-time-tag {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.message-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.unread-message .message-title {
  font-weight: bold;
  color: #409EFF; /* 蓝色高亮未读 */
}

</style>