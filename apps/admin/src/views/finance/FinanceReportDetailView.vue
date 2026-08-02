<template>
  <AdminLayout>
    <div class="report-detail">
      <section class="page-header">
        <div>
          <p class="page-eyebrow">
            FINANCE REPORT ERP
          </p>

          <h1>
            財務報表詳情
          </h1>

          <p class="page-description">
            檢視報表期間、收入支出、筆數統計與確認狀態。
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
        正在載入財務報表...
      </div>

      <div
        v-else-if="store.error"
        class="error-panel"
      >
        {{ store.error }}
      </div>

      <template v-else-if="report">
        <section class="summary-grid">
          <article class="summary-card">
            <span>
              報表編號
            </span>

            <strong>
              {{ report.reportNo }}
            </strong>
          </article>

          <article class="summary-card">
            <span>
              報表週期
            </span>

            <strong>
              {{
                periodTypeText(
                  report.periodType,
                )
              }}
            </strong>
          </article>

          <article class="summary-card">
            <span>
              報表期間
            </span>

            <strong>
              {{ report.periodStart }}
              ～
              {{ report.periodEnd }}
            </strong>
          </article>

          <article class="summary-card">
            <span>
              幣別
            </span>

            <strong>
              {{ report.currency }}
            </strong>
          </article>

          <article class="summary-card">
            <span>
              毛收入
            </span>

            <strong>
              {{
                formatMoney(
                  report.grossIncome,
                  report.currency,
                )
              }}
            </strong>
          </article>

          <article class="summary-card">
            <span>
              總支出
            </span>

            <strong class="orange">
              {{
                formatMoney(
                  report.totalExpense,
                  report.currency,
                )
              }}
            </strong>
          </article>

          <article class="summary-card">
            <span>
              淨收入
            </span>

            <strong class="green">
              {{
                formatMoney(
                  report.netIncome,
                  report.currency,
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
                report.status,
              ]"
            >
              {{
                statusText(
                  report.status,
                )
              }}
            </strong>
          </article>
        </section>

        <section class="detail-card">
          <h2>
            收入與支出明細
          </h2>

          <div class="detail-grid">
            <div>
              <span>
                訂單收入
              </span>

              <strong>
                {{
                  formatMoney(
                    report.orderIncome,
                    report.currency,
                  )
                }}
              </strong>
            </div>

            <div>
              <span>
                服務費收入
              </span>

              <strong>
                {{
                  formatMoney(
                    report.serviceFeeIncome,
                    report.currency,
                  )
                }}
              </strong>
            </div>

            <div>
              <span>
                其他收入
              </span>

              <strong>
                {{
                  formatMoney(
                    report.otherIncome,
                    report.currency,
                  )
                }}
              </strong>
            </div>

            <div>
              <span>
                退款金額
              </span>

              <strong>
                {{
                  formatMoney(
                    report.refundAmount,
                    report.currency,
                  )
                }}
              </strong>
            </div>

            <div>
              <span>
                提款金額
              </span>

              <strong>
                {{
                  formatMoney(
                    report.withdrawAmount,
                    report.currency,
                  )
                }}
              </strong>
            </div>

            <div>
              <span>
                結算金額
              </span>

              <strong>
                {{
                  formatMoney(
                    report.settlementAmount,
                    report.currency,
                  )
                }}
              </strong>
            </div>
          </div>
        </section>

        <section class="detail-card">
          <h2>
            筆數統計
          </h2>

          <div class="detail-grid">
            <div>
              <span>
                訂單筆數
              </span>

              <strong>
                {{ report.orderCount }}
              </strong>
            </div>

            <div>
              <span>
                退款筆數
              </span>

              <strong>
                {{ report.refundCount }}
              </strong>
            </div>

            <div>
              <span>
                提款筆數
              </span>

              <strong>
                {{ report.withdrawCount }}
              </strong>
            </div>

            <div>
              <span>
                結算筆數
              </span>

              <strong>
                {{ report.settlementCount }}
              </strong>
            </div>
          </div>
        </section>

        <section class="detail-card">
          <h2>
            產生與確認資訊
          </h2>

          <div class="detail-grid">
            <div>
              <span>
                產生人
              </span>

              <strong>
                {{ report.generatedBy || '-' }}
              </strong>
            </div>

            <div>
              <span>
                產生時間
              </span>

              <strong>
                {{
                  formatDate(
                    report.generatedAt,
                  )
                }}
              </strong>
            </div>

            <div>
              <span>
                確認人
              </span>

              <strong>
                {{ report.confirmedBy || '-' }}
              </strong>
            </div>

            <div>
              <span>
                確認時間
              </span>

              <strong>
                {{
                  formatDate(
                    report.confirmedAt,
                  )
                }}
              </strong>
            </div>

            <div class="full">
              <span>
                備註
              </span>

              <strong>
                {{ report.remark || '-' }}
              </strong>
            </div>
          </div>
        </section>

        <section class="action-card">
          <h2>
            報表操作
          </h2>

          <label>
            <span>
              備註
            </span>

            <textarea
              v-model="remark"
              rows="4"
            />
          </label>

          <div class="button-group">
            <button
              class="confirm"
              type="button"
              :disabled="store.isMutating"
              @click="
                handleStatusUpdate(
                  'confirmed',
                )
              "
            >
              確認報表
            </button>

            <button
              class="archive"
              type="button"
              :disabled="store.isMutating"
              @click="
                handleStatusUpdate(
                  'archived',
                )
              "
            >
              封存報表
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
  useFinanceReportStore,
} from '../../stores/finance-report'

import type {
  FinanceReportPeriod,
  FinanceReportStatus,
  FinanceReportStatusUpdateInput,
} from '../../types/finance-report'

const route =
  useRoute()

const router =
  useRouter()

const store =
  useFinanceReportStore()

const remark =
  ref('')

const reportId =
  computed(() =>
    String(
      route.params.id ?? '',
    ),
  )

const report =
  computed(() =>
    store.currentReport,
  )

onMounted(async () => {
  await loadReport()
})

onBeforeUnmount(() => {
  store.clearCurrentReport()
  store.clearError()
  store.clearMutationMessage()
})

async function loadReport():
  Promise<void> {
  if (!reportId.value) {
    return
  }

  const result =
    await store.fetchReportById(
      reportId.value,
    )

  if (!result) {
    return
  }

  remark.value =
    result.remark ||
    ''
}

function handleBack():
  void {
  router.push(
    '/finance/reports',
  )
}

async function handleStatusUpdate(
  status:
    FinanceReportStatusUpdateInput['status'],
): Promise<void> {
  if (!report.value) {
    return
  }

  await store.updateReportStatus({
    reportId:
      report.value.id,

    status,

    remark:
      remark.value.trim() ||
      null,
  })
}

function periodTypeText(
  value:
    FinanceReportPeriod,
): string {
  const map:
    Record<
      FinanceReportPeriod,
      string
    > = {
      daily:
        '日報',

      monthly:
        '月報',

      yearly:
        '年報',
    }

  return map[value]
}

function statusText(
  value:
    FinanceReportStatus,
): string {
  const map:
    Record<
      FinanceReportStatus,
      string
    > = {
      draft:
        '草稿',

      generated:
        '已產生',

      confirmed:
        '已確認',

      archived:
        '已封存',
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
.report-detail {
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

.status.draft {
  background: #f1f5f9;
  color: #475569;
}

.status.generated {
  background: #dbeafe;
  color: #1d4ed8;
}

.status.confirmed {
  background: #dcfce7;
  color: #15803d;
}

.status.archived {
  background: #e2e8f0;
  color: #334155;
}

.detail-card,
.action-card {
  padding: 24px;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  background: #ffffff;
}

.detail-card h2,
.action-card h2 {
  margin: 0 0 20px;
  color: #0f172a;
  font-size: 22px;
}

.detail-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.detail-grid > div {
  display: flex;
  min-width: 0;
  padding: 16px;
  border: 1px solid #eef2f7;
  border-radius: 14px;
  flex-direction: column;
  gap: 8px;
  background: #f8fafc;
}

.detail-grid span,
.action-card label > span {
  color: #64748b;
  font-size: 13px;
}

.detail-grid strong {
  overflow-wrap: anywhere;
  color: #0f172a;
  line-height: 1.6;
}

.detail-grid .full {
  grid-column: 1 / -1;
}

.action-card label {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-card textarea {
  min-height: 110px;
  padding: 11px 12px;
  border: 1px solid #dbe2ea;
  border-radius: 10px;
  resize: vertical;
  font: inherit;
}

.button-group {
  display: flex;
  margin-top: 20px;
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

.confirm {
  background: #16a34a;
}

.archive {
  background: #475569;
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

@media (max-width: 1100px) {
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
  .detail-grid {
    grid-template-columns: 1fr;
  }

  .detail-grid .full {
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