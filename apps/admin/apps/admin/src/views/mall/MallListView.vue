<template>
  <AdminLayout>
    <div class="mall-page">
      <section class="page-header">
        <div class="page-header__content">
          <p class="page-eyebrow">
            MALL MANAGEMENT
          </p>

          <h1>
            商品管理
          </h1>

          <p class="page-description">
            管理商品、分類、品牌、價格、庫存、銷量與上下架狀態。
          </p>
        </div>

        <div class="page-header__actions">
          <button
            class="secondary-button"
            type="button"
            :disabled="isLoading"
            @click="handleRefresh"
          >
            {{
              isLoading
                ? '更新中...'
                : '重新整理'
            }}
          </button>

          <button
            v-if="
              permissionStore.hasPermission(
                'mall.create',
              )
            "
            class="primary-button"
            type="button"
            @click="handleCreateProduct"
          >
            新增商品
          </button>
        </div>
      </section>

      <MallProductStats
        :statistics="statistics"
      />

      <section
        v-if="error"
        class="error-panel"
        role="alert"
      >
        <div>
          <strong>
            商品資料載入失敗
          </strong>

          <p>
            {{ error }}
          </p>
        </div>

        <button
          class="error-panel__button"
          type="button"
          :disabled="isLoading"
          @click="handleRefresh"
        >
          重新載入
        </button>
      </section>

      <section class="table-card">
        <div class="table-toolbar">
          <div class="table-toolbar__title">
            <h2>
              商品列表
            </h2>

            <p>
              資料直接來自 Supabase 正式商品資料庫
            </p>
          </div>
        </div>

        <div class="filter-wrapper">
          <MallProductFilters
            :keyword="
              mallStore.filters.keyword
            "
            :category-id="
              mallStore.filters.categoryId
            "
            :brand-id="
              mallStore.filters.brandId
            "
            :status="
              mallStore.filters.status
            "
            :page-size="
              mallStore.filters.pageSize
            "
            :loading="isLoading"
            @search="handleSearch"
            @status-change="
              handleStatusChange
            "
            @category-change="
              handleCategoryChange
            "
            @brand-change="
              handleBrandChange
            "
            @page-size-change="
              handlePageSizeChange
            "
            @reset="handleReset"
          />
        </div>

        <div
          v-if="isLoading"
          class="state-panel"
        >
          <div class="loading-spinner" />

          <strong>
            正在讀取商品資料
          </strong>

          <p>
            系統正在連線至 Supabase 正式商品資料庫。
          </p>
        </div>

        <div
          v-else-if="
            !error &&
            products.length === 0
          "
          class="state-panel"
        >
          <div class="state-panel__icon">
            商品
          </div>

          <strong>
            目前沒有商品資料
          </strong>

          <p>
            請新增第一筆正式商品，或調整目前的篩選條件。
          </p>

          <button
            v-if="
              permissionStore.hasPermission(
                'mall.create',
              )
            "
            class="primary-button"
            type="button"
            @click="handleCreateProduct"
          >
            新增商品
          </button>
        </div>

        <MallProductTable
          v-else-if="!error"
          :products="products"
          @view="handleViewProduct"
          @edit="handleEditProduct"
        />

        <footer
          v-if="
            !isLoading &&
            !error &&
            pagination.total > 0
          "
          class="pagination"
        >
          <div class="pagination__summary">
            共
            <strong>
              {{
                pagination.total
                  .toLocaleString()
              }}
            </strong>
            筆商品

            <span>
              每頁
              {{ pagination.pageSize }}
              筆
            </span>
          </div>

          <div class="pagination__controls">
            <button
              class="pagination-button"
              type="button"
              :disabled="
                !hasPreviousPage ||
                isLoading
              "
              @click="handlePreviousPage"
            >
              上一頁
            </button>

            <span class="pagination__page">
              第
              <strong>
                {{ pagination.page }}
              </strong>
              頁

              <span>
                ／
              </span>

              共
              <strong>
                {{
                  pagination.totalPages ||
                  1
                }}
              </strong>
              頁
            </span>

            <button
              class="pagination-button"
              type="button"
              :disabled="
                !hasNextPage ||
                isLoading
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
  computed,
  onMounted,
} from 'vue'

import {
  useRouter,
} from 'vue-router'

import AdminLayout from '../../layouts/AdminLayout.vue'

import MallProductFilters from '../../components/mall/MallProductFilters.vue'
import MallProductStats from '../../components/mall/MallProductStats.vue'
import MallProductTable from '../../components/mall/MallProductTable.vue'

import {
  useMallStore,
} from '../../stores/mall'

import {
  usePermissionStore,
} from '../../stores/permission'

import type {
  MallProductStatus,
} from '../../types/mall'

const router =
  useRouter()

const mallStore =
  useMallStore()

const permissionStore =
  usePermissionStore()

const products =
  computed(() =>
    mallStore.products,
  )

const statistics =
  computed(() =>
    mallStore.statistics,
  )

const pagination =
  computed(() =>
    mallStore.pagination,
  )

const isLoading =
  computed(() =>
    mallStore.isLoading,
  )

const error =
  computed(() =>
    mallStore.error,
  )

const hasPreviousPage =
  computed(() =>
    mallStore.hasPreviousPage,
  )

const hasNextPage =
  computed(() =>
    mallStore.hasNextPage,
  )

onMounted(async () => {
  await mallStore.fetchProducts()
})

async function handleRefresh():
  Promise<void> {
  await mallStore.refreshProducts()
}

async function handleSearch(
  keyword: string,
): Promise<void> {
  await mallStore.searchProducts(
    keyword,
  )
}

async function handleStatusChange(
  status: MallProductStatus | '',
): Promise<void> {
  await mallStore.setStatusFilter(
    status,
  )
}

async function handleCategoryChange(
  categoryId: string,
): Promise<void> {
  await mallStore.setCategoryFilter(
    categoryId,
  )
}

async function handleBrandChange(
  brandId: string,
): Promise<void> {
  await mallStore.setBrandFilter(
    brandId,
  )
}

async function handlePageSizeChange(
  pageSize: number,
): Promise<void> {
  await mallStore.setPageSize(
    pageSize,
  )
}

async function handleReset():
  Promise<void> {
  await mallStore.resetFilters()
}

async function handlePreviousPage():
  Promise<void> {
  await mallStore.goToPreviousPage()
}

async function handleNextPage():
  Promise<void> {
  await mallStore.goToNextPage()
}

function handleCreateProduct():
  void {
  router.push('/mall/create')
}

function handleViewProduct(
  productId: string,
): void {
  router.push(
    `/mall/${productId}`,
  )
}

function handleEditProduct(
  productId: string,
): void {
  if (
    !permissionStore.hasPermission(
      'mall.update',
    )
  ) {
    return
  }

  router.push(
    `/mall/${productId}/edit`,
  )
}
</script>

<style scoped>
.mall-page {
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

.page-header__content {
  min-width: 0;
}

.page-header__actions {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 12px;
}

.page-eyebrow {
  margin: 0;
  color: #3157d6;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.page-header h1 {
  margin: 4px 0 8px;
  color: #0f172a;
  font-size: 34px;
  font-weight: 800;
  line-height: 1.2;
}

.page-description {
  margin: 0;
  color: #64748b;
  font-size: 15px;
  line-height: 1.7;
}

.primary-button,
.secondary-button,
.error-panel__button,
.pagination-button {
  min-height: 42px;
  padding: 0 18px;
  border-radius: 10px;
  cursor: pointer;
  font: inherit;
  font-size: 14px;
  font-weight: 700;
}

.primary-button {
  border: 1px solid #3157d6;
  background: #3157d6;
  color: #ffffff;
}

.secondary-button,
.pagination-button {
  border: 1px solid #dbe2ea;
  background: #ffffff;
  color: #334155;
}

.primary-button:disabled,
.secondary-button:disabled,
.error-panel__button:disabled,
.pagination-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.error-panel {
  display: flex;
  padding: 18px 20px;
  border: 1px solid #fecaca;
  border-radius: 14px;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  background: #fef2f2;
}

.error-panel strong {
  color: #991b1b;
}

.error-panel p {
  margin: 5px 0 0;
  color: #b91c1c;
}

.error-panel__button {
  border: 1px solid #ef4444;
  background: #ffffff;
  color: #b91c1c;
}

.table-card {
  overflow: hidden;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  background: #ffffff;
  box-shadow:
    0 10px 25px
    rgba(15, 23, 42, 0.05);
}

.table-toolbar {
  display: flex;
  padding: 22px 24px;
  border-bottom: 1px solid #e5e7eb;
  align-items: center;
  justify-content: space-between;
}

.table-toolbar h2 {
  margin: 0;
  color: #0f172a;
  font-size: 21px;
  font-weight: 800;
}

.table-toolbar p {
  margin: 6px 0 0;
  color: #94a3b8;
  font-size: 13px;
}

.filter-wrapper {
  padding: 18px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.state-panel {
  display: flex;
  min-height: 320px;
  padding: 48px 24px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  text-align: center;
}

.state-panel strong {
  margin-top: 18px;
  color: #0f172a;
  font-size: 17px;
  font-weight: 800;
}

.state-panel p {
  max-width: 460px;
  margin: 8px 0 22px;
  color: #94a3b8;
  font-size: 14px;
  line-height: 1.7;
}

.state-panel__icon {
  display: grid;
  width: 72px;
  height: 72px;
  place-items: center;
  border-radius: 22px;
  background: #eef2ff;
  color: #3157d6;
  font-size: 14px;
  font-weight: 900;
}

.loading-spinner {
  width: 42px;
  height: 42px;
  border: 4px solid #e0e7ff;
  border-top-color: #3157d6;
  border-radius: 50%;
  animation:
    mall-spin 0.8s linear infinite;
}

@keyframes mall-spin {
  to {
    transform: rotate(360deg);
  }
}

.pagination {
  display: flex;
  min-height: 72px;
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.pagination__summary {
  color: #64748b;
  font-size: 13px;
}

.pagination__summary strong {
  color: #0f172a;
}

.pagination__summary span {
  margin-left: 12px;
  color: #94a3b8;
}

.pagination__controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pagination__page {
  min-width: 150px;
  color: #64748b;
  font-size: 13px;
  text-align: center;
}

.pagination__page strong {
  color: #0f172a;
}

.pagination__page span {
  margin: 0 4px;
  color: #cbd5e1;
}

@media (max-width: 760px) {
  .page-header {
    flex-direction: column;
  }

  .page-header__actions {
    width: 100%;
  }

  .page-header__actions button {
    flex: 1;
  }

  .pagination {
    align-items: stretch;
    flex-direction: column;
  }

  .pagination__controls {
    justify-content: center;
  }

  .error-panel {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>