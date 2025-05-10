<template>
  <div>
    <!-- 上传区域 -->
    <el-row class="mb-4" type="flex" justify="start">
      <el-col :span="3">
        <el-upload
          :before-upload="beforeUploadWeChat"
          :http-request="customRequest"
          :show-file-list="false"
        >
          <el-button type="success">上传微信账单</el-button>
        </el-upload>
      </el-col>
      <el-col :span="3">
        <el-upload
          :before-upload="beforeUploadAliPay"
          :http-request="customRequest"
          :show-file-list="false"
        >
          <el-button type="primary">上传支付宝账单</el-button>
        </el-upload>
      </el-col>
    </el-row>

    <!-- 搜索区域 -->
    <el-row class="mb-4" type="flex" justify="start">
      <el-col :span="6">
        <el-input v-model="searchParams.keyword" placeholder="按交易对方或备注检索" clearable />
      </el-col>
      <el-col :span="6">
        <el-select v-model="searchParams.transactionType" placeholder="交易类型" clearable>
          <el-option label="收入" value="收入" />
          <el-option label="支出" value="支出" />
        </el-select>
      </el-col>
      <el-col :span="6">
        <el-date-picker
          v-model="searchParams.dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 100%"
        />
      </el-col>
      <el-col :span="6">
        <el-button @click="fetchBillList" type="primary">搜索</el-button>
      </el-col>
    </el-row>

    <el-row class="mb-4" type="flex" justify="start">
      <el-col :span="6">
        <el-input-number
          v-model="searchParams.minAmount"
          placeholder="最小金额"
          :min="0"
          style="width: 100%"
        />
      </el-col>
      <el-col :span="6">
        <el-input-number
          v-model="searchParams.maxAmount"
          placeholder="最大金额"
          :min="0"
          style="width: 100%"
        />
      </el-col>
      <el-col :span="6">
        <el-button @click="resetSearch" type="info">重置</el-button>
      </el-col>
    </el-row>

    <!-- 表格 -->
    <el-table :data="tableData" style="width: 100%">
      <el-table-column label="交易时间" prop="transactionTime" />
      <el-table-column label="交易类型" prop="transactionType" />
      <el-table-column label="交易对方" prop="counterparty" />
      <el-table-column label="商品" prop="product" />
      <el-table-column label="收/支" prop="incomeExpense" />
      <el-table-column label="金额(元)" prop="amount" />
      <el-table-column label="支付方式" prop="paymentMethod" />
      <el-table-column label="当前状态" prop="status" />
      <el-table-column label="交易单号" prop="transactionId" />
      <el-table-column label="商户单号" prop="merchantId" />
      <el-table-column label="备注" prop="remarks" />
    </el-table>

    <!-- 分页 -->
    <el-pagination
      class="mt-4"
      :current-page="currentPage"
      :page-size="pageSize"
      :total="total"
      layout="total, prev, pager, next"
      @current-change="handlePageChange"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { ElMessage } from 'element-plus';

// 上传限制
const beforeUploadWeChat = (file) => {
  const isExcel = file.type.includes('sheet') || file.name.endsWith('.xlsx');
  if (!isExcel) {
    ElMessage.error('只能上传 Excel 文件');
    return false;
  }
  return true;
};

const beforeUploadAliPay = (file) => {
  const isExcel = file.type.includes('sheet') || file.name.endsWith('.csv');
  if (!isExcel) {
    ElMessage.error('只能上传 CSV 文件');
    return false;
  }
  return true;
};

// 上传后处理
const customRequest = async (options) => {
  const formData = new FormData();
  formData.append('file', options.file);
  formData.append('type', options.file.name.includes('微信') ? 'wechat' : 'alipay');
  const token = sessionStorage.getItem('token');
  if (!token) {
    ElMessage.error('用户未登录!');
    return;
  }
  try {
    const res = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/api/v1/import-bill`, formData, {
      headers: {
        Authorization: token,
      },
    });
    ElMessage.success(res.data.message || '上传成功');
    fetchBillList();
  } catch (error) {
    ElMessage.error(error?.response?.data?.message || '上传失败');
  }
};

// 表格数据 & 状态
const tableData = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 搜索参数
const searchParams = ref({
  keyword: '',
  transactionType: '',
  dateRange: [],
  minAmount: null,
  maxAmount: null,
});

const formatItem = (item) => ({
  transactionTime: item.TransactionTime,
  transactionType: item.TransactionType,
  counterparty: item.Counterparty,
  product: item.Product,
  incomeExpense: item.IncomeExpense,
  amount: item.Amount,
  paymentMethod: item.PaymentMethod,
  status: item.Status,
  transactionId: item.TransactionID,
  merchantId: item.MerchantID,
  remarks: item.Remarks,
});

// 获取账单数据
const fetchBillList = async () => {
  const token = sessionStorage.getItem('token');
  if (!token) {
    ElMessage.error('用户未登录!');
    return;
  }
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchParams.value.keyword,
      transactionType: searchParams.value.transactionType,
      startDate: searchParams.value.dateRange?.[0] || '',
      endDate: searchParams.value.dateRange?.[1] || '',
      minAmount: searchParams.value.minAmount,
      maxAmount: searchParams.value.maxAmount,
    };

    const res = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/api/v1/bills`, {
      headers: { Authorization: token },
      params,
    });

    if (res.data.code === 200) {
      tableData.value = res.data.data.list.map(formatItem);;
      total.value = res.data.data.total;
    } else {
      ElMessage.error(res.data.msg || '获取失败');
    }
  } catch (error) {
    ElMessage.error('获取账单失败');
  }
};

// 翻页处理
const handlePageChange = (page) => {
  currentPage.value = page;
  fetchBillList();
};

// 重置搜索
const resetSearch = () => {
  searchParams.value = {
    keyword: '',
    transactionType: '',
    dateRange: [],
    minAmount: null,
    maxAmount: null,
  };
  currentPage.value = 1;
  fetchBillList();
};

// 初始化加载
onMounted(() => {
  fetchBillList();
});
</script>

<style scoped>
.el-row {
  margin-bottom: 10px;
}
</style>
