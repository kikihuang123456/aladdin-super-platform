<template>
  <AdminLayout>
    <div class="audit-detail-page">
      <section class="page-header">
        <div>
          <p class="page-eyebrow">
            FINANCE AUDIT ERP
          </p>

          <h1>
            財務稽核詳情
          </h1>

          <p class="page-description">
            檢視完整操作紀錄、異動快照、來源資訊與稽核結果。
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
        正在載入稽核紀錄...
      </div>

      <div
        v-else-if="store.error"
        class="error-panel"
      >
        {{ store.error }}
      </div>

      <template v-else-if="log">
        <section class="summary-grid">
          <article class="summary-card">
            <span>稽核編號</span>
            <strong>{{ log.auditNo }}</strong>
          </article>

          <article class="summary-card">
            <span>模組</span>
            <strong>{{ moduleText(log.module) }}</strong>
          </article>

          <article class="summary-card">
            <span>操作</span>
            <strong>{{ actionText(log.action) }}</strong>
          </article>

          <article class="summary-card">
            <span>結果</span>
            <strong
              :class="[
                'result',
                log.result,
              ]"
            >
              {{ resultText(log.result) }}
            </strong>
          </article>
        </section>

        <section class="detail-card">
          <h2>
            關聯資訊
          </h2>

          <div class="detail-grid">
            <div>
              <span>單據類型</span>
              <strong>{{ log.referenceType || '-' }}</strong>
            </div>

            <div>
              <span>單據編號</span>
              <strong>{{ log.referenceNo || '-' }}</strong>
            </div>

            <div>
              <span>Reference ID</span>
              <strong>{{ log.referenceId || '-' }}</strong>
            </div>

            <div>
              <span>建立時間</span>
              <strong>{{ formatDate(log.createdAt) }}</strong>
            </div>
          </div>
        </section>

        <section class="detail-card">
          <h2>
            操作人資訊
          </h2>

          <div class="detail-grid">
            <div>
              <span>操作人</span>
              <strong>{{ log.operatorName || '-' }}</strong>
            </div>

            <div>
              <span>角色</span>
              <strong>{{ log.operatorRole || '-' }}</strong>
            </div>

            <div>
              <span>Operator ID</span>
              <strong>{{ log.operatorId || '-' }}</strong>
            </div>

            <div>
              <span>來源 IP</span>
              <strong>{{ log.sourceIp || '-' }}</strong>
            </div>

            <div class="full">
              <span>User Agent</span>
              <strong>{{ log.userAgent || '-' }}</strong>
            </div>
          </div>
        </section>

        <section class="detail-card">
          <h2>
            異動前快照
          </h2>

          <pre>
{{ formatSnapshot(log.previousSnapshot) }}
          </pre>
        </section>

        <section class="detail-card">
          <h2>
            異動後快照
          </h2>

          <pre>
{{ formatSnapshot(log.nextSnapshot) }}
          </pre>
        </section>

        <section class="detail-card">
          <h2>
            錯誤與備註
          </h2>

          <div class="detail-grid">
            <div class="full">
              <span>錯誤訊息</span>
              <strong>{{ log.errorMessage || '-' }}</strong>
            </div>

            <div class="full">
              <span>備註</span>
              <strong>{{ log.remark || '-' }}</strong>
            </div>
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
  useFinanceAuditLogStore,
} from '../../stores/finance-audit-log'

import type {
  FinanceAuditAction,
  FinanceAuditModule,
  FinanceAuditResult,
} from '../../types/finance-audit-log'

const route =
  useRoute()

const router =
  useRouter()

const store =
  useFinanceAuditLogStore()

const auditLogId =
  computed(() =>
    String(
      route.params.id ?? '',
    ),
  )

const log =
  computed(() =>
    store.currentLog,
  )

onMounted(async () => {
  await loadLog()
})

onBeforeUnmount(() => {
  store.clearCurrentLog()
  store.clearError()
  store.clearMutationMessage()
})

async function loadLog():
  Promise<void> {
  if (!auditLogId.value) {
    return
  }

  await store.fetchLogById(
    auditLogId.value,
  )
}

function handleBack():
  void {
  router.push(
    '/finance/audit-logs',
  )
}

function moduleText(
  value:
    FinanceAuditModule,
): string {
  const map:
    Record<
      FinanceAuditModule,
      string
    > = {
      transaction:
        '交易',

      wallet:
        '錢包',

      withdraw:
        '提款',

      refund:
        '退款',

      settlement:
        '結算',

      report:
        '報表',
    }

  return map[value]
}

function actionText(
  value:
    FinanceAuditAction,
): string {
  const map:
    Record<
      FinanceAuditAction,
      string
    > = {
      create:
        '建立',

      update:
        '更新',

      approve:
        '通過',

      reject:
        '拒絕',

      process:
        '處理',

      complete:
        '完成',

      cancel:
        '取消',

      confirm:
        '確認',

      archive:
        '封存',

      generate:
        '產生',

      adjust:
        '調整',
    }

  return map[value]
}

function resultText(
  value:
    FinanceAuditResult,
): string {
  const map:
    Record<
      FinanceAuditResult,
      string
    > = {
      success:
        '成功',

      failed:
        '失敗',
    }

  return map[value]
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

function formatSnapshot(
  value:
    Record<string, unknown> |
    null |
    undefined,
): string {
  if (!value) {
    return '-'
  }

  try {
    return JSON.stringify(
      value,
      null,
      2,
    )
  } catch {
    return '快照資料無法解析'
  }
}
</script>
<style scoped>
.audit-detail-page {
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

.result {
  display: inline-flex;
  width: fit-content;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 800;
}

.result.success {
  background: #dcfce7;
  color: #15803d;
}

.result.failed {
  background: #fee2e2;
  color: #b91c1c;
}

.detail-card {
  padding: 24px;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  background: #ffffff;
}

.detail-card h2 {
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

.detail-grid span {
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

.detail-card pre {
  overflow-x: auto;
  margin: 0;
  padding: 18px;
  border: 1px solid #dbe2ea;
  border-radius: 12px;
  background: #0f172a;
  color: #e2e8f0;
  font-family:
    ui-monospace,
    SFMono-Regular,
    Menlo,
    Monaco,
    Consolas,
    monospace;
  font-size: 13px;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
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
  .detail-grid {
    grid-template-columns: 1fr;
  }

  .detail-grid .full {
    grid-column: auto;
  }
}
</style>