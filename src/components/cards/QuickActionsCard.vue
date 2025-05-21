<template>
  <el-card class="quick-actions-card">
    <template #header>
      <div class="quick-actions-header">
        <span>快捷入口</span>
      </div>
    </template>
    <div class="quick-actions-grid">
      <div
        v-for="(action, index) in quickActions"
        :key="index"
        class="action-item"
        @click="handleActionClick(action)"
      >
        <div class="action-icon">
          <i :class="action.icon" :style="{ color: action.color }"></i>
        </div>
        <div class="action-text">{{ action.text }}</div>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const quickActions = ref([
  { text: '邮件', icon: 'el-icon-message', color: '#409EFF' },
  { text: '通讯录', icon: 'el-icon-user', color: '#67C23A' },
  { text: '日程', icon: 'el-icon-date', color: '#E6A23C' },
  { text: '文件', icon: 'el-icon-folder', color: '#F56C6C' },
  { text: '设置', icon: 'el-icon-setting', color: '#909399' },
  { text: '帮助', icon: 'el-icon-question', color: '#409EFF' }
])

const handleActionClick = (action) => {
  ElMessage.success(`点击了: ${action.text}`)
}
</script>

<style scoped>
/* 复制你原来 .quick-actions-* 和 .action-* 的 CSS 到这里 */
</style>
