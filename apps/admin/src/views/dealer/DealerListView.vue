<template>
  <AdminLayout>
    <div class="dealer-page">
      <section class="page-header">
        <div>
          <p class="page-eyebrow">
            DEALER ERP
          </p>

          <h1>
            經銷商管理
          </h1>

          <p class="page-description">
            管理經銷商資料、市場、區域、星級、團隊業績、佣金與帳號狀態。
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
      'dealer.create',
    )
  "
  class="primary-button"
  type="button"
  @click="handleCreate"
>
  新增經銷商
</button>
        </div>
      </section>

      <section class="stats-grid">
        <article class="stat-card">
          <span>經銷商總數</span>

          <strong>
            {{ store.statistics.total }}
          </strong>
        </article>

        <article class="stat-card">
          <span>待審核</span>

          <strong class="warning">
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
          <span>正常啟用</span>

          <strong class="success">
            {{ store.statistics.active }}
          </strong>
        </article>

        <article class="stat-card">
          <span>已暫停</span>

          <strong class="warning">
            {{ store.statistics.suspended }}
          </strong>
        </article>

        <article class="stat-card">
          <span>已停用</span>

          <strong class="danger">
            {{ store.statistics.disabled }}
          </strong>
        </article>

        <article class="stat-card">
          <span>普通經銷商</span>

          <strong>
            {{ store.statistics.normal }}
          </strong>
        </article>

        <article class="stat-card">
          <span>一星</span>

          <strong>
            {{ store.statistics.star1 }}
          </strong>
        </article>

        <article class="stat-card">
          <span>二星</span>

          <strong>
            {{ store.statistics.star2 }}
          </strong>
        </article>

        <article class="stat-card">
          <span>三星</span>

          <strong>
            {{ store.statistics.star3 }}
          </strong>
        </article>

        <article class="stat-card">
          <span>四星</span>

          <strong>
            {{ store.statistics.star4 }}
          </strong>
        </article>

        <article class="stat-card">
          <span>五星</span>

          <strong>
            {{ store.statistics.star5 }}
          </strong>
        </article>

        <article class="stat-card">
          <span>六星</span>

          <strong>
            {{ store.statistics.star6 }}
          </strong>
        </article>

        <article class="stat-card">
          <span>七星</span>

          <strong>
            {{ store.statistics.star7 }}
          </strong>
        </article>

        <article class="stat-card">
          <span>團隊總人數</span>

          <strong>
            {{
              formatNumber(
                store.statistics.totalTeamCount,
              )
            }}
          </strong>
        </article>

        <article class="stat-card">
          <span>團隊總業績</span>

          <strong class="success stat-card__money">
            {{
              formatMoney(
                store.statistics.totalTeamSales,
              )
            }}
          </strong>
        </article>

        <article class="stat-card">
          <span>累計佣金</span>

          <strong class="stat-card__money">
            {{
              formatMoney(
                store.statistics.totalCommission,
              )
            }}
          </strong>
        </article>
      </section>

      <section class="filter-card">
        <input
          v-model="keyword"
          type="search"
          placeholder="搜尋經銷商編號、姓名、手機或電子信箱"
          :disabled="store.isLoading"
          @keyup.enter="handleSearch"
        >

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
          v-model="level"
          :disabled="store.isLoading"
          @change="handleLevelChange"
        >
          <option value="">
            全部等級
          </option>

          <option value="normal">
            普通經銷商
          </option>

          <option value="star_1">
            一星
          </option>

          <option value="star_2">
            二星
          </option>

          <option value="star_3">
            三星
          </option>

          <option value="star_4">
            四星
          </option>

          <option value="star_5">
            五星
          </option>

          <option value="star_6">
            六星
          </option>

          <option value="star_7">
            七星
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
            正常啟用
          </option>

          <option value="suspended">
            已暫停
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
          正在載入經銷商資料...
        </div>

        <div
          v-else-if="
            !store.error &&
            store.dealers.length === 0
          "
          class="state-panel"
        >
          暫無經銷商資料
        </div>

        <div
          v-else-if="!store.error"
          class="table-wrapper"
        >
          <table>
            <thead>
              <tr>
                <th>經銷商</th>
                <th>經銷商編號</th>
                <th>市場</th>
                <th>區域</th>
                <th>經銷等級</th>
                <th>直推人數</th>
                <th>團隊人數</th>
                <th>團隊業績</th>
                <th>累計佣金</th>
                <th>狀態</th>
                <th>建立時間</th>
                <th>操作</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="dealer in store.dealers"
                :key="dealer.id"
              >
                <td>
                  <div class="dealer-info">
                    <span class="dealer-avatar">
                      {{
                        dealerInitial(
                          dealer.name,
                        )
                      }}
                    </span>

                    <div>
                      <strong>
                        {{ dealer.name }}
                      </strong>

                      <span>
                        {{ dealer.phone || '-' }}
                      </span>

                      <small>
                        {{ dealer.email || '-' }}
                      </small>
                    </div>
                  </div>
                </td>

                <td>
                  <strong class="dealer-no">
                    {{ dealer.dealerNo }}
                  </strong>
                </td>

                <td>
                  {{
                    marketText(
                      dealer.market,
                    )
                  }}
                </td>

                <td>
                  <div class="region-info">
                    <strong>
                      {{ dealer.regionName || '未分配' }}
                    </strong>

                    <small>
                      {{ dealer.regionId || '-' }}
                    </small>
                  </div>
                </td>

                <td>
                  <span
                    class="level-badge"
                    :class="
                      `level-badge--${dealer.level}`
                    "
                  >
                    {{
                      levelText(
                        dealer.level,
                      )
                    }}
                  </span>
                </td>

                <td>
                  {{
                    formatNumber(
                      dealer.directCount,
                    )
                  }}
                </td>

                <td>
                  {{
                    formatNumber(
                      dealer.teamCount,
                    )
                  }}
                </td>

                <td>
                  {{
                    formatMoney(
                      dealer.teamSales,
                    )
                  }}
                </td>

                <td>
                  {{
                    formatMoney(
                      dealer.totalCommission,
                    )
                  }}
                </td>

                <td>
                  <span
                    class="status-badge"
                    :class="
                      `status-badge--${dealer.status}`
                    "
                  >
                    {{
                      statusText(
                        dealer.status,
                      )
                    }}
                  </span>
                </td>

                <td>
                  {{
                    formatDate(
                      dealer.createdAt,
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
                          dealer.id,
                        )
                      "
                    >
                      查看
                    </button>

                    <button
                      v-if="
                        dealer.status ===
                          'pending' &&
                        permissionStore.hasPermission(
                          'dealer.approve',
                        )
                      "
                      class="review-button"
                      type="button"
                      @click="
                        handleView(
                          dealer.id,
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
  onMounted,
  ref,
} from 'vue'

import {
  useRouter,
} from 'vue-router'

import AdminLayout from '../../layouts/AdminLayout.vue'

import {
  useDealerStore,
} from '../../stores/dealer'

import {
  usePermissionStore,
} from '../../stores/permission'

import type {
  DealerFilters,
  DealerLevel,
  DealerMarket,
  DealerStatus,
} from '../../types/dealer'


const router =
  useRouter()


const store =
  useDealerStore()


const permissionStore =
  usePermissionStore()


const keyword =
  ref(
    store.filters.keyword ||
    '',
  )


const market =
  ref<
    DealerMarket | ''
  >(
    store.filters.market ||
    '',
  )


const level =
  ref<
    DealerLevel | ''
  >(
    store.filters.level ||
    '',
  )


const status =
  ref<
    DealerStatus | ''
  >(
    store.filters.status ||
    '',
  )


const pageSize =
  ref(
    store.filters.pageSize,
  )



function dealerInitial(
  name: string,
): string {

  const normalizedName =
    name.trim()


  return normalizedName
    ? normalizedName.slice(
        0,
        1,
      )
    : '?'

}



function marketText(
  value:
    DealerMarket,
): string {

  switch (value) {

    case 'taiwan':

      return '台灣市場'


    case 'china':

      return '中國市場'


    case 'cross_border':

      return '跨境市場'


    default:

      return value

  }

}



function levelText(
  value:
    DealerLevel,
): string {

  switch (value) {

    case 'normal':

      return '普通經銷商'


    case 'star_1':

      return '一星經銷商'


    case 'star_2':

      return '二星經銷商'


    case 'star_3':

      return '三星經銷商'


    case 'star_4':

      return '四星經銷商'


    case 'star_5':

      return '五星經銷商'


    case 'star_6':

      return '六星經銷商'


    case 'star_7':

      return '七星經銷商'


    default:

      return value

  }

}



function statusText(
  value:
    DealerStatus,
): string {

  switch (value) {

    case 'pending':

      return '待審核'


    case 'approved':

      return '已通過'


    case 'active':

      return '正常啟用'


    case 'suspended':

      return '已暫停'


    case 'disabled':

      return '已停用'


    default:

      return value

  }

}



function formatNumber(
  value: number,
): string {

  return new Intl.NumberFormat(
    'zh-TW',
  ).format(
    Number.isFinite(value)
      ? value
      : 0,
  )

}



function formatMoney(
  value: number,
): string {

  return new Intl.NumberFormat(
    'zh-TW',
    {
      style:
        'currency',

      currency:
        'TWD',

      maximumFractionDigits:
        0,
    },
  ).format(
    Number.isFinite(value)
      ? value
      : 0,
  )

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

    return value

  }


  return new Intl.DateTimeFormat(
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

      hour12:
        false,
    },
  ).format(date)

}



async function handleRefresh():
  Promise<void> {

  await store.fetchDealers()

}



async function handleSearch():
  Promise<void> {

  await store.searchDealers(
    keyword.value,
  )

}



async function handleMarketChange():
  Promise<void> {

  await store.setMarketFilter(
    market.value,
  )

}



async function handleLevelChange():
  Promise<void> {

  await store.setLevelFilter(
    level.value,
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


  market.value =
    ''


  level.value =
    ''


  status.value =
    ''


  pageSize.value =
    20


  await store.resetFilters()

}



async function handlePreviousPage():
  Promise<void> {

  if (
    !store.hasPreviousPage
  ) {

    return

  }


  await store.setPage(
    store.pagination.page -
    1,
  )

}



async function handleNextPage():
  Promise<void> {

  if (
    !store.hasNextPage
  ) {

    return

  }


  await store.setPage(
    store.pagination.page +
    1,
  )

}

async function handleCreate():
  Promise<void> {

  await router.push({
    name:
      'dealer-create',
  })

}

async function handleView(
  dealerId: string,
):
  Promise<void> {

  await router.push({
    name:
      'dealer-detail',

    params: {
      id:
        dealerId,
    },
  })

}



onMounted(
  async () => {

    const initialFilters:
      DealerFilters = {
        ...store.filters,

        keyword:
          keyword.value,

        market:
          market.value,

        level:
          level.value,

        status:
          status.value,

        pageSize:
          pageSize.value,
      }


    store.filters =
      initialFilters


    await store.fetchDealers()

  },
)
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
  line-height: 1.2;
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

.header-actions {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 12px;
}

button {
  min-height: 40px;
  padding: 9px 14px;
  border: 1px solid #dbe2ea;
  border-radius: 10px;
  background: #ffffff;
  color: #334155;
  cursor: pointer;
  font-weight: 700;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}

button:hover:not(:disabled) {
  border-color: #cbd5e1;
  background: #f8fafc;
  transform: translateY(-1px);
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.primary-button {
  border-color: #3157d6;
  background: #3157d6;
  color: #ffffff;
}

.primary-button:hover:not(:disabled) {
  border-color: #2547bd;
  background: #2547bd;
}

.refresh-button {
  background: #ffffff;
  color: #3157d6;
}

.stats-grid {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.stat-card {
  display: flex;
  min-height: 112px;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  background: #ffffff;
  box-shadow:
    0 8px 22px
    rgba(15, 23, 42, 0.04);
}

.stat-card span {
  color: #64748b;
  font-size: 13px;
  font-weight: 700;
}

.stat-card strong {
  margin-top: 14px;
  color: #0f172a;
  font-size: 28px;
  line-height: 1.2;
}

.stat-card strong.success {
  color: #15803d;
}

.stat-card strong.warning {
  color: #b45309;
}

.stat-card strong.danger {
  color: #b91c1c;
}

.stat-card__money {
  font-size: 22px !important;
}

.filter-card {
  display: grid;
  grid-template-columns:
    minmax(260px, 1.8fr)
    repeat(4, minmax(140px, 0.8fr))
    auto
    auto;
  gap: 12px;
  padding: 18px;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  background: #ffffff;
  box-shadow:
    0 8px 22px
    rgba(15, 23, 42, 0.04);
}

.filter-card input,
.filter-card select {
  width: 100%;
  min-height: 42px;
  padding: 0 13px;
  border: 1px solid #dbe2ea;
  border-radius: 10px;
  background: #ffffff;
  color: #0f172a;
  outline: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.filter-card input::placeholder {
  color: #94a3b8;
}

.filter-card input:focus,
.filter-card select:focus {
  border-color: #3157d6;
  box-shadow:
    0 0 0 3px
    rgba(49, 87, 214, 0.12);
}

.filter-card input:disabled,
.filter-card select:disabled {
  cursor: not-allowed;
  background: #f8fafc;
  opacity: 0.7;
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

.error-panel,
.state-panel {
  padding: 48px 24px;
  text-align: center;
}

.error-panel {
  border-bottom: 1px solid #fecaca;
  background: #fef2f2;
  color: #b91c1c;
  font-weight: 700;
}

.state-panel {
  color: #64748b;
}

.table-wrapper {
  overflow-x: auto;
}

table {
  width: 100%;
  min-width: 1500px;
  border-collapse: collapse;
}

th,
td {
  padding: 15px 18px;
  border-bottom: 1px solid #eef2f7;
  text-align: left;
  vertical-align: middle;
  white-space: nowrap;
}

th {
  background: #f8fafc;
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.02em;
}

td {
  color: #334155;
  font-size: 14px;
}

tbody tr {
  transition: background-color 0.2s ease;
}

tbody tr:hover {
  background: #f8fafc;
}

tbody tr:last-child td {
  border-bottom: 0;
}

.dealer-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dealer-info > div {
  display: flex;
  max-width: 220px;
  flex-direction: column;
  gap: 4px;
}

.dealer-info strong {
  overflow: hidden;
  color: #0f172a;
  text-overflow: ellipsis;
}

.dealer-info span:not(.dealer-avatar) {
  color: #475569;
  font-size: 13px;
}

.dealer-info small {
  overflow: hidden;
  color: #94a3b8;
  font-size: 12px;
  text-overflow: ellipsis;
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

.dealer-no {
  color: #3157d6;
  font-size: 13px;
}

.region-info {
  display: flex;
  max-width: 190px;
  flex-direction: column;
  gap: 4px;
}

.region-info strong {
  overflow: hidden;
  color: #334155;
  text-overflow: ellipsis;
}

.region-info small {
  overflow: hidden;
  color: #94a3b8;
  font-size: 11px;
  text-overflow: ellipsis;
}

.level-badge,
.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 28px;
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
}

.level-badge--normal {
  background: #e2e8f0;
  color: #475569;
}

.level-badge--star_1 {
  background: #eff6ff;
  color: #2563eb;
}

.level-badge--star_2 {
  background: #eef2ff;
  color: #4f46e5;
}

.level-badge--star_3 {
  background: #f5f3ff;
  color: #7c3aed;
}

.level-badge--star_4 {
  background: #faf5ff;
  color: #9333ea;
}

.level-badge--star_5 {
  background: #fdf4ff;
  color: #c026d3;
}

.level-badge--star_6 {
  background: #fff7ed;
  color: #ea580c;
}

.level-badge--star_7 {
  background: #fefce8;
  color: #a16207;
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
  background: #ffedd5;
  color: #c2410c;
}

.status-badge--disabled {
  background: #fee2e2;
  color: #b91c1c;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.view-button {
  border-color: #c7d2fe;
  background: #eef2ff;
  color: #3157d6;
}

.view-button:hover:not(:disabled) {
  border-color: #a5b4fc;
  background: #e0e7ff;
}

.review-button {
  border-color: #bbf7d0;
  background: #dcfce7;
  color: #15803d;
}

.review-button:hover:not(:disabled) {
  border-color: #86efac;
  background: #bbf7d0;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 18px 22px;
  border-top: 1px solid #e5e7eb;
  color: #64748b;
  font-size: 13px;
}

.pagination > div {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pagination button {
  min-width: 84px;
}

@media (max-width: 1500px) {
  .stats-grid {
    grid-template-columns:
      repeat(3, minmax(0, 1fr));
  }

  .filter-card {
    grid-template-columns:
      repeat(3, minmax(0, 1fr));
  }

  .filter-card input {
    grid-column: span 2;
  }
}

@media (max-width: 1100px) {
  .stats-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .filter-card {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .filter-card input {
    grid-column: span 2;
  }
}

@media (max-width: 760px) {
  .page-header {
    flex-direction: column;
  }

  .header-actions {
    width: 100%;
  }

  .header-actions button {
    flex: 1;
  }

  .page-header h1 {
    font-size: 28px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .filter-card {
    grid-template-columns: 1fr;
  }

  .filter-card input {
    grid-column: auto;
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