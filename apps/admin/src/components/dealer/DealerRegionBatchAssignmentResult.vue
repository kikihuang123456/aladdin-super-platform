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


import {
  useDealerRegionCandidateStore,
} from '../../stores/dealer-region-candidate'


import {
  useDealerRegionBatchAssignmentStore,
} from '../../stores/dealer-region-batch-assignment'


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



const dealerRegionStore =
  useDealerRegionStore()


const capacityRuleStore =
  useDealerRegionCapacityRuleStore()


const candidateStore =
  useDealerRegionCandidateStore()


const batchAssignmentStore =
  useDealerRegionBatchAssignmentStore()



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
   * 正式批次指派前，
   * 再執行一次容量檢查。
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
   *
   * 一次批次寫入：
   *
   * dealer_region_members
   * dealer_region_logs
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
   * 完全失敗：
   *
   * 保留 Dialog，
   * 讓管理員查看錯誤並重新操作。
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


  /*
   * 至少一筆成功後：
   *
   * 更新區域列表
   * 更新候選經銷商
   */

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
        M05-04 Region Assignment
        ＋
        M05-08 Capacity Rules
        ＋
        M05-10 Batch Assignment
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
    class="batch-result-panel"
  >

    <div class="batch-result-toolbar">

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
      closeAssignDialog()
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


.batch-result-panel {

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


.batch-result-toolbar {

  display:
    flex;

  align-items:
    center;

  justify-content:
    space-between;

  gap:
    16px;

}


.batch-result-toolbar h2 {

  margin:
    0;

  color:
    #101828;

  font-size:
    18px;

}


.batch-result-toolbar button {

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