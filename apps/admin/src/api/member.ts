import type {
  MemberApiError,
  MemberFilters,
  MemberInsert,
  MemberListItem,
  MemberListResponse,
  MemberMutationResponse,
  MemberRecord,
  MemberStatistics,
  PaginationMeta,
} from '../types/member'

import {
  supabase,
} from '../lib/supabase'

const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 20
const MAX_PAGE_SIZE = 100

type MemberStatusValue =
  MemberRecord['status']

interface MemberCountResult {
  count: number
}

function normalizePage(
  page?: number,
): number {
  if (
    !page ||
    !Number.isFinite(page) ||
    page < 1
  ) {
    return DEFAULT_PAGE
  }

  return Math.floor(page)
}

function normalizePageSize(
  pageSize?: number,
): number {
  if (
    !pageSize ||
    !Number.isFinite(pageSize) ||
    pageSize < 1
  ) {
    return DEFAULT_PAGE_SIZE
  }

  return Math.min(
    Math.floor(pageSize),
    MAX_PAGE_SIZE,
  )
}

function normalizeMemberStatus(
  value: string | null,
): MemberStatusValue {
  switch (value) {
    case 'active':
      return 'active'

    case 'disabled':
      return 'disabled'

    case 'pending':
      return 'pending'

    case 'suspended':
      return 'suspended'

    case 'deleted':
      return 'deleted'

    default:
      return 'pending'
  }
}

function getLevelName(
  level: number,
): string {
  switch (level) {
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
      return `第 ${level} 級會員`
  }
}

function normalizeMemberRecord(
  record: MemberRecord,
): MemberListItem {
  const level =
    Number.isFinite(record.level)
      ? record.level
      : 1

  return {
    id: record.id,

    memberCode:
      record.member_code ?? '',

    name:
      record.name ??
      '未設定姓名',

    email:
      record.email ?? '',

    phone:
      record.phone ?? '',

    avatarUrl:
      record.avatar,

    market: 'global',

    level,

    levelName:
      getLevelName(level),

    status:
      normalizeMemberStatus(
        record.status,
      ),

    referrerName: null,

    totalDirectReferrals: 0,

    createdAt:
      record.created_at,

    updatedAt:
      record.updated_at,
  }
}

function createPaginationMeta(
  page: number,
  pageSize: number,
  total: number,
): PaginationMeta {
  const totalPages =
    total === 0
      ? 0
      : Math.ceil(
          total / pageSize,
        )

  return {
    page,
    pageSize,
    total,
    totalPages,

    hasPreviousPage:
      page > 1,

    hasNextPage:
      page < totalPages,
  }
}

function normalizeMemberApiError(
  error: unknown,
): MemberApiError {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error
  ) {
    const source =
      error as {
        code?: string
        message?: string
        details?: string
        hint?: string
      }

    return {
      code:
        source.code ??
        'MEMBER_API_ERROR',

      message:
        source.message ??
        '會員資料操作失敗。',

      details: {
        databaseDetails:
          source.details ?? null,

        databaseHint:
          source.hint ?? null,
      },

      cause: error,
    }
  }

  if (error instanceof Error) {
    return {
      code:
        'MEMBER_API_ERROR',

      message:
        error.message,

      cause: error,
    }
  }

  return {
    code:
      'MEMBER_API_UNKNOWN_ERROR',

    message:
      '會員資料操作發生未知錯誤。',

    cause: error,
  }
}

async function countMembersByStatus(
  status?: MemberStatusValue,
): Promise<MemberCountResult> {
  let query = supabase
    .from('members')
    .select(
      'id',
      {
        count: 'exact',
        head: true,
      },
    )

  if (status) {
    query = query.eq(
      'status',
      status,
    )
  }

  const {
    count,
    error,
  } = await query

  if (error) {
    throw error
  }

  return {
    count: count ?? 0,
  }
}

async function countMembersCreatedFrom(
  createdFrom: string,
): Promise<MemberCountResult> {
  const {
    count,
    error,
  } = await supabase
    .from('members')
    .select(
      'id',
      {
        count: 'exact',
        head: true,
      },
    )
    .gte(
      'created_at',
      createdFrom,
    )

  if (error) {
    throw error
  }

  return {
    count: count ?? 0,
  }
}

function getStartOfToday():
  string {
  const date = new Date()

  date.setHours(
    0,
    0,
    0,
    0,
  )

  return date.toISOString()
}

function getStartOfWeek():
  string {
  const date = new Date()

  const currentDay =
    date.getDay()

  const daysSinceMonday =
    currentDay === 0
      ? 6
      : currentDay - 1

  date.setDate(
    date.getDate() -
      daysSinceMonday,
  )

  date.setHours(
    0,
    0,
    0,
    0,
  )

  return date.toISOString()
}

function getStartOfMonth():
  string {
  const date = new Date()

  date.setDate(1)

  date.setHours(
    0,
    0,
    0,
    0,
  )

  return date.toISOString()
}

export async function getMemberStatistics():
  Promise<MemberStatistics> {
  try {
    const [
      totalResult,
      activeResult,
      disabledResult,
      pendingResult,
      suspendedResult,
      newTodayResult,
      newThisWeekResult,
      newThisMonthResult,
    ] = await Promise.all([
      countMembersByStatus(),

      countMembersByStatus(
        'active',
      ),

      countMembersByStatus(
        'disabled',
      ),

      countMembersByStatus(
        'pending',
      ),

      countMembersByStatus(
        'suspended',
      ),

      countMembersCreatedFrom(
        getStartOfToday(),
      ),

      countMembersCreatedFrom(
        getStartOfWeek(),
      ),

      countMembersCreatedFrom(
        getStartOfMonth(),
      ),
    ])

    return {
      total:
        totalResult.count,

      active:
        activeResult.count,

      disabled:
        disabledResult.count,

      pending:
        pendingResult.count,

      suspended:
        suspendedResult.count,

      newToday:
        newTodayResult.count,

      newThisWeek:
        newThisWeekResult.count,

      newThisMonth:
        newThisMonthResult.count,

      taiwanMarket: 0,
      chinaMarket: 0,
      globalMarket:
        totalResult.count,
    }
  } catch (error) {
    throw normalizeMemberApiError(
      error,
    )
  }
}

export async function getMembers(
  filters: MemberFilters = {},
): Promise<MemberListResponse> {
  const page =
    normalizePage(
      filters.page,
    )

  const pageSize =
    normalizePageSize(
      filters.pageSize,
    )

  const from =
    (page - 1) *
    pageSize

  const to =
    from +
    pageSize -
    1

  try {
    let query = supabase
      .from('members')
      .select(
        `
          id,
          member_code,
          email,
          phone,
          name,
          avatar,
          level,
          status,
          created_at,
          updated_at
        `,
        {
          count: 'exact',
        },
      )

    const keyword =
      filters.keyword
        ?.trim()

    if (keyword) {
      const escapedKeyword =
        keyword.replace(
          /[%_,]/g,
          '',
        )

      query = query.or(
        [
          `member_code.ilike.%${escapedKeyword}%`,
          `name.ilike.%${escapedKeyword}%`,
          `email.ilike.%${escapedKeyword}%`,
          `phone.ilike.%${escapedKeyword}%`,
        ].join(','),
      )
    }

    if (filters.status) {
      query = query.eq(
        'status',
        filters.status,
      )
    }

    if (
      typeof filters.level ===
        'number' &&
      Number.isFinite(
        filters.level,
      )
    ) {
      query = query.eq(
        'level',
        filters.level,
      )
    }

    if (
      filters.createdFrom
    ) {
      query = query.gte(
        'created_at',
        filters.createdFrom,
      )
    }

    if (
      filters.createdTo
    ) {
      query = query.lte(
        'created_at',
        filters.createdTo,
      )
    }

    const sortBy =
      filters.sortBy ??
      'created_at'

    const sortDirection =
      filters.sortDirection ??
      'desc'

    query = query.order(
      sortBy,
      {
        ascending:
          sortDirection ===
          'asc',
      },
    )

    query = query.range(
      from,
      to,
    )

    const [
      listResult,
      statistics,
    ] = await Promise.all([
      query,
      getMemberStatistics(),
    ])

    if (listResult.error) {
      throw listResult.error
    }

    const records =
      (listResult.data ??
        []) as MemberRecord[]

    const members =
      records.map(
        normalizeMemberRecord,
      )

    const total =
      listResult.count ?? 0

    const pagination =
      createPaginationMeta(
        page,
        pageSize,
        total,
      )

    return {
      success: true,
      members,
      statistics,
      pagination,
      message:
        members.length > 0
          ? '會員資料載入成功。'
          : '目前沒有符合條件的會員資料。',
    }
  } catch (error) {
    const normalizedError =
      normalizeMemberApiError(
        error,
      )

    const emptyPagination =
      createPaginationMeta(
        page,
        pageSize,
        0,
      )

    return {
      success: false,
      members: [],
      statistics: {
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
      },
      pagination:
        emptyPagination,
      message:
        '會員資料載入失敗。',
      error:
        normalizedError.message,
    }
  }
}
// =================================
// Dealer Create Member Search
// =================================

export interface DealerMemberSearchResponse {

  success:
    boolean

  members:
    MemberListItem[]

  message:
    string

  error?:
    string

}



export async function searchMembersForDealer(
  keyword: string,
): Promise<DealerMemberSearchResponse> {

  const normalizedKeyword =
    keyword.trim()


  if(
    !normalizedKeyword
  ){

    return {

      success:
        true,

      members:
        [],

      message:
        '請輸入會員姓名、手機、Email 或會員編號。',

    }

  }


  try {


    const response =
      await getMembers({

        keyword:
          normalizedKeyword,

        status:
          'active',

        page:
          1,

        pageSize:
          20,

        sortBy:
          'created_at',

        sortDirection:
          'desc',

      })


    if(
      !response.success
    ){

      return {

        success:
          false,

        members:
          [],

        message:
          '會員搜尋失敗。',

        error:
          response.error
          ??
          response.message,

      }

    }


    if(
      response.members.length === 0
    ){

      return {

        success:
          true,

        members:
          [],

        message:
          '找不到符合條件的啟用會員。',

      }

    }


    const memberIds =
      response.members.map(
        member =>
          member.id,
      )


    const {
      data: existingDealers,
      error: existingDealersError,
    } =
      await supabase
        .from(
          'dealers',
        )
        .select(`
          member_id
        `)
        .in(
          'member_id',
          memberIds,
        )


    if(
      existingDealersError
    ){

      throw existingDealersError

    }


    const existingMemberIds =
      new Set(
        (
          existingDealers
          ??
          []
        )
          .map(
            item =>
              typeof item.member_id === 'string'
                ? item.member_id
                : '',
          )
          .filter(Boolean),
      )


    const availableMembers =
      response.members.filter(
        member =>
          !existingMemberIds.has(
            member.id,
          ),
      )


    return {

      success:
        true,

      members:
        availableMembers,

      message:
        availableMembers.length > 0
          ? `找到 ${availableMembers.length} 位可建立經銷商的會員。`
          : '搜尋到的會員皆已建立經銷商資料。',

    }


  }catch(
    error
  ){


    const normalizedError =
      normalizeMemberApiError(
        error,
      )


    return {

      success:
        false,

      members:
        [],

      message:
        '會員搜尋失敗。',

      error:
        normalizedError.message,

    }

  }

}
export interface CreateMemberInput {

  memberCode?:
    string | null

  email?:
    string | null

  phone?:
    string | null

  name:
    string

  avatarUrl?:
    string | null

  level:
    number

  status:
    MemberRecord['status']

}

export interface UpdateMemberInput {
  id: string
  memberCode: string
  email: string
  phone: string
  name: string
  avatarUrl?: string | null
  level: number
  status: MemberRecord['status']
}

export interface UpdateMemberStatusInput {
  id: string
  status: MemberRecord['status']
}
export interface BatchUpdateMemberStatusInput {
  memberIds: string[]
  status: MemberRecord['status']
}

export interface BatchUpdateMemberStatusResponse {
  success: boolean
  updatedIds: string[]
  message: string
  error?: string
}
function normalizeRequiredText(
  value: string,
  fieldName: string,
): string {
  const normalizedValue =
    value.trim()

  if (!normalizedValue) {
    throw new Error(
      `${fieldName}不可空白。`,
    )
  }

  return normalizedValue
}

function normalizeOptionalText(
  value?: string | null,
): string | null {
  const normalizedValue =
    value?.trim() ?? ''

  return normalizedValue || null
}

export async function createMember(
  input: CreateMemberInput,
): Promise<MemberMutationResponse> {
  try {
    const memberCode =
  normalizeOptionalText(
    input.memberCode,
  )


const normalizedEmail =
  normalizeOptionalText(
    input.email,
  )


const email =
  normalizedEmail
    ?.toLowerCase()
  ??
  null

    const name =
      normalizeRequiredText(
        input.name,
        '會員姓名',
      )

    const phone =
      normalizeOptionalText(
        input.phone,
      )

    if (
      !Number.isInteger(input.level) ||
      input.level < 1 ||
      input.level > 6
    ) {
      throw new Error(
        '會員等級必須介於 1 至 6。',
      )
    }

    const insertPayload:
  MemberInsert = {

    member_code:
      memberCode,

    email,

    phone:
      phone,
      

    name,

    avatar:
      normalizeOptionalText(
        input.avatarUrl,
      ),

    level:
      input.level,

    status:
      input.status,

  }

    const {
      data,
      error,
    } = await supabase
      .from('members')
      .insert(insertPayload)
      .select(
        `
          id,
          member_code,
          email,
          phone,
          name,
          avatar,
          level,
          status,
          created_at,
          updated_at
        `,
      )
      .single()

    if (error) {
      throw error
    }

    const record =
      data as MemberRecord

    return {
      success: true,
      member: {
        id: record.id,
        memberCode:
          record.member_code ?? '',
        email:
          record.email ?? '',
        phone:
          record.phone ?? '',
        name:
          record.name ??
          '未設定姓名',
        avatarUrl:
          record.avatar,
        market: 'global',
        level:
          record.level ?? 1,
        levelCode: 'general',
        levelName:
          getLevelName(
            record.level ?? 1,
          ),
        status:
          normalizeMemberStatus(
            record.status,
          ),
        referralCode: null,
        referrerCode: null,
        referrerName: null,
        totalDirectReferrals: 0,
        teamMemberCount: 0,
        totalOrders: 0,
        totalSpendingTwd: 0,
        totalSpendingCny: 0,
        totalIncomeTwd: 0,
        totalIncomeCny: 0,
        lastLoginAt: null,
        createdAt:
          record.created_at,
        updatedAt:
          record.updated_at,
      },
      message:
        '會員資料建立成功。',
    }
  } catch (error) {
    const normalizedError =
      normalizeMemberApiError(
        error,
      )

    return {
      success: false,
      member: null,
      message:
        '會員資料建立失敗。',
      error:
        normalizedError.message,
    }
  }
}
export async function getMemberById(
  id: string,
): Promise<{
  success: boolean
  member: MemberListItem | null
  message: string
  error?: string
}> {
  try {
    const normalizedId =
      normalizeRequiredText(
        id,
        '會員識別碼',
      )

    const {
      data,
      error,
    } = await supabase
      .from('members')
      .select(
        `
          id,
          member_code,
          email,
          phone,
          name,
          avatar,
          level,
          status,
          created_at,
          updated_at
        `,
      )
      .eq(
        'id',
        normalizedId,
      )
      .single()

    if (error) {
      throw error
    }

    const record =
      data as MemberRecord

    return {
      success: true,
      member:
        normalizeMemberRecord(
          record,
        ),
      message:
        '會員資料載入成功。',
    }

  } catch (error) {
    const normalizedError =
      normalizeMemberApiError(
        error,
      )

    return {
      success: false,
      member: null,
      message:
        '會員資料載入失敗。',
      error:
        normalizedError.message,
    }
  }
}
export async function updateMemberStatus(
  input: UpdateMemberStatusInput,
): Promise<MemberMutationResponse> {
  try {
    const id =
      normalizeRequiredText(
        input.id,
        '會員 ID',
      )

    const validStatuses:
      MemberStatusValue[] = [
        'active',
        'pending',
        'disabled',
        'suspended',
      ]

    if (
      !validStatuses.includes(
        input.status,
      )
    ) {
      throw new Error(
        '會員狀態不正確。',
      )
    }

    const {
      data,
      error,
    } = await supabase
      .from('members')
      .update({
        status:
          input.status,

        updated_at:
          new Date().toISOString(),
      })
      .eq(
        'id',
        id,
      )
      .select(
        `
          id,
          member_code,
          email,
          phone,
          name,
          avatar,
          level,
          status,
          created_at,
          updated_at
        `,
      )
      .single()

    if (error) {
      throw error
    }

    const record =
      data as MemberRecord

    return {
      success: true,
      member: {
        id:
          record.id,

        memberCode:
          record.member_code ?? '',

        email:
          record.email ?? '',

        phone:
          record.phone ?? '',

        name:
          record.name ??
          '未設定姓名',

        avatarUrl:
          record.avatar,

        market:
          'global',

        level:
          record.level ?? 1,

        levelCode:
          'general',

        levelName:
          getLevelName(
            record.level ?? 1,
          ),

        status:
          normalizeMemberStatus(
            record.status,
          ),

        referralCode:
          null,

        referrerCode:
          null,

        referrerName:
          null,

        totalDirectReferrals:
          0,

        teamMemberCount:
          0,

        totalOrders:
          0,

        totalSpendingTwd:
          0,

        totalSpendingCny:
          0,

        totalIncomeTwd:
          0,

        totalIncomeCny:
          0,

        lastLoginAt:
          null,

        createdAt:
          record.created_at,

        updatedAt:
          record.updated_at,
      },

      message:
        '會員狀態更新成功。',
    }
  } catch (error) {
    const normalizedError =
      normalizeMemberApiError(
        error,
      )

    return {
      success: false,
      member: null,
      message:
        '會員狀態更新失敗。',
      error:
        normalizedError.message,
    }
  }
}
export async function updateMember(
  input: UpdateMemberInput,
): Promise<MemberMutationResponse> {
  try {
    const id =
      normalizeRequiredText(
        input.id,
        '會員 ID',
      )

    const memberCode =
      normalizeRequiredText(
        input.memberCode,
        '會員編號',
      )

    const email =
      normalizeRequiredText(
        input.email,
        '電子郵件',
      ).toLowerCase()

    const name =
      normalizeRequiredText(
        input.name,
        '會員姓名',
      )

    if (
      !Number.isInteger(
        input.level,
      ) ||
      input.level < 1 ||
      input.level > 6
    ) {
      throw new Error(
        '會員等級必須介於 1 至 6。',
      )
    }

    const {
      data,
      error,
    } = await supabase
      .from('members')
      .update({
        member_code:
          memberCode,

        email,

        phone:
  normalizeOptionalText(
    input.phone,
  ),
          

        name,

        avatar:
          normalizeOptionalText(
            input.avatarUrl,
          ),

        level:
          input.level,

        status:
          input.status,

        updated_at:
          new Date().toISOString(),
      })
      .eq(
        'id',
        id,
      )
      .select(
        `
          id,
          member_code,
          email,
          phone,
          name,
          avatar,
          level,
          status,
          created_at,
          updated_at
        `,
      )
      .single()

    if (error) {
      throw error
    }

    const record =
      data as MemberRecord

    return {
      success: true,

      member: {
        id:
          record.id,

        memberCode:
          record.member_code ?? '',

        email:
          record.email ?? '',

        phone:
          record.phone ?? '',

        name:
          record.name ??
          '未設定姓名',

        avatarUrl:
          record.avatar,

        market:
          'global',

        level:
          record.level ?? 1,

        levelCode:
          'general',

        levelName:
          getLevelName(
            record.level ?? 1,
          ),

        status:
          normalizeMemberStatus(
            record.status,
          ),

        referralCode:
          null,

        referrerCode:
          null,

        referrerName:
          null,

        totalDirectReferrals:
          0,

        teamMemberCount:
          0,

        totalOrders:
          0,

        totalSpendingTwd:
          0,

        totalSpendingCny:
          0,

        totalIncomeTwd:
          0,

        totalIncomeCny:
          0,

        lastLoginAt:
          null,

        createdAt:
          record.created_at,

        updatedAt:
          record.updated_at,
      },

      message:
        '會員資料更新成功。',
    }
  } catch (error) {
    const normalizedError =
      normalizeMemberApiError(
        error,
      )

    return {
      success: false,
      member: null,
      message:
        '會員資料更新失敗。',
      error:
        normalizedError.message,
    }
  }
}
export async function batchUpdateMemberStatus(
  input: BatchUpdateMemberStatusInput,
): Promise<BatchUpdateMemberStatusResponse> {
  try {
    const memberIds = Array.from(
      new Set(
        input.memberIds
          .map((memberId) =>
            memberId.trim(),
          )
          .filter(Boolean),
      ),
    )

    if (memberIds.length === 0) {
      throw new Error(
        '請至少選取一位會員。',
      )
    }

    const validStatuses:
      MemberStatusValue[] = [
        'active',
        'pending',
        'disabled',
        'suspended',
      ]

    if (
      !validStatuses.includes(
        input.status,
      )
    ) {
      throw new Error(
        '會員狀態不正確。',
      )
    }

    const {
      data,
      error,
    } = await supabase
      .from('members')
      .update({
        status:
          input.status,

        updated_at:
          new Date().toISOString(),
      })
      .in(
        'id',
        memberIds,
      )
      .select('id')

    if (error) {
      throw error
    }

    const updatedIds =
      (data ?? []).map(
        (record) =>
          String(record.id),
      )

    if (
      updatedIds.length !==
      memberIds.length
    ) {
      throw new Error(
        `預計更新 ${memberIds.length} 位會員，但實際只更新 ${updatedIds.length} 位，請檢查會員資料或 RLS 權限。`,
      )
    }

    return {
      success: true,
      updatedIds,
      message:
        `已成功更新 ${updatedIds.length} 位會員狀態。`,
    }
  } catch (error) {
    const normalizedError =
      normalizeMemberApiError(
        error,
      )

    return {
      success: false,
      updatedIds: [],
      message:
        '批次更新會員狀態失敗。',
      error:
        normalizedError.message,
    }
  }
}
export const memberApi = {
  getMembers,
  getMemberStatistics,
  getMemberById,
  createMember,
  updateMember,
  updateMemberStatus,
  batchUpdateMemberStatus,
  searchMembersForDealer,
}

export default memberApi
