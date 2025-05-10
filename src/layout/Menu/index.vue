<template>
  <el-menu
    active-text-color="#ffd04b"
    background-color="#545c64"
    class="el-menu-vertical-demo"
    default-active="2"
    text-color="#fff"
    router
  >
    <!-- 普通用户菜单 -->
    <template v-if="!isAdmin">
      <!-- 首页 -->
      <el-menu-item index="/">首页</el-menu-item>

      <!-- 活动 -->
      <el-sub-menu index="1-1">
        <template #title>活动</template>
        <el-menu-item index="task">计划活动</el-menu-item>
        <el-menu-item index="timing_task">智能提醒</el-menu-item>
        <el-menu-item index="task_statistics">活动统计</el-menu-item>
      </el-sub-menu>

      <!-- 关系 -->
      <el-sub-menu index="2-1">
        <template #title>关系</template>
        <el-menu-item index="relative">亲属信息</el-menu-item>
        <el-menu-item index="colleague">同事信息</el-menu-item>
        <el-menu-item index="friend">朋友信息</el-menu-item>
        <el-menu-item index="classmate">同学信息</el-menu-item>
        <el-menu-item index="map_view">关系地图</el-menu-item>       
      </el-sub-menu>

      <!-- 账单 -->
      <el-sub-menu index="3-1">
        <template #title>账单</template>
        <el-menu-item index="bill">账单信息</el-menu-item>
        <el-menu-item index="bill_statistics">账单报表</el-menu-item>
      </el-sub-menu>

      <!-- 文件 -->
      <el-sub-menu index="4-1">
        <template #title>文件</template>
        <el-menu-item index="image">重要时刻</el-menu-item>
      </el-sub-menu>

      <!-- 设置 -->
      <el-menu-item index="setting">
        <span>设置</span>
      </el-menu-item>
    </template>

    <!-- 管理员专用菜单项 -->
    <template v-if="isAdmin">
      <el-menu-item index="home_page">首页</el-menu-item>
      <!-- <el-sub-menu index="admin-1"> -->
        <!-- <template #title>用户管理</template> -->
        <el-menu-item index="user_manager">用户管理</el-menu-item>
      <!-- </el-sub-menu> -->
      <!-- 活动管理 -->
      <el-sub-menu index="admin-2">
        <template #title>活动管理</template>
        <el-menu-item index="task">计划活动管理</el-menu-item>
        <el-menu-item index="timing_task">智能提醒管理</el-menu-item>
      </el-sub-menu>
      <!-- <el-sub-menu index="admin-3">
        <template #title>关系管理</template>
        <el-menu-item index="relative">亲属信息管理</el-menu-item>
        <el-menu-item index="colleague">同事信息管理</el-menu-item>
        <el-menu-item index="friend">朋友信息管理</el-menu-item>
        <el-menu-item index="classmate">同学信息管理</el-menu-item>
      </el-sub-menu> -->
      <el-sub-menu index="admin-4">
        <template #title>文件管理</template>
        <el-menu-item index="image">重要时刻管理</el-menu-item>
      </el-sub-menu>
      <el-menu-item index="user_manager">通知发布</el-menu-item>
      <el-menu-item index="setting">设置</el-menu-item>

    </template>

  </el-menu>
</template>

<script setup>
// 导入必要的工具
import { ref } from 'vue';
import { getUserRole } from '@/utils/auth';  // 获取用户角色

// 判断当前用户是否为管理员
const isAdmin = ref(getUserRole() === 'admin');
</script>

<style scoped>

</style>
