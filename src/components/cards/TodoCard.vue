<template>
  <el-card class="todo-card">
    <template #header>
      <div class="todo-header">
        <span>待办事项</span>
        <el-button type="text" @click="addTodo">添加</el-button>
      </div>
    </template>
    <el-input
      v-model="newTodo"
      placeholder="输入新任务"
      @keyup.enter="addTodo"
      class="todo-input"
    >
      <template #append>
        <el-button icon="el-icon-plus" @click="addTodo"></el-button>
      </template>
    </el-input>
    <el-divider></el-divider>
    <div class="todo-list">
      <el-checkbox-group v-model="checkedTodos">
        <div class="todo-item" v-for="(todo, index) in todos" :key="index">
          <el-checkbox :label="index" class="todo-checkbox">
            <span :class="{ 'todo-completed': todo.completed }">{{ todo.text }}</span>
          </el-checkbox>
          <el-button
            type="text"
            icon="el-icon-delete"
            @click="removeTodo(index)"
            class="todo-delete"
          />
        </div>
      </el-checkbox-group>
    </div>
  </el-card>
</template>

<script setup>
import { ref } from 'vue'

const newTodo = ref('')
const checkedTodos = ref([])
const todos = ref([
  { text: '完成项目报告', completed: false },
  { text: '参加团队会议', completed: false },
  { text: '回复客户邮件', completed: true },
  { text: '更新项目文档', completed: false }
])

const addTodo = () => {
  if (newTodo.value.trim()) {
    todos.value.push({ text: newTodo.value.trim(), completed: false })
    newTodo.value = ''
  }
}

const removeTodo = (index) => {
  todos.value.splice(index, 1)
}
</script>

<style scoped>
/* 复制你原来 .todo-* 的 CSS 到这里 */
</style>
