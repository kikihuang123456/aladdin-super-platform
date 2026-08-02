<template>
  <AdminLayout>
    <div class="member-create-page">
      <section class="page-header">
        <div>
          <p class="page-eyebrow">
            MEMBER CREATION
          </p>

          <h1>
            新增會員
          </h1>

          <p class="page-description">
            建立正式會員資料、會員等級、帳號狀態與聯絡資訊。
          </p>
        </div>

        <button
          class="secondary-button"
          type="button"
          :disabled="isSubmitting"
          @click="handleCancel"
        >
          返回會員列表
        </button>
      </section>

      <section
        v-if="formError"
        class="error-panel"
        role="alert"
      >
        <div>
          <strong>
            會員資料建立失敗
          </strong>

          <p>
            {{ formError }}
          </p>
        </div>

        <button
          class="error-panel__button"
          type="button"
          @click="clearFormError"
        >
          關閉
        </button>
      </section>

      <section
        v-if="successMessage"
        class="success-panel"
        role="status"
      >
        <div>
          <strong>
            會員資料建立成功
          </strong>

          <p>
            {{ successMessage }}
          </p>
        </div>
      </section>

      <form
        class="member-form"
        novalidate
        @submit.prevent="handleSubmit"
      >
        <section class="form-card">
          <div class="form-card__header">
            <div>
              <p class="form-card__eyebrow">
                BASIC INFORMATION
              </p>

              <h2>
                基本資料
              </h2>

              <p>
                建立會員編號、姓名、Email 與手機號碼。
              </p>
            </div>

            <span class="section-badge">
              必填
            </span>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label for="member-code">
                會員編號
                <span class="required-mark">*</span>
              </label>

              <input
                id="member-code"
                v-model.trim="form.memberCode"
                class="form-input"
                :class="{
                  'form-input--error':
                    Boolean(fieldErrors.memberCode),
                }"
                type="text"
                maxlength="50"
                autocomplete="off"
                placeholder="例如：ALD-100002"
                :disabled="isSubmitting"
                @input="clearFieldError('memberCode')"
              >

              <p
                v-if="fieldErrors.memberCode"
                class="field-error"
              >
                {{ fieldErrors.memberCode }}
              </p>

              <p
                v-else
                class="field-help"
              >
                會員編號不可重複，建議使用 ALD-流水號格式。
              </p>
            </div>

            <div class="form-group">
              <label for="member-name">
                會員姓名
                <span class="required-mark">*</span>
              </label>

              <input
                id="member-name"
                v-model.trim="form.name"
                class="form-input"
                :class="{
                  'form-input--error':
                    Boolean(fieldErrors.name),
                }"
                type="text"
                maxlength="100"
                autocomplete="name"
                placeholder="請輸入會員姓名"
                :disabled="isSubmitting"
                @input="clearFieldError('name')"
              >

              <p
                v-if="fieldErrors.name"
                class="field-error"
              >
                {{ fieldErrors.name }}
              </p>

              <p
                v-else
                class="field-help"
              >
                請輸入會員正式姓名或對外顯示名稱。
              </p>
            </div>

            <div class="form-group">
              <label for="member-email">
                電子郵件
                <span class="required-mark">*</span>
              </label>

              <input
                id="member-email"
                v-model.trim="form.email"
                class="form-input"
                :class="{
                  'form-input--error':
                    Boolean(fieldErrors.email),
                }"
                type="email"
                maxlength="160"
                autocomplete="email"
                placeholder="name@example.com"
                :disabled="isSubmitting"
                @input="clearFieldError('email')"
              >

              <p
                v-if="fieldErrors.email"
                class="field-error"
              >
                {{ fieldErrors.email }}
              </p>

              <p
                v-else
                class="field-help"
              >
                此 Email 將作為會員主要聯絡信箱。
              </p>
            </div>

            <div class="form-group">
              <label for="member-phone">
                手機號碼
              </label>

              <input
                id="member-phone"
                v-model.trim="form.phone"
                class="form-input"
                :class="{
                  'form-input--error':
                    Boolean(fieldErrors.phone),
                }"
                type="tel"
                maxlength="30"
                autocomplete="tel"
                placeholder="台灣或中國大陸手機號碼"
                :disabled="isSubmitting"
                @input="clearFieldError('phone')"
              >

              <p
                v-if="fieldErrors.phone"
                class="field-error"
              >
                {{ fieldErrors.phone }}
              </p>

              <p
                v-else
                class="field-help"
              >
                可填寫國碼，例如：+886 或 +86。
              </p>
            </div>
          </div>
        </section>

        <section class="form-card">
          <div class="form-card__header">
            <div>
              <p class="form-card__eyebrow">
                MEMBER SETTINGS
              </p>

              <h2>
                會員設定
              </h2>

              <p>
                設定會員等級、狀態與市場屬性。
              </p>
            </div>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label for="member-level">
                會員等級
                <span class="required-mark">*</span>
              </label>

              <select
                id="member-level"
                v-model.number="form.level"
                class="form-select"
                :class="{
                  'form-input--error':
                    Boolean(fieldErrors.level),
                }"
                :disabled="isSubmitting"
                @change="clearFieldError('level')"
              >
                <option :value="1">
                  Level 1－一般會員
                </option>

                <option :value="2">
                  Level 2－白銀會員
                </option>

                <option :value="3">
                  Level 3－黃金會員
                </option>

                <option :value="4">
                  Level 4－白金會員
                </option>

                <option :value="5">
                  Level 5－鑽石會員
                </option>

                <option :value="6">
                  Level 6－VIP 會員
                </option>
              </select>

              <p
                v-if="fieldErrors.level"
                class="field-error"
              >
                {{ fieldErrors.level }}
              </p>

              <p
                v-else
                class="field-help"
              >
                會員等級會影響後續權益與平台活動資格。
              </p>
            </div>

            <div class="form-group">
              <label for="member-status">
                帳號狀態
                <span class="required-mark">*</span>
              </label>

              <select
                id="member-status"
                v-model="form.status"
                class="form-select"
                :class="{
                  'form-input--error':
                    Boolean(fieldErrors.status),
                }"
                :disabled="isSubmitting"
                @change="clearFieldError('status')"
              >
                <option value="active">
                  正常
                </option>

                <option value="pending">
                  待審核
                </option>

                <option value="disabled">
                  停用
                </option>

                <option value="suspended">
                  暫停
                </option>
              </select>

              <p
                v-if="fieldErrors.status"
                class="field-error"
              >
                {{ fieldErrors.status }}
              </p>

              <p
                v-else
                class="field-help"
              >
                建立後可於會員編輯頁再次調整。
              </p>
            </div>

            <div class="form-group">
              <label for="member-market">
                所屬市場
              </label>

              <select
                id="member-market"
                v-model="form.market"
                class="form-select"
                :disabled="isSubmitting"
              >
                <option value="taiwan">
                  台灣市場
                </option>

                <option value="china">
                  中國大陸市場
                </option>

                <option value="global">
                  全球／未指定
                </option>
              </select>

              <p class="field-help">
                目前市場欄位先保留於前端，後續資料表擴充後正式寫入。
              </p>
            </div>

            <div class="form-group">
              <label for="member-avatar">
                頭像網址
              </label>

              <input
                id="member-avatar"
                v-model.trim="form.avatarUrl"
                class="form-input"
                :class="{
                  'form-input--error':
                    Boolean(fieldErrors.avatarUrl),
                }"
                type="url"
                maxlength="500"
                autocomplete="off"
                placeholder="https://example.com/avatar.jpg"
                :disabled="isSubmitting"
                @input="clearFieldError('avatarUrl')"
              >

              <p
                v-if="fieldErrors.avatarUrl"
                class="field-error"
              >
                {{ fieldErrors.avatarUrl }}
              </p>

              <p
                v-else
                class="field-help"
              >
                可先填寫圖片網址，後續再升級為 Supabase Storage 上傳。
              </p>
            </div>
          </div>
        </section>

        <section class="form-card">
          <div class="form-card__header">
            <div>
              <p class="form-card__eyebrow">
                PREVIEW
              </p>

              <h2>
                建立預覽
              </h2>

              <p>
                送出前確認會員資料是否正確。
              </p>
            </div>
          </div>

          <div class="member-preview">
            <div class="preview-avatar">
              <img
                v-if="form.avatarUrl"
                :src="form.avatarUrl"
                :alt="form.name || '會員頭像'"
                @error="handleAvatarError"
              >

              <span v-else>
                {{ memberInitial }}
              </span>
            </div>

            <div class="preview-content">
              <strong>
                {{ form.name || '尚未輸入會員姓名' }}
              </strong>

              <span>
                {{ form.memberCode || '尚未輸入會員編號' }}
              </span>

              <small>
                {{ levelLabel }}
                ·
                {{ statusLabel }}
                ·
                {{ marketLabel }}
              </small>
            </div>
          </div>
        </section>

        <footer class="form-actions">
          <div>
            <strong>
              建立前請再次確認資料
            </strong>

            <p>
              建立完成後，會員資料會直接寫入 Supabase 正式 members 資料表。
            </p>
          </div>

          <div class="form-actions__buttons">
            <button
              class="secondary-button"
              type="button"
              :disabled="isSubmitting"
              @click="handleReset"
            >
              清除重填
            </button>

            <button
              class="secondary-button"
              type="button"
              :disabled="isSubmitting"
              @click="handleCancel"
            >
              取消
            </button>

            <button
              class="primary-button submit-button"
              type="submit"
              :disabled="isSubmitting"
            >
              <span
                v-if="isSubmitting"
                class="button-spinner"
                aria-hidden="true"
              />

              {{
                isSubmitting
                  ? '建立中...'
                  : '建立會員'
              }}
            </button>
          </div>
        </footer>
      </form>
    </div>
  </AdminLayout>
</template>
<script setup lang="ts">
import {
  computed,
  reactive,
  ref,
} from 'vue'

import {
  useRouter,
} from 'vue-router'

import AdminLayout from '../../layouts/AdminLayout.vue'

import {
  createMember,
} from '../../api/member'

import {
  useMemberStore,
} from '../../stores/member'

import type {
  MemberMarket,
  MemberStatus,
} from '../../types/member'

type MemberFormField =
  | 'memberCode'
  | 'name'
  | 'email'
  | 'phone'
  | 'level'
  | 'status'
  | 'avatarUrl'

interface MemberCreateForm {
  memberCode: string
  name: string
  email: string
  phone: string
  level: number
  status: MemberStatus
  market: MemberMarket
  avatarUrl: string
}

type MemberFieldErrors =
  Partial<
    Record<
      MemberFormField,
      string
    >
  >

const router = useRouter()

const memberStore =
  useMemberStore()

const isSubmitting =
  ref(false)

const formError =
  ref<string | null>(null)

const successMessage =
  ref<string | null>(null)

const fieldErrors =
  reactive<MemberFieldErrors>({})

function createInitialForm():
  MemberCreateForm {
  return {
    memberCode:
      generateMemberCode(),

    name: '',
    email: '',
    phone: '',
    level: 1,
    status: 'active',
    market: 'global',
    avatarUrl: '',
  }
}

const form =
  reactive<MemberCreateForm>(
    createInitialForm(),
  )

const memberInitial = computed(() => {
  const normalizedName =
    form.name.trim()

  if (!normalizedName) {
    return '新'
  }

  return normalizedName.slice(0, 1)
})

const levelLabel = computed(() => {
  switch (form.level) {
    case 1:
      return '一般會員'

    case 2:
      return '白銀會員'

    case 3:
      return '黃金會員'

    case 4:
      return '白金會員'

    case 5:
      return '鑽石會員'

    case 6:
      return 'VIP 會員'

    default:
      return '未設定等級'
  }
})

const statusLabel = computed(() => {
  switch (form.status) {
    case 'active':
      return '正常'

    case 'pending':
      return '待審核'

    case 'disabled':
      return '停用'

    case 'suspended':
      return '暫停'

    case 'deleted':
      return '已刪除'

    default:
      return '未知狀態'
  }
})

const marketLabel = computed(() => {
  switch (form.market) {
    case 'taiwan':
      return '台灣市場'

    case 'china':
      return '中國大陸市場'

    case 'global':
      return '全球／未指定'

    default:
      return '未指定市場'
  }
})

function generateMemberCode():
  string {
  const now = new Date()

  const year =
    String(
      now.getFullYear(),
    ).slice(-2)

  const month =
    String(
      now.getMonth() + 1,
    ).padStart(
      2,
      '0',
    )

  const day =
    String(
      now.getDate(),
    ).padStart(
      2,
      '0',
    )

  const hours =
    String(
      now.getHours(),
    ).padStart(
      2,
      '0',
    )

  const minutes =
    String(
      now.getMinutes(),
    ).padStart(
      2,
      '0',
    )

  const seconds =
    String(
      now.getSeconds(),
    ).padStart(
      2,
      '0',
    )

  return [
    'ALD',
    year,
    month,
    day,
    hours,
    minutes,
    seconds,
  ].join('-')
}

function clearFieldError(
  field: MemberFormField,
): void {
  delete fieldErrors[field]
  formError.value = null
  successMessage.value = null
}

function clearAllFieldErrors():
  void {
  const fields =
    Object.keys(
      fieldErrors,
    ) as MemberFormField[]

  for (const field of fields) {
    delete fieldErrors[field]
  }
}

function clearFormError():
  void {
  formError.value = null
}

function isValidEmail(
  value: string,
): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    value,
  )
}

function isValidPhone(
  value: string,
): boolean {
  return /^[+()\d\s-]{7,30}$/.test(
    value,
  )
}

function isValidUrl(
  value: string,
): boolean {
  try {
    const url =
      new URL(value)

    return (
      url.protocol === 'http:' ||
      url.protocol === 'https:'
    )
  } catch {
    return false
  }
}

function validateForm():
  boolean {
  clearAllFieldErrors()
  formError.value = null
  successMessage.value = null

  const memberCode =
    form.memberCode.trim()

  const name =
    form.name.trim()

  const email =
    form.email.trim()

  const phone =
    form.phone.trim()

  const avatarUrl =
    form.avatarUrl.trim()

  if (!memberCode) {
    fieldErrors.memberCode =
      '請輸入會員編號。'
  } else if (
    memberCode.length < 4
  ) {
    fieldErrors.memberCode =
      '會員編號至少需要 4 個字元。'
  } else if (
    !/^[A-Za-z0-9_-]+$/.test(
      memberCode,
    )
  ) {
    fieldErrors.memberCode =
      '會員編號只能使用英文字母、數字、連字號與底線。'
  }

  if (!name) {
    fieldErrors.name =
      '請輸入會員姓名。'
  } else if (
    name.length < 2
  ) {
    fieldErrors.name =
      '會員姓名至少需要 2 個字元。'
  }

  if (!email) {
    fieldErrors.email =
      '請輸入電子郵件。'
  } else if (
    !isValidEmail(email)
  ) {
    fieldErrors.email =
      '電子郵件格式不正確。'
  }

  if (
    phone &&
    !isValidPhone(phone)
  ) {
    fieldErrors.phone =
      '手機號碼格式不正確。'
  }

  if (
    !Number.isInteger(
      form.level,
    ) ||
    form.level < 1 ||
    form.level > 6
  ) {
    fieldErrors.level =
      '會員等級必須介於 1 至 6。'
  }

  const validStatuses:
    MemberStatus[] = [
      'active',
      'pending',
      'disabled',
      'suspended',
    ]

  if (
    !validStatuses.includes(
      form.status,
    )
  ) {
    fieldErrors.status =
      '請選擇有效的會員狀態。'
  }

  if (
    avatarUrl &&
    !isValidUrl(avatarUrl)
  ) {
    fieldErrors.avatarUrl =
      '頭像網址必須是有效的 HTTP 或 HTTPS 網址。'
  }

  return (
    Object.keys(
      fieldErrors,
    ).length === 0
  )
}

function scrollToPageTop():
  void {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

function handleAvatarError():
  void {
  fieldErrors.avatarUrl =
    '頭像圖片無法載入，請確認網址是否正確。'
}

function handleReset():
  void {
  if (isSubmitting.value) {
    return
  }

  const confirmed =
    window.confirm(
      '確定要清除目前已輸入的會員資料嗎？',
    )

  if (!confirmed) {
    return
  }

  Object.assign(
    form,
    createInitialForm(),
  )

  clearAllFieldErrors()

  formError.value = null
  successMessage.value = null

  scrollToPageTop()
}

function handleCancel():
  void {
  if (isSubmitting.value) {
    return
  }

  router.push(
    '/members',
  )
}

function wait(
  milliseconds: number,
): Promise<void> {
  return new Promise(
    (resolve) => {
      window.setTimeout(
        resolve,
        milliseconds,
      )
    },
  )
}

async function handleSubmit():
  Promise<void> {
  if (isSubmitting.value) {
    return
  }

  const isValid =
    validateForm()

  if (!isValid) {
    formError.value =
      '請檢查表單中的必填欄位與格式。'

    scrollToPageTop()

    return
  }

  isSubmitting.value = true
  formError.value = null
  successMessage.value = null

  try {
    const response =
      await createMember({
        memberCode:
          form.memberCode.trim(),

        name:
          form.name.trim(),

        email:
          form.email
            .trim()
            .toLowerCase(),

        phone:
          form.phone.trim(),

        avatarUrl:
          form.avatarUrl.trim() ||
          null,

        level:
          form.level,

        status:
          form.status,
      })

    if (!response.success) {
      throw new Error(
        response.error ||
        response.message ||
        '會員資料建立失敗。',
      )
    }

    successMessage.value =
      `會員「${form.name.trim()}」已成功建立。`

    await memberStore.refreshMembers()

    scrollToPageTop()

    await wait(700)

    await router.push(
      '/members',
    )
  } catch (caughtError) {
    formError.value =
      caughtError instanceof Error
        ? caughtError.message
        : '會員資料建立發生未知錯誤。'

    scrollToPageTop()
  } finally {
    isSubmitting.value = false
  }
}
</script>
<style scoped>
.member-create-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* =========================================================
 * Page Header
 * ======================================================= */

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
}

.page-header > div {
  min-width: 0;
}

.page-header h1 {
  margin: 4px 0 8px;
  color: #0f172a;
  font-size: 34px;
  font-weight: 800;
  line-height: 1.2;
}

.page-eyebrow {
  margin: 0;
  color: #3157d6;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.page-description {
  margin: 0;
  color: #64748b;
  font-size: 15px;
  line-height: 1.7;
}

/* =========================================================
 * Shared Buttons
 * ======================================================= */

.primary-button,
.secondary-button,
.error-panel__button {
  min-height: 42px;
  border-radius: 10px;
  cursor: pointer;
  font: inherit;
  font-size: 14px;
  font-weight: 700;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease,
    box-shadow 0.2s ease,
    opacity 0.2s ease,
    transform 0.2s ease;
}

.primary-button {
  padding: 0 20px;
  border: 1px solid #3157d6;
  background: #3157d6;
  color: #ffffff;
}

.primary-button:hover:not(:disabled) {
  border-color: #2547bd;
  background: #2547bd;
  transform: translateY(-1px);
}

.secondary-button {
  padding: 0 18px;
  border: 1px solid #dbe2ea;
  background: #ffffff;
  color: #334155;
}

.secondary-button:hover:not(:disabled) {
  border-color: #bac5d4;
  background: #f8fafc;
  color: #0f172a;
}

.primary-button:disabled,
.secondary-button:disabled,
.error-panel__button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
  transform: none;
}

/* =========================================================
 * Feedback Panels
 * ======================================================= */

.error-panel,
.success-panel {
  display: flex;
  padding: 18px 20px;
  border-radius: 14px;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.error-panel {
  border: 1px solid #fecaca;
  background: #fef2f2;
}

.success-panel {
  border: 1px solid #bbf7d0;
  background: #f0fdf4;
}

.error-panel strong {
  color: #991b1b;
  font-size: 15px;
}

.success-panel strong {
  color: #166534;
  font-size: 15px;
}

.error-panel p,
.success-panel p {
  margin: 5px 0 0;
  font-size: 13px;
  line-height: 1.6;
}

.error-panel p {
  color: #b91c1c;
}

.success-panel p {
  color: #15803d;
}

.error-panel__button {
  flex-shrink: 0;
  padding: 0 16px;
  border: 1px solid #ef4444;
  background: #ffffff;
  color: #b91c1c;
}

.error-panel__button:hover:not(:disabled) {
  background: #fee2e2;
}

/* =========================================================
 * Form Layout
 * ======================================================= */

.member-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-card {
  overflow: hidden;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  background: #ffffff;
  box-shadow:
    0 10px 25px
    rgba(15, 23, 42, 0.05);
}

.form-card__header {
  display: flex;
  padding: 22px 24px;
  border-bottom: 1px solid #e5e7eb;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  background: #ffffff;
}

.form-card__header > div {
  min-width: 0;
}

.form-card__header h2 {
  margin: 4px 0 7px;
  color: #0f172a;
  font-size: 21px;
  font-weight: 800;
}

.form-card__header p:not(.form-card__eyebrow) {
  margin: 0;
  color: #94a3b8;
  font-size: 13px;
  line-height: 1.6;
}

.form-card__eyebrow {
  margin: 0;
  color: #3157d6;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.section-badge {
  display: inline-flex;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  align-items: center;
  justify-content: center;
  background: #fee2e2;
  color: #b91c1c;
  font-size: 11px;
  font-weight: 800;
}

/* =========================================================
 * Form Grid
 * ======================================================= */

.form-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 22px;
  padding: 24px;
}

.form-group {
  display: flex;
  min-width: 0;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 8px;
  color: #334155;
  font-size: 13px;
  font-weight: 800;
}

.required-mark {
  margin-left: 3px;
  color: #dc2626;
}

.form-input,
.form-select {
  width: 100%;
  min-height: 46px;
  padding: 0 14px;
  border: 1px solid #dbe2ea;
  border-radius: 11px;
  background: #ffffff;
  color: #0f172a;
  font: inherit;
  font-size: 14px;
  outline: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease;
}

.form-select {
  padding-right: 36px;
  cursor: pointer;
}

.form-input::placeholder {
  color: #94a3b8;
}

.form-input:focus,
.form-select:focus {
  border-color: #3157d6;
  box-shadow:
    0 0 0 3px
    rgba(49, 87, 214, 0.12);
}

.form-input:disabled,
.form-select:disabled {
  cursor: not-allowed;
  background: #f8fafc;
  color: #94a3b8;
}

.form-input--error {
  border-color: #ef4444;
  box-shadow:
    0 0 0 3px
    rgba(239, 68, 68, 0.08);
}

.field-help,
.field-error {
  margin: 7px 0 0;
  font-size: 12px;
  line-height: 1.55;
}

.field-help {
  color: #94a3b8;
}

.field-error {
  color: #dc2626;
  font-weight: 700;
}

/* =========================================================
 * Member Preview
 * ======================================================= */

.member-preview {
  display: flex;
  padding: 24px;
  align-items: center;
  gap: 18px;
}

.preview-avatar {
  display: grid;
  width: 76px;
  height: 76px;
  flex-shrink: 0;
  overflow: hidden;
  place-items: center;
  border: 1px solid #e0e7ff;
  border-radius: 22px;
  background: #eef2ff;
  color: #3157d6;
  font-size: 26px;
  font-weight: 900;
}

.preview-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-content {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 5px;
}

.preview-content strong {
  overflow: hidden;
  color: #0f172a;
  font-size: 20px;
  font-weight: 900;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.preview-content span {
  color: #475569;
  font-size: 14px;
  font-weight: 700;
}

.preview-content small {
  color: #94a3b8;
  font-size: 13px;
  line-height: 1.6;
}

/* =========================================================
 * Form Actions
 * ======================================================= */

.form-actions {
  display: flex;
  min-height: 94px;
  padding: 20px 24px;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  background: #ffffff;
  box-shadow:
    0 10px 25px
    rgba(15, 23, 42, 0.05);
}

.form-actions > div:first-child {
  min-width: 0;
}

.form-actions strong {
  color: #0f172a;
  font-size: 14px;
  font-weight: 800;
}

.form-actions p {
  margin: 5px 0 0;
  color: #94a3b8;
  font-size: 12px;
  line-height: 1.6;
}

.form-actions__buttons {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 10px;
}

.submit-button {
  display: inline-flex;
  min-width: 126px;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.button-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid
    rgba(255, 255, 255, 0.45);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation:
    member-create-spin
    0.8s linear infinite;
}
@keyframes member-create-spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

/* =========================================================
 * Tablet
 * ======================================================= */

@media (max-width: 1200px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .page-header {
    align-items: stretch;
    flex-direction: column;
  }

  .page-header .secondary-button {
    width: fit-content;
  }

  .form-card__header {
    align-items: flex-start;
    flex-direction: column;
  }

  .section-badge {
    align-self: flex-start;
  }

  .form-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .form-actions__buttons {
    width: 100%;
    justify-content: flex-end;
    flex-wrap: wrap;
  }
}

/* =========================================================
 * Mobile
 * ======================================================= */

@media (max-width: 768px) {
  .member-create-page {
    gap: 20px;
  }

  .page-header h1 {
    font-size: 28px;
  }

  .page-description {
    font-size: 14px;
  }

  .form-card__header,
  .form-grid,
  .member-preview,
  .form-actions {
    padding: 18px;
  }

  .member-preview {
    flex-direction: column;
    align-items: flex-start;
  }

  .preview-avatar {
    width: 64px;
    height: 64px;
    border-radius: 18px;
    font-size: 22px;
  }

  .preview-content strong {
    white-space: normal;
    font-size: 18px;
  }

  .preview-content span,
  .preview-content small {
    word-break: break-word;
  }

  .form-actions__buttons {
    flex-direction: column;
    align-items: stretch;
  }

  .primary-button,
  .secondary-button {
    width: 100%;
  }

  .submit-button {
    min-width: auto;
  }
}

/* =========================================================
 * Small Mobile
 * ======================================================= */

@media (max-width: 480px) {
  .page-header h1 {
    font-size: 24px;
  }

  .page-eyebrow,
  .form-card__eyebrow {
    letter-spacing: 0.08em;
  }

  .form-input,
  .form-select {
    font-size: 16px;
  }

  .preview-avatar {
    width: 56px;
    height: 56px;
    font-size: 20px;
  }

  .preview-content strong {
    font-size: 17px;
  }

  .preview-content span {
    font-size: 13px;
  }

  .preview-content small {
    font-size: 12px;
  }

  .error-panel,
  .success-panel {
    align-items: flex-start;
    flex-direction: column;
  }

  .error-panel__button {
    width: 100%;
  }
}
</style>