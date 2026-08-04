<script setup lang="ts">

import {
  onMounted,
  ref,
} from 'vue'


import {
  useDealerStore,
} from '../../stores/dealer'



const dealerStore =
  useDealerStore()



const loading =
  ref(false)



async function loadPendingDealers(){

  loading.value =
    true


  try {

    /**
     * Part 2 會接：
     *
     * dealerApi.getPendingDealers()
     *
     * 目前先建立頁面流程
     */


    await dealerStore
      .fetchDealers()


  } finally {

    loading.value =
      false

  }

}



onMounted(
  loadPendingDealers,
)


</script>



<template>


<div class="dealer-approval-page">


  <div class="page-header">

    <div>

      <p class="eyebrow">
        Dealer ERP
      </p>


      <h1>
        經銷商審核中心
      </h1>


      <p>
        管理新申請經銷商、
        審核資格與啟用狀態。
      </p>

    </div>


  </div>



  <div
    v-if="loading"
    class="state"
  >

    載入審核資料中...

  </div>



  <div
    v-else
    class="approval-card"
  >

    <div class="empty">

      待審核經銷商列表即將載入

    </div>


  </div>



</div>


</template>



<style scoped>


.dealer-approval-page{

  display:flex;

  flex-direction:column;

  gap:24px;

}



.page-header{

  padding:24px;

  background:white;

  border-radius:16px;

}



.eyebrow{

  color:#3157d6;

  font-size:13px;

  font-weight:800;

}



h1{

  margin:8px 0;

  font-size:32px;

}



.approval-card{

  min-height:300px;

  padding:24px;

  background:white;

  border-radius:16px;

}



.empty{

  padding:80px;

  text-align:center;

  color:#64748b;

}



.state{

  padding:60px;

  text-align:center;

}


</style>