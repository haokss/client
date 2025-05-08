<template>
    <el-menu
        active-text-color="#ffd04b"
        background-color="#545c64"
        class="el-menu-vertical-demo"
        default-active="2"
        text-color="#fff"
        router
      >
          <template #title>
            <el-icon><location /></el-icon>
            <span>用户界面</span>
            
          </template> 
            <el-menu-item index="/">首页</el-menu-item>
            <el-sub-menu index="1-1">
              <template #title>任务管理</template>
            <el-menu-item index="task">计划活动</el-menu-item>
            <el-menu-item index="timing_task">定时活动</el-menu-item>
            <el-menu-item index="task_statistics">活动统计</el-menu-item>
            </el-sub-menu>
            <el-sub-menu index="2-1">
              <template #title>关系管理</template>
              <el-menu-item index="relative">亲属管理</el-menu-item>
              <el-menu-item index="colleague">同事管理</el-menu-item>
              <el-menu-item index="friend">朋友管理</el-menu-item>
              <el-menu-item index="classmate">同学管理</el-menu-item>
            </el-sub-menu>
            <el-sub-menu index="3-1">
              <template #title>账单管理</template>
              <el-menu-item index="bill">账单信息</el-menu-item>
              <el-menu-item index="colleague">账单报表</el-menu-item>
            </el-sub-menu>
            <el-sub-menu index="4-1">
              <template #title>文件管理</template>
              <el-menu-item index="image">图片管理</el-menu-item>
              <el-menu-item index="video">视频管理</el-menu-item>
            </el-sub-menu>
            <!-- <el-menu-item index="">日记</el-menu-item> -->
            <!-- <el-menu-item index="">文件管理</el-menu-item> -->
            <!-- <el-menu-item index="">账号管理</el-menu-item> -->
            <el-menu-item index="map_view">地图</el-menu-item>       
          <!-- <el-sub-menu index="1-4">
            <template #title>item four</template>
            <el-menu-item index="1-4-1">item one</el-menu-item>
          </el-sub-menu> -->

        <el-menu-item index="setting">
          <!-- <el-icon><setting /></el-icon> -->
          <span>设置</span>
        </el-menu-item>
      </el-menu>
</template>

<script>
// import { Location, Setting } from '@element-plus/icons-vue'

</script>