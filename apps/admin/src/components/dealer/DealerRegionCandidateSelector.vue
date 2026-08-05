<script setup lang="ts">

import {
  computed,
  onMounted,
  ref,
  watch,
} from 'vue'


import {
  useDealerRegionCandidateStore,
} from '../../stores/dealer-region-candidate'


import type {
  DealerRegionCandidate,
} from '../../types/dealer-region-candidate'



const props =
defineProps<{

  modelValue:
    string[]

  disabled?:
    boolean

}>()



const emit =
defineEmits<{

  'update:modelValue': [
    dealerIds: string[],
  ]

}>()



const candidateStore =
  useDealerRegionCandidateStore()


const searchKeyword =
  ref('')


const selectedDealerIds =
computed({

  get(){

    return props.modelValue

  },

  set(value: string[]){

    emit(
      'update:modelValue',
      value,
    )

  },

})



const allCurrentPageSelected =
computed(
  () => {

    if(
      candidateStore.candidates.length === 0
    ){

      return false

    }


    return candidateStore.candidates.every(
      candidate =>
        selectedDealerIds.value.includes(
          candidate.id,
        ),
    )

  },
)



const selectedCount =
computed(
  () =>
    selectedDealerIds.value.length,
)



function isSelected(
  dealerId: string,
): boolean {

  return selectedDealerIds.value.includes(
    dealerId,
  )

}



function toggleCandidate(
  candidate:
    DealerRegionCandidate,
){

  if(
    props.disabled
  ){

    return

  }


  const nextValue =
    [
      ...selectedDealerIds.value,
    ]


  const index =
    nextValue.indexOf(
      candidate.id,
    )


  if(
    index >= 0
  ){

    nextValue.splice(
      index,
      1,
    )

  }else{

    nextValue.push(
      candidate.id,
    )

  }


  selectedDealerIds.value =
    nextValue

}



function toggleCurrentPage(){

  if(
    props.disabled
  ){

    return

  }


  const currentPageIds =
    candidateStore.candidates.map(
      candidate =>
        candidate.id,
    )


  if(
    allCurrentPageSelected.value
  ){

    const currentPageIdSet =
      new Set(
        currentPageIds,
      )


    selectedDealerIds.value =
      selectedDealerIds.value.filter(
        dealerId =>
          !currentPageIdSet.has(
            dealerId,
          ),
      )


    return

  }


  selectedDealerIds.value =
    Array.from(
      new Set([

        ...selectedDealerIds.value,

        ...currentPageIds,

      ]),
    )

}



async function handleSearch(){

  await candidateStore.searchCandidates(
    searchKeyword.value,
  )

}



async function clearSearch(){

  searchKeyword.value =
    ''


  await candidateStore.searchCandidates(
    '',
  )

}



async function handleStatusChange(
  event: Event,
){

  const target =
    event.target as HTMLSelectElement


  await candidateStore.setStatusFilter(
    target.value,
  )

}



async function handleUnassignedChange(
  event: Event,
){

  const target =
    event.target as HTMLInputElement


  await candidateStore.setUnassignedOnly(
    target.checked,
  )

}



async function refreshCandidates(){

  await candidateStore.fetchCandidates()

}



watch(
  () => props.disabled,
  disabled => {

    if(
      disabled
    ){

      return

    }

  },
)



onMounted(
  async() => {

    searchKeyword.value =
      candidateStore.keyword


    await candidateStore.fetchCandidates()

  },
)

</script>


<template>

<div class="candidate-selector">


  <div class="selector-header">

    <div>

      <h3>
        選擇經銷商
      </h3>

      <p>
        從正式經銷商資料中選擇可指派人員。
      </p>

    </div>


    <span class="selected-count">

      已選擇

      <strong>
        {{ selectedCount }}
      </strong>

      位

    </span>

  </div>


  <div class="filter-panel">

    <div class="search-group">

      <input
        v-model="searchKeyword"
        type="search"
        placeholder="搜尋姓名、手機、Email、經銷商編號"
        :disabled="disabled || candidateStore.loading"
        @keyup.enter="handleSearch"
      >


      <button
        type="button"
        :disabled="disabled || candidateStore.loading"
        @click="handleSearch"
      >
        搜尋
      </button>


      <button
        type="button"
        :disabled="
          disabled
          ||
          candidateStore.loading
          ||
          !searchKeyword
        "
        @click="clearSearch"
      >
        清除
      </button>

    </div>


    <div class="filter-row">

      <label>

        狀態

        <select
          :value="candidateStore.statusFilter"
          :disabled="disabled || candidateStore.loading"
          @change="handleStatusChange"
        >

          <option value="">
            全部狀態
          </option>

          <option value="active">
            已啟用
          </option>

          <option value="approved">
            已通過
          </option>

          <option value="pending">
            待審核
          </option>

          <option value="suspended">
            已暫停
          </option>

          <option value="disabled">
            已停用
          </option>

        </select>

      </label>


      <label class="checkbox-filter">

        <input
          type="checkbox"
          :checked="candidateStore.unassignedOnly"
          :disabled="disabled || candidateStore.loading"
          @change="handleUnassignedChange"
        >

        只顯示未指派經銷商

      </label>


      <button
        type="button"
        :disabled="disabled || candidateStore.loading"
        @click="refreshCandidates"
      >
        重新整理
      </button>

    </div>

  </div>


  <div
    v-if="candidateStore.error"
    class="error-message"
  >

    {{ candidateStore.error }}

  </div>


  <div
    v-if="candidateStore.loading"
    class="state-card"
  >

    正在載入可指派經銷商...

  </div>


  <template v-else>


    <div class="list-toolbar">

      <label>

        <input
          type="checkbox"
          :checked="allCurrentPageSelected"
          :disabled="
            disabled
            ||
            candidateStore.candidates.length === 0
          "
          @change="toggleCurrentPage"
        >

        選擇目前頁面全部經銷商

      </label>


      <span>

        共

        {{ candidateStore.total }}

        位候選經銷商

      </span>

    </div>


    <div
      v-if="candidateStore.candidates.length > 0"
      class="candidate-list"
    >

      <label
        v-for="candidate in candidateStore.candidates"
        :key="candidate.id"
        class="candidate-item"
        :class="{
          selected:
            isSelected(
              candidate.id,
            ),
        }"
      >

        <input
          type="checkbox"
          :checked="
            isSelected(
              candidate.id,
            )
          "
          :disabled="disabled"
          @change="
            toggleCandidate(
              candidate,
            )
          "
        >


        <span class="candidate-main">

          <strong>
            {{ candidate.name }}
          </strong>

          <small>

            {{
              candidate.dealerCode
              || '未設定經銷商編號'
            }}

          </small>

        </span>


        <span class="candidate-contact">

          <span>
            {{
              candidate.phone
              || '未設定手機'
            }}
          </span>

          <small>
            {{
              candidate.email
              || '未設定 Email'
            }}
          </small>

        </span>


        <span class="status-badge">

          {{ candidate.status }}

        </span>


        <span
          v-if="candidate.currentRegionName"
          class="region-badge"
        >

          {{ candidate.currentRegionName }}

        </span>

      </label>

    </div>


    <div
      v-else
      class="empty-state"
    >

      目前沒有符合條件的候選經銷商。

    </div>


    <div class="pagination">

      <button
        type="button"
        :disabled="
          disabled
          ||
          candidateStore.loading
          ||
          !candidateStore.hasPreviousPage
        "
        @click="candidateStore.previousPage()"
      >
        上一頁
      </button>


      <span>

        第

        {{ candidateStore.page }}

        頁

        ／

        {{
          candidateStore.totalPages || 1
        }}

        頁

      </span>


      <button
        type="button"
        :disabled="
          disabled
          ||
          candidateStore.loading
          ||
          !candidateStore.hasNextPage
        "
        @click="candidateStore.nextPage()"
      >
        下一頁
      </button>

    </div>

  </template>

</div>

</template>


<style scoped>

.candidate-selector {

  display:
    flex;

  flex-direction:
    column;

  gap:
    16px;

}


.selector-header {

  display:
    flex;

  align-items:
    flex-start;

  justify-content:
    space-between;

  gap:
    16px;

}


.selector-header h3 {

  margin:
    0;

  color:
    #101828;

}


.selector-header p {

  margin:
    6px 0 0;

  color:
    #667085;

  font-size:
    14px;

}


.selected-count {

  padding:
    7px 12px;

  color:
    #344054;

  white-space:
    nowrap;

  background:
    #f2f4f7;

  border-radius:
    999px;

  font-size:
    13px;

}


.filter-panel {

  display:
    flex;

  flex-direction:
    column;

  gap:
    12px;

  padding:
    14px;

  background:
    #f9fafb;

  border:
    1px solid #eaecf0;

  border-radius:
    12px;

}


.search-group {

  display:
    grid;

  grid-template-columns:
    minmax(0, 1fr)
    auto
    auto;

  gap:
    8px;

}


.search-group input,
.filter-row select {

  min-width:
    0;

  padding:
    9px 11px;

  border:
    1px solid #d0d5dd;

  border-radius:
    8px;

  background:
    white;

}


.filter-row {

  display:
    flex;

  align-items:
    center;

  flex-wrap:
    wrap;

  gap:
    14px;

}


.filter-row label {

  display:
    flex;

  align-items:
    center;

  gap:
    8px;

  color:
    #475467;

  font-size:
    13px;

}


.checkbox-filter {

  margin-right:
    auto;

}


.list-toolbar {

  display:
    flex;

  align-items:
    center;

  justify-content:
    space-between;

  gap:
    16px;

  color:
    #667085;

  font-size:
    13px;

}


.list-toolbar label {

  display:
    flex;

  align-items:
    center;

  gap:
    8px;

}


.candidate-list {

  display:
    flex;

  flex-direction:
    column;

  gap:
    9px;

  max-height:
    340px;

  overflow-y:
    auto;

}


.candidate-item {

  display:
    grid;

  grid-template-columns:
    auto
    minmax(130px, 1fr)
    minmax(170px, 1.4fr)
    auto
    auto;

  align-items:
    center;

  gap:
    12px;

  padding:
    13px;

  border:
    1px solid #d0d5dd;

  border-radius:
    11px;

  cursor:
    pointer;

}


.candidate-item.selected {

  border-color:
    #344054;

  background:
    #f9fafb;

}


.candidate-main,
.candidate-contact {

  display:
    flex;

  min-width:
    0;

  flex-direction:
    column;

  gap:
    4px;

}


.candidate-main strong {

  overflow:
    hidden;

  color:
    #101828;

  text-overflow:
    ellipsis;

  white-space:
    nowrap;

}


.candidate-main small,
.candidate-contact small,
.candidate-contact span {

  overflow:
    hidden;

  color:
    #667085;

  font-size:
    12px;

  text-overflow:
    ellipsis;

  white-space:
    nowrap;

}


.status-badge,
.region-badge {

  padding:
    5px 9px;

  white-space:
    nowrap;

  border-radius:
    999px;

  font-size:
    11px;

}


.status-badge {

  color:
    #067647;

  background:
    #ecfdf3;

}


.region-badge {

  color:
    #344054;

  background:
    #f2f4f7;

}


.state-card,
.empty-state,
.error-message {

  padding:
    18px;

  text-align:
    center;

  border-radius:
    12px;

}


.state-card,
.empty-state {

  color:
    #667085;

  background:
    #f9fafb;

}


.error-message {

  color:
    #b42318;

  background:
    #fef3f2;

  border:
    1px solid #fecdca;

}


.pagination {

  display:
    flex;

  align-items:
    center;

  justify-content:
    center;

  gap:
    14px;

}


button {

  padding:
    8px 13px;

  border:
    1px solid #d0d5dd;

  border-radius:
    8px;

  background:
    white;

  cursor:
    pointer;

}


button:disabled {

  cursor:
    not-allowed;

  opacity:
    .55;

}


@media (
  max-width: 700px
) {

  .search-group {

    grid-template-columns:
      1fr;

  }


  .candidate-item {

    grid-template-columns:
      auto
      minmax(0, 1fr);

  }


  .candidate-contact,
  .status-badge,
  .region-badge {

    grid-column:
      2;

  }

}

</style>