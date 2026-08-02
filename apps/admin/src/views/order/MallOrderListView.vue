<template>
  <AdminLayout>
    <div class="order-page">
      <section class="page-header">
        <div>
          <p class="page-eyebrow">
            MALL ORDER ERP
          </p>

          <h1>
            訂單管理
          </h1>

          <p class="page-description">
            管理商城訂單、付款狀態、配送流程與交易紀錄。
          </p>
        </div>
      </section>

      <OrderStatisticsCards
        :statistics="store.statistics"
      />

      <OrderFilterToolbar
        :loading="store.isLoading"
        @search="handleSearch"
        @filter="handleFilter"
        @page-size="handlePageSize"
        @refresh="handleRefresh"
        @reset="handleReset"
      />

      <section class="table-card">
        <div
          v-if="store.error"
          class="error-panel"
          role="alert"
        >
          <div>
            <strong>
              訂單資料載入失敗
            </strong>

            <p>
              {{ store.error }}
            </p>
          </div>

          <button
            type="button"
            :disabled="store.isLoading"
            @click="handleRefresh"
          >
            重新載入
          </button>
        </div>

        <div
          v-if="store.isLoading"
          class="state-panel"
        >
          <div class="loading-spinner" />

          <strong>
            正在載入訂單資料
          </strong>

          <p>
            系統正在連線至 Supabase 訂單資料庫。
          </p>
        </div>

        <div
          v-else-if="
            !store.error &&
            store.orders.length === 0
          "
          class="state-panel"
        >
          <div class="state-icon">
            訂單
          </div>

          <strong>
            暫無訂單資料
          </strong>

          <p>
            目前沒有符合篩選條件的訂單資料。
          </p>
        </div>

        <div
          v-else-if="!store.error"
          class="table-wrapper"
        >
          <table class="order-table">
            <thead>
              <tr>
                <th>
                  訂單編號
                </th>

                <th>
                  會員
                </th>

                <th>
                  商品
                </th>

                <th>
                  應付金額
                </th>

                <th>
                  付款狀態
                </th>

                <th>
                  訂單狀態
                </th>

                <th>
                  配送狀態
                </th>

                <th>
                  建立時間
                </th>

                <th>
                  操作
                </th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="order in store.orders"
                :key="order.id"
              >
                <td>
                  <strong class="order-number">
                    {{ order.orderNo }}
                  </strong>
                </td>

                <td>
                  <div class="member-info">
                    <strong>
                      {{
                        order.memberName ||
                        '未命名會員'
                      }}
                    </strong>

                    <span>
                      {{
                        order.memberPhone ||
                        '-'
                      }}
                    </span>
                  </div>
                </td>

                <td>
                  {{
                    order.items.length
                  }}
                  項
                </td>

                <td>
                  <strong class="amount">
                    {{
                      formatMoney(
                        order.payableAmount,
                        order.currency,
                      )
                    }}
                  </strong>
                </td>

                <td>
                  <OrderStatusBadge
                    type="payment"
                    :status="
                      order.paymentStatus
                    "
                  />
                </td>

                <td>
                  <OrderStatusBadge
                    type="order"
                    :status="
                      order.orderStatus
                    "
                  />
                </td>

                <td>
                  <OrderStatusBadge
                    type="shipping"
                    :status="
                      order.shippingStatus
                    "
                  />
                </td>

                <td>
                  {{
                    formatDate(
                      order.createdAt,
                    )
                  }}
                </td>

                <td>
                  <OrderActionMenu
                    :disabled="
                      store.isMutating
                    "
                    @view="
                      handleView(
                        order.id,
                      )
                    "
                    @ship="
                      handleShip(
                        order.id,
                      )
                    "
                    @complete="
                      handleComplete(
                        order.id,
                      )
                    "
                    @cancel="
                      handleCancel(
                        order.id,
                      )
                    "
                  />
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
          <div class="pagination__summary">
            共
            <strong>
              {{ store.pagination.total }}
            </strong>
            筆訂單
          </div>

          <div class="pagination__controls">
            <button
              type="button"
              :disabled="
                !store.hasPreviousPage ||
                store.isLoading
              "
              @click="handlePreviousPage"
            >
              上一頁
            </button>

            <span>
              第
              <strong>
                {{ store.pagination.page }}
              </strong>
              頁／共
              <strong>
                {{
                  store.pagination.totalPages ||
                  1
                }}
              </strong>
              頁
            </span>

            <button
              type="button"
              :disabled="
                !store.hasNextPage ||
                store.isLoading
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
} from 'vue'

import {
  useRouter,
} from 'vue-router'

import AdminLayout
  from '../../layouts/AdminLayout.vue'

import OrderStatisticsCards
  from '../../components/order/OrderStatisticsCards.vue'

import OrderFilterToolbar
  from '../../components/order/OrderFilterToolbar.vue'

import OrderStatusBadge
  from '../../components/order/OrderStatusBadge.vue'

import OrderActionMenu
  from '../../components/order/OrderActionMenu.vue'

import {
  useMallOrderStore,
} from '../../stores/mall-order'

import type {
  MallOrderFilters,
} from '../../types/mall-order'

const router =
  useRouter()

const store =
  useMallOrderStore()

onMounted(async () => {
  await store.fetchOrders()
})

async function handleSearch(
  keyword: string,
): Promise<void> {
  await store.searchOrders(
    keyword,
  )
}

async function handleFilter(
  payload: {
    orderStatus:
      string

    paymentStatus:
      string

    shippingStatus:
      string

    startDate:
      string

    endDate:
      string
  },
): Promise<void> {
  store.filters.orderStatus =
    payload.orderStatus as
      MallOrderFilters['orderStatus']

  store.filters.paymentStatus =
    payload.paymentStatus as
      MallOrderFilters['paymentStatus']

  store.filters.shippingStatus =
    payload.shippingStatus as
      MallOrderFilters['shippingStatus']

  store.filters.startDate =
    payload.startDate ||
    null

  store.filters.endDate =
    payload.endDate ||
    null

  store.filters.page = 1

  await store.fetchOrders()
}

async function handlePageSize(
  pageSize: number,
): Promise<void> {
  store.filters.pageSize =
    pageSize

  store.filters.page = 1

  await store.fetchOrders()
}

async function handleRefresh():
  Promise<void> {
  await store.fetchOrders()
}

async function handleReset():
  Promise<void> {
  await store.resetFilters()
}

function handleView(
  orderId: string,
): void {
  router.push(
    `/order/${orderId}`,
  )
}

async function handleShip(
  orderId: string,
): Promise<void> {
  await store.updateOrderStatus({
    orderId,

    orderStatus:
      'shipped',

    shippingStatus:
      'shipped',
  })
}

async function handleComplete(
  orderId: string,
): Promise<void> {
  const confirmed =
    window.confirm(
      '確認將此訂單標記為完成？',
    )

  if (!confirmed) {
    return
  }

  await store.completeOrder(
    orderId,
  )
}

async function handleCancel(
  orderId: string,
): Promise<void> {
  const confirmed =
    window.confirm(
      '確認取消此訂單？',
    )

  if (!confirmed) {
    return
  }

  await store.cancelOrder(
    orderId,
  )
}

async function handlePreviousPage():
  Promise<void> {
  if (
    !store.hasPreviousPage
  ) {
    return
  }

  await store.setPage(
    store.pagination.page - 1,
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
    store.pagination.page + 1,
  )
}

function formatMoney(
  amount: number,
  currency: string,
): string {
  const normalizedAmount =
    Number.isFinite(amount)
      ? amount
      : 0

  const normalizedCurrency =
    currency || 'TWD'

  try {
    return new Intl.NumberFormat(
      'zh-TW',
      {
        style:
          'currency',

        currency:
          normalizedCurrency,

        maximumFractionDigits:
          0,
      },
    ).format(
      normalizedAmount,
    )
  } catch {
    return `${normalizedCurrency} ${normalizedAmount.toLocaleString(
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

.order-page{
  display:flex;
  flex-direction:column;
  gap:24px;
}

.page-header{
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  gap:20px;
}

.page-eyebrow{
  color:#3157d6;
  font-size:13px;
  font-weight:800;
  letter-spacing:1px;
}

.page-header h1{
  margin:8px 0;
  font-size:34px;
  font-weight:800;
  color:#0f172a;
}

.page-description{
  color:#64748b;
}

.table-card{
  background:#ffffff;
  border:1px solid #e5e7eb;
  border-radius:18px;
  overflow:hidden;
}

.table-wrapper{
  overflow-x:auto;
}

.order-table{
  width:100%;
  border-collapse:collapse;
}

.order-table th{
  padding:16px;
  background:#f8fafc;
  color:#64748b;
  font-size:13px;
  text-align:left;
  white-space:nowrap;
  border-bottom:1px solid #e5e7eb;
}

.order-table td{
  padding:16px;
  border-bottom:1px solid #eef2f7;
  white-space:nowrap;
}

.order-table tbody tr:hover{
  background:#f8fbff;
}

.order-number{
  color:#3157d6;
  font-weight:700;
}

.member-info{
  display:flex;
  flex-direction:column;
  gap:4px;
}

.member-info span{
  color:#94a3b8;
  font-size:12px;
}

.amount{
  font-weight:700;
}

.state-panel{
  padding:60px 24px;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  gap:14px;
  color:#64748b;
}

.loading-spinner{
  width:42px;
  height:42px;
  border:4px solid #e5e7eb;
  border-top-color:#3157d6;
  border-radius:50%;
  animation:spin .8s linear infinite;
}

.state-icon{
  width:64px;
  height:64px;
  border-radius:50%;
  background:#eef4ff;
  display:flex;
  justify-content:center;
  align-items:center;
  font-weight:800;
  color:#3157d6;
}

.error-panel{
  margin:20px;
  padding:18px;
  border-radius:12px;
  background:#fee2e2;
  color:#b91c1c;
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:20px;
}

.error-panel button{
  border:none;
  background:#b91c1c;
  color:white;
  padding:10px 18px;
  border-radius:8px;
  cursor:pointer;
}

.pagination{
  display:flex;
  justify-content:space-between;
  align-items:center;
  padding:20px;
  border-top:1px solid #e5e7eb;
}

.pagination__summary{
  color:#475569;
}

.pagination__controls{
  display:flex;
  align-items:center;
  gap:16px;
}

.pagination button{
  padding:10px 16px;
  border-radius:8px;
  border:1px solid #d1d5db;
  background:white;
  cursor:pointer;
}

.pagination button:hover:not(:disabled){
  background:#3157d6;
  color:white;
}

.pagination button:disabled{
  opacity:.5;
  cursor:not-allowed;
}

@keyframes spin{
  from{
    transform:rotate(0deg);
  }
  to{
    transform:rotate(360deg);
  }
}

@media (max-width:900px){

  .pagination{
    flex-direction:column;
    gap:16px;
  }

}

@media (max-width:768px){

  .page-header{
    flex-direction:column;
  }

  .order-table th,
  .order-table td{
    padding:12px;
  }

}

</style>