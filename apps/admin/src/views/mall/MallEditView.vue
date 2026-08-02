<template>
  <AdminLayout>
    <div class="product-edit-page">
      <section class="page-header">
        <div>
          <p class="page-eyebrow">
            MALL MANAGEMENT
          </p>

          <h1>編輯商品</h1>

          <p class="page-description">
            修改正式商品資料、價格、庫存、市場與商品狀態。
          </p>
        </div>

        <button
          class="secondary-button"
          type="button"
          :disabled="isBusy"
          @click="handleBack"
        >
          返回商品列表
        </button>
      </section>

      <section
        v-if="isLoading"
        class="state-card"
      >
        <div class="loading-spinner" />

        <strong>正在載入商品資料</strong>

        <p>
          系統正在從 Supabase 讀取商品資料。
        </p>
      </section>

      <section
        v-else-if="loadError"
        class="error-panel"
        role="alert"
      >
        <div>
          <strong>商品資料載入失敗</strong>

          <p>{{ loadError }}</p>
        </div>

        <button
          class="error-button"
          type="button"
          @click="loadProduct"
        >
          重新載入
        </button>
      </section>

      <template v-else>
        <section
          v-if="submitError"
          class="error-panel"
          role="alert"
        >
          <div>
            <strong>商品更新失敗</strong>

            <p>{{ submitError }}</p>
          </div>
        </section>

        <section
          v-if="successMessage"
          class="success-panel"
          role="status"
        >
          {{ successMessage }}
        </section>

        <form
          class="product-form"
          @submit.prevent="handleSubmit"
        >
          <section class="form-card">
            <div class="form-card__header">
              <h2>基本資料</h2>

              <p>
                商品 ID：{{ productId }}
              </p>
            </div>

            <div class="form-grid">
              <div class="form-field">
                <label for="product-code">
                  商品編號
                  <span>*</span>
                </label>

                <input
                  id="product-code"
                  v-model.trim="form.productCode"
                  type="text"
                  required
                  :disabled="isBusy"
                >
              </div>

              <div class="form-field">
                <label for="product-name">
                  商品名稱
                  <span>*</span>
                </label>

                <input
                  id="product-name"
                  v-model.trim="form.name"
                  type="text"
                  required
                  :disabled="isBusy"
                >
              </div>

              <div class="form-field form-field--full">
                <label for="subtitle">
                  商品副標題
                </label>

                <input
                  id="subtitle"
                  v-model.trim="form.subtitle"
                  type="text"
                  :disabled="isBusy"
                >
              </div>

              <div class="form-field form-field--full">
                <label for="description">
                  商品說明
                </label>

                <textarea
                  id="description"
                  v-model.trim="form.description"
                  rows="6"
                  :disabled="isBusy"
                />
              </div>
            </div>
          </section>

          <section class="form-card">
            <div class="form-card__header">
              <h2>分類與品牌</h2>

              <p>
                分類與品牌目前使用 Supabase UUID。
              </p>
            </div>

            <div class="form-grid">
              <div class="form-field">

<label>
商品分類
</label>


<select
  v-model="form.categoryId"
  :disabled="isBusy"
>

<option value="">
請選擇商品分類
</option>


<option
  v-for="category in mallCategoryStore.enabledCategories"
  :key="category.id"
  :value="category.id"
>

{{ category.name }}

</option>


</select>

</div>

              <div class="form-field">
                <label for="brand-id">
                  品牌 ID
                </label>

                <input
                  id="brand-id"
                  v-model.trim="form.brandId"
                  type="text"
                  placeholder="可保持空白"
                  :disabled="isBusy"
                >
              </div>
            </div>
          </section>

          <section class="form-card">
            <div class="form-card__header">
              <h2>價格與市場</h2>

              <p>
                設定主售價、原價、雙幣售價及銷售市場。
              </p>
            </div>

            <div class="form-grid">
              <div class="form-field">
                <label for="price">
                  商品主售價
                  <span>*</span>
                </label>

                <input
                  id="price"
                  v-model.number="form.price"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  :disabled="isBusy"
                >
              </div>

              <div class="form-field">
                <label for="original-price">
                  商品原價
                </label>

                <input
                  id="original-price"
                  v-model.number="form.originalPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  :disabled="isBusy"
                >
              </div>

              <div class="form-field">
                <label for="price-twd">
                  台幣售價
                </label>

                <input
                  id="price-twd"
                  v-model.number="form.priceTwd"
                  type="number"
                  min="0"
                  step="0.01"
                  :disabled="isBusy"
                >
              </div>

              <div class="form-field">
                <label for="price-cny">
                  人民幣售價
                </label>

                <input
                  id="price-cny"
                  v-model.number="form.priceCny"
                  type="number"
                  min="0"
                  step="0.01"
                  :disabled="isBusy"
                >
              </div>

              <div class="form-field">
                <label for="currency">
                  主幣別
                </label>

                <select
                  id="currency"
                  v-model="form.currency"
                  :disabled="isBusy"
                >
                  <option value="TWD">
                    TWD 台幣
                  </option>

                  <option value="CNY">
                    CNY 人民幣
                  </option>

                  <option value="USD">
                    USD 美元
                  </option>
                </select>
              </div>

              <div class="form-field">
                <label for="market">
                  銷售市場
                </label>

                <select
                  id="market"
                  v-model="form.market"
                  :disabled="isBusy"
                >
                  <option value="taiwan">
                    台灣市場
                  </option>

                  <option value="china">
                    中國大陸市場
                  </option>

                  <option value="global">
                    雙市場／全球
                  </option>
                </select>
              </div>
            </div>
          </section>

          <section class="form-card">
            <div class="form-card__header">
              <h2>庫存與狀態</h2>

              <p>
                管理商品庫存、安全庫存、排序與上下架狀態。
              </p>
            </div>

            <div class="form-grid">
              <div class="form-field">
                <label for="stock">
                  商品庫存
                  <span>*</span>
                </label>

                <input
                  id="stock"
                  v-model.number="form.stock"
                  type="number"
                  min="0"
                  step="1"
                  required
                  :disabled="isBusy"
                >
              </div>

              <div class="form-field">
                <label for="safety-stock">
                  安全庫存
                </label>

                <input
                  id="safety-stock"
                  v-model.number="form.safetyStock"
                  type="number"
                  min="0"
                  step="1"
                  :disabled="isBusy"
                >
              </div>

              <div class="form-field">
                <label for="sort">
                  商品排序
                </label>

                <input
                  id="sort"
                  v-model.number="form.sort"
                  type="number"
                  min="0"
                  step="1"
                  :disabled="isBusy"
                >
              </div>

              <div class="form-field">
                <label for="status">
                  商品狀態
                </label>

                <select
                  id="status"
                  v-model="form.status"
                  :disabled="isBusy"
                >
                  <option value="draft">
                    草稿
                  </option>

                  <option value="pending">
                    待審核
                  </option>

                  <option value="published">
                    已上架
                  </option>

                  <option value="disabled">
                    已下架
                  </option>
                </select>
              </div>
            </div>
          </section>

          <section class="form-card">
            <div class="form-card__header">
              <h2>商品圖片</h2>

              <p>
                目前使用圖片網址，後續再串接 Supabase Storage。
              </p>
            </div>

            <div class="form-grid">
              <div class="form-field form-field--full">
                <label for="cover">
                  封面圖片網址
                </label>

                <input
                  id="cover"
                  v-model.trim="form.cover"
                  type="url"
                  :disabled="isBusy"
                >
              </div>

              <div class="form-field form-field--full">
                <label for="images">
                  商品圖片網址
                </label>

                <textarea
                  id="images"
                  v-model="imagesText"
                  rows="5"
                  placeholder="每行輸入一個圖片網址"
                  :disabled="isBusy"
                />
              </div>
            </div>
          </section>

          <footer class="form-actions">
            <button
              class="secondary-button"
              type="button"
              :disabled="isBusy"
              @click="handleBack"
            >
              取消
            </button>

            <button
              class="primary-button"
              type="submit"
              :disabled="isBusy"
            >
              {{
                isSubmitting
                  ? '儲存中...'
                  : '儲存修改'
              }}
            </button>
          </footer>
        </form>
      </template>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
} from 'vue'

import {
  useRoute,
  useRouter,
} from 'vue-router'

import AdminLayout from '../../layouts/AdminLayout.vue'

import {
  useMallStore,
} from '../../stores/mall'

import {
  useMallCategoryStore,
} from '../../stores/mall-category'

import type {
  UpdateMallProductInput,
} from '../../types/mall'

const route =
  useRoute()

const router =
  useRouter()

const mallStore =
  useMallStore()

const mallCategoryStore =
  useMallCategoryStore()

const productId =
  computed(() =>
    String(
      route.params.id ?? '',
    ).trim(),
  )

const isSubmitting =
  ref(false)

const submitError =
  ref<string | null>(null)

const successMessage =
  ref<string | null>(null)

const imagesText =
  ref('')

const form =
  reactive<UpdateMallProductInput>({
    id: '',
    productCode: '',
    name: '',
    subtitle: '',
    description: '',
    categoryId: '',
    brandId: '',
    cover: '',
    images: [],
    price: 0,
    originalPrice: null,
    priceTwd: null,
    priceCny: null,
    currency: 'TWD',
    market: 'global',
    stock: 0,
    safetyStock: 0,
    status: 'draft',
    sort: 0,
  })

const isLoading =
  computed(() =>
    mallStore.isLoading,
  )

const isBusy =
  computed(() =>
    isLoading.value ||
    isSubmitting.value ||
    mallStore.isMutating,
  )

const loadError =
  computed(() =>
    !mallStore.currentProduct
      ? mallStore.error
      : null,
  )

onMounted(async () => {

  await Promise.all([
    loadProduct(),
    mallCategoryStore.fetchEnabledCategories(),
  ])

})

onBeforeUnmount(() => {
  mallStore.clearCurrentProduct()
  mallStore.clearError()
  mallStore.clearMutationMessage()
})

async function loadProduct():
  Promise<void> {
  submitError.value = null
  successMessage.value = null

  if (!productId.value) {
    submitError.value =
      '商品 ID 不正確。'

    return
  }

  const product =
    await mallStore.fetchProductById(
      productId.value,
    )

  if (!product) {
    return
  }

  form.id =
    product.id

  form.productCode =
    product.productCode

  form.name =
    product.name

  form.subtitle =
    product.subtitle ?? ''

  form.description =
    product.description ?? ''

  form.categoryId =
    product.categoryId ?? ''

  form.brandId =
    product.brandId ?? ''

  form.cover =
    product.cover ?? ''

  form.images = [
    ...(product.images ?? []),
  ]

  form.price =
    product.price

  form.originalPrice =
    product.originalPrice ?? null

  form.priceTwd =
    product.priceTwd ?? null

  form.priceCny =
    product.priceCny ?? null

  form.currency =
    product.currency ?? 'TWD'

  form.market =
    product.market ?? 'global'

  form.stock =
    product.stock

  form.safetyStock =
    product.safetyStock ?? 0

  form.status =
    product.status

  form.sort =
    product.sort ?? 0

  imagesText.value =
    (product.images ?? []).join('\n')
}

function normalizeImageUrls():
  string[] {
  return Array.from(
    new Set(
      imagesText.value
        .split(/\r?\n/)
        .map(
          (imageUrl) =>
            imageUrl.trim(),
        )
        .filter(Boolean),
    ),
  )
}

function validateForm():
  string | null {
  if (!form.productCode.trim()) {
    return '請輸入商品編號。'
  }

  if (!form.name.trim()) {
    return '請輸入商品名稱。'
  }

  if (
    !Number.isFinite(form.price) ||
    form.price < 0
  ) {
    return '商品主售價不可小於 0。'
  }

  if (
    typeof form.originalPrice ===
      'number' &&
    form.originalPrice <
      form.price
  ) {
    return '商品原價不可低於商品主售價。'
  }

  if (
    !Number.isInteger(form.stock) ||
    form.stock < 0
  ) {
    return '商品庫存必須是大於或等於 0 的整數。'
  }

  if (
    !Number.isInteger(
      form.safetyStock,
    ) ||
    form.safetyStock < 0
  ) {
    return '安全庫存必須是大於或等於 0 的整數。'
  }

  if (
    form.categoryId &&
    !isUuid(form.categoryId)
  ) {
    return '分類 ID 必須是正確 UUID，或保持空白。'
  }

  if (
    form.brandId &&
    !isUuid(form.brandId)
  ) {
    return '品牌 ID 必須是正確 UUID，或保持空白。'
  }

  return null
}

function isUuid(
  value: string,
): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value.trim(),
  )
}

async function handleSubmit():
  Promise<void> {
  if (isBusy.value) {
    return
  }

  submitError.value =
    validateForm()

  successMessage.value = null

  if (submitError.value) {
    return
  }

  isSubmitting.value = true

  try {
    const updatedProduct =
      await mallStore.updateProduct({
        ...form,

        id:
          productId.value,

        productCode:
          form.productCode.trim(),

        name:
          form.name.trim(),

        subtitle:
          form.subtitle?.trim() ||
          null,

        description:
          form.description?.trim() ||
          null,

        categoryId:
          form.categoryId?.trim() ||
          null,

        brandId:
          form.brandId?.trim() ||
          null,

        cover:
          form.cover?.trim() ||
          null,

        images:
          normalizeImageUrls(),
      })

    if (!updatedProduct) {
      throw new Error(
        mallStore.error ||
        '商品更新失敗。',
      )
    }

    successMessage.value =
  mallStore.mutationMessage ||
  '商品更新成功。'


await router.push(
  `/mall/${updatedProduct.id}`,
)
  } catch (caughtError) {
    submitError.value =
      caughtError instanceof Error
        ? caughtError.message
        : '商品更新發生未知錯誤。'
  } finally {
    isSubmitting.value = false
  }
}

function handleBack():
  void {
  router.push('/mall')
}
</script>

<style scoped>
.product-edit-page {
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
  letter-spacing: 0.12em;
}

.page-header h1 {
  margin: 4px 0 8px;
  color: #0f172a;
  font-size: 34px;
}

.page-description {
  margin: 0;
  color: #64748b;
  line-height: 1.7;
}

.state-card,
.error-panel,
.success-panel {
  padding: 22px 24px;
  border-radius: 16px;
}

.state-card {
  display: flex;
  min-height: 260px;
  border: 1px solid #e5e7eb;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  background: #ffffff;
  text-align: center;
}

.state-card strong {
  margin-top: 16px;
  color: #0f172a;
}

.state-card p {
  color: #94a3b8;
}

.error-panel {
  display: flex;
  border: 1px solid #fecaca;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  background: #fef2f2;
}

.error-panel strong,
.error-panel p {
  color: #b91c1c;
}

.error-panel p {
  margin: 6px 0 0;
}

.success-panel {
  border: 1px solid #bbf7d0;
  background: #f0fdf4;
  color: #15803d;
  font-weight: 700;
}

.loading-spinner {
  width: 42px;
  height: 42px;
  border: 4px solid #e0e7ff;
  border-top-color: #3157d6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.product-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-card {
  overflow: hidden;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  background: #ffffff;
}

.form-card__header {
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.form-card__header h2 {
  margin: 0;
  color: #0f172a;
  font-size: 19px;
}

.form-card__header p {
  margin: 6px 0 0;
  color: #94a3b8;
  font-size: 13px;
}

.form-grid {
  display: grid;
  padding: 24px;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.form-field {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 8px;
}

.form-field--full {
  grid-column: 1 / -1;
}

.form-field label {
  color: #334155;
  font-size: 13px;
  font-weight: 800;
}

.form-field label span {
  color: #dc2626;
}

.form-field input,
.form-field select,
.form-field textarea {
  width: 100%;
  border: 1px solid #dbe2ea;
  border-radius: 10px;
  background: #ffffff;
  color: #0f172a;
  font: inherit;
  outline: none;
}

.form-field input,
.form-field select {
  min-height: 44px;
  padding: 0 13px;
}

.form-field textarea {
  padding: 12px 13px;
  resize: vertical;
}

.form-field input:focus,
.form-field select:focus,
.form-field textarea:focus {
  border-color: #3157d6;
  box-shadow:
    0 0 0 3px
    rgba(49, 87, 214, 0.12);
}

.form-actions {
  display: flex;
  padding: 20px 24px;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  justify-content: flex-end;
  gap: 12px;
  background: #ffffff;
}

.primary-button,
.secondary-button,
.error-button {
  min-height: 42px;
  padding: 0 18px;
  border-radius: 10px;
  cursor: pointer;
  font: inherit;
  font-weight: 800;
}

.primary-button {
  border: 1px solid #3157d6;
  background: #3157d6;
  color: #ffffff;
}

.secondary-button {
  border: 1px solid #dbe2ea;
  background: #ffffff;
  color: #334155;
}

.error-button {
  border: 1px solid #ef4444;
  background: #ffffff;
  color: #b91c1c;
}

.primary-button:disabled,
.secondary-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

@media (max-width: 760px) {
  .page-header {
    flex-direction: column;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-field--full {
    grid-column: auto;
  }

  .form-actions {
    flex-direction: column-reverse;
  }
}
</style>