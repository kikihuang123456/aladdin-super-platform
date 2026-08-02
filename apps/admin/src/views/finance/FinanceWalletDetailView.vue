<template>
  <AdminLayout>
    <div class="wallet-detail">

      <section class="page-header">
        <div>
          <p class="page-eyebrow">
            FINANCE WALLET ERP
          </p>

          <h1>
            錢包詳情
          </h1>

          <p class="page-description">
            查看錢包資訊、餘額及交易流水。
          </p>
        </div>

        <button
          class="back-button"
          type="button"
          @click="handleBack"
        >
          返回列表
        </button>
      </section>

      <div
        v-if="store.isLoading"
        class="state-panel"
      >
        正在載入...
      </div>

      <div
        v-else-if="store.error"
        class="error-panel"
      >
        {{ store.error }}
      </div>

      <template
        v-else-if="wallet"
      >

        <section class="summary-grid">

          <article class="summary-card">
            <span>錢包編號</span>

            <strong>
              {{ wallet.walletNo }}
            </strong>
          </article>

          <article class="summary-card">
            <span>擁有者</span>

            <strong>
              {{ wallet.ownerName }}
            </strong>

            <small>
              {{ wallet.ownerPhone }}
            </small>
          </article>

          <article class="summary-card">
            <span>目前餘額</span>

            <strong>
              {{
                formatMoney(
                  wallet.balance,
                  wallet.currency,
                )
              }}
            </strong>
          </article>

          <article class="summary-card">
            <span>可用餘額</span>

            <strong class="green">
              {{
                formatMoney(
                  wallet.availableBalance,
                  wallet.currency,
                )
              }}
            </strong>
          </article>

          <article class="summary-card">
            <span>凍結金額</span>

            <strong class="orange">
              {{
                formatMoney(
                  wallet.frozenBalance,
                  wallet.currency,
                )
              }}
            </strong>
          </article>

          <article class="summary-card">
            <span>累計收入</span>

            <strong>
              {{
                formatMoney(
                  wallet.totalIncome,
                  wallet.currency,
                )
              }}
            </strong>
          </article>

          <article class="summary-card">
            <span>累計支出</span>

            <strong>
              {{
                formatMoney(
                  wallet.totalExpense,
                  wallet.currency,
                )
              }}
            </strong>
          </article>

          <article class="summary-card">
            <span>狀態</span>

            <strong
              :class="[
                'status',
                wallet.status,
              ]"
            >
              {{
                statusText(
                  wallet.status,
                )
              }}
            </strong>
          </article>

        </section>

        <section class="table-card">

          <header>
            <h2>
              錢包交易流水
            </h2>
          </header>

          <table>

            <thead>

              <tr>

                <th>
                  交易編號
                </th>

                <th>
                  類型
                </th>

                <th>
                  金額
                </th>

                <th>
                  餘額
                </th>

                <th>
                  狀態
                </th>

                <th>
                  建立時間
                </th>

              </tr>

            </thead>

            <tbody>

              <tr
                v-for="
                  item
                  in transactions
                "
                :key="item.id"
              >

                <td>
                  {{ item.transactionNo }}
                </td>

                <td>
  <td>
  {{
    transactionTypeText(
      item.type,
    )
  }}
</td>

<td>
  {{
    formatMoney(
      item.amount,
      item.currency,
    )
  }}
</td>

<td>
  {{
    formatMoney(
      item.balanceAfter,
      item.currency,
    )
  }}
</td>
                </td>

                <td>
                  {{ item.status }}
                </td>

                <td>
                  {{
                    formatDate(
                      item.createdAt,
                    )
                  }}
                </td>

              </tr>

            </tbody>

          </table>

        </section>

      </template>

    </div>
  </AdminLayout>
</template>
<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
} from 'vue'

import {
  useRoute,
  useRouter,
} from 'vue-router'

import AdminLayout
  from '../../layouts/AdminLayout.vue'

import {
  useFinanceWalletStore,
} from '../../stores/finance-wallet'

import type {
  FinanceWalletStatus,
  FinanceWalletTransactionType,
} from '../../types/finance-wallet'

const route =
  useRoute()

const router =
  useRouter()

const store =
  useFinanceWalletStore()

const walletId =
  computed(() =>
    String(
      route.params.id ?? '',
    ),
  )

const wallet =
  computed(() =>
    store.currentWallet,
  )

const transactions =
  computed(() =>
    store.currentTransactions,
  )

onMounted(async () => {
  await loadWallet()
})

onBeforeUnmount(() => {
  store.clearCurrentWallet()
  store.clearError()
})

async function loadWallet():
  Promise<void> {
  if (
    !walletId.value
  ) {
    return
  }

  await store.fetchWalletById(
    walletId.value,
  )
}

function handleBack():
  void {
  router.push(
    '/finance/wallets',
  )
}

function statusText(
  value:
    FinanceWalletStatus,
): string {
  const map:
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

  return map[value]
}

function transactionTypeText(
  value:
    FinanceWalletTransactionType,
): string {
  const map:
    Record<
      FinanceWalletTransactionType,
      string
    > = {
      deposit:
        '儲值',

      withdraw:
        '提款',

      income:
        '收入',

      expense:
        '支出',

      refund:
        '退款',

      settlement:
        '結算',

      commission:
        '分潤',

      adjustment:
        '人工調整',
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
.wallet-detail {
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

.back-button {
  min-height: 42px;
  padding: 0 18px;
  border: 1px solid #dbe2ea;
  border-radius: 10px;
  background: #ffffff;
  color: #334155;
  cursor: pointer;
  font: inherit;
  font-weight: 700;
}

.back-button:hover {
  border-color: #3157d6;
  color: #3157d6;
}

.state-panel,
.error-panel {
  padding: 40px 24px;
  border-radius: 18px;
  text-align: center;
}

.state-panel {
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: #64748b;
}

.error-panel {
  border: 1px solid #fecaca;
  background: #fef2f2;
  color: #b91c1c;
}

.summary-grid {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
  gap: 18px;
}

.summary-card {
  display: flex;
  min-width: 0;
  padding: 22px;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  flex-direction: column;
  gap: 10px;
  background: #ffffff;
}

.summary-card span {
  color: #64748b;
  font-size: 13px;
}

.summary-card strong {
  overflow-wrap: anywhere;
  color: #0f172a;
  font-size: 22px;
  font-weight: 800;
}

.summary-card small {
  color: #94a3b8;
  font-size: 12px;
}

.summary-card .green {
  color: #15803d;
}

.summary-card .orange {
  color: #b45309;
}

.status {
  display: inline-flex;
  width: fit-content;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 13px;
}

.status.active {
  background: #dcfce7;
  color: #15803d;
}

.status.frozen {
  background: #fef3c7;
  color: #b45309;
}

.status.disabled {
  background: #fee2e2;
  color: #b91c1c;
}

.table-card {
  overflow: hidden;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  background: #ffffff;
}

.table-card header {
  padding: 22px 24px;
  border-bottom: 1px solid #eef2f7;
}

.table-card h2 {
  margin: 0;
  color: #0f172a;
  font-size: 22px;
}

.table-card {
  overflow-x: auto;
}

table {
  width: 100%;
  min-width: 900px;
  border-collapse: collapse;
}

thead {
  background: #f8fafc;
}

th {
  padding: 16px;
  color: #64748b;
  font-size: 13px;
  font-weight: 700;
  text-align: left;
  white-space: nowrap;
}

td {
  padding: 16px;
  border-top: 1px solid #eef2f7;
  color: #334155;
  vertical-align: middle;
  white-space: nowrap;
}

tbody tr:hover {
  background: #f8fbff;
}

@media (max-width: 1200px) {
  .summary-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
  }

  .back-button {
    width: 100%;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>