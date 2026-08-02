<template>
  <AdminLayout>
    <div class="member-detail-page">

      <!-- Header -->
      <section class="page-header">
        <div class="header-left">

          <div class="avatar">
            <img
              v-if="member?.avatarUrl"
              :src="member.avatarUrl"
              alt=""
            >

            <span v-else>
              {{ avatarText }}
            </span>
          </div>

          <div class="header-info">

            <p class="page-eyebrow">
              MEMBER DETAIL
            </p>

            <h1>
              {{ member?.name || '-' }}
            </h1>

            <p class="member-code">
              {{ member?.memberCode }}
            </p>

          </div>

        </div>

        <div class="header-actions">

          <button
            class="secondary-button"
            type="button"
            @click="goBack"
          >
            返回列表
          </button>

          <button
            v-if="permissionStore.hasPermission('member.update')"
            class="primary-button"
            type="button"
            @click="editMember"
          >
            編輯會員
          </button>

        </div>

      </section>

      <!-- Summary -->

      <section class="summary-grid">

        <article class="summary-card">

          <span>
            會員等級
          </span>

          <strong>
            {{ member?.levelName }}
          </strong>

          <small>
            Level {{ member?.level }}
          </small>

        </article>

        <article class="summary-card">

          <span>
            狀態
          </span>

          <div class="summary-status">
  <MemberStatusBadge
    v-if="member"
    :status="member.status"
  />

  <span v-else>
    -
  </span>
</div>

          <small>
            Account Status
          </small>

        </article>

        <article class="summary-card">

          <span>
            市場
          </span>

          <strong>
            {{ member?.market }}
          </strong>

          <small>
            Current Market
          </small>

        </article>

        <article class="summary-card">

          <span>
            加入日期
          </span>

          <strong>
            {{ formatDate(member?.createdAt) }}
          </strong>

          <small>
            Register Time
          </small>

        </article>

      </section>
            <!-- 基本資料 -->

      <section class="detail-grid">

        <article class="detail-card">

          <header class="card-header">
            <h2>基本資料</h2>
          </header>

          <div class="info-grid">

            <div class="info-item">
              <label>會員編號</label>
              <span>{{ member?.memberCode || '-' }}</span>
            </div>

            <div class="info-item">
              <label>姓名</label>
              <span>{{ member?.name || '-' }}</span>
            </div>

            <div class="info-item">
              <label>Email</label>
              <span>{{ member?.email || '-' }}</span>
            </div>

            <div class="info-item">
              <label>手機</label>
              <span>{{ member?.phone || '-' }}</span>
            </div>

            <div class="info-item">
              <label>市場</label>
              <span>{{ member?.market || '-' }}</span>
            </div>

            <div class="info-item">
              <label>會員等級</label>
              <span>{{ member?.levelName || '-' }}</span>
            </div>

            <div class="info-item">
  <label>帳號狀態</label>

  <div class="info-status">
    <MemberStatusBadge
      v-if="member"
      :status="member.status"
    />

    <span v-else>
      -
    </span>
  </div>
</div>

            <div class="info-item">
              <label>建立時間</label>
              <span>{{ formatDate(member?.createdAt) }}</span>
            </div>

          </div>

        </article>

        <!-- 推薦關係 -->

        <article class="detail-card">

          <header class="card-header">
            <h2>推薦關係</h2>
          </header>

          <div class="info-grid">

            <div class="info-item">
              <label>推薦人</label>
              <span>{{ member?.referrerName || '-' }}</span>
            </div>

            <div class="info-item">
              <label>直推會員</label>
              <span>{{ member?.totalDirectReferrals ?? 0 }}</span>
            </div>

            <div class="info-item">
              <label>團隊人數</label>
              <span>{{ teamCount }}</span>
            </div>

            <div class="info-item">
              <label>團隊業績</label>
              <span>{{ formatCurrency(teamSales) }}</span>
            </div>

          </div>

        </article>

      </section>

      <!-- 消費統計 -->

      <section class="detail-card">

        <header class="card-header">
          <h2>消費統計</h2>
        </header>

        <div class="statistics-grid">

          <article class="stat-item">

            <span>總訂單</span>

            <strong>
              {{ statistics.totalOrders }}
            </strong>

          </article>

          <article class="stat-item">

            <span>累積消費 (TWD)</span>

            <strong>
              {{ formatCurrency(statistics.totalSpentTwd) }}
            </strong>

          </article>

          <article class="stat-item">

            <span>累積消費 (CNY)</span>

            <strong>
              {{ formatCny(statistics.totalSpentCny) }}
            </strong>

          </article>

          <article class="stat-item">

            <span>退款金額</span>

            <strong>
              {{ formatCurrency(statistics.refundAmount) }}
            </strong>

          </article>

        </div>

      </section>
            <!-- 收益統計 -->

      <section class="detail-card">

        <header class="card-header">
          <h2>收益統計</h2>
        </header>

        <div class="statistics-grid">

          <article class="stat-item">
            <span>推薦獎金</span>
            <strong>
              {{ formatCurrency(income.referralBonus) }}
            </strong>
          </article>

          <article class="stat-item">
            <span>團隊獎金</span>
            <strong>
              {{ formatCurrency(income.teamBonus) }}
            </strong>
          </article>

          <article class="stat-item">
            <span>商城收益</span>
            <strong>
              {{ formatCurrency(income.mallIncome) }}
            </strong>
          </article>

          <article class="stat-item">
            <span>旅遊收益</span>
            <strong>
              {{ formatCurrency(income.travelIncome) }}
            </strong>
          </article>

          <article class="stat-item">
            <span>AI 收益</span>
            <strong>
              {{ formatCurrency(income.aiIncome) }}
            </strong>
          </article>

          <article class="stat-item">
            <span>總收益</span>
            <strong>
              {{ formatCurrency(income.totalIncome) }}
            </strong>
          </article>

        </div>

      </section>

      <!-- 最近登入 -->

      <section class="detail-card">

        <header class="card-header">
          <h2>最近登入紀錄</h2>
        </header>

        <div class="table-wrapper">

          <table>

            <thead>
              <tr>
                <th>登入時間</th>
                <th>IP</th>
                <th>裝置</th>
                <th>瀏覽器</th>
              </tr>
            </thead>

            <tbody>

              <tr
                v-for="log in loginLogs"
                :key="log.id"
              >
                <td>{{ log.loginTime }}</td>
                <td>{{ log.ip }}</td>
                <td>{{ log.device }}</td>
                <td>{{ log.browser }}</td>
              </tr>

            </tbody>

          </table>

        </div>

      </section>

      <!-- 操作紀錄 -->

      <section class="detail-card">

        <header class="card-header">
          <h2>操作紀錄</h2>
        </header>

        <div class="table-wrapper">

          <table>

            <thead>

              <tr>
                <th>時間</th>
                <th>動作</th>
                <th>操作人</th>
              </tr>

            </thead>

            <tbody>

              <tr
                v-for="log in actionLogs"
                :key="log.id"
              >
                <td>{{ log.createdAt }}</td>
                <td>{{ log.action }}</td>
                <td>{{ log.operator }}</td>
              </tr>

            </tbody>

          </table>

        </div>

      </section>

      <section
  v-if="statusMessage"
  class="status-feedback status-feedback--success"
  role="status"
>
  {{ statusMessage }}
</section>

<section
  v-if="statusError"
  class="status-feedback status-feedback--error"
  role="alert"
>
  {{ statusError }}
</section>
      <!-- Footer -->

      <section class="page-footer">

        <button
          class="secondary-button"
          @click="goBack"
        >
          返回列表
        </button>

        <button
          class="secondary-button"
          @click="resetPassword"
        >
          重設密碼
        </button>

        <button
          class="secondary-button"
          @click="viewOrders"
        >
          查看訂單
        </button>

        <button
  v-if="
    permissionStore.hasPermission(
      'member.update',
    ) &&
    member?.status === 'pending'
  "
  class="secondary-button status-button--success"
  type="button"
  :disabled="isStatusUpdating"
  @click="
    handleChangeStatus(
      'active',
    )
  "
>
  審核通過
</button>

<button
  v-if="
    permissionStore.hasPermission(
      'member.update',
    ) &&
    (
      member?.status === 'disabled' ||
      member?.status === 'suspended'
    )
  "
  class="secondary-button status-button--success"
  type="button"
  :disabled="isStatusUpdating"
  @click="
    handleChangeStatus(
      'active',
    )
  "
>
  恢復正常
</button>

<button
  v-if="
    permissionStore.hasPermission(
      'member.update',
    ) &&
    member?.status === 'active'
  "
  class="secondary-button status-button--warning"
  type="button"
  :disabled="isStatusUpdating"
  @click="
    handleChangeStatus(
      'suspended',
    )
  "
>
  暫停會員
</button>

<button
  v-if="
    permissionStore.hasPermission(
      'member.update',
    ) &&
    member?.status !== 'disabled'
  "
  class="secondary-button status-button--danger"
  type="button"
  :disabled="isStatusUpdating"
  @click="
    handleChangeStatus(
      'disabled',
    )
  "
>
  {{
    isStatusUpdating
      ? '處理中...'
      : '停用會員'
  }}
</button>

        <button
          v-if="permissionStore.hasPermission('member.update')"
          class="primary-button"
          @click="editMember"
        >
          編輯會員
        </button>

      </section>

    </div>

  </AdminLayout>

</template>
<script setup lang="ts">
import {
  computed,
  onMounted,
  ref,
} from 'vue'

import {
  useRoute,
  useRouter,
} from 'vue-router'

import AdminLayout from '../../layouts/AdminLayout.vue'

import MemberStatusBadge from '../../components/member/MemberStatusBadge.vue'
import {
  usePermissionStore,
} from '../../stores/permission'

import {
  useMemberStore,
} from '../../stores/member'

import type {
  MemberListItem,
  MemberStatus,
} from '../../types/member'

interface MemberStatisticsState {
  totalOrders: number
  totalSpentTwd: number
  totalSpentCny: number
  refundAmount: number
}

interface MemberIncomeState {
  referralBonus: number
  teamBonus: number
  mallIncome: number
  travelIncome: number
  aiIncome: number
  totalIncome: number
}

interface MemberLoginLogRow {
  id: string
  loginTime: string
  ip: string
  device: string
  browser: string
}

interface MemberActionLogRow {
  id: string
  createdAt: string
  action: string
  operator: string
}

const router = useRouter()
const route = useRoute()

const permissionStore =
  usePermissionStore()

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

const hasError =
  ref(false)

const errorMessage =
  ref('')

const isStatusUpdating =
  ref(false)

const statusMessage =
  ref<string | null>(null)

const statusError =
  ref<string | null>(null)
const member =
  ref<MemberListItem | null>(
    null,
  )

const statistics =
  ref<MemberStatisticsState>({
    totalOrders: 0,
    totalSpentTwd: 0,
    totalSpentCny: 0,
    refundAmount: 0,
  })

const income =
  ref<MemberIncomeState>({
    referralBonus: 0,
    teamBonus: 0,
    mallIncome: 0,
    travelIncome: 0,
    aiIncome: 0,
    totalIncome: 0,
  })

const loginLogs =
  ref<MemberLoginLogRow[]>([])

const actionLogs =
  ref<MemberActionLogRow[]>([])

const teamSales =
  ref(0)

const avatarText = computed(() => {
  const name =
    member.value?.name
      ?.trim() ?? ''

  if (!name) {
    return '?'
  }

  return name.slice(0, 1)
})

const teamCount = computed(() =>
  member.value
    ?.totalDirectReferrals ?? 0,
)

function createEmptyStatistics():
  MemberStatisticsState {
  return {
    totalOrders: 0,
    totalSpentTwd: 0,
    totalSpentCny: 0,
    refundAmount: 0,
  }
}

function createEmptyIncome():
  MemberIncomeState {
  return {
    referralBonus: 0,
    teamBonus: 0,
    mallIncome: 0,
    travelIncome: 0,
    aiIncome: 0,
    totalIncome: 0,
  }
}

function resetDetailState():
  void {
  member.value = null

  statistics.value =
    createEmptyStatistics()

  income.value =
    createEmptyIncome()

  teamSales.value = 0
  loginLogs.value = []
  actionLogs.value = []
}

function findMemberFromStore():
  MemberListItem | null {
  return (
    memberStore.members.find(
      (item) =>
        item.id ===
        memberId.value,
    ) ?? null
  )
}

async function loadMember():
  Promise<void> {
  isLoading.value = true
  hasError.value = false
  errorMessage.value = ''

  resetDetailState()

  try {
    if (!memberId.value) {
      throw new Error(
        '缺少會員識別碼。',
      )
    }

    let targetMember =
      findMemberFromStore()

    if (!targetMember) {
      await memberStore.fetchMembers()

      targetMember =
        findMemberFromStore()
    }

    if (!targetMember) {
      throw new Error(
        '找不到指定的會員資料。',
      )
    }

    member.value =
      targetMember
  } catch (caughtError) {
    hasError.value = true

    errorMessage.value =
      caughtError instanceof Error
        ? caughtError.message
        : '會員詳情載入發生未知錯誤。'
  } finally {
    isLoading.value = false
  }
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

function formatCurrency(
  value: number,
): string {
  return new Intl.NumberFormat(
    'zh-TW',
    {
      style: 'currency',
      currency: 'TWD',
      maximumFractionDigits: 0,
    },
  ).format(
    Number.isFinite(value)
      ? value
      : 0,
  )
}

function formatCny(
  value: number,
): string {
  return new Intl.NumberFormat(
    'zh-CN',
    {
      style: 'currency',
      currency: 'CNY',
      maximumFractionDigits: 2,
    },
  ).format(
    Number.isFinite(value)
      ? value
      : 0,
  )
}

function goBack():
  void {
  router.push(
    '/members',
  )
}

function editMember():
  void {
  if (!member.value) {
    return
  }

  router.push(
    `/members/${member.value.id}/edit`,
  )
}

function viewOrders():
  void {
  if (!member.value) {
    return
  }

  router.push({
    path: '/orders',
    query: {
      memberId:
        member.value.id,
    },
  })
}

async function resetPassword():
  Promise<void> {
  if (!member.value) {
    return
  }

  const confirmed =
    window.confirm(
      `確定要為會員「${member.value.name}」發送密碼重設通知嗎？`,
    )

  if (!confirmed) {
    return
  }

  window.alert(
    '密碼重設功能將於 Supabase Auth 管理 API 階段正式串接。',
  )
}

function getStatusLabel(
  status: MemberStatus,
): string {
  switch (status) {
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
}

async function handleChangeStatus(
  nextStatus: MemberStatus,
): Promise<void> {
  if (
    !member.value ||
    isStatusUpdating.value
  ) {
    return
  }

  if (
    member.value.status ===
    nextStatus
  ) {
    return
  }

  const nextStatusLabel =
    getStatusLabel(
      nextStatus,
    )

  const confirmed =
    window.confirm(
      `確定要將會員「${member.value.name}」的狀態改為「${nextStatusLabel}」嗎？`,
    )

  if (!confirmed) {
    return
  }

  isStatusUpdating.value = true
  statusMessage.value = null
  statusError.value = null

  try {
    const success =
      await memberStore
        .changeMemberStatus(
          member.value.id,
          nextStatus,
        )

    if (!success) {
      throw new Error(
        memberStore.error ||
        '會員狀態更新失敗。',
      )
    }

    member.value = {
      ...member.value,
      status: nextStatus,
      updatedAt:
        new Date().toISOString(),
    }

    statusMessage.value =
      `會員狀態已更新為「${nextStatusLabel}」。`
  } catch (caughtError) {
    statusError.value =
      caughtError instanceof Error
        ? caughtError.message
        : '會員狀態更新發生未知錯誤。'
  } finally {
    isStatusUpdating.value = false
  }
}

onMounted(async () => {
  await loadMember()
})
</script>
<style scoped>
.member-detail-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* =========================================================
 * Page Header
 * ======================================================= */

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 26px;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  background: #ffffff;
  box-shadow:
    0 10px 25px
    rgba(15, 23, 42, 0.05);
}

.header-left {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 18px;
}

.avatar {
  display: grid;
  width: 78px;
  height: 78px;
  flex-shrink: 0;
  overflow: hidden;
  place-items: center;
  border: 1px solid #dbe4ff;
  border-radius: 22px;
  background: #eef2ff;
  color: #3157d6;
  font-size: 28px;
  font-weight: 900;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.header-info {
  min-width: 0;
}

.header-info h1 {
  margin: 4px 0 8px;
  overflow: hidden;
  color: #0f172a;
  font-size: 32px;
  font-weight: 900;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.page-eyebrow {
  margin: 0;
  color: #3157d6;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.member-code {
  display: inline-flex;
  margin: 0;
  padding: 5px 10px;
  border-radius: 8px;
  background: #f1f5f9;
  color: #475569;
  font-family:
    ui-monospace,
    SFMono-Regular,
    Menlo,
    Monaco,
    Consolas,
    monospace;
  font-size: 12px;
  font-weight: 700;
}

.header-actions {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 12px;
}

/* =========================================================
 * Shared Buttons
 * ======================================================= */

.primary-button,
.secondary-button {
  min-height: 42px;
  padding: 0 18px;
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
.secondary-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
  transform: none;
}

/* =========================================================
 * Summary Cards
 * ======================================================= */

.summary-grid {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
  gap: 18px;
}

.summary-card {
  display: flex;
  min-height: 136px;
  padding: 22px;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  flex-direction: column;
  background: #ffffff;
  box-shadow:
    0 10px 25px
    rgba(15, 23, 42, 0.05);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.summary-card:hover {
  border-color: #dbe2ea;
  box-shadow:
    0 16px 34px
    rgba(15, 23, 42, 0.08);
  transform: translateY(-2px);
}

.summary-card > span {
  color: #64748b;
  font-size: 13px;
  font-weight: 700;
}

.summary-card > strong {
  margin: 15px 0 8px;
  overflow: hidden;
  color: #0f172a;
  font-size: 22px;
  font-weight: 900;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.summary-card > small {
  margin-top: auto;
  color: #94a3b8;
  font-size: 12px;
}

/* =========================================================
 * Detail Layout
 * ======================================================= */

.detail-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.detail-card {
  overflow: hidden;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  background: #ffffff;
  box-shadow:
    0 10px 25px
    rgba(15, 23, 42, 0.05);
}

.card-header {
  display: flex;
  min-height: 68px;
  padding: 18px 22px;
  border-bottom: 1px solid #e5e7eb;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background: #ffffff;
}

.card-header h2 {
  margin: 0;
  color: #0f172a;
  font-size: 19px;
  font-weight: 800;
}

/* =========================================================
 * Information
 * ======================================================= */

.info-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 0;
}

.info-item {
  display: flex;
  min-height: 92px;
  padding: 18px 22px;
  border-right: 1px solid #eef2f7;
  border-bottom: 1px solid #eef2f7;
  flex-direction: column;
  justify-content: center;
  gap: 7px;
}

.info-item:nth-child(2n) {
  border-right: 0;
}

.info-item label {
  color: #94a3b8;
  font-size: 12px;
  font-weight: 700;
}

.info-item span {
  overflow: hidden;
  color: #334155;
  font-size: 14px;
  font-weight: 800;
  line-height: 1.5;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* =========================================================
 * Statistics
 * ======================================================= */

.statistics-grid {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
}

.stat-item {
  display: flex;
  min-height: 128px;
  padding: 22px;
  border-right: 1px solid #eef2f7;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
}

.stat-item:last-child {
  border-right: 0;
}

.stat-item span {
  color: #64748b;
  font-size: 13px;
  font-weight: 700;
}

.stat-item strong {
  overflow: hidden;
  color: #0f172a;
  font-size: 23px;
  font-weight: 900;
  text-overflow: ellipsis;
  white-space: nowrap;
}
/* =========================================================
 * Tables
 * ======================================================= */

.table-wrapper {
  overflow-x: auto;
}

table {
  width: 100%;
  min-width: 720px;
  border-collapse: collapse;
}

th,
td {
  padding: 15px 20px;
  border-bottom: 1px solid #eef2f7;
  text-align: left;
  vertical-align: middle;
  white-space: nowrap;
}

th {
  background: #f8fafc;
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.02em;
}

td {
  color: #334155;
  font-size: 13px;
}

tbody tr {
  transition:
    background-color 0.2s ease;
}

tbody tr:hover {
  background: #f8fafc;
}

tbody tr:last-child td {
  border-bottom: 0;
}

/* =========================================================
 * Footer
 * ======================================================= */

.page-footer {
  display: flex;
  min-height: 88px;
  padding: 20px 24px;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 10px;
  background: #ffffff;
  box-shadow:
    0 10px 25px
    rgba(15, 23, 42, 0.05);
}
.summary-status {
  display: flex;
  margin: 15px 0 8px;
  align-items: center;
}

.info-status {
  display: flex;
  min-height: 32px;
  align-items: center;
}
/* =========================================================
 * Loading and Error States
 * ======================================================= */

.loading-panel,
.error-panel {
  display: flex;
  min-height: 260px;
  padding: 40px 24px;
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

.loading-panel strong,
.error-panel strong {
  margin-top: 16px;
  color: #0f172a;
  font-size: 17px;
  font-weight: 800;
}

.loading-panel p,
.error-panel p {
  max-width: 440px;
  margin: 8px 0 0;
  color: #94a3b8;
  font-size: 13px;
  line-height: 1.7;
}

.error-panel {
  border-color: #fecaca;
  background: #fef2f2;
}

.error-panel strong {
  color: #991b1b;
}

.error-panel p {
  color: #b91c1c;
}

.loading-spinner {
  width: 42px;
  height: 42px;
  border: 4px solid #e0e7ff;
  border-top-color: #3157d6;
  border-radius: 50%;
  animation:
    member-detail-spin
    0.8s linear infinite;
}

@keyframes member-detail-spin {
  to {
    transform: rotate(360deg);
  }
}

/* =========================================================
 * Tablet
 * ======================================================= */

@media (max-width: 1200px) {
  .summary-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .statistics-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .stat-item:nth-child(2n) {
    border-right: 0;
  }

  .stat-item:nth-child(-n + 2) {
    border-bottom:
      1px solid #eef2f7;
  }
}

@media (max-width: 980px) {
  .page-header {
    align-items: stretch;
    flex-direction: column;
  }

  .header-actions {
    width: 100%;
  }

  .header-actions button {
    flex: 1;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }
}

/* =========================================================
 * Mobile
 * ======================================================= */

@media (max-width: 760px) {
  .member-detail-page {
    gap: 18px;
  }

  .page-header {
    padding: 20px;
  }

  .header-left {
    align-items: flex-start;
  }

  .avatar {
    width: 64px;
    height: 64px;
    border-radius: 18px;
    font-size: 22px;
  }

  .header-info h1 {
    font-size: 26px;
    white-space: normal;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .info-item {
    border-right: 0;
  }

  .statistics-grid {
    grid-template-columns: 1fr;
  }

  .stat-item,
  .stat-item:nth-child(2n) {
    border-right: 0;
    border-bottom:
      1px solid #eef2f7;
  }

  .stat-item:last-child {
    border-bottom: 0;
  }

  .page-footer {
    align-items: stretch;
    flex-direction: column;
  }

  .page-footer button {
    width: 100%;
  }
}

/* =========================================================
 * Small Mobile
 * ======================================================= */

@media (max-width: 480px) {
  .page-header {
    padding: 18px;
  }

  .header-left {
    flex-direction: column;
  }

  .header-actions {
    flex-direction: column;
  }

  .header-actions button {
    width: 100%;
  }

  .avatar {
    width: 58px;
    height: 58px;
    font-size: 20px;
  }

  .header-info h1 {
    font-size: 23px;
  }

  .page-eyebrow {
    letter-spacing: 0.08em;
  }

  .summary-card,
  .stat-item {
    min-height: auto;
  }

  .summary-card > strong,
  .stat-item strong {
    white-space: normal;
  }

  .card-header,
  .info-item,
  .stat-item,
  .page-footer {
    padding-right: 18px;
    padding-left: 18px;
  }
}
.status-feedback {
  padding: 15px 18px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
}

.status-feedback--success {
  border: 1px solid #bbf7d0;
  background: #f0fdf4;
  color: #15803d;
}

.status-feedback--error {
  border: 1px solid #fecaca;
  background: #fef2f2;
  color: #b91c1c;
}

.status-button--success {
  border-color: #86efac;
  background: #f0fdf4;
  color: #15803d;
}

.status-button--success:hover:not(:disabled) {
  border-color: #4ade80;
  background: #dcfce7;
  color: #166534;
}

.status-button--warning {
  border-color: #fcd34d;
  background: #fffbeb;
  color: #b45309;
}

.status-button--warning:hover:not(:disabled) {
  border-color: #fbbf24;
  background: #fef3c7;
}

.status-button--danger {
  border-color: #fca5a5;
  background: #fef2f2;
  color: #b91c1c;
}

.status-button--danger:hover:not(:disabled) {
  border-color: #f87171;
  background: #fee2e2;
}
</style>
