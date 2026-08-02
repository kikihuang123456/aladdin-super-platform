<template>
  <AdminLayout>
    <div class="refund-page">
      <section class="page-header">
        <div>
          <p class="page-eyebrow">
            FINANCE REFUND ERP
          </p>

          <h1>
            退款申請管理
          </h1>

          <p class="page-description">
            管理訂單退款申請、審核狀態、退款方式與完成進度。
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
          <span>全部申請</span>
          <strong>
            {{ store.statistics.total }}
          </strong>
        </article>

        <article class="stat-card">
          <span>待審核</span>
          <strong>
            {{ store.statistics.pending }}
          </strong>
        </article>

        <article class="stat-card">
          <span>已通過</span>
          <strong>
            {{ store.statistics.approved }}
          </strong>
        </article>

        <article class="stat-card">
          <span>處理中</span>
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
          <span>已拒絕</span>
          <strong>
            {{ store.statistics.rejected }}
          </strong>
        </article>

        <article class="stat-card">
          <span>申請金額</span>
          <strong>
            {{
              formatMoney(
                store.statistics.requestedAmount,
              )
            }}
          </strong>
        </article>

        <article class="stat-card">
          <span>完成退款金額</span>
          <strong>
            {{
              formatMoney(
                store.statistics.completedAmount,
              )
            }}
          </strong>
        </article>
      </section>

      <section class="filter-card">
        <input
          v-model="keyword"
          type="search"
          placeholder="搜尋退款編號、訂單編號、姓名或電話"
          :disabled="store.isLoading"
          @keyup.enter="handleSearch"
        >

        <select
          v-model="applicantType"
          :disabled="store.isLoading"
          @change="handleApplicantTypeChange"
        >
          <option value="">
            全部申請人
          </option>

          <option value="member">
            會員
          </option>

          <option value="merchant">
            商家
          </option>

          <option value="admin">
            管理員
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
            待審核
          </option>

          <option value="approved">
            已通過
          </option>

          <option value="rejected">
            已拒絕
          </option>

          <option value="processing">
            處理中
          </option>

          <option value="completed">
            已完成
          </option>

          <option value="cancelled">
            已取消
          </option>
        </select>

        <select
          v-model="refundMethod"
          :disabled="store.isLoading"
          @change="handleRefundMethodChange"
        >
          <option value="">
            全部退款方式
          </option>

          <option value="original_payment">
            原支付方式
          </option>

          <option value="wallet">
            錢包
          </option>

          <option value="bank_transfer">
            銀行轉帳
          </option>

          <option value="wechat">
            微信
          </option>

          <option value="alipay">
            支付寶
          </option>

          <option value="linepay">
            LINE Pay
          </option>

          <option value="other">
            其他
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

        <select
          v-model.number="pageSize"
          :disabled="store.isLoading"
          @change="handlePageSizeChange"
        >
          <option :value="20">
            20 筆
          </option>

          <option :value="50">
            50 筆
          </option>

          <option :value="100">
            100 筆
          </option>
        </select>

        <button
          class="primary-button"
          type="button"
          :disabled="store.isLoading"
          @click="handleSearch"
        >
          搜尋
        </button>

        <button
          type="button"
          :disabled="store.isLoading"
          @click="handleReset"
        >
          重設
        </button>
      </section>

      <section class="table-card">
        <div
          v-if="store.error"
          class="error-panel"
          role="alert"
        >
          {{ store.error }}
        </div>

        <div
          v-if="store.isLoading"
          class="state-panel"
        >
          正在載入退款申請資料...
        </div>

        <div
          v-else-if="
            !store.error &&
            store.requests.length === 0
          "
          class="state-panel"
        >
          暫無退款申請資料
        </div>

        <div
          v-else-if="!store.error"
          class="table-wrapper"
        >
          <table>
            <thead>
              <tr>
                <th>退款編號</th>
                <th>訂單編號</th>
                <th>申請人</th>
                <th>退款原因</th>
                <th>申請金額</th>
                <th>核准金額</th>
                <th>實際退款</th>
                <th>退款方式</th>
                <th>狀態</th>
                <th>申請時間</th>
                <th>操作</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="request in store.requests"
                :key="request.id"
              >
                <td>
                  <strong class="refund-number">
                    {{ request.refundNo }}
                  </strong>
                </td>

                <td>
                  {{ request.orderNo }}
                </td>

                <td>
                  <div class="applicant-info">
                    <strong>
                      {{
                        request.applicantName ||
                        '未命名'
                      }}
                    </strong>

                    <span>
                      {{
                        request.applicantPhone ||
                        '-'
                      }}
                    </span>
                  </div>
                </td>

                <td>
                  {{
                    reasonTypeText(
                      request.reasonType,
                    )
                  }}
                </td>

                <td>
                  {{
                    formatMoney(
                      request.requestedAmount,
                      request.currency,
                    )
                  }}
                </td>

                <td>
                  {{
                    formatMoney(
                      request.approvedAmount,
                      request.currency,
                    )
                  }}
                </td>

                <td>
                  <strong class="actual-amount">
                    {{
                      formatMoney(
                        request.actualRefundAmount,
                        request.currency,
                      )
                    }}
                  </strong>
                </td>

                <td>
                  {{
                    refundMethodText(
                      request.refundMethod,
                    )
                  }}
                </td>

                <td>
                  <span
                    class="status-badge"
                    :class="
                      `status-badge--${request.status}`
                    "
                  >
                    {{
                      statusText(
                        request.status,
                      )
                    }}
                  </span>
                </td>

                <td>
                  {{
                    formatDate(
                      request.createdAt,
                    )
                  }}
                </td>

                <td>
                  <button
                    class="view-button"
                    type="button"
                    @click="
                      handleView(
                        request.id,
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

        <footer
          v-if="
            !store.isLoading &&
            !store.error &&
            store.pagination.total > 0
          "
          class="pagination"
        >
          <span>
            共
            {{ store.pagination.total }}
            筆
          </span>

          <div>
            <button
              type="button"
              :disabled="
                !store.hasPreviousPage
              "
              @click="handlePreviousPage"
            >
              上一頁
            </button>

            <span>
              第
              {{ store.pagination.page }}
              /
              {{
                store.pagination.totalPages ||
                1
              }}
              頁
            </span>

            <button
              type="button"
              :disabled="
                !store.hasNextPage
              "
              @click="handleNextPage"
            >
              下一頁
            </button>
          </div>
        </footer>
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
  useFinanceRefundStore,
} from '../../stores/finance-refund'

import type {
  FinanceRefundApplicantType,
  FinanceRefundMethod,
  FinanceRefundReasonType,
  FinanceRefundStatus,
} from '../../types/finance-refund'

const router =
  useRouter()

const store =
  useFinanceRefundStore()

const keyword =
  ref('')

const applicantType =
  ref<
    FinanceRefundApplicantType | ''
  >('')

const status =
  ref<
    FinanceRefundStatus | ''
  >('')

const refundMethod =
  ref<
    FinanceRefundMethod | ''
  >('')

const startDate =
  ref('')

const endDate =
  ref('')

const pageSize =
  ref(20)

onMounted(async () => {
  keyword.value =
    store.filters.keyword || ''

  applicantType.value =
    store.filters.applicantType || ''

  status.value =
    store.filters.status || ''

  refundMethod.value =
    store.filters.refundMethod || ''

  startDate.value =
    store.filters.startDate || ''

  endDate.value =
    store.filters.endDate || ''

  pageSize.value =
    store.filters.pageSize

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

async function handleApplicantTypeChange():
  Promise<void> {
  await store.setApplicantTypeFilter(
    applicantType.value,
  )
}

async function handleStatusChange():
  Promise<void> {
  await store.setStatusFilter(
    status.value,
  )
}

async function handleRefundMethodChange():
  Promise<void> {
  await store.setRefundMethodFilter(
    refundMethod.value,
  )
}

async function handleDateChange():
  Promise<void> {
  await store.setDateRange(
    startDate.value || null,
    endDate.value || null,
  )
}

async function handlePageSizeChange():
  Promise<void> {
  await store.setPageSize(
    pageSize.value,
  )
}

async function handleReset():
  Promise<void> {
  keyword.value = ''
  applicantType.value = ''
  status.value = ''
  refundMethod.value = ''
  startDate.value = ''
  endDate.value = ''
  pageSize.value = 20

  await store.resetFilters()
}

async function handlePreviousPage():
  Promise<void> {
  if (!store.hasPreviousPage) {
    return
  }

  await store.setPage(
    store.pagination.page - 1,
  )
}

async function handleNextPage():
  Promise<void> {
  if (!store.hasNextPage) {
    return
  }

  await store.setPage(
    store.pagination.page + 1,
  )
}

function handleView(
  requestId: string,
): void {
  router.push(
    `/finance/refunds/${requestId}`,
  )
}

function refundMethodText(
  value:
    FinanceRefundMethod,
): string {
  const map:
    Record<
      FinanceRefundMethod,
      string
    > = {
      original_payment:
        '原支付方式',

      wallet:
        '錢包',

      bank_transfer:
        '銀行轉帳',

      wechat:
        '微信',

      alipay:
        '支付寶',

      linepay:
        'LINE Pay',

      other:
        '其他',
    }

  return map[value]
}

function reasonTypeText(
  value:
    FinanceRefundReasonType,
): string {
  const map:
    Record<
      FinanceRefundReasonType,
      string
    > = {
      cancel_order:
        '取消訂單',

      product_issue:
        '商品問題',

      shipping_issue:
        '物流問題',

      duplicate_payment:
        '重複付款',

      payment_error:
        '付款異常',

      service_issue:
        '服務問題',

      other:
        '其他',
    }

  return map[value]
}

function statusText(
  value:
    FinanceRefundStatus,
): string {
  const map:
    Record<
      FinanceRefundStatus,
      string
    > = {
      pending:
        '待審核',

      approved:
        '已通過',

      rejected:
        '已拒絕',

      processing:
        '處理中',

      completed:
        '已完成',

      cancelled:
        '已取消',
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
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
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

function formatDate(
  value: string,
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
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    },
  )
}
</script>
<style scoped>
.refund-page {
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

.refund-number {
  color: #3157d6;
  font-weight: 800;
}

.applicant-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.applicant-info span {
  color: #94a3b8;
  font-size: 12px;
}

.actual-amount {
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

.status-badge--rejected,
.status-badge--cancelled {
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

.pagination {
  display: flex;
  padding: 20px;
  border-top: 1px solid #eef2f7;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.pagination > div {
  display: flex;
  align-items: center;
  gap: 16px;
}

.pagination button {
  min-height: 36px;
  padding: 0 14px;
  border: 1px solid #dbe2ea;
  border-radius: 8px;
  background: #ffffff;
  cursor: pointer;
  font: inherit;
}

.pagination button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
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

  .pagination {
    align-items: stretch;
    flex-direction: column;
  }

  .pagination > div {
    justify-content: space-between;
  }
}
</style>