<template>
  <AdminLayout>
    <div class="merchant-page">
      <section class="page-header">
        <div>
          <p class="page-eyebrow">
            MERCHANT ERP
          </p>

          <h1>
            商家管理
          </h1>

          <p class="page-description">
            管理商家基本資料、市場區域、審核狀態與營運狀態。
          </p>
        </div>

        <div class="header-actions">
          <button
            class="refresh-button"
            type="button"
            :disabled="store.isLoading"
            @click="handleRefresh"
          >
            重新整理
          </button>

          <button
            v-if="
              permissionStore.hasPermission(
                'merchant.create',
              )
            "
            class="primary-button"
            type="button"
          
        @click="$router.push('/merchants/create')"
      >
            新增商家
          </button>
        </div>
      </section>

      <section class="stats-grid">
        <article class="stat-card">
          <span>
            商家總數
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
            營運中
          </span>

          <strong>
            {{ store.statistics.active }}
          </strong>
        </article>

        <article class="stat-card">
          <span>
            已暫停
          </span>

          <strong>
            {{ store.statistics.suspended }}
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
            已停用
          </span>

          <strong>
            {{ store.statistics.disabled }}
          </strong>
        </article>

        <article class="stat-card">
          <span>
            台灣市場
          </span>

          <strong>
            {{ store.statistics.taiwan }}
          </strong>
        </article>

        <article class="stat-card">
          <span>
            中國市場
          </span>

          <strong>
            {{ store.statistics.china }}
          </strong>
        </article>

        <article class="stat-card">
          <span>
            跨境市場
          </span>

          <strong>
            {{ store.statistics.crossBorder }}
          </strong>
        </article>
      </section>

      <section class="filter-card">
        <input
          v-model="keyword"
          type="search"
          placeholder="搜尋商家編號、名稱、聯絡人、電話或統編"
          :disabled="store.isLoading"
          @keyup.enter="handleSearch"
        >

        <select
          v-model="merchantType"
          :disabled="store.isLoading"
          @change="handleMerchantTypeChange"
        >
          <option value="">
            全部商家類型
          </option>

          <option value="individual">
            個人商家
          </option>

          <option value="company">
            公司商家
          </option>

          <option value="brand">
            品牌商家
          </option>

          <option value="platform">
            平台直營
          </option>
        </select>

        <select
          v-model="market"
          :disabled="store.isLoading"
          @change="handleMarketChange"
        >
          <option value="">
            全部市場
          </option>

          <option value="taiwan">
            台灣
          </option>

          <option value="china">
            中國
          </option>

          <option value="cross_border">
            跨境
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

          <option value="active">
            營運中
          </option>

          <option value="suspended">
            已暫停
          </option>

          <option value="rejected">
            已拒絕
          </option>

          <option value="disabled">
            已停用
          </option>
        </select>

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
          正在載入商家資料...
        </div>

        <div
          v-else-if="
            !store.error &&
            store.merchants.length === 0
          "
          class="state-panel"
        >
          暫無商家資料
        </div>

        <div
          v-else-if="!store.error"
          class="table-wrapper"
        >
          <table>
            <thead>
              <tr>
                <th>商家</th>
                <th>商家編號</th>
                <th>商家類型</th>
                <th>市場</th>
                <th>聯絡人</th>
                <th>聯絡方式</th>
                <th>公司／品牌資訊</th>
                <th>狀態</th>
                <th>建立時間</th>
                <th>操作</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="merchant in store.merchants"
                :key="merchant.id"
              >
                <td>
                  <div class="merchant-info">
                    <div
                      v-if="merchant.logoUrl"
                      class="merchant-logo merchant-logo--image"
                    >
                      <img
                        :src="merchant.logoUrl"
                        :alt="merchant.name"
                      >
                    </div>

                    <div
                      v-else
                      class="merchant-logo"
                    >
                      {{
                        merchantInitial(
                          merchant.name,
                        )
                      }}
                    </div>

                    <div>
                      <strong>
                        {{ merchant.name }}
                      </strong>

                      <span>
                        {{
                          merchant.legalName ||
                          '-'
                        }}
                      </span>
                    </div>
                  </div>
                </td>

                <td>
                  <strong class="merchant-no">
                    {{ merchant.merchantNo }}
                  </strong>
                </td>

                <td>
                  {{
                    merchantTypeText(
                      merchant.merchantType,
                    )
                  }}
                </td>

                <td>
                  {{
                    marketText(
                      merchant.market,
                    )
                  }}
                </td>

                <td>
                  {{
                    merchant.contactName ||
                    '-'
                  }}
                </td>

                <td>
                  <div class="contact-info">
                    <span>
                      {{
                        merchant.contactPhone ||
                        '-'
                      }}
                    </span>

                    <small>
                      {{
                        merchant.contactEmail ||
                        '-'
                      }}
                    </small>
                  </div>
                </td>

                <td>
                  <div class="company-info">
                    <span>
                      執照：
                      {{
                        merchant.businessLicenseNo ||
                        '-'
                      }}
                    </span>

                    <small>
                      稅號：
                      {{
                        merchant.taxNo ||
                        '-'
                      }}
                    </small>
                  </div>
                </td>

                <td>
                  <span
                    class="status-badge"
                    :class="
                      `status-badge--${merchant.status}`
                    "
                  >
                    {{
                      statusText(
                        merchant.status,
                      )
                    }}
                  </span>
                </td>

                <td>
                  {{
                    formatDate(
                      merchant.createdAt,
                    )
                  }}
                </td>

                <td>
                  <div class="action-buttons">
                    <button
                      class="view-button"
                      type="button"
                      @click="
                        handleView(
                          merchant.id,
                        )
                      "
                    >
                      查看
                    </button>

                    <button
                      v-if="
                        merchant.status ===
                          'pending' &&
                        permissionStore.hasPermission(
                          'merchant.approve',
                        )
                      "
                      class="review-button"
                      type="button"
                      @click="
                        handleView(
                          merchant.id,
                        )
                      "
                    >
                      審核
                    </button>
                  </div>
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
  useMerchantStore,
} from '../../stores/merchant'

import {
  usePermissionStore,
} from '../../stores/permission'

import type {
  MerchantMarket,
  MerchantStatus,
  MerchantType,
} from '../../types/merchant'

const router =
  useRouter()

const store =
  useMerchantStore()

const permissionStore =
  usePermissionStore()

const keyword =
  ref('')

const merchantType =
  ref<
    MerchantType | ''
  >('')

const market =
  ref<
    MerchantMarket | ''
  >('')

const status =
  ref<
    MerchantStatus | ''
  >('')

const pageSize =
  ref(20)

onMounted(async () => {
  keyword.value =
    store.filters.keyword ||
    ''

  merchantType.value =
    store.filters.merchantType ||
    ''

  market.value =
    store.filters.market ||
    ''

  status.value =
    store.filters.status ||
    ''

  pageSize.value =
    store.filters.pageSize

  await store.fetchMerchants()
})

onBeforeUnmount(() => {
  store.clearError()
  store.clearMutationMessage()
})

async function handleRefresh():
  Promise<void> {
  await store.fetchMerchants()
}

async function handleSearch():
  Promise<void> {
  await store.searchMerchants(
    keyword.value,
  )
}

async function handleMerchantTypeChange():
  Promise<void> {
  await store.setMerchantTypeFilter(
    merchantType.value,
  )
}

async function handleMarketChange():
  Promise<void> {
  await store.setMarketFilter(
    market.value,
  )
}

async function handleStatusChange():
  Promise<void> {
  await store.setStatusFilter(
    status.value,
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
  keyword.value =
    ''

  merchantType.value =
    ''

  market.value =
    ''

  status.value =
    ''

  pageSize.value =
    20

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
  merchantId: string,
): void {
  router.push(
    `/merchants/${merchantId}`,
  )
}

function merchantInitial(
  name: string,
): string {
  const normalizedName =
    name.trim()

  if (!normalizedName) {
    return '商'
  }

  return normalizedName
    .slice(
      0,
      1,
    )
    .toUpperCase()
}

function merchantTypeText(
  value:
    MerchantType,
): string {
  const map:
    Record<
      MerchantType,
      string
    > = {
      individual:
        '個人商家',

      company:
        '公司商家',

      brand:
        '品牌商家',

      platform:
        '平台直營',
    }

  return map[value]
}

function marketText(
  value:
    MerchantMarket,
): string {
  const map:
    Record<
      MerchantMarket,
      string
    > = {
      taiwan:
        '台灣',

      china:
        '中國',

      cross_border:
        '跨境',
    }

  return map[value]
}

function statusText(
  value:
    MerchantStatus,
): string {
  const map:
    Record<
      MerchantStatus,
      string
    > = {
      pending:
        '待審核',

      approved:
        '已通過',

      rejected:
        '已拒絕',

      active:
        '營運中',

      suspended:
        '已暫停',

      disabled:
        '已停用',
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
.merchant-page {
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

.refresh-button,
.primary-button {
  min-height: 42px;
  padding: 0 18px;
  border-radius: 10px;
  cursor: pointer;
  font: inherit;
  font-weight: 700;
}

.refresh-button {
  border: 1px solid #dbe2ea;
  background: #ffffff;
  color: #334155;
}

.primary-button {
  border: 1px solid #3157d6;
  background: #3157d6;
  color: #ffffff;
}

.refresh-button:disabled,
.primary-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.stats-grid {
  display: grid;
  grid-template-columns:
    repeat(5, minmax(0, 1fr));
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
  min-width: 320px;
  flex: 1;
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
.filter-card input:disabled,
.filter-card select:disabled {
  cursor: not-allowed;
  opacity: 0.55;
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

.merchant-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.merchant-info > div:last-child {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 4px;
}

.merchant-info strong {
  max-width: 220px;
  overflow: hidden;
  color: #0f172a;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.merchant-info span {
  max-width: 220px;
  overflow: hidden;
  color: #94a3b8;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.merchant-logo {
  display: grid;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  place-items: center;
  overflow: hidden;
  border-radius: 12px;
  background: #eef2ff;
  color: #3157d6;
  font-size: 17px;
  font-weight: 800;
}

.merchant-logo--image {
  background: #ffffff;
}

.merchant-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.merchant-no {
  color: #3157d6;
  font-weight: 800;
}

.contact-info,
.company-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.contact-info small,
.company-info small {
  color: #94a3b8;
  font-size: 12px;
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

.status-badge--active {
  background: #dcfce7;
  color: #15803d;
}

.status-badge--suspended {
  background: #ede9fe;
  color: #6d28d9;
}

.status-badge--rejected {
  background: #fee2e2;
  color: #b91c1c;
}

.status-badge--disabled {
  background: #e2e8f0;
  color: #475569;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.view-button,
.review-button {
  min-height: 36px;
  padding: 0 14px;
  border: 0;
  border-radius: 8px;
  cursor: pointer;
  font: inherit;
  font-weight: 700;
}

.view-button {
  background: #3157d6;
  color: #ffffff;
}

.review-button {
  background: #dcfce7;
  color: #15803d;
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

@media (max-width: 1400px) {
  .stats-grid {
    grid-template-columns:
      repeat(3, minmax(0, 1fr));
  }
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

  .header-actions {
    width: 100%;
  }

  .header-actions button {
    flex: 1;
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

  table {
    min-width: 1500px;
  }
}
</style>