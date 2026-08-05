<script setup lang="ts">

import {
  computed,
  ref,
  watch,
} from 'vue'


import type {
  DealerRegion,
} from '../../types/dealer-region'


import {
  useDealerRegionCapacityRuleStore,
} from '../../stores/dealer-region-capacity-rule'


import DealerRegionCapacityRuleAlert
from './DealerRegionCapacityRuleAlert.vue'

import DealerRegionCandidateSelector
from './DealerRegionCandidateSelector.vue'

import {
  useDealerRegionCandidateStore,
} from '../../stores/dealer-region-candidate'

interface Props {

  visible:
    boolean

  region:
    DealerRegion | null

}



const props =
  defineProps<Props>()



const emit =
  defineEmits<{

    close: []

    confirm: [
      dealerIds: string[],
    ]

  }>()



const capacityRuleStore =
  useDealerRegionCapacityRuleStore()

const candidateStore =
  useDealerRegionCandidateStore()




const selectedDealerIds =
  ref<string[]>([])


const submitting =
  ref(false)


const localError =
  ref('')


// 防止較舊的容量檢查結果
// 覆蓋最新勾選結果

let capacityCheckSequence =
  0



const title =
computed(
  () => {

    if(
      !props.region
    ){

      return '指派經銷商區域'

    }


    return `指派至 ${props.region.name}`

  },
)



const canConfirm =
computed(
  () => {

    if(
      submitting.value
      ||
      capacityRuleStore.loading
    ){

      return false

    }


    if(
      selectedDealerIds.value.length === 0
    ){

      return false

    }


    if(
      !capacityRuleStore.result
    ){

      return false

    }


    return capacityRuleStore.result.allowed

  },
)



async function checkSelectedCapacity(){

  const currentSequence =
    ++capacityCheckSequence


  localError.value =
    ''


  if(
    !props.visible
    ||
    !props.region
  ){

    capacityRuleStore.clearResult()

    return

  }


  if(
    selectedDealerIds.value.length === 0
  ){

    capacityRuleStore.clearResult()

    return

  }


  const dealerIds =
    [
      ...selectedDealerIds.value,
    ]


  const result =
    await capacityRuleStore
      .checkAssignmentCapacity({

        regionId:
          props.region.id,

        dealerIds,

      })


  if(
    currentSequence !==
    capacityCheckSequence
  ){

    return

  }


  if(
    !result
  ){

    localError.value =
      capacityRuleStore.error
      ??
      '區域容量檢查失敗。'

  }

}







function resetDialog(){

  capacityCheckSequence +=
    1


  submitting.value =
    false


  selectedDealerIds.value =
    []


  localError.value =
    ''


  capacityRuleStore.clearResult()

}



function handleClose(){

  resetDialog()


  emit(
    'close',
  )

}



async function handleConfirm(){

  localError.value =
    ''


  if(
    !props.region
  ){

    localError.value =
      '尚未選擇區域。'

    return

  }


  if(
    selectedDealerIds.value.length === 0
  ){

    localError.value =
      '請至少選擇一位經銷商。'

    return

  }


  submitting.value =
    true


  // 確認送出前再檢查一次，
  // 避免使用過期的容量結果。

  const dealerIds =
    [
      ...selectedDealerIds.value,
    ]


  const capacityResult =
    await capacityRuleStore
      .checkAssignmentCapacity({

        regionId:
          props.region.id,

        dealerIds,

      })


  if(
    !capacityResult
  ){

    localError.value =
      capacityRuleStore.error
      ??
      '無法完成區域容量檢查。'


    submitting.value =
      false


    return

  }


  if(
    !capacityResult.allowed
  ){

    localError.value =
      capacityResult.message


    submitting.value =
      false


    return

  }


  emit(
    'confirm',
    dealerIds,
  )

  await candidateStore.fetchCandidates()

  // emit 不會等待父層 async 函式，
  // 因此恢復按鈕狀態。
  // 指派成功時父層會關閉 Dialog。

  submitting.value =
    false

}



watch(
  selectedDealerIds,
  async() => {

    await checkSelectedCapacity()

  },
  {
    deep:
      true,
  },
)



watch(
  () => props.region?.id,
  async(
    nextRegionId,
    previousRegionId,
  ) => {

    if(
      nextRegionId ===
      previousRegionId
    ){

      return

    }


    capacityCheckSequence +=
      1


    selectedDealerIds.value =
      []


    localError.value =
      ''


    capacityRuleStore.clearResult()

  },
)



watch(
  () => props.visible,
  visible => {

    if(
      !visible
    ){

      resetDialog()

    }

  },
)

</script>



<template>

<div
  v-if="props.visible"
  class="overlay"
  @click.self="handleClose"
>

  <div class="dialog">

    <header class="dialog-header">

      <div>

        <h2>
          {{ title }}
        </h2>

        <p>
          選擇經銷商後，系統會即時檢查區域容量。
        </p>

      </div>

      <button
        class="close-button"
        type="button"
        :disabled="submitting"
        @click="handleClose"
      >
        ×
      </button>

    </header>



    <section
      v-if="props.region"
      class="region-info"
    >

      <div>

        <span>
          區域
        </span>

        <strong>
          {{ props.region.name }}
        </strong>

      </div>


      <div>

        <span>
          編號
        </span>

        <strong>
          {{ props.region.code }}
        </strong>

      </div>

    </section>



    

      <section class="dealer-section">

  <DealerRegionCandidateSelector
    v-model="
      selectedDealerIds
    "
    :disabled="
      submitting
      ||
      capacityRuleStore.loading
    "
  />

</section>



    <DealerRegionCapacityRuleAlert
      :result="
        capacityRuleStore.result
      "
      :loading="
        capacityRuleStore.loading
      "
      :error="
        localError
        ||
        capacityRuleStore.error
      "
    />



    <footer>

      <button
        type="button"
        class="secondary-button"
        :disabled="submitting"
        @click="handleClose"
      >
        取消
      </button>


      <button
        type="button"
        class="primary-button"
        :disabled="!canConfirm"
        @click="handleConfirm"
      >
        {{
          submitting
            ? '提交中...'
            : capacityRuleStore.loading
              ? '容量檢查中...'
              : '確認指派'
        }}
      </button>

    </footer>

  </div>

</div>

</template>



<style scoped>

.overlay {

  position:
    fixed;

  z-index:
    1000;

  inset:
    0;

  display:
    flex;

  align-items:
    center;

  justify-content:
    center;

  padding:
    24px;

  background:
    rgba(16, 24, 40, .52);

}


.dialog {

  width:
    min(620px, 100%);

  max-height:
    calc(100vh - 48px);

  overflow-y:
    auto;

  padding:
    24px;

  background:
    white;

  border-radius:
    18px;

  box-shadow:
    0 24px 48px
    rgba(16, 24, 40, .18);

}


.dialog-header {

  display:
    flex;

  align-items:
    flex-start;

  justify-content:
    space-between;

  gap:
    20px;

}


.dialog-header h2 {

  margin:
    0;

  color:
    #101828;

}


.dialog-header p {

  margin:
    8px 0 0;

  color:
    #667085;

  font-size:
    14px;

}


.close-button {

  width:
    36px;

  height:
    36px;

  padding:
    0;

  color:
    #667085;

  font-size:
    24px;

  line-height:
    1;

  background:
    transparent;

  border:
    0;

}


.region-info {

  display:
    grid;

  grid-template-columns:
    repeat(
      2,
      minmax(0, 1fr)
    );

  gap:
    12px;

  margin:
    20px 0;

  padding:
    16px;

  background:
    #f9fafb;

  border:
    1px solid #eaecf0;

  border-radius:
    12px;

}


.region-info div {

  display:
    flex;

  flex-direction:
    column;

  gap:
    5px;

}


.region-info span {

  color:
    #667085;

  font-size:
    12px;

}


.region-info strong {

  color:
    #101828;

}


.dealer-section {

  margin-bottom:
    18px;

}


.section-title {

  display:
    flex;

  align-items:
    center;

  justify-content:
    space-between;

  gap:
    16px;

  margin-bottom:
    12px;

}


.section-title h3 {

  margin:
    0;

  color:
    #101828;

}


.section-title span {

  color:
    #667085;

  font-size:
    13px;

}


.dealer-list {

  display:
    flex;

  flex-direction:
    column;

  gap:
    10px;

}


.dealer-item {

  display:
    flex;

  align-items:
    center;

  gap:
    12px;

  padding:
    14px;

  border:
    1px solid #d0d5dd;

  border-radius:
    12px;

  cursor:
    pointer;

  transition:
    border-color .2s,
    background .2s;

}


.dealer-item.selected {

  border-color:
    #344054;

  background:
    #f9fafb;

}


.dealer-content {

  display:
    flex;

  flex-direction:
    column;

  gap:
    4px;

}


.dealer-content strong {

  color:
    #101828;

}


.dealer-content small {

  color:
    #667085;

}


footer {

  display:
    flex;

  justify-content:
    flex-end;

  gap:
    12px;

  margin-top:
    24px;

}


button {

  padding:
    9px 16px;

  border:
    1px solid #d0d5dd;

  border-radius:
    8px;

  cursor:
    pointer;

}


button:disabled {

  cursor:
    not-allowed;

  opacity:
    .55;

}


.secondary-button {

  color:
    #344054;

  background:
    white;

}


.primary-button {

  color:
    white;

  background:
    #101828;

  border-color:
    #101828;

}


@media (
  max-width: 600px
) {

  .overlay {

    align-items:
      flex-end;

    padding:
      0;

  }


  .dialog {

    width:
      100%;

    max-height:
      92vh;

    border-radius:
      18px 18px 0 0;

  }


  .region-info {

    grid-template-columns:
      1fr;

  }

}

</style>