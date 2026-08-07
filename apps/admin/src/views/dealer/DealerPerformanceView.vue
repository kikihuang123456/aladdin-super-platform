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

    <section
      v-if="canManageTeamRelations"
      class="relation-card"
    >
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

      <section class="history-panel">
        <div class="history-panel__header">
          <div>
            <p class="history-panel__eyebrow">
              Relation History
            </p>

            <h2>
              團隊關係歷史
            </h2>

            <p>
              顯示歷次上級指派、變更與解除紀錄。
            </p>
          </div>

          <span class="history-panel__count">
            顯示 {{ filteredHistory.length }} / 共 {{ historyStore.total }} 筆
          </span>
        </div>

      <div class="history-filters">
        <label class="history-filter">
          <span>關鍵字</span>
          <input
            v-model.trim="historyKeyword"
            type="search"
            placeholder="經銷商、上級、備註"
          />
        </label>

        <label class="history-filter">
          <span>狀態</span>
          <select v-model="historyStatus">
            <option value="all">
              全部
            </option>
            <option value="active">
              目前有效
            </option>
            <option value="terminated">
              已終止
            </option>
          </select>
        </label>

        <label class="history-filter">
          <span>操作人</span>
          <input
            v-model.trim="
              historyOperatorKeyword
            "
            type="search"
            placeholder="姓名或 Email"
          />
        </label>

        <label class="history-filter">
          <span>開始日期</span>
          <input
            v-model="historyDateFrom"
            type="date"
          />
        </label>

        <label class="history-filter">
          <span>結束日期</span>
          <input
            v-model="historyDateTo"
            type="date"
          />
        </label>

        <button
          type="button"
          class="history-filter-clear"
          @click="clearHistoryFilters"
        >
          清除篩選
        </button>

        <button
          type="button"
          class="history-export-button"
          :disabled="
            filteredHistory.length === 0
          "
          @click="exportHistoryCsv"
        >
          匯出 CSV
        </button>
      </div>


        <div
          v-if="historyStore.error"
          class="relation-feedback relation-feedback--error"
        >
          {{ historyStore.error }}
        </div>

        <div
          v-else-if="historyStore.isLoading"
          class="history-state"
        >
          正在載入團隊關係歷史...
        </div>

        <div
          v-else-if="filteredHistory.length === 0"
          class="history-state"
        >
          目前沒有符合篩選條件的團隊關係歷史。
        </div>

        <div
          v-else
          class="history-table-wrapper"
        >
          <table class="history-table">
            <thead>
              <tr>
                <th>狀態</th>
                <th>上級經銷商</th>
                <th>開始時間</th>
                <th>結束時間</th>
                <th>建立操作人</th>
              <th>終止操作人</th>
                <th>操作備註</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="item in filteredHistory"
                :key="item.id"
              >
                <td>
                  <span
                    class="relation-status"
                    :class="
                      item.status === 'active'
                        ? 'relation-status--active'
                        : 'relation-status--terminated'
                    "
                  >
                    {{
                      formatRelationStatus(
                        item.status,
                      )
                    }}
                  </span>
                </td>

                <td>
                  <strong>
                    {{
                      item.parentDealerName
                      ??
                      '未設定上級'
                    }}
                  </strong>

                  <small>
                    {{
                      item.parentDealerNo
                      ??
                      '—'
                    }}
                  </small>
                </td>

                <td>
                  {{
                    formatDate(
                      item.joinedAt,
                    )
                  }}
                </td>

                <td>
                  {{
                    formatDate(
                      item.endedAt,
                    )
                  }}
                </td>

                <td>
                  <strong>
                    {{ item.operatorName }}
                  </strong>

                  <small>
                    {{
                      item.operatorEmail
                      ??
                      '—'
                    }}
                  </small>
                </td>

            <td>
              <strong>
                {{
                  item.endedOperatorName
                  ?? '—'
                }}
              </strong>

              <small>
                {{
                  item.endedOperatorEmail
                  ?? '—'
                }}
              </small>
            </td>

                <td class="history-table__remark">
                  {{ item.remark ?? '—' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
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
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

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
  useDealerTeamRelationHistoryStore,
} from '../../stores/dealer-team-relation-history'

import {
  useAuthStore,
} from '../../stores/auth'

import {
  usePermissionStore,
} from '../../stores/permission'


const performanceStore =
  useDealerPerformanceStore()


const dealerStore =
  useDealerStore()


const relationStore =
  useDealerTeamRelationStore()


const historyStore =
  useDealerTeamRelationHistoryStore()

const historyKeyword = ref('')
const historyStatus = ref<
  'all' | 'active' | 'terminated'
>('all')
const historyOperatorKeyword = ref('')
const historyDateFrom = ref('')
const historyDateTo = ref('')

const normalizeHistoryText = (
  value: string | null | undefined,
): string =>
  (value ?? '')
    .trim()
    .toLowerCase()

const isHistoryDateInRange = (
  value: string | null | undefined,
): boolean => {
  if (!historyDateFrom.value && !historyDateTo.value) {
    return true
  }

  if (!value) {
    return false
  }

  const current = new Date(value)

  if (Number.isNaN(current.getTime())) {
    return false
  }

  if (historyDateFrom.value) {
    const from = new Date(
      `${historyDateFrom.value}T00:00:00`,
    )

    if (current < from) {
      return false
    }
  }

  if (historyDateTo.value) {
    const to = new Date(
      `${historyDateTo.value}T23:59:59.999`,
    )

    if (current > to) {
      return false
    }
  }

  return true
}

const filteredHistory = computed(() => {
  const keyword =
    normalizeHistoryText(
      historyKeyword.value,
    )

  const operatorKeyword =
    normalizeHistoryText(
      historyOperatorKeyword.value,
    )

  return historyStore.history.filter(
    (item) => {
      if (
        historyStatus.value !== 'all'
        && item.status !== historyStatus.value
      ) {
        return false
      }

      if (
        !isHistoryDateInRange(
          item.joinedAt,
        )
      ) {
        return false
      }

      if (keyword) {
        const searchableText = [
          item.dealerNo,
          item.dealerName,
          item.parentDealerNo,
          item.parentDealerName,
          item.remark,
        ]
          .map(normalizeHistoryText)
          .join(' ')

        if (
          !searchableText.includes(
            keyword,
          )
        ) {
          return false
        }
      }

      if (operatorKeyword) {
        const operatorText = [
          item.operatorName,
          item.operatorEmail,
          item.endedOperatorName,
          item.endedOperatorEmail,
        ]
          .map(normalizeHistoryText)
          .join(' ')

        if (
          !operatorText.includes(
            operatorKeyword,
          )
        ) {
          return false
        }
      }

      return true
    },
  )
})

const clearHistoryFilters = (): void => {
  historyKeyword.value = ''
  historyStatus.value = 'all'
  historyOperatorKeyword.value = ''
  historyDateFrom.value = ''
  historyDateTo.value = ''
}

const escapeHistoryCsvCell = (
  value: unknown,
): string => {
  const textValue =
    value === null
    || value === undefined
      ? ''
      : String(value)

  return `"${textValue.replace(/"/g, '""')}"`
}

const formatHistoryExportDate = (
  value: string | null | undefined,
): string => {
  if (!value) {
    return ''
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString(
    'zh-TW',
    {
      hour12: false,
    },
  )
}

const exportHistoryCsv = (): void => {
  if (filteredHistory.value.length === 0) {
    window.alert(
      '目前沒有可匯出的團隊關係歷史。',
    )
    return
  }

  const headers = [
    '狀態',
    '經銷商編號',
    '經銷商名稱',
    '上級經銷商編號',
    '上級經銷商名稱',
    '開始時間',
    '結束時間',
    '建立操作人',
    '建立操作人 Email',
    '終止操作人',
    '終止操作人 Email',
    '操作備註',
  ]

  const rows =
    filteredHistory.value.map(
      (item) => [
        item.status === 'active'
          ? '目前有效'
          : item.status === 'terminated'
            ? '已終止'
            : item.status,
        item.dealerNo,
        item.dealerName,
        item.parentDealerNo ?? '',
        item.parentDealerName ?? '',
        formatHistoryExportDate(
          item.joinedAt,
        ),
        formatHistoryExportDate(
          item.endedAt,
        ),
        item.operatorName ?? '',
        item.operatorEmail ?? '',
        item.endedOperatorName ?? '',
        item.endedOperatorEmail ?? '',
        item.remark ?? '',
      ],
    )

  const csv = [
    headers,
    ...rows,
  ]
    .map(
      (row) =>
        row
          .map(escapeHistoryCsvCell)
          .join(','),
    )
    .join('\r\n')

  const blob = new Blob(
    [
      '\uFEFF',
      csv,
    ],
    {
      type:
        'text/csv;charset=utf-8;',
    },
  )

  const url =
    URL.createObjectURL(blob)

  const link =
    document.createElement('a')

  const now = new Date()

  const datePart = [
    now.getFullYear(),
    String(
      now.getMonth() + 1,
    ).padStart(2, '0'),
    String(
      now.getDate(),
    ).padStart(2, '0'),
  ].join('')

  link.href = url
  link.download =
    `dealer-team-audit-${datePart}.csv`

  document.body.appendChild(link)
  link.click()
  link.remove()

  URL.revokeObjectURL(url)
}




const authStore =
  useAuthStore()


const permissionStore =
  usePermissionStore()


const canManageTeamRelations =
  computed(
    () =>
      permissionStore.hasPermission(
        'dealer.team.manage',
      ),
  )


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

  if (
    !canManageTeamRelations.value
  ) {

    window.alert(
      '目前帳號沒有管理經銷商上下級關係的權限。',
    )

    return

  }


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

    historyStore.fetchHistory(
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

  historyStore.clearHistory()


  const success =
    await performanceStore.fetchPerformance(
      dealerId.value,
    )


  if (
    !success
    ||
    !performanceStore.dealer?.id
  ) {

    return

  }


  dealerId.value =
    performanceStore.dealer.id


  await historyStore.fetchHistory(
    performanceStore.dealer.id,
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


function formatRelationStatus(
  status: string,
): string {

  if (
    status === 'active'
  ) {

    return '目前有效'

  }


  if (
    status === 'terminated'
  ) {

    return '已終止'

  }


  return '未啟用'

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


.history-panel {
  padding: 24px;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  background: #ffffff;
}

.history-panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}

.history-panel__header h2 {
  margin: 0;
}

.history-panel__header p {
  margin: 8px 0 0;
  color: #64748b;
}

.history-panel__eyebrow {
  margin: 0 0 7px !important;
  color: #3157d6 !important;
  font-weight: 700;
}

.history-panel__count {
  padding: 7px 12px;
  border-radius: 999px;
  background: #eef2ff;
  color: #3157d6;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
}

.history-state {
  padding: 34px 16px;
  color: #64748b;
  text-align: center;
}

.history-table-wrapper {
  margin-top: 22px;
  overflow-x: auto;
}

.history-table {
  width: 100%;
  border-collapse: collapse;
}

.history-table th,
.history-table td {
  padding: 14px 12px;
  border-bottom: 1px solid #e5e7eb;
  text-align: left;
  vertical-align: top;
}

.history-table th {
  color: #475569;
  font-size: 13px;
  white-space: nowrap;
}

.history-table td {
  color: #334155;
}

.history-table td strong,
.history-table td small {
  display: block;
}

.history-table td small {
  margin-top: 5px;
  color: #64748b;
}

.history-table__remark {
  min-width: 220px;
  white-space: pre-line;
}

.relation-status {
  display: inline-flex;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.relation-status--active {
  background: #ecfdf5;
  color: #047857;
}

.relation-status--terminated {
  background: #f1f5f9;
  color: #64748b;
}

@media (
  max-width: 680px
) {
  .history-panel__header {
    flex-direction: column;
  }
}



.history-filters {
  display: grid;
  grid-template-columns:
    minmax(180px, 1.4fr)
    minmax(130px, 0.8fr)
    minmax(180px, 1.2fr)
    minmax(145px, 0.8fr)
    minmax(145px, 0.8fr)
    auto;
  gap: 12px;
  align-items: end;
  margin: 18px 0 20px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background: #f8fafc;
}

.history-filter {
  display: grid;
  gap: 6px;
}

.history-filter span {
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
}

.history-filter input,
.history-filter select {
  width: 100%;
  min-height: 40px;
  padding: 8px 10px;
  border: 1px solid #dbe2ea;
  border-radius: 9px;
  background: #fff;
  color: #0f172a;
  font: inherit;
}

.history-filter input:focus,
.history-filter select:focus {
  outline: none;
  border-color: #94a3b8;
}

.history-filter-clear {
  min-height: 40px;
  padding: 8px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 9px;
  background: #fff;
  color: #334155;
  font-weight: 700;
  cursor: pointer;
}

.history-filter-clear:hover {
  background: #f1f5f9;
}

@media (max-width: 1100px) {
  .history-filters {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 680px) {
  .history-filters {
    grid-template-columns: 1fr;
  }
}



.history-export-button {
  min-height: 40px;
  padding: 8px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 9px;
  background: #fff;
  color: #334155;
  font-weight: 700;
  cursor: pointer;
}

.history-export-button:hover:not(:disabled) {
  background: #f1f5f9;
}

.history-export-button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

</style>
