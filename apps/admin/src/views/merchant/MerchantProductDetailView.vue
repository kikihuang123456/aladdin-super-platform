<template>
  <AdminLayout>
    <div class="merchant-product-detail">
      <section class="page-header">
        <div>
          <p class="page-eyebrow">
            MERCHANT PRODUCT ERP
          </p>

          <h1>
            商家商品詳情
          </h1>

          <p class="page-description">
            檢視商家商品資訊、售價、庫存、審核與上下架狀態。
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
        正在載入商家商品資料...
      </div>

      <div
        v-else-if="store.error"
        class="error-panel"
      >
        {{ store.error }}
      </div>

      <template
        v-else-if="product"
      >
        <section class="summary-grid">
          <article class="summary-card">
            <span>
              商家商品編號
            </span>

            <strong>
              {{ product.merchantProductNo }}
            </strong>
          </article>

          <article class="summary-card">
            <span>
              商家
            </span>

            <strong>
              {{ product.merchantName || '-' }}
            </strong>
          </article>

          <article class="summary-card">
            <span>
              平台商品
            </span>

            <strong>
              {{ product.productName || '-' }}
            </strong>

            <small>
              {{ product.productNo || '-' }}
            </small>
          </article>

          <article class="summary-card">
            <span>
              商品狀態
            </span>

            <strong
              :class="[
                'status',
                product.status,
              ]"
            >
              {{
                statusText(
                  product.status,
                )
              }}
            </strong>
          </article>

          <article class="summary-card">
            <span>
              上架狀態
            </span>

            <strong
              :class="[
                'listed',
                product.isListed
                  ? 'listed-on'
                  : 'listed-off',
              ]"
            >
              {{
                product.isListed
                  ? '已上架'
                  : '已下架'
              }}
            </strong>
          </article>
        </section>

        <section class="detail-card">
          <h2>
            商品資訊
          </h2>

          <div class="detail-grid">
            <div>
              <span>
                商品名稱
              </span>

              <strong>
                {{ product.productName || '-' }}
              </strong>
            </div>

            <div>
              <span>
                平台商品編號
              </span>

              <strong>
                {{ product.productNo || '-' }}
              </strong>
            </div>

            <div>
              <span>
                售價
              </span>

              <strong>
                {{
                  formatMoney(
                    product.salePrice,
                    product.currency,
                  )
                }}
              </strong>
            </div>

            <div>
              <span>
                建議售價
              </span>

              <strong>
                {{
                  product.comparePrice
                    ? formatMoney(
                        product.comparePrice,
                        product.currency,
                      )
                    : '-'
                }}
              </strong>
            </div>

            <div>
              <span>
                成本價
              </span>

              <strong>
                {{
                  product.costPrice
                    ? formatMoney(
                        product.costPrice,
                        product.currency,
                      )
                    : '-'
                }}
              </strong>
            </div>

            <div>
              <span>
                幣別
              </span>

              <strong>
                {{ product.currency }}
              </strong>
            </div>
          </div>
        </section>

        <section class="detail-card">
          <h2>
            庫存資訊
          </h2>

          <div class="detail-grid">
            <div>
              <span>
                總庫存
              </span>

              <strong>
                {{ product.stockQuantity }}
              </strong>
            </div>

            <div>
              <span>
                凍結庫存
              </span>

              <strong>
                {{ product.frozenStock }}
              </strong>
            </div>

            <div>
              <span>
                可用庫存
              </span>

              <strong>
                {{ product.availableStock }}
              </strong>
            </div>

            <div>
              <span>
                低庫存門檻
              </span>

              <strong>
                {{ product.lowStockThreshold }}
              </strong>
            </div>
          </div>
        </section>

        <section class="action-card">
          <h2>
            商品操作
          </h2>

          <label>
            <span>
              操作備註
            </span>

            <textarea
              v-model="remark"
              rows="4"
              placeholder="請輸入操作備註"
            />
          </label>

          <div class="button-group">
            <button
              class="approve"
              type="button"
              :disabled="store.isMutating"
              @click="handleApprove"
            >
              通過審核
            </button>

            <button
              class="reject"
              type="button"
              :disabled="store.isMutating"
              @click="handleReject"
            >
              拒絕審核
            </button>

            <button
              class="active"
              type="button"
              :disabled="store.isMutating"
              @click="handleActive"
            >
              啟用／上架
            </button>

            <button
              class="disable"
              type="button"
              :disabled="store.isMutating"
              @click="handleInactive"
            >
              停用／下架
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
  useMerchantProductStore,
} from '../../stores/merchant-product'

import type {
  MerchantProductStatus,
} from '../../types/merchant-product'

const route =
  useRoute()

const router =
  useRouter()

const store =
  useMerchantProductStore()

const remark =
  ref('')

const merchantProductId =
  computed(() =>
    String(
      route.params.id ?? '',
    ),
  )

const product =
  computed(() =>
    store.currentProduct,
  )

onMounted(async () => {
  await loadProduct()
})

onBeforeUnmount(() => {
  store.clearCurrentProduct()
  store.clearError()
  store.clearMutationMessage()
})

async function loadProduct():
  Promise<void> {
  if (!merchantProductId.value) {
    return
  }

  const result =
    await store.fetchProductById(
      merchantProductId.value,
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
    '/merchants/products',
  )
}

async function handleApprove():
  Promise<void> {
  if (!product.value) {
    return
  }

  await store.reviewProduct({
    merchantProductId:
      product.value.id,

    status:
      'approved',

    reviewRemark:
      remark.value.trim() ||
      null,
  })
}

async function handleReject():
  Promise<void> {
  if (!product.value) {
    return
  }

  await store.reviewProduct({
    merchantProductId:
      product.value.id,

    status:
      'rejected',

    reviewRemark:
      remark.value.trim() ||
      null,
  })
}

async function handleActive():
  Promise<void> {
  if (!product.value) {
    return
  }

  await store.updateStatus({
    merchantProductId:
      product.value.id,

    status:
      'active',

    isListed:
      true,

    remark:
      remark.value.trim() ||
      null,
  })
}

async function handleInactive():
  Promise<void> {
  if (!product.value) {
    return
  }

  await store.updateStatus({
    merchantProductId:
      product.value.id,

    status:
      'inactive',

    isListed:
      false,

    remark:
      remark.value.trim() ||
      null,
  })
}

function statusText(
  value:
    MerchantProductStatus,
): string {
  const map:
    Record<
      MerchantProductStatus,
      string
    > = {
      draft:
        '草稿',

      pending:
        '待審核',

      approved:
        '已通過',

      rejected:
        '已拒絕',

      active:
        '啟用中',

      inactive:
        '已停用',
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
.merchant-product-detail {
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
  padding: 40px;
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
  padding: 22px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
}

.summary-card span {
  display: block;
  margin-bottom: 10px;
  color: #64748b;
  font-size: 13px;
}

.summary-card strong {
  display: block;
  color: #0f172a;
  font-size: 22px;
  font-weight: 800;
  word-break: break-word;
}

.summary-card small {
  color: #94a3b8;
}

.status,
.listed {
  display: inline-flex;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
}

.status.draft {
  background: #f1f5f9;
  color: #475569;
}

.status.pending {
  background: #fef3c7;
  color: #b45309;
}

.status.approved {
  background: #dbeafe;
  color: #1d4ed8;
}

.status.rejected {
  background: #fee2e2;
  color: #b91c1c;
}

.status.active {
  background: #dcfce7;
  color: #15803d;
}

.status.inactive {
  background: #e2e8f0;
  color: #475569;
}

.listed-on {
  background: #dcfce7;
  color: #15803d;
}

.listed-off {
  background: #e2e8f0;
  color: #475569;
}

.detail-card,
.action-card {
  padding: 24px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
}

.detail-card h2,
.action-card h2 {
  margin: 0 0 20px;
  color: #0f172a;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2,minmax(0,1fr));
  gap: 18px;
}

.detail-grid > div {
  padding: 16px;
  background: #f8fafc;
  border: 1px solid #eef2f7;
  border-radius: 12px;
}

.detail-grid span {
  display: block;
  margin-bottom: 8px;
  color: #64748b;
  font-size: 13px;
}

.detail-grid strong {
  color: #0f172a;
  word-break: break-word;
}

.action-card label {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-card textarea {
  min-height: 120px;
  padding: 12px;
  border: 1px solid #dbe2ea;
  border-radius: 10px;
  resize: vertical;
  font: inherit;
}

.action-card textarea:focus {
  outline: none;
  border-color: #3157d6;
  box-shadow: 0 0 0 3px rgba(49,87,214,.12);
}

.button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 20px;
}

.button-group button {
  min-height: 42px;
  padding: 0 18px;
  border: 0;
  border-radius: 10px;
  color: #fff;
  cursor: pointer;
  font: inherit;
  font-weight: 700;
}

.button-group button:disabled {
  opacity: .55;
  cursor: not-allowed;
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

.disable {
  background: #475569;
}

.success-panel {
  margin-top: 20px;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #bbf7d0;
  background: #f0fdf4;
  color: #15803d;
  font-weight: 700;
}

@media (max-width:1200px) {
  .summary-grid {
    grid-template-columns: repeat(3,minmax(0,1fr));
  }
}

@media (max-width:900px) {
  .summary-grid {
    grid-template-columns: repeat(2,minmax(0,1fr));
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width:768px) {
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