<template>
  <AdminLayout>
    <div class="dealer-detail-page">
      <section class="page-header">
        <div>
          <button
            class="back-button"
            type="button"
            @click="handleBack"
          >
            返回經銷商列表
          </button>

          <p class="page-eyebrow">
            DEALER DETAIL
          </p>

          <h1>
            經銷商詳情
          </h1>

          <p class="page-description">
            查看經銷商基本資料、區域、星級、團隊業績、佣金及帳號狀態。
          </p>
        </div>

        <button
          class="refresh-button"
          type="button"
          :disabled="
            store.isLoading ||
            store.isMutating
          "
          @click="handleRefresh"
        >
          重新整理
        </button>
      </section>

      <div
        v-if="store.error"
        class="alert alert--error"
        role="alert"
      >
        <span>
          {{ store.error }}
        </span>

        <button
          type="button"
          @click="store.clearError"
        >
          關閉
        </button>
      </div>

      <div
        v-if="store.mutationMessage"
        class="alert alert--success"
        role="status"
      >
        <span>
          {{ store.mutationMessage }}
        </span>

        <button
          type="button"
          @click="store.clearMutationMessage"
        >
          關閉
        </button>
      </div>

      <section
        v-if="store.isLoading"
        class="state-card"
      >
        正在載入經銷商詳情...
      </section>

      <section
        v-else-if="!dealer"
        class="state-card"
      >
        找不到經銷商資料
      </section>

      <template v-else>
        <section class="profile-card">
          <div class="profile-main">
            <span class="dealer-avatar">
              {{ dealerInitial(dealer.name) }}
            </span>

            <div class="profile-content">
              <div class="profile-title">
                <h2>
                  {{ dealer.name }}
                </h2>

                <span
                  class="status-badge"
                  :class="
                    `status-badge--${dealer.status}`
                  "
                >
                  {{ statusText(dealer.status) }}
                </span>

                <span
                  class="level-badge"
                  :class="
                    `level-badge--${dealer.level}`
                  "
                >
                  {{ levelText(dealer.level) }}
                </span>
              </div>

              <p>
                經銷商編號：
                <strong>
                  {{ dealer.dealerNo }}
                </strong>
              </p>

              <div class="profile-tags">
                <span>
                  {{ marketText(dealer.market) }}
                </span>

                <span>
                  {{ dealer.regionName || '尚未分配區域' }}
                </span>

                <span>
                  會員 ID：{{ dealer.memberId }}
                </span>
              </div>
            </div>
          </div>

          <div class="profile-meta">
            <div>
              <span>建立時間</span>

              <strong>
                {{ formatDate(dealer.createdAt) }}
              </strong>
            </div>

            <div>
              <span>最後更新</span>

              <strong>
                {{ formatDate(dealer.updatedAt) }}
              </strong>
            </div>
          </div>
        </section>

        <section class="statistics-grid">
          <article class="stat-card">
            <span>直推人數</span>

            <strong>
              {{ formatNumber(dealer.directCount) }}
            </strong>
          </article>

          <article class="stat-card">
            <span>團隊人數</span>

            <strong>
              {{ formatNumber(dealer.teamCount) }}
            </strong>
          </article>

          <article class="stat-card">
            <span>團隊總業績</span>

            <strong class="stat-card__money">
              {{ formatMoney(dealer.teamSales) }}
            </strong>
          </article>

          <article class="stat-card">
            <span>累計佣金</span>

            <strong class="stat-card__money">
              {{ formatMoney(dealer.totalCommission) }}
            </strong>
          </article>
        </section>

        <div class="detail-grid">
          <section class="content-card">
            <header class="card-header">
              <div>
                <h2>
                  基本資料
                </h2>

                <p>
                  經銷商身分與聯絡資訊
                </p>
              </div>
            </header>

            <div class="info-grid">
              <div class="info-item">
                <span>姓名</span>

                <strong>
                  {{ dealer.name }}
                </strong>
              </div>

              <div class="info-item">
                <span>手機號碼</span>

                <strong>
                  {{ dealer.phone || '-' }}
                </strong>
              </div>

              <div class="info-item">
                <span>電子信箱</span>

                <strong>
                  {{ dealer.email || '-' }}
                </strong>
              </div>

              <div class="info-item">
                <span>經銷商編號</span>

                <strong>
                  {{ dealer.dealerNo }}
                </strong>
              </div>

              <div class="info-item">
                <span>會員 ID</span>

                <strong>
                  {{ dealer.memberId }}
                </strong>
              </div>

              <div class="info-item">
                <span>市場</span>

                <strong>
                  {{ marketText(dealer.market) }}
                </strong>
              </div>

              <div class="info-item">
                <span>區域名稱</span>

                <strong>
                  {{ dealer.regionName || '未分配' }}
                </strong>
              </div>

              <div class="info-item">
                <span>區域 ID</span>

                <strong>
                  {{ dealer.regionId || '-' }}
                </strong>
              </div>
            </div>
          </section>

          <section class="content-card">
            <header class="card-header">
              <div>
                <h2>
                  審核資料
                </h2>

                <p>
                  經銷商申請與平台審核紀錄
                </p>
              </div>
            </header>

            <div class="info-grid">
              <div class="info-item">
                <span>目前狀態</span>

                <strong>
                  {{ statusText(dealer.status) }}
                </strong>
              </div>

              <div class="info-item">
                <span>審核人員</span>

                <strong>
                  {{ dealer.approvedBy || '-' }}
                </strong>
              </div>

              <div class="info-item">
                <span>審核時間</span>

                <strong>
                  {{ formatDate(dealer.approvedAt) }}
                </strong>
              </div>

              <div class="info-item info-item--full">
                <span>備註</span>

                <strong>
                  {{ dealer.remark || '尚無備註' }}
                </strong>
              </div>
            </div>
          </section>
        </div>

        <section
          v-if="
            dealer.status === 'pending' &&
            permissionStore.hasPermission(
              'dealer.approve',
            )
          "
          class="content-card operation-card"
        >
          <header class="card-header">
            <div>
              <h2>
                經銷商申請審核
              </h2>

              <p>
                審核通過後將啟用經銷商帳號；拒絕後將停用此申請。
              </p>
            </div>
          </header>

          <div class="form-grid">
            <label class="form-field form-field--full">
              <span>審核備註</span>

              <textarea
                v-model.trim="reviewRemark"
                rows="4"
                placeholder="請輸入審核說明或拒絕原因"
                :disabled="store.isMutating"
              />
            </label>
          </div>

          <div class="operation-actions">
            <button
              class="danger-button"
              type="button"
              :disabled="store.isMutating"
              @click="handleReview('rejected')"
            >
              拒絕申請
            </button>

            <button
              class="success-button"
              type="button"
              :disabled="store.isMutating"
              @click="handleReview('approved')"
            >
              {{
                store.isMutating
                  ? '處理中...'
                  : '審核通過'
              }}
            </button>
          </div>
        </section>

        <div class="operation-grid">
          <section
            v-if="
              permissionStore.hasPermission(
                'dealer.update',
              )
            "
            class="content-card operation-card"
          >
            <header class="card-header">
              <div>
                <h2>
                  帳號狀態管理
                </h2>

                <p>
                  調整經銷商啟用、暫停或停用狀態
                </p>
              </div>
            </header>

            <div class="form-grid">
              <label class="form-field">
                <span>帳號狀態</span>

                <select
                  v-model="selectedStatus"
                  :disabled="store.isMutating"
                >
                  <option value="approved">
                    已通過
                  </option>

                  <option value="active">
                    正常啟用
                  </option>

                  <option value="suspended">
                    暫停
                  </option>

                  <option value="disabled">
                    停用
                  </option>
                </select>
              </label>

              <label class="form-field form-field--full">
                <span>狀態備註</span>

                <textarea
                  v-model.trim="statusRemark"
                  rows="3"
                  placeholder="請輸入本次狀態調整原因"
                  :disabled="store.isMutating"
                />
              </label>
            </div>

            <div class="operation-actions">
              <button
                class="primary-button"
                type="button"
                :disabled="store.isMutating"
                @click="handleStatusUpdate"
              >
                更新帳號狀態
              </button>
            </div>
          </section>

          <section
            v-if="
              permissionStore.hasPermission(
                'dealer.update',
              )
            "
            class="content-card operation-card"
          >
            <header class="card-header">
              <div>
                <h2>
                  經銷商星級管理
                </h2>

                <p>
                  調整普通至七星經銷商等級
                </p>
              </div>
            </header>

            <div class="form-grid">
              <label class="form-field">
                <span>經銷商等級</span>

                <select
                  v-model="selectedLevel"
                  :disabled="store.isMutating"
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

              <label class="form-field form-field--full">
                <span>等級調整備註</span>

                <textarea
                  v-model.trim="levelRemark"
                  rows="3"
                  placeholder="請輸入本次等級調整原因"
                  :disabled="store.isMutating"
                />
              </label>
            </div>

            <div class="operation-actions">
              <button
                class="primary-button"
                type="button"
                :disabled="store.isMutating"
                @click="handleLevelUpdate"
              >
                更新經銷商等級
              </button>
            </div>
          </section>
        </div>
      </template>
    </div>
  </AdminLayout>
</template>
<script setup lang="ts">
import {
  computed,
  onMounted,
  ref,
  watch,
} from 'vue'

import {
  useRoute,
  useRouter,
} from 'vue-router'

import AdminLayout from '../../layouts/AdminLayout.vue'

import {
  useDealerStore,
} from '../../stores/dealer'

import {
  usePermissionStore,
} from '../../stores/permission'

import type {
  DealerApprovalInput,
  DealerLevel,
  DealerMarket,
  DealerStatus,
} from '../../types/dealer'


const route =
  useRoute()


const router =
  useRouter()


const store =
  useDealerStore()


const permissionStore =
  usePermissionStore()


const reviewRemark =
  ref('')


const statusRemark =
  ref('')


const levelRemark =
  ref('')


const selectedStatus =
  ref<DealerStatus>(
    'active',
  )


const selectedLevel =
  ref<DealerLevel>(
    'normal',
  )


const dealer =
  computed(() =>
    store.currentDealer,
  )


const dealerId =
  computed(() => {

    const routeId =
      route.params.id


    return typeof routeId ===
      'string'
      ? routeId.trim()
      : ''

  })



function syncFormValues():
  void {

  if (!dealer.value) {
    return
  }


  selectedStatus.value =
    dealer.value.status


  selectedLevel.value =
    dealer.value.level

}



async function loadDealer():
  Promise<void> {

  if (!dealerId.value) {

    store.clearCurrentDealer()

    return

  }


  await store.fetchDealerById(
    dealerId.value,
  )


  syncFormValues()

}



function handleBack():
  void {

  router.push({
    name:
      'dealer-list',
  })

}



async function handleRefresh():
  Promise<void> {

  await loadDealer()

}



async function handleReview(
  status:
    DealerApprovalInput['status'],
):
  Promise<void> {

  if (
    !dealer.value ||
    store.isMutating
  ) {
    return
  }


  if (
    status === 'rejected' &&
    !reviewRemark.value.trim()
  ) {

    window.alert(
      '拒絕申請時，請填寫拒絕原因。',
    )

    return
  }


  const confirmed =
    window.confirm(
      status === 'approved'
        ? '確定要通過此經銷商申請嗎？'
        : '確定要拒絕此經銷商申請嗎？',
    )


  if (!confirmed) {
    return
  }


  const result =
    await store.approveDealer({
      dealerId:
        dealer.value.id,

      status,

      approvedBy:
        null,

      remark:
        reviewRemark.value.trim() ||
        null,
    })


  if (!result) {
    return
  }


  reviewRemark.value =
    ''


  selectedStatus.value =
    result.status


  selectedLevel.value =
    result.level

}



async function handleStatusUpdate():
  Promise<void> {

  if (
    !dealer.value ||
    store.isMutating
  ) {
    return
  }


  if (
    selectedStatus.value ===
    dealer.value.status &&
    !statusRemark.value.trim()
  ) {

    window.alert(
      '帳號狀態沒有變更。',
    )

    return
  }


  const confirmed =
    window.confirm(
      `確定要將帳號狀態調整為「${statusText(
        selectedStatus.value,
      )}」嗎？`,
    )


  if (!confirmed) {
    return
  }


  const result =
    await store.updateStatus({
      dealerId:
        dealer.value.id,

      status:
        selectedStatus.value,

      operatorId:
        null,

      remark:
        statusRemark.value.trim() ||
        null,
    })


  if (!result) {
    return
  }


  selectedStatus.value =
    result.status


  statusRemark.value =
    ''

}



async function handleLevelUpdate():
  Promise<void> {

  if (
    !dealer.value ||
    store.isMutating
  ) {
    return
  }


  if (
    selectedLevel.value ===
    dealer.value.level &&
    !levelRemark.value.trim()
  ) {

    window.alert(
      '經銷商等級沒有變更。',
    )

    return
  }


  const confirmed =
    window.confirm(
      `確定要將經銷商等級調整為「${levelText(
        selectedLevel.value,
      )}」嗎？`,
    )


  if (!confirmed) {
    return
  }


  const result =
    await store.updateLevel({
      dealerId:
        dealer.value.id,

      level:
        selectedLevel.value,

      operatorId:
        null,

      remark:
        levelRemark.value.trim() ||
        null,
    })


  if (!result) {
    return
  }


  selectedLevel.value =
    result.level


  levelRemark.value =
    ''

}



function dealerInitial(
  name: string,
): string {

  const normalizedName =
    name.trim()


  return normalizedName
    ? normalizedName.slice(
        0,
        1,
      )
    : '?'

}



function marketText(
  value:
    DealerMarket,
): string {

  switch (value) {

    case 'taiwan':

      return '台灣市場'


    case 'china':

      return '中國市場'


    case 'cross_border':

      return '跨境市場'


    default:

      return value

  }

}



function levelText(
  value:
    DealerLevel,
): string {

  switch (value) {

    case 'normal':

      return '普通經銷商'


    case 'star_1':

      return '一星經銷商'


    case 'star_2':

      return '二星經銷商'


    case 'star_3':

      return '三星經銷商'


    case 'star_4':

      return '四星經銷商'


    case 'star_5':

      return '五星經銷商'


    case 'star_6':

      return '六星經銷商'


    case 'star_7':

      return '七星經銷商'


    default:

      return value

  }

}



function statusText(
  value:
    DealerStatus,
): string {

  switch (value) {

    case 'pending':

      return '待審核'


    case 'approved':

      return '已通過'


    case 'active':

      return '正常啟用'


    case 'suspended':

      return '已暫停'


    case 'disabled':

      return '已停用'


    default:

      return value

  }

}



function formatNumber(
  value: number,
): string {

  return new Intl.NumberFormat(
    'zh-TW',
  ).format(
    Number.isFinite(value)
      ? value
      : 0,
  )

}



function formatMoney(
  value: number,
): string {

  return new Intl.NumberFormat(
    'zh-TW',
    {
      style:
        'currency',

      currency:
        'TWD',

      maximumFractionDigits:
        0,
    },
  ).format(
    Number.isFinite(value)
      ? value
      : 0,
  )

}



function formatDate(
  value:
    string | null | undefined,
): string {

  if (!value) {

    return '-'

  }


  const date =
    new Date(value)


  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {

    return value

  }


  return new Intl.DateTimeFormat(
    'zh-TW',
    {
      year:
        'numeric',

      month:
        '2-digit',

      day:
        '2-digit',

      hour:
        '2-digit',

      minute:
        '2-digit',

      second:
        '2-digit',

      hour12:
        false,
    },
  ).format(date)

}



watch(
  () =>
    dealer.value?.id,

  () => {
    syncFormValues()
  },
)



watch(
  dealerId,

  async (
    currentId,
    previousId,
  ) => {

    if (
      currentId &&
      currentId !== previousId
    ) {

      await loadDealer()

    }

  },
)



onMounted(
  async () => {

    store.clearError()

    store.clearMutationMessage()

    await loadDealer()

  },
)
</script>
<style scoped>
.dealer-detail-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
}

.page-header h1 {
  margin: 8px 0;
  color: #0f172a;
  font-size: 34px;
  line-height: 1.2;
}

.page-eyebrow {
  margin: 18px 0 0;
  color: #3157d6;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.page-description {
  margin: 0;
  color: #64748b;
  line-height: 1.7;
}

button {
  min-height: 40px;
  padding: 9px 14px;
  border: 1px solid #dbe2ea;
  border-radius: 10px;
  background: #ffffff;
  color: #334155;
  cursor: pointer;
  font-weight: 700;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}

button:hover:not(:disabled) {
  border-color: #cbd5e1;
  background: #f8fafc;
  transform: translateY(-1px);
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.back-button {
  min-height: auto;
  padding: 0;
  border: 0;
  background: transparent;
  color: #3157d6;
}

.back-button:hover:not(:disabled) {
  border: 0;
  background: transparent;
  color: #2547bd;
  transform: none;
}

.refresh-button {
  flex-shrink: 0;
  color: #3157d6;
}

.primary-button {
  border-color: #3157d6;
  background: #3157d6;
  color: #ffffff;
}

.primary-button:hover:not(:disabled) {
  border-color: #2547bd;
  background: #2547bd;
}

.success-button {
  border-color: #16a34a;
  background: #16a34a;
  color: #ffffff;
}

.success-button:hover:not(:disabled) {
  border-color: #15803d;
  background: #15803d;
}

.danger-button {
  border-color: #fecaca;
  background: #fef2f2;
  color: #b91c1c;
}

.danger-button:hover:not(:disabled) {
  border-color: #fca5a5;
  background: #fee2e2;
}

.alert {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 14px 18px;
  border: 1px solid transparent;
  border-radius: 12px;
  font-weight: 700;
}

.alert button {
  min-height: 32px;
  padding: 5px 10px;
  border-color: currentColor;
  background: transparent;
  color: inherit;
}

.alert--error {
  border-color: #fecaca;
  background: #fef2f2;
  color: #b91c1c;
}

.alert--success {
  border-color: #bbf7d0;
  background: #f0fdf4;
  color: #15803d;
}

.state-card {
  padding: 56px 24px;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  background: #ffffff;
  color: #64748b;
  text-align: center;
  box-shadow:
    0 10px 25px
    rgba(15, 23, 42, 0.05);
}

.profile-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 28px;
  padding: 26px;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  background: #ffffff;
  box-shadow:
    0 10px 25px
    rgba(15, 23, 42, 0.05);
}

.profile-main {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 18px;
}

.dealer-avatar {
  display: grid;
  width: 72px;
  height: 72px;
  flex-shrink: 0;
  place-items: center;
  border-radius: 20px;
  background: #eef2ff;
  color: #3157d6;
  font-size: 28px;
  font-weight: 900;
}

.profile-content {
  min-width: 0;
}

.profile-title {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.profile-title h2 {
  margin: 0;
  color: #0f172a;
  font-size: 26px;
}

.profile-content > p {
  margin: 10px 0;
  color: #64748b;
}

.profile-content > p strong {
  color: #3157d6;
}

.profile-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.profile-tags span {
  padding: 6px 10px;
  border-radius: 999px;
  background: #f1f5f9;
  color: #475569;
  font-size: 12px;
  font-weight: 700;
}

.profile-meta {
  display: grid;
  min-width: 250px;
  gap: 14px;
}

.profile-meta div {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.profile-meta span {
  color: #94a3b8;
  font-size: 12px;
  font-weight: 700;
}

.profile-meta strong {
  color: #334155;
  font-size: 13px;
}

.statistics-grid {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.stat-card {
  display: flex;
  min-height: 118px;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  background: #ffffff;
  box-shadow:
    0 8px 22px
    rgba(15, 23, 42, 0.04);
}

.stat-card span {
  color: #64748b;
  font-size: 13px;
  font-weight: 700;
}

.stat-card strong {
  margin-top: 14px;
  color: #0f172a;
  font-size: 28px;
}

.stat-card__money {
  font-size: 21px !important;
}

.detail-grid,
.operation-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.content-card {
  overflow: hidden;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  background: #ffffff;
  box-shadow:
    0 10px 25px
    rgba(15, 23, 42, 0.05);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 20px 22px;
  border-bottom: 1px solid #e5e7eb;
}

.card-header h2 {
  margin: 0;
  color: #0f172a;
  font-size: 19px;
}

.card-header p {
  margin: 6px 0 0;
  color: #94a3b8;
  font-size: 13px;
}

.info-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 0;
}

.info-item {
  display: flex;
  min-height: 92px;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  padding: 18px 22px;
  border-right: 1px solid #eef2f7;
  border-bottom: 1px solid #eef2f7;
}

.info-item:nth-child(2n) {
  border-right: 0;
}

.info-item--full {
  grid-column: 1 / -1;
  border-right: 0;
}

.info-item span {
  color: #94a3b8;
  font-size: 12px;
  font-weight: 700;
}

.info-item strong {
  overflow-wrap: anywhere;
  color: #334155;
  line-height: 1.6;
}

.operation-card {
  padding-bottom: 20px;
}

.form-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 18px;
  padding: 22px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-field--full {
  grid-column: 1 / -1;
}

.form-field > span {
  color: #475569;
  font-size: 13px;
  font-weight: 800;
}

.form-field select,
.form-field textarea {
  width: 100%;
  border: 1px solid #dbe2ea;
  border-radius: 10px;
  background: #ffffff;
  color: #0f172a;
  outline: none;
  font: inherit;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.form-field select {
  min-height: 44px;
  padding: 0 13px;
}

.form-field textarea {
  min-height: 96px;
  padding: 12px 13px;
  line-height: 1.6;
  resize: vertical;
}

.form-field select:focus,
.form-field textarea:focus {
  border-color: #3157d6;
  box-shadow:
    0 0 0 3px
    rgba(49, 87, 214, 0.12);
}

.form-field select:disabled,
.form-field textarea:disabled {
  cursor: not-allowed;
  background: #f8fafc;
  opacity: 0.7;
}

.operation-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 0 22px;
}

.level-badge,
.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 28px;
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
}

.level-badge--normal {
  background: #e2e8f0;
  color: #475569;
}

.level-badge--star_1 {
  background: #eff6ff;
  color: #2563eb;
}

.level-badge--star_2 {
  background: #eef2ff;
  color: #4f46e5;
}

.level-badge--star_3 {
  background: #f5f3ff;
  color: #7c3aed;
}

.level-badge--star_4 {
  background: #faf5ff;
  color: #9333ea;
}

.level-badge--star_5 {
  background: #fdf4ff;
  color: #c026d3;
}

.level-badge--star_6 {
  background: #fff7ed;
  color: #ea580c;
}

.level-badge--star_7 {
  background: #fefce8;
  color: #a16207;
}

.status-badge--pending {
  background: #fef3c7;
  color: #b45309;
}

.status-badge--approved {
  background: #dbeafe;
  color: #1d4ed8;
}

.status-badge--active {
  background: #dcfce7;
  color: #15803d;
}

.status-badge--suspended {
  background: #ffedd5;
  color: #c2410c;
}

.status-badge--disabled {
  background: #fee2e2;
  color: #b91c1c;
}

@media (max-width: 1100px) {
  .statistics-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .detail-grid,
  .operation-grid {
    grid-template-columns: 1fr;
  }

  .profile-card {
    align-items: flex-start;
    flex-direction: column;
  }

  .profile-meta {
    width: 100%;
    min-width: 0;
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .page-header {
    flex-direction: column;
  }

  .refresh-button {
    width: 100%;
  }

  .page-header h1 {
    font-size: 28px;
  }

  .profile-main {
    align-items: flex-start;
    flex-direction: column;
  }

  .statistics-grid {
    grid-template-columns: 1fr;
  }

  .info-grid,
  .form-grid {
    grid-template-columns: 1fr;
  }

  .info-item,
  .info-item:nth-child(2n) {
    border-right: 0;
  }

  .info-item--full,
  .form-field--full {
    grid-column: auto;
  }

  .profile-meta {
    grid-template-columns: 1fr;
  }

  .operation-actions {
    flex-direction: column-reverse;
  }

  .operation-actions button {
    width: 100%;
  }

  .alert {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>