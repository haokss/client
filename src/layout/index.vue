<template>
    <div class="common-layout">
      <el-container>
        <el-aside width="220px">
          <Menu></Menu>
        </el-aside>
        <el-container>

        <el-header>
          <Header></Header>
        </el-header>

        <el-main>
          <router-view></router-view>
        </el-main>
        
        </el-container>
      </el-container>
    </div>
</template>


<script setup>
import router from '@/router';
import Menu from './Menu'
import Header from './Header'
import { reactive,ref } from 'vue'
import { ElMessage } from 'element-plus'

</script>

<style>
.common-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  margin: 0 auto
}

.el-container {
  flex: 1;
}

.el-header {
  color: #fff;
  font-size: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.el-aside {
  background-color: #092d39;
  /* border-right: 1px solid #e4e4e4; */
}

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