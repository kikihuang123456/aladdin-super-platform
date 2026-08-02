<template>
  <AdminLayout>
    <div class="merchant-page">
      <section class="page-header">
        <div>
          <p class="page-eyebrow">
            MERCHANT MANAGEMENT
          </p>

          <h1>
            商家管理
          </h1>

          <p class="page-description">
            管理平台合作商家、店鋪資訊、審核狀態、營業狀態與商城上架權限。
          </p>
        </div>

        <button
          v-if="permissionStore.hasPermission('merchant.create')"
          class="primary-button"
          type="button"
        >
          新增商家
        </button>
      </section>

      <section class="summary-grid">
        <article class="summary-card">
          <span>合作商家</span>
          <strong>326</strong>
          <small>已建立商家帳號</small>
        </article>

        <article class="summary-card">
          <span>待審核</span>
          <strong>18</strong>
          <small>等待平台審核</small>
        </article>

        <article class="summary-card">
          <span>營業中</span>
          <strong>291</strong>
          <small>目前正常營運</small>
        </article>

        <article class="summary-card">
          <span>已停用</span>
          <strong>17</strong>
          <small>限制後台與上架權限</small>
        </article>
      </section>

      <section class="merchant-card">
        <div class="table-toolbar">
          <div>
            <h2>
              商家列表
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
              placeholder="搜尋商家名稱、編號或聯絡人"
            >

            <select
              v-model="reviewFilter"
              class="filter-select"
            >
              <option value="">
                全部審核狀態
              </option>

              <option value="已通過">
                已通過
              </option>

              <option value="待審核">
                待審核
              </option>

              <option value="已退回">
                已退回
              </option>
            </select>

            <select
              v-model="businessFilter"
              class="filter-select"
            >
              <option value="">
                全部營業狀態
              </option>

              <option value="營業中">
                營業中
              </option>

              <option value="暫停營業">
                暫停營業
              </option>

              <option value="已停用">
                已停用
              </option>
            </select>
          </div>
        </div>

        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>商家</th>
                <th>商家編號</th>
                <th>商家類型</th>
                <th>聯絡人</th>
                <th>聯絡電話</th>
                <th>審核狀態</th>
                <th>營業狀態</th>
                <th>建立日期</th>
                <th>操作</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="merchant in filteredMerchants"
                :key="merchant.id"
              >
                <td>
                  <div class="merchant-info">
                    <span class="merchant-logo">
                      {{ merchant.shortName }}
                    </span>

                    <div>
                      <strong>
                        {{ merchant.name }}
                      </strong>

                      <small>
                        {{ merchant.market }}
                      </small>
                    </div>
                  </div>
                </td>

                <td>
                  {{ merchant.code }}
                </td>

                <td>
                  {{ merchant.type }}
                </td>

                <td>
                  {{ merchant.contactName }}
                </td>

                <td>
                  {{ merchant.phone }}
                </td>

                <td>
                  <span
                    class="status-badge"
                    :class="getReviewClass(merchant.reviewStatus)"
                  >
                    {{ merchant.reviewStatus }}
                  </span>
                </td>

                <td>
                  <span
                    class="status-badge"
                    :class="getBusinessClass(merchant.businessStatus)"
                  >
                    {{ merchant.businessStatus }}
                  </span>
                </td>

                <td>
                  {{ merchant.createdAt }}
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
                          'merchant.update',
                        )
                      "
                      class="text-button"
                      type="button"
                    >
                      編輯
                    </button>

                    <button
                      v-if="
                        merchant.reviewStatus === '待審核' &&
                        permissionStore.hasPermission(
                          'merchant.approve',
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

              <tr v-if="filteredMerchants.length === 0">
                <td
                  class="empty-state"
                  colspan="9"
                >
                  找不到符合條件的商家資料
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

type ReviewStatus =
  | '已通過'
  | '待審核'
  | '已退回'

type BusinessStatus =
  | '營業中'
  | '暫停營業'
  | '已停用'

interface MerchantRow {
  id: number
  code: string
  name: string
  shortName: string
  market: string
  type: string
  contactName: string
  phone: string
  reviewStatus: ReviewStatus
  businessStatus: BusinessStatus
  createdAt: string
}

const permissionStore =
  usePermissionStore()

const keyword = ref('')

const reviewFilter =
  ref<ReviewStatus | ''>('')

const businessFilter =
  ref<BusinessStatus | ''>('')

const merchants: MerchantRow[] = [
  {
    id: 1,
    code: 'MER-100001',
    name: '杭州博潾數字科技有限公司',
    shortName: '博',
    market: '中國大陸市場',
    type: '平台直營',
    contactName: '黃湘涵',
    phone: '151-1112-6171',
    reviewStatus: '已通過',
    businessStatus: '營業中',
    createdAt: '2026-07-31',
  },
  {
    id: 2,
    code: 'MER-100002',
    name: '台灣阿拉丁甄選商城',
    shortName: '台',
    market: '台灣市場',
    type: '品牌商家',
    contactName: '周連華',
    phone: '0930-569-218',
    reviewStatus: '已通過',
    businessStatus: '營業中',
    createdAt: '2026-07-30',
  },
  {
    id: 3,
    code: 'MER-100003',
    name: '景德鎮陶瓷生活館',
    shortName: '瓷',
    market: '中國大陸市場',
    type: '供應商',
    contactName: '陳先生',
    phone: '138-0000-8812',
    reviewStatus: '待審核',
    businessStatus: '暫停營業',
    createdAt: '2026-07-29',
  },
  {
    id: 4,
    code: 'MER-100004',
    name: '台北精品生活選物店',
    shortName: '北',
    market: '台灣市場',
    type: '一般商家',
    contactName: '林怡君',
    phone: '0922-456-789',
    reviewStatus: '已退回',
    businessStatus: '已停用',
    createdAt: '2026-07-28',
  },
]

const filteredMerchants = computed(() => {
  const normalizedKeyword =
    keyword.value
      .trim()
      .toLowerCase()

  return merchants.filter((merchant) => {
    const matchesKeyword =
      !normalizedKeyword ||
      merchant.name
        .toLowerCase()
        .includes(normalizedKeyword) ||
      merchant.code
        .toLowerCase()
        .includes(normalizedKeyword) ||
      merchant.contactName
        .toLowerCase()
        .includes(normalizedKeyword)

    const matchesReview =
      !reviewFilter.value ||
      merchant.reviewStatus ===
        reviewFilter.value

    const matchesBusiness =
      !businessFilter.value ||
      merchant.businessStatus ===
        businessFilter.value

    return (
      matchesKeyword &&
      matchesReview &&
      matchesBusiness
    )
  })
})

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

function getBusinessClass(
  status: BusinessStatus,
): string {
  switch (status) {
    case '營業中':
      return 'status-badge--success'

    case '暫停營業':
      return 'status-badge--warning'

    case '已停用':
      return 'status-badge--neutral'
  }
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

.merchant-card {
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
  width: 270px;
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

.merchant-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.merchant-info div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.merchant-info strong {
  color: #0f172a;
}

.merchant-info small {
  color: #94a3b8;
}

.merchant-logo {
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