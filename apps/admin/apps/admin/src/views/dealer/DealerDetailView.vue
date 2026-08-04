<script setup lang="ts">

import {
  computed,
  onMounted,
  ref,
} from 'vue'

import {
  useRoute,
  useRouter,
} from 'vue-router'


import {
  useDealerStore,
} from '../../stores/dealer'


import DealerProfileCard
  from '../../components/dealer/DealerProfileCard.vue'


import DealerStatisticsCard
  from '../../components/dealer/DealerStatisticsCard.vue'


import DealerRegionCard
  from '../../components/dealer/DealerRegionCard.vue'


import DealerLogsTimeline
  from '../../components/dealer/DealerLogsTimeline.vue'



const route =
  useRoute()


const router =
  useRouter()


const dealerStore =
  useDealerStore()



const loading =
  ref(false)


const errorMessage =
  ref('')



const dealerId =
  computed(
    () =>
      String(
        route.params.id ?? '',
      ),
  )



const dealer =
  computed(
    () =>
      dealerStore.currentDealer,
  )



async function loadDealer(){

  if (
    !dealerId.value
  ) {

    errorMessage.value =
      '缺少 Dealer ID'

    return

  }


  loading.value =
    true


  errorMessage.value =
    ''


  try {

    await dealerStore
      .fetchDealerById(
        dealerId.value,
      )


    if (
      !dealerStore.currentDealer
    ) {

      errorMessage.value =
        '找不到經銷商資料。'

    }


  } catch(error){

    errorMessage.value =
      '經銷商資料載入失敗。'


  } finally {

    loading.value =
      false

  }

}



function goBack(){

  router.push({
    name:
      'dealers',
  })

}



onMounted(
  loadDealer,
)


</script>



<template>

<div class="dealer-detail-page">


  <!-- Header -->

  <div
    class="page-header"
  >

    <button
      class="back-button"
      @click="goBack"
    >

      ← 返回經銷商列表

    </button>


    <h1>
      經銷商詳細資料
    </h1>


  </div>



  <!-- Loading -->

  <div
    v-if="loading"
    class="loading"
  >

    載入經銷商資料中...

  </div>



  <!-- Error -->

  <div
    v-else-if="errorMessage"
    class="error-box"
  >

    {{ errorMessage }}

  </div>



  <!-- Content -->

  <template
    v-else-if="dealer"
  >


    <!-- Profile -->

    <DealerProfileCard
      :dealer="dealer"
    />



    <!-- Statistics -->

    <DealerStatisticsCard
      :dealer="dealer"
    />



    <!-- Region -->

    <DealerRegionCard
      :dealer="dealer"
    />



    <!-- Logs -->

    <DealerLogsTimeline
      :dealer-id="dealer.id"
    />


  </template>



</div>


</template>



<style scoped>

.dealer-detail-page {

  padding:24px;

}



.page-header {

  display:flex;

  align-items:center;

  gap:20px;

  margin-bottom:24px;

}



.page-header h1 {

  font-size:24px;

  font-weight:700;

}



.back-button {

  padding:10px 16px;

  border-radius:8px;

  border:1px solid #ddd;

  background:white;

  cursor:pointer;

}



.loading {

  padding:40px;

  text-align:center;

}



.error-box {

  padding:20px;

  background:#fff1f0;

  color:#cf1322;

  border-radius:10px;

}


</style>