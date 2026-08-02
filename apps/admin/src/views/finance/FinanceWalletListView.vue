<template>
  <AdminLayout>
    <div class="wallet-page">
      <section class="page-header">
        <div>
          <p class="page-eyebrow">
            FINANCE WALLET ERP
          </p>

          <h1>
            錢包管理
          </h1>

          <p class="page-description">
            管理會員、商家、經銷商與平台錢包餘額及狀態。
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
          <span>
            錢包總數
          </span>

          <strong>
            {{ store.statistics.totalWallets }}
          </strong>
        </article>

        <article class="stat-card">
          <span>
            啟用錢包
          </span>

          <strong>
            {{ store.statistics.activeWallets }}
          </strong>
        </article>

        <article class="stat-card">
          <span>
            凍結錢包
          </span>

          <strong>
            {{ store.statistics.frozenWallets }}
          </strong>
        </article>

        <article class="stat-card">
          <span>
            停用錢包
          </span>

          <strong>
            {{ store.statistics.disabledWallets }}
          </strong>
        </article>

        <article class="stat-card">
          <span>
            錢包總餘額
          </span>

          <strong>
            {{
              formatMoney(
                store.statistics.totalBalance,
              )
            }}
          </strong>
        </article>

        <article class="stat-card">
          <span>
            凍結金額
          </span>

          <strong>
            {{
              formatMoney(
                store.statistics.totalFrozenBalance,
              )
            }}
          </strong>
        </article>

        <article class="stat-card">
          <span>
            可用餘額
          </span>

          <strong>
            {{
              formatMoney(
                store.statistics.totalAvailableBalance,
              )
            }}
          </strong>
        </article>
      </section>

      <section class="filter-card">
        <input
          v-model="keyword"
          type="search"
          placeholder="搜尋錢包編號、姓名或電話"
          :disabled="store.isLoading"
          @keyup.enter="handleSearch"
        >

        <select
          v-model="ownerType"
          :disabled="store.isLoading"
          @change="handleOwnerTypeChange"
        >
          <option value="">
            全部擁有者
          </option>

          <option value="member">
            會員
          </option>

          <option value="merchant">
            商家
          </option>

          <option value="dealer">
            經銷商
          </option>

          <option value="platform">
            平台
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

          <option value="active">
            啟用
          </option>

          <option value="frozen">
            凍結
          </option>

          <option value="disabled">
            停用
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
          正在載入錢包資料...
        </div>

        <div
          v-else-if="
            !store.error &&
            store.wallets.length === 0
          "
          class="state-panel"
        >
          暫無錢包資料
        </div>

        <div
          v-else-if="!store.error"
          class="table-wrapper"
        >
          <table>
            <thead>
              <tr>
                <th>
                  錢包編號
                </th>

                <th>
                  擁有者
                </th>

                <th>
                  類型
                </th>

                <th>
                  總餘額
                </th>

                <th>
                  凍結金額
                </th>

                <th>
                  可用餘額
                </th>

                <th>
                  狀態
                </th>

                <th>
                  更新時間
                </th>

                <th>
                  操作
                </th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="wallet in store.wallets"
                :key="wallet.id"
              >
                <td>
                  <strong class="wallet-number">
                    {{ wallet.walletNo }}
                  </strong>
                </td>

                <td>
                  <div class="owner-info">
                    <strong>
                      {{
                        wallet.ownerName ||
                        '未命名'
                      }}
                    </strong>

                    <span>
                      {{
                        wallet.ownerPhone ||
                        '-'
                      }}
                    </span>
                  </div>
                </td>

                <td>
                  {{
                    ownerTypeText(
                      wallet.ownerType,
                    )
                  }}
                </td>

                <td>
                  {{
                    formatMoney(
                      wallet.balance,
                      wallet.currency,
                    )
                  }}
                </td>

                <td>
                  {{
                    formatMoney(
                      wallet.frozenBalance,
                      wallet.currency,
                    )
                  }}
                </td>

                <td>
                  <strong class="available-balance">
                    {{
                      formatMoney(
                        wallet.availableBalance,
                        wallet.currency,
                      )
                    }}
                  </strong>
                </td>

                <td>
                  <span
                    class="status-badge"
                    :class="
                      `status-badge--${wallet.status}`
                    "
                  >
                    {{
                      statusText(
                        wallet.status,
                      )
                    }}
                  </span>
                </td>

                <td>
                  {{
                    formatDate(
                      wallet.updatedAt,
                    )
                  }}
                </td>

                <td>
                  <button
                    class="view-button"
                    type="button"
                    @click="
                      handleView(
                        wallet.id,
                      )
                    "
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
  useFinanceWalletStore,
} from '../../stores/finance-wallet'

import type {
  FinanceWalletOwnerType,
  FinanceWalletStatus,
} from '../../types/finance-wallet'

const router =
  useRouter()

const store =
  useFinanceWalletStore()

const keyword =
  ref('')

const ownerType =
  ref<
    FinanceWalletOwnerType | ''
  >('')

const status =
  ref<
    FinanceWalletStatus | ''
  >('')

const pageSize =
  ref(20)

onMounted(async () => {
  keyword.value =
    store.filters.keyword ||
    ''

  ownerType.value =
    store.filters.ownerType ||
    ''

  status.value =
    store.filters.status ||
    ''

  pageSize.value =
    store.filters.pageSize

  await store.fetchWallets()
})

onBeforeUnmount(() => {
  store.clearError()
})

async function handleRefresh():
  Promise<void> {
  await store.fetchWallets()
}

async function handleSearch():
  Promise<void> {
  await store.searchWallets(
    keyword.value,
  )
}

async function handleOwnerTypeChange():
  Promise<void> {
  await store.setOwnerTypeFilter(
    ownerType.value,
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

  ownerType.value =
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

function handleView(
  walletId: string,
): void {
  router.push(
    `/finance/wallets/${walletId}`,
  )
}

function ownerTypeText(
  value:
    FinanceWalletOwnerType,
): string {
  const typeMap:
    Record<
      FinanceWalletOwnerType,
      string
    > = {
      member:
        '會員',

      merchant:
        '商家',

      dealer:
        '經銷商',

      platform:
        '平台',
    }

  return typeMap[value]
}

function statusText(
  value:
    FinanceWalletStatus,
): string {
  const statusMap:
    Record<
      FinanceWalletStatus,
      string
    > = {
      active:
        '啟用',

      frozen:
        '凍結',

      disabled:
        '停用',
    }

  return statusMap[value]
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

.wallet-page{

display:flex;

flex-direction:column;

gap:24px;

}



.page-header{

display:flex;

justify-content:space-between;

align-items:flex-start;

gap:24px;

}



.page-eyebrow{

margin:0;

font-size:13px;

font-weight:800;

color:#3157d6;

letter-spacing:.08em;

}



.page-header h1{

margin:8px 0;

font-size:34px;

font-weight:800;

color:#0f172a;

}



.page-description{

margin:0;

color:#64748b;

line-height:1.7;

}



.refresh-button{

height:42px;

padding:0 18px;

border:none;

border-radius:10px;

background:#3157d6;

color:#fff;

cursor:pointer;

}



.refresh-button:disabled{

opacity:.6;

cursor:not-allowed;

}



.stats-grid{

display:grid;

grid-template-columns:

repeat(4,minmax(0,1fr));

gap:18px;

}



.stat-card{

padding:22px;

background:#fff;

border:1px solid #e5e7eb;

border-radius:18px;

}



.stat-card span{

display:block;

font-size:13px;

color:#64748b;

margin-bottom:10px;

}



.stat-card strong{

font-size:28px;

font-weight:700;

color:#0f172a;

}



.filter-card{

display:flex;

flex-wrap:wrap;

gap:12px;

padding:20px;

background:#fff;

border:1px solid #e5e7eb;

border-radius:18px;

}



.filter-card input,

.filter-card select{

height:42px;

padding:0 14px;

border:1px solid #dbe2ea;

border-radius:10px;

background:white;

}



.filter-card input{

min-width:260px;

flex:1;

}



.filter-card button{

height:42px;

padding:0 18px;

border:none;

border-radius:10px;

cursor:pointer;

}



.primary-button{

background:#3157d6;

color:#fff;

}



.table-card{

background:#fff;

border:1px solid #e5e7eb;

border-radius:18px;

overflow:hidden;

}



.table-wrapper{

overflow-x:auto;

}



table{

width:100%;

border-collapse:collapse;

}



thead{

background:#f8fafc;

}



th{

padding:16px;

font-size:13px;

font-weight:700;

color:#64748b;

text-align:left;

white-space:nowrap;

}



td{

padding:16px;

border-top:1px solid #eef2f7;

vertical-align:middle;

}



.wallet-number{

font-weight:700;

color:#3157d6;

}



.owner-info{

display:flex;

flex-direction:column;

gap:4px;

}



.owner-info span{

font-size:12px;

color:#94a3b8;

}



.available-balance{

color:#16a34a;

}



.status-badge{

display:inline-flex;

align-items:center;

justify-content:center;

padding:5px 12px;

border-radius:999px;

font-size:12px;

font-weight:700;

}



.status-badge--active{

background:#dcfce7;

color:#15803d;

}



.status-badge--frozen{

background:#fef3c7;

color:#b45309;

}



.status-badge--disabled{

background:#fee2e2;

color:#b91c1c;

}



.view-button{

height:36px;

padding:0 14px;

border:none;

border-radius:8px;

background:#3157d6;

color:#fff;

cursor:pointer;

}



.error-panel{

padding:18px;

background:#fee2e2;

color:#b91c1c;

}



.state-panel{

padding:40px;

text-align:center;

color:#64748b;

}



.pagination{

display:flex;

justify-content:space-between;

align-items:center;

padding:20px;

border-top:1px solid #eef2f7;

}



.pagination div{

display:flex;

align-items:center;

gap:16px;

}



.pagination button{

height:36px;

padding:0 14px;

border:1px solid #dbe2ea;

border-radius:8px;

background:#fff;

cursor:pointer;

}



.pagination button:disabled{

opacity:.45;

cursor:not-allowed;

}



@media(max-width:1200px){

.stats-grid{

grid-template-columns:

repeat(2,1fr);

}

}



@media(max-width:768px){

.page-header{

flex-direction:column;

}



.stats-grid{

grid-template-columns:1fr;

}



.filter-card{

flex-direction:column;

}



.filter-card input,

.filter-card select,

.filter-card button{

width:100%;

}

}

</style>