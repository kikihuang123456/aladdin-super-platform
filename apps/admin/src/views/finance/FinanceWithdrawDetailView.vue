<template>
  <AdminLayout>
    <div class="withdraw-detail">

      <section class="page-header">
        <div>
          <p class="page-eyebrow">
            FINANCE WITHDRAW ERP
          </p>

          <h1>
            提款申請詳情
          </h1>

          <p class="page-description">
            檢視提款申請內容並完成審核流程。
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
        正在載入提款資料...
      </div>

      <div
        v-else-if="store.error"
        class="error-panel"
      >
        {{ store.error }}
      </div>

      <template
        v-else-if="request"
      >

        <section class="summary-grid">

          <article class="summary-card">
            <span>
              提款編號
            </span>

            <strong>
              {{ request.withdrawNo }}
            </strong>
          </article>

          <article class="summary-card">
            <span>
              申請人
            </span>

            <strong>
              {{ request.ownerName }}
            </strong>

            <small>
              {{ request.ownerPhone }}
            </small>
          </article>

          <article class="summary-card">
            <span>
              提款金額
            </span>

            <strong>
              {{
                formatMoney(
                  request.amount,
                  request.currency,
                )
              }}
            </strong>
          </article>

          <article class="summary-card">
            <span>
              手續費
            </span>

            <strong class="orange">
              {{
                formatMoney(
                  request.feeAmount,
                  request.currency,
                )
              }}
            </strong>
          </article>

          <article class="summary-card">
            <span>
              實付金額
            </span>

            <strong class="green">
              {{
                formatMoney(
                  request.actualAmount,
                  request.currency,
                )
              }}
            </strong>
          </article>

          <article class="summary-card">
            <span>
              收款方式
            </span>

            <strong>
              {{
                accountTypeText(
                  request.accountType,
                )
              }}
            </strong>
          </article>

          <article class="summary-card">
            <span>
              收款帳戶
            </span>

            <strong>
              {{
                request.accountNo ||
                '-'
              }}
            </strong>

            <small>
              {{
                request.accountName ||
                '-'
              }}
            </small>
          </article>

          <article class="summary-card">
            <span>
              狀態
            </span>

            <strong
              :class="[
                'status',
                request.status,
              ]"
            >
              {{
                statusText(
                  request.status,
                )
              }}
            </strong>
          </article>

        </section>

        <section class="review-card">

          <h2>
            審核操作
          </h2>

          <div class="button-group">

            <button
              class="approve"
              :disabled="store.isMutating"
              @click="
                handleReview(
                  'approved',
                )
              "
            >
              通過
            </button>

            <button
              class="processing"
              :disabled="store.isMutating"
              @click="
                handleReview(
                  'processing',
                )
              "
            >
              處理中
            </button>

            <button
              class="complete"
              :disabled="store.isMutating"
              @click="
                handleReview(
                  'completed',
                )
              "
            >
              完成
            </button>

            <button
              class="reject"
              :disabled="store.isMutating"
              @click="
                handleReview(
                  'rejected',
                )
              "
            >
              拒絕
            </button>

            <button
              class="cancel"
              :disabled="store.isMutating"
              @click="
                handleReview(
                  'cancelled',
                )
              "
            >
              取消
            </button>

          </div>

          <div
            v-if="
              store.mutationMessage
            "
            class="success-panel"
          >
            {{
              store.mutationMessage
            }}
          </div>

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
  useFinanceWithdrawStore,
} from '../../stores/finance-withdraw'

import type {
  FinanceWithdrawAccountType,
  FinanceWithdrawReviewInput,
  FinanceWithdrawStatus,
} from '../../types/finance-withdraw'

const route =
  useRoute()

const router =
  useRouter()

const store =
  useFinanceWithdrawStore()

const withdrawId =
  computed(() =>
    String(
      route.params.id ?? '',
    ),
  )

const request =
  computed(() =>
    store.currentRequest,
  )

onMounted(async () => {
  await loadRequest()
})

onBeforeUnmount(() => {
  store.clearCurrentRequest()
  store.clearError()
  store.clearMutationMessage()
})

async function loadRequest():
  Promise<void> {
  if (
    !withdrawId.value
  ) {
    return
  }

  await store.fetchRequestById(
    withdrawId.value,
  )
}

function handleBack():
  void {
  router.push(
    '/finance/withdraws',
  )
}

async function handleReview(
  status:
    FinanceWithdrawReviewInput['status'],
): Promise<void> {
  if (
    !request.value
  ) {
    return
  }

  await store.reviewRequest({
    withdrawId:
      request.value.id,

    status,
  })
}

function accountTypeText(
  value:
    FinanceWithdrawAccountType,
): string {
  const map:
    Record<
      FinanceWithdrawAccountType,
      string
    > = {
      bank:
        '銀行帳戶',

      wechat:
        '微信',

      alipay:
        '支付寶',

      linepay:
        'LINE Pay',

      other:
        '其他',
    }

  return map[value]
}

function statusText(
  value:
    FinanceWithdrawStatus,
): string {
  const map:
    Record<
      FinanceWithdrawStatus,
      string
    > = {
      pending:
        '待審核',

      approved:
        '已通過',

      rejected:
        '已拒絕',

      processing:
        '處理中',

      completed:
        '已完成',

      cancelled:
        '已取消',
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
</script>
<style scoped>
.withdraw-detail {
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

.status.pending {
  background: #fef3c7;
  color: #b45309;
}

.status.approved {
  background: #dbeafe;
  color: #1d4ed8;
}

.status.processing {
  background: #ede9fe;
  color: #6d28d9;
}

.status.completed {
  background: #dcfce7;
  color: #15803d;
}

.status.rejected,
.status.cancelled {
  background: #fee2e2;
  color: #b91c1c;
}

.review-card {
  padding: 24px;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  background: #ffffff;
}

.review-card h2 {
  margin: 0 0 20px;
  color: #0f172a;
  font-size: 22px;
}

.button-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.button-group button {
  min-height: 40px;
  padding: 0 18px;
  border: 0;
  border-radius: 10px;
  color: #ffffff;
  cursor: pointer;
  font: inherit;
  font-weight: 800;
}

.button-group button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.approve {
  background: #2563eb;
}

.processing {
  background: #7c3aed;
}

.complete {
  background: #16a34a;
}

.reject,
.cancel {
  background: #dc2626;
}

.success-panel {
  margin-top: 18px;
  padding: 15px 16px;
  border: 1px solid #bbf7d0;
  border-radius: 12px;
  background: #f0fdf4;
  color: #15803d;
  font-weight: 700;
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

  .button-group {
    flex-direction: column;
  }

  .button-group button {
    width: 100%;
  }
}
</style>