<template>
  <div class="merchant-edit-page">
    <header class="page-header">
      <div>
        <p class="page-eyebrow">
          Merchant ERP
        </p>

        <h1>
          編輯商家
        </h1>

        <p class="page-description">
          修改商家基本資料、聯絡資訊與品牌資料。
          商家編號、審核狀態及狀態流程不會在此頁修改。
        </p>
      </div>

      <button
        type="button"
        class="secondary-button"
        @click="handleBack"
      >
        返回商家詳情
      </button>
    </header>

    <div
      v-if="loading"
      class="notice-card"
    >
      正在載入商家資料...
    </div>

    <div
      v-else-if="loadError"
      class="notice-card error-notice"
    >
      {{ loadError }}
    </div>

    <form
      v-else
      class="merchant-form"
      @submit.prevent="handleSubmit"
    >
      <!-- ============================= -->
      <!-- 基本資料 -->
      <!-- ============================= -->

      <section class="form-card">
        <div class="section-heading">
          <div>
            <h2>
              基本資料
            </h2>

            <p>
              商家編號由系統產生，不可修改。
            </p>
          </div>
        </div>

        <div class="form-grid">
          <label class="field field-wide">
            <span>
              商家編號
            </span>

            <input
              :value="merchant?.merchantNo ?? ''"
              type="text"
              disabled
            />
          </label>

          <label class="field field-wide">
            <span>
              商家名稱
              <b>*</b>
            </span>

            <input
              v-model="form.name"
              type="text"
              maxlength="120"
              placeholder="請輸入商家名稱"
              required
            />
          </label>

          <label class="field field-wide">
            <span>
              公司／法定名稱
            </span>

            <input
              v-model="form.legalName"
              type="text"
              maxlength="160"
              placeholder="例如：杭州某某科技有限公司"
            />
          </label>

          <label class="field">
            <span>
              商家類型
              <b>*</b>
            </span>

            <select
              v-model="form.merchantType"
              required
            >
              <option value="individual">
                個人商家
              </option>

              <option value="company">
                公司
              </option>

              <option value="brand">
                品牌
              </option>

              <option value="platform">
                平台商家
              </option>
            </select>
          </label>

          <label class="field">
            <span>
              所屬市場
              <b>*</b>
            </span>

            <select
              v-model="form.market"
              required
            >
              <option value="taiwan">
                台灣
              </option>

              <option value="china">
                中國大陸
              </option>

              <option value="cross_border">
                跨境
              </option>
            </select>
          </label>
        </div>
      </section>

      <!-- ============================= -->
      <!-- 聯絡資訊 -->
      <!-- ============================= -->

      <section class="form-card">
        <div class="section-heading">
          <div>
            <h2>
              聯絡資訊
            </h2>

            <p>
              修改商家主要聯絡窗口與聯繫方式。
            </p>
          </div>
        </div>

        <div class="form-grid">
          <label class="field">
            <span>
              聯絡人
            </span>

            <input
              v-model="form.contactName"
              type="text"
              maxlength="80"
              placeholder="請輸入聯絡人姓名"
            />
          </label>

          <label class="field">
            <span>
              聯絡電話
            </span>

            <input
              v-model="form.contactPhone"
              type="text"
              maxlength="40"
              placeholder="請輸入聯絡電話"
            />
          </label>

          <label class="field field-wide">
            <span>
              Email
            </span>

            <input
              v-model="form.contactEmail"
              type="email"
              maxlength="160"
              placeholder="merchant@example.com"
            />
          </label>

          <label class="field field-wide">
            <span>
              地址
            </span>

            <input
              v-model="form.address"
              type="text"
              maxlength="250"
              placeholder="請輸入公司或營業地址"
            />
          </label>
        </div>
      </section>

      <!-- ============================= -->
      <!-- 公司與稅務資料 -->
      <!-- ============================= -->

      <section class="form-card">
        <div class="section-heading">
          <div>
            <h2>
              公司與稅務資料
            </h2>

            <p>
              修改營業執照、統一編號或稅務資訊。
            </p>
          </div>
        </div>

        <div class="form-grid">
          <label class="field">
            <span>
              營業執照／登記編號
            </span>

            <input
              v-model="form.businessLicenseNo"
              type="text"
              maxlength="100"
              placeholder="請輸入登記編號"
            />
          </label>

          <label class="field">
            <span>
              稅務編號
            </span>

            <input
              v-model="form.taxNo"
              type="text"
              maxlength="100"
              placeholder="統一編號／稅號"
            />
          </label>
        </div>
      </section>

      <!-- ============================= -->
      <!-- 品牌資訊 -->
      <!-- ============================= -->

      <section class="form-card">
        <div class="section-heading">
          <div>
            <h2>
              品牌資訊
            </h2>

            <p>
              Logo 與商家封面必須使用可公開存取的圖片網址。
            </p>
          </div>
        </div>

        <div class="form-grid">
          <label class="field field-wide">
            <span>
              Logo URL
            </span>

            <input
              v-model="form.logoUrl"
              type="url"
              maxlength="500"
              placeholder="https://example.com/logo.png"
            />

            <small class="field-help">
              請填寫圖片本身的網址，例如 .png、.jpg、.jpeg、.webp，
              不要填寫品牌首頁網址。
            </small>
          </label>

          <div
            v-if="form.logoUrl"
            class="preview-block field-wide"
          >
            <span class="preview-label">
              Logo 預覽
            </span>

            <div class="logo-preview">
              <img
                :src="form.logoUrl"
                alt="商家 Logo 預覽"
                @error="handleLogoError"
                @load="handleLogoLoad"
              />
            </div>

            <p
              v-if="logoPreviewError"
              class="preview-error"
            >
              Logo 圖片無法載入。請確認網址是否為可公開存取的圖片 URL。
            </p>
          </div>

          <label class="field field-wide">
            <span>
              商家封面 URL
            </span>

            <input
              v-model="form.coverImageUrl"
              type="url"
              maxlength="500"
              placeholder="https://example.com/cover.jpg"
            />

            <small class="field-help">
              建議使用橫式圖片，作為商家頁面封面。
            </small>
          </label>

          <div
            v-if="form.coverImageUrl"
            class="preview-block field-wide"
          >
            <span class="preview-label">
              商家封面預覽
            </span>

            <div class="cover-preview">
              <img
                :src="form.coverImageUrl"
                alt="商家封面預覽"
                @error="handleCoverError"
                @load="handleCoverLoad"
              />
            </div>

            <p
              v-if="coverPreviewError"
              class="preview-error"
            >
              商家封面無法載入。請確認網址是否為可公開存取的圖片 URL。
            </p>
          </div>

          <label class="field field-wide">
            <span>
              商家官網／上架網址
            </span>

            <input
              v-model="form.websiteUrl"
              type="url"
              maxlength="500"
              placeholder="https://example.com"
            />

            <small class="field-help">
              這裡可以填品牌官網、官方商城或正式商品上架頁面。
            </small>
          </label>

          <label class="field field-wide">
            <span>
              商家介紹
            </span>

            <textarea
              v-model="form.description"
              rows="6"
              maxlength="2000"
              placeholder="請輸入商家簡介、品牌介紹、經營項目或其他說明"
            />
          </label>
        </div>
      </section>

      <!-- ============================= -->
      <!-- 訊息 -->
      <!-- ============================= -->

      <div
        v-if="errorMessage"
        class="message error-message"
      >
        {{ errorMessage }}
      </div>

      <div
        v-if="successMessage"
        class="message success-message"
      >
        {{ successMessage }}
      </div>

      <!-- ============================= -->
      <!-- 操作 -->
      <!-- ============================= -->

      <div class="form-actions">
        <button
          type="button"
          class="secondary-button"
          :disabled="submitting"
          @click="handleBack"
        >
          取消
        </button>

        <button
          type="submit"
          class="primary-button"
          :disabled="submitting"
        >
          {{
            submitting
              ? '儲存中...'
              : '儲存修改'
          }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  onMounted,
  reactive,
  ref,
} from 'vue'

import {
  useRoute,
  useRouter,
} from 'vue-router'

import {
  updateMerchantProfile,
} from '../../api/merchant'

import {
  useMerchantStore,
} from '../../stores/merchant'

import type {
  MerchantUpdateInput,
} from '../../types/merchant'

const route =
  useRoute()

const router =
  useRouter()

const store =
  useMerchantStore()

const loading =
  ref(true)

const submitting =
  ref(false)

const loadError =
  ref('')

const errorMessage =
  ref('')

const successMessage =
  ref('')

const logoPreviewError =
  ref(false)

const coverPreviewError =
  ref(false)

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

const form =
  reactive<MerchantUpdateInput>({
    merchantId:
      '',

    name:
      '',

    legalName:
      '',

    merchantType:
      'company',

    market:
      'taiwan',

    contactName:
      '',

    contactPhone:
      '',

    contactEmail:
      '',

    businessLicenseNo:
      '',

    taxNo:
      '',

    address:
      '',

    logoUrl:
      '',

    coverImageUrl:
      '',

    websiteUrl:
      '',

    description:
      '',
  })

function populateForm(): void {
  const value =
    merchant.value

  if (!value) {
    return
  }

  form.merchantId =
    value.id

  form.name =
    value.name

  form.legalName =
    value.legalName ?? ''

  form.merchantType =
    value.merchantType

  form.market =
    value.market

  form.contactName =
    value.contactName ?? ''

  form.contactPhone =
    value.contactPhone ?? ''

  form.contactEmail =
    value.contactEmail ?? ''

  form.businessLicenseNo =
    value.businessLicenseNo ?? ''

  form.taxNo =
    value.taxNo ?? ''

  form.address =
    value.address ?? ''

  form.logoUrl =
    value.logoUrl ?? ''

  form.coverImageUrl =
    value.coverImageUrl ?? ''

  form.websiteUrl =
    value.websiteUrl ?? ''

  form.description =
    value.description ?? ''
}

async function loadMerchant():
  Promise<void> {
  loadError.value =
    ''

  if (!merchantId.value) {
    loadError.value =
      '缺少商家 ID。'

    loading.value =
      false

    return
  }

  loading.value =
    true

  try {
    await store.fetchMerchantById(
      merchantId.value,
    )

    if (!store.currentMerchant) {
      loadError.value =
        '找不到商家資料。'

      return
    }

    populateForm()
  } catch (errorValue) {
    loadError.value =
      errorValue instanceof Error
        ? errorValue.message
        : '載入商家資料失敗。'
  } finally {
    loading.value =
      false
  }
}

function handleBack(): void {
  if (!merchantId.value) {
    router.push(
      '/merchants',
    )

    return
  }

  router.push(
    `/merchants/${merchantId.value}`,
  )
}

function handleLogoError(): void {
  logoPreviewError.value =
    true
}

function handleLogoLoad(): void {
  logoPreviewError.value =
    false
}

function handleCoverError(): void {
  coverPreviewError.value =
    true
}

function handleCoverLoad(): void {
  coverPreviewError.value =
    false
}

async function handleSubmit():
  Promise<void> {
  errorMessage.value =
    ''

  successMessage.value =
    ''

  const normalizedName =
    form.name.trim()

  if (!normalizedName) {
    errorMessage.value =
      '請輸入商家名稱。'

    return
  }

  if (!merchantId.value) {
    errorMessage.value =
      '缺少商家 ID，無法更新。'

    return
  }

  submitting.value =
    true

  try {
    const result =
      await updateMerchantProfile({
        ...form,

        merchantId:
          merchantId.value,

        name:
          normalizedName,

        legalName:
          form.legalName?.trim() ||
          null,

        contactName:
          form.contactName?.trim() ||
          null,

        contactPhone:
          form.contactPhone?.trim() ||
          null,

        contactEmail:
          form.contactEmail?.trim() ||
          null,

        businessLicenseNo:
          form.businessLicenseNo?.trim() ||
          null,

        taxNo:
          form.taxNo?.trim() ||
          null,

        address:
          form.address?.trim() ||
          null,

        logoUrl:
          form.logoUrl?.trim() ||
          null,

        coverImageUrl:
          form.coverImageUrl?.trim() ||
          null,

        websiteUrl:
          form.websiteUrl?.trim() ||
          null,

        description:
          form.description?.trim() ||
          null,
      })

    if (
      !result.success ||
      !result.merchant
    ) {
      errorMessage.value =
        result.error ||
        result.message ||
        '商家資料更新失敗。'

      return
    }

    successMessage.value =
      '商家資料更新成功。'

    await store.fetchMerchantById(
      result.merchant.id,
    )

    await router.push(
      `/merchants/${result.merchant.id}`,
    )
  } catch (errorValue) {
    errorMessage.value =
      errorValue instanceof Error
        ? errorValue.message
        : '商家資料更新失敗。'
  } finally {
    submitting.value =
      false
  }
}

onMounted(
  loadMerchant,
)
</script>

<style scoped>
.merchant-edit-page {
  display: grid;
  gap: 24px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
}

.page-eyebrow {
  margin: 0 0 6px;
  font-size: 13px;
  font-weight: 700;
  color: #64748b;
}

.page-header h1 {
  margin: 0;
  font-size: 30px;
  color: #0f172a;
}

.page-description {
  max-width: 760px;
  margin: 10px 0 0;
  color: #64748b;
  line-height: 1.7;
}

.merchant-form {
  display: grid;
  gap: 20px;
}

.form-card,
.notice-card {
  padding: 24px;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  background: #ffffff;
}

.section-heading {
  margin-bottom: 20px;
}

.section-heading h2 {
  margin: 0;
  font-size: 20px;
  color: #0f172a;
}

.section-heading p {
  margin: 6px 0 0;
  color: #64748b;
  line-height: 1.6;
}

.form-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.field {
  display: grid;
  gap: 8px;
}

.field-wide {
  grid-column: 1 / -1;
}

.field span {
  font-weight: 600;
  color: #334155;
}

.field b {
  color: #dc2626;
}

.field-help {
  color: #64748b;
  line-height: 1.6;
}

input,
select,
textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 12px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  outline: none;
  background: #ffffff;
  color: #0f172a;
  font: inherit;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

input:focus,
select:focus,
textarea:focus {
  border-color: #2563eb;
  box-shadow:
    0 0 0 3px
    rgba(37, 99, 235, 0.1);
}

input:disabled {
  background: #f8fafc;
  color: #64748b;
  cursor: not-allowed;
}

textarea {
  min-height: 140px;
  resize: vertical;
}

.preview-block {
  display: grid;
  gap: 10px;
}

.preview-label {
  font-weight: 600;
  color: #334155;
}

.logo-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 160px;
  height: 100px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
}

.logo-preview img {
  display: block;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.cover-preview {
  width: 100%;
  max-width: 720px;
  height: 260px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #f8fafc;
}

.cover-preview img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-error {
  margin: 0;
  color: #b91c1c;
  font-size: 14px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-bottom: 20px;
}

.primary-button,
.secondary-button {
  min-height: 42px;
  padding: 0 18px;
  border-radius: 10px;
  font-weight: 700;
  font: inherit;
  cursor: pointer;
}

.primary-button {
  border: 1px solid #2563eb;
  background: #2563eb;
  color: #ffffff;
}

.primary-button:hover:not(:disabled) {
  background: #1d4ed8;
}

.secondary-button {
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #334155;
}

.secondary-button:hover:not(:disabled) {
  background: #f8fafc;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.message,
.error-notice {
  padding: 14px 16px;
  border-radius: 10px;
}

.error-message,
.error-notice {
  border: 1px solid #fecaca;
  background: #fef2f2;
  color: #b91c1c;
}

.success-message {
  border: 1px solid #bbf7d0;
  background: #f0fdf4;
  color: #15803d;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .field-wide {
    grid-column: auto;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .primary-button,
  .secondary-button {
    width: 100%;
  }

  .cover-preview {
    height: 200px;
  }
}
</style>