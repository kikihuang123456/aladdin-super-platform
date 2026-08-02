<template>
  <AdminLayout>
    <div class="member-page">
      <!-- 頁面標題 -->
      <section class="page-header">
        <div class="page-header__content">
          <p class="page-eyebrow">
            MEMBER MANAGEMENT
          </p>

          <h1>
            會員管理
          </h1>

          <p class="page-description">
            管理平台正式會員資料、等級、狀態、推薦關係與帳號權限。
          </p>
        </div>

        <div class="page-header__actions">
  <button
    class="secondary-button"
    type="button"
    :disabled="isLoading"
    @click="handleRefresh"
  >
    {{
      isLoading
        ? '更新中...'
        : '重新整理'
    }}
  </button>

  <button
    v-if="
      permissionStore.hasPermission(
        'member.view',
      )
    "
    class="secondary-button export-button"
    type="button"
    :disabled="
      isLoading ||
      members.length === 0
    "
    @click="handleExportMembers"
  >
    匯出 Excel
  </button>
<button
  v-if="
    permissionStore.hasPermission(
      'member.view',
    )
  "
  class="
    secondary-button
    export-button
    export-button--csv
  "
  type="button"
  :disabled="
    isLoading ||
    members.length === 0
  "
  @click="handleExportMembersCsv"
>
  匯出 CSV
</button>
  <button
    v-if="
      permissionStore.hasPermission(
        'member.create',
      )
    "
    class="primary-button"
    type="button"
    @click="handleCreateMember"
  >
    新增會員
  </button>
</div>
      </section>

      <!-- 會員統計 -->
      <section class="summary-grid">
        <article class="summary-card">
          <div class="summary-card__header">
            <span>會員總數</span>

            <span class="summary-card__icon">
              全
            </span>
          </div>

          <strong>
            {{
              statistics.total
                .toLocaleString()
            }}
          </strong>

          <small>
            全部正式註冊會員
          </small>
        </article>

        <article class="summary-card">
          <div class="summary-card__header">
            <span>本月新增</span>

            <span class="summary-card__icon">
              新
            </span>
          </div>

          <strong>
            {{
              statistics.newThisMonth
                .toLocaleString()
            }}
          </strong>

          <small>
            本月完成註冊會員
          </small>
        </article>

        <article class="summary-card">
          <div class="summary-card__header">
            <span>正常會員</span>

            <span
              class="
                summary-card__icon
                summary-card__icon--success
              "
            >
              正
            </span>
          </div>

          <strong>
            {{
              statistics.active
                .toLocaleString()
            }}
          </strong>

          <small>
            帳號狀態正常
          </small>
        </article>

        <article class="summary-card">
          <div class="summary-card__header">
            <span>停用會員</span>

            <span
              class="
                summary-card__icon
                summary-card__icon--danger
              "
            >
              停
            </span>
          </div>

          <strong>
            {{
              statistics.disabled
                .toLocaleString()
            }}
          </strong>

          <small>
            限制登入或使用
          </small>
        </article>
      </section>

      <!-- 錯誤訊息 -->
      <section
        v-if="error"
        class="error-panel"
        role="alert"
      >
        <div>
          <strong>
            會員資料載入失敗
          </strong>

          <p>
            {{ error }}
          </p>
        </div>

        <button
          class="error-panel__button"
          type="button"
          @click="handleRefresh"
        >
          重新載入
        </button>
      </section>

      <!-- 會員列表 -->
      <section class="table-card">

        <div class="table-toolbar">
          <div class="table-toolbar__title">
            <h2>
              會員列表
            </h2>

            <p>
              資料直接來自 Supabase 正式會員資料庫
            </p>
          </div>

          <form
            class="toolbar-actions"
            @submit.prevent="handleSearch"
          >
            <div class="search-group">
              <input
                v-model.trim="keyword"
                class="search-input"
                type="search"
                autocomplete="off"
                placeholder="搜尋姓名、Email、手機或會員編號"
                aria-label="搜尋會員"
              >

              <button
                class="search-button"
                type="submit"
                :disabled="isLoading"
              >
                搜尋
              </button>
            </div>

            <select
              v-model="levelFilter"
              class="filter-select"
              aria-label="會員等級篩選"
              :disabled="isLoading"
              @change="handleLevelChange"
            >
              <option value="">
                全部等級
              </option>

              <option value="1">
                一般會員
              </option>

              <option value="2">
                白銀會員
              </option>

              <option value="3">
                黃金會員
              </option>

              <option value="4">
                白金會員
              </option>

              <option value="5">
                鑽石會員
              </option>

              <option value="6">
                VIP 會員
              </option>
            </select>

            <select
              v-model="statusFilter"
              class="filter-select"
              aria-label="會員狀態篩選"
              :disabled="isLoading"
              @change="handleStatusChange"
            >
              <option value="">
                全部狀態
              </option>

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
<button

  class="advanced-filter-button"
  :class="{
    'advanced-filter-button--active':
      isAdvancedFilterOpen ||
      hasAdvancedFilters,
  }"
  type="button"
  :disabled="isLoading"
  @click="toggleAdvancedFilters"
>
  {{
    isAdvancedFilterOpen
      ? '收起進階篩選'
      : '進階篩選'
  }}

  <span
    v-if="hasAdvancedFilters"
    class="filter-indicator"
  >
    已套用
  </span>
</button>
            <button
              class="reset-button"
              type="button"
              :disabled="isLoading"
              @click="handleResetFilters"
            >
              清除篩選
            </button>
          </form>
        </div>
        <section
          v-if="isAdvancedFilterOpen"
          class="advanced-filter-panel"
        >
          <div class="advanced-filter-grid">
            <div class="advanced-filter-field">
              <label for="created-from">
                建立日期起始
              </label>

              <input
                id="created-from"
                v-model="createdFrom"
                class="advanced-filter-input"
                type="date"
                :disabled="isLoading"
              >
            </div>

            <div class="advanced-filter-field">
              <label for="created-to">
                建立日期結束
              </label>

              <input
                id="created-to"
                v-model="createdTo"
                class="advanced-filter-input"
                type="date"
                :disabled="isLoading"
              >
            </div>

            <div class="advanced-filter-field">
              <label for="member-sort-by">
                排序欄位
              </label>

              <select
                id="member-sort-by"
                v-model="sortBy"
                class="advanced-filter-select"
                :disabled="isLoading"
              >
                <option value="created_at">
                  建立時間
                </option>

                <option value="updated_at">
                  更新時間
                </option>

                <option value="member_code">
                  會員編號
                </option>

                <option value="name">
                  會員姓名
                </option>

                <option value="level">
                  會員等級
                </option>

                <option value="status">
                  帳號狀態
                </option>
              </select>
            </div>

            <div class="advanced-filter-field">
              <label for="sort-direction">
                排序方向
              </label>

              <select
                id="sort-direction"
                v-model="sortDirection"
                class="advanced-filter-select"
                :disabled="isLoading"
              >
                <option value="desc">
                  降冪／由新到舊
                </option>

                <option value="asc">
                  升冪／由舊到新
                </option>
              </select>
            </div>

            <div class="advanced-filter-field">
              <label for="page-size">
                每頁筆數
              </label>

              <select
                id="page-size"
                v-model.number="pageSize"
                class="advanced-filter-select"
                :disabled="isLoading"
              >
                <option :value="10">
                  每頁 10 筆
                </option>

                <option :value="20">
                  每頁 20 筆
                </option>

                <option :value="50">
                  每頁 50 筆
                </option>

                <option :value="100">
                  每頁 100 筆
                </option>
              </select>
            </div>
          </div>

          <div class="advanced-filter-actions">
            <button
              class="secondary-button"
              type="button"
              :disabled="
                isLoading ||
                !hasAdvancedFilters
              "
              @click="
                handleClearAdvancedFilters
              "
            >
              清除進階條件
            </button>

            <button
              class="primary-button"
              type="button"
              :disabled="isLoading"
              @click="
                handleApplyAdvancedFilters
              "
            >
              {{
                isLoading
                  ? '套用中...'
                  : '套用進階篩選'
              }}
            </button>
          </div>
        </section>
                <section
          v-if="hasAnyFilters"
          class="active-filter-summary"
        >
          <div class="active-filter-summary__content">
            <strong>
              目前篩選條件
            </strong>

            <div class="active-filter-tags">
              <span
                v-if="keyword"
                class="filter-tag"
              >
                關鍵字：{{ keyword }}
              </span>

              <span
                v-if="levelFilter"
                class="filter-tag"
              >
                等級：
                {{
                  levelFilter === '1'
                    ? '一般會員'
                    : levelFilter === '2'
                      ? '白銀會員'
                      : levelFilter === '3'
                        ? '黃金會員'
                        : levelFilter === '4'
                          ? '白金會員'
                          : levelFilter === '5'
                            ? '鑽石會員'
                            : 'VIP 會員'
                }}
              </span>

              <span
                v-if="statusFilter"
                class="filter-tag"
              >
                狀態：
                {{
                  statusFilter === 'active'
                    ? '正常'
                    : statusFilter === 'pending'
                      ? '待審核'
                      : statusFilter === 'disabled'
                        ? '停用'
                        : '暫停'
                }}
              </span>

              <span
                v-if="createdFrom"
                class="filter-tag"
              >
                起始日期：{{ createdFrom }}
              </span>

              <span
                v-if="createdTo"
                class="filter-tag"
              >
                結束日期：{{ createdTo }}
              </span>

              <span
                v-if="
                  sortBy !== 'created_at' ||
                  sortDirection !== 'desc'
                "
                class="filter-tag"
              >
                自訂排序已套用
              </span>

              <span
                v-if="pageSize !== 20"
                class="filter-tag"
              >
                每頁 {{ pageSize }} 筆
              </span>
            </div>
          </div>

                             <button
            class="clear-all-filters-button"
            type="button"
            :disabled="isLoading"
            @click="handleResetFilters"
          >
            清除全部條件
          </button>
        </section>

        <section
          v-if="hasSelectedMembers"
          class="bulk-action-bar"
        >
          <div class="bulk-action-bar__summary">
            已選取
            <strong>
              {{ selectedCount }}
            </strong>
            位會員
          </div>

          <div class="bulk-action-bar__actions">
  <button
    v-if="
      permissionStore.hasPermission(
        'member.update',
      )
    "
    class="
      bulk-status-button
      bulk-status-button--success
    "
    type="button"
    :disabled="
      isLoading ||
      isBulkUpdating ||
      isBulkDeleting
    "
    @click="
      handleBulkStatusChange(
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
      )
    "
    class="
      bulk-status-button
      bulk-status-button--pending
    "
    type="button"
    :disabled="
      isLoading ||
      isBulkUpdating ||
      isBulkDeleting
    "
    @click="
      handleBulkStatusChange(
        'pending',
      )
    "
  >
    設為待審核
  </button>

  <button
    v-if="
      permissionStore.hasPermission(
        'member.update',
      )
    "
    class="
      bulk-status-button
      bulk-status-button--warning
    "
    type="button"
    :disabled="
      isLoading ||
      isBulkUpdating ||
      isBulkDeleting
    "
    @click="
      handleBulkStatusChange(
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
      )
    "
    class="
      bulk-status-button
      bulk-status-button--danger
    "
    type="button"
    :disabled="
      isLoading ||
      isBulkUpdating ||
      isBulkDeleting
    "
    @click="
      handleBulkStatusChange(
        'disabled',
      )
    "
  >
    {{
      isBulkUpdating
        ? '處理中...'
        : '停用會員'
    }}
  </button>

  <button
    v-if="
      permissionStore.hasPermission(
        'member.update',
      )
    "
    class="
      bulk-status-button
      bulk-status-button--delete
    "
    type="button"
    :disabled="
      isLoading ||
      isBulkUpdating ||
      isBulkDeleting
    "
    @click="handleBulkDelete"
  >
    {{
      isBulkDeleting
        ? '刪除中...'
        : '永久刪除'
    }}
  </button>

  <button
  v-if="canDeleteMember"
  class="danger-button"
  type="button"
  :disabled="
    isLoading ||
    isBulkUpdating ||
    isBulkDeleting
  "
  @click="handleBulkDelete"
>
  {{
    isBulkDeleting
      ? '刪除中...'
      : '永久刪除'
  }}
</button>
</div>
        </section>

        <section
          v-if="bulkActionMessage"
          class="
            bulk-feedback
            bulk-feedback--success
          "
          role="status"
        >
          {{ bulkActionMessage }}
        </section>

        <section
          v-if="bulkActionError"
          class="
            bulk-feedback
            bulk-feedback--error
          "
          role="alert"
        >
          {{ bulkActionError }}
        </section>

        <!-- 載入狀態 -->
        <div
          v-if="isLoading"
          class="state-panel"
        >


          <div class="loading-spinner" />

          <strong>
            正在讀取會員資料
          </strong>

          <p>
            系統正在連線至 Supabase 正式資料庫。
          </p>
        </div>

        <!-- 無資料狀態 -->
        <div
          v-else-if="
            !error &&
            members.length === 0
          "
          class="state-panel"
        >
          <div class="state-panel__icon">
            會員
          </div>

          <strong>
            沒有符合條件的會員資料
          </strong>

          <p>
            請調整搜尋條件，或建立第一筆正式會員資料。
          </p>

          <button
            v-if="
              permissionStore.hasPermission(
                'member.create',
              )
            "
            class="primary-button"
            type="button"
            @click="handleCreateMember"
          >
            新增會員
          </button>
        </div>

        <!-- 真實會員資料表 -->
        <div
          v-else-if="!error"
          class="table-wrapper"
        >
          <table>
            <thead>
  <tr>

    <th class="selection-column">
      <input
        class="selection-checkbox"
        type="checkbox"
        :checked="isAllSelected"
        :disabled="
          isLoading ||
          members.length === 0
        "
        aria-label="選取目前頁面全部會員"
        @change="toggleSelectAll"
      >
    </th>

    <th>會員</th>
    <th>會員編號</th>
    <th>Email</th>
    <th>手機號碼</th>
    <th>會員等級</th>
    <th>推薦人</th>
    <th>狀態</th>
    <th>加入日期</th>
    <th>操作</th>

  </tr>
</thead>

            <tbody>
              <tr
  v-for="member in members"
  :key="member.id"
  :class="{
    'table-row--selected':
      selectedMemberIds.includes(
        member.id,
      ),
  }"
>
  <td class="selection-column">
    <input
      class="selection-checkbox"
      type="checkbox"
      :checked="
        selectedMemberIds.includes(
          member.id,
        )
      "
      :aria-label="`選取會員 ${member.name}`"
      @change="
        toggleMemberSelection(
          member.id,
        )
      "
    >
  </td>

  <td>
    <div class="member-profile">
                    <img
                      v-if="member.avatarUrl"
                      class="member-avatar"
                      :src="member.avatarUrl"
                      :alt="member.name"
                    >

                    <span
                      v-else
                      class="member-avatar member-avatar--fallback"
                    >
                      {{
                        getMemberInitial(
                          member.name,
                        )
                      }}
                    </span>

                    <div class="member-profile__content">
                      <strong>
                        {{ member.name }}
                      </strong>

                      <small>
                        ID：{{ member.id }}
                      </small>
                    </div>
                  </div>
                </td>

                <td>
                  <span
                    v-if="member.memberCode"
                    class="member-code"
                  >
                    {{ member.memberCode }}
                  </span>

                  <span
                    v-else
                    class="empty-value"
                  >
                    尚未建立
                  </span>
                </td>

                <td>
                  <a
                    v-if="member.email"
                    class="contact-link"
                    :href="`mailto:${member.email}`"
                  >
                    {{ member.email }}
                  </a>

                  <span
                    v-else
                    class="empty-value"
                  >
                    未提供
                  </span>
                </td>

                <td>
                  <a
                    v-if="member.phone"
                    class="contact-link"
                    :href="`tel:${member.phone}`"
                  >
                    {{ member.phone }}
                  </a>

                  <span
                    v-else
                    class="empty-value"
                  >
                    未提供
                  </span>
                </td>

                <td>
                  <div class="level-info">
                    <strong>
                      {{ member.levelName }}
                    </strong>

                    <small>
                      Level {{ member.level }}
                    </small>
                  </div>
                </td>

                <td>
                  {{
                    member.referrerName ||
                    '系統／無推薦人'
                  }}
                </td>

                <td>
                  <MemberStatusBadge
  :status="member.status"
/>
                </td>

                <td>
                  <div class="date-info">
                    <strong>
                      {{
                        formatDate(
                          member.createdAt,
                        )
                      }}
                    </strong>

                    <small>
                      建立日期
                    </small>
                  </div>
                </td>

                <td>
                  <div class="action-buttons">
                    <button
                      class="text-button"
                      type="button"
                      @click="
                        handleViewMember(
                          member.id,
                        )
                      "
                    >
                      查看
                    </button>

                    <button
                      v-if="
                        permissionStore.hasPermission(
                          'member.update',
                        )
                      "
                      class="text-button"
                      type="button"
                      @click="
                        handleEditMember(
                          member.id,
                        )
                      "
                    >
                      編輯
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 分頁 -->
        <footer
          v-if="
            !isLoading &&
            !error &&
            pagination.total > 0
          "
          class="pagination"
        >
          <div class="pagination__summary">
            共
            <strong>
              {{
                pagination.total
                  .toLocaleString()
              }}
            </strong>
            筆會員資料

            <span>
              每頁
              {{ pagination.pageSize }}
              筆
            </span>
          </div>

          <div class="pagination__controls">
            <button
              class="pagination-button"
              type="button"
              :disabled="
                !pagination.hasPreviousPage ||
                isLoading
              "
              @click="handlePreviousPage"
            >
              上一頁
            </button>

            <span class="pagination__page">
              第
              <strong>
                {{ pagination.page }}
              </strong>
              頁

              <span>
                ／
              </span>

              共
              <strong>
                {{
                  pagination.totalPages ||
                  1
                }}
              </strong>
              頁
            </span>

            <button
              class="pagination-button"
              type="button"
              :disabled="
                !pagination.hasNextPage ||
                isLoading
              "
              @click="handleNextPage"
            >
              下一頁
            </button>
          </div>
        </footer>
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
  hasPermission,
} from '../../lib/auth/permission'

import {
  useRouter,
} from 'vue-router'

import AdminLayout from '../../layouts/AdminLayout.vue'

import MemberStatusBadge from '../../components/member/MemberStatusBadge.vue'

import {
  useMemberStore,
} from '../../stores/member'

import {
  usePermissionStore,
} from '../../stores/permission'

import type {
  MemberSortField,
  MemberStatus,
  SortDirection,
} from '../../types/member'

const router = useRouter()

const canDeleteMember = computed(() =>
  hasPermission(
    {
      permissions: [
        "member.delete"
      ]
    },
    "member.delete"
  )
)

const permissionStore =
  usePermissionStore()

const memberStore =
  useMemberStore()

const keyword = ref('')

const levelFilter =
  ref<string>('')

const statusFilter =
  ref<MemberStatus | ''>('')

const selectedMemberIds =
  ref<string[]>([])

const isBulkUpdating =
  ref(false)

const isBulkDeleting =
  ref(false)

const bulkActionMessage =
  ref<string | null>(null)

const bulkActionError =
  ref<string | null>(null)
const createdFrom =
  ref('')

const createdTo =
  ref('')

const sortBy =
  ref<MemberSortField>(
    'created_at',
  )

const sortDirection =
  ref<SortDirection>(
    'desc',
  )

const pageSize =
  ref(20)

const isAdvancedFilterOpen =
  ref(false)

const members = computed(
  () => memberStore.members,
)

const statistics = computed(
  () => memberStore.statistics,
)

const pagination = computed(
  () => memberStore.pagination,
)

const isLoading = computed(
  () => memberStore.isLoading,
)

const error = computed(
  () => memberStore.error,
)
const hasAdvancedFilters =
  computed(() =>
    Boolean(
      createdFrom.value ||
      createdTo.value ||
      sortBy.value !==
        'created_at' ||
      sortDirection.value !==
        'desc' ||
      pageSize.value !== 20,
    ),
  )
  const hasBasicFilters =
  computed(() =>
    Boolean(
      keyword.value.trim() ||
      levelFilter.value ||
      statusFilter.value,
    ),
  )
const hasSelectedMembers =
  computed(() =>
    selectedMemberIds.value.length > 0,
  )

const selectedCount =
  computed(() =>
    selectedMemberIds.value.length,
  )

const isAllSelected =
  computed(() => {
    if (
      members.value.length === 0
    ) {
      return false
    }

    return (
      selectedMemberIds.value
        .length ===
      members.value.length
    )
  })
const hasAnyFilters =
  computed(() =>
    hasBasicFilters.value ||
    hasAdvancedFilters.value,
  )
onMounted(async () => {
  keyword.value =
    memberStore.filters.keyword ?? ''

  levelFilter.value =
    typeof memberStore.filters.level ===
      'number'
      ? String(memberStore.filters.level)
      : ''

  statusFilter.value =
    memberStore.filters.status ?? ''

  createdFrom.value =
    memberStore.filters.createdFrom ?? ''

  createdTo.value =
    memberStore.filters.createdTo ?? ''

  sortBy.value =
    memberStore.filters.sortBy ??
    'created_at'

  sortDirection.value =
    memberStore.filters.sortDirection ??
    'desc'

  pageSize.value =
    memberStore.filters.pageSize ??
    20

  await memberStore.fetchMembers()
})

function getMemberInitial(
  name: string,
): string {
  const normalizedName =
    name.trim()

  if (!normalizedName) {
    return '?'
  }

  return normalizedName.slice(0, 1)
}

function formatDate(
  value: string,
): string {
  if (!value) {
    return '-'
  }

  const date = new Date(value)

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
    },
  ).format(date)
}

async function handleSearch():
  Promise<void> {
  await memberStore.searchMembers(
    keyword.value,
  )
}

async function handleRefresh():
  Promise<void> {
  await memberStore.refreshMembers()
}
async function handleExportMembers():
  Promise<void> {
  await memberStore.exportMembers()
}
async function handleExportMembersCsv():
  Promise<void> {
  await memberStore.exportMembersCsv()
}
async function handleResetFilters():
  Promise<void> {
  keyword.value = ''
  levelFilter.value = ''
  statusFilter.value = ''

  createdFrom.value = ''
  createdTo.value = ''
  sortBy.value = 'created_at'
  sortDirection.value = 'desc'
  pageSize.value = 20

  await memberStore.resetFilters()

  clearSelections()
}

async function handleStatusChange():
  Promise<void> {
  await memberStore.setStatusFilter(
    statusFilter.value,
  )
}

async function handleLevelChange():
  Promise<void> {
  if (!levelFilter.value) {
    await memberStore.setLevelFilter(
      null,
    )

    return
  }

  const parsedLevel =
    Number(levelFilter.value)

  if (
    !Number.isInteger(parsedLevel) ||
    parsedLevel < 1
  ) {
    return
  }

  await memberStore.setLevelFilter(
    parsedLevel,
  )
}

async function handleApplyAdvancedFilters():
  Promise<void> {
  if (
    createdFrom.value &&
    createdTo.value &&
    createdFrom.value >
      createdTo.value
  ) {
    window.alert(
      '建立日期起始日不可晚於結束日。',
    )

    return
  }

  memberStore.filters.createdFrom =
    createdFrom.value ||
    undefined

  memberStore.filters.createdTo =
    createdTo.value
      ? `${createdTo.value}T23:59:59.999`
      : undefined

  memberStore.filters.sortBy =
    sortBy.value

  memberStore.filters.sortDirection =
    sortDirection.value

  memberStore.filters.pageSize =
    pageSize.value

  memberStore.filters.page = 1

  await memberStore.fetchMembers()
}

async function handleClearAdvancedFilters():
  Promise<void> {
  createdFrom.value = ''
  createdTo.value = ''
  sortBy.value = 'created_at'
  sortDirection.value = 'desc'
  pageSize.value = 20

  memberStore.filters.createdFrom =
    undefined

  memberStore.filters.createdTo =
    undefined

  memberStore.filters.sortBy =
    'created_at'

  memberStore.filters.sortDirection =
    'desc'

  memberStore.filters.pageSize =
    20

  memberStore.filters.page = 1

  await memberStore.fetchMembers()
}

function toggleAdvancedFilters():
  void {
  isAdvancedFilterOpen.value =
    !isAdvancedFilterOpen.value
}

async function handlePreviousPage():
  Promise<void> {
  await memberStore.goToPreviousPage()
}

async function handleNextPage():
  Promise<void> {
  await memberStore.goToNextPage()
}
function toggleMemberSelection(
  memberId: string,
): void {
  const index =
    selectedMemberIds.value.indexOf(
      memberId,
    )

  if (index >= 0) {
        selectedMemberIds.value.splice(
      index,
      1,
    )

    return
  }

  selectedMemberIds.value.push(
    memberId,
  )
}

function toggleSelectAll():
  void {
  if (isAllSelected.value) {
    selectedMemberIds.value = []

    return
  }

  selectedMemberIds.value =
    members.value.map(
      (member) => member.id,
    )
}

function clearSelections():
  void {
  selectedMemberIds.value = []
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

async function handleBulkStatusChange(
  status: MemberStatus,
): Promise<void> {
  if (
    isBulkUpdating.value ||
    isBulkDeleting.value ||
    selectedMemberIds.value.length === 0
  ) {
    return
  }

  const statusLabel =
    getStatusLabel(
      status,
    )

  const targetCount =
    selectedMemberIds.value.length

  const confirmed =
    window.confirm(
      `確定要將已選取的 ${targetCount} 位會員狀態改為「${statusLabel}」嗎？`,
    )

  if (!confirmed) {
    return
  }

  isBulkUpdating.value = true
  bulkActionMessage.value = null
  bulkActionError.value = null

  try {
    const success =
      await memberStore
        .changeMultipleMemberStatuses(
          [
            ...selectedMemberIds.value,
          ],
          status,
        )

    if (!success) {
      throw new Error(
        memberStore.error ||
        '批次更新會員狀態失敗。',
      )
    }

    bulkActionMessage.value =
      `已成功將 ${targetCount} 位會員設為「${statusLabel}」。`

    clearSelections()
  } catch (caughtError) {
    bulkActionError.value =
      caughtError instanceof Error
        ? caughtError.message
        : '批次更新會員狀態發生未知錯誤。'
  } finally {
    isBulkUpdating.value = false
  }
}

async function handleBulkDelete():
  Promise<void> {
  if (
    isBulkDeleting.value ||
    isBulkUpdating.value ||
    selectedMemberIds.value.length === 0
  ) {
    return
  }

  const targetIds = [
    ...selectedMemberIds.value,
  ]

  const targetCount =
    targetIds.length

  const firstConfirmed =
    window.confirm(
      `你即將永久刪除 ${targetCount} 位會員。此操作會直接刪除 Supabase members 資料，是否繼續？`,
    )

  if (!firstConfirmed) {
    return
  }

  const confirmationText =
    window.prompt(
      '請輸入 DELETE 確認永久刪除：',
    )

  if (
    confirmationText?.trim() !==
    'DELETE'
  ) {
    window.alert(
      '確認文字不正確，已取消刪除。',
    )

    return
  }

  isBulkDeleting.value = true
  bulkActionMessage.value = null
  bulkActionError.value = null

  try {
    const success =
      await memberStore
        .deleteMultipleMembers(
          targetIds,
        )

    if (!success) {
      throw new Error(
        memberStore.error ||
        '批次刪除會員失敗。',
      )
    }

    bulkActionMessage.value =
      `已成功刪除 ${targetCount} 位會員。`

    clearSelections()
  } catch (caughtError) {
    bulkActionError.value =
      caughtError instanceof Error
        ? caughtError.message
        : '批次刪除會員發生未知錯誤。'
  } finally {
    isBulkDeleting.value = false
  }
}
function handleCreateMember():
  void {
  router.push(
    '/members/create',
  )
}

function handleViewMember(
  id: string,
): void {
  router.push(
    `/members/${id}`,
  )
}

function handleEditMember(
  id: string,
): void {
  router.push(
    `/members/${id}/edit`,
  )
}
</script>
<style scoped>
.export-button {
  border-color: #bfdbfe;
  background: #eff6ff;
  color: #1d4ed8;
}

.export-button:hover:not(:disabled) {
  border-color: #93c5fd;
  background: #dbeafe;
  color: #1e40af;
}
.export-button--csv {
  border-color: #a7f3d0;
  background: #ecfdf5;
  color: #047857;
}

.export-button--csv:hover:not(:disabled) {
  border-color: #6ee7b7;
  background: #d1fae5;
  color: #065f46;
}
.member-page {
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

.page-header__content {
  min-width: 0;
}

.page-header__actions {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 12px;
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
 * Buttons
 * ======================================================= */

.primary-button,
.secondary-button,
.search-button,
.reset-button,
.advanced-filter-button,
.error-panel__button,
.pagination-button,
.text-button {
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
.search-button:disabled,
.reset-button:disabled,
.advanced-filter-button:disabled,
.error-panel__button:disabled,
.pagination-button:disabled,
.text-button:disabled {
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
  min-height: 148px;
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

.summary-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.summary-card__header > span:first-child {
  color: #64748b;
  font-size: 14px;
  font-weight: 700;
}

.summary-card__icon {
  display: grid;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  place-items: center;
  border-radius: 10px;
  background: #eef2ff;
  color: #3157d6;
  font-size: 12px;
  font-weight: 900;
}

.summary-card__icon--success {
  background: #dcfce7;
  color: #15803d;
}

.summary-card__icon--danger {
  background: #fee2e2;
  color: #b91c1c;
}

.summary-card strong {
  margin: 16px 0 8px;
  color: #0f172a;
  font-size: 32px;
  font-weight: 900;
  line-height: 1;
}

.summary-card small {
  margin-top: auto;
  color: #94a3b8;
  font-size: 13px;
}

/* =========================================================
 * Error Panel
 * ======================================================= */

.error-panel {
  display: flex;
  padding: 18px 20px;
  border: 1px solid #fecaca;
  border-radius: 14px;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  background: #fef2f2;
}

.error-panel strong {
  color: #991b1b;
  font-size: 15px;
}

.error-panel p {
  margin: 5px 0 0;
  color: #b91c1c;
  font-size: 13px;
  line-height: 1.6;
}

.error-panel__button {
  flex-shrink: 0;
  padding: 0 16px;
  border: 1px solid #ef4444;
  background: #ffffff;
  color: #b91c1c;
}

.error-panel__button:hover {
  background: #fee2e2;
}

/* =========================================================
 * Table Card and Toolbar
 * ======================================================= */

.table-card {
  overflow: hidden;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  background: #ffffff;
  box-shadow:
    0 10px 25px
    rgba(15, 23, 42, 0.05);
}

.table-toolbar {
  display: flex;
  padding: 22px 24px;
  border-bottom: 1px solid #e5e7eb;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.table-toolbar__title {
  flex-shrink: 0;
}

.table-toolbar h2 {
  margin: 0;
  color: #0f172a;
  font-size: 21px;
  font-weight: 800;
}

.table-toolbar p {
  margin: 6px 0 0;
  color: #94a3b8;
  font-size: 13px;
}

.toolbar-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}

.search-group {
  display: flex;
  align-items: center;
}

.search-input,
.filter-select {
  min-height: 42px;
  border: 1px solid #dbe2ea;
  background: #ffffff;
  color: #0f172a;
  font: inherit;
  font-size: 14px;
  outline: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.search-input {
  width: 290px;
  padding: 0 14px;
  border-radius: 10px 0 0 10px;
}

.search-input::placeholder {
  color: #94a3b8;
}

.filter-select {
  padding: 0 34px 0 12px;
  border-radius: 10px;
  cursor: pointer;
}

.search-input:focus,
.filter-select:focus {
  z-index: 1;
  border-color: #3157d6;
  box-shadow:
    0 0 0 3px
    rgba(49, 87, 214, 0.12);
}

.search-input:disabled,
.filter-select:disabled {
  cursor: not-allowed;
  background: #f8fafc;
  color: #94a3b8;
}

.search-button {
  min-width: 68px;
  padding: 0 14px;
  border: 1px solid #3157d6;
  border-left: 0;
  border-radius: 0 10px 10px 0;
  background: #3157d6;
  color: #ffffff;
}

.search-button:hover:not(:disabled) {
  background: #2547bd;
}

.reset-button {
  padding: 0 14px;
  border: 1px solid #dbe2ea;
  background: #ffffff;
  color: #64748b;
}

.reset-button:hover:not(:disabled) {
  border-color: #bac5d4;
  background: #f8fafc;
  color: #0f172a;
}
.advanced-filter-button {
  display: inline-flex;
  padding: 0 14px;
  border: 1px solid #dbe2ea;
  align-items: center;
  gap: 8px;
  background: #ffffff;
  color: #475569;
}

.advanced-filter-button:hover:not(:disabled),
.advanced-filter-button--active {
  border-color: #3157d6;
  background: #eef2ff;
  color: #3157d6;
}

.filter-indicator {
  display: inline-flex;
  min-height: 20px;
  padding: 0 7px;
  border-radius: 999px;
  align-items: center;
  background: #3157d6;
  color: #ffffff;
  font-size: 10px;
  font-weight: 800;
}

.advanced-filter-panel {
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: #f8fafc;
}

.advanced-filter-grid {
  display: grid;
  grid-template-columns:
    repeat(5, minmax(0, 1fr));
  gap: 16px;
}

.advanced-filter-field {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 8px;
}

.advanced-filter-field label {
  color: #475569;
  font-size: 12px;
  font-weight: 800;
}

.advanced-filter-input,
.advanced-filter-select {
  width: 100%;
  min-height: 42px;
  padding: 0 12px;
  border: 1px solid #dbe2ea;
  border-radius: 10px;
  background: #ffffff;
  color: #0f172a;
  font: inherit;
  font-size: 13px;
  outline: none;
}

.advanced-filter-input:focus,
.advanced-filter-select:focus {
  border-color: #3157d6;
  box-shadow:
    0 0 0 3px
    rgba(49, 87, 214, 0.12);
}

.advanced-filter-input:disabled,
.advanced-filter-select:disabled {
  cursor: not-allowed;
  background: #f1f5f9;
  color: #94a3b8;
}

.advanced-filter-actions {
  display: flex;
  margin-top: 18px;
  justify-content: flex-end;
  gap: 10px;
}
.active-filter-summary {
  display: flex;
  padding: 14px 24px;
  border-bottom: 1px solid #e5e7eb;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  background: #ffffff;
}

.active-filter-summary__content {
  display: flex;
  min-width: 0;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.active-filter-summary__content > strong {
  flex-shrink: 0;
  color: #334155;
  font-size: 12px;
  font-weight: 800;
}

.active-filter-tags {
  display: flex;
  min-width: 0;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-tag {
  display: inline-flex;
  min-height: 28px;
  padding: 0 10px;
  border: 1px solid #c7d2fe;
  border-radius: 999px;
  align-items: center;
  background: #eef2ff;
  color: #3157d6;
  font-size: 11px;
  font-weight: 700;
}

.clear-all-filters-button {
  min-height: 36px;
  padding: 0 13px;
  border: 1px solid #dbe2ea;
  border-radius: 9px;
  flex-shrink: 0;
  background: #ffffff;
  color: #64748b;
  cursor: pointer;
  font: inherit;
  font-size: 12px;
  font-weight: 800;
}

.clear-all-filters-button:hover:not(:disabled) {
  border-color: #fca5a5;
  background: #fef2f2;
  color: #b91c1c;
}

.clear-all-filters-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}
/* =========================================================
 * Loading and Empty State
 * ======================================================= */

.state-panel {
  display: flex;
  min-height: 320px;
  padding: 48px 24px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  text-align: center;
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

.state-panel__icon {
  display: grid;
  width: 72px;
  height: 72px;
  place-items: center;
  border-radius: 22px;
  background: #eef2ff;
  color: #3157d6;
  font-size: 14px;
  font-weight: 900;
}

.loading-spinner {
  width: 42px;
  height: 42px;
  border: 4px solid #e0e7ff;
  border-top-color: #3157d6;
  border-radius: 50%;
  animation: member-spin 0.8s linear infinite;
}

@keyframes member-spin {
  to {
    transform: rotate(360deg);
  }
}
.bulk-action-bar {
  display: flex;
  min-height: 64px;
  padding: 12px 24px;
  border-bottom: 1px solid #c7d2fe;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background: #eef2ff;
}

.bulk-action-bar__summary {
  color: #475569;
  font-size: 13px;
  font-weight: 700;
}

.bulk-action-bar__summary strong {
  margin: 0 4px;
  color: #3157d6;
  font-size: 16px;
}

.bulk-action-bar__actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
.bulk-status-button {
  min-height: 38px;
  padding: 0 13px;
  border: 1px solid transparent;
  border-radius: 9px;
  cursor: pointer;
  font: inherit;
  font-size: 12px;
  font-weight: 800;
}

.bulk-status-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.bulk-status-button--success {
  border-color: #86efac;
  background: #f0fdf4;
  color: #15803d;
}

.bulk-status-button--pending {
  border-color: #fcd34d;
  background: #fffbeb;
  color: #b45309;
}

.bulk-status-button--warning {
  border-color: #fdba74;
  background: #fff7ed;
  color: #c2410c;
}

.bulk-status-button--danger {
  border-color: #fca5a5;
  background: #fef2f2;
  color: #b91c1c;
}
.bulk-status-button--delete {
  border-color: #991b1b;
  background: #7f1d1d;
  color: #ffffff;
}

.bulk-status-button--delete:hover:not(:disabled) {
  border-color: #7f1d1d;
  background: #450a0a;
  color: #ffffff;
}
.bulk-feedback {
  padding: 13px 24px;
  border-bottom: 1px solid;
  font-size: 13px;
  font-weight: 700;
}

.bulk-feedback--success {
  border-color: #bbf7d0;
  background: #f0fdf4;
  color: #15803d;
}

.bulk-feedback--error {
  border-color: #fecaca;
  background: #fef2f2;
  color: #b91c1c;
}
.selection-column {
  width: 52px;
  min-width: 52px;
  padding-right: 10px;
  padding-left: 18px;
  text-align: center;
}

.selection-checkbox {
  width: 17px;
  height: 17px;
  cursor: pointer;
  accent-color: #3157d6;
}

.selection-checkbox:disabled {
  cursor: not-allowed;
}

.table-row--selected {
  background: #f5f7ff;
}

.table-row--selected:hover {
  background: #eef2ff;
}
.bulk-action-bar {
  display: flex;
  min-height: 64px;
  padding: 12px 24px;
  border-bottom: 1px solid #c7d2fe;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background: #eef2ff;
}

.bulk-action-bar__summary {
  color: #475569;
  font-size: 13px;
  font-weight: 700;
}

/* =========================================================
 * Table
 * ======================================================= */

.table-wrapper {
  overflow-x: auto;
}

table {
  width: 100%;
  min-width: 1180px;
  border-collapse: collapse;
}

th,
td {
  padding: 16px 18px;
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
  font-size: 14px;
}

tbody tr {
  transition: background-color 0.2s ease;
}

tbody tr:hover {
  background: #f8fafc;
}

tbody tr:last-child td {
  border-bottom: 0;
}

/* =========================================================
 * Member Data
 * ======================================================= */

.member-profile {
  display: flex;
  min-width: 210px;
  align-items: center;
  gap: 12px;
}

.member-avatar {
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  border: 1px solid #e0e7ff;
  border-radius: 12px;
  object-fit: cover;
}

.member-avatar--fallback {
  display: grid;
  place-items: center;
  background: #eef2ff;
  color: #3157d6;
  font-size: 16px;
  font-weight: 900;
}

.member-profile__content {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 4px;
}

.member-profile__content strong {
  max-width: 190px;
  overflow: hidden;
  color: #0f172a;
  font-size: 14px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.member-profile__content small {
  max-width: 190px;
  overflow: hidden;
  color: #94a3b8;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.member-code {
  display: inline-flex;
  padding: 5px 9px;
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

.contact-link {
  color: #3157d6;
  text-decoration: none;
}

.contact-link:hover {
  text-decoration: underline;
}

.empty-value {
  color: #94a3b8;
  font-size: 13px;
}

.level-info,
.date-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.level-info strong,
.date-info strong {
  color: #334155;
  font-size: 13px;
  font-weight: 800;
}

.level-info small,
.date-info small {
  color: #94a3b8;
  font-size: 11px;
}

/* =========================================================
 * Status
 * ======================================================= */

.status-badge {
  display: inline-flex;
  min-width: 56px;
  padding: 5px 10px;
  border-radius: 999px;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
}

.status-badge--active {
  background: #dcfce7;
  color: #15803d;
}

.status-badge--pending {
  background: #fef3c7;
  color: #b45309;
}

.status-badge--disabled {
  background: #fee2e2;
  color: #b91c1c;
}

.status-badge--warning {
  background: #ffedd5;
  color: #c2410c;
}

.status-badge--deleted {
  background: #e2e8f0;
  color: #475569;
}

/* =========================================================
 * Row Actions
 * ======================================================= */

.action-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.text-button {
  min-height: 34px;
  padding: 0 12px;
  border: 0;
  background: #eef2ff;
  color: #3157d6;
}

.text-button:hover:not(:disabled) {
  background: #dfe6ff;
  transform: translateY(-1px);
}

/* =========================================================
 * Pagination
 * ======================================================= */

.pagination {
  display: flex;
  min-height: 72px;
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  background: #ffffff;
}

.pagination__summary {
  color: #64748b;
  font-size: 13px;
}

.pagination__summary strong {
  color: #0f172a;
}

.pagination__summary span {
  margin-left: 12px;
  color: #94a3b8;
}

.pagination__controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pagination-button {
  padding: 0 14px;
  border: 1px solid #dbe2ea;
  background: #ffffff;
  color: #334155;
}

.pagination-button:hover:not(:disabled) {
  border-color: #3157d6;
  color: #3157d6;
}

.pagination__page {
  min-width: 150px;
  color: #64748b;
  font-size: 13px;
  text-align: center;
}

.pagination__page strong {
  color: #0f172a;
}

.pagination__page span {
  margin: 0 4px;
  color: #cbd5e1;
}

/* =========================================================
 * Responsive
 * ======================================================= */

@media (max-width: 1280px) {
    .advanced-filter-grid {
    grid-template-columns:
      repeat(3, minmax(0, 1fr));
  }
  .table-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .table-toolbar__title {
    flex-shrink: 1;
  }

  .toolbar-actions {
    justify-content: flex-start;
  }
}

@media (max-width: 1100px) {
  .summary-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .search-group {
    flex: 1;
    min-width: 320px;
  }

  .search-input {
    width: 100%;
  }
}

@media (max-width: 760px) {
    .bulk-action-bar {
    align-items: stretch;
    flex-direction: column;
  }

  .bulk-action-bar__actions {
    width: 100%;
  }

  .bulk-action-bar__actions button {
    width: 100%;
  }

  .bulk-action-bar__actions {
    width: 100%;
  }

  .bulk-action-bar__actions button {
    width: 100%;
  }
  .active-filter-summary {
    align-items: stretch;
    flex-direction: column;
  }

  .active-filter-summary__content {
    align-items: flex-start;
    flex-direction: column;
  }

  .clear-all-filters-button {
    width: 100%;
  }

    .advanced-filter-grid {
    grid-template-columns: 1fr;
  }

  .advanced-filter-actions {
    flex-direction: column;
  }

  .advanced-filter-actions button {
    width: 100%;
  }

  .advanced-filter-button {
    width: 100%;
    justify-content: center;
  }
  .member-page {
    gap: 18px;
  }

  .page-header {
    flex-direction: column;
  }

  .page-header__actions {
    width: 100%;
  }

  .page-header__actions button {
    flex: 1;
  }

  .page-header h1 {
    font-size: 29px;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .toolbar-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .search-group {
    width: 100%;
    min-width: 0;
  }

  .filter-select,
  .reset-button {
    width: 100%;
  }

  .error-panel {
    align-items: stretch;
    flex-direction: column;
  }

  .error-panel__button {
    width: 100%;
  }

  .pagination {
    align-items: stretch;
    flex-direction: column;
  }

  .pagination__summary {
    text-align: center;
  }

  .pagination__summary span {
    display: block;
    margin: 5px 0 0;
  }

  .pagination__controls {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .page-header__actions {
    flex-direction: column;
  }

  .page-header__actions button {
    width: 100%;
  }

  .table-toolbar {
    padding: 18px;
  }

  .search-group {
    flex-direction: column;
    gap: 8px;
  }

  .search-input {
    border-radius: 10px;
  }

  .search-button {
    width: 100%;
    border: 1px solid #3157d6;
    border-radius: 10px;
  }

  .pagination__controls {
    flex-wrap: wrap;
  }

  .pagination__page {
    order: -1;
    width: 100%;
  }
}
</style>