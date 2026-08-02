<template>
  <section class="stats-grid">
    <div
      v-for="item in cards"
      :key="item.label"
      class="stat-card"
    >
      <div class="label">
        {{ item.label }}
      </div>

      <div class="value">
        {{ item.value }}
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import type {
  MallOrderStatistics,
} from '../../types/mall-order'

const props =
  defineProps<{
    statistics: MallOrderStatistics
  }>()

const cards =
  computed(() => [
    {
      label: '全部訂單',
      value: props.statistics.total,
    },
    {
      label: '待付款',
      value: props.statistics.pendingPayment,
    },
    {
      label: '已付款',
      value: props.statistics.paid,
    },
    {
      label: '處理中',
      value: props.statistics.processing,
    },
    {
      label: '已出貨',
      value: props.statistics.shipped,
    },
    {
      label: '已完成',
      value: props.statistics.completed,
    },
    {
      label: '已取消',
      value: props.statistics.cancelled,
    },
    {
      label: '交易總額',
      value: formatMoney(
        props.statistics.totalAmount,
      ),
    },
  ])

function formatMoney(
  amount: number,
) {
  return new Intl.NumberFormat(
    'zh-TW',
    {
      style: 'currency',
      currency: 'TWD',
      maximumFractionDigits: 0,
    },
  ).format(amount)
}
</script>

<style scoped>
.stats-grid{
  display:grid;
  grid-template-columns:
    repeat(auto-fit,minmax(180px,1fr));
  gap:20px;
}

.stat-card{
  background:#fff;
  border:1px solid #e5e7eb;
  border-radius:16px;
  padding:22px;
  transition:.2s;
}

.stat-card:hover{
  transform:translateY(-2px);
  box-shadow:0 10px 30px rgba(0,0,0,.08);
}

.label{
  color:#64748b;
  font-size:13px;
  margin-bottom:12px;
}

.value{
  font-size:30px;
  font-weight:700;
  color:#111827;
  word-break:break-word;
}
</style>