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
            <el-menu-item index="img">图片推断</el-menu-item>
            <el-menu-item index="connect">连接小车</el-menu-item>
            <el-menu-item index="other">其它</el-menu-item>

          <!-- <el-sub-menu index="1-4">
            <template #title>item four</template>
            <el-menu-item index="1-4-1">item one</el-menu-item>
          </el-sub-menu> -->

        <el-menu-item index="about">
          <el-icon><setting /></el-icon>
          <span>关于</span>
        </el-menu-item>
      </el-menu>
</template>

<script>



</script>