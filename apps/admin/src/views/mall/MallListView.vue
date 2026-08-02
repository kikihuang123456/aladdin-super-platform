<template>
  <AdminLayout>
    <div class="mall-page">
      <section class="page-header">
        <div>
          <p class="page-eyebrow">
            MALL MANAGEMENT
          </p>

          <h1>
            商城管理
          </h1>

          <p class="page-description">
            管理商品、分類、庫存、台幣與人民幣售價、上下架狀態與跨境配送設定。
          </p>
        </div>

        <button
          v-if="permissionStore.hasPermission('mall.create')"
          class="primary-button"
          type="button"
        >
          新增商品
        </button>
      </section>

      <section class="summary-grid">
        <article class="summary-card">
          <span>商品總數</span>
          <strong>{{ products.length }}</strong>
          <small>平台全部商品</small>
        </article>

        <article class="summary-card">
          <span>已上架</span>
          <strong>{{ publishedCount }}</strong>
          <small>目前商城可銷售</small>
        </article>

        <article class="summary-card">
          <span>低庫存</span>
          <strong>{{ lowStockCount }}</strong>
          <small>庫存低於安全值</small>
        </article>

        <article class="summary-card">
          <span>已下架</span>
          <strong>{{ unpublishedCount }}</strong>
          <small>暫停對外販售</small>
        </article>
      </section>

      <section class="mall-card">
        <div class="table-toolbar">
          <div>
            <h2>
              商品列表
            </h2>

            <p>
              台灣市場與中國大陸市場雙幣別商品管理
            </p>
          </div>

          <div class="toolbar-actions">
            <input
              v-model.trim="keyword"
              class="search-input"
              type="search"
              placeholder="搜尋商品名稱、編號或商家"
            >

            <select
              v-model="categoryFilter"
              class="filter-select"
            >
              <option value="">
                全部分類
              </option>

              <option value="美妝保養">
                美妝保養
              </option>

              <option value="陶瓷茶器">
                陶瓷茶器
              </option>

              <option value="服飾選品">
                服飾選品
              </option>

              <option value="食品茶飲">
                食品茶飲
              </option>
            </select>

            <select
              v-model="marketFilter"
              class="filter-select"
            >
              <option value="">
                全部市場
              </option>

              <option value="台灣市場">
                台灣市場
              </option>

              <option value="中國大陸市場">
                中國大陸市場
              </option>

              <option value="雙市場">
                雙市場
              </option>
            </select>

            <select
              v-model="statusFilter"
              class="filter-select"
            >
              <option value="">
                全部狀態
              </option>

              <option value="已上架">
                已上架
              </option>

              <option value="待審核">
                待審核
              </option>

              <option value="已下架">
                已下架
              </option>
            </select>
          </div>
        </div>

        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>商品</th>
                <th>商品編號</th>
                <th>分類</th>
                <th>供應商</th>
                <th>台幣售價</th>
                <th>人民幣售價</th>
                <th>庫存</th>
                <th>市場</th>
                <th>狀態</th>
                <th>更新日期</th>
                <th>操作</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="product in filteredProducts"
                :key="product.id"
              >
                <td>
                  <div class="product-info">
                    <span class="product-image">
                      {{ product.shortName }}
                    </span>

                    <div>
                      <strong>
                        {{ product.name }}
                      </strong>

                      <small>
                        {{ product.specification }}
                      </small>
                    </div>
                  </div>
                </td>

                <td>
                  {{ product.code }}
                </td>

                <td>
                  {{ product.category }}
                </td>

                <td>
                  {{ product.merchant }}
                </td>

                <td>
                  <strong class="price-value">
                    {{ formatTwd(product.priceTwd) }}
                  </strong>
                </td>

                <td>
                  <strong class="price-value">
                    {{ formatCny(product.priceCny) }}
                  </strong>
                </td>

                <td>
                  <span
                    class="stock-value"
                    :class="{
                      'stock-value--low':
                        product.stock <= product.safetyStock,
                    }"
                  >
                    {{ product.stock }}
                  </span>
                </td>

                <td>
                  <span
                    class="market-badge"
                    :class="getMarketClass(product.market)"
                  >
                    {{ product.market }}
                  </span>
                </td>

                <td>
                  <span
                    class="status-badge"
                    :class="getStatusClass(product.status)"
                  >
                    {{ product.status }}
                  </span>
                </td>

                <td>
                  {{ product.updatedAt }}
                </td>

                <td>
                  <div class="action-buttons">
                    <button
                      class="text-button"
                      type="button"
                    >
                      查看
                    </button>

                    <button
                      v-if="
                        permissionStore.hasPermission(
                          'mall.update',
                        )
                      "
                      class="text-button"
                      type="button"
                    >
                      編輯
                    </button>

                    <button
                      v-if="
                        permissionStore.hasPermission(
                          'mall.publish',
                        )
                      "
                      class="text-button"
                      :class="{
                        'text-button--publish':
                          product.status !== '已上架',
                        'text-button--unpublish':
                          product.status === '已上架',
                      }"
                      type="button"
                    >
                      {{
                        product.status === '已上架'
                          ? '下架'
                          : '上架'
                      }}
                    </button>
                  </div>
                </td>
              </tr>

              <tr v-if="filteredProducts.length === 0">
                <td
                  class="empty-state"
                  colspan="11"
                >
                  找不到符合條件的商品資料
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
import { computed, ref } from 'vue'

import AdminLayout from '../../layouts/AdminLayout.vue'
import { usePermissionStore } from '../../stores/permission'

type ProductCategory =
  | '美妝保養'
  | '陶瓷茶器'
  | '服飾選品'
  | '食品茶飲'

type ProductStatus =
  | '已上架'
  | '待審核'
  | '已下架'

type ProductMarket =
  | '台灣市場'
  | '中國大陸市場'
  | '雙市場'

interface ProductRow {
  id: number
  code: string
  name: string
  shortName: string
  specification: string
  category: ProductCategory
  merchant: string
  priceTwd: number
  priceCny: number
  stock: number
  safetyStock: number
  market: ProductMarket
  status: ProductStatus
  updatedAt: string
}

const permissionStore =
  usePermissionStore()

const keyword = ref('')

const categoryFilter =
  ref<ProductCategory | ''>('')

const marketFilter =
  ref<ProductMarket | ''>('')

const statusFilter =
  ref<ProductStatus | ''>('')

const products: ProductRow[] = [
  {
    id: 1,
    code: 'PRD-100001',
    name: '阿拉丁清痘修護五件套',
    shortName: '美',
    specification: '五件套',
    category: '美妝保養',
    merchant: '杭州博潾數字科技',
    priceTwd: 13496,
    priceCny: 2999,
    stock: 568,
    safetyStock: 100,
    market: '雙市場',
    status: '已上架',
    updatedAt: '2026-07-31',
  },
  {
    id: 2,
    code: 'PRD-100002',
    name: '歲寒三友琺瑯橄欖瓶',
    shortName: '瓷',
    specification: '景德鎮瓷器',
    category: '陶瓷茶器',
    merchant: '景德鎮陶瓷生活館',
    priceTwd: 10000,
    priceCny: 2280,
    stock: 32,
    safetyStock: 50,
    market: '雙市場',
    status: '已上架',
    updatedAt: '2026-07-30',
  },
  {
    id: 3,
    code: 'PRD-100003',
    name: '亞麻天絲綁帶上衣套裝',
    shortName: '衣',
    specification: '單一尺寸',
    category: '服飾選品',
    merchant: '台北精品生活選物店',
    priceTwd: 2990,
    priceCny: 680,
    stock: 126,
    safetyStock: 30,
    market: '台灣市場',
    status: '待審核',
    updatedAt: '2026-07-29',
  },
  {
    id: 4,
    code: 'PRD-100004',
    name: '普洱生茶甘翠禮盒',
    shortName: '茶',
    specification: '精品禮盒裝',
    category: '食品茶飲',
    merchant: '阿拉丁甄選商城',
    priceTwd: 5999,
    priceCny: 1380,
    stock: 0,
    safetyStock: 40,
    market: '雙市場',
    status: '已下架',
    updatedAt: '2026-07-28',
  },
]

const filteredProducts = computed(() => {
  const normalizedKeyword =
    keyword.value
      .trim()
      .toLowerCase()

  return products.filter((product) => {
    const matchesKeyword =
      !normalizedKeyword ||
      product.name
        .toLowerCase()
        .includes(normalizedKeyword) ||
      product.code
        .toLowerCase()
        .includes(normalizedKeyword) ||
      product.merchant
        .toLowerCase()
        .includes(normalizedKeyword)

    const matchesCategory =
      !categoryFilter.value ||
      product.category ===
        categoryFilter.value

    const matchesMarket =
      !marketFilter.value ||
      product.market ===
        marketFilter.value

    const matchesStatus =
      !statusFilter.value ||
      product.status ===
        statusFilter.value

    return (
      matchesKeyword &&
      matchesCategory &&
      matchesMarket &&
      matchesStatus
    )
  })
})

const publishedCount = computed(() =>
  products.filter(
    (product) =>
      product.status === '已上架',
  ).length,
)

const unpublishedCount = computed(() =>
  products.filter(
    (product) =>
      product.status === '已下架',
  ).length,
)

const lowStockCount = computed(() =>
  products.filter(
    (product) =>
      product.stock <= product.safetyStock,
  ).length,
)

function formatTwd(
  value: number,
): string {
  return new Intl.NumberFormat(
    'zh-TW',
    {
      style: 'currency',
      currency: 'TWD',
      maximumFractionDigits: 0,
    },
  ).format(value)
}

function formatCny(
  value: number,
): string {
  return new Intl.NumberFormat(
    'zh-CN',
    {
      style: 'currency',
      currency: 'CNY',
      maximumFractionDigits: 0,
    },
  ).format(value)
}

function getStatusClass(
  status: ProductStatus,
): string {
  switch (status) {
    case '已上架':
      return 'status-badge--success'

    case '待審核':
      return 'status-badge--warning'

    case '已下架':
      return 'status-badge--neutral'
  }
}

function getMarketClass(
  market: ProductMarket,
): string {
  switch (market) {
    case '台灣市場':
      return 'market-badge--taiwan'

    case '中國大陸市場':
      return 'market-badge--china'

    case '雙市場':
      return 'market-badge--dual'
  }
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

.page-header h1 {
  margin: 4px 0 8px;
  color: #0f172a;
  font-size: 34px;
}

.page-eyebrow {
  margin: 0;
  color: #3157d6;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.page-description {
  margin: 0;
  color: #64748b;
  line-height: 1.7;
}

.primary-button {
  flex-shrink: 0;
  padding: 12px 20px;
  border: 0;
  border-radius: 12px;
  background: #3157d6;
  color: #ffffff;
  cursor: pointer;
  font-size: 15px;
  font-weight: 700;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;
}

.primary-button:hover {
  background: #2547bd;
  transform: translateY(-1px);
}

.summary-grid {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
  gap: 18px;
}

.summary-card {
  display: flex;
  min-height: 140px;
  flex-direction: column;
  padding: 22px;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  background: #ffffff;
  box-shadow:
    0 10px 25px
    rgba(15, 23, 42, 0.05);
}

.summary-card span {
  color: #64748b;
  font-size: 14px;
  font-weight: 700;
}

.summary-card strong {
  margin: 14px 0 8px;
  color: #0f172a;
  font-size: 32px;
}

.summary-card small {
  color: #94a3b8;
}

.mall-card {
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
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 22px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.table-toolbar h2 {
  margin: 0;
  color: #0f172a;
}

.table-toolbar p {
  margin: 6px 0 0;
  color: #94a3b8;
  font-size: 13px;
}

.toolbar-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 12px;
}

.search-input,
.filter-select {
  min-height: 42px;
  border: 1px solid #dbe2ea;
  border-radius: 10px;
  background: #ffffff;
  color: #0f172a;
  outline: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.search-input {
  width: 280px;
  padding: 0 14px;
}

.filter-select {
  padding: 0 12px;
}

.search-input:focus,
.filter-select:focus {
  border-color: #3157d6;
  box-shadow:
    0 0 0 3px
    rgba(49, 87, 214, 0.12);
}

.table-wrapper {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 16px 20px;
  border-bottom: 1px solid #eef2f7;
  text-align: left;
  white-space: nowrap;
}

th {
  background: #f8fafc;
  color: #64748b;
  font-size: 13px;
  font-weight: 800;
}

td {
  color: #334155;
  font-size: 14px;
}

tbody tr {
  transition:
    background-color 0.2s ease;
}

tbody tr:hover {
  background: #f8fafc;
}

.product-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.product-info div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.product-info strong {
  color: #0f172a;
}

.product-info small {
  color: #94a3b8;
}

.product-image {
  display: grid;
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  place-items: center;
  border-radius: 12px;
  background: #eef2ff;
  color: #3157d6;
  font-weight: 800;
}

.price-value {
  color: #0f172a;
  font-weight: 800;
}

.stock-value {
  color: #334155;
  font-weight: 700;
}

.stock-value--low {
  color: #dc2626;
}

.market-badge {
  display: inline-flex;
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
}

.market-badge--taiwan {
  background: #eff6ff;
  color: #1d4ed8;
}

.market-badge--china {
  background: #fff1f2;
  color: #be123c;
}

.market-badge--dual {
  background: #f3e8ff;
  color: #7e22ce;
}

.status-badge {
  display: inline-flex;
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
}

.status-badge--success {
  background: #dcfce7;
  color: #15803d;
}

.status-badge--warning {
  background: #fef3c7;
  color: #b45309;
}

.status-badge--neutral {
  background: #e2e8f0;
  color: #475569;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.text-button {
  padding: 7px 12px;
  border: 0;
  border-radius: 8px;
  background: #eef2ff;
  color: #3157d6;
  cursor: pointer;
  font-weight: 700;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;
}

.text-button:hover {
  background: #dfe6ff;
  transform: translateY(-1px);
}

.text-button--publish {
  background: #dcfce7;
  color: #15803d;
}

.text-button--publish:hover {
  background: #bbf7d0;
}

.text-button--unpublish {
  background: #fef3c7;
  color: #b45309;
}

.text-button--unpublish:hover {
  background: #fde68a;
}

.empty-state {
  padding: 42px;
  color: #94a3b8;
  text-align: center;
}

@media (max-width: 1320px) {
  th,
  td {
    padding-right: 16px;
    padding-left: 16px;
  }
}

@media (max-width: 1200px) {
  .summary-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .table-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .toolbar-actions {
    justify-content: flex-start;
  }
}

@media (max-width: 760px) {
  .page-header {
    flex-direction: column;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .toolbar-actions {
    flex-direction: column;
  }

  .search-input,
  .filter-select {
    width: 100%;
  }
}
</style>