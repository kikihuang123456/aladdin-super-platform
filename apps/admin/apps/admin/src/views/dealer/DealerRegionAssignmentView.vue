<script setup lang="ts">

import {
  onMounted,
} from 'vue'


import {
  useDealerRegionStore,
} from '../../stores/dealer-region'


import DealerRegionAssignmentTable
from '../../components/dealer/DealerRegionAssignmentTable.vue'

import DealerRegionDetailDialog
from '../../components/dealer/DealerRegionDetailDialog.vue'


const dealerRegionStore =
  useDealerRegionStore()



async function loadRegions(){

  await dealerRegionStore.fetchRegions()

}
async function handleAssignConfirm(
  dealerIds:any[]
){

  if(
    !selectedRegion.value
  ){

    return

  }


  for(
    const dealerId of dealerIds
  ){

    await dealerRegionStore.assignRegion({

      region_id:
        selectedRegion.value.id,


      dealer_id:
        dealerId,

    })

  }


  showAssignDialog.value =
    false


  await loadRegions()

}


import {
  ref,
} from 'vue'


import DealerRegionAssignDialog
from '../../components/dealer/DealerRegionAssignDialog.vue'


const showAssignDialog =
  ref(false)


const selectedRegion =
  ref<any>({})

const showDetailDialog =
  ref(false)

function handleAssign(
  region:any
){

  selectedRegion.value =
    region


  showAssignDialog.value =
    true

}
function handleDetail(
  region:any
){

  console.log(
    '父層收到 detail:',
    region
  )


  selectedRegion.value =
    region


  showDetailDialog.value =
    true

}


function handleReassign(
  region:any
){

  console.log(
    'reassign region',
    region,
  )

}



function handleRemove(
  region:any
){

  console.log(
    'remove region',
    region,
  )

}



onMounted(
  () => {

    loadRegions()

  },
)


</script>


<template>


<div
  class="dealer-region-page"
>


  <div
    class="page-header"
  >

    <h1>
      經銷商區域管理
    </h1>


    <p>
      M05-04 Dealer Region Assignment
    </p>

  </div>



  <div
    v-if="dealerRegionStore.isLoading"
  >

    載入中...

  </div>



  <div
    v-else-if="dealerRegionStore.error"
  >

    {{ dealerRegionStore.error }}

  </div>



  <DealerRegionAssignmentTable

    v-else

    :regions="
      dealerRegionStore.regions
    "

    @assign="
      handleAssign
    "

     @detail="
    handleDetail
  "
    @reassign="
      handleReassign
    "

    @remove="
      handleRemove
    "

  />
  <DealerRegionAssignDialog

v-if="showAssignDialog"

:region="
selectedRegion
"

@close="
showAssignDialog = false
"

@confirm="
handleAssignConfirm
"

/>


<DealerRegionDetailDialog

v-if="showDetailDialog"

:region="
selectedRegion
"

@close="
showDetailDialog = false
"

/>


</div>


</template>


<style scoped>

.dealer-region-page{

  padding:24px;

}


.page-header{

  margin-bottom:20px;

}


</style>