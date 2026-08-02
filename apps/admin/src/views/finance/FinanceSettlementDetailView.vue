<template>
  <AdminLayout>
    <div class="settlement-detail">
      <section class="page-header">
        <div>
          <p class="page-eyebrow">
            FINANCE SETTLEMENT ERP
          </p>

          <h1>
            結算申請詳情
          </h1>

          <p class="page-description">
            檢視結算期間、平台服務費、調整金額與審核流程。
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
        正在載入結算資料...
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
              結算編號
            </span>

            <strong>
              {{ request.settlementNo }}
            </strong>
          </article>

          <article class="summary-card">
            <span>
              結算對象
            </span>

            <strong>
              {{ request.targetName }}
            </strong>

            <small>
              {{
                targetTypeText(
                  request.targetType,
                )
              }}
            </small>
          </article>

          <article class="summary-card">
            <span>
              結算週期
            </span>

            <strong>
              {{
                settlementCycleText(
                  request.settlementCycle,
                )
              }}
            </strong>
          </article>

          <article class="summary-card">
            <span>
              訂單數
            </span>

            <strong>
              {{ request.orderCount }}
            </strong>
          </article>

          <article class="summary-card">
            <span>
              交易總額
            </span>

            <strong>
              {{
                formatMoney(
                  request.grossAmount,
                  request.currency,
                )
              }}
            </strong>
          </article>

          <article class="summary-card">
            <span>
              平台服務費
            </span>

            <strong class="orange">
              {{
                formatMoney(
                  request.serviceFee,
                  request.currency,
                )
              }}
            </strong>
          </article>

          <article class="summary-card">
            <span>
              調整金額
            </span>

            <strong>
              {{
                formatMoney(
                  request.adjustmentAmount,
                  request.currency,
                )
              }}
            </strong>
          </article>

          <article class="summary-card">
            <span>
              實際結算
            </span>

            <strong class="green">
              {{
                formatMoney(
                  request.netAmount,
                  request.currency,
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
            結算期間與審核資料
          </h2>

          <div class="detail-grid">
            <div>
              <span>
                結算開始日
              </span>

              <strong>
                {{
                  formatDate(
                    request.periodStart,
                  )
                }}
              </strong>
            </div>

            <div>
              <span>
                結算結束日
              </span>

              <strong>
                {{
                  formatDate(
                    request.periodEnd,
                  )
                }}
              </strong>
            </div>

            <div>
              <span>
                對象 ID
              </span>

              <strong>
                {{ request.targetId }}
              </strong>
            </div>

            <div>
              <span>
                審核人
              </span>

              <strong>
                {{
                  request.reviewedBy ||
                  '-'
                }}
              </strong>
            </div>

            <div>
              <span>
                審核時間
              </span>

              <strong>
                {{
                  formatDate(
  request.reviewedAt ?? null,
)
                }}
              </strong>
            </div>

            <div>
              <span>
                完成時間
              </span>

              <strong>
                {{
                 formatDate(
  request.completedAt ?? null,
)
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
                平台服務費
              </span>

              <input
                v-model.number="serviceFee"
                type="number"
                min="0"
                step="1"
              >
            </label>

            <label>
              <span>
                調整金額
              </span>

              <input
                v-model.number="adjustmentAmount"
                type="number"
                step="1"
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
              class="reviewing"
              type="button"
              :disabled="store.isMutating"
              @click="
                handleReview(
                  'reviewing',
                )
              "
            >
              進入審核
            </button>

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
              付款中
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
              完成結算
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
  useFinanceSettlementStore,
} from '../../stores/finance-settlement'

import type {
  FinanceSettlementCycle,
  FinanceSettlementReviewInput,
  FinanceSettlementStatus,
  FinanceSettlementTargetType,
} from '../../types/finance-settlement'

const route =
  useRoute()

const router =
  useRouter()

const store =
  useFinanceSettlementStore()

const serviceFee =
  ref(0)

const adjustmentAmount =
  ref(0)

const reviewRemark =
  ref('')

const settlementId =
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
  if (!settlementId.value) {
    return
  }

  const result =
    await store.fetchRequestById(
      settlementId.value,
    )

  if (!result) {
    return
  }

  serviceFee.value =
    result.serviceFee

  adjustmentAmount.value =
    result.adjustmentAmount

  reviewRemark.value =
    result.reviewRemark ||
    ''
}

function handleBack():
  void {
  router.push(
    '/finance/settlements',
  )
}

async function handleReview(
  status:
    FinanceSettlementReviewInput['status'],
): Promise<void> {
  if (!request.value) {
    return
  }

  const normalizedServiceFee =
    Number.isFinite(
      serviceFee.value,
    )
      ? Math.max(
          serviceFee.value,
          0,
        )
      : 0

  const normalizedAdjustmentAmount =
    Number.isFinite(
      adjustmentAmount.value,
    )
      ? adjustmentAmount.value
      : 0

  await store.reviewRequest({
    settlementId:
      request.value.id,

    status,

    serviceFee:
      normalizedServiceFee,

    adjustmentAmount:
      normalizedAdjustmentAmount,

    reviewRemark:
      reviewRemark.value.trim() ||
      null,
  })
}

function targetTypeText(
  value:
    FinanceSettlementTargetType,
): string {
  const map:
    Record<
      FinanceSettlementTargetType,
      string
    > = {
      merchant:
        '商家',

      dealer:
        '經銷商',
    }

  return map[value]
}

function settlementCycleText(
  value:
    FinanceSettlementCycle,
): string {
  const map:
    Record<
      FinanceSettlementCycle,
      string
    > = {
      daily:
        '日結',

      weekly:
        '週結',

      monthly:
        '月結',
    }

  return map[value]
}

function statusText(
  value:
    FinanceSettlementStatus,
): string {
  const map:
    Record<
      FinanceSettlementStatus,
      string
    > = {
      pending:
        '待處理',

      reviewing:
        '審核中',

      approved:
        '已通過',

      processing:
        '付款中',

      completed:
        '已完成',

      rejected:
        '已拒絕',
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
  value: string | null | undefined,
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
.settlement-detail {
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
    repeat(3, minmax(0, 1fr));
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
  font-weight: 800;
}

.status.pending {
  background: #fef3c7;
  color: #b45309;
}

.status.reviewing {
  background: #e0e7ff;
  color: #4338ca;
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

.status.rejected {
  background: #fee2e2;
  color: #b91c1c;
}

.detail-card,
.review-card {
  padding: 24px;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  background: #ffffff;
}

.detail-card h2,
.review-card h2 {
  margin: 0 0 20px;
  color: #0f172a;
  font-size: 22px;
}

.detail-grid,
.form-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.detail-grid > div,
.form-grid label {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 8px;
}

.detail-grid > div {
  padding: 16px;
  border: 1px solid #eef2f7;
  border-radius: 14px;
  background: #f8fafc;
}

.detail-grid span,
.form-grid span {
  color: #64748b;
  font-size: 13px;
}

.detail-grid strong {
  overflow-wrap: anywhere;
  color: #0f172a;
  line-height: 1.6;
}

.detail-grid .full,
.form-grid .full {
  grid-column: 1 / -1;
}

.form-grid input,
.form-grid textarea {
  padding: 11px 12px;
  border: 1px solid #dbe2ea;
  border-radius: 10px;
  font: inherit;
}

.form-grid textarea {
  resize: vertical;
}

.button-group {
  display: flex;
  margin-top: 24px;
  gap: 12px;
  flex-wrap: wrap;
}

.button-group button {
  min-height: 42px;
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

.reviewing {
  background: #4f46e5;
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

.reject {
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

@media (max-width: 1000px) {
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

  .summary-grid,
  .detail-grid,
  .form-grid {
    grid-template-columns: 1fr;
  }

  .detail-grid .full,
  .form-grid .full {
    grid-column: auto;
  }

  .button-group {
    flex-direction: column;
  }

  .button-group button {
    width: 100%;
  }
}
</style>