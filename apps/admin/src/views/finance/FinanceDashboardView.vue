<template>
  <AdminLayout>

    <div class="finance-page">

      <section class="page-header">

        <div>

          <p class="page-eyebrow">
            FINANCE ERP
          </p>

          <h1>
            財務中心
          </h1>

          <p class="description">
            管理平台收入、訂單交易、退款與資金流向。
          </p>

        </div>

      </section>


      <section
        v-if="isLoading"
        class="state-card"
      >
        財務資料載入中...
      </section>



      <template v-else>


        <FinanceStatsCards
  :statistics="statistics"
/>
<FinanceWalletSummary
  :statistics="statistics"
/>


        <FinanceTransactionTable
  :transactions="transactions"
/>


      </template>


    </div>

  </AdminLayout>
</template>
<script setup lang="ts">

import {
  computed,
  onMounted,
} from 'vue'


import AdminLayout
  from '../../layouts/AdminLayout.vue'

import FinanceStatsCards
  from '../../components/finance/FinanceStatsCards.vue'


import FinanceTransactionTable
  from '../../components/finance/FinanceTransactionTable.vue'


import FinanceWalletSummary
  from '../../components/finance/FinanceWalletSummary.vue'

import {
  useFinanceStore,
} from '../../stores/finance'



const financeStore =
  useFinanceStore()



const statistics =
  computed(
    () =>
      financeStore.statistics,
  )



const transactions =
  computed(
    () =>
      financeStore.transactions,
  )



const isLoading =
  computed(
    () =>
      financeStore.isLoading,
  )





onMounted(
  async () => {

    await financeStore.fetchDashboard()

  },
)

</script>
<style scoped>

.finance-page{
  display:flex;
  flex-direction:column;
  gap:24px;
}


.page-header{
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
}


.page-eyebrow{
  margin:0;
  color:#3157d6;
  font-size:13px;
  font-weight:800;
  letter-spacing:.08em;
}


.page-header h1{
  margin:8px 0;
  color:#0f172a;
  font-size:34px;
  font-weight:800;
}


.description{
  color:#64748b;
}



.stats-grid{

  display:grid;

  grid-template-columns:
    repeat(4,minmax(0,1fr));

  gap:20px;

}



.stat-card{

  padding:24px;

  background:#ffffff;

  border:1px solid #e5e7eb;

  border-radius:18px;

}



.stat-card span{

  display:block;

  color:#64748b;

  font-size:14px;

  margin-bottom:12px;

}



.stat-card strong{

  color:#0f172a;

  font-size:30px;

  font-weight:800;

}



.card{

  padding:24px;

  background:#ffffff;

  border:1px solid #e5e7eb;

  border-radius:18px;

}



.card h2{

  margin:0 0 20px;

  color:#0f172a;

  font-size:22px;

}



table{

  width:100%;

  border-collapse:collapse;

}



th{

  padding:14px;

  background:#f8fafc;

  color:#64748b;

  text-align:left;

  font-size:13px;

}



td{

  padding:14px;

  border-bottom:1px solid #eef2f7;

  color:#334155;

}



.empty{

  padding:40px;

  text-align:center;

  color:#94a3b8;

}



.state-card{

  padding:50px;

  background:#ffffff;

  border-radius:18px;

  text-align:center;

  color:#64748b;

}



@media(max-width:1200px){

  .stats-grid{

    grid-template-columns:
      repeat(2,minmax(0,1fr));

  }

}



@media(max-width:768px){

  .stats-grid{

    grid-template-columns:
      1fr;

  }


  .card{

    overflow-x:auto;

  }


  table{

    min-width:700px;

  }

}

</style>