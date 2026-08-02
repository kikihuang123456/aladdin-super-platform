<template>

  <section class="stats-grid">


    <div class="stat-card">

      <span>
        平台總收入
      </span>

      <strong>
        {{ formatMoney(
          statistics.totalIncome
        ) }}
      </strong>

    </div>



    <div class="stat-card">

      <span>
        今日收入
      </span>

      <strong>
        {{ formatMoney(
          statistics.todayIncome
        ) }}
      </strong>

    </div>



    <div class="stat-card">

      <span>
        商家待結算
      </span>

      <strong>
        {{ formatMoney(
          statistics.merchantSettlementAmount
        ) }}
      </strong>

    </div>



    <div class="stat-card">

      <span>
        待提款金額
      </span>

      <strong>
        {{ formatMoney(
          statistics.withdrawPendingAmount
        ) }}
      </strong>

    </div>


  </section>

</template>



<script setup lang="ts">


import type {
  FinanceStatistics,
} from '../../types/finance'



defineProps<{

  statistics:
    FinanceStatistics

}>()



function formatMoney(
  amount:number,
):string {


  return new Intl.NumberFormat(
    'zh-TW',
    {

      style:
        'currency',

      currency:
        'TWD',

      maximumFractionDigits:
        0,

    },
  ).format(
    amount || 0,
  )

}


</script>



<style scoped>

.stats-grid{

display:grid;

grid-template-columns:
repeat(4,minmax(0,1fr));

gap:20px;

}



.stat-card{

padding:24px;

background:white;

border-radius:18px;

border:1px solid #e5e7eb;

}



.stat-card span{

display:block;

color:#64748b;

margin-bottom:12px;

font-size:14px;

}



.stat-card strong{

font-size:30px;

color:#0f172a;

}



@media(max-width:1000px){

.stats-grid{

grid-template-columns:
repeat(2,1fr);

}

}


</style>
