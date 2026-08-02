<template>
  <AdminLayout>
    <div class="merchant-product-page">
      <section class="page-header">
        <div>
          <p class="page-eyebrow">
            MERCHANT PRODUCT ERP
          </p>

          <h1>
            商家商品管理
          </h1>

          <p class="page-description">
            管理商家商品授權、價格、庫存、審核狀態與上下架狀態。
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
          <span>商品總數</span>
          <strong>{{ store.statistics.total }}</strong>
        </article>

        <article class="stat-card">
          <span>草稿</span>
          <strong>{{ store.statistics.draft }}</strong>
        </article>

        <article class="stat-card">
          <span>待審核</span>
          <strong>{{ store.statistics.pending }}</strong>
        </article>

        <article class="stat-card">
          <span>已通過</span>
          <strong>{{ store.statistics.approved }}</strong>
        </article>

        <article class="stat-card">
          <span>已拒絕</span>
          <strong>{{ store.statistics.rejected }}</strong>
        </article>

        <article class="stat-card">
          <span>啟用中</span>
          <strong>{{ store.statistics.active }}</strong>
        </article>

        <article class="stat-card">
          <span>已停用</span>
          <strong>{{ store.statistics.inactive }}</strong>
        </article>

        <article class="stat-card">
          <span>已上架</span>
          <strong>{{ store.statistics.listed }}</strong>
        </article>

        <article class="stat-card">
          <span>已下架</span>
          <strong>{{ store.statistics.unlisted }}</strong>
        </article>

        <article class="stat-card">
          <span>總庫存</span>
          <strong>{{ store.statistics.totalStock }}</strong>
        </article>

        <article class="stat-card">
          <span>可用庫存</span>
          <strong>{{ store.statistics.availableStock }}</strong>
        </article>

        <article class="stat-card">
          <span>低庫存</span>
          <strong class="danger">
            {{ store.statistics.lowStock }}
          </strong>
        </article>
      </section>

      <section class="filter-card">
        <input
          v-model="keyword"
          type="search"
          placeholder="搜尋商家商品編號、商家、商品名稱或平台商品編號"
          :disabled="store.isLoading"
          @keyup.enter="handleSearch"
        >

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

          <option value="pending">
            待審核
          </option>

          <option value="approved">
            已通過
          </option>

          <option value="rejected">
            已拒絕
          </option>

          <option value="active">
            啟用中
          </option>

          <option value="inactive">
            已停用
          </option>
        </select>

        <select
          v-model="listedFilter"
          :disabled="store.isLoading"
          @change="handleListedChange"
        >
          <option value="">
            全部上下架
          </option>

          <option value="listed">
            已上架
          </option>

          <option value="unlisted">
            已下架
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
          正在載入商家商品資料...
        </div>

        <div
          v-else-if="
            !store.error &&
            store.products.length === 0
          "
          class="state-panel"
        >
          暫無商家商品資料
        </div>

        <div
          v-else-if="!store.error"
          class="table-wrapper"
        >
          <table>
            <thead>
              <tr>
                <th>商家商品編號</th>
                <th>商家</th>
                <th>平台商品</th>
                <th>售價</th>
                <th>庫存</th>
                <th>凍結</th>
                <th>可用</th>
                <th>低庫存門檻</th>
                <th>上下架</th>
                <th>狀態</th>
                <th>更新時間</th>
                <th>操作</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="item in store.products"
                :key="item.id"
              >
                <td>
                  <strong class="product-no">
                    {{ item.merchantProductNo }}
                  </strong>
                </td>

                <td>
                  <div class="name-cell">
                    <strong>
                      {{ item.merchantName || '-' }}
                    </strong>

                    <small>
                      {{ item.merchantId }}
                    </small>
                  </div>
                </td>

                <td>
                  <div class="name-cell">
                    <strong>
                      {{ item.productName || '-' }}
                    </strong>

                    <small>
                      {{ item.productNo || item.productId }}
                    </small>
                  </div>
                </td>

                <td>
                  {{
                    formatMoney(
                      item.salePrice,
                      item.currency,
                    )
                  }}
                </td>

                <td>
                  {{ item.stockQuantity }}
                </td>

                <td>
                  {{ item.frozenStock }}
                </td>

                <td>
                  <strong
                    :class="{
                      danger:
                        item.availableStock <=
                        item.lowStockThreshold,
                    }"
                  >
                    {{ item.availableStock }}
                  </strong>
                </td>

                <td>
                  {{ item.lowStockThreshold }}
                </td>

                <td>
                  <span
                    class="listed-badge"
                    :class="{
                      'listed-badge--listed':
                        item.isListed,
                      'listed-badge--unlisted':
                        !item.isListed,
                    }"
                  >
                    {{
                      item.isListed
                        ? '已上架'
                        : '已下架'
                    }}
                  </span>
                </td>

                <td>
                  <span
                    class="status-badge"
                    :class="
                      `status-badge--${item.status}`
                    "
                  >
                    {{
                      statusText(
                        item.status,
                      )
                    }}
                  </span>
                </td>

                <td>
                  {{
                    formatDate(
                      item.updatedAt,
                    )
                  }}
                </td>

                <td>
                  <button
                    class="view-button"
                    type="button"
                    @click="handleView(item.id)"
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
              :disabled="!store.hasPreviousPage"
              @click="handlePreviousPage"
            >
              上一頁
            </button>

            <span>
              第
              {{ store.pagination.page }}
              /
              {{ store.pagination.totalPages || 1 }}
              頁
            </span>

            <button
              type="button"
              :disabled="!store.hasNextPage"
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
  useMerchantProductStore,
} from '../../stores/merchant-product'

import type {
  MerchantProductStatus,
} from '../../types/merchant-product'

const router =
  useRouter()

const store =
  useMerchantProductStore()

const keyword =
  ref('')

const status =
  ref<
    MerchantProductStatus | ''
  >('')

const listedFilter =
  ref<
    '' |
    'listed' |
    'unlisted'
  >('')

const pageSize =
  ref(20)

onMounted(async () => {
  keyword.value =
    store.filters.keyword ||
    ''

  status.value =
    store.filters.status ||
    ''

  if (
    store.filters.isListed ===
    true
  ) {
    listedFilter.value =
      'listed'
  } else if (
    store.filters.isListed ===
    false
  ) {
    listedFilter.value =
      'unlisted'
  } else {
    listedFilter.value =
      ''
  }

  pageSize.value =
    store.filters.pageSize

  await store.fetchProducts()
})

onBeforeUnmount(() => {
  store.clearError()
  store.clearMutationMessage()
})

async function handleRefresh():
  Promise<void> {
  await store.fetchProducts()
}

async function handleSearch():
  Promise<void> {
  await store.searchProducts(
    keyword.value,
  )
}

async function handleStatusChange():
  Promise<void> {
  await store.setStatusFilter(
    status.value,
  )
}

async function handleListedChange():
  Promise<void> {
  if (
    listedFilter.value ===
    'listed'
  ) {
    await store.setListedFilter(
      true,
    )

    return
  }

  if (
    listedFilter.value ===
    'unlisted'
  ) {
    await store.setListedFilter(
      false,
    )

    return
  }

  await store.setListedFilter(
    null,
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

  status.value =
    ''

  listedFilter.value =
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
  merchantProductId: string,
): void {
  router.push(
    `/merchants/products/${merchantProductId}`,
  )
}

function statusText(
  value:
    MerchantProductStatus,
): string {
  const map:
    Record<
      MerchantProductStatus,
      string
    > = {
      draft:
        '草稿',

      pending:
        '待審核',

      approved:
        '已通過',

      rejected:
        '已拒絕',

      active:
        '啟用中',

      inactive:
        '已停用',
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
.merchant-product-page {
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
}

.danger {
  color: #b91c1c !important;
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
  min-width: 340px;
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

.product-no {
  color: #3157d6;
  font-weight: 800;
}

.name-cell {
  display: flex;
  min-width: 180px;
  max-width: 260px;
  flex-direction: column;
  gap: 4px;
}

.name-cell strong {
  overflow: hidden;
  color: #0f172a;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.name-cell small {
  overflow: hidden;
  color: #94a3b8;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.listed-badge,
.status-badge {
  display: inline-flex;
  min-height: 28px;
  padding: 5px 12px;
  border-radius: 999px;
  align-items: center;
  font-size: 12px;
  font-weight: 800;
}

.listed-badge--listed {
  background: #dcfce7;
  color: #15803d;
}

.listed-badge--unlisted {
  background: #e2e8f0;
  color: #475569;
}

.status-badge--draft {
  background: #f1f5f9;
  color: #475569;
}

.status-badge--pending {
  background: #fef3c7;
  color: #b45309;
}

.status-badge--approved {
  background: #dbeafe;
  color: #1d4ed8;
}

.status-badge--rejected {
  background: #fee2e2;
  color: #b91c1c;
}

.status-badge--active {
  background: #dcfce7;
  color: #15803d;
}

.status-badge--inactive {
  background: #e2e8f0;
  color: #475569;
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

@media (max-width: 1300px) {
  .stats-grid {
    grid-template-columns:
      repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 1000px) {
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

  table {
    min-width: 1500px;
  }
}
</style>