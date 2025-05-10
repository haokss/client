<template>
  <el-card class="w-96 mx-auto mt-10 p-6 shadow-lg">
    <h2 class="text-xl font-bold mb-4 text-center">修改密码</h2>
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      status-icon
    >
      <el-form-item label="当前密码" prop="currentPassword">
        <el-input
          v-model="form.currentPassword"
          type="password"
          placeholder="请输入当前密码"
          show-password
        />
      </el-form-item>

      <el-form-item label="新密码" prop="newPassword">
        <el-input
          v-model="form.newPassword"
          type="password"
          placeholder="请输入新密码"
          show-password
        />
      </el-form-item>

      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input
          v-model="form.confirmPassword"
          type="password"
          placeholder="请再次输入新密码"
          show-password
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="submitForm">提交</el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';

const formRef = ref();

const form = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const rules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' },
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== form.newPassword) {
          callback(new Error('两次输入的密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur',
    },
  ],
};

const submitForm = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      // 这里发送修改密码请求
      console.log('提交数据:', form);
      // 假设成功
      ElMessage.success('密码修改成功');
      resetForm();
    } else {
      ElMessage.error('请检查输入是否正确');
      return false;
    }
  });
};

const resetForm = () => {
  formRef.value.resetFields();
};
</script>

<style scoped>
.w-96 {
  width: 24rem;
}
</style>
