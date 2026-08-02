<template>
  <div class="login-view">
    <div class="login-header">
      <p class="login-header__eyebrow">
        ADMIN PORTAL
      </p>

      <h2>登入管理平台</h2>

      <p>
        請輸入管理員帳號與密碼，
        進入 ALADDIN Super Platform。
      </p>
    </div>

    <form
      class="login-form"
      @submit.prevent="handleSubmit"
    >
      <div class="form-group">
        <label for="email">
          電子郵件
        </label>

        <input
          id="email"
          v-model.trim="form.email"
          type="email"
          name="email"
          autocomplete="email"
          placeholder="admin@aladdin.com"
          :disabled="isLoading"
          :aria-invalid="
            Boolean(fieldErrors.email)
          "
          @input="clearFieldError('email')"
        />

        <p
          v-if="fieldErrors.email"
          class="field-error"
        >
          {{ fieldErrors.email }}
        </p>
      </div>

      <div class="form-group">
        <label for="password">
          密碼
        </label>

        <div class="password-field">
          <input
            id="password"
            v-model="form.password"
            :type="
              showPassword
                ? 'text'
                : 'password'
            "
            name="password"
            autocomplete="current-password"
            placeholder="請輸入登入密碼"
            :disabled="isLoading"
            :aria-invalid="
              Boolean(fieldErrors.password)
            "
            @input="
              clearFieldError('password')
            "
          />

          <button
            type="button"
            class="password-toggle"
            :disabled="isLoading"
            :aria-label="
              showPassword
                ? '隱藏密碼'
                : '顯示密碼'
            "
            @click="
              showPassword = !showPassword
            "
          >
            {{
              showPassword
                ? '隱藏'
                : '顯示'
            }}
          </button>
        </div>

        <p
          v-if="fieldErrors.password"
          class="field-error"
        >
          {{ fieldErrors.password }}
        </p>
      </div>

      <div class="form-options">
        <label class="remember-option">
          <input
            v-model="form.rememberMe"
            type="checkbox"
            :disabled="isLoading"
          />

          <span>記住我的登入狀態</span>
        </label>

        <button
          type="button"
          class="forgot-button"
          :disabled="isLoading"
          @click="handleForgotPassword"
        >
          忘記密碼？
        </button>
      </div>

      <div
        v-if="errorMessage"
        class="login-error"
        role="alert"
      >
        <strong>登入失敗</strong>

        <span>
          {{ errorMessage }}
        </span>
      </div>

      <button
        type="submit"
        class="submit-button"
        :disabled="isLoading"
      >
        <span
          v-if="isLoading"
          class="loading-spinner"
          aria-hidden="true"
        />

        <span>
          {{
            isLoading
              ? '登入驗證中...'
              : '登入管理平台'
          }}
        </span>
      </button>
    </form>

    <div class="login-footer">
      <span>受保護的企業管理入口</span>

      <span class="login-footer__dot" />

      <span>Version 1.0</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  reactive,
  ref,
} from 'vue'

import {
  useRoute,
  useRouter,
} from 'vue-router'

import { useAuth } from '../../composables/useAuth'

interface LoginFormState {
  email: string
  password: string
  rememberMe: boolean
}

interface LoginFieldErrors {
  email: string
  password: string
}

const route = useRoute()
const router = useRouter()

const {
  login,
  clearError,
  error,
  isLoading,
} = useAuth()

const showPassword = ref(false)

const form = reactive<LoginFormState>({
  email: '',
  password: '',
  rememberMe: true,
})

const fieldErrors =
  reactive<LoginFieldErrors>({
    email: '',
    password: '',
  })

const errorMessage = computed(
  () => error.value?.message ?? '',
)

function validateEmail(
  email: string,
): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email,
  )
}

function validateForm(): boolean {
  fieldErrors.email = ''
  fieldErrors.password = ''

  if (!form.email) {
    fieldErrors.email =
      '請輸入電子郵件。'
  } else if (!validateEmail(form.email)) {
    fieldErrors.email =
      '請輸入正確的電子郵件格式。'
  }

  if (!form.password) {
    fieldErrors.password =
      '請輸入登入密碼。'
  } else if (form.password.length < 6) {
    fieldErrors.password =
      '密碼長度至少需要 6 個字元。'
  }

  return (
    !fieldErrors.email &&
    !fieldErrors.password
  )
}

function clearFieldError(
  field: keyof LoginFieldErrors,
): void {
  fieldErrors[field] = ''

  if (error.value) {
    clearError()
  }
}

function getRedirectPath(): string {
  const redirect =
    route.query.redirect

  if (
    typeof redirect !== 'string' ||
    !redirect.startsWith('/') ||
    redirect.startsWith('//') ||
    redirect === '/login'
  ) {
    return '/'
  }

  return redirect
}

async function handleSubmit():
  Promise<void> {
  clearError()

  if (!validateForm()) {
    return
  }

  try {
    await login({
      email: form.email,
      password: form.password,
      rememberMe: form.rememberMe,
    })

    await router.replace(
      getRedirectPath(),
    )
  } catch {
    // 錯誤內容已由 auth store 統一處理。
  }
}

function handleForgotPassword(): void {
  clearError()

  router.push({
    path: '/forgot-password',
    query: form.email
      ? {
          email: form.email,
        }
      : undefined,
  })
}

onBeforeUnmount(() => {
  clearError()
})
</script>

<style scoped>
.login-view {
  width: 100%;
}

.login-header {
  margin-bottom: 30px;
}

.login-header__eyebrow {
  margin: 0 0 10px;
  color: #3157d6;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.16em;
}

.login-header h2 {
  margin: 0;
  color: #0f172a;
  font-size: 30px;
  line-height: 1.25;
}

.login-header p:last-child {
  margin: 12px 0 0;
  color: #64748b;
  font-size: 14px;
  line-height: 1.75;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  color: #334155;
  font-size: 14px;
  font-weight: 700;
}

.form-group input {
  width: 100%;
  min-height: 48px;
  padding: 0 14px;
  border: 1px solid #dbe2ea;
  border-radius: 12px;
  background: #ffffff;
  color: #0f172a;
  font: inherit;
  outline: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease;
}

.form-group input::placeholder {
  color: #a3afbf;
}

.form-group input:hover:not(:disabled) {
  border-color: #b9c5d4;
}

.form-group input:focus {
  border-color: #3157d6;
  box-shadow:
    0 0 0 4px
    rgba(49, 87, 214, 0.12);
}

.form-group input[aria-invalid='true'] {
  border-color: #dc2626;
}

.form-group input[aria-invalid='true']:focus {
  box-shadow:
    0 0 0 4px
    rgba(220, 38, 38, 0.1);
}

.form-group input:disabled {
  cursor: not-allowed;
  background: #f8fafc;
  color: #94a3b8;
}

.password-field {
  position: relative;
}

.password-field input {
  padding-right: 72px;
}

.password-toggle {
  position: absolute;
  top: 50%;
  right: 8px;
  padding: 7px 10px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #3157d6;
  cursor: pointer;
  font-size: 13px;
  font-weight: 800;
  transform: translateY(-50%);
}

.password-toggle:hover:not(:disabled) {
  background: #eef2ff;
}

.password-toggle:disabled {
  cursor: not-allowed;
  color: #94a3b8;
}

.field-error {
  margin: 0;
  color: #dc2626;
  font-size: 12px;
  line-height: 1.5;
}

.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.remember-option {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  color: #475569;
  cursor: pointer;
  font-size: 13px;
}

.remember-option input {
  width: 16px;
  height: 16px;
  margin: 0;
  accent-color: #3157d6;
}

.forgot-button {
  padding: 0;
  border: 0;
  background: transparent;
  color: #3157d6;
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
}

.forgot-button:hover:not(:disabled) {
  text-decoration: underline;
}

.forgot-button:disabled {
  cursor: not-allowed;
  color: #94a3b8;
}

.login-error {
  display: flex;
  padding: 14px 16px;
  border: 1px solid #fecaca;
  border-radius: 12px;
  flex-direction: column;
  gap: 4px;
  background: #fef2f2;
  color: #b91c1c;
}

.login-error strong {
  font-size: 13px;
}

.login-error span {
  font-size: 12px;
  line-height: 1.55;
}

.submit-button {
  display: inline-flex;
  width: 100%;
  min-height: 50px;
  border: 0;
  border-radius: 12px;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background:
    linear-gradient(
      135deg,
      #3157d6,
      #248fd8
    );
  box-shadow:
    0 14px 28px
    rgba(49, 87, 214, 0.22);
  color: #ffffff;
  cursor: pointer;
  font: inherit;
  font-size: 15px;
  font-weight: 800;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    opacity 0.2s ease;
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow:
    0 18px 32px
    rgba(49, 87, 214, 0.28);
}

.submit-button:active:not(:disabled) {
  transform: translateY(0);
}

.submit-button:disabled {
  cursor: not-allowed;
  opacity: 0.68;
}

.loading-spinner {
  width: 17px;
  height: 17px;
  border: 2px solid
    rgba(255, 255, 255, 0.38);
  border-top-color: #ffffff;
  border-radius: 999px;
  animation:
    login-spinner 0.8s linear infinite;
}

.login-footer {
  display: flex;
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #94a3b8;
  font-size: 11px;
}

.login-footer__dot {
  width: 3px;
  height: 3px;
  border-radius: 999px;
  background: #cbd5e1;
}

@keyframes login-spinner {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 480px) {
  .login-header h2 {
    font-size: 26px;
  }

  .form-options {
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
  }
}
</style>