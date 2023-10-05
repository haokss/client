<template>
    <div> 
      <div class="manage-header">
      <el-button @click="handleNewCar">新增小车</el-button>

      </div>
      <el-table 
        :data="tableData" 
        highlight-current-row
        style="width: 100%"
        height="300"
        @current-change="handleCurrentChange">
        <el-table-column label="日期" width="180">
          <template #default="scope">
            <div style="display: flex; align-items: center">
            <el-icon><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" data-v-394d1fd8=""><path fill="currentColor" d="M160 448a32 32 0 0 1-32-32V160.064a32 32 0 0 1 32-32h256a32 32 0 0 1 32 32V416a32 32 0 0 1-32 32H160zm448 0a32 32 0 0 1-32-32V160.064a32 32 0 0 1 32-32h255.936a32 32 0 0 1 32 32V416a32 32 0 0 1-32 32H608zM160 896a32 32 0 0 1-32-32V608a32 32 0 0 1 32-32h256a32 32 0 0 1 32 32v256a32 32 0 0 1-32 32H160zm448 0a32 32 0 0 1-32-32V608a32 32 0 0 1 32-32h255.936a32 32 0 0 1 32 32v256a32 32 0 0 1-32 32H608z"></path></svg></el-icon>
              <span style="margin-left: 10px">{{ scope.row.data_id }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="小车名" width="180">
          <template #default="scope">
            <el-popover effect="light" trigger="hover" placement="top" width="auto">
              <template #default>
                <div>name: {{ scope.row.car_name }}</div>
                <div>ip_address: {{ scope.row.car_ipaddress }}</div>
                <div>port: {{ scope.row.car_port }}</div>
              </template>
              <template #reference>
                <el-tag>{{ scope.row.car_name }}</el-tag>
              </template>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column label="序列号" width="230">
          <template #default="scope">
            <div style="display: flex; align-items: center">
              <span>{{ scope.row.car_serial}}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="ip地址" width="230">
          <template #default="scope">
            <div style="display: flex; align-items: center">
              <span>{{ scope.row.car_ipaddress}}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="端口号" width="200">
          <template #default="scope">
            <div style="display: flex; align-items: center">
              <span>{{ scope.row.car_port }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="可执行操作">
          <template #default="scope">
            <el-button size="small" type="primary" v-loading.fullscreen.lock="fullscreenLoading"
            element-loading-text="连接中..." @click="handleConnect(scope.$index, scope.row)"
              >启动小车</el-button
            >
            <el-button size="small" type="primary" @click="handleDisConnect(scope.$index, scope.row)"
              >停止小车</el-button
            >
            <el-button size="small" type="warning" @click="handleEdit(scope.$index, scope.row)"
              >编辑</el-button
            >
            <el-button
              size="small"
              type="danger"
              @click="handleDelete(scope.$index, scope.row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      
      <!-- <el-divider content-position="left">创建小车与web连接</el-divider>
      <el-button   
        v-loading.fullscreen.lock="fullscreenLoading"
        element-loading-text="连接中..."
        type="primary" 
        @click="handleConnect">创建并连接小车</el-button>
        <el-button type="primary"  @click="handleDisConnect">断开小车连接</el-button>
      -->

      <el-divider content-position="left">检测系统</el-divider>
      <el-button @click="start_video">开始检测</el-button>
      <el-button @click="stop_video">停止检测</el-button>
      <el-button @click="is_detected">检测概率大于80%图片</el-button>
      <div class="demo-image__placeholder">
        <div class="block">
          <span class="demonstration">Default</span>
          <img id="video-player" src="" alt="Video Stream"/>
        </div>
        <div class="block">
          <el-image :src="state.detectSrc">
            <template #placeholder>
              <div class="image-slot">Loading<span class="dot">...</span></div>
            </template>
          </el-image>
        </div>
      </div>
      <!-- <el-divider content-position="left">获取检测图片</el-divider> -->
    </div>

    <el-divider content-position="left">控制小车</el-divider>
          <el-button @click="forwardButton">向前移动</el-button>
          <el-button @click="backwardButton">向后移动</el-button>
          <el-button @click="leftButton">向左移动</el-button>
          <el-button @click="rightButton">向右移动</el-button>
          <el-button @click="stopButton">停止移动</el-button>

    
    <el-dialog
        v-model="dialogVisibleNew"
        title="新建小车资料"
        width="30%"
        :before-close="handleClose"
      >
        <h1>id:{{ formCar.id }}</h1>
        名称
        <el-input v-model="formCar.car_name" placeholder="小车名称" />
        序列号
        <el-input v-model="formCar.car_serial" placeholder="序列号" />
        ip地址
        <el-input v-model="formCar.car_ipaddress" placeholder="ip地址" />
        ws端口号
        <el-input v-model="formCar.car_port" placeholder="ws端口号" />
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisibleNew = false">取消</el-button>
            <el-button type="primary" @click="handlePostNewCar">
              提交
            </el-button>
          </span>
        </template>
      </el-dialog>

      <el-dialog
        v-model="dialogVisible"
        title="编辑小车资料"
        width="30%"
        :before-close="handleClose"
      >
        名称
        <el-input v-model="table_row.car_name" placeholder="小车名称" />
        序列号
        <el-input v-model="table_row.car_serial" placeholder="序列号" />
        ip地址
        <el-input v-model="table_row.car_ipaddress" placeholder="ip地址" />
        ws端口号
        <el-input v-model="table_row.car_port" placeholder="ws端口号" />
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="handlePostEdit">
              提交
            </el-button>
          </span>
        </template>
      </el-dialog>

</template>
<script setup>
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'
import { reactive,ref } from 'vue'
// 设置初始变量
const dialogVisible = ref(false)
const dialogVisibleNew = ref(false)
const fullscreenLoading = ref(false)
const now_click_line = ref()
const tableData= ref()
const table_row = ref()

// 新建小车按钮
const handleNewCar = () => {
  dialogVisibleNew.value = true
};

// 解析获取用户的id
const user_info_json = sessionStorage.getItem('user_base_info') || '{}'; // 如果没有找到'user_info'，则默认为空对象
const user_info_obj = JSON.parse(user_info_json); // 将JSON字符串解析为JavaScript对象
const user_id = user_info_obj.id; // 获取用户ID

// 获取已有小车信息
axios.get(`http://localhost:8080/api/user_cars/${user_id}`)
    .then(response => {
      const { data, headers } = response;
      if (data.code === 200) {
        tableData.value = data.cars
      } else {
        ElMessage.error(data.msg)
      }
    })
    .catch(error => console.error(`登录失败: ${error.message}`));

// 处理新建小车请求
const handlePostNewCar = () => {
  axios.post('http://localhost:8080/api/new_car', formCar.value)
    .then(response => {
      const { data, headers } = response;
      if (data.code === 200) {
        ElMessage.success(data.msg) 
        dialogVisibleNew.value = false
      } else {
        ElMessage.error(data.msg)
      }
    })
    .catch(error => console.error(`新建失败: ${error.message}`));
};

const handleEdit = (index, row) => {
    dialogVisible.value = true
    table_row.value = row
}

// 重新编辑小车信息
const handlePostEdit = (index, row) => {
  axios.post('http://localhost:8080/api/edit_car', table_row.value)
    .then(response => {
      const { data, headers } = response;
      if (data.code === 200) {
        ElMessage.success(data.msg) 
        dialogVisible.value = false
      } else {
        ElMessage.error(data.msg)
      }
    })
    .catch(error => console.error(`编辑失败: ${error.message}`));
};
// 删除小车信息
const handleDelete = (index, row) => {
  console.log(index, row)
  axios.delete(`http://localhost:8080/api/cars/delete_car/${row.data_id}`)
    .then(response => {
      const { data, headers } = response;
      if (data.code === 200) {
        ElMessage.success(data.msg) 
      } else {
        ElMessage.error(data.msg)
      }
    })
    .catch(error => console.error(`删除失败: ${error.message}`));
}

const formCar =ref({
    id:`${user_id}`,
    car_name: 'Tom',
    car_serial: 'safdasdfaa.056',
    car_ipaddress: '192.168.137.9',
    car_port:8081
})

const state = reactive({
  detectSrc: null, // 检测后的图片的 URL
})


const is_detected=()=>{
  axios.get('http://localhost:8080/api/user/video/image')
        .then(response => {
        const { data, headers } = response;
        if (data.code === 200) {
          const imgData = data.image_data
          const imgUrl = `data:image/png;base64,${imgData}`
          state.detectSrc = imgUrl
          ElMessage.success(data.msg)
        } else {
            ElMessage.error(data.msg)
        }
        })
        .catch(error => console.error(`登录失败: ${error.message}`))
}

let socket; //定义全局socket
let videoSource = null; // 用于存储视频数据的URL
// 建立小车和web端的websoket连接
const handleConnect = (index, row) => {
    // JavaScript代码
    console.log(index, row)
    socket = new WebSocket(`ws://${row.car_ipaddress}:${row.car_port}`);
    console.log("start socket:", socket)
    fullscreenLoading.value = true
    let connected = false; // 用于标记WebSocket是否连接成功
    const connectTimer = setTimeout(() => {
      if (!connected) {
        fullscreenLoading.value = false
        ElMessage.warning('WebSocket连接失败，请检查小车是否启动及IP和端口是否正确！');
        console.log("socket:", socket)
        // socket.close(); // 关闭WebSocket连接
      }
    }, 1000); // 设置5秒的连接超时时间

    socket.addEventListener('open', () => {
      fullscreenLoading.value = false
      connected = true
      clearTimeout(connectTimer)
      ElMessage.success('WebSocket连接成功！');
    });

    socket.addEventListener('message', event => {
    console.log('Received message from server:', event.data);
    });
  }
    // ElMessage.warning("尚未选中小车！")

// 当用户点击按钮断开连接时
const handleDisConnect= () => {
  if (socket) {
    socket.close(); // 关闭WebSocket连接
    socket = null; // 将socket设置为null表示连接已断开
    ElMessage.success('WebSocket连接已断开！');
  } else {
    ElMessage.warning('WebSocket连接尚未建立！');
  }
};

// 当用户点击按钮控制向前移动时
const forwardButton =()=>{
  if (socket && socket.readyState === WebSocket.OPEN) {
    const controlCommand = 'up'; // 控制指令：向前移动
    socket.send(controlCommand);
  }else {
    ElMessage.warning('WebSocket连接未建立或已断开，请先建立连接！');
  }
};

// 当用户点击按钮控制向后移动时
const backwardButton = () => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    const controlCommand = 'down'; // 控制指令：向前移动
    socket.send(controlCommand);
  }else {
    ElMessage.warning('WebSocket连接未建立或已断开，请先建立连接！');
  }
};

const leftButton = () => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    const controlCommand = 'left'; // 控制指令：向前移动
    socket.send(controlCommand);
  }else {
    ElMessage.warning('WebSocket连接未建立或已断开，请先建立连接！');
  }
};
const rightButton = () => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    const controlCommand = 'right'; // 控制指令：向前移动
    socket.send(controlCommand);
  }else {
    ElMessage.warning('WebSocket连接未建立或已断开，请先建立连接！');
  }
};
const stopButton = () => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    const controlCommand = 'stop'; // 控制指令：向后移动
    socket.send(controlCommand);
  }else {
    ElMessage.warning('WebSocket连接未建立或已断开，请先建立连接！');
  }
};
let videoUpdateInterval
const start_video =()=>{
  if (socket && socket.readyState === WebSocket.OPEN) {
    const controlCommand = 'start_video'; // 控制指令:开始录像
    socket.send(controlCommand);
    // 实时更新<img>标签的src属性显示视频流
    videoUpdateInterval = setInterval(() => {
      const imgElement = document.getElementById('video-player');
      imgElement.src = 'http://localhost:8080/api/user/video?' + Date.now(); // 加上Date.now()以防止浏览器缓存
    }, 1000); // 每隔1秒更新一次视频流
  }else {
    ElMessage.warning('WebSocket连接未建立或已断开，请先建立连接！');
  }
};

const stop_video =()=>{
  if (socket && socket.readyState === WebSocket.OPEN) {
    const controlCommand = 'stop_video'; // 控制指令：向前移动
    socket.send(controlCommand);
    clearInterval(videoUpdateInterval)
  }else {
    ElMessage.warning('WebSocket连接未建立或已断开，请先建立连接！');
  }
};

</script>


<style>

.el-main {
  background-color: #f2f2f2;
  padding: 20px;
}
.demo-image__placeholder .block {
  padding: 30px 0;
  text-align: center;
  border-right: solid 1px var(--el-border-color);
  display: inline-block;
  width: 49%;
  box-sizing: border-box;
  vertical-align: top;
}
.demo-image__placeholder .demonstration {
  display: block;
  color: var(--el-text-color-secondary);
  font-size: 14px;
  margin-bottom: 20px;
}
.demo-image__placeholder .el-image {
  padding: 0 5px;
  max-width: 300px;
  max-height: 200px;
}

.demo-image__placeholder.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
  font-size: 14px;
}
.demo-image__placeholder .dot {
  animation: dot 2s infinite steps(3, start);
  overflow: hidden;
}
</style>