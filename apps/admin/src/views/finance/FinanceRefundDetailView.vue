<template>
  <AdminLayout>
    <div class="refund-detail">
      <section class="page-header">
        <div>
          <p class="page-eyebrow">
            FINANCE REFUND ERP
          </p>

          <h1>
            退款申請詳情
          </h1>

          <p class="page-description">
            檢視退款申請、訂單關聯、退款方式與審核流程。
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
        正在載入退款資料...
      </div>

      <div
        v-else-if="store.error"
        class="error-panel"
      >
        {{ store.error }}
      </div>

      <template v-else-if="request">
        <section class="summary-grid">
          <article class="summary-card">
            <span>
              退款編號
            </span>

            <strong>
              {{ request.refundNo }}
            </strong>
          </article>

          <article class="summary-card">
            <span>
              訂單編號
            </span>

            <strong>
              {{ request.orderNo }}
            </strong>
          </article>

          <article class="summary-card">
            <span>
              申請人
            </span>

            <strong>
              {{
                request.applicantName ||
                '未命名'
              }}
            </strong>

            <small>
              {{
                request.applicantPhone ||
                '-'
              }}
            </small>
          </article>

          <article class="summary-card">
            <span>
              退款原因
            </span>

            <strong>
              {{
                reasonTypeText(
                  request.reasonType,
                )
              }}
            </strong>
          </article>

          <article class="summary-card">
            <span>
              申請金額
            </span>

            <strong>
              {{
                formatMoney(
                  request.requestedAmount,
                  request.currency,
                )
              }}
            </strong>
          </article>

          <article class="summary-card">
            <span>
              核准金額
            </span>

            <strong>
              {{
                formatMoney(
                  request.approvedAmount,
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
              實際退款
            </span>

            <strong class="green">
              {{
                formatMoney(
                  request.actualRefundAmount,
                  request.currency,
                )
              }}
            </strong>
          </article>

          <article class="summary-card">
            <span>
              退款方式
            </span>

            <strong>
              {{
                refundMethodText(
                  request.refundMethod,
                )
              }}
            </strong>
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

        <section class="detail-card">
          <h2>
            退款申請內容
          </h2>

          <div class="detail-grid">
            <div>
              <span>
                訂單 ID
              </span>

              <strong>
                {{ request.orderId }}
              </strong>
            </div>

            <div>
              <span>
                申請人類型
              </span>

              <strong>
                {{
                  applicantTypeText(
                    request.applicantType,
                  )
                }}
              </strong>
            </div>

            <div>
              <span>
                退款帳戶名稱
              </span>

              <strong>
                {{
                  request.refundAccountName ||
                  '-'
                }}
              </strong>
            </div>

            <div>
              <span>
                退款帳戶
              </span>

              <strong>
                {{
                  request.refundAccountNo ||
                  '-'
                }}
              </strong>
            </div>

            <div class="full">
              <span>
                原因說明
              </span>

              <strong>
                {{
                  request.reasonDescription ||
                  '-'
                }}
              </strong>
            </div>

            <div class="full">
              <span>
                審核備註
              </span>

              <strong>
                {{
                  request.reviewRemark ||
                  '-'
                }}
              </strong>
            </div>
          </div>
        </section>

        <section class="review-card">
          <h2>
            審核操作
          </h2>

          <div class="form-grid">
            <label>
              <span>
                核准金額
              </span>

              <input
                v-model.number="approvedAmount"
                type="number"
                min="0"
                step="1"
              >
            </label>

            <label>
              <span>
                手續費
              </span>

              <input
                v-model.number="feeAmount"
                type="number"
                min="0"
                step="1"
              >
            </label>

            <label>
              <span>
                退款方式
              </span>

              <select v-model="refundMethod">
                <option value="original_payment">
                  原支付方式
                </option>

                <option value="wallet">
                  錢包
                </option>

                <option value="bank_transfer">
                  銀行轉帳
                </option>

                <option value="wechat">
                  微信
                </option>

                <option value="alipay">
                  支付寶
                </option>

                <option value="linepay">
                  LINE Pay
                </option>

                <option value="other">
                  其他
                </option>
              </select>
            </label>

            <label>
              <span>
                退款帳戶名稱
              </span>

              <input
                v-model="refundAccountName"
                type="text"
              >
            </label>

            <label>
              <span>
                退款帳戶
              </span>

              <input
                v-model="refundAccountNo"
                type="text"
              >
            </label>

            <label class="full">
              <span>
                審核備註
              </span>

              <textarea
                v-model="reviewRemark"
                rows="4"
              />
            </label>
          </div>

          <div class="button-group">
            <button
              class="approve"
              type="button"
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
              type="button"
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
              type="button"
              :disabled="store.isMutating"
              @click="
                handleReview(
                  'completed',
                )
              "
            >
              完成退款
            </button>

            <button
              class="reject"
              type="button"
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
              type="button"
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
            v-if="store.mutationMessage"
            class="success-panel"
          >
            {{ store.mutationMessage }}
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
  ref,
} from 'vue'

import {
  useRoute,
  useRouter,
} from 'vue-router'

import AdminLayout
  from '../../layouts/AdminLayout.vue'

import {
  useFinanceRefundStore,
} from '../../stores/finance-refund'

import type {
  FinanceRefundApplicantType,
  FinanceRefundMethod,
  FinanceRefundReasonType,
  FinanceRefundReviewInput,
  FinanceRefundStatus,
} from '../../types/finance-refund'

const route =
  useRoute()

const router =
  useRouter()

const store =
  useFinanceRefundStore()

const approvedAmount =
  ref(0)

const feeAmount =
  ref(0)

const refundMethod =
  ref<FinanceRefundMethod>(
    'original_payment',
  )

const refundAccountName =
  ref('')

const refundAccountNo =
  ref('')

const reviewRemark =
  ref('')

const refundId =
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
  if (!refundId.value) {
    return
  }

  const result =
    await store.fetchRequestById(
      refundId.value,
    )

  if (!result) {
    return
  }

  approvedAmount.value =
    result.approvedAmount ||
    result.requestedAmount

  feeAmount.value =
    result.feeAmount

  refundMethod.value =
    result.refundMethod

  refundAccountName.value =
    result.refundAccountName ||
    ''

  refundAccountNo.value =
    result.refundAccountNo ||
    ''

  reviewRemark.value =
    result.reviewRemark ||
    ''
}

function handleBack():
  void {
  router.push(
    '/finance/refunds',
  )
}

async function handleReview(
  status:
    FinanceRefundReviewInput['status'],
): Promise<void> {
  if (!request.value) {
    return
  }

  const normalizedApprovedAmount =
    Number.isFinite(
      approvedAmount.value,
    )
      ? Math.max(
          approvedAmount.value,
          0,
        )
      : 0

  const normalizedFeeAmount =
    Number.isFinite(
      feeAmount.value,
    )
      ? Math.max(
          feeAmount.value,
          0,
        )
      : 0

  await store.reviewRequest({
    refundId:
      request.value.id,

    status,

    approvedAmount:
      normalizedApprovedAmount,

    feeAmount:
      normalizedFeeAmount,

    refundMethod:
      refundMethod.value,

    refundAccountName:
      refundAccountName.value.trim() ||
      null,

    refundAccountNo:
      refundAccountNo.value.trim() ||
      null,

    reviewRemark:
      reviewRemark.value.trim() ||
      null,
  })
}

function applicantTypeText(
  value:
    FinanceRefundApplicantType,
): string {
  const map:
    Record<
      FinanceRefundApplicantType,
      string
    > = {
      member:
        '會員',

      merchant:
        '商家',

      admin:
        '管理員',
    }

  return map[value]
}

function reasonTypeText(
  value:
    FinanceRefundReasonType,
): string {
  const map:
    Record<
      FinanceRefundReasonType,
      string
    > = {
      cancel_order:
        '取消訂單',

      product_issue:
        '商品問題',

      shipping_issue:
        '物流問題',

      duplicate_payment:
        '重複付款',

      payment_error:
        '付款異常',

      service_issue:
        '服務問題',

      other:
        '其他',
    }

  return map[value]
}

function refundMethodText(
  value:
    FinanceRefundMethod,
): string {
  const map:
    Record<
      FinanceRefundMethod,
      string
    > = {
      original_payment:
        '原支付方式',

      wallet:
        '錢包',

      bank_transfer:
        '銀行轉帳',

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
    FinanceRefundStatus,
): string {
  const map:
    Record<
      FinanceRefundStatus,
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
.refund-detail {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
}

.page-eyebrow {
  margin: 0;
  color: #3157d6;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: .08em;
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
  background: #fff;
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
  background: #fff;
  border: 1px solid #e5e7eb;
  color: #64748b;
}

.error-panel {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0,1fr));
  gap: 18px;
}

.summary-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 22px;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  background: #fff;
}

.summary-card span {
  color: #64748b;
  font-size: 13px;
}

.summary-card strong {
  color: #0f172a;
  font-size: 22px;
  font-weight: 800;
  overflow-wrap: anywhere;
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

.detail-card,
.review-card {
  padding: 24px;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  background: #fff;
}

.detail-card h2,
.review-card h2 {
  margin: 0 0 20px;
  color: #0f172a;
  font-size: 22px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0,1fr));
  gap: 18px;
}

.detail-grid > div {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-grid span {
  color: #64748b;
  font-size: 13px;
}

.detail-grid strong {
  color: #0f172a;
  font-size: 15px;
  font-weight: 700;
  overflow-wrap: anywhere;
}

.detail-grid .full,
.form-grid .full {
  grid-column: 1 / -1;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0,1fr));
  gap: 18px;
}

.form-grid label {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-grid span {
  color: #64748b;
  font-size: 13px;
}

.form-grid input,
.form-grid select,
.form-grid textarea {
  padding: 10px 12px;
  border: 1px solid #dbe2ea;
  border-radius: 10px;
  font: inherit;
}

.form-grid textarea {
  resize: vertical;
}

.button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 24px;
}

.button-group button {
  min-height: 42px;
  padding: 0 18px;
  border: 0;
  border-radius: 10px;
  color: #fff;
  cursor: pointer;
  font: inherit;
  font-weight: 800;
}

.button-group button:disabled {
  opacity: .55;
  cursor: not-allowed;
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

@media (max-width:1200px) {
  .summary-grid {
    grid-template-columns: repeat(2,1fr);
  }
}

@media (max-width:768px) {
  .page-header {
    flex-direction: column;
  }

  .back-button {
    width: 100%;
  }

  .summary-grid,
  .detail-grid,
  .form-grid {
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