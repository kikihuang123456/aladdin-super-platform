<script setup lang="ts">

import {
  computed,
  ref,
} from 'vue'


import {
  searchMembersForDealer,
} from '../../api/member'


import type {
  MemberListItem,
} from '../../types/member'



const props =
defineProps<{

  modelValue:
    string

  disabled?:
    boolean

}>()



const emit =
defineEmits<{

  'update:modelValue': [
    memberId: string,
  ]

  select: [
    member: MemberListItem,
  ]

  clear: []

}>()



const keyword =
  ref('')


const members =
  ref<MemberListItem[]>([])


const selectedMember =
  ref<MemberListItem | null>(null)


const loading =
  ref(false)


const error =
  ref<string | null>(null)


const message =
  ref('')



const hasResults =
computed(
  () =>
    members.value.length > 0,
)



const canSearch =
computed(
  () =>
    !props.disabled
    &&
    !loading.value
    &&
    keyword.value.trim().length > 0,
)



async function handleSearch(){

  if(
    !canSearch.value
  ){

    return

  }


  loading.value =
    true


  error.value =
    null


  message.value =
    ''


  members.value =
    []


  try {

    const response =
      await searchMembersForDealer(
        keyword.value.trim(),
      )


    if(
      !response.success
    ){

      error.value =
        response.error
        ??
        response.message

      return

    }


    members.value =
      response.members


    message.value =
      response.message


    /*
     * 搜尋結果只有一位時，
     * 直接完成會員選取。
     */

    if(
      response.members.length === 1
    ){

      handleSelect(
        response.members[0],
      )

    }

  }catch(
    errorValue
  ){

    error.value =
      errorValue instanceof Error
        ? errorValue.message
        : '會員搜尋失敗。'

  }finally{

    loading.value =
      false

  }

}



function handleSelect(
  member:
    MemberListItem,
){

  selectedMember.value =
    member


  keyword.value =
    member.name
    ||
    member.memberCode
    ||
    member.email
    ||
    member.phone
    ||
    ''


  members.value =
    []


  error.value =
    null


  message.value =
    `已選擇會員：${member.name}`


  emit(
    'update:modelValue',
    member.id,
  )


  emit(
    'select',
    member,
  )

}


function handleClear(){

  keyword.value =
    ''


  members.value =
    []


  selectedMember.value =
    null


  error.value =
    null


  message.value =
    ''


  emit(
    'update:modelValue',
    '',
  )


  emit(
    'clear',
  )

}

</script>


<template>

<div class="member-selector">

  <div class="selector-header">

    <div>

      <h3>
        選擇會員
      </h3>

      <p>
        搜尋既有會員並建立經銷商關聯。
      </p>

    </div>


    <button
      v-if="
        selectedMember
        ||
        modelValue
      "
      type="button"
      class="clear-button"
      :disabled="
        disabled
        ||
        loading
      "
      @click="handleClear"
    >
      清除選擇
    </button>

  </div>


  <div class="search-row">

    <input
      v-model="keyword"
      type="search"
      autocomplete="off"
      placeholder="輸入會員姓名、手機、Email 或會員編號"
      :disabled="
        disabled
        ||
        loading
      "
      @keyup.enter="handleSearch"
    >


    <button
      type="button"
      class="search-button"
      :disabled="!canSearch"
      @click="handleSearch"
    >

      {{
        loading
          ? '搜尋中...'
          : '搜尋會員'
      }}

    </button>

  </div>


  <div
    v-if="error"
    class="error-message"
  >
    {{ error }}
  </div>


  <div
    v-else-if="
      message
      &&
      !hasResults
    "
    class="empty-message"
  >
    {{ message }}
  </div>


  <div
    v-if="selectedMember"
    class="selected-card"
  >

    <span class="selected-label">
      已選擇會員
    </span>


    <div class="member-summary">

      <div class="member-avatar">

        {{
          selectedMember.name
            .trim()
            .slice(0, 1)
          ||
          '?'
        }}

      </div>


      <div class="member-main">

        <strong>
          {{ selectedMember.name }}
        </strong>

        <span>
          {{ selectedMember.memberCode || '未設定會員編號' }}
        </span>

      </div>


      <div class="member-contact">

        <span>
          {{ selectedMember.phone || '未設定手機' }}
        </span>

        <span>
          {{ selectedMember.email || '未設定 Email' }}
        </span>

      </div>

    </div>

  </div>


  <div
    v-if="hasResults"
    class="result-list"
  >

    <button
      v-for="member in members"
      :key="member.id"
      type="button"
      class="member-item"
      :class="{
        selected:
          modelValue === member.id,
      }"
      :disabled="disabled"
      @click="
        handleSelect(
          member,
        )
      "
    >

      <span class="member-avatar">

        {{
          member.name
            .trim()
            .slice(0, 1)
          ||
          '?'
        }}

      </span>


      <span class="member-main">

        <strong>
          {{ member.name }}
        </strong>

        <small>
          {{ member.memberCode || '未設定會員編號' }}
        </small>

      </span>


      <span class="member-contact">

        <span>
          {{ member.phone || '未設定手機' }}
        </span>

        <small>
          {{ member.email || '未設定 Email' }}
        </small>

      </span>


      <span
        class="status-badge"
        :class="
          `status-badge--${member.status}`
        "
      >
        {{ member.status }}
      </span>

    </button>

  </div>

</div>

</template>


<style scoped>

.member-selector {

  display:
    flex;

  flex-direction:
    column;

  gap:
    16px;

  padding:
    20px;

  background:
    #f8fafc;

  border:
    1px solid #e2e8f0;

  border-radius:
    14px;

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
    0 0 5px;

  color:
    #0f172a;

  font-size:
    17px;

}


.selector-header p {

  margin:
    0;

  color:
    #64748b;

  font-size:
    13px;

}


.search-row {

  display:
    grid;

  grid-template-columns:
    minmax(0, 1fr)
    auto;

  gap:
    10px;

}


.search-row input {

  min-height:
    44px;

  padding:
    10px 13px;

  color:
    #0f172a;

  background:
    white;

  border:
    1px solid #cbd5e1;

  border-radius:
    10px;

  outline:
    none;

}


.search-row input:focus {

  border-color:
    #3157d6;

  box-shadow:
    0 0 0 3px
    rgba(49, 87, 214, .12);

}


button {

  min-height:
    40px;

  padding:
    9px 14px;

  border:
    1px solid #cbd5e1;

  border-radius:
    10px;

  cursor:
    pointer;

  font-weight:
    700;

}


button:disabled {

  cursor:
    not-allowed;

  opacity:
    .55;

}


.search-button {

  color:
    white;

  background:
    #3157d6;

  border-color:
    #3157d6;

}


.clear-button {

  color:
    #475569;

  background:
    white;

}


.error-message {

  padding:
    12px 14px;

  color:
    #b42318;

  background:
    #fef3f2;

  border:
    1px solid #fecdca;

  border-radius:
    10px;

}


.empty-message {

  padding:
    18px;

  color:
    #64748b;

  text-align:
    center;

  background:
    white;

  border:
    1px dashed #cbd5e1;

  border-radius:
    10px;

}


.selected-card {

  padding:
    15px;

  background:
    #eef2ff;

  border:
    1px solid #c7d2fe;

  border-radius:
    12px;

}


.selected-label {

  display:
    block;

  margin-bottom:
    11px;

  color:
    #4338ca;

  font-size:
    12px;

  font-weight:
    800;

}


.result-list {

  display:
    flex;

  max-height:
    340px;

  overflow-y:
    auto;

  flex-direction:
    column;

  gap:
    9px;

}


.member-item {

  display:
    grid;

  grid-template-columns:
    auto
    minmax(140px, .8fr)
    minmax(200px, 1fr)
    auto;

  align-items:
    center;

  gap:
    12px;

  width:
    100%;

  padding:
    13px;

  color:
    #334155;

  text-align:
    left;

  background:
    white;

  border:
    1px solid #e2e8f0;

}


.member-item.selected {

  border-color:
    #3157d6;

  box-shadow:
    0 0 0 2px
    rgba(49, 87, 214, .1);

}


.member-summary {

  display:
    grid;

  grid-template-columns:
    auto
    minmax(140px, .8fr)
    minmax(200px, 1fr);

  align-items:
    center;

  gap:
    12px;

}


.member-avatar {

  display:
    grid;

  width:
    42px;

  height:
    42px;

  flex-shrink:
    0;

  place-items:
    center;

  color:
    #3157d6;

  background:
    #e0e7ff;

  border-radius:
    12px;

  font-weight:
    800;

}


.member-main,
.member-contact {

  display:
    flex;

  min-width:
    0;

  flex-direction:
    column;

  gap:
    4px;

}


.member-main strong {

  overflow:
    hidden;

  color:
    #0f172a;

  text-overflow:
    ellipsis;

}


.member-main span,
.member-main small,
.member-contact span,
.member-contact small {

  overflow:
    hidden;

  color:
    #64748b;

  font-size:
    12px;

  text-overflow:
    ellipsis;

}


.status-badge {

  padding:
    5px 9px;

  border-radius:
    999px;

  font-size:
    11px;

  font-weight:
    800;

}


.status-badge--active {

  color:
    #15803d;

  background:
    #dcfce7;

}


@media (
  max-width: 700px
) {

  .selector-header,
  .search-row {

    grid-template-columns:
      1fr;

    flex-direction:
      column;

  }


  .member-item,
  .member-summary {

    grid-template-columns:
      auto
      minmax(0, 1fr);

  }


  .member-contact,
  .status-badge {

    grid-column:
      2;

  }

}

</style>