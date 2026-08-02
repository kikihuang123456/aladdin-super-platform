<template>
  <AdminLayout>
    <div class="settlement-page">
      <section class="page-header">
        <div>
          <p class="page-eyebrow">
            FINANCE SETTLEMENT ERP
          </p>

          <h1>
            結算管理
          </h1>

          <p class="page-description">
            管理商家與經銷商結算、平台服務費、結算週期與審核流程。
          </p>
        </div>

        <button
          class="refresh-button"
          type="button"
          :disabled="store.isLoading"
          @click="handleRefresh"
        >
          重新整理
        </button>
      </section>

      <section class="stats-grid">
        <article class="stat-card">
          <span>全部結算</span>
          <strong>
            {{ store.statistics.total }}
          </strong>
        </article>

        <article class="stat-card">
          <span>待處理</span>
          <strong>
            {{ store.statistics.pending }}
          </strong>
        </article>

        <article class="stat-card">
          <span>審核中</span>
          <strong>
            {{ store.statistics.reviewing }}
          </strong>
        </article>

        <article class="stat-card">
          <span>已通過</span>
          <strong>
            {{ store.statistics.approved }}
          </strong>
        </article>

        <article class="stat-card">
          <span>付款中</span>
          <strong>
            {{ store.statistics.processing }}
          </strong>
        </article>

        <article class="stat-card">
          <span>已完成</span>
          <strong>
            {{ store.statistics.completed }}
          </strong>
        </article>

        <article class="stat-card">
          <span>交易總額</span>
          <strong>
            {{
              formatMoney(
                store.statistics.grossAmount,
              )
            }}
          </strong>
        </article>

        <article class="stat-card">
          <span>實際結算</span>
          <strong>
            {{
              formatMoney(
                store.statistics.netAmount,
              )
            }}
          </strong>
        </article>
      </section>

      <section class="filter-card">
        <input
          v-model="keyword"
          type="search"
          placeholder="搜尋結算編號或名稱"
          :disabled="store.isLoading"
          @keyup.enter="handleSearch"
        >

        <select
          v-model="targetType"
          :disabled="store.isLoading"
          @change="handleTargetTypeChange"
        >
          <option value="">
            全部對象
          </option>

          <option value="merchant">
            商家
          </option>

          <option value="dealer">
            經銷商
          </option>
        </select>

        <select
          v-model="status"
          :disabled="store.isLoading"
          @change="handleStatusChange"
        >
          <option value="">
            全部狀態
          </option>

          <option value="pending">
            待處理
          </option>

          <option value="reviewing">
            審核中
          </option>

          <option value="approved">
            已通過
          </option>

          <option value="processing">
            付款中
          </option>

          <option value="completed">
            已完成
          </option>

          <option value="rejected">
            已拒絕
          </option>
        </select>

        <select
          v-model="settlementCycle"
          :disabled="store.isLoading"
          @change="handleSettlementCycleChange"
        >
          <option value="">
            全部週期
          </option>

          <option value="daily">
            日結
          </option>

          <option value="weekly">
            週結
          </option>

          <option value="monthly">
            月結
          </option>
        </select>

        <input
          v-model="startDate"
          type="date"
          :disabled="store.isLoading"
          @change="handleDateChange"
        >

        <input
          v-model="endDate"
          type="date"
          :disabled="store.isLoading"
          @change="handleDateChange"
        >

        <button
          class="primary-button"
          type="button"
          @click="handleSearch"
        >
          搜尋
        </button>

        <button
          type="button"
          @click="handleReset"
        >
          重設
        </button>
      </section>

      <section class="table-card">
        <div
          v-if="store.error"
          class="error-panel"
        >
          {{ store.error }}
        </div>

        <div
          v-else-if="store.isLoading"
          class="state-panel"
        >
          正在載入結算資料...
        </div>

        <div
          v-else-if="store.requests.length===0"
          class="state-panel"
        >
          暫無結算資料
        </div>

        <div
          v-else
          class="table-wrapper"
        >
          <table>
            <thead>
              <tr>
                <th>結算編號</th>
                <th>對象</th>
                <th>週期</th>
                <th>訂單數</th>
                <th>交易總額</th>
                <th>服務費</th>
                <th>調整</th>
                <th>實際結算</th>
                <th>狀態</th>
                <th>操作</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="item in store.requests"
                :key="item.id"
              >
                <td>
                  <strong class="settlement-no">
                    {{ item.settlementNo }}
                  </strong>
                </td>

                <td>
                  {{ item.targetName }}
                </td>

                <td>
                  {{
                    settlementCycleText(
                      item.settlementCycle,
                    )
                  }}
                </td>

                <td>
                  {{ item.orderCount }}
                </td>

                <td>
                  {{
                    formatMoney(
                      item.grossAmount,
                      item.currency,
                    )
                  }}
                </td>

                <td>
                  {{
                    formatMoney(
                      item.serviceFee,
                      item.currency,
                    )
                  }}
                </td>

                <td>
                  {{
                    formatMoney(
                      item.adjustmentAmount,
                      item.currency,
                    )
                  }}
                </td>

                <td>
                  <strong class="net-amount">
                    {{
                      formatMoney(
                        item.netAmount,
                        item.currency,
                      )
                    }}
                  </strong>
                </td>

                <td>
                  <span
                    class="status-badge"
                    :class="`status-badge--${item.status}`"
                  >
                    {{
                      statusText(
                        item.status,
                      )
                    }}
                  </span>
                </td>

                <td>
                  <button
                    class="view-button"
                    @click="
                      handleView(
                        item.id,
                      )
                    "
                  >
                    查看
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </AdminLayout>
</template>
<script setup lang="ts">
import {
  onBeforeUnmount,
  onMounted,
  ref,
} from 'vue'

import {
  useRouter,
} from 'vue-router'

import AdminLayout
  from '../../layouts/AdminLayout.vue'

import {
  useFinanceSettlementStore,
} from '../../stores/finance-settlement'

import type {
  FinanceSettlementCycle,
  FinanceSettlementStatus,
  FinanceSettlementTargetType,
} from '../../types/finance-settlement'

const router =
  useRouter()

const store =
  useFinanceSettlementStore()

const keyword =
  ref('')

const targetType =
  ref<
    FinanceSettlementTargetType | ''
  >('')

const status =
  ref<
    FinanceSettlementStatus | ''
  >('')

const settlementCycle =
  ref<
    FinanceSettlementCycle | ''
  >('')

const startDate =
  ref('')

const endDate =
  ref('')

onMounted(async () => {
  keyword.value =
    store.filters.keyword ||
    ''

  targetType.value =
    store.filters.targetType ||
    ''

  status.value =
    store.filters.status ||
    ''

  settlementCycle.value =
    store.filters.settlementCycle ||
    ''

  startDate.value =
    store.filters.startDate ||
    ''

  endDate.value =
    store.filters.endDate ||
    ''

  await store.fetchRequests()
})

onBeforeUnmount(() => {
  store.clearError()
  store.clearMutationMessage()
})

async function handleRefresh():
  Promise<void> {
  await store.fetchRequests()
}

async function handleSearch():
  Promise<void> {
  await store.searchRequests(
    keyword.value,
  )
}

async function handleTargetTypeChange():
  Promise<void> {
  await store.setTargetTypeFilter(
    targetType.value,
  )
}

async function handleStatusChange():
  Promise<void> {
  await store.setStatusFilter(
    status.value,
  )
}

async function handleSettlementCycleChange():
  Promise<void> {
  await store.setSettlementCycleFilter(
    settlementCycle.value,
  )
}

async function handleDateChange():
  Promise<void> {
  await store.setDateRange(
    startDate.value || null,
    endDate.value || null,
  )
}

async function handleReset():
  Promise<void> {
  keyword.value =
    ''

  targetType.value =
    ''

  status.value =
    ''

  settlementCycle.value =
    ''

  startDate.value =
    ''

  endDate.value =
    ''

  await store.resetFilters()
}

function handleView(
  settlementId: string,
): void {
  router.push(
    `/finance/settlements/${settlementId}`,
  )
}

function settlementCycleText(
  value:
    FinanceSettlementCycle,
): string {
  const map:
    Record<
      FinanceSettlementCycle,
      string
    > = {
      daily:
        '日結',

      weekly:
        '週結',

      monthly:
        '月結',
    }

  return map[value]
}

function statusText(
  value:
    FinanceSettlementStatus,
): string {
  const map:
    Record<
      FinanceSettlementStatus,
      string
    > = {
      pending:
        '待處理',

      reviewing:
        '審核中',

      approved:
        '已通過',

      processing:
        '付款中',

      completed:
        '已完成',

      rejected:
        '已拒絕',
    }

  return map[value]
}

function formatMoney(
  amount: number,
  currency = 'TWD',
): string {
  const normalizedAmount =
    Number.isFinite(amount)
      ? amount
      : 0

  try {
    return new Intl.NumberFormat(
      'zh-TW',
      {
        style:
          'currency',

        currency,

        maximumFractionDigits:
          0,
      },
    ).format(
      normalizedAmount,
    )
  } catch {
    return `${currency} ${normalizedAmount.toLocaleString(
      'zh-TW',
    )}`
  }
}
</script>
<style scoped>
.settlement-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
}

.page-eyebrow {
  margin: 0;
  color: #3157d6;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.page-header h1 {
  margin: 8px 0;
  color: #0f172a;
  font-size: 34px;
  font-weight: 800;
}

.page-description {
  margin: 0;
  color: #64748b;
  line-height: 1.7;
}

.refresh-button {
  min-height: 42px;
  padding: 0 18px;
  border: 0;
  border-radius: 10px;
  background: #3157d6;
  color: #ffffff;
  cursor: pointer;
  font: inherit;
  font-weight: 700;
}

.refresh-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.stats-grid {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
  gap: 18px;
}

.stat-card {
  padding: 22px;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  background: #ffffff;
}

.stat-card span {
  display: block;
  margin-bottom: 10px;
  color: #64748b;
  font-size: 13px;
}

.stat-card strong {
  color: #0f172a;
  font-size: 26px;
  font-weight: 800;
  overflow-wrap: anywhere;
}

.filter-card {
  display: flex;
  padding: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  background: #ffffff;
}

.filter-card input,
.filter-card select,
.filter-card button {
  min-height: 42px;
  border-radius: 10px;
  font: inherit;
}

.filter-card input,
.filter-card select {
  padding: 0 14px;
  border: 1px solid #dbe2ea;
  background: #ffffff;
}

.filter-card input[type='search'] {
  min-width: 280px;
  flex: 1;
}

.filter-card button {
  padding: 0 18px;
  border: 1px solid #dbe2ea;
  background: #ffffff;
  cursor: pointer;
  font-weight: 700;
}

.filter-card button:disabled,
.filter-card input:disabled,
.filter-card select:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.filter-card .primary-button {
  border-color: #3157d6;
  background: #3157d6;
  color: #ffffff;
}

.table-card {
  overflow: hidden;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  background: #ffffff;
}

.table-wrapper {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: #f8fafc;
}

th,
td {
  padding: 16px;
  text-align: left;
  white-space: nowrap;
}

th {
  color: #64748b;
  font-size: 13px;
  font-weight: 700;
}

td {
  border-top: 1px solid #eef2f7;
  color: #334155;
}

tbody tr:hover {
  background: #f8fbff;
}

.settlement-no {
  color: #3157d6;
  font-weight: 800;
}

.net-amount {
  color: #15803d;
}

.status-badge {
  display: inline-flex;
  min-height: 28px;
  padding: 5px 12px;
  border-radius: 999px;
  align-items: center;
  font-size: 12px;
  font-weight: 800;
}

.status-badge--pending {
  background: #fef3c7;
  color: #b45309;
}

.status-badge--reviewing {
  background: #e0e7ff;
  color: #4338ca;
}

.status-badge--approved {
  background: #dbeafe;
  color: #1d4ed8;
}

.status-badge--processing {
  background: #ede9fe;
  color: #6d28d9;
}

.status-badge--completed {
  background: #dcfce7;
  color: #15803d;
}

.status-badge--rejected {
  background: #fee2e2;
  color: #b91c1c;
}

.view-button {
  min-height: 36px;
  padding: 0 14px;
  border: 0;
  border-radius: 8px;
  background: #3157d6;
  color: #ffffff;
  cursor: pointer;
  font: inherit;
  font-weight: 700;
}

.error-panel {
  padding: 18px;
  border-bottom: 1px solid #fecaca;
  background: #fef2f2;
  color: #b91c1c;
}

.state-panel {
  padding: 48px 24px;
  color: #64748b;
  text-align: center;
}

@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
  }

  .refresh-button {
    width: 100%;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .filter-card {
    align-items: stretch;
    flex-direction: column;
  }

  .filter-card input,
  .filter-card select,
  .filter-card button {
    width: 100%;
  }
}
</style>