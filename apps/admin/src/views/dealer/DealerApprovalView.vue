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

const submittingDealerId =
  ref<string | null>(
    null,
  )

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

  if(
    submittingDealerId.value
  ){

    return

  }


  const confirmed =
    window.confirm(
      `確定要通過經銷商「${dealer.name}」的申請嗎？\n\n通過後帳號將立即啟用。`,
    )


  if(
    !confirmed
  ){

    return

  }


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


  submittingDealerId.value =
    dealer.id


  try {

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


    if(
      result
    ){

      await dealerStore
        .fetchPendingDealers()

    }

  } finally {

    submittingDealerId.value =
      null

  }

}



async function handleReject(
  dealer: Dealer,
): Promise<void> {

  if(
    submittingDealerId.value
  ){

    return

  }


  const rejectReason =
    window.prompt(
      `請輸入拒絕經銷商「${dealer.name}」的原因：`,
      '',
    )


  /*
   * 使用者按下取消。
   */

  if(
    rejectReason === null
  ){

    return

  }


  const normalizedReason =
    rejectReason.trim()


  if(
    !normalizedReason
  ){

    window.alert(
      '拒絕原因不可空白。',
    )

    return

  }


  const confirmed =
    window.confirm(
      `確定拒絕此經銷商申請嗎？\n\n拒絕原因：${normalizedReason}`,
    )


  if(
    !confirmed
  ){

    return

  }


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


  submittingDealerId.value =
    dealer.id


  try {

    const result =
      await dealerStore.approveDealer({

        dealerId:
          dealer.id,

        status:
          'rejected',

        approvedBy:
          approverId,

        remark:
          `審核拒絕：${normalizedReason}`,

      })


    if(
      result
    ){

      await dealerStore
        .fetchPendingDealers()

    }

  } finally {

    submittingDealerId.value =
      null

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