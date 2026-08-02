<template>
  <AdminLayout>
    <div class="report-page">
      <section class="page-header">
        <div>
          <p class="page-eyebrow">
            FINANCE REPORT ERP
          </p>

          <h1>
            財務報表
          </h1>

          <p class="page-description">
            管理日報、月報、年報，統整收入、支出、退款、提款與結算資料。
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
          <span>報表總數</span>
          <strong>
            {{ store.statistics.totalReports }}
          </strong>
        </article>

        <article class="stat-card">
          <span>草稿</span>
          <strong>
            {{ store.statistics.draftReports }}
          </strong>
        </article>

        <article class="stat-card">
          <span>已產生</span>
          <strong>
            {{ store.statistics.generatedReports }}
          </strong>
        </article>

        <article class="stat-card">
          <span>已確認</span>
          <strong>
            {{ store.statistics.confirmedReports }}
          </strong>
        </article>

        <article class="stat-card">
          <span>已封存</span>
          <strong>
            {{ store.statistics.archivedReports }}
          </strong>
        </article>

        <article class="stat-card">
          <span>毛收入</span>
          <strong>
            {{
              formatMoney(
                store.statistics.grossIncome,
              )
            }}
          </strong>
        </article>

        <article class="stat-card">
          <span>總支出</span>
          <strong>
            {{
              formatMoney(
                store.statistics.totalExpense,
              )
            }}
          </strong>
        </article>

        <article class="stat-card">
          <span>淨收入</span>
          <strong class="green">
            {{
              formatMoney(
                store.statistics.netIncome,
              )
            }}
          </strong>
        </article>
      </section>

      <section class="filter-card">
        <input
          v-model="keyword"
          type="search"
          placeholder="搜尋報表編號"
          :disabled="store.isLoading"
          @keyup.enter="handleSearch"
        >

        <select
          v-model="periodType"
          :disabled="store.isLoading"
          @change="handlePeriodTypeChange"
        >
          <option value="">
            全部週期
          </option>

          <option value="daily">
            日報
          </option>

          <option value="monthly">
            月報
          </option>

          <option value="yearly">
            年報
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

          <option value="draft">
            草稿
          </option>

          <option value="generated">
            已產生
          </option>

          <option value="confirmed">
            已確認
          </option>

          <option value="archived">
            已封存
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
          正在載入財務報表...
        </div>

        <div
          v-else-if="store.reports.length===0"
          class="state-panel"
        >
          尚無財務報表
        </div>

        <div
          v-else
          class="table-wrapper"
        >
          <table>
            <thead>
              <tr>
                <th>報表編號</th>
                <th>週期</th>
                <th>期間</th>
                <th>毛收入</th>
                <th>總支出</th>
                <th>淨收入</th>
                <th>狀態</th>
                <th>操作</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="item in store.reports"
                :key="item.id"
              >
                <td>
                  <strong class="report-no">
                    {{ item.reportNo }}
                  </strong>
                </td>

                <td>
                  {{
                    periodTypeText(
                      item.periodType,
                    )
                  }}
                </td>

                <td>
                  {{ item.periodStart }}
                  <br>
                  {{ item.periodEnd }}
                </td>

                <td>
                  {{
                    formatMoney(
                      item.grossIncome,
                      item.currency,
                    )
                  }}
                </td>

                <td>
                  {{
                    formatMoney(
                      item.totalExpense,
                      item.currency,
                    )
                  }}
                </td>

                <td>
                  <strong class="green">
                    {{
                      formatMoney(
                        item.netIncome,
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
  useFinanceReportStore,
} from '../../stores/finance-report'

import type {
  FinanceReportPeriod,
  FinanceReportStatus,
} from '../../types/finance-report'

const router =
  useRouter()

const store =
  useFinanceReportStore()

const keyword =
  ref('')

const periodType =
  ref<
    FinanceReportPeriod | ''
  >('')

const status =
  ref<
    FinanceReportStatus | ''
  >('')

const startDate =
  ref('')

const endDate =
  ref('')

onMounted(async () => {
  keyword.value =
    store.filters.keyword ||
    ''

  periodType.value =
    store.filters.periodType ||
    ''

  status.value =
    store.filters.status ||
    ''

  startDate.value =
    store.filters.startDate ||
    ''

  endDate.value =
    store.filters.endDate ||
    ''

  await store.fetchReports()
})

onBeforeUnmount(() => {
  store.clearError()
  store.clearMutationMessage()
})

async function handleRefresh():
  Promise<void> {
  await store.fetchReports()
}

async function handleSearch():
  Promise<void> {
  await store.searchReports(
    keyword.value,
  )
}

async function handlePeriodTypeChange():
  Promise<void> {
  await store.setPeriodTypeFilter(
    periodType.value,
  )
}

async function handleStatusChange():
  Promise<void> {
  await store.setStatusFilter(
    status.value,
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

  periodType.value =
    ''

  status.value =
    ''

  startDate.value =
    ''

  endDate.value =
    ''

  await store.resetFilters()
}

function handleView(
  reportId: string,
): void {
  router.push(
    `/finance/reports/${reportId}`,
  )
}

function periodTypeText(
  value:
    FinanceReportPeriod,
): string {
  const map:
    Record<
      FinanceReportPeriod,
      string
    > = {
      daily:
        '日報',

      monthly:
        '月報',

      yearly:
        '年報',
    }

  return map[value]
}

function statusText(
  value:
    FinanceReportStatus,
): string {
  const map:
    Record<
      FinanceReportStatus,
      string
    > = {
      draft:
        '草稿',

      generated:
        '已產生',

      confirmed:
        '已確認',

      archived:
        '已封存',
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
.report-page {
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
  overflow-wrap: anywhere;
  color: #0f172a;
  font-size: 26px;
  font-weight: 800;
}

.green {
  color: #15803d !important;
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

.report-no {
  color: #3157d6;
  font-weight: 800;
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

.status-badge--draft {
  background: #f1f5f9;
  color: #475569;
}

.status-badge--generated {
  background: #dbeafe;
  color: #1d4ed8;
}

.status-badge--confirmed {
  background: #dcfce7;
  color: #15803d;
}

.status-badge--archived {
  background: #e2e8f0;
  color: #334155;
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

  table {
    min-width: 900px;
  }
}
</style>