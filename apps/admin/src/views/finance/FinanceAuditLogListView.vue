<template>
  <AdminLayout>
    <div class="audit-log-page">
      <section class="page-header">
        <div>
          <p class="page-eyebrow">
            FINANCE AUDIT ERP
          </p>

          <h1>
            財務稽核紀錄
          </h1>

          <p class="page-description">
            管理所有財務模組操作紀錄、異動快照、操作結果與稽核追蹤。
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
          <span>總紀錄</span>
          <strong>{{ store.statistics.total }}</strong>
        </article>

        <article class="stat-card">
          <span>成功</span>
          <strong class="success">
            {{ store.statistics.success }}
          </strong>
        </article>

        <article class="stat-card">
          <span>失敗</span>
          <strong class="danger">
            {{ store.statistics.failed }}
          </strong>
        </article>

        <article class="stat-card">
          <span>Transaction</span>
          <strong>{{ store.statistics.transaction }}</strong>
        </article>

        <article class="stat-card">
          <span>Wallet</span>
          <strong>{{ store.statistics.wallet }}</strong>
        </article>

        <article class="stat-card">
          <span>Withdraw</span>
          <strong>{{ store.statistics.withdraw }}</strong>
        </article>

        <article class="stat-card">
          <span>Refund</span>
          <strong>{{ store.statistics.refund }}</strong>
        </article>

        <article class="stat-card">
          <span>Settlement</span>
          <strong>{{ store.statistics.settlement }}</strong>
        </article>

        <article class="stat-card">
          <span>Report</span>
          <strong>{{ store.statistics.report }}</strong>
        </article>
      </section>

      <section class="filter-card">
        <input
          v-model="keyword"
          type="search"
          placeholder="搜尋稽核編號 / 單號 / 操作人"
          :disabled="store.isLoading"
          @keyup.enter="handleSearch"
        >

        <select
          v-model="moduleType"
          :disabled="store.isLoading"
          @change="handleModuleChange"
        >
          <option value="">全部模組</option>
          <option value="transaction">Transaction</option>
          <option value="wallet">Wallet</option>
          <option value="withdraw">Withdraw</option>
          <option value="refund">Refund</option>
          <option value="settlement">Settlement</option>
          <option value="report">Report</option>
        </select>

        <select
          v-model="result"
          :disabled="store.isLoading"
          @change="handleResultChange"
        >
          <option value="">全部結果</option>
          <option value="success">成功</option>
          <option value="failed">失敗</option>
        </select>

        <input
          v-model="startDate"
          type="date"
          @change="handleDateChange"
        >

        <input
          v-model="endDate"
          type="date"
          @change="handleDateChange"
        >

        <button
          class="primary-button"
          @click="handleSearch"
        >
          搜尋
        </button>

        <button
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
          正在載入稽核紀錄...
        </div>

        <div
          v-else-if="store.logs.length===0"
          class="state-panel"
        >
          尚無稽核紀錄
        </div>

        <div
          v-else
          class="table-wrapper"
        >
          <table>
            <thead>
              <tr>
                <th>稽核編號</th>
                <th>模組</th>
                <th>操作</th>
                <th>結果</th>
                <th>操作人</th>
                <th>建立時間</th>
                <th>操作</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="item in store.logs"
                :key="item.id"
              >
                <td>
                  <strong class="audit-no">
                    {{ item.auditNo }}
                  </strong>
                </td>

                <td>
                  {{ moduleText(item.module) }}
                </td>

                <td>
                  {{ actionText(item.action) }}
                </td>

                <td>
                  <span
                    class="result-badge"
                    :class="`result-badge--${item.result}`"
                  >
                    {{ resultText(item.result) }}
                  </span>
                </td>

                <td>
                  {{ item.operatorName || '-' }}
                </td>

                <td>
                  {{ formatDate(item.createdAt) }}
                </td>

                <td>
                  <button
                    class="view-button"
                    @click="handleView(item.id)"
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
  useFinanceAuditLogStore,
} from '../../stores/finance-audit-log'

import type {
  FinanceAuditAction,
  FinanceAuditModule,
  FinanceAuditResult,
} from '../../types/finance-audit-log'

const router =
  useRouter()

const store =
  useFinanceAuditLogStore()

const keyword =
  ref('')

const moduleType =
  ref<
    FinanceAuditModule | ''
  >('')

const result =
  ref<
    FinanceAuditResult | ''
  >('')

const startDate =
  ref('')

const endDate =
  ref('')

onMounted(async () => {
  keyword.value =
    store.filters.keyword ||
    ''

  moduleType.value =
    store.filters.module ||
    ''

  result.value =
    store.filters.result ||
    ''

  startDate.value =
    store.filters.startDate ||
    ''

  endDate.value =
    store.filters.endDate ||
    ''

  await store.fetchLogs()
})

onBeforeUnmount(() => {
  store.clearError()
  store.clearMutationMessage()
})

async function handleRefresh():
  Promise<void> {
  await store.fetchLogs()
}

async function handleSearch():
  Promise<void> {
  await store.searchLogs(
    keyword.value,
  )
}

async function handleModuleChange():
  Promise<void> {
  await store.setModuleFilter(
    moduleType.value,
  )
}

async function handleResultChange():
  Promise<void> {
  await store.setResultFilter(
    result.value,
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

  moduleType.value =
    ''

  result.value =
    ''

  startDate.value =
    ''

  endDate.value =
    ''

  await store.resetFilters()
}

function handleView(
  auditLogId: string,
): void {
  router.push(
    `/finance/audit-logs/${auditLogId}`,
  )
}

function moduleText(
  value:
    FinanceAuditModule,
): string {
  const map:
    Record<
      FinanceAuditModule,
      string
    > = {
      transaction:
        '交易',

      wallet:
        '錢包',

      withdraw:
        '提款',

      refund:
        '退款',

      settlement:
        '結算',

      report:
        '報表',
    }

  return map[value]
}

function actionText(
  value:
    FinanceAuditAction,
): string {
  const map:
    Record<
      FinanceAuditAction,
      string
    > = {
      create:
        '建立',

      update:
        '更新',

      approve:
        '通過',

      reject:
        '拒絕',

      process:
        '處理',

      complete:
        '完成',

      cancel:
        '取消',

      confirm:
        '確認',

      archive:
        '封存',

      generate:
        '產生',

      adjust:
        '調整',
    }

  return map[value]
}

function resultText(
  value:
    FinanceAuditResult,
): string {
  const map:
    Record<
      FinanceAuditResult,
      string
    > = {
      success:
        '成功',

      failed:
        '失敗',
    }

  return map[value]
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
    return '-'
  }

  return date.toLocaleString(
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
    },
  )
}
</script>
<style scoped>
.audit-log-page {
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
    repeat(3, minmax(0, 1fr));
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
}

.stat-card .success {
  color: #15803d;
}

.stat-card .danger {
  color: #b91c1c;
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

.audit-no {
  color: #3157d6;
  font-weight: 800;
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

@media (max-width: 1100px) {
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
    min-width: 860px;
  }
}
</style>