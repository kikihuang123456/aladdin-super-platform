<template>
  <AdminLayout>
    <div class="dealer-page">
      <section class="page-header">
        <div>
          <p class="page-eyebrow">
            DEALER MANAGEMENT
          </p>

          <h1>
            經銷商管理
          </h1>

          <p class="page-description">
            管理經銷商資料、區域、等級、審核狀態、業績與帳號權限。
          </p>
        </div>

        <button
          v-if="permissionStore.hasPermission('dealer.create')"
          class="primary-button"
          type="button"
        >
          新增經銷商
        </button>
      </section>

      <section class="summary-grid">
        <article class="summary-card">
          <span>經銷商總數</span>
          <strong>1,248</strong>
          <small>已建立經銷商帳號</small>
        </article>

        <article class="summary-card">
          <span>待審核</span>
          <strong>36</strong>
          <small>等待平台審核</small>
        </article>

        <article class="summary-card">
          <span>正常啟用</span>
          <strong>1,167</strong>
          <small>帳號與經銷權限正常</small>
        </article>

        <article class="summary-card">
          <span>已停用</span>
          <strong>45</strong>
          <small>限制登入或經銷權限</small>
        </article>
      </section>

      <section class="dealer-card">
        <div class="table-toolbar">
          <div>
            <h2>
              經銷商列表
            </h2>

            <p>
              目前為 Sprint 2 靜態展示資料
            </p>
          </div>

          <div class="toolbar-actions">
            <input
              v-model.trim="keyword"
              class="search-input"
              type="search"
              placeholder="搜尋姓名、編號、手機或區域"
            >

            <select
              v-model="levelFilter"
              class="filter-select"
            >
              <option value="">
                全部等級
              </option>

              <option value="區域經銷商">
                區域經銷商
              </option>

              <option value="城市經銷商">
                城市經銷商
              </option>

              <option value="品牌經銷商">
                品牌經銷商
              </option>
            </select>

            <select
              v-model="statusFilter"
              class="filter-select"
            >
              <option value="">
                全部狀態
              </option>

              <option value="正常">
                正常
              </option>

              <option value="停用">
                停用
              </option>
            </select>
          </div>
        </div>

        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>經銷商</th>
                <th>經銷商編號</th>
                <th>區域</th>
                <th>經銷等級</th>
                <th>手機號碼</th>
                <th>本月業績</th>
                <th>審核狀態</th>
                <th>帳號狀態</th>
                <th>加入日期</th>
                <th>操作</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="dealer in filteredDealers"
                :key="dealer.id"
              >
                <td>
                  <div class="dealer-info">
                    <span class="dealer-avatar">
                      {{ dealer.name.slice(0, 1) }}
                    </span>

                    <div>
                      <strong>
                        {{ dealer.name }}
                      </strong>

                      <small>
                        {{ dealer.market }}
                      </small>
                    </div>
                  </div>
                </td>

                <td>
                  {{ dealer.code }}
                </td>

                <td>
                  {{ dealer.region }}
                </td>

                <td>
                  {{ dealer.level }}
                </td>

                <td>
                  {{ dealer.phone }}
                </td>

                <td>
                  {{ formatCurrency(dealer.monthlySales) }}
                </td>

                <td>
                  <span
                    class="status-badge"
                    :class="getReviewClass(dealer.reviewStatus)"
                  >
                    {{ dealer.reviewStatus }}
                  </span>
                </td>

                <td>
                  <span
                    class="status-badge"
                    :class="getAccountClass(dealer.accountStatus)"
                  >
                    {{ dealer.accountStatus }}
                  </span>
                </td>

                <td>
                  {{ dealer.createdAt }}
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
                          'dealer.update',
                        )
                      "
                      class="text-button"
                      type="button"
                    >
                      編輯
                    </button>

                    <button
                      v-if="
                        dealer.reviewStatus === '待審核' &&
                        permissionStore.hasPermission(
                          'dealer.approve',
                        )
                      "
                      class="text-button text-button--approve"
                      type="button"
                    >
                      審核
                    </button>
                  </div>
                </td>
              </tr>

              <tr v-if="filteredDealers.length === 0">
                <td
                  class="empty-state"
                  colspan="10"
                >
                  找不到符合條件的經銷商資料
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

type DealerLevel =
  | '區域經銷商'
  | '城市經銷商'
  | '品牌經銷商'

type ReviewStatus =
  | '已通過'
  | '待審核'
  | '已退回'

type AccountStatus =
  | '正常'
  | '停用'

interface DealerRow {
  id: number
  code: string
  name: string
  market: string
  region: string
  level: DealerLevel
  phone: string
  monthlySales: number
  reviewStatus: ReviewStatus
  accountStatus: AccountStatus
  createdAt: string
}

const permissionStore =
  usePermissionStore()

const keyword = ref('')

const levelFilter =
  ref<DealerLevel | ''>('')

const statusFilter =
  ref<AccountStatus | ''>('')

const dealers: DealerRow[] = [
  {
    id: 1,
    code: 'DEA-100001',
    name: '周連華',
    market: '台灣市場',
    region: '台灣北區',
    level: '區域經銷商',
    phone: '0930-569-218',
    monthlySales: 1286000,
    reviewStatus: '已通過',
    accountStatus: '正常',
    createdAt: '2026-07-31',
  },
  {
    id: 2,
    code: 'DEA-100002',
    name: '吳玉珍',
    market: '台灣市場',
    region: '台灣中區',
    level: '城市經銷商',
    phone: '0922-456-789',
    monthlySales: 786000,
    reviewStatus: '已通過',
    accountStatus: '正常',
    createdAt: '2026-07-30',
  },
  {
    id: 3,
    code: 'DEA-100003',
    name: '王志明',
    market: '中國大陸市場',
    region: '山東濟南',
    level: '品牌經銷商',
    phone: '138-0000-7788',
    monthlySales: 468000,
    reviewStatus: '待審核',
    accountStatus: '正常',
    createdAt: '2026-07-29',
  },
  {
    id: 4,
    code: 'DEA-100004',
    name: '陳雅婷',
    market: '台灣市場',
    region: '台灣南區',
    level: '城市經銷商',
    phone: '0911-222-333',
    monthlySales: 0,
    reviewStatus: '已退回',
    accountStatus: '停用',
    createdAt: '2026-07-28',
  },
]

const filteredDealers = computed(() => {
  const normalizedKeyword =
    keyword.value
      .trim()
      .toLowerCase()

  return dealers.filter((dealer) => {
    const matchesKeyword =
      !normalizedKeyword ||
      dealer.name
        .toLowerCase()
        .includes(normalizedKeyword) ||
      dealer.code
        .toLowerCase()
        .includes(normalizedKeyword) ||
      dealer.phone
        .toLowerCase()
        .includes(normalizedKeyword) ||
      dealer.region
        .toLowerCase()
        .includes(normalizedKeyword)

    const matchesLevel =
      !levelFilter.value ||
      dealer.level === levelFilter.value

    const matchesStatus =
      !statusFilter.value ||
      dealer.accountStatus ===
        statusFilter.value

    return (
      matchesKeyword &&
      matchesLevel &&
      matchesStatus
    )
  })
})

function formatCurrency(
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

function getReviewClass(
  status: ReviewStatus,
): string {
  switch (status) {
    case '已通過':
      return 'status-badge--success'

    case '待審核':
      return 'status-badge--warning'

    case '已退回':
      return 'status-badge--danger'
  }
}

function getAccountClass(
  status: AccountStatus,
): string {
  return status === '正常'
    ? 'status-badge--success'
    : 'status-badge--neutral'
}
</script>

<style scoped>
.dealer-page {
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

.dealer-card {
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

.dealer-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dealer-info div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dealer-info strong {
  color: #0f172a;
}

.dealer-info small {
  color: #94a3b8;
}

.dealer-avatar {
  display: grid;
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  place-items: center;
  border-radius: 12px;
  background: #eef2ff;
  color: #3157d6;
  font-size: 16px;
  font-weight: 800;
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

.status-badge--danger {
  background: #fee2e2;
  color: #b91c1c;
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

.text-button--approve {
  background: #dcfce7;
  color: #15803d;
}

.text-button--approve:hover {
  background: #bbf7d0;
}

.empty-state {
  padding: 42px;
  color: #94a3b8;
  text-align: center;
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