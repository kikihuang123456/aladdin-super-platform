import {
  computed,
  ref,
} from 'vue'

import {
  defineStore,
} from 'pinia'

import {
  batchUpdateMemberStatus,
  getMembers,
  updateMemberStatus,
} from '../api/member'

import {
  deleteMembers,
} from '../api/memberDelete'

import {
  exportMemberCsv,
  exportMemberExcel,
} from '../utils/memberExport'

import type {
  MemberFilters,
  MemberListItem,
  MemberStatistics,
  PaginationMeta,
} from '../types/member'

const DEFAULT_PAGE_SIZE = 20

function createEmptyStatistics():
  MemberStatistics {
  return {
    total: 0,
    active: 0,
    disabled: 0,
    pending: 0,
    suspended: 0,
    newToday: 0,
    newThisWeek: 0,
    newThisMonth: 0,
    taiwanMarket: 0,
    chinaMarket: 0,
    globalMarket: 0,
  }
}

function createEmptyPagination():
  PaginationMeta {
  return {
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    total: 0,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  }
}

function createDefaultFilters():
  MemberFilters {
  return {
    keyword: '',
    market: '',
    status: '',
    level: null,
    levelCode: '',
    roleCode: '',
    createdFrom: '',
    createdTo: '',
    referrerCode: '',
    sortBy: 'created_at',
    sortDirection: 'desc',
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
  }
}

export const useMemberStore =
  defineStore(
    'member',
    () => {
      const members =
        ref<MemberListItem[]>([])

      const statistics =
        ref<MemberStatistics>(
          createEmptyStatistics(),
        )

      const pagination =
        ref<PaginationMeta>(
          createEmptyPagination(),
        )

      const filters =
        ref<MemberFilters>(
          createDefaultFilters(),
        )

      const isLoading =
        ref(false)

      const error =
        ref<string | null>(null)

      const hasMembers =
        computed(() =>
          members.value.length > 0,
        )

      const isEmpty =
        computed(() =>
          !isLoading.value &&
          members.value.length === 0,
        )

      const currentPage =
        computed(() =>
          pagination.value.page,
        )

      const totalPages =
        computed(() =>
          pagination.value.totalPages,
        )

      const totalMembers =
        computed(() =>
          pagination.value.total,
        )

      async function fetchMembers():
        Promise<void> {
        isLoading.value = true
        error.value = null

        try {
          const response =
            await getMembers({
              ...filters.value,
            })

          if (!response.success) {
            throw new Error(
              response.error ||
              response.message ||
              '會員資料載入失敗。',
            )
          }

          members.value =
            response.members

          statistics.value =
            response.statistics

          pagination.value =
            response.pagination
        } catch (caughtError) {
          members.value = []

          statistics.value =
            createEmptyStatistics()

          pagination.value =
            createEmptyPagination()

          error.value =
            caughtError instanceof Error
              ? caughtError.message
              : '會員資料載入發生未知錯誤。'

          console.error(
            '[MemberStore] fetchMembers failed:',
            caughtError,
          )
        } finally {
          isLoading.value = false
        }
      }
async function deleteMultipleMembers(
  memberIds: string[],
): Promise<boolean> {
  const normalizedIds =
    Array.from(
      new Set(
        memberIds
          .map(
            (memberId) =>
              memberId.trim(),
          )
          .filter(Boolean),
      ),
    )

  if (normalizedIds.length === 0) {
    error.value =
      '請至少選取一位會員。'

    return false
  }

  isLoading.value = true
  error.value = null

  try {
    const response =
      await deleteMembers({
        memberIds:
          normalizedIds,
      })
    

    if (!response.success) {
      throw new Error(
        response.error ||
        response.message ||
        '批次刪除會員失敗。',
      )
    }

    members.value =
      members.value.filter(
        (member) =>
          !response.deletedIds.includes(
            member.id,
          ),
      )

    await fetchMembers()

    return true
  } catch (caughtError) {
    error.value =
      caughtError instanceof Error
        ? caughtError.message
        : '批次刪除會員發生未知錯誤。'

    return false
  } finally {
    isLoading.value = false
  }
}
async function exportMembersCsv():
  Promise<void> {
  error.value = null

  if (members.value.length === 0) {
    error.value =
      '目前沒有可匯出的會員資料。'

    return
  }

  try {
    exportMemberCsv(
      members.value,
    )
  } catch (caughtError) {
    error.value =
      caughtError instanceof Error
        ? caughtError.message
        : '會員 CSV 匯出發生未知錯誤。'
  }
}
async function exportMembers():
  Promise<void> {
  error.value = null

  if (members.value.length === 0) {
    error.value =
      '目前沒有可匯出的會員資料。'

    return
  }

  try {
    exportMemberExcel(
      members.value,
    )
  } catch (caughtError) {
    error.value =
      caughtError instanceof Error
        ? caughtError.message
        : '會員 Excel 匯出發生未知錯誤。'
  }
}

async function importMembers(
  file: File,
): Promise<boolean> {
  console.log(
    'import members',
    file.name,
  )

  return true
}

      async function changeMemberStatus(
        memberId: string,
        status:
          MemberFilters['status'],
      ): Promise<boolean> {
        if (
          !memberId ||
          !status
        ) {
          error.value =
            '會員 ID 或狀態不正確。'

          return false
        }

        isLoading.value = true
        error.value = null

        try {
          const response =
            await updateMemberStatus({
              id:
                memberId,

              status,
            })

          if (
            !response.success ||
            !response.member
          ) {
            throw new Error(
              response.error ||
              response.message ||
              '會員狀態更新失敗。',
            )
          }

          const index =
            members.value.findIndex(
              (member) =>
                member.id ===
                memberId,
            )

          if (index >= 0) {
            members.value[index] = {
              ...members.value[index],
              status:
                response.member.status,
              updatedAt:
                response.member.updatedAt,
            }
          }

          await fetchMembers()

          return true
        } catch (caughtError) {
          error.value =
            caughtError instanceof Error
              ? caughtError.message
              : '會員狀態更新發生未知錯誤。'

          return false
        } finally {
          isLoading.value = false
        }
      }

      async function changeMultipleMemberStatuses(
        memberIds: string[],
        status:
          MemberFilters['status'],
      ): Promise<boolean> {
        const normalizedIds =
          Array.from(
            new Set(
              memberIds
                .map(
                  (memberId) =>
                    memberId.trim(),
                )
                .filter(Boolean),
            ),
          )

        if (
          normalizedIds.length === 0 ||
          !status
        ) {
          error.value =
            '請選取會員並指定正確狀態。'

          return false
        }

        isLoading.value = true
        error.value = null

        try {
          const response =
            await batchUpdateMemberStatus({
              memberIds:
                normalizedIds,

              status,
            })

          if (!response.success) {
            throw new Error(
              response.error ||
              response.message ||
              '批次更新會員狀態失敗。',
            )
          }

          const updatedAt =
            new Date().toISOString()

          members.value =
            members.value.map(
              (member) =>
                response.updatedIds.includes(
                  member.id,
                )
                  ? {
                      ...member,
                      status,
                      updatedAt,
                    }
                  : member,
            )

          await fetchMembers()

          return true
        } catch (caughtError) {
          error.value =
            caughtError instanceof Error
              ? caughtError.message
              : '批次更新會員狀態發生未知錯誤。'

          return false
        } finally {
          isLoading.value = false
        }
      }

      async function refreshMembers():
        Promise<void> {
        await fetchMembers()
      }

      async function searchMembers(
        keyword: string,
      ): Promise<void> {
        filters.value.keyword =
          keyword.trim()

        filters.value.page = 1

        await fetchMembers()
      }

      async function setStatusFilter(
        status:
          MemberFilters['status'],
      ): Promise<void> {
        filters.value.status =
          status ?? ''

        filters.value.page = 1

        await fetchMembers()
      }

      async function setLevelFilter(
        level:
          number | null,
      ): Promise<void> {
        filters.value.level =
          level

        filters.value.page = 1

        await fetchMembers()
      }

      async function setMarketFilter(
        market:
          MemberFilters['market'],
      ): Promise<void> {
        filters.value.market =
          market ?? ''

        filters.value.page = 1

        await fetchMembers()
      }

      async function setPage(
        page: number,
      ): Promise<void> {
        if (
          !Number.isInteger(page) ||
          page < 1
        ) {
          return
        }

        if (
          pagination.value.totalPages >
            0 &&
          page >
            pagination.value.totalPages
        ) {
          return
        }

        filters.value.page =
          page

        await fetchMembers()
      }

      async function goToPreviousPage():
        Promise<void> {
        if (
          !pagination.value
            .hasPreviousPage
        ) {
          return
        }

        await setPage(
          pagination.value.page - 1,
        )
      }

      async function goToNextPage():
        Promise<void> {
        if (
          !pagination.value
            .hasNextPage
        ) {
          return
        }

        await setPage(
          pagination.value.page + 1,
        )
      }

      async function setPageSize(
        pageSize: number,
      ): Promise<void> {
        if (
          !Number.isInteger(
            pageSize,
          ) ||
          pageSize < 1
        ) {
          return
        }

        filters.value.pageSize =
          pageSize

        filters.value.page = 1

        await fetchMembers()
      }

      async function setSorting(
        sortBy:
          MemberFilters['sortBy'],
        sortDirection:
          MemberFilters[
            'sortDirection'
          ],
      ): Promise<void> {
        filters.value.sortBy =
          sortBy ??
          'created_at'

        filters.value.sortDirection =
          sortDirection ??
          'desc'

        filters.value.page = 1

        await fetchMembers()
      }

      async function resetFilters():
        Promise<void> {
        filters.value =
          createDefaultFilters()

        await fetchMembers()
      }

      function clearError():
        void {
        error.value = null
      }

      function clearMemberState():
        void {
        members.value = []

        statistics.value =
          createEmptyStatistics()

        pagination.value =
          createEmptyPagination()

        filters.value =
          createDefaultFilters()

        isLoading.value = false
        error.value = null
      }

      return {
        members,
        statistics,
        pagination,
        filters,
        isLoading,
        error,

        hasMembers,
        isEmpty,
        currentPage,
        totalPages,
        totalMembers,

        fetchMembers,
        refreshMembers,
        searchMembers,
        setStatusFilter,
        setLevelFilter,
        setMarketFilter,
        setPage,
        goToPreviousPage,
        goToNextPage,
        setPageSize,
        setSorting,
        resetFilters,
        clearError,
        clearMemberState,
        changeMemberStatus,
        changeMultipleMemberStatuses,
        deleteMultipleMembers,
        exportMembers,
        exportMembersCsv,
        importMembers,
      }
    },
  )

export default useMemberStore