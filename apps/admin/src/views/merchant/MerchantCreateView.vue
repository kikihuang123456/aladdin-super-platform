<template>
  <div class="merchant-create-page">
    <header class="page-header">
      <div>
        <p class="page-eyebrow">
          Merchant ERP
        </p>

        <h1>
          新增商家
        </h1>

        <p class="page-description">
          建立新的商家資料。商家編號由系統自動產生，
          新增完成後將進入待審核狀態。
        </p>
      </div>

      <button
        type="button"
        class="secondary-button"
        @click="handleBack"
      >
        返回商家列表
      </button>
    </header>

    <div class="status-notice">
      <strong>建立規則</strong>

      <span>
        商家編號由系統自動產生，
        初始狀態固定為「待審核」。
      </span>
    </div>

    <form
      class="merchant-form"
      @submit.prevent="handleSubmit"
    >
      <section class="form-card">
        <div class="section-heading">
          <div>
            <h2>基本資料</h2>

            <p>
              設定商家名稱、類型與所屬市場。
            </p>
          </div>
        </div>

        <div class="form-grid">
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

      <section class="form-card">
        <div class="section-heading">
          <div>
            <h2>聯絡資訊</h2>

            <p>
              商家主要聯絡窗口與聯繫方式。
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

      <section class="form-card">
        <div class="section-heading">
          <div>
            <h2>公司與稅務資料</h2>

            <p>
              填寫營業執照、統一編號或稅務資訊。
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

      <section class="form-card">
        <div class="section-heading">
          <div>
            <h2>品牌資訊</h2>

            <p>
              可填寫品牌 Logo 網址與商家介紹。
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
              placeholder="https://..."
            />
          </label>

          <label class="field field-wide">
            <span>
              商家介紹
            </span>

            <textarea
              v-model="form.description"
              rows="6"
              maxlength="2000"
              placeholder="請輸入商家簡介、經營項目或其他說明"
            />
          </label>
        </div>
      </section>

      <div
        v-if="errorMessage"
        class="message message-error"
      >
        {{ errorMessage }}
      </div>

      <div
        v-if="successMessage"
        class="message message-success"
      >
        {{ successMessage }}
      </div>

      <footer class="form-actions">
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
              ? '建立中...'
              : '建立商家'
          }}
        </button>
      </footer>
    </form>
  </div>
</template>

<script setup lang="ts">
import {
  reactive,
  ref,
} from 'vue'

import {
  useRouter,
} from 'vue-router'

import {
  useMerchantStore,
} from '../../stores/merchant'

import type {
  MerchantCreateInput,
} from '../../types/merchant'

const router =
  useRouter()

const merchantStore =
  useMerchantStore()

const submitting =
  ref(false)

const errorMessage =
  ref('')

const successMessage =
  ref('')

const form =
  reactive<MerchantCreateInput>({
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

    description:
      '',
  })

function handleBack(): void {
  router.push(
    '/merchants',
  )
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

  submitting.value =
    true

  try {
    const result =
      await merchantStore.createMerchant({
        ...form,

        name:
          normalizedName,
      })

    if (!result.success) {
      errorMessage.value =
        result.error ||
        result.message ||
        '商家建立失敗。'

      return
    }

    successMessage.value =
      result.message

    if (
      result.merchant?.id
    ) {
      await router.push(
        `/merchants/${result.merchant.id}`,
      )

      return
    }

    await router.push(
      '/merchants',
    )
  } catch (
    errorValue
  ) {
    errorMessage.value =
      errorValue instanceof Error
        ? errorValue.message
        : '新增商家時發生未知錯誤。'
  } finally {
    submitting.value =
      false
  }
}
</script>

<style scoped>
.merchant-create-page {
  display: grid;
  gap: 20px;
  padding-bottom: 40px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
}

.page-eyebrow {
  margin: 0 0 6px;
  color: #64748b;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.page-header h1 {
  margin: 0;
  color: #0f172a;
  font-size: 28px;
}

.page-description {
  max-width: 680px;
  margin: 8px 0 0;
  color: #64748b;
  line-height: 1.7;
}

.status-notice {
  display: flex;
  gap: 14px;
  padding: 14px 18px;
  border: 1px solid #bae6fd;
  border-radius: 12px;
  background: #f0f9ff;
  color: #0c4a6e;
  font-size: 14px;
}

.merchant-form {
  display: grid;
  gap: 18px;
}

.form-card {
  padding: 22px;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #fff;
}

.section-heading {
  margin-bottom: 20px;
}

.section-heading h2 {
  margin: 0;
  color: #0f172a;
  font-size: 18px;
}

.section-heading p {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 14px;
}

.form-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.field {
  display: grid;
  gap: 8px;
}

.field-wide {
  grid-column:
    1 / -1;
}

.field span {
  color: #334155;
  font-size: 14px;
  font-weight: 700;
}

.field b {
  color: #dc2626;
}

.field input,
.field select,
.field textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 11px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 9px;
  background: #fff;
  color: #0f172a;
  font: inherit;
  outline: none;
}

.field textarea {
  resize: vertical;
}

.field input:focus,
.field select:focus,
.field textarea:focus {
  border-color: #64748b;
  box-shadow:
    0 0 0 3px
    rgb(148 163 184 / 18%);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 4px;
}

.primary-button,
.secondary-button {
  min-height: 42px;
  padding: 9px 18px;
  border-radius: 9px;
  font-weight: 700;
  cursor: pointer;
}

.primary-button {
  border: 1px solid #0f172a;
  background: #0f172a;
  color: #fff;
}

.secondary-button {
  border: 1px solid #cbd5e1;
  background: #fff;
  color: #334155;
}

.primary-button:disabled,
.secondary-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.message {
  padding: 13px 16px;
  border-radius: 10px;
  font-size: 14px;
}

.message-error {
  border: 1px solid #fecaca;
  background: #fef2f2;
  color: #991b1b;
}

.message-success {
  border: 1px solid #bbf7d0;
  background: #f0fdf4;
  color: #166534;
}

@media (max-width: 820px) {
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
}
</style>
