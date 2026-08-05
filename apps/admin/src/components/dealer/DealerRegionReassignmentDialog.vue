<script setup lang="ts">

import {
  computed,
  onMounted,
  ref,
  watch,
} from 'vue'


import type {
  DealerRegion,
} from '../../types/dealer-region'


import type {
  DealerRegionReassignmentRequest,
} from '../../types/dealer-region-reassignment'


import {
  getRegionDealers,
} from '../../api/dealer-region'


import {
  useDealerRegionStore,
} from '../../stores/dealer-region'


import {
  useDealerRegionCapacityRuleStore,
} from '../../stores/dealer-region-capacity-rule'


import DealerRegionCapacityRuleAlert
from './DealerRegionCapacityRuleAlert.vue'



interface RegionDealerMember {

  id?:
    string

  name?:
    string

  phone?:
    string

  member_code?:
    string

}



interface RegionDealerItem {

  id:
    string

  dealer_id:
    string

  region_id:
    string

  status?:
    string

  assigned_at?:
    string

  remark?:
    string | null

  members?:
    RegionDealerMember
    | null

}



const props =
defineProps<{

  visible:
    boolean

  region:
    DealerRegion | null

}>()



const emit =
defineEmits<{

  close: []

  confirm: [
    payload:
      DealerRegionReassignmentRequest,
  ]

}>()



const dealerRegionStore =
  useDealerRegionStore()


const capacityRuleStore =
  useDealerRegionCapacityRuleStore()



const dealers =
  ref<RegionDealerItem[]>([])


const selectedDealerId =
  ref('')


const selectedNextRegionId =
  ref('')


const remark =
  ref('')


const loadingDealers =
  ref(false)


const submitting =
  ref(false)


const error =
  ref<string | null>(null)



let capacityCheckSequence =
  0



const availableTargetRegions =
computed(
  () =>
    dealerRegionStore.regions.filter(
      region =>
        region.id !==
          props.region?.id
        &&
        region.status ===
          'active',
    ),
)



const selectedDealer =
computed(
  () =>
    dealers.value.find(
      dealer =>
        dealer.dealer_id ===
        selectedDealerId.value,
    )
    ??
    null,
)



const selectedNextRegion =
computed(
  () =>
    dealerRegionStore.regions.find(
      region =>
        region.id ===
        selectedNextRegionId.value,
    )
    ??
    null,
)



const canConfirm =
computed(
  () => {

    if(
      submitting.value
      ||
      loadingDealers.value
      ||
      capacityRuleStore.loading
    ){

      return false

    }


    if(
      !selectedDealerId.value
      ||
      !selectedNextRegionId.value
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



function normalizeError(
  errorValue: unknown,
  fallback: string,
): string {

  if(
    errorValue instanceof Error
  ){

    return errorValue.message

  }


  if(
    typeof errorValue === 'object'
    &&
    errorValue !== null
  ){

    const record =
      errorValue as Record<
        string,
        unknown
      >


    if(
      typeof record.message === 'string'
    ){

      return record.message

    }

  }


  return fallback

}



async function loadDealers(){

  if(
    !props.region?.id
  ){

    dealers.value =
      []

    return

  }


  loadingDealers.value =
    true


  error.value =
    null


  try{


    const result =
      await getRegionDealers(
        props.region.id,
      )


    dealers.value =
      (
        result
        ??
        []
      ) as unknown as RegionDealerItem[]


  }catch(errorValue){


    dealers.value =
      []


    error.value =
      normalizeError(
        errorValue,
        '載入目前區域經銷商失敗。',
      )


  }finally{


    loadingDealers.value =
      false

  }

}



async function loadRegions(){

  if(
    dealerRegionStore.regions.length > 0
  ){

    return

  }


  await dealerRegionStore.fetchRegions()


  if(
    dealerRegionStore.error
  ){

    error.value =
      dealerRegionStore.error

  }

}



async function checkTargetCapacity(){

  const currentSequence =
    ++capacityCheckSequence


  error.value =
    null


  if(
    !props.visible
    ||
    !selectedDealerId.value
    ||
    !selectedNextRegionId.value
  ){

    capacityRuleStore.clearResult()

    return

  }


  const result =
    await capacityRuleStore
      .checkAssignmentCapacity({

        regionId:
          selectedNextRegionId.value,

        dealerIds: [
          selectedDealerId.value,
        ],

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

    error.value =
      capacityRuleStore.error
      ??
      '檢查新區域容量失敗。'

  }

}



function resetDialog(){

  capacityCheckSequence +=
    1


  selectedDealerId.value =
    ''


  selectedNextRegionId.value =
    ''


  remark.value =
    ''


  error.value =
    null


  submitting.value =
    false


  capacityRuleStore.clearResult()

}



function handleClose(){

  resetDialog()


  emit(
    'close',
  )

}



async function handleConfirm(){

  error.value =
    null


  if(
    !selectedDealerId.value
  ){

    error.value =
      '請選擇要重新指派的經銷商。'

    return

  }


  if(
    !selectedNextRegionId.value
  ){

    error.value =
      '請選擇新的目標區域。'

    return

  }


  submitting.value =
    true


  const capacityResult =
    await capacityRuleStore
      .checkAssignmentCapacity({

        regionId:
          selectedNextRegionId.value,

        dealerIds: [
          selectedDealerId.value,
        ],

      })


  if(
    !capacityResult
  ){

    error.value =
      capacityRuleStore.error
      ??
      '無法完成新區域容量檢查。'


    submitting.value =
      false

    return

  }


  if(
    !capacityResult.allowed
  ){

    error.value =
      capacityResult.message


    submitting.value =
      false

    return

  }


  emit(
    'confirm',
    {

      dealerId:
        selectedDealerId.value,

      nextRegionId:
        selectedNextRegionId.value,

      remark:
        remark.value.trim()
        ||
        '後台重新指派經銷商區域',

    },
  )


  submitting.value =
    false

}



watch(
  [
    selectedDealerId,
    selectedNextRegionId,
  ],
  async() => {

    await checkTargetCapacity()

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


    resetDialog()


    if(
      props.visible
      &&
      nextRegionId
    ){

      await loadDealers()

    }

  },
)



watch(
  () => props.visible,
  async visible => {

    if(
      !visible
    ){

      resetDialog()

      return

    }


    await Promise.all([

      loadRegions(),

      loadDealers(),

    ])

  },
)



onMounted(
  async() => {

    if(
      !props.visible
    ){

      return

    }


    await Promise.all([

      loadRegions(),

      loadDealers(),

    ])

  },
)

</script>


<template>

<div
  v-if="visible"
  class="dialog-mask"
  @click.self="handleClose"
>

  <div class="dialog">


    <header class="dialog-header">

      <div>

        <h2>
          重新指派經銷商區域
        </h2>

        <p>
          從目前區域選擇經銷商，再指派至新的目標區域。
        </p>

      </div>


      <button
        type="button"
        class="close-button"
        :disabled="submitting"
        @click="handleClose"
      >
        ×
      </button>

    </header>


    <section
      v-if="region"
      class="source-region-card"
    >

      <div>

        <span>
          目前區域
        </span>

        <strong>
          {{ region.name }}
        </strong>

      </div>


      <div>

        <span>
          區域編號
        </span>

        <strong>
          {{ region.code }}
        </strong>

      </div>


      <div>

        <span>
          市場
        </span>

        <strong>
          {{ region.market }}
        </strong>

      </div>

    </section>


    <div
      v-if="error"
      class="error-message"
    >
      {{ error }}
    </div>


    <section class="form-section">

      <label class="field">

        <span>
          選擇經銷商
        </span>


        <select
          v-model="selectedDealerId"
          :disabled="
            loadingDealers
            ||
            submitting
          "
        >

          <option value="">
            請選擇經銷商
          </option>


          <option
            v-for="dealer in dealers"
            :key="dealer.id"
            :value="dealer.dealer_id"
          >

            {{
              dealer.members?.name
              ??
              dealer.dealer_id
            }}

            ｜

            {{
              dealer.members?.member_code
              ??
              '未設定會員編號'
            }}

            ｜

            {{
              dealer.members?.phone
              ??
              '未設定電話'
            }}

          </option>

        </select>


        <small v-if="loadingDealers">
          正在載入目前區域經銷商...
        </small>


        <small
          v-else-if="
            dealers.length === 0
          "
        >
          目前區域沒有可重新指派的經銷商。
        </small>

      </label>


      <div
        v-if="selectedDealer"
        class="selected-dealer-card"
      >

        <div>

          <span>
            經銷商姓名
          </span>

          <strong>
            {{
              selectedDealer.members?.name
              ??
              '未設定'
            }}
          </strong>

        </div>


        <div>

          <span>
            會員編號
          </span>

          <strong>
            {{
              selectedDealer.members?.member_code
              ??
              '未設定'
            }}
          </strong>

        </div>


        <div>

          <span>
            聯絡電話
          </span>

          <strong>
            {{
              selectedDealer.members?.phone
              ??
              '未設定'
            }}
          </strong>

        </div>


        <div>

          <span>
            原指派時間
          </span>

          <strong>
            {{
              selectedDealer.assigned_at
              ??
              '未記錄'
            }}
          </strong>

        </div>

      </div>


      <label class="field">

        <span>
          新目標區域
        </span>


        <select
          v-model="selectedNextRegionId"
          :disabled="
            submitting
            ||
            dealerRegionStore.isLoading
          "
        >

          <option value="">
            請選擇新的目標區域
          </option>


          <option
            v-for="
              targetRegion in
              availableTargetRegions
            "
            :key="targetRegion.id"
            :value="targetRegion.id"
          >

            {{ targetRegion.name }}

            ｜

            {{ targetRegion.code }}

            ｜

            {{ targetRegion.market }}

          </option>

        </select>


        <small
          v-if="
            availableTargetRegions.length === 0
          "
        >
          目前沒有其他已啟用的目標區域。
        </small>

      </label>


      <div
        v-if="selectedNextRegion"
        class="target-region-card"
      >

        <span>
          即將重新指派至
        </span>

        <strong>
          {{ selectedNextRegion.name }}
        </strong>

        <small>
          {{
            selectedNextRegion.code
          }}
          ／
          {{
            selectedNextRegion.market
          }}
        </small>

      </div>


      <DealerRegionCapacityRuleAlert
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


      <label class="field">

        <span>
          重新指派備註
        </span>


        <textarea
          v-model="remark"
          rows="3"
          maxlength="500"
          placeholder="請輸入重新指派原因或備註"
          :disabled="submitting"
        />


        <small>
          {{ remark.length }} / 500
        </small>

      </label>

    </section>


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
            ? '重新指派中...'
            : capacityRuleStore.loading
              ? '容量檢查中...'
              : '確認重新指派'
        }}

      </button>

    </footer>

  </div>

</div>

</template>


<style scoped>

.dialog-mask {

  position:
    fixed;

  z-index:
    1100;

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
    rgba(16, 24, 40, .55);

}


.dialog {

  width:
    min(680px, 100%);

  max-height:
    calc(100vh - 48px);

  overflow-y:
    auto;

  padding:
    26px;

  background:
    white;

  border-radius:
    18px;

  box-shadow:
    0 24px 48px
    rgba(16, 24, 40, .2);

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
    7px 0 0;

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

  background:
    transparent;

  border:
    0;

}


.source-region-card,
.selected-dealer-card {

  display:
    grid;

  grid-template-columns:
    repeat(
      3,
      minmax(0, 1fr)
    );

  gap:
    12px;

  margin-top:
    20px;

  padding:
    15px;

  background:
    #f9fafb;

  border:
    1px solid #eaecf0;

  border-radius:
    12px;

}


.selected-dealer-card {

  grid-template-columns:
    repeat(
      2,
      minmax(0, 1fr)
    );

  margin-top:
    0;

}


.source-region-card div,
.selected-dealer-card div {

  display:
    flex;

  min-width:
    0;

  flex-direction:
    column;

  gap:
    5px;

}


.source-region-card span,
.selected-dealer-card span,
.target-region-card span {

  color:
    #667085;

  font-size:
    12px;

}


.source-region-card strong,
.selected-dealer-card strong {

  overflow-wrap:
    anywhere;

  color:
    #101828;

}


.error-message {

  margin-top:
    16px;

  padding:
    13px;

  color:
    #b42318;

  background:
    #fef3f2;

  border:
    1px solid #fecdca;

  border-radius:
    10px;

}


.form-section {

  display:
    flex;

  flex-direction:
    column;

  gap:
    17px;

  margin-top:
    20px;

}


.field {

  display:
    flex;

  flex-direction:
    column;

  gap:
    7px;

}


.field > span {

  color:
    #344054;

  font-size:
    14px;

  font-weight:
    600;

}


.field select,
.field textarea {

  width:
    100%;

  box-sizing:
    border-box;

  padding:
    10px 12px;

  color:
    #101828;

  background:
    white;

  border:
    1px solid #d0d5dd;

  border-radius:
    9px;

}


.field textarea {

  resize:
    vertical;

}


.field small {

  color:
    #667085;

  font-size:
    12px;

}


.target-region-card {

  display:
    flex;

  flex-direction:
    column;

  gap:
    5px;

  padding:
    14px;

  color:
    #067647;

  background:
    #ecfdf3;

  border:
    1px solid #abefc6;

  border-radius:
    11px;

}


.target-region-card strong {

  color:
    #065f46;

  font-size:
    17px;

}


.target-region-card small {

  color:
    #067647;

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
  max-width: 700px
) {

  .dialog-mask {

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


  .source-region-card,
  .selected-dealer-card {

    grid-template-columns:
      1fr;

  }

}

</style>