<script setup lang="ts">

import {
  reactive,
  ref,
} from 'vue'


import {
  useRouter,
} from 'vue-router'


import AdminLayout
from '../../layouts/AdminLayout.vue'


import DealerMemberSelector
from '../../components/dealer/DealerMemberSelector.vue'


import {
  useDealerStore,
} from '../../stores/dealer'


import type {
  DealerCreateForm,
  DealerCreateRequest,
} from '../../types/dealer'


import type {
  MemberListItem,
} from '../../types/member'



const router =
  useRouter()


const store =
  useDealerStore()


const submitted =
  ref(false)


const localError =
  ref('')



const form =
reactive<DealerCreateForm>({

  memberId:
    '',

  /*
   * 經銷商編號不再由前端產生。
   * 建立時保持空字串，
   * 交由 PostgreSQL Trigger 自動產號。
   */

  dealerNo:
    '',

  name:
    '',

  phone:
    '',

  email:
    '',

  market:
    'taiwan',

  level:
    'normal',

  status:
    'pending',

  regionId:
    '',

  directCount:
    0,

  teamCount:
    0,

  teamSales:
    0,

  totalCommission:
    0,

  remark:
    '',

})



function normalizeNumber(
  value: unknown,
): number {

  const numberValue =
    Number(value)


  if(
    !Number.isFinite(
      numberValue,
    )
  ){

    return 0

  }


  return Math.max(
    numberValue,
    0,
  )

}



// =================================
// Member Select
// =================================

function handleMemberSelect(
  member:
    MemberListItem,
){

  form.memberId =
    member.id


  form.dealerNo =
    ''


  form.name =
    member.name


  form.phone =
    member.phone
    ??
    ''


  form.email =
    member.email
    ??
    ''


  localError.value =
    ''


  store.clearCreateResult()

}



// =================================
// Member Clear
// =================================

function handleMemberClear(){

  form.memberId =
    ''


  form.dealerNo =
    ''


  form.name =
    ''


  form.phone =
    ''


  form.email =
    ''


  localError.value =
    ''


  store.clearCreateResult()

}



// =================================
// Form Validation
// =================================

function validateForm():
  boolean {

  localError.value =
    ''


  if(
    !form.memberId.trim()
  ){

    localError.value =
      '請先搜尋並選擇一位會員。'

    return false

  }


  /*
   * dealerNo 不再進行必填驗證。
   * 建立時由資料庫 Trigger 自動產生。
   */


  if(
    !form.name.trim()
  ){

    localError.value =
      '選擇的會員缺少姓名資料。'

    return false

  }


  if(
    form.email.trim()
    &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/
      .test(
        form.email.trim(),
      )
  ){

    localError.value =
      '電子信箱格式不正確。'

    return false

  }


  return true

}



// =================================
// Submit
// =================================

async function handleSubmit():
  Promise<void> {

  submitted.value =
    true


  localError.value =
    ''


  store.clearCreateResult()


  if(
    !validateForm()
  ){

    return

  }


  const payload:
    DealerCreateRequest = {

      memberId:
        form.memberId.trim(),

      /*
       * 傳入空字串，
       * createDealer API 會轉為 null，
       * 再由資料庫 Trigger 產生正式編號。
       */

      dealerNo:
        '',

      name:
        form.name.trim(),

      phone:
        form.phone.trim()
        ||
        null,

      email:
        form.email.trim()
          .toLowerCase()
        ||
        null,

      market:
        form.market,

      level:
        form.level,

      status:
        form.status,

      regionId:
        form.regionId.trim()
        ||
        null,

      directCount:
        normalizeNumber(
          form.directCount,
        ),

      teamCount:
        normalizeNumber(
          form.teamCount,
        ),

      teamSales:
        normalizeNumber(
          form.teamSales,
        ),

      totalCommission:
        normalizeNumber(
          form.totalCommission,
        ),

      remark:
        form.remark.trim()
        ||
        null,

    }


  const dealer =
    await store.createDealerRecord(
      payload,
    )


  if(
    !dealer
  ){

    localError.value =
      store.createError
      ??
      '經銷商建立失敗。'

    return

  }


  await router.push({

    name:
      'dealer-detail',

    params: {

      id:
        dealer.id,

    },

  })

}



// =================================
// Back
// =================================

async function handleBack():
  Promise<void> {

  store.clearCreateResult()


  await router.push({

    name:
      'dealer-list',

  })

}

</script>


<template>

<AdminLayout>

  <div class="dealer-create-page">

    <section class="page-header">

      <div>

        <p class="page-eyebrow">
          DEALER ERP
        </p>

        <h1>
          新增經銷商
        </h1>

        <p class="page-description">
          搜尋既有會員，建立經銷商身分並設定市場、等級與初始狀態。
        </p>

      </div>


      <button
        type="button"
        class="secondary-button"
        :disabled="
          store.createLoading
        "
        @click="handleBack"
      >
        返回列表
      </button>

    </section>


    <div
      v-if="
        localError
        ||
        store.createError
      "
      class="error-panel"
      role="alert"
    >

      {{
        localError
        ||
        store.createError
      }}

    </div>


    <form
      class="form-card"
      @submit.prevent="handleSubmit"
    >

      <!-- ============================= -->
      <!-- 基本資料 -->
      <!-- ============================= -->

      <section class="form-section">

        <div class="section-heading">

          <div>

            <h2>
              基本資料
            </h2>

            <p>
              搜尋既有會員並建立經銷商關聯。
            </p>

          </div>

        </div>


        <DealerMemberSelector
          v-model="form.memberId"
          :disabled="
            store.createLoading
          "
          @select="
            handleMemberSelect
          "
          @clear="
            handleMemberClear
          "
        />


        <div class="form-grid member-form-grid">

          <label class="field">

            <span>
              經銷商編號
            </span>

            <input
              type="text"
              value="由系統建立後自動產生"
              readonly
              disabled
            >

            <small>
              系統將透過資料庫 Sequence 自動產生正式編號，例如 DEA-100002。
            </small>

          </label>


          <label class="field">

            <span>
              經銷商姓名
              <b>*</b>
            </span>

            <input
              v-model="form.name"
              type="text"
              autocomplete="name"
              placeholder="選擇會員後自動帶入"
              readonly
              :disabled="
                store.createLoading
              "
            >

          </label>


          <label class="field">

            <span>
              手機號碼
            </span>

            <input
              v-model="form.phone"
              type="tel"
              autocomplete="tel"
              placeholder="選擇會員後自動帶入"
              readonly
              :disabled="
                store.createLoading
              "
            >

          </label>


          <label class="field">

            <span>
              電子信箱
            </span>

            <input
              v-model="form.email"
              type="email"
              autocomplete="email"
              placeholder="選擇會員後自動帶入"
              readonly
              :disabled="
                store.createLoading
              "
            >

          </label>

        </div>

      </section>


      <!-- ============================= -->
      <!-- 經銷設定 -->
      <!-- ============================= -->

      <section class="form-section">

        <div class="section-heading">

          <div>

            <h2>
              經銷設定
            </h2>

            <p>
              設定市場、經銷等級與初始帳號狀態。
            </p>

          </div>

        </div>


        <div class="form-grid form-grid-three">

          <label class="field">

            <span>
              所屬市場
              <b>*</b>
            </span>

            <select
              v-model="form.market"
              :disabled="
                store.createLoading
              "
            >

              <option value="taiwan">
                台灣市場
              </option>

              <option value="china">
                中國市場
              </option>

              <option value="cross_border">
                跨境市場
              </option>

            </select>

          </label>


          <label class="field">

            <span>
              經銷等級
              <b>*</b>
            </span>

            <select
              v-model="form.level"
              :disabled="
                store.createLoading
              "
            >

              <option value="normal">
                普通經銷商
              </option>

              <option value="star_1">
                一星經銷商
              </option>

              <option value="star_2">
                二星經銷商
              </option>

              <option value="star_3">
                三星經銷商
              </option>

              <option value="star_4">
                四星經銷商
              </option>

              <option value="star_5">
                五星經銷商
              </option>

              <option value="star_6">
                六星經銷商
              </option>

              <option value="star_7">
                七星經銷商
              </option>

            </select>

          </label>


          <label class="field">

            <span>
              帳號狀態
              <b>*</b>
            </span>

            <select
              v-model="form.status"
              :disabled="
                store.createLoading
              "
            >

              <option value="pending">
                待審核
              </option>

              <option value="approved">
                已通過
              </option>

              <option value="active">
                正常啟用
              </option>

              <option value="suspended">
                已暫停
              </option>

              <option value="disabled">
                已停用
              </option>

            </select>

          </label>


          <label class="field field-full">

            <span>
              區域 ID
            </span>

            <input
              v-model="form.regionId"
              type="text"
              autocomplete="off"
              placeholder="建議先留空，建立後再到區域指派管理設定"
              :disabled="
                store.createLoading
              "
            >

            <small>
              區域關係建議統一由「區域指派管理」建立。
            </small>

          </label>

        </div>

      </section>


      <!-- ============================= -->
      <!-- 初始業績 -->
      <!-- ============================= -->

      <section class="form-section">

        <div class="section-heading">

          <div>

            <h2>
              初始業績
            </h2>

            <p>
              新增時通常保持為 0，後續由訂單及團隊系統統計。
            </p>

          </div>

        </div>


        <div class="form-grid form-grid-four">

          <label class="field">

            <span>
              直推人數
            </span>

            <input
              v-model.number="
                form.directCount
              "
              type="number"
              min="0"
              step="1"
              :disabled="
                store.createLoading
              "
            >

          </label>


          <label class="field">

            <span>
              團隊人數
            </span>

            <input
              v-model.number="
                form.teamCount
              "
              type="number"
              min="0"
              step="1"
              :disabled="
                store.createLoading
              "
            >

          </label>


          <label class="field">

            <span>
              團隊業績
            </span>

            <input
              v-model.number="
                form.teamSales
              "
              type="number"
              min="0"
              step="1"
              :disabled="
                store.createLoading
              "
            >

          </label>


          <label class="field">

            <span>
              累計佣金
            </span>

            <input
              v-model.number="
                form.totalCommission
              "
              type="number"
              min="0"
              step="1"
              :disabled="
                store.createLoading
              "
            >

          </label>

        </div>

      </section>


      <!-- ============================= -->
      <!-- 備註 -->
      <!-- ============================= -->

      <section class="form-section">

        <div class="section-heading">

          <div>

            <h2>
              備註
            </h2>

            <p>
              可記錄申請來源、負責人或其他補充資訊。
            </p>

          </div>

        </div>


        <label class="field">

          <textarea
            v-model="form.remark"
            rows="5"
            maxlength="1000"
            placeholder="請輸入備註"
            :disabled="
              store.createLoading
            "
          />

          <small class="character-count">
            {{ form.remark.length }} / 1000
          </small>

        </label>

      </section>


      <footer class="form-actions">

        <button
          type="button"
          class="secondary-button"
          :disabled="
            store.createLoading
          "
          @click="handleBack"
        >
          取消
        </button>


        <button
          type="submit"
          class="primary-button"
          :disabled="
            store.createLoading
          "
        >

          {{
            store.createLoading
              ? '建立中...'
              : '建立經銷商'
          }}

        </button>

      </footer>

    </form>

  </div>

</AdminLayout>

</template>


<style scoped>

.dealer-create-page {

  display:
    flex;

  flex-direction:
    column;

  gap:
    24px;

}


.page-header {

  display:
    flex;

  align-items:
    flex-start;

  justify-content:
    space-between;

  gap:
    24px;

}


.page-header h1 {

  margin:
    4px 0 8px;

  color:
    #0f172a;

  font-size:
    34px;

}


.page-eyebrow {

  margin:
    0;

  color:
    #3157d6;

  font-size:
    13px;

  font-weight:
    800;

  letter-spacing:
    .12em;

}


.page-description {

  margin:
    0;

  color:
    #64748b;

  line-height:
    1.7;

}


.error-panel {

  padding:
    15px 17px;

  color:
    #b42318;

  background:
    #fef3f2;

  border:
    1px solid #fecdca;

  border-radius:
    12px;

  font-weight:
    700;

}


.form-card {

  overflow:
    hidden;

  background:
    white;

  border:
    1px solid #e5e7eb;

  border-radius:
    18px;

  box-shadow:
    0 10px 25px
    rgba(15, 23, 42, .05);

}


.form-section {

  padding:
    26px;

  border-bottom:
    1px solid #eef2f7;

}


.section-heading {

  display:
    flex;

  justify-content:
    space-between;

  gap:
    20px;

  margin-bottom:
    20px;

}


.section-heading h2 {

  margin:
    0 0 6px;

  color:
    #0f172a;

  font-size:
    19px;

}


.section-heading p {

  margin:
    0;

  color:
    #64748b;

  font-size:
    14px;

}


.member-form-grid {

  margin-top:
    20px;

}


.form-grid {

  display:
    grid;

  grid-template-columns:
    repeat(
      2,
      minmax(0, 1fr)
    );

  gap:
    18px;

}


.form-grid-three {

  grid-template-columns:
    repeat(
      3,
      minmax(0, 1fr)
    );

}


.form-grid-four {

  grid-template-columns:
    repeat(
      4,
      minmax(0, 1fr)
    );

}


.field {

  display:
    flex;

  min-width:
    0;

  flex-direction:
    column;

  gap:
    8px;

}


.field-full {

  grid-column:
    1 / -1;

}


.field > span {

  color:
    #344054;

  font-size:
    14px;

  font-weight:
    700;

}


.field b {

  color:
    #d92d20;

}


.field input,
.field select,
.field textarea {

  width:
    100%;

  box-sizing:
    border-box;

  padding:
    11px 13px;

  color:
    #101828;

  background:
    white;

  border:
    1px solid #d0d5dd;

  border-radius:
    10px;

  outline:
    none;

  transition:
    border-color .2s,
    box-shadow .2s;

}


.field input,
.field select {

  min-height:
    44px;

}


.field textarea {

  resize:
    vertical;

}


.field input:focus,
.field select:focus,
.field textarea:focus {

  border-color:
    #3157d6;

  box-shadow:
    0 0 0 3px
    rgba(49, 87, 214, .12);

}


.field input:read-only {

  color:
    #475569;

  background:
    #f8fafc;

}


.field input:disabled,
.field select:disabled,
.field textarea:disabled {

  cursor:
    not-allowed;

  background:
    #f8fafc;

  opacity:
    .75;

}


.field small {

  color:
    #667085;

  font-size:
    12px;

  line-height:
    1.5;

}


.character-count {

  align-self:
    flex-end;

}


.form-actions {

  display:
    flex;

  justify-content:
    flex-end;

  gap:
    12px;

  padding:
    22px 26px;

  background:
    #f8fafc;

}


button {

  min-height:
    42px;

  padding:
    10px 17px;

  border:
    1px solid #d0d5dd;

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
    #3157d6;

  border-color:
    #3157d6;

}


@media (
  max-width: 1100px
) {

  .form-grid-three,
  .form-grid-four {

    grid-template-columns:
      repeat(
        2,
        minmax(0, 1fr)
      );

  }

}


@media (
  max-width: 700px
) {

  .page-header {

    flex-direction:
      column;

  }


  .form-grid,
  .form-grid-three,
  .form-grid-four {

    grid-template-columns:
      1fr;

  }


  .field-full {

    grid-column:
      auto;

  }


  .form-actions {

    flex-direction:
      column-reverse;

  }


  .form-actions button {

    width:
      100%;

  }

}

</style>