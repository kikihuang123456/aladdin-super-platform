<template>

  <section class="wallet-card">


    <div class="wallet-header">

      <div>

        <p>
          平台資金中心
        </p>


        <h2>
          錢包總覽
        </h2>

      </div>


      <span class="wallet-status">
        正常運作
      </span>


    </div>




    <div class="wallet-grid">


      <div class="wallet-item">

        <span>
          錢包餘額
        </span>


        <strong>
          {{ formatMoney(
            statistics.walletBalance
          ) }}
        </strong>

      </div>



      <div class="wallet-item">

        <span>
          本月收入
        </span>


        <strong>
          {{ formatMoney(
            statistics.monthIncome
          ) }}
        </strong>

      </div>




      <div class="wallet-item">

        <span>
          待結算金額
        </span>


        <strong>
          {{ formatMoney(
            statistics.merchantSettlementAmount
          ) }}
        </strong>

      </div>




      <div class="wallet-item">

        <span>
          待提款
        </span>


        <strong>
          {{ formatMoney(
            statistics.withdrawPendingAmount
          ) }}
        </strong>

      </div>



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


.wallet-card{

padding:28px;

background:
linear-gradient(
135deg,
#0f172a,
#1e293b
);

border-radius:20px;

color:white;

}



.wallet-header{

display:flex;

justify-content:space-between;

align-items:center;

margin-bottom:28px;

}



.wallet-header p{

margin:0;

opacity:.7;

font-size:14px;

}



.wallet-header h2{

margin:8px 0 0;

font-size:26px;

}



.wallet-status{

padding:8px 16px;

border-radius:999px;

background:rgba(255,255,255,.15);

font-size:13px;

}



.wallet-grid{

display:grid;

grid-template-columns:
repeat(4,minmax(0,1fr));

gap:20px;

}



.wallet-item{

padding:20px;

background:
rgba(255,255,255,.08);

border-radius:16px;

}



.wallet-item span{

display:block;

font-size:14px;

opacity:.75;

margin-bottom:10px;

}



.wallet-item strong{

font-size:24px;

}



@media(max-width:1000px){

.wallet-grid{

grid-template-columns:
repeat(2,1fr);

}

}



</style>