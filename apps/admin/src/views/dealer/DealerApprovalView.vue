<script setup lang="ts">

import {
  onMounted,
  ref,
} from 'vue'


import DealerApprovalTable
from '../../components/dealer/DealerApprovalTable.vue'


import {
  useDealerStore,
} from '../../stores/dealer'

import {
  useAuthStore,
} from '../../stores/auth'

import {
  useRouter,
} from 'vue-router'


import type {
  Dealer,
} from '../../types/dealer'

const dealerStore =
  useDealerStore()

const router =
  useRouter()

const authStore =
  useAuthStore()

const loading =
  ref(false)



async function loadPendingDealers(){

  loading.value =
    true


  try {

    await dealerStore
      .fetchPendingDealers()


  } finally {

    loading.value =
      false

  }

}



async function handleView(
  dealer: Dealer,
): Promise<void> {

  await router.push({

    name:
      'dealer-detail',

    params: {

      id:
        dealer.id,

    },

  })

}



async function handleApprove(
  dealer: Dealer,
): Promise<void> {

  const approverId =
  authStore.user?.id
  ??
  null


if(
  !approverId
){

  dealerStore.error =
    '無法取得目前登入管理員 ID，請重新登入後再審核。'

  return

}


const result =
  await dealerStore.approveDealer({

    dealerId:
      dealer.id,

    status:
      'approved',

    approvedBy:
      approverId,

    remark:
      '審核通過',

  })


  if(result){

    await dealerStore
      .fetchPendingDealers()

  }

}



async function handleReject(
  dealer: Dealer,
): Promise<void> {

  const approverId =
  authStore.user?.id
  ??
  null


if(
  !approverId
){

  dealerStore.error =
    '無法取得目前登入管理員 ID，請重新登入後再審核。'

  return

}


const result =
  await dealerStore.approveDealer({

    dealerId:
      dealer.id,

    status:
      'rejected',

    approvedBy:
      approverId,

    remark:
      '審核拒絕',

  })

  if(result){

    await dealerStore
      .fetchPendingDealers()

  }

}



onMounted(
  loadPendingDealers,
)


</script>



<template>

<div
  class="dealer-approval-page"
>


  <div
    class="page-header"
  >

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


    <DealerApprovalTable

      :dealers="
        dealerStore.dealers
      "

      @view="
        handleView
      "

      @approve="
        handleApprove
      "

      @reject="
        handleReject
      "

    />


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

  background:white;

  border-radius:16px;

  padding:24px;

}



.state{

  padding:60px;

  text-align:center;

}



</style>