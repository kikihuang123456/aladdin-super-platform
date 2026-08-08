<template>
  <AdminLayout>
    <div class="deleted-merchant-page">
      <section class="page-header">
        <div>
          <p class="page-eyebrow">
            MERCHANT ERP
          </p>

          <h1>
            已刪除商家
          </h1>

          <p class="page-description">
            查看已進行 Soft Delete 的商家資料，
            並可將誤刪商家恢復至正常商家列表。
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
          :disabled="loading || store.isMutating"
          @click="handleSearch"
        >
          搜尋
        </button>
      </section>

      <div
        v-if="successMessage"
        class="success-panel"
      >
        {{ successMessage }}
      </div>

      <div
        v-if="store.error"
        class="error-panel"
      >
        {{ store.error }}
      </div>

      <div
        v-if="loading"
        class="state-panel"
      >
        正在載入已刪除商家...
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
          目前沒有已刪除商家。
        </div>

        <template v-else>
          <div class="table-head">
            <span>商家</span>
            <span>商家編號</span>
            <span>市場</span>
            <span>狀態</span>
            <span>刪除時間</span>
            <span>操作</span>
          </div>

          <div
            v-for="merchant in merchants"
            :key="merchant.id"
            class="merchant-row"
          >
            <div class="merchant-name">
              <strong>
                {{ merchant.name }}
              </strong>

              <small>
                {{ merchant.legalName || '-' }}
              </small>
            </div>

            <span class="merchant-no">
              {{ merchant.merchantNo }}
            </span>

            <span>
              {{ marketText(merchant.market) }}
            </span>

            <span>
              {{ statusText(merchant.status) }}
            </span>

            <span>
              {{ formatDate(merchant.deletedAt) }}
            </span>

            <div class="row-actions">
              <button
                type="button"
                class="detail-button"
                :disabled="store.isMutating"
                @click="handleOpenMerchant(merchant.id)"
              >
                查看詳情
              </button>

              <button
                v-if="
                  permissionStore.hasPermission(
                    'merchant.update',
                  )
                "
                type="button"
                class="restore-button"
                :disabled="store.isMutating"
                @click="
                  handleRestoreDeleted(
                    merchant,
                  )
                "
              >
                {{
                  store.isMutating
                    ? '處理中...'
                    : '恢復商家'
                }}
              </button>
            </div>
          </div>

          <div class="pagination">
            <span>
              共 {{ pagination.total }} 筆
            </span>

            <div>
              <button
                type="button"
                :disabled="
                  pagination.page <= 1 ||
                  loading ||
                  store.isMutating
                "
                @click="
                  changePage(
                    pagination.page - 1,
                  )
                "
              >
                上一頁
              </button>

              <span>
                第
                {{ pagination.page }}
                /
                {{
                  Math.max(
                    pagination.totalPages,
                    1,
                  )
                }}
                頁
              </span>

              <button
                type="button"
                :disabled="
                  pagination.totalPages === 0 ||
                  pagination.page >=
                    pagination.totalPages ||
                  loading ||
                  store.isMutating
                "
                @click="
                  changePage(
                    pagination.page + 1,
                  )
                "
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
  getDeletedMerchants,
} from '../../api/merchant'

import {
  useMerchantStore,
} from '../../stores/merchant'

import {
  usePermissionStore,
} from '../../stores/permission'

import type {
  Merchant,
  MerchantFilters,
  MerchantMarket,
  MerchantPagination,
  MerchantStatus,
} from '../../types/merchant'

const router =
  useRouter()

const store =
  useMerchantStore()

const permissionStore =
  usePermissionStore()

const loading =
  ref(false)

const errorMessage =
  ref('')

const successMessage =
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
  store.clearError()
  store.clearMutationMessage()

  await loadDeletedMerchants()
})

onBeforeUnmount(() => {
  store.clearError()
  store.clearMutationMessage()
})

async function loadDeletedMerchants():
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
      await getDeletedMerchants(
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
    merchants.value =
      []

    errorMessage.value =
      errorValue instanceof Error
        ? errorValue.message
        : '已刪除商家載入失敗。'
  } finally {
    loading.value =
      false
  }
}

async function handleSearch():
  Promise<void> {
  successMessage.value =
    ''

  pagination.value.page =
    1

  await loadDeletedMerchants()
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

  await loadDeletedMerchants()
}

function handleOpenMerchant(
  merchantId:
    string,
): void {
  router.push(
    `/merchants/${merchantId}`,
  )
}

async function handleRestoreDeleted(
  merchant:
    Merchant,
): Promise<void> {
  if (store.isMutating) {
    return
  }

  successMessage.value =
    ''

  store.clearError()
  store.clearMutationMessage()

  const confirmed =
    window.confirm(
      `確定要恢復商家「${merchant.name}」嗎？\n\n恢復後，此商家將重新出現在正常商家列表。`,
    )

  if (!confirmed) {
    return
  }

  const success =
    await store.restoreDeletedMerchantRequest(
      merchant.id,
    )

  if (!success) {
    return
  }

  successMessage.value =
    store.mutationMessage ||
    '商家恢復成功。'

  if (
    merchants.value.length === 1 &&
    pagination.value.page > 1
  ) {
    pagination.value.page -=
      1
  }

  await loadDeletedMerchants()
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
.deleted-merchant-page {
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

.search-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
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
    1.5fr
    1.25fr
    0.65fr
    0.7fr
    1fr
    1.2fr;
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
  padding: 18px 20px;
  border-top: 1px solid #eef2f7;
  color: #334155;
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

.merchant-no {
  overflow-wrap: anywhere;
  color: #3157d6;
  font-weight: 700;
}

.row-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.detail-button,
.restore-button {
  min-height: 36px;
  padding: 0 12px;
  border-radius: 8px;
  cursor: pointer;
  font: inherit;
  font-weight: 700;
}

.detail-button {
  border: 1px solid #dbe2ea;
  background: #ffffff;
  color: #334155;
}

.restore-button {
  border: 1px solid #16a34a;
  background: #ffffff;
  color: #15803d;
}

.restore-button:hover {
  background: #f0fdf4;
}

.detail-button:disabled,
.restore-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.state-panel,
.error-panel,
.empty-panel,
.success-panel {
  padding: 18px 20px;
  border-radius: 14px;
}

.state-panel,
.empty-panel {
  text-align: center;
  color: #64748b;
}

.error-panel {
  border: 1px solid #fecaca;
  background: #fef2f2;
  color: #b91c1c;
}

.success-panel {
  border: 1px solid #bbf7d0;
  background: #f0fdf4;
  color: #15803d;
  font-weight: 700;
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

@media (max-width: 1000px) {
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
    min-width: 1100px;
  }
}
</style>