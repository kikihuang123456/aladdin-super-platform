<template>
  <section class="dashboard-card">

    <header class="card-header">

      <div>

        <p class="eyebrow">
          MALL ORDER
        </p>

        <h3>
          訂單概況
        </h3>

      </div>

      <RouterLink
        to="/order"
        class="view-all"
      >
        查看全部
      </RouterLink>

    </header>

    <div class="stats">

      <div class="item">
        <span>全部訂單</span>
        <strong>{{ statistics.total }}</strong>
      </div>

      <div class="item">
        <span>待付款</span>
        <strong>{{ statistics.pendingPayment }}</strong>
      </div>

      <div class="item">
        <span>已完成</span>
        <strong>{{ statistics.completed }}</strong>
      </div>

    </div>

  </section>
</template>
<script setup lang="ts">
import {
  computed,
  onMounted,
} from 'vue'

import {
  useMallOrderStore,
} from '../../stores/mall-order'

const orderStore =
  useMallOrderStore()

const statistics =
  computed(() =>
    orderStore.statistics,
  )

onMounted(async () => {
  if (
    orderStore.orders.length === 0 &&
    !orderStore.isLoading
  ) {
    await orderStore.fetchOrders()
  }
})
</script>
<style scoped>

.dashboard-card{
  background:#ffffff;
  border:1px solid #e5e7eb;
  border-radius:18px;
  padding:24px;
}

.card-header{
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom:24px;
}

.eyebrow{
  margin:0 0 6px;
  color:#3157d6;
  font-size:12px;
  font-weight:700;
  letter-spacing:.08em;
  text-transform:uppercase;
}

.card-header h3{
  margin:0;
  color:#0f172a;
  font-size:22px;
  font-weight:700;
}

.view-all{
  color:#3157d6;
  text-decoration:none;
  font-weight:600;
}

.view-all:hover{
  text-decoration:underline;
}

.stats{
  display:grid;
  grid-template-columns:
    repeat(3,minmax(0,1fr));
  gap:16px;
}

.item{
  background:#f8fafc;
  border:1px solid #e2e8f0;
  border-radius:14px;
  padding:18px;
}

.item span{
  display:block;
  color:#64748b;
  font-size:13px;
  margin-bottom:8px;
}

.item strong{
  display:block;
  color:#0f172a;
  font-size:30px;
  font-weight:800;
}

@media (max-width:768px){

  .stats{
    grid-template-columns:1fr;
  }

}

</style>
