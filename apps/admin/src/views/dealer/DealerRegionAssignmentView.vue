<script setup lang="ts">

import {
  onMounted,
  ref,
} from 'vue'


import type {
  DealerRegion,
} from '../../types/dealer-region'


import {
  useDealerRegionStore,
} from '../../stores/dealer-region'


import DealerRegionAssignmentTable
from '../../components/dealer/DealerRegionAssignmentTable.vue'


import DealerRegionAssignDialog
from '../../components/dealer/DealerRegionAssignDialog.vue'


import DealerRegionDetailDialog
from '../../components/dealer/DealerRegionDetailDialog.vue'


import DealerRegionHistoryDialog
from '../../components/dealer/DealerRegionHistoryDialog.vue'

const dealerRegionStore =
  useDealerRegionStore()

const successMessage =
  ref('')

const showAssignDialog =
  ref(false)

const selectedRegion =
  ref<DealerRegion | null>(null)


const showDetailDialog =
  ref(false)

const showHistoryDialog =
  ref(false)

async function loadRegions(){

  await dealerRegionStore.fetchRegions()

}

async function confirmAssign(
  dealerIds:string[],
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

      dealerId,

      regionId:
        selectedRegion.value.id,

      remark:
        '後台指派經銷商區域',

    })

  }



  await dealerRegionStore.fetchRegions()


successMessage.value =
  '經銷商區域指派成功。'


closeAssignDialog()

}

function handleAssign(
  region: DealerRegion,
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



function handleHistory(
  region:any
){

  console.log(
    '父層收到 history:',
    region
  )


  selectedRegion.value =
    region


  showHistoryDialog.value =
    true

}



function closeDetailDialog(){

  showDetailDialog.value =
    false

  selectedRegion.value =
    null

}



function closeHistoryDialog(){

  showHistoryDialog.value =
    false

  selectedRegion.value =
    null

}

function closeAssignDialog(){

  showAssignDialog.value =
    false


  selectedRegion.value =
    null

}

function handleReassign(
  region: DealerRegion,
){

  console.log(
    'reassign region',
    region,
  )

}

function handleRemove(
  region: DealerRegion,
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
<div
  v-if="successMessage"
  class="success-message"
>

  {{ successMessage }}

</div>
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

@history="
handleHistory
"

@reassign="
handleReassign
"

@remove="
handleRemove
"

/>


<DealerRegionAssignDialog

:visible="
showAssignDialog
"

:region="
selectedRegion
"

@close="
closeAssignDialog
"

@confirm="
confirmAssign
"

/>


<DealerRegionDetailDialog

v-if="showDetailDialog"

:region="
selectedRegion ?? {}
"

@close="
closeDetailDialog
"

/>
<DealerRegionDetailDialog

v-if="showDetailDialog"

:region="
selectedRegion ?? {}
"

@close="
closeDetailDialog
"

/>


<DealerRegionHistoryDialog

v-if="showHistoryDialog"

:region="
selectedRegion ?? {}
"

@close="
closeHistoryDialog
"

/>
<div
  v-if="selectedRegion"
  class="dialog"
>

  已選擇區域：

  {{ selectedRegion.name }}

</div>

</div>


</template>

<style scoped>

.dealer-region-page{

  display:flex;

  flex-direction:column;

  gap:20px;

}


.page-header{

  background:white;

  padding:24px;

  border-radius:16px;

}

.success-message{

  background:#e8fff0;

  padding:12px;

  border-radius:10px;

}

</style>