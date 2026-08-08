<template>
  <AdminLayout>
    <div class="merchant-detail">
      <section class="page-header">
        <div>
          <p class="page-eyebrow">
            MERCHANT ERP
          </p>

          <h1>
            商家詳情
          </h1>

          <p class="page-description">
            檢視商家基本資料、公司資訊、聯絡方式與審核狀態。
          </p>
        </div>

        <div class="header-actions">
          <button
            v-if="
              merchant &&
              !merchant.deletedAt &&
              permissionStore.hasPermission(
                'merchant.update',
              )
            "
            class="edit-button"
            type="button"
            :disabled="store.isMutating"
            @click="handleEdit"
          >
            編輯商家
          </button>

          <button
            class="back-button"
            type="button"
            @click="handleBack"
          >
            返回列表
          </button>
        </div>
      </section>

      <div
        v-if="store.isLoading"
        class="state-panel"
      >
        正在載入商家資料...
      </div>

      <div
        v-else-if="store.error"
        class="error-panel"
      >
        {{ store.error }}
      </div>

      <template v-else-if="merchant">
        <div
          v-if="merchant.deletedAt"
          class="deleted-notice"
        >
          <strong>
            此商家已刪除
          </strong>

          <span>
            刪除時間：
            {{
              formatDate(
                merchant.deletedAt,
              )
            }}
          </span>
        </div>

        <div
          v-else-if="merchant.archivedAt"
          class="archived-notice"
        >
          <strong>
            此商家目前已封存
          </strong>

          <span>
            封存時間：
            {{
              formatDate(
                merchant.archivedAt,
              )
            }}
          </span>
        </div>

        <section class="summary-grid">
          <article class="summary-card">
            <span>
              商家編號
            </span>

            <strong>
              {{ merchant.merchantNo }}
            </strong>
          </article>

          <article class="summary-card">
            <span>
              商家名稱
            </span>

            <strong>
              {{ merchant.name }}
            </strong>

            <small>
              {{ merchant.legalName || '-' }}
            </small>
          </article>

          <article class="summary-card">
            <span>
              商家類型
            </span>

            <strong>
              {{
                merchantTypeText(
                  merchant.merchantType,
                )
              }}
            </strong>
          </article>

          <article class="summary-card">
            <span>
              市場
            </span>

            <strong>
              {{
                marketText(
                  merchant.market,
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
                merchant.status,
              ]"
            >
              {{
                statusText(
                  merchant.status,
                )
              }}
            </strong>
          </article>
        </section>

        <section class="detail-card">
          <h2>
            商家基本資料
          </h2>

          <div class="detail-grid">
            <div>
              <span>
                公司／法定名稱
              </span>

              <strong>
                {{ merchant.legalName || '-' }}
              </strong>
            </div>

            <div>
              <span>
                商業登記／營業執照
              </span>

              <strong>
                {{
                  merchant.businessLicenseNo ||
                  '-'
                }}
              </strong>
            </div>

            <div>
              <span>
                統一編號／稅號
              </span>

              <strong>
                {{ merchant.taxNo || '-' }}
              </strong>
            </div>

            <div>
              <span>
                商家地址
              </span>

              <strong>
                {{ merchant.address || '-' }}
              </strong>
            </div>

            <div class="full">
              <span>
                商家介紹
              </span>

              <strong>
                {{ merchant.description || '-' }}
              </strong>
            </div>
          </div>
        </section>

        <section class="detail-card">
          <h2>
            聯絡人資料
          </h2>

          <div class="detail-grid">
            <div>
              <span>
                聯絡人
              </span>

              <strong>
                {{ merchant.contactName || '-' }}
              </strong>
            </div>

            <div>
              <span>
                聯絡電話
              </span>

              <strong>
                {{ merchant.contactPhone || '-' }}
              </strong>
            </div>

            <div>
              <span>
                電子信箱
              </span>

              <strong>
                {{ merchant.contactEmail || '-' }}
              </strong>
            </div>

            <div>
              <span>
                建立時間
              </span>

              <strong>
                {{
                  formatDate(
                    merchant.createdAt,
                  )
                }}
              </strong>
            </div>
          </div>
        </section>

        <section class="detail-card">
          <h2>
            審核與啟用資訊
          </h2>

          <div class="detail-grid">
            <div>
              <span>
                審核人
              </span>

              <strong>
                {{ merchant.reviewedBy || '-' }}
              </strong>
            </div>

            <div>
              <span>
                審核時間
              </span>

              <strong>
                {{
                  formatDate(
                    merchant.reviewedAt,
                  )
                }}
              </strong>
            </div>

            <div>
              <span>
                啟用時間
              </span>

              <strong>
                {{
                  formatDate(
                    merchant.activatedAt,
                  )
                }}
              </strong>
            </div>

            <div>
              <span>
                更新時間
              </span>

              <strong>
                {{
                  formatDate(
                    merchant.updatedAt,
                  )
                }}
              </strong>
            </div>

            <div>
              <span>
                封存時間
              </span>

              <strong>
                {{
                  formatDate(
                    merchant.archivedAt,
                  )
                }}
              </strong>
            </div>

            <div>
              <span>
                刪除時間
              </span>

              <strong>
                {{
                  formatDate(
                    merchant.deletedAt,
                  )
                }}
              </strong>
            </div>

            <div class="full">
              <span>
                審核備註
              </span>

              <strong>
                {{ merchant.reviewRemark || '-' }}
              </strong>
            </div>
          </div>
        </section>

        <section
          v-if="!merchant.deletedAt"
          class="action-card"
        >
          <h2>
            商家操作
          </h2>

          <label>
            <span>
              操作備註
            </span>

            <textarea
              v-model="remark"
              rows="4"
              placeholder="請輸入審核或狀態異動備註"
            />
          </label>

          <div class="button-group">
            <button
              v-if="
                !merchant.archivedAt &&
                merchant.status === 'pending' &&
                permissionStore.hasPermission(
                  'merchant.approve',
                )
              "
              class="approve"
              type="button"
              :disabled="store.isMutating"
              @click="handleReview('approved')"
            >
              通過審核
            </button>

            <button
              v-if="
                !merchant.archivedAt &&
                merchant.status === 'pending' &&
                permissionStore.hasPermission(
                  'merchant.approve',
                )
              "
              class="reject"
              type="button"
              :disabled="store.isMutating"
              @click="handleReview('rejected')"
            >
              拒絕審核
            </button>

            <button
              v-if="
                !merchant.archivedAt &&
                merchant.status !== 'active' &&
                permissionStore.hasPermission(
                  'merchant.update',
                )
              "
              class="active"
              type="button"
              :disabled="store.isMutating"
              @click="handleStatusUpdate('active')"
            >
              啟用商家
            </button>

            <button
              v-if="
                !merchant.archivedAt &&
                merchant.status === 'active' &&
                permissionStore.hasPermission(
                  'merchant.update',
                )
              "
              class="suspend"
              type="button"
              :disabled="store.isMutating"
              @click="handleStatusUpdate('suspended')"
            >
              暫停商家
            </button>

            <button
              v-if="
                !merchant.archivedAt &&
                merchant.status !== 'disabled' &&
                permissionStore.hasPermission(
                  'merchant.update',
                )
              "
              class="disable"
              type="button"
              :disabled="store.isMutating"
              @click="handleStatusUpdate('disabled')"
            >
              停用商家
            </button>
          </div>

          <div
            v-if="
              permissionStore.hasPermission(
                'merchant.update',
              )
            "
            class="lifecycle-section"
          >
            <div class="lifecycle-heading">
              <div>
                <h3>
                  商家生命週期
                </h3>

                <p>
                  封存可恢復；刪除採 Soft Delete，
                  不會直接移除正式資料。
                </p>
              </div>
            </div>

            <div class="lifecycle-buttons">
              <button
                v-if="!merchant.archivedAt"
                class="archive-button"
                type="button"
                :disabled="store.isMutating"
                @click="handleArchive"
              >
                {{
                  store.isMutating
                    ? '處理中...'
                    : '封存商家'
                }}
              </button>

              <button
                v-else
                class="restore-button"
                type="button"
                :disabled="store.isMutating"
                @click="handleRestore"
              >
                {{
                  store.isMutating
                    ? '處理中...'
                    : '恢復商家'
                }}
              </button>

              <button
                class="delete-button"
                type="button"
                :disabled="store.isMutating"
                @click="handleSoftDelete"
              >
                {{
                  store.isMutating
                    ? '處理中...'
                    : '刪除商家'
                }}
              </button>
            </div>
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
  useMerchantStore,
} from '../../stores/merchant'

import {
  usePermissionStore,
} from '../../stores/permission'

import type {
  MerchantMarket,
  MerchantReviewInput,
  MerchantStatus,
  MerchantStatusUpdateInput,
  MerchantType,
} from '../../types/merchant'

const route =
  useRoute()

const router =
  useRouter()

const store =
  useMerchantStore()

const permissionStore =
  usePermissionStore()

const remark =
  ref('')

const merchantId =
  computed(() =>
    String(
      route.params.id ?? '',
    ),
  )

const merchant =
  computed(() =>
    store.currentMerchant,
  )

onMounted(async () => {
  await loadMerchant()
})

onBeforeUnmount(() => {
  store.clearCurrentMerchant()
  store.clearError()
  store.clearMutationMessage()
})

async function loadMerchant():
  Promise<void> {
  if (!merchantId.value) {
    return
  }

  const result =
    await store.fetchMerchantById(
      merchantId.value,
    )

  if (!result) {
    return
  }

  remark.value =
    result.reviewRemark ||
    ''
}

function handleBack():
  void {
  router.push(
    '/merchants',
  )
}

function handleEdit():
  void {
  if (!merchant.value) {
    return
  }

  router.push(
    `/merchants/${merchant.value.id}/edit`,
  )
}

async function handleReview(
  status:
    MerchantReviewInput['status'],
): Promise<void> {
  if (!merchant.value) {
    return
  }

  await store.reviewMerchantRequest({
    merchantId:
      merchant.value.id,

    status,

    reviewRemark:
      remark.value.trim() ||
      null,
  })
}

async function handleStatusUpdate(
  status:
    MerchantStatusUpdateInput['status'],
): Promise<void> {
  if (!merchant.value) {
    return
  }

  await store.updateStatus({
    merchantId:
      merchant.value.id,

    status,

    remark:
      remark.value.trim() ||
      null,
  })
}

async function handleArchive():
  Promise<void> {
  if (!merchant.value) {
    return
  }

  const confirmed =
    window.confirm(
      `確定要封存商家「${merchant.value.name}」嗎？\n\n封存後商家資料仍會保留，之後可以恢復。`,
    )

  if (!confirmed) {
    return
  }

  const success =
    await store.archiveMerchantRequest(
      merchant.value.id,
    )

  if (!success) {
    return
  }
}

async function handleRestore():
  Promise<void> {
  if (!merchant.value) {
    return
  }

  const confirmed =
    window.confirm(
      `確定要恢復商家「${merchant.value.name}」嗎？`,
    )

  if (!confirmed) {
    return
  }

  const success =
    await store.restoreMerchantRequest(
      merchant.value.id,
    )

  if (!success) {
    return
  }
}

async function handleSoftDelete():
  Promise<void> {
  if (!merchant.value) {
    return
  }

  const merchantName =
    merchant.value.name

  const firstConfirm =
    window.confirm(
      `確定要刪除商家「${merchantName}」嗎？\n\n此操作會將商家標記為已刪除。`,
    )

  if (!firstConfirm) {
    return
  }

  const secondConfirm =
    window.confirm(
      `再次確認：真的要刪除「${merchantName}」嗎？\n\n這是 Soft Delete，資料會保留於資料庫，但一般商家流程將不再使用此筆資料。`,
    )

  if (!secondConfirm) {
    return
  }

  const success =
    await store.softDeleteMerchantRequest(
      merchant.value.id,
    )

  if (!success) {
    return
  }

  await router.push(
    '/merchants',
  )
}

function merchantTypeText(
  value:
    MerchantType,
): string {
  const map:
    Record<
      MerchantType,
      string
    > = {
      individual:
        '個人商家',

      company:
        '公司商家',

      brand:
        '品牌商家',

      platform:
        '平台直營',
    }

  return map[value]
}

function marketText(
  value:
    MerchantMarket,
): string {
  const map:
    Record<
      MerchantMarket,
      string
    > = {
      taiwan:
        '台灣',

      china:
        '中國',

      cross_border:
        '跨境',
    }

  return map[value]
}

function statusText(
  value:
    MerchantStatus,
): string {
  const map:
    Record<
      MerchantStatus,
      string
    > = {
      pending:
        '待審核',

      approved:
        '已通過',

      rejected:
        '已拒絕',

      active:
        '營運中',

      suspended:
        '已暫停',

      disabled:
        '已停用',
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
</script>

<style scoped>
.merchant-detail {
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

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.edit-button {
  min-height: 42px;
  padding: 0 18px;
  border: 1px solid #3157d6;
  border-radius: 10px;
  background: #3157d6;
  color: #ffffff;
  cursor: pointer;
  font: inherit;
  font-weight: 700;
}

.edit-button:hover {
  background: #2748b8;
}

.edit-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
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

.archived-notice,
.deleted-notice {
  display: flex;
  padding: 16px 18px;
  border-radius: 14px;
  flex-direction: column;
  gap: 6px;
}

.archived-notice {
  border: 1px solid #fde68a;
  background: #fffbeb;
  color: #92400e;
}

.deleted-notice {
  border: 1px solid #fecaca;
  background: #fef2f2;
  color: #991b1b;
}

.archived-notice strong,
.deleted-notice strong {
  font-size: 16px;
}

.archived-notice span,
.deleted-notice span {
  font-size: 13px;
}

.summary-grid {
  display: grid;
  grid-template-columns:
    repeat(5, minmax(0, 1fr));
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

.status.approved {
  background: #dbeafe;
  color: #1d4ed8;
}

.status.active {
  background: #dcfce7;
  color: #15803d;
}

.status.suspended {
  background: #ede9fe;
  color: #6d28d9;
}

.status.rejected {
  background: #fee2e2;
  color: #b91c1c;
}

.status.disabled {
  background: #e2e8f0;
  color: #475569;
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

.action-card textarea:focus {
  border-color: #3157d6;
  outline: none;
  box-shadow:
    0 0 0 3px
    rgba(49, 87, 214, 0.12);
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

.approve {
  background: #2563eb;
}

.reject {
  background: #dc2626;
}

.active {
  background: #16a34a;
}

.suspend {
  background: #7c3aed;
}

.disable {
  background: #475569;
}

.lifecycle-section {
  margin-top: 28px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.lifecycle-heading h3 {
  margin: 0;
  color: #0f172a;
  font-size: 18px;
}

.lifecycle-heading p {
  margin: 8px 0 0;
  color: #64748b;
  line-height: 1.7;
}

.lifecycle-buttons {
  display: flex;
  margin-top: 18px;
  gap: 12px;
  flex-wrap: wrap;
}

.lifecycle-buttons button {
  min-height: 42px;
  padding: 0 18px;
  border-radius: 10px;
  cursor: pointer;
  font: inherit;
  font-weight: 800;
}

.lifecycle-buttons button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.archive-button {
  border: 1px solid #d97706;
  background: #ffffff;
  color: #b45309;
}

.archive-button:hover {
  background: #fffbeb;
}

.restore-button {
  border: 1px solid #16a34a;
  background: #ffffff;
  color: #15803d;
}

.restore-button:hover {
  background: #f0fdf4;
}

.delete-button {
  border: 1px solid #dc2626;
  background: #dc2626;
  color: #ffffff;
}

.delete-button:hover {
  background: #b91c1c;
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
      repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .summary-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
  }

  .header-actions {
    width: 100%;
    flex-direction: column;
  }

  .edit-button,
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

  .button-group,
  .lifecycle-buttons {
    flex-direction: column;
  }

  .button-group button,
  .lifecycle-buttons button {
    width: 100%;
  }
}
</style>