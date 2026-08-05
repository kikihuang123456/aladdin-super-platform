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


import {
  useDealerRegionCapacityRuleStore,
} from '../../stores/dealer-region-capacity-rule'


import DealerRegionAssignmentTable
from '../../components/dealer/DealerRegionAssignmentTable.vue'


import DealerRegionAssignDialog
from '../../components/dealer/DealerRegionAssignDialog.vue'


import DealerRegionDetailDialog
from '../../components/dealer/DealerRegionDetailDialog.vue'


import DealerRegionHistoryDialog
from '../../components/dealer/DealerRegionHistoryDialog.vue'


import DealerRegionCapacityRuleAlert
from '../../components/dealer/DealerRegionCapacityRuleAlert.vue'



const dealerRegionStore =
  useDealerRegionStore()


const capacityRuleStore =
  useDealerRegionCapacityRuleStore()



const successMessage =
  ref('')


const assignmentError =
  ref('')


const showAssignDialog =
  ref(false)


const showDetailDialog =
  ref(false)


const showHistoryDialog =
  ref(false)


const selectedRegion =
  ref<DealerRegion | null>(null)



async function loadRegions(){

  await dealerRegionStore.fetchRegions()

}



async function confirmAssign(
  dealerIds: string[],
){

  successMessage.value =
    ''


  assignmentError.value =
    ''


  if(
    !selectedRegion.value
  ){

    assignmentError.value =
      '尚未選擇指派區域。'

    return

  }


  if(
    dealerIds.length === 0
  ){

    assignmentError.value =
      '請至少選擇一位經銷商。'

    return

  }


  /*
   * M05-08
   *
   * 正式指派前先檢查：
   *
   * 1. 區域是否啟用
   * 2. 是否已設定容量
   * 3. 目前經銷商人數
   * 4. 本次指派後是否超過容量
   */

  const capacityResult =
    await capacityRuleStore
      .checkAssignmentCapacity({

        regionId:
          selectedRegion.value.id,

        dealerIds,

      })


  if(
    !capacityResult
  ){

    assignmentError.value =
      capacityRuleStore.error
      ??
      '無法完成區域容量檢查。'

    return

  }


  if(
    !capacityResult.allowed
  ){

    assignmentError.value =
      capacityResult.message

    return

  }


  /*
   * 容量檢查通過後，
   * 才正式寫入區域指派。
   */

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


    if(
      dealerRegionStore.error
    ){

      assignmentError.value =
        dealerRegionStore.error

      return

    }

  }


  await dealerRegionStore.fetchRegions()


  successMessage.value =
    `經銷商區域指派成功，共完成 ${dealerIds.length} 位經銷商。`


  closeAssignDialog()

}



function handleAssign(
  region: DealerRegion,
){

  successMessage.value =
    ''


  assignmentError.value =
    ''


  capacityRuleStore.clearResult()


  selectedRegion.value =
    region


  showAssignDialog.value =
    true

}



function handleDetail(
  region: DealerRegion,
){

  selectedRegion.value =
    region


  showDetailDialog.value =
    true

}



function handleHistory(
  region: DealerRegion,
){

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


  assignmentError.value =
    ''


  capacityRuleStore.clearResult()

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
  async() => {

    await loadRegions()

  },
)

</script>


<template>

<div class="dealer-region-page">


  <div class="page-header">

    <div>

      <h1>
        經銷商區域管理
      </h1>

      <p>
        M05-04 Dealer Region Assignment
        ＋
        M05-08 Capacity Rules
      </p>

    </div>

  </div>


  <div
    v-if="successMessage"
    class="success-message"
  >
    {{ successMessage }}
  </div>


  <div
    v-if="assignmentError"
    class="error-message"
  >
    {{ assignmentError }}
  </div>


  <DealerRegionCapacityRuleAlert
    v-if="
      showAssignDialog
      &&
      (
        capacityRuleStore.loading
        ||
        capacityRuleStore.result
        ||
        capacityRuleStore.error
      )
    "
    :result="
      capacityRuleStore.result
    "
    :loading="
      capacityRuleStore.loading
    "
    :error="
      capacityRuleStore.error
    "
  />


  <div
    v-if="dealerRegionStore.isLoading"
    class="state-card"
  >
    載入中...
  </div>


  <div
    v-else-if="dealerRegionStore.error"
    class="state-card error-state"
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
    class="selected-region"
  >
    已選擇區域：
    <strong>
      {{ selectedRegion.name }}
    </strong>
  </div>

</div>

</template>


<style scoped>

.dealer-region-page {

  display:
    flex;

  flex-direction:
    column;

  gap:
    20px;

}


.page-header {

  display:
    flex;

  align-items:
    center;

  justify-content:
    space-between;

  padding:
    24px;

  background:
    white;

  border-radius:
    16px;

}


.page-header h1 {

  margin:
    0 0 8px;

  color:
    #101828;

}


.page-header p {

  margin:
    0;

  color:
    #667085;

}


.success-message {

  padding:
    14px 16px;

  color:
    #067647;

  background:
    #ecfdf3;

  border:
    1px solid #abefc6;

  border-radius:
    12px;

}


.error-message {

  padding:
    14px 16px;

  color:
    #b42318;

  background:
    #fef3f2;

  border:
    1px solid #fecdca;

  border-radius:
    12px;

}


.state-card {

  padding:
    24px;

  color:
    #475467;

  background:
    white;

  border-radius:
    16px;

}


.error-state {

  color:
    #b42318;

  background:
    #fef3f2;

}


.selected-region {

  padding:
    14px 16px;

  color:
    #475467;

  background:
    white;

  border:
    1px solid #eaecf0;

  border-radius:
    12px;

}

</style>