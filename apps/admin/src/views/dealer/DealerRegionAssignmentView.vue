<script setup lang="ts">

import {
  onMounted,
  ref,
} from 'vue'


import type {
  DealerRegion,
} from '../../types/dealer-region'


import type {
  DealerRegionReassignmentRequest,
} from '../../types/dealer-region-reassignment'


import {
  useDealerRegionStore,
} from '../../stores/dealer-region'


import {
  useDealerRegionCapacityRuleStore,
} from '../../stores/dealer-region-capacity-rule'


import {
  useDealerRegionCandidateStore,
} from '../../stores/dealer-region-candidate'


import {
  useDealerRegionBatchAssignmentStore,
} from '../../stores/dealer-region-batch-assignment'


import {
  useDealerRegionReassignmentStore,
} from '../../stores/dealer-region-reassignment'


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


import DealerRegionBatchAssignmentResult
from '../../components/dealer/DealerRegionBatchAssignmentResult.vue'


import DealerRegionReassignmentDialog
from '../../components/dealer/DealerRegionReassignmentDialog.vue'


import DealerRegionReassignmentResult
from '../../components/dealer/DealerRegionReassignmentResult.vue'



const dealerRegionStore =
  useDealerRegionStore()


const capacityRuleStore =
  useDealerRegionCapacityRuleStore()


const candidateStore =
  useDealerRegionCandidateStore()


const batchAssignmentStore =
  useDealerRegionBatchAssignmentStore()


const reassignmentStore =
  useDealerRegionReassignmentStore()



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


const showReassignmentDialog =
  ref(false)


const selectedRegion =
  ref<DealerRegion | null>(null)



async function loadRegions(){

  await dealerRegionStore.fetchRegions()

}



// =================================
// M05-10 Batch Assignment
// =================================

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
   * 批次指派前再次檢查容量。
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
   * M05-10
   * 一次批次寫入指派與紀錄。
   */

  const batchResult =
    await batchAssignmentStore.assignBatch({

      regionId:
        selectedRegion.value.id,

      dealerIds,

      remark:
        '後台批次指派經銷商區域',

    })


  if(
    !batchResult
  ){

    assignmentError.value =
      batchAssignmentStore.error
      ??
      '批次指派執行失敗。'

    return

  }


  /*
   * 完全失敗時保留 Dialog。
   */

  if(
    batchResult.successCount === 0
  ){

    assignmentError.value =
      batchResult.error
      ??
      batchResult.message

    return

  }


  await dealerRegionStore.fetchRegions()


  await candidateStore.fetchCandidates()


  successMessage.value =
    batchResult.failureCount > 0
      ? `批次指派完成：成功 ${batchResult.successCount} 位，失敗 ${batchResult.failureCount} 位。`
      : `批次指派成功，共完成 ${batchResult.successCount} 位經銷商。`


  closeAssignDialog(
    false,
  )

}



function handleAssign(
  region: DealerRegion,
){

  successMessage.value =
    ''


  assignmentError.value =
    ''


  capacityRuleStore.clearResult()


  batchAssignmentStore.clearResult()


  reassignmentStore.clearResult()


  selectedRegion.value =
    region


  showAssignDialog.value =
    true

}



function closeAssignDialog(
  clearBatchResult = true,
){

  showAssignDialog.value =
    false


  selectedRegion.value =
    null


  assignmentError.value =
    ''


  capacityRuleStore.clearResult()


  if(
    clearBatchResult
  ){

    batchAssignmentStore.clearResult()

  }

}



function clearBatchResult(){

  batchAssignmentStore.clearResult()


  successMessage.value =
    ''


  assignmentError.value =
    ''

}



// =================================
// M05-11 Reassignment
// =================================

function handleReassign(
  region: DealerRegion,
){

  successMessage.value =
    ''


  assignmentError.value =
    ''


  capacityRuleStore.clearResult()


  reassignmentStore.clearResult()


  selectedRegion.value =
    region


  showReassignmentDialog.value =
    true

}



async function confirmReassignment(
  payload:
    DealerRegionReassignmentRequest,
){

  successMessage.value =
    ''


  assignmentError.value =
    ''


  const response =
    await reassignmentStore.reassign(
      payload,
    )


  if(
    !response
  ){

    assignmentError.value =
      reassignmentStore.error
      ??
      '經銷商區域重新指派失敗。'

    return

  }


  if(
    !response.success
  ){

    assignmentError.value =
      response.error
      ??
      response.message

    /*
     * 失敗時不關閉 Dialog，
     * 讓管理員修正後再次操作。
     */

    return

  }


  /*
   * 重新指派成功後更新：
   *
   * 1. 區域列表
   * 2. 候選經銷商清單
   *
   * 歷史紀錄 Dialog 下次開啟時，
   * 會重新從資料庫載入最新紀錄。
   */

  await dealerRegionStore.fetchRegions()


  await candidateStore.fetchCandidates()


  successMessage.value =
    response.message


  closeReassignmentDialog(
    false,
  )

}



function closeReassignmentDialog(
  clearResult = true,
){

  showReassignmentDialog.value =
    false


  selectedRegion.value =
    null


  assignmentError.value =
    ''


  capacityRuleStore.clearResult()


  if(
    clearResult
  ){

    reassignmentStore.clearResult()

  }

}



function clearReassignmentResult(){

  reassignmentStore.clearResult()


  successMessage.value =
    ''


  assignmentError.value =
    ''

}



// =================================
// Detail / History
// =================================

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



// =================================
// Remove
// =================================

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
        M05-04 Region Assignment
        ＋
        M05-08 Capacity Rules
        ＋
        M05-10 Batch Assignment
        ＋
        M05-11 Reassignment
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


  <!-- M05-10 Batch Result -->

  <section
    v-if="
      batchAssignmentStore.loading
      ||
      batchAssignmentStore.result
      ||
      (
        batchAssignmentStore.error
        &&
        !showAssignDialog
      )
    "
    class="result-panel"
  >

    <div class="result-toolbar">

      <h2>
        批次指派結果
      </h2>


      <button
        v-if="
          !batchAssignmentStore.loading
          &&
          batchAssignmentStore.result
        "
        type="button"
        @click="clearBatchResult"
      >
        關閉結果
      </button>

    </div>


    <DealerRegionBatchAssignmentResult
      :result="
        batchAssignmentStore.result
      "
      :loading="
        batchAssignmentStore.loading
      "
      :error="
        batchAssignmentStore.error
      "
    />

  </section>


  <!-- M05-11 Reassignment Result -->

  <section
    v-if="
      reassignmentStore.loading
      ||
      reassignmentStore.result
      ||
      (
        reassignmentStore.error
        &&
        !showReassignmentDialog
      )
    "
    class="result-panel"
  >

    <div class="result-toolbar">

      <h2>
        重新指派結果
      </h2>


      <button
        v-if="
          !reassignmentStore.loading
          &&
          reassignmentStore.result
        "
        type="button"
        @click="clearReassignmentResult"
      >
        關閉結果
      </button>

    </div>


    <DealerRegionReassignmentResult
      :result="
        reassignmentStore.result
      "
      :loading="
        reassignmentStore.loading
      "
      :error="
        reassignmentStore.error
      "
    />

  </section>


  <!-- M05-08 Capacity Result -->

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


  <!-- Batch Assignment Dialog -->

  <DealerRegionAssignDialog
    :visible="
      showAssignDialog
    "
    :region="
      selectedRegion
    "
    @close="
      closeAssignDialog()
    "
    @confirm="
      confirmAssign
    "
  />


  <!-- Reassignment Dialog -->

  <DealerRegionReassignmentDialog
    :visible="
      showReassignmentDialog
    "
    :region="
      selectedRegion
    "
    @close="
      closeReassignmentDialog()
    "
    @confirm="
      confirmReassignment
    "
  />


  <!-- Detail Dialog -->

  <DealerRegionDetailDialog
    v-if="showDetailDialog"
    :region="
      selectedRegion ?? {}
    "
    @close="
      closeDetailDialog
    "
  />


  <!-- History Dialog -->

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


.result-panel {

  display:
    flex;

  flex-direction:
    column;

  gap:
    16px;

  padding:
    20px;

  background:
    white;

  border:
    1px solid #eaecf0;

  border-radius:
    16px;

}


.result-toolbar {

  display:
    flex;

  align-items:
    center;

  justify-content:
    space-between;

  gap:
    16px;

}


.result-toolbar h2 {

  margin:
    0;

  color:
    #101828;

  font-size:
    18px;

}


.result-toolbar button {

  padding:
    8px 14px;

  color:
    #344054;

  background:
    white;

  border:
    1px solid #d0d5dd;

  border-radius:
    8px;

  cursor:
    pointer;

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