<template>
  <div class="dealer-performance-page">
    <section class="page-header">
      <div>
        <p class="page-header__eyebrow">
          Dealer ERP
        </p>

        <h1>
          經銷商業績與團隊管理
        </h1>

        <p class="page-header__description">
          查詢經銷商個人業績、團隊人數、直屬成員與上級經銷商資料。
        </p>
      </div>
    </section>

    <section class="search-card">
      <label
        class="search-card__label"
        for="dealer-id"
      >
        經銷商 ID
      </label>

      <div class="search-card__controls">
        <input
          id="dealer-id"
          v-model="dealerId"
          type="text"
          placeholder="請輸入經銷商 UUID"
          :disabled="performanceStore.isLoading"
          @keyup.enter="handleSearch"
        >

        <button
          type="button"
          :disabled="
            performanceStore.isLoading ||
            !dealerId.trim()
          "
          @click="handleSearch"
        >
          {{
            performanceStore.isLoading
              ? '載入中...'
              : '查詢業績'
          }}
        </button>
      </div>
    </section>

    <section class="relation-card">
      <div class="relation-card__header">
        <div>
          <p class="relation-card__eyebrow">
            Team Relation
          </p>

          <h2>
            經銷商上下級指派
          </h2>

          <p>
            選擇要調整的經銷商與上級經銷商，
            系統會自動防止重複指派與循環關係。
          </p>
        </div>

        <div class="operator-info">
          <span>目前操作人</span>

          <strong>
            {{ authStore.user?.name ?? '未取得登入者' }}
          </strong>

          <small>
            {{ authStore.user?.id ?? '—' }}
          </small>
        </div>
      </div>

      <div class="relation-form">
        <div class="form-field">
          <label for="relation-mode">
            操作模式
          </label>

          <select
            id="relation-mode"
            v-model="relationMode"
            :disabled="relationStore.isSubmitting"
          >
            <option value="assign">
              首次指派上級
            </option>

            <option value="reassign">
              變更目前上級
            </option>

            <option value="unassign">
              解除目前上級
            </option>
          </select>
        </div>

        <div class="form-field">
          <label for="relation-dealer">
            要調整的經銷商（下級）
          </label>

          <select
            id="relation-dealer"
            v-model="selectedDealerId"
            :disabled="
              relationStore.isSubmitting ||
              dealerStore.isLoading
            "
            @change="handleDealerSelection"
          >
            <option value="">
              請選擇經銷商
            </option>

            <option
              v-for="dealer in dealerStore.dealers"
              :key="dealer.id"
              :value="dealer.id"
            >
              {{ dealer.dealerNo }}－{{ dealer.name }}
            </option>
          </select>
        </div>

        <div
          v-if="relationMode !== 'unassign'"
          class="form-field"
        >
          <label for="relation-parent">
            上級經銷商
          </label>

          <select
            id="relation-parent"
            v-model="selectedParentDealerId"
            :disabled="
              relationStore.isSubmitting ||
              dealerStore.isLoading
            "
          >
            <option value="">
              請選擇上級經銷商
            </option>

            <option
              v-for="dealer in dealerStore.dealers"
              :key="dealer.id"
              :value="dealer.id"
              :disabled="
                dealer.id === selectedDealerId
              "
            >
              {{ dealer.dealerNo }}－{{ dealer.name }}
            </option>
          </select>
        </div>

        <div class="form-field form-field--wide">
          <label for="relation-remark">
            操作備註
          </label>

          <textarea
            id="relation-remark"
            v-model="relationRemark"
            rows="3"
            :disabled="relationStore.isSubmitting"
            placeholder="請輸入本次指派、變更或解除原因"
          />
        </div>
      </div>

      <div
        v-if="dealerStore.error"
        class="relation-feedback relation-feedback--error"
      >
        經銷商清單載入失敗：
        {{ dealerStore.error }}
      </div>

      <div
        v-if="relationStore.error"
        class="relation-feedback relation-feedback--error"
      >
        {{ relationStore.error }}
      </div>

      <div
        v-if="relationStore.message"
        class="relation-feedback relation-feedback--success"
      >
        {{ relationStore.message }}
      </div>

      <div class="relation-actions">
        <button
          type="button"
          class="relation-actions__submit"
          :class="{
            'relation-actions__submit--danger':
              relationMode === 'unassign',
          }"
          :disabled="
            relationStore.isSubmitting ||
            !selectedDealerId ||
            (
              relationMode !== 'unassign' &&
              !selectedParentDealerId
            )
          "
          @click="handleRelationSubmit"
        >
          {{
            relationStore.isSubmitting
              ? '處理中...'
              : relationSubmitLabel
          }}
        </button>

        <button
          type="button"
          class="relation-actions__reset"
          :disabled="relationStore.isSubmitting"
          @click="resetRelationForm"
        >
          清除
        </button>
      </div>
    </section>

    <section
      v-if="performanceStore.error"
      class="message-card message-card--error"
    >
      <strong>
        載入失敗
      </strong>

      <p>
        {{ performanceStore.error }}
      </p>
    </section>

    <section
      v-else-if="performanceStore.isLoading"
      class="message-card"
    >
      正在載入經銷商團隊業績資料...
    </section>

    <template
      v-else-if="performanceStore.performance"
    >
      <section class="dealer-card">
        <div class="dealer-card__header">
          <div>
            <p class="dealer-card__number">
              {{ performanceStore.dealer?.dealerNo }}
            </p>

            <h2>
              {{ performanceStore.dealer?.name }}
            </h2>
          </div>

          <span class="status-badge">
            {{ performanceStore.dealer?.status }}
          </span>
        </div>

        <div class="dealer-card__grid">
          <div>
            <span>市場</span>
            <strong>
              {{ performanceStore.dealer?.market }}
            </strong>
          </div>

          <div>
            <span>等級</span>
            <strong>
              {{ performanceStore.dealer?.level }}
            </strong>
          </div>

          <div>
            <span>手機</span>
            <strong>
              {{ performanceStore.dealer?.phone ?? '未設定' }}
            </strong>
          </div>

          <div>
            <span>Email</span>
            <strong>
              {{ performanceStore.dealer?.email ?? '未設定' }}
            </strong>
          </div>
        </div>
      </section>

      <section class="statistics-grid">
        <article class="stat-card">
          <span>
            直屬人數
          </span>

          <strong>
            {{ performanceStore.statistics.directCount }}
          </strong>
        </article>

        <article class="stat-card">
          <span>
            團隊人數
          </span>

          <strong>
            {{ performanceStore.statistics.teamCount }}
          </strong>
        </article>

        <article class="stat-card">
          <span>
            團隊業績
          </span>

          <strong>
            {{
              formatCurrency(
                performanceStore.statistics.teamSales,
              )
            }}
          </strong>
        </article>

        <article class="stat-card">
          <span>
            累計佣金
          </span>

          <strong>
            {{
              formatCurrency(
                performanceStore.statistics.totalCommission,
              )
            }}
          </strong>
        </article>
      </section>

      <section class="content-grid">
        <article class="panel">
          <div class="panel__header">
            <h2>
              上級經銷商
            </h2>
          </div>

          <div
            v-if="performanceStore.parentDealer"
            class="parent-card"
          >
            <strong>
              {{ performanceStore.parentDealer.name }}
            </strong>

            <span>
              {{ performanceStore.parentDealer.dealerNo }}
            </span>

            <span>
              {{ performanceStore.parentDealer.phone ?? '未設定手機' }}
            </span>

            <span>
              團隊業績：
              {{
                formatCurrency(
                  performanceStore.parentDealer.teamSales,
                )
              }}
            </span>
          </div>

          <p
            v-else
            class="empty-state"
          >
            此經銷商目前沒有上級經銷商。
          </p>
        </article>

        <article class="panel">
          <div class="panel__header">
            <h2>
              直屬團隊
            </h2>

            <span>
              共 {{ performanceStore.directDealers.length }} 人
            </span>
          </div>

          <div
            v-if="performanceStore.directDealers.length === 0"
            class="empty-state"
          >
            目前沒有直屬經銷商。
          </div>

          <div
            v-else
            class="team-table-wrapper"
          >
            <table class="team-table">
              <thead>
                <tr>
                  <th>經銷商</th>
                  <th>聯絡方式</th>
                  <th>等級</th>
                  <th>直屬人數</th>
                  <th>團隊人數</th>
                  <th>團隊業績</th>
                  <th>加入時間</th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="member in performanceStore.directDealers"
                  :key="member.id"
                >
                  <td>
                    <strong>
                      {{ member.name }}
                    </strong>

                    <small>
                      {{ member.dealerNo }}
                    </small>
                  </td>

                  <td>
                    <span>
                      {{ member.phone ?? '未設定手機' }}
                    </span>

                    <small>
                      {{ member.email ?? '未設定 Email' }}
                    </small>
                  </td>

                  <td>
                    {{ member.level }}
                  </td>

                  <td>
                    {{ member.directCount }}
                  </td>

                  <td>
                    {{ member.teamCount }}
                  </td>

                  <td>
                    {{ formatCurrency(member.teamSales) }}
                  </td>

                  <td>
                    {{ formatDate(member.joinedAt) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </template>

    <section
      v-else
      class="message-card"
    >
      請輸入經銷商 ID 後查詢。
    </section>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
} from 'vue'

import {
  useDealerPerformanceStore,
} from '../../stores/dealer-performance'

import {
  useDealerStore,
} from '../../stores/dealer'

import {
  useDealerTeamRelationStore,
} from '../../stores/dealer-team-relation'

import {
  useAuthStore,
} from '../../stores/auth'


const performanceStore =
  useDealerPerformanceStore()


const dealerStore =
  useDealerStore()


const relationStore =
  useDealerTeamRelationStore()


const authStore =
  useAuthStore()


type RelationMode =
  | 'assign'
  | 'reassign'
  | 'unassign'


const dealerId =
  ref('')


const relationMode =
  ref<RelationMode>(
    'assign',
  )


const selectedDealerId =
  ref('')


const selectedParentDealerId =
  ref('')


const relationRemark =
  ref('')


const relationSubmitLabel =
  computed(() => {

    if (
      relationMode.value === 'reassign'
    ) {

      return '確認變更上級'

    }


    if (
      relationMode.value === 'unassign'
    ) {

      return '確認解除上級'

    }


    return '確認首次指派'

  })


function handleDealerSelection():
void {

  relationStore.resetFeedback()

  selectedParentDealerId.value =
    ''

  if (
    selectedDealerId.value
  ) {

    dealerId.value =
      selectedDealerId.value

  }

}


function resetRelationForm():
void {

  relationMode.value =
    'assign'

  selectedDealerId.value =
    ''

  selectedParentDealerId.value =
    ''

  relationRemark.value =
    ''

  relationStore.resetFeedback()

}


async function handleRelationSubmit():
Promise<void> {

  const normalizedDealerId =
    selectedDealerId.value.trim()

  const normalizedParentDealerId =
    selectedParentDealerId.value.trim()


  if (
    !normalizedDealerId
  ) {

    return

  }


  if (
    relationMode.value !== 'unassign'
    &&
    !normalizedParentDealerId
  ) {

    return

  }


  if (
    normalizedDealerId ===
      normalizedParentDealerId
  ) {

    window.alert(
      '經銷商不可指派自己為上級。',
    )

    return

  }


  if (
    relationMode.value === 'unassign'
    &&
    !window.confirm(
      '確定要解除這位經銷商目前的上級關係嗎？',
    )
  ) {

    return

  }


  const commonInput = {

    dealerId:
      normalizedDealerId,

    createdBy:
      authStore.user?.id
      ??
      null,

    remark:
      relationRemark.value.trim()
      ||
      null,

  }


  let success =
    false


  if (
    relationMode.value === 'assign'
  ) {

    success =
      await relationStore.assignParent({
        ...commonInput,

        parentDealerId:
          normalizedParentDealerId,
      })

  } else if (
    relationMode.value === 'reassign'
  ) {

    success =
      await relationStore.reassignParent({
        ...commonInput,

        newParentDealerId:
          normalizedParentDealerId,
      })

  } else {

    success =
      await relationStore.unassignParent(
        commonInput,
      )

  }


  if (
    !success
  ) {

    return

  }


  dealerId.value =
    normalizedDealerId

  await Promise.all([
    performanceStore.fetchPerformance(
      normalizedDealerId,
    ),

    dealerStore.fetchDealers(),
  ])


  selectedParentDealerId.value =
    ''

  relationRemark.value =
    ''

}


async function handleSearch():
Promise<void> {

  await performanceStore.fetchPerformance(
    dealerId.value,
  )

}


function formatCurrency(
  value: number,
): string {

  return new Intl.NumberFormat(
    'zh-TW',
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    },
  ).format(value)

}


function formatDate(
  value?: string | null,
): string {

  if (
    !value
  ) {

    return '—'

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


  return date.toLocaleString(
    'zh-TW',
  )

}


onMounted(async () => {

  dealerStore.setPageSize(
    100,
  )

  await dealerStore.fetchDealers()

})


onBeforeUnmount(() => {

  performanceStore.clearPerformance()

  relationStore.resetFeedback()

})
</script>

<style scoped>
.dealer-performance-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-header,
.search-card,
.dealer-card,
.panel,
.message-card {
  padding: 24px;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  background: #ffffff;
}

.page-header__eyebrow {
  margin: 0 0 8px;
  color: #3157d6;
  font-weight: 700;
}

.page-header h1,
.dealer-card h2,
.panel h2 {
  margin: 0;
}

.page-header__description {
  margin: 10px 0 0;
  color: #64748b;
}

.search-card__label {
  display: block;
  margin-bottom: 10px;
  font-weight: 700;
}

.search-card__controls {
  display: flex;
  gap: 12px;
}

.search-card input {
  min-width: 0;
  flex: 1;
  padding: 12px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  font: inherit;
}

.search-card button {
  padding: 12px 20px;
  border: 0;
  border-radius: 10px;
  background: #3157d6;
  color: #ffffff;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.search-card button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.message-card {
  color: #475569;
  text-align: center;
}

.message-card--error {
  border-color: #fecaca;
  background: #fff7f7;
  color: #b91c1c;
}

.message-card p {
  margin: 8px 0 0;
}

.dealer-card__header,
.panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.dealer-card__number {
  margin: 0 0 6px;
  color: #64748b;
}

.status-badge {
  padding: 7px 12px;
  border-radius: 999px;
  background: #ecfdf5;
  color: #047857;
  font-size: 13px;
  font-weight: 700;
}

.dealer-card__grid,
.statistics-grid {
  display: grid;
  gap: 16px;
}

.dealer-card__grid {
  margin-top: 22px;
  grid-template-columns:
    repeat(
      4,
      minmax(0, 1fr)
    );
}

.dealer-card__grid div,
.stat-card {
  padding: 18px;
  border-radius: 14px;
  background: #f8fafc;
}

.dealer-card__grid span,
.stat-card span {
  display: block;
  margin-bottom: 8px;
  color: #64748b;
  font-size: 13px;
}

.statistics-grid {
  grid-template-columns:
    repeat(
      4,
      minmax(0, 1fr)
    );
}

.stat-card {
  border: 1px solid #e5e7eb;
  background: #ffffff;
}

.stat-card strong {
  font-size: 26px;
}

.content-grid {
  display: grid;
  grid-template-columns:
    minmax(260px, 0.8fr)
    minmax(0, 2.2fr);
  gap: 24px;
}

.panel__header span {
  color: #64748b;
}

.parent-card {
  display: flex;
  margin-top: 20px;
  padding: 18px;
  border-radius: 14px;
  flex-direction: column;
  gap: 8px;
  background: #f8fafc;
}

.parent-card span {
  color: #64748b;
}

.empty-state {
  margin: 20px 0 0;
  color: #64748b;
  text-align: center;
}

.team-table-wrapper {
  margin-top: 20px;
  overflow-x: auto;
}

.team-table {
  width: 100%;
  border-collapse: collapse;
}

.team-table th,
.team-table td {
  padding: 14px 12px;
  border-bottom: 1px solid #e5e7eb;
  text-align: left;
  white-space: nowrap;
}

.team-table th {
  color: #475569;
  font-size: 13px;
}

.team-table td strong,
.team-table td span,
.team-table td small {
  display: block;
}

.team-table td small {
  margin-top: 5px;
  color: #64748b;
}

@media (
  max-width: 1100px
) {
  .dealer-card__grid,
  .statistics-grid {
    grid-template-columns:
      repeat(
        2,
        minmax(0, 1fr)
      );
  }

  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (
  max-width: 680px
) {
  .search-card__controls {
    flex-direction: column;
  }

  .dealer-card__grid,
  .statistics-grid {
    grid-template-columns: 1fr;
  }
}

.relation-card {
  padding: 24px;
  border: 1px solid #dbe4ff;
  border-radius: 18px;
  background: #ffffff;
}

.relation-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
}

.relation-card__header h2 {
  margin: 0;
}

.relation-card__header p {
  margin: 10px 0 0;
  color: #64748b;
}

.relation-card__eyebrow {
  margin: 0 0 8px !important;
  color: #3157d6 !important;
  font-weight: 700;
}

.operator-info {
  display: flex;
  min-width: 280px;
  padding: 14px 16px;
  border-radius: 12px;
  flex-direction: column;
  gap: 4px;
  background: #f8fafc;
}

.operator-info span,
.operator-info small {
  color: #64748b;
}

.operator-info small {
  overflow-wrap: anywhere;
}

.relation-form {
  display: grid;
  margin-top: 24px;
  grid-template-columns:
    repeat(
      3,
      minmax(0, 1fr)
    );
  gap: 18px;
}

.form-field {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 8px;
}

.form-field--wide {
  grid-column: 1 / -1;
}

.form-field label {
  font-weight: 700;
}

.form-field select,
.form-field textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 12px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  background: #ffffff;
  font: inherit;
}

.form-field textarea {
  resize: vertical;
}

.form-field select:focus,
.form-field textarea:focus {
  border-color: #3157d6;
  outline: 3px solid rgba(49, 87, 214, 0.12);
}

.relation-feedback {
  margin-top: 16px;
  padding: 12px 14px;
  border-radius: 10px;
}

.relation-feedback--success {
  border: 1px solid #a7f3d0;
  background: #ecfdf5;
  color: #047857;
}

.relation-feedback--error {
  border: 1px solid #fecaca;
  background: #fff7f7;
  color: #b91c1c;
}

.relation-actions {
  display: flex;
  margin-top: 20px;
  gap: 12px;
}

.relation-actions button {
  padding: 12px 20px;
  border-radius: 10px;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.relation-actions button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.relation-actions__submit {
  border: 0;
  background: #3157d6;
  color: #ffffff;
}

.relation-actions__submit--danger {
  background: #dc2626;
}

.relation-actions__reset {
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #334155;
}

@media (
  max-width: 900px
) {
  .relation-card__header {
    flex-direction: column;
  }

  .operator-info {
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
  }

  .relation-form {
    grid-template-columns: 1fr;
  }

  .form-field--wide {
    grid-column: auto;
  }
}

@media (
  max-width: 680px
) {
  .relation-actions {
    flex-direction: column;
  }

  .relation-actions button {
    width: 100%;
  }
}

</style>
