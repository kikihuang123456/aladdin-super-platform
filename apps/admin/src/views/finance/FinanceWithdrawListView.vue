<template>
  <AdminLayout>
    <div class="withdraw-page">
      <section class="page-header">
        <div>
          <p class="page-eyebrow">
            FINANCE WITHDRAW ERP
          </p>

          <h1>
            提款申請管理
          </h1>

          <p class="page-description">
            管理會員、商家與經銷商的提款申請、審核狀態及撥款進度。
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
          <span>
            全部申請
          </span>

          <strong>
            {{ store.statistics.total }}
          </strong>
        </article>

        <article class="stat-card">
          <span>
            待審核
          </span>

          <strong>
            {{ store.statistics.pending }}
          </strong>
        </article>

        <article class="stat-card">
          <span>
            已通過
          </span>

          <strong>
            {{ store.statistics.approved }}
          </strong>
        </article>

        <article class="stat-card">
          <span>
            處理中
          </span>

          <strong>
            {{ store.statistics.processing }}
          </strong>
        </article>

        <article class="stat-card">
          <span>
            已完成
          </span>

          <strong>
            {{ store.statistics.completed }}
          </strong>
        </article>

        <article class="stat-card">
          <span>
            已拒絕
          </span>

          <strong>
            {{ store.statistics.rejected }}
          </strong>
        </article>

        <article class="stat-card">
          <span>
            待處理金額
          </span>

          <strong>
            {{
              formatMoney(
                store.statistics.pendingAmount,
              )
            }}
          </strong>
        </article>

        <article class="stat-card">
          <span>
            已完成金額
          </span>

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
          placeholder="搜尋提款編號、姓名、電話或收款帳號"
          :disabled="store.isLoading"
          @keyup.enter="handleSearch"
        >

        <select
          v-model="ownerType"
          :disabled="store.isLoading"
          @change="handleOwnerTypeChange"
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
          正在載入提款申請資料...
        </div>

        <div
          v-else-if="
            !store.error &&
            store.requests.length === 0
          "
          class="state-panel"
        >
          暫無提款申請資料
        </div>

        <div
          v-else-if="!store.error"
          class="table-wrapper"
        >
          <table>
            <thead>
              <tr>
                <th>
                  提款編號
                </th>

                <th>
                  申請人
                </th>

                <th>
                  類型
                </th>

                <th>
                  申請金額
                </th>

                <th>
                  手續費
                </th>

                <th>
                  實付金額
                </th>

                <th>
                  收款方式
                </th>

                <th>
                  狀態
                </th>

                <th>
                  申請時間
                </th>

                <th>
                  操作
                </th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="request in store.requests"
                :key="request.id"
              >
                <td>
                  <strong class="withdraw-number">
                    {{ request.withdrawNo }}
                  </strong>
                </td>

                <td>
                  <div class="owner-info">
                    <strong>
                      {{
                        request.ownerName ||
                        '未命名'
                      }}
                    </strong>

                    <span>
                      {{
                        request.ownerPhone ||
                        '-'
                      }}
                    </span>
                  </div>
                </td>

                <td>
                  {{
                    ownerTypeText(
                      request.ownerType,
                    )
                  }}
                </td>

                <td>
                  {{
                    formatMoney(
                      request.amount,
                      request.currency,
                    )
                  }}
                </td>

                <td>
                  {{
                    formatMoney(
                      request.feeAmount,
                      request.currency,
                    )
                  }}
                </td>

                <td>
                  <strong class="actual-amount">
                    {{
                      formatMoney(
                        request.actualAmount,
                        request.currency,
                      )
                    }}
                  </strong>
                </td>

                <td>
                  {{
                    accountTypeText(
                      request.accountType,
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
  useFinanceWithdrawStore,
} from '../../stores/finance-withdraw'

import type {
  FinanceWithdrawAccountType,
  FinanceWithdrawOwnerType,
  FinanceWithdrawStatus,
} from '../../types/finance-withdraw'

const router =
  useRouter()

const store =
  useFinanceWithdrawStore()

const keyword =
  ref('')

const ownerType =
  ref<
    FinanceWithdrawOwnerType | ''
  >('')

const status =
  ref<
    FinanceWithdrawStatus | ''
  >('')

const startDate =
  ref('')

const endDate =
  ref('')

const pageSize =
  ref(20)

onMounted(async () => {
  keyword.value =
    store.filters.keyword ||
    ''

  ownerType.value =
    store.filters.ownerType ||
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

async function handleOwnerTypeChange():
  Promise<void> {
  await store.setOwnerTypeFilter(
    ownerType.value,
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

async function handlePageSizeChange():
  Promise<void> {
  await store.setPageSize(
    pageSize.value,
  )
}

async function handleReset():
  Promise<void> {
  keyword.value = ''
  ownerType.value = ''
  status.value = ''
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
    `/finance/withdraws/${requestId}`,
  )
}

function ownerTypeText(
  value:
    FinanceWithdrawOwnerType,
): string {
  const map:
    Record<
      FinanceWithdrawOwnerType,
      string
    > = {
      member: '會員',
      merchant: '商家',
      dealer: '經銷商',
    }

  return map[value]
}

function accountTypeText(
  value:
    FinanceWithdrawAccountType,
): string {
  const map:
    Record<
      FinanceWithdrawAccountType,
      string
    > = {
      bank: '銀行帳戶',
      wechat: '微信',
      alipay: '支付寶',
      linepay: 'LINE Pay',
      other: '其他',
    }

  return map[value]
}

function statusText(
  value:
    FinanceWithdrawStatus,
): string {
  const map:
    Record<
      FinanceWithdrawStatus,
      string
    > = {
      pending: '待審核',
      approved: '已通過',
      rejected: '已拒絕',
      processing: '處理中',
      completed: '已完成',
      cancelled: '已取消',
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
.withdraw-page {
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
  font-size: 13px;
  font-weight: 800;
  color: #3157d6;
  letter-spacing: .08em;
}

.page-header h1 {
  margin: 8px 0;
  font-size: 34px;
  font-weight: 800;
  color: #0f172a;
}

.page-description {
  margin: 0;
  color: #64748b;
  line-height: 1.7;
}

.refresh-button {
  height: 42px;
  padding: 0 18px;
  border: none;
  border-radius: 10px;
  background: #3157d6;
  color: #fff;
  cursor: pointer;
}

.refresh-button:disabled {
  opacity: .6;
  cursor: not-allowed;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0,1fr));
  gap: 18px;
}

.stat-card {
  padding: 22px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
}

.stat-card span {
  display: block;
  margin-bottom: 10px;
  font-size: 13px;
  color: #64748b;
}

.stat-card strong {
  font-size: 26px;
  font-weight: 700;
  color: #0f172a;
}

.filter-card {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 20px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
}

.filter-card input,
.filter-card select {
  height: 42px;
  padding: 0 14px;
  border: 1px solid #dbe2ea;
  border-radius: 10px;
  background: #fff;
}

.filter-card input[type="search"] {
  flex: 1;
  min-width: 260px;
}

.filter-card button {
  height: 42px;
  padding: 0 18px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
}

.primary-button {
  background: #3157d6;
  color: #fff;
}

.table-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  overflow: hidden;
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

th {
  padding: 16px;
  text-align: left;
  font-size: 13px;
  font-weight: 700;
  color: #64748b;
  white-space: nowrap;
}

td {
  padding: 16px;
  border-top: 1px solid #eef2f7;
  vertical-align: middle;
}

.withdraw-number {
  color: #3157d6;
  font-weight: 700;
}

.owner-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.owner-info span {
  font-size: 12px;
  color: #94a3b8;
}

.actual-amount {
  color: #16a34a;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
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
  height: 36px;
  padding: 0 14px;
  border: none;
  border-radius: 8px;
  background: #3157d6;
  color: #fff;
  cursor: pointer;
}

.error-panel {
  padding: 18px;
  background: #fee2e2;
  color: #b91c1c;
}

.state-panel {
  padding: 40px;
  text-align: center;
  color: #64748b;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-top: 1px solid #eef2f7;
}

.pagination div {
  display: flex;
  align-items: center;
  gap: 16px;
}

.pagination button {
  height: 36px;
  padding: 0 14px;
  border: 1px solid #dbe2ea;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
}

.pagination button:disabled {
  opacity: .45;
  cursor: not-allowed;
}

@media (max-width:1200px) {
  .stats-grid {
    grid-template-columns: repeat(2,1fr);
  }
}

@media (max-width:768px) {
  .page-header {
    flex-direction: column;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .filter-card {
    flex-direction: column;
  }

  .filter-card input,
  .filter-card select,
  .filter-card button {
    width: 100%;
  }
}
</style>