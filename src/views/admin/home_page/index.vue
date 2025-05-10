<template>
  <div>
      <div class="block text-center">
          <el-carousel height="240px">
          <el-carousel-item v-for="item in carouseData" :key="item">
              <img :src="item.url" alt=""/>
          </el-carousel-item>
          </el-carousel>
      </div>
  </div>

</template>



<script setup>
import { ref } from 'vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
const value = ref(new Date())
const carouseData = [
  {url: require("@/assets/001.jpg")},
  {url: require("@/assets/002.jpg")},
  {url: require("@/assets/003.jpg")},
  {url: require("@/assets/004.jpg")},
]
</script>

<style scoped>
.is-selected {
  color: #1989fa;
}

.demonstration {
  color: var(--el-text-color-secondary);
}

.el-carousel__item h3 {
  color: #475669;
  opacity: 0.75;
  line-height: 150px;
  margin: 0;
  text-align: center;
}

.el-carousel__item:nth-child(2n) {
  background-color: #99a9bf;
}

.el-carousel__item:nth-child(2n + 1) {
  background-color: #d3dce6;
}
</style>