<template>
  <AdminLayout>
    <div class="finance-dashboard">
      <section class="page-header">
        <div>
          <p class="page-eyebrow">
            FINANCE ERP CONTROL CENTER
          </p>

          <h1>
            財務中心
          </h1>

          <p class="page-description">
            統整交易、錢包、提款、退款、結算、報表與稽核資料。
          </p>
        </div>

        <div class="header-actions">
          <select
            v-model="currency"
            :disabled="store.isLoading"
            @change="handleCurrencyChange"
          >
            <option value="TWD">
              TWD
            </option>

            <option value="CNY">
              CNY
            </option>

            <option value="USD">
              USD
            </option>
          </select>

          <button
            type="button"
            :disabled="store.isLoading"
            @click="handleRefresh"
          >
            重新整理
          </button>
        </div>
      </section>

      <section class="filter-card">
        <label>
          <span>
            開始日期
          </span>

          <input
            v-model="startDate"
            type="date"
            :disabled="store.isLoading"
          >
        </label>

        <label>
          <span>
            結束日期
          </span>

          <input
            v-model="endDate"
            type="date"
            :disabled="store.isLoading"
          >
        </label>

        <button
          class="primary-button"
          type="button"
          :disabled="store.isLoading"
          @click="handleDateSearch"
        >
          查詢
        </button>

        <button
          type="button"
          :disabled="store.isLoading"
          @click="handleReset"
        >
          重設
        </button>
      </section>

      <div
        v-if="store.error"
        class="error-panel"
      >
        {{ store.error }}
      </div>

      <div
        v-if="store.isLoading"
        class="state-panel"
      >
        正在載入財務中心資料...
      </div>

      <template v-else>
        <section class="kpi-grid">
          <article class="kpi-card">
            <span>
              總收入
            </span>

            <strong class="income">
              {{
                formatMoney(
                  store.summary.totalIncome,
                )
              }}
            </strong>
          </article>

          <article class="kpi-card">
            <span>
              總支出
            </span>

            <strong class="expense">
              {{
                formatMoney(
                  store.summary.totalExpense,
                )
              }}
            </strong>
          </article>

          <article class="kpi-card">
            <span>
              淨收入
            </span>

            <strong
              :class="{
                income:
                  store.summary.netIncome >= 0,
                expense:
                  store.summary.netIncome < 0,
              }"
            >
              {{
                formatMoney(
                  store.summary.netIncome,
                )
              }}
            </strong>
          </article>

          <article class="kpi-card">
            <span>
              錢包總餘額
            </span>

            <strong>
              {{
                formatMoney(
                  store.summary.walletBalance,
                )
              }}
            </strong>
          </article>

          <article class="kpi-card">
            <span>
              可用餘額
            </span>

            <strong>
              {{
                formatMoney(
                  store.summary.availableBalance,
                )
              }}
            </strong>
          </article>

          <article class="kpi-card">
            <span>
              凍結金額
            </span>

            <strong class="warning">
              {{
                formatMoney(
                  store.summary.frozenBalance,
                )
              }}
            </strong>
          </article>

          <article class="kpi-card">
            <span>
              待審提款
            </span>

            <strong>
              {{ store.summary.pendingWithdrawCount }}
            </strong>

            <small>
              {{
                formatMoney(
                  store.summary.pendingWithdrawAmount,
                )
              }}
            </small>
          </article>

          <article class="kpi-card">
            <span>
              待審退款
            </span>

            <strong>
              {{ store.summary.pendingRefundCount }}
            </strong>

            <small>
              {{
                formatMoney(
                  store.summary.pendingRefundAmount,
                )
              }}
            </small>
          </article>

          <article class="kpi-card">
            <span>
              待處理結算
            </span>

            <strong>
              {{ store.summary.pendingSettlementCount }}
            </strong>

            <small>
              {{
                formatMoney(
                  store.summary.pendingSettlementAmount,
                )
              }}
            </small>
          </article>

          <article class="kpi-card">
            <span>
              稽核失敗
            </span>

            <strong class="expense">
              {{ store.summary.failedAuditCount }}
            </strong>
          </article>
        </section>

        <section class="module-grid">
          <button
            v-for="item in store.modules"
            :key="item.key"
            class="module-card"
            :class="`module-card--${item.status}`"
            type="button"
            @click="handleModuleOpen(item.path)"
          >
            <span>
              {{ item.label }}
            </span>

            <strong>
              {{ item.count }}
            </strong>

            <small v-if="item.amount !== undefined">
              {{
                formatMoney(
                  item.amount,
                )
              }}
            </small>
          </button>
        </section>

        <section class="content-grid">
          <article class="panel-card">
            <header>
              <div>
                <h2>
                  收支趨勢
                </h2>

                <p>
                  依日期彙總收入、支出與淨收入。
                </p>
              </div>
            </header>

            <div
              v-if="store.trends.length === 0"
              class="empty-panel"
            >
              暫無趨勢資料
            </div>

            <div
              v-else
              class="trend-list"
            >
              <div
                v-for="item in store.trends"
                :key="item.date"
                class="trend-row"
              >
                <span>
                  {{ item.date }}
                </span>

                <strong class="income">
                  收入
                  {{
                    formatMoney(
                      item.income,
                    )
                  }}
                </strong>

                <strong class="expense">
                  支出
                  {{
                    formatMoney(
                      item.expense,
                    )
                  }}
                </strong>

                <strong>
                  淨額
                  {{
                    formatMoney(
                      item.netIncome,
                    )
                  }}
                </strong>
              </div>
            </div>
          </article>

          <article class="panel-card">
            <header>
              <div>
                <h2>
                  處理狀態
                </h2>

                <p>
                  財務工作目前處理進度。
                </p>
              </div>
            </header>

            <div class="status-grid">
              <div>
                <span>
                  待處理交易
                </span>

                <strong>
                  {{ store.statusSummary.pendingTransactions }}
                </strong>
              </div>

              <div>
                <span>
                  失敗交易
                </span>

                <strong class="expense">
                  {{ store.statusSummary.failedTransactions }}
                </strong>
              </div>

              <div>
                <span>
                  提款處理中
                </span>

                <strong>
                  {{ store.statusSummary.processingWithdraws }}
                </strong>
              </div>

              <div>
                <span>
                  退款處理中
                </span>

                <strong>
                  {{ store.statusSummary.processingRefunds }}
                </strong>
              </div>

              <div>
                <span>
                  結算付款中
                </span>

                <strong>
                  {{ store.statusSummary.processingSettlements }}
                </strong>
              </div>

              <div>
                <span>
                  已完成結算
                </span>

                <strong class="income">
                  {{ store.statusSummary.completedSettlements }}
                </strong>
              </div>
            </div>
          </article>
        </section>

        <section class="content-grid">
          <article class="panel-card">
            <header>
              <div>
                <h2>
                  最近財務交易
                </h2>

                <p>
                  最新八筆財務異動。
                </p>
              </div>

              <button
                type="button"
                @click="
                  handleModuleOpen(
                    '/finance/transactions',
                  )
                "
              >
                查看全部
              </button>
            </header>

            <div
              v-if="
                store.recentTransactions.length === 0
              "
              class="empty-panel"
            >
              暫無交易資料
            </div>

            <div
              v-else
              class="record-list"
            >
              <button
                v-for="
                  item in store.recentTransactions
                "
                :key="item.id"
                type="button"
                @click="
                  handleModuleOpen(
                    `/finance/transactions/${item.id}`,
                  )
                "
              >
                <div>
                  <strong>
                    {{ item.transactionNo }}
                  </strong>

                  <span>
                    {{
                      item.memberName ||
                      item.phone ||
                      '-'
                    }}
                  </span>
                </div>

                <strong>
                  {{
                    formatMoney(
                      item.amount,
                      item.currency,
                    )
                  }}
                </strong>
              </button>
            </div>
          </article>

          <article class="panel-card">
            <header>
              <div>
                <h2>
                  最近稽核紀錄
                </h2>

                <p>
                  最新八筆財務操作紀錄。
                </p>
              </div>

              <button
                type="button"
                @click="
                  handleModuleOpen(
                    '/finance/audit-logs',
                  )
                "
              >
                查看全部
              </button>
            </header>

            <div
              v-if="
                store.recentAuditLogs.length === 0
              "
              class="empty-panel"
            >
              暫無稽核紀錄
            </div>

            <div
              v-else
              class="record-list"
            >
              <button
                v-for="
                  item in store.recentAuditLogs
                "
                :key="item.id"
                type="button"
                @click="
                  handleModuleOpen(
                    `/finance/audit-logs/${item.id}`,
                  )
                "
              >
                <div>
                  <strong>
                    {{ item.auditNo }}
                  </strong>

                  <span>
                    {{
                      item.operatorName ||
                      item.operatorRole ||
                      '-'
                    }}
                  </span>
                </div>

                <span
                  class="result-badge"
                  :class="
                    `result-badge--${item.result}`
                  "
                >
                  {{
                    item.result === 'success'
                      ? '成功'
                      : '失敗'
                  }}
                </span>
              </button>
            </div>
          </article>
        </section>
      </template>
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
  useFinanceDashboardStore,
} from '../../stores/finance-dashboard'

const router =
  useRouter()

const store =
  useFinanceDashboardStore()

const startDate =
  ref('')

const endDate =
  ref('')

const currency =
  ref('TWD')

onMounted(async () => {
  startDate.value =
    store.filters.startDate ||
    ''

  endDate.value =
    store.filters.endDate ||
    ''

  currency.value =
    store.filters.currency ||
    'TWD'

  await store.fetchDashboard()
})

onBeforeUnmount(() => {
  store.clearError()
})

async function handleRefresh():
  Promise<void> {
  await store.fetchDashboard()
}

async function handleDateSearch():
  Promise<void> {
  await store.setDateRange(
    startDate.value || null,
    endDate.value || null,
  )
}

async function handleCurrencyChange():
  Promise<void> {
  await store.setCurrency(
    currency.value,
  )
}

async function handleReset():
  Promise<void> {
  startDate.value =
    ''

  endDate.value =
    ''

  currency.value =
    'TWD'

  await store.resetFilters()
}

function handleModuleOpen(
  path: string,
): void {
  router.push(
    path,
  )
}

function formatMoney(
  amount: number,
  selectedCurrency =
    currency.value,
): string {
  const normalizedAmount =
    Number.isFinite(amount)
      ? amount
      : 0

  const normalizedCurrency =
    selectedCurrency ||
    'TWD'

  try {
    return new Intl.NumberFormat(
      'zh-TW',
      {
        style:
          'currency',

        currency:
          normalizedCurrency,

        maximumFractionDigits:
          0,
      },
    ).format(
      normalizedAmount,
    )
  } catch {
    return `${normalizedCurrency} ${normalizedAmount.toLocaleString(
      'zh-TW',
    )}`
  }
}
</script>
<style scoped>
.finance-dashboard {
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

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-actions select,
.header-actions button {
  min-height: 42px;
  border-radius: 10px;
  font: inherit;
}

.header-actions select {
  padding: 0 14px;
  border: 1px solid #dbe2ea;
  background: #ffffff;
}

.header-actions button {
  padding: 0 18px;
  border: 0;
  background: #3157d6;
  color: #ffffff;
  cursor: pointer;
  font-weight: 700;
}

.header-actions button:disabled,
.header-actions select:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.filter-card {
  display: flex;
  padding: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  align-items: flex-end;
  gap: 12px;
  flex-wrap: wrap;
  background: #ffffff;
}

.filter-card label {
  display: flex;
  min-width: 180px;
  flex-direction: column;
  gap: 8px;
}

.filter-card label span {
  color: #64748b;
  font-size: 13px;
}

.filter-card input,
.filter-card button {
  min-height: 42px;
  border-radius: 10px;
  font: inherit;
}

.filter-card input {
  padding: 0 14px;
  border: 1px solid #dbe2ea;
  background: #ffffff;
}

.filter-card button {
  padding: 0 18px;
  border: 1px solid #dbe2ea;
  background: #ffffff;
  cursor: pointer;
  font-weight: 700;
}

.filter-card .primary-button {
  border-color: #3157d6;
  background: #3157d6;
  color: #ffffff;
}

.filter-card button:disabled,
.filter-card input:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.error-panel,
.state-panel {
  padding: 28px 24px;
  border-radius: 18px;
  text-align: center;
}

.error-panel {
  border: 1px solid #fecaca;
  background: #fef2f2;
  color: #b91c1c;
}

.state-panel {
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: #64748b;
}

.kpi-grid {
  display: grid;
  grid-template-columns:
    repeat(5, minmax(0, 1fr));
  gap: 18px;
}

.kpi-card {
  display: flex;
  min-width: 0;
  padding: 22px;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  flex-direction: column;
  gap: 10px;
  background: #ffffff;
}

.kpi-card span {
  color: #64748b;
  font-size: 13px;
}

.kpi-card strong {
  overflow-wrap: anywhere;
  color: #0f172a;
  font-size: 24px;
  font-weight: 800;
}

.kpi-card small {
  color: #64748b;
  font-size: 13px;
}

.income {
  color: #15803d !important;
}

.expense {
  color: #b91c1c !important;
}

.warning {
  color: #b45309 !important;
}

.module-grid {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
  gap: 18px;
}

.module-card {
  display: flex;
  min-width: 0;
  min-height: 150px;
  padding: 22px;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  align-items: flex-start;
  flex-direction: column;
  gap: 10px;
  background: #ffffff;
  color: #0f172a;
  cursor: pointer;
  text-align: left;
  font: inherit;
}

.module-card:hover {
  border-color: #3157d6;
  transform: translateY(-2px);
  box-shadow: 0 14px 30px rgba(49, 87, 214, 0.08);
}

.module-card span {
  color: #64748b;
  font-size: 14px;
  font-weight: 700;
}

.module-card strong {
  margin-top: auto;
  font-size: 30px;
  font-weight: 800;
}

.module-card small {
  color: #64748b;
  font-size: 13px;
}

.module-card--warning {
  border-color: #fcd34d;
  background: #fffbeb;
}

.module-card--danger {
  border-color: #fca5a5;
  background: #fef2f2;
}

.content-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.panel-card {
  overflow: hidden;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  background: #ffffff;
}

.panel-card > header {
  display: flex;
  padding: 22px 24px;
  border-bottom: 1px solid #eef2f7;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
}

.panel-card h2 {
  margin: 0;
  color: #0f172a;
  font-size: 22px;
}

.panel-card header p {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 13px;
}

.panel-card header button {
  min-height: 36px;
  padding: 0 14px;
  border: 1px solid #dbe2ea;
  border-radius: 8px;
  background: #ffffff;
  color: #3157d6;
  cursor: pointer;
  font: inherit;
  font-weight: 700;
}

.empty-panel {
  padding: 42px 24px;
  color: #64748b;
  text-align: center;
}

.trend-list {
  display: flex;
  flex-direction: column;
}

.trend-row {
  display: grid;
  grid-template-columns:
    minmax(110px, 0.8fr)
    repeat(3, minmax(140px, 1fr));
  padding: 16px 24px;
  border-top: 1px solid #eef2f7;
  align-items: center;
  gap: 14px;
}

.trend-row:first-child {
  border-top: 0;
}

.trend-row > span {
  color: #64748b;
  font-size: 13px;
}

.trend-row strong {
  font-size: 13px;
  text-align: right;
}

.status-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 14px;
  padding: 22px 24px;
}

.status-grid > div {
  display: flex;
  padding: 16px;
  border: 1px solid #eef2f7;
  border-radius: 14px;
  flex-direction: column;
  gap: 8px;
  background: #f8fafc;
}

.status-grid span {
  color: #64748b;
  font-size: 13px;
}

.status-grid strong {
  color: #0f172a;
  font-size: 24px;
  font-weight: 800;
}

.record-list {
  display: flex;
  flex-direction: column;
}

.record-list > button {
  display: flex;
  width: 100%;
  padding: 16px 24px;
  border: 0;
  border-top: 1px solid #eef2f7;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  background: #ffffff;
  color: #0f172a;
  cursor: pointer;
  text-align: left;
  font: inherit;
}

.record-list > button:first-child {
  border-top: 0;
}

.record-list > button:hover {
  background: #f8fbff;
}

.record-list > button > div {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 4px;
}

.record-list > button > div strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.record-list > button > div span {
  overflow: hidden;
  color: #64748b;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-badge {
  display: inline-flex;
  min-height: 28px;
  padding: 5px 12px;
  border-radius: 999px;
  align-items: center;
  font-size: 12px;
  font-weight: 800;
}

.result-badge--success {
  background: #dcfce7;
  color: #15803d;
}

.result-badge--failed {
  background: #fee2e2;
  color: #b91c1c;
}

@media (max-width: 1400px) {
  .kpi-grid {
    grid-template-columns:
      repeat(3, minmax(0, 1fr));
  }

  .module-grid {
    grid-template-columns:
      repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 1050px) {
  .kpi-grid,
  .module-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
  }

  .header-actions {
    width: 100%;
  }

  .header-actions select,
  .header-actions button {
    flex: 1;
  }

  .filter-card {
    align-items: stretch;
    flex-direction: column;
  }

  .filter-card label,
  .filter-card input,
  .filter-card button {
    width: 100%;
  }

  .kpi-grid,
  .module-grid,
  .status-grid {
    grid-template-columns: 1fr;
  }

  .trend-row {
    grid-template-columns: 1fr;
  }

  .trend-row strong {
    text-align: left;
  }

  .panel-card > header {
    flex-direction: column;
  }

  .panel-card header button {
    width: 100%;
  }
}
</style>