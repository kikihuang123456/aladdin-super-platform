<template>
  <AdminLayout>
    <div class="archived-merchant-page">
      <section class="page-header">
        <div>
          <p class="page-eyebrow">
            MERCHANT ERP
          </p>

          <h1>
            封存商家
          </h1>

          <p class="page-description">
            查看目前已封存但尚未刪除的商家，可進入詳情頁恢復商家。
          </p>
        </div>

        <button
          type="button"
          class="back-button"
          @click="handleBack"
        >
          返回商家管理
        </button>
      </section>

      <section class="filter-card">
        <input
          v-model="keyword"
          type="text"
          placeholder="搜尋商家編號、名稱、聯絡人"
          @keyup.enter="handleSearch"
        />

        <button
          type="button"
          class="search-button"
          @click="handleSearch"
        >
          搜尋
        </button>
      </section>

      <div
        v-if="loading"
        class="state-panel"
      >
        正在載入封存商家...
      </div>

      <div
        v-else-if="errorMessage"
        class="error-panel"
      >
        {{ errorMessage }}
      </div>

      <section
        v-else
        class="table-card"
      >
        <div
          v-if="merchants.length === 0"
          class="empty-panel"
        >
          目前沒有封存商家。
        </div>

        <template v-else>
          <div class="table-head">
            <span>商家</span>
            <span>商家編號</span>
            <span>市場</span>
            <span>狀態</span>
            <span>封存時間</span>
          </div>

          <button
            v-for="merchant in merchants"
            :key="merchant.id"
            type="button"
            class="merchant-row"
            @click="handleOpenMerchant(merchant.id)"
          >
            <div class="merchant-name">
              <strong>
                {{ merchant.name }}
              </strong>

              <small>
                {{ merchant.legalName || '-' }}
              </small>
            </div>

            <span>
              {{ merchant.merchantNo }}
            </span>

            <span>
              {{ marketText(merchant.market) }}
            </span>

            <span>
              {{ statusText(merchant.status) }}
            </span>

            <span>
              {{ formatDate(merchant.archivedAt) }}
            </span>
          </button>

          <div class="pagination">
            <span>
              共 {{ pagination.total }} 筆
            </span>

            <div>
              <button
                type="button"
                :disabled="pagination.page <= 1"
                @click="changePage(pagination.page - 1)"
              >
                上一頁
              </button>

              <span>
                第 {{ pagination.page }} /
                {{ Math.max(pagination.totalPages, 1) }} 頁
              </span>

              <button
                type="button"
                :disabled="
                  pagination.totalPages === 0 ||
                  pagination.page >= pagination.totalPages
                "
                @click="changePage(pagination.page + 1)"
              >
                下一頁
              </button>
            </div>
          </div>
        </template>
      </section>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import {
  onMounted,
  ref,
} from 'vue'

import {
  useRouter,
} from 'vue-router'

import AdminLayout
  from '../../layouts/AdminLayout.vue'

import {
  getArchivedMerchants,
} from '../../api/merchant'

import type {
  Merchant,
  MerchantFilters,
  MerchantMarket,
  MerchantPagination,
  MerchantStatus,
} from '../../types/merchant'

const router =
  useRouter()

const loading =
  ref(false)

const errorMessage =
  ref('')

const keyword =
  ref('')

const merchants =
  ref<Merchant[]>([])

const pagination =
  ref<MerchantPagination>({
    page:
      1,

    pageSize:
      20,

    total:
      0,

    totalPages:
      0,
  })

onMounted(async () => {
  await loadArchivedMerchants()
})

async function loadArchivedMerchants():
  Promise<void> {
  loading.value =
    true

  errorMessage.value =
    ''

  try {
    const filters:
      MerchantFilters = {
        keyword:
          keyword.value.trim(),

        merchantType:
          '',

        market:
          '',

        status:
          '',

        page:
          pagination.value.page,

        pageSize:
          pagination.value.pageSize,
      }

    const response =
      await getArchivedMerchants(
        filters,
      )

    if (!response.success) {
      throw new Error(
        response.error ||
        response.message,
      )
    }

    merchants.value =
      response.merchants

    pagination.value =
      response.pagination
  } catch (
    errorValue
  ) {
    errorMessage.value =
      errorValue instanceof Error
        ? errorValue.message
        : '封存商家載入失敗。'
  } finally {
    loading.value =
      false
  }
}

async function handleSearch():
  Promise<void> {
  pagination.value.page =
    1

  await loadArchivedMerchants()
}

async function changePage(
  page:
    number,
): Promise<void> {
  if (
    page < 1 ||
    (
      pagination.value.totalPages >
        0 &&
      page >
        pagination.value.totalPages
    )
  ) {
    return
  }

  pagination.value.page =
    page

  await loadArchivedMerchants()
}

function handleOpenMerchant(
  merchantId:
    string,
): void {
  router.push(
    `/merchants/${merchantId}`,
  )
}

function handleBack():
  void {
  router.push(
    '/merchants',
  )
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
.archived-merchant-page {
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
}

.page-description {
  margin: 0;
  color: #64748b;
  line-height: 1.7;
}

.back-button,
.search-button {
  min-height: 42px;
  padding: 0 18px;
  border-radius: 10px;
  cursor: pointer;
  font: inherit;
  font-weight: 700;
}

.back-button {
  border: 1px solid #dbe2ea;
  background: #ffffff;
  color: #334155;
}

.search-button {
  border: 0;
  background: #3157d6;
  color: #ffffff;
}

.filter-card {
  display: flex;
  padding: 18px;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  gap: 12px;
  background: #ffffff;
}

.filter-card input {
  min-height: 42px;
  padding: 0 14px;
  border: 1px solid #dbe2ea;
  border-radius: 10px;
  flex: 1;
  font: inherit;
}

.table-card {
  overflow: hidden;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  background: #ffffff;
}

.table-head,
.merchant-row {
  display: grid;
  grid-template-columns:
    1.6fr
    1.3fr
    0.7fr
    0.7fr
    1fr;
  align-items: center;
  gap: 16px;
}

.table-head {
  padding: 18px 20px;
  background: #f8fafc;
  color: #64748b;
  font-size: 13px;
  font-weight: 700;
}

.merchant-row {
  width: 100%;
  padding: 18px 20px;
  border: 0;
  border-top: 1px solid #eef2f7;
  background: #ffffff;
  color: #334155;
  cursor: pointer;
  font: inherit;
  text-align: left;
}

.merchant-row:hover {
  background: #f8fafc;
}

.merchant-name {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 6px;
}

.merchant-name strong {
  color: #0f172a;
}

.merchant-name small {
  color: #94a3b8;
}

.state-panel,
.error-panel,
.empty-panel {
  padding: 40px 24px;
  text-align: center;
}

.error-panel {
  color: #b91c1c;
}

.empty-panel {
  color: #64748b;
}

.pagination {
  display: flex;
  padding: 18px 20px;
  border-top: 1px solid #eef2f7;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.pagination > div {
  display: flex;
  align-items: center;
  gap: 12px;
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

@media (max-width: 900px) {
  .page-header,
  .filter-card,
  .pagination {
    flex-direction: column;
  }

  .back-button,
  .search-button,
  .filter-card input {
    width: 100%;
  }

  .table-card {
    overflow-x: auto;
  }

  .table-head,
  .merchant-row {
    min-width: 900px;
  }
}
</style>