<template>
  <AdminLayout>
    <div class="member-edit-page">
      <section class="page-header">
        <div>
          <p class="page-eyebrow">
            MEMBER EDIT
          </p>

          <h1>
            編輯會員
          </h1>

          <p class="page-description">
            修改會員基本資料、會員等級、帳號狀態與聯絡資訊。
          </p>
        </div>

        <button
          class="secondary-button"
          type="button"
          :disabled="isSubmitting"
          @click="handleBack"
        >
          返回會員詳情
        </button>
      </section>

      <section
        v-if="isLoading"
        class="state-panel"
      >
        <span
          class="loading-spinner"
          aria-hidden="true"
        />

        <strong>
          正在載入會員資料
        </strong>

        <p>
          請稍候，系統正在讀取 Supabase 正式會員資料。
        </p>
      </section>

      <section
        v-else-if="loadError"
        class="state-panel state-panel--error"
        role="alert"
      >
        <strong>
          會員資料載入失敗
        </strong>

        <p>
          {{ loadError }}
        </p>

        <div class="state-panel__actions">
          <button
            class="secondary-button"
            type="button"
            @click="handleBackToList"
          >
            返回會員列表
          </button>

          <button
            class="primary-button"
            type="button"
            @click="loadMember"
          >
            重新載入
          </button>
        </div>
      </section>

      <template v-else>
        <section
          v-if="formError"
          class="feedback-panel feedback-panel--error"
          role="alert"
        >
          <div>
            <strong>
              會員資料更新失敗
            </strong>

            <p>
              {{ formError }}
            </p>
          </div>

          <button
            class="feedback-panel__close"
            type="button"
            @click="clearFormError"
          >
            關閉
          </button>
        </section>

        <section
          v-if="successMessage"
          class="feedback-panel feedback-panel--success"
          role="status"
        >
          <div>
            <strong>
              會員資料更新成功
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
            <header class="form-card__header">
              <div>
                <p class="form-card__eyebrow">
                  MEMBER PROFILE
                </p>

                <h2>
                  基本資料
                </h2>

                <p>
                  修改會員編號、姓名、電子郵件與手機號碼。
                </p>
              </div>

              <span class="section-badge">
                必填資料
              </span>
            </header>

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
                  placeholder="例如：ALD-100001"
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
                  會員編號不可與其他會員重複。
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
                  請填寫會員正式姓名或對外顯示名稱。
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
                  此 Email 為會員主要聯絡信箱。
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
            <header class="form-card__header">
              <div>
                <p class="form-card__eyebrow">
                  MEMBER SETTINGS
                </p>

                <h2>
                  會員設定
                </h2>

                <p>
                  調整會員等級、帳號狀態與頭像資料。
                </p>
              </div>
            </header>

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
                  會員等級會影響後續權益與活動資格。
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
                  停用或暫停後，後續可再次恢復為正常。
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
                  disabled
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
                  現有 members 資料表尚未建立 market 欄位，目前僅供顯示。
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
                  後續可升級為 Supabase Storage 圖片上傳。
                </p>
              </div>
            </div>
          </section>

          <section class="form-card">
            <header class="form-card__header">
              <div>
                <p class="form-card__eyebrow">
                  MEMBER PREVIEW
                </p>

                <h2>
                  修改預覽
                </h2>

                <p>
                  儲存前確認會員資料與帳號設定。
                </p>
              </div>
            </header>

            <div class="member-preview">
              <div class="preview-avatar">
                <img
                  v-if="
                    form.avatarUrl &&
                    !avatarLoadFailed
                  "
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
                  {{ form.name || '尚未設定會員姓名' }}
                </strong>

                <span>
                  {{ form.memberCode || '尚未設定會員編號' }}
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

          <section class="audit-card">
            <div class="audit-item">
              <span>
                會員 ID
              </span>

              <strong>
                {{ memberId || '-' }}
              </strong>
            </div>

            <div class="audit-item">
              <span>
                建立時間
              </span>

              <strong>
                {{ formatDate(originalMember?.createdAt) }}
              </strong>
            </div>

            <div class="audit-item">
              <span>
                最後更新
              </span>

              <strong>
                {{ formatDate(originalMember?.updatedAt) }}
              </strong>
            </div>

            <div class="audit-item">
              <span>
                修改狀態
              </span>

              <strong
                :class="{
                  'audit-status--changed':
                    hasChanges,
                }"
              >
                {{
                  hasChanges
                    ? '已有未儲存修改'
                    : '尚未修改'
                }}
              </strong>
            </div>
          </section>

          <footer class="form-actions">
            <div>
              <strong>
                儲存會員修改
              </strong>

              <p>
                儲存後將直接更新 Supabase 正式 members 資料表。
              </p>
            </div>

            <div class="form-actions__buttons">
              <button
                class="secondary-button"
                type="button"
                :disabled="
                  isSubmitting ||
                  !hasChanges
                "
                @click="handleReset"
              >
                還原修改
              </button>

              <button
                class="secondary-button"
                type="button"
                :disabled="isSubmitting"
                @click="handleBack"
              >
                取消
              </button>

              <button
                class="primary-button submit-button"
                type="submit"
                :disabled="
                  isSubmitting ||
                  !hasChanges
                "
              >
                <span
                  v-if="isSubmitting"
                  class="button-spinner"
                  aria-hidden="true"
                />

                {{
                  isSubmitting
                    ? '儲存中...'
                    : '儲存修改'
                }}
              </button>
            </div>
          </footer>
        </form>
      </template>
    </div>
  </AdminLayout>
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

import AdminLayout from '../../layouts/AdminLayout.vue'

import {
  getMemberById,
  updateMember,
} from '../../api/member'

import {
  useMemberStore,
} from '../../stores/member'

import type {
  MemberListItem,
  MemberMarket,
  MemberStatus,
} from '../../types/member'

type MemberEditField =
  | 'memberCode'
  | 'name'
  | 'email'
  | 'phone'
  | 'level'
  | 'status'
  | 'avatarUrl'

interface MemberEditForm {
  memberCode: string
  name: string
  email: string
  phone: string
  level: number
  status: MemberStatus
  market: MemberMarket
  avatarUrl: string
}

type MemberEditFieldErrors =
  Partial<
    Record<
      MemberEditField,
      string
    >
  >

const route = useRoute()
const router = useRouter()

const memberStore =
  useMemberStore()

const memberId = computed(() => {
  const value =
    route.params.id

  if (Array.isArray(value)) {
    return value[0] ?? ''
  }

  return String(value ?? '')
})

const isLoading =
  ref(true)

const isSubmitting =
  ref(false)

const loadError =
  ref<string | null>(null)

const formError =
  ref<string | null>(null)

const successMessage =
  ref<string | null>(null)

const avatarLoadFailed =
  ref(false)

const originalMember =
  ref<MemberListItem | null>(
    null,
  )

const fieldErrors =
  reactive<MemberEditFieldErrors>({})

const form =
  reactive<MemberEditForm>({
    memberCode: '',
    name: '',
    email: '',
    phone: '',
    level: 1,
    status: 'pending',
    market: 'global',
    avatarUrl: '',
  })

const memberInitial = computed(() => {
  const name =
    form.name.trim()

  if (!name) {
    return '?'
  }

  return name.slice(0, 1)
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

const hasChanges = computed(() => {
  const member =
    originalMember.value

  if (!member) {
    return false
  }

  return (
    form.memberCode.trim() !==
      member.memberCode.trim() ||
    form.name.trim() !==
      member.name.trim() ||
    form.email.trim().toLowerCase() !==
      member.email.trim().toLowerCase() ||
    form.phone.trim() !==
      member.phone.trim() ||
    form.level !==
      member.level ||
    form.status !==
      member.status ||
    form.avatarUrl.trim() !==
      (member.avatarUrl ?? '').trim()
  )
})

function assignMemberToForm(
  member: MemberListItem,
): void {
  originalMember.value =
    member

  form.memberCode =
    member.memberCode

  form.name =
    member.name

  form.email =
    member.email

  form.phone =
    member.phone

  form.level =
    member.level

  form.status =
    member.status

  form.market =
    member.market

  form.avatarUrl =
    member.avatarUrl ?? ''

  avatarLoadFailed.value =
    false
}

function clearAllFieldErrors():
  void {
  const keys =
    Object.keys(
      fieldErrors,
    ) as MemberEditField[]

  for (const key of keys) {
    delete fieldErrors[key]
  }
}

function clearFieldError(
  field: MemberEditField,
): void {
  delete fieldErrors[field]

  formError.value = null
  successMessage.value = null

  if (field === 'avatarUrl') {
    avatarLoadFailed.value =
      false
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

function scrollToTop():
  void {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

function handleAvatarError():
  void {
  avatarLoadFailed.value =
    true

  fieldErrors.avatarUrl =
    '頭像圖片無法載入，請確認網址是否正確。'
}

function formatDate(
  value?: string | null,
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

  return new Intl.DateTimeFormat(
    'zh-TW',
    {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    },
  ).format(date)
}

async function loadMember():
  Promise<void> {
  isLoading.value = true
  loadError.value = null
  formError.value = null
  successMessage.value = null

  clearAllFieldErrors()

  try {
    if (!memberId.value) {
      throw new Error(
        '缺少會員識別碼。',
      )
    }

    const response =
      await getMemberById(
        memberId.value,
      )

    if (
      !response.success ||
      !response.member
    ) {
      throw new Error(
        response.error ||
        response.message ||
        '會員資料載入失敗。',
      )
    }

    assignMemberToForm(
      response.member,
    )
  } catch (caughtError) {
    originalMember.value =
      null

    loadError.value =
      caughtError instanceof Error
        ? caughtError.message
        : '會員資料載入發生未知錯誤。'
  } finally {
    isLoading.value = false
  }
}

function handleReset():
  void {
  if (
    isSubmitting.value ||
    !originalMember.value
  ) {
    return
  }

  const confirmed =
    window.confirm(
      '確定要還原目前尚未儲存的修改嗎？',
    )

  if (!confirmed) {
    return
  }

  assignMemberToForm(
    originalMember.value,
  )

  clearAllFieldErrors()

  formError.value = null
  successMessage.value = null

  scrollToTop()
}

function handleBackToList():
  void {
  router.push(
    '/members',
  )
}

function handleBack():
  void {
  if (
    isSubmitting.value
  ) {
    return
  }

  if (
    hasChanges.value
  ) {
    const confirmed =
      window.confirm(
        '目前有尚未儲存的修改，確定要離開嗎？',
      )

    if (!confirmed) {
      return
    }
  }

  if (!memberId.value) {
    handleBackToList()
    return
  }

  router.push(
    `/members/${memberId.value}`,
  )
}

async function handleSubmit():
  Promise<void> {
  if (
    isSubmitting.value ||
    !originalMember.value
  ) {
    return
  }

  if (!hasChanges.value) {
    formError.value =
      '目前沒有需要儲存的修改。'

    scrollToTop()

    return
  }

  const isValid =
    validateForm()

  if (!isValid) {
    formError.value =
      '請檢查表單中的必填欄位與格式。'

    scrollToTop()

    return
  }

  isSubmitting.value = true
  formError.value = null
  successMessage.value = null

  try {
    const response =
      await updateMember({
        id:
          memberId.value,

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

    if (
      !response.success ||
      !response.member
    ) {
      throw new Error(
        response.error ||
        response.message ||
        '會員資料更新失敗。',
      )
    }

    assignMemberToForm(
      response.member,
    )

    successMessage.value =
      `會員「${response.member.name}」資料已更新。`

    await memberStore.refreshMembers()

    scrollToTop()

    window.setTimeout(() => {
      router.push(
        `/members/${memberId.value}`,
      )
    }, 700)
  } catch (caughtError) {
    formError.value =
      caughtError instanceof Error
        ? caughtError.message
        : '會員資料更新發生未知錯誤。'

    scrollToTop()
  } finally {
    isSubmitting.value = false
  }
}

onMounted(async () => {
  await loadMember()
})
</script>
<style scoped>
.member-edit-page {
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
.feedback-panel__close {
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
  transform: translateY(-1px);
}

.primary-button:disabled,
.secondary-button:disabled,
.feedback-panel__close:disabled {
  cursor: not-allowed;
  opacity: 0.55;
  transform: none;
}

/* =========================================================
 * State Panels
 * ======================================================= */

.state-panel {
  display: flex;
  min-height: 320px;
  padding: 48px 24px;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  text-align: center;
  background: #ffffff;
  box-shadow:
    0 10px 25px
    rgba(15, 23, 42, 0.05);
}

.state-panel strong {
  margin-top: 18px;
  color: #0f172a;
  font-size: 17px;
  font-weight: 800;
}

.state-panel p {
  max-width: 460px;
  margin: 8px 0 22px;
  color: #94a3b8;
  font-size: 14px;
  line-height: 1.7;
}

.state-panel--error {
  border-color: #fecaca;
  background: #fef2f2;
}

.state-panel--error strong {
  color: #991b1b;
}

.state-panel--error p {
  color: #b91c1c;
}

.state-panel__actions {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
}

.loading-spinner {
  width: 42px;
  height: 42px;
  border: 4px solid #e0e7ff;
  border-top-color: #3157d6;
  border-radius: 50%;
  animation:
    member-edit-spin
    0.8s linear infinite;
}

/* =========================================================
 * Feedback Panels
 * ======================================================= */

.feedback-panel {
  display: flex;
  padding: 18px 20px;
  border-radius: 14px;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.feedback-panel--error {
  border: 1px solid #fecaca;
  background: #fef2f2;
}

.feedback-panel--success {
  border: 1px solid #bbf7d0;
  background: #f0fdf4;
}

.feedback-panel strong {
  font-size: 15px;
}

.feedback-panel--error strong {
  color: #991b1b;
}

.feedback-panel--success strong {
  color: #166534;
}

.feedback-panel p {
  margin: 5px 0 0;
  font-size: 13px;
  line-height: 1.6;
}

.feedback-panel--error p {
  color: #b91c1c;
}

.feedback-panel--success p {
  color: #15803d;
}

.feedback-panel__close {
  flex-shrink: 0;
  padding: 0 16px;
  border: 1px solid #ef4444;
  background: #ffffff;
  color: #b91c1c;
}

.feedback-panel__close:hover:not(:disabled) {
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
 * Audit Card
 * ======================================================= */

.audit-card {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
  overflow: hidden;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  background: #ffffff;
  box-shadow:
    0 10px 25px
    rgba(15, 23, 42, 0.05);
}

.audit-item {
  display: flex;
  min-height: 110px;
  padding: 20px;
  border-right: 1px solid #eef2f7;
  flex-direction: column;
  justify-content: center;
  gap: 9px;
}

.audit-item:last-child {
  border-right: 0;
}

.audit-item span {
  color: #94a3b8;
  font-size: 12px;
  font-weight: 700;
}

.audit-item strong {
  overflow: hidden;
  color: #334155;
  font-size: 14px;
  font-weight: 800;
  line-height: 1.5;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.audit-status--changed {
  color: #b45309 !important;
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
    member-edit-spin
    0.8s linear infinite;
}

@keyframes member-edit-spin {
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

  .audit-card {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .audit-item:nth-child(2n) {
    border-right: 0;
  }

  .audit-item:nth-child(-n + 2) {
    border-bottom:
      1px solid #eef2f7;
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
  .member-edit-page {
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

  .audit-card {
    grid-template-columns: 1fr;
  }

  .audit-item,
  .audit-item:nth-child(2n) {
    border-right: 0;
    border-bottom:
      1px solid #eef2f7;
  }

  .audit-item:last-child {
    border-bottom: 0;
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

  .state-panel__actions {
    width: 100%;
    flex-direction: column;
  }

  .state-panel__actions button {
    width: 100%;
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

  .feedback-panel {
    align-items: flex-start;
    flex-direction: column;
  }

  .feedback-panel__close {
    width: 100%;
  }

  .audit-item {
    min-height: auto;
    padding: 18px;
  }
}
</style>
