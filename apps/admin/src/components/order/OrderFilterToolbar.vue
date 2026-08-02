<template>
  <section class="toolbar">

    <input
      v-model="localKeyword"
      class="search"
      type="text"
      placeholder="搜尋訂單編號 / 會員 / 手機"
      @keyup.enter="emitSearch"
    />

    <select
      v-model="localOrderStatus"
      class="select"
      @change="emitFilter"
    >
      <option value="">全部訂單狀態</option>
      <option value="pending_payment">待付款</option>
      <option value="paid">已付款</option>
      <option value="processing">處理中</option>
      <option value="shipped">已出貨</option>
      <option value="completed">已完成</option>
      <option value="cancelled">已取消</option>
      <option value="refunded">已退款</option>
    </select>

    <select
      v-model="localPaymentStatus"
      class="select"
      @change="emitFilter"
    >
      <option value="">全部付款狀態</option>
      <option value="unpaid">未付款</option>
      <option value="paid">已付款</option>
      <option value="failed">付款失敗</option>
      <option value="refunded">已退款</option>
    </select>

    <select
      v-model="localShippingStatus"
      class="select"
      @change="emitFilter"
    >
      <option value="">全部配送狀態</option>
      <option value="pending">待出貨</option>
      <option value="packing">備貨中</option>
      <option value="shipped">已出貨</option>
      <option value="delivered">已送達</option>
      <option value="returned">已退貨</option>
    </select>

    <input
      v-model="startDate"
      class="date"
      type="date"
      @change="emitFilter"
    />

    <input
      v-model="endDate"
      class="date"
      type="date"
      @change="emitFilter"
    />

    <select
      v-model.number="pageSize"
      class="select small"
      @change="emitPageSize"
    >
      <option :value="20">20 筆</option>
      <option :value="50">50 筆</option>
      <option :value="100">100 筆</option>
    </select>

    <button
      class="primary"
      type="button"
      :disabled="loading"
      @click="emitSearch"
    >
      搜尋
    </button>

    <button
      class="secondary"
      type="button"
      :disabled="loading"
      @click="reset"
    >
      重設
    </button>

    <button
      class="secondary"
      type="button"
      :disabled="loading"
      @click="$emit('refresh')"
    >
      重新整理
    </button>

  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props =
  defineProps<{
    loading?: boolean
  }>()

const emit =
  defineEmits<{
    (
      e:'search',
      keyword:string,
    ):void

    (
      e:'filter',
      payload:{
        orderStatus:string
        paymentStatus:string
        shippingStatus:string
        startDate:string
        endDate:string
      },
    ):void

    (
      e:'page-size',
      value:number,
    ):void

    (
      e:'refresh',
    ):void

    (
      e:'reset',
    ):void
  }>()

const localKeyword =
  ref('')

const localOrderStatus =
  ref('')

const localPaymentStatus =
  ref('')

const localShippingStatus =
  ref('')

const startDate =
  ref('')

const endDate =
  ref('')

const pageSize =
  ref(20)

function emitSearch(){
  emit(
    'search',
    localKeyword.value.trim(),
  )
}

function emitFilter(){

  emit(
    'filter',
    {
      orderStatus:
        localOrderStatus.value,

      paymentStatus:
        localPaymentStatus.value,

      shippingStatus:
        localShippingStatus.value,

      startDate:
        startDate.value,

      endDate:
        endDate.value,
    },
  )
}

function emitPageSize(){

  emit(
    'page-size',
    pageSize.value,
  )
}

function reset(){

  localKeyword.value=''

  localOrderStatus.value=''

  localPaymentStatus.value=''

  localShippingStatus.value=''

  startDate.value=''

  endDate.value=''

  pageSize.value=20

  emit('reset')
}
</script>

<style scoped>
.toolbar{
  display:flex;
  flex-wrap:wrap;
  gap:12px;
  padding:20px;
  background:#fff;
  border:1px solid #e5e7eb;
  border-radius:16px;
}

.search{
  flex:1;
  min-width:260px;
}

.search,
.select,
.date{
  height:42px;
  padding:0 12px;
  border:1px solid #dbe2ea;
  border-radius:10px;
  font:inherit;
}

.small{
  width:100px;
}

.primary,
.secondary{
  height:42px;
  padding:0 18px;
  border-radius:10px;
  cursor:pointer;
  font-weight:700;
}

.primary{
  border:none;
  background:#3157d6;
  color:#fff;
}

.secondary{
  border:1px solid #dbe2ea;
  background:#fff;
}

button:disabled{
  opacity:.6;
  cursor:not-allowed;
}
</style>