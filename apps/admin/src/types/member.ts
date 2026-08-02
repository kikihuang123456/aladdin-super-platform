/**
 * ALADDIN Super Platform
 * Sprint 3 - Member ERP
 *
 * Member Domain Types
 */

/* =========================================================
 * 基礎型別
 * ======================================================= */

export type MemberId = string

export type MemberMarket =
  | 'taiwan'
  | 'china'
  | 'global'

export type MemberStatus =
  | 'active'
  | 'disabled'
  | 'pending'
  | 'suspended'
  | 'deleted'

export type MemberLevelCode =
  | 'general'
  | 'silver'
  | 'gold'
  | 'platinum'
  | 'diamond'
  | 'vip'
  | 'custom'

export type MemberRoleCode =
  | 'super_admin'
  | 'system_admin'
  | 'operation_admin'
  | 'finance_admin'
  | 'customer_service'
  | 'merchant_admin'
  | 'dealer_admin'
  | 'member'

export type MemberGender =
  | 'male'
  | 'female'
  | 'other'
  | 'undisclosed'

export type MemberIdentityType =
  | 'taiwan_id'
  | 'china_id'
  | 'passport'
  | 'residence_permit'
  | 'other'

export type MemberAddressType =
  | 'home'
  | 'company'
  | 'shipping'
  | 'billing'
  | 'other'

export type MemberSortField =
  | 'created_at'
  | 'updated_at'
  | 'name'
  | 'member_code'
  | 'level'
  | 'status'

export type SortDirection =
  | 'asc'
  | 'desc'

/* =========================================================
 * Supabase members 資料表
 * ======================================================= */

/**
 * 目前正式 Supabase members 表對應型別。
 *
 * 已存在欄位：
 * id
 * member_code
 * email
 * phone
 * name
 * avatar
 * level
 * status
 * created_at
 * updated_at
 */
export interface MemberRecord {
  id: MemberId
  member_code: string | null
  email: string | null
  phone: string | null
  name: string | null
  avatar: string | null
  level: number
  status: MemberStatus
  created_at: string
  updated_at: string
}

/**
 * Supabase Insert 型別。
 */
export interface MemberInsert {
  id?: MemberId
  member_code?: string | null
  email?: string | null
  phone?: string | null
  name?: string | null
  avatar?: string | null
  level?: number
  status?: MemberStatus
  created_at?: string
  updated_at?: string
}

/**
 * Supabase Update 型別。
 */
export interface MemberUpdate {
  member_code?: string | null
  email?: string | null
  phone?: string | null
  name?: string | null
  avatar?: string | null
  level?: number
  status?: MemberStatus
  updated_at?: string
}

/* =========================================================
 * 前端會員資料
 * ======================================================= */

export interface Member {
  id: MemberId
  memberCode: string
  email: string
  phone: string
  name: string
  avatarUrl: string | null

  market: MemberMarket
  level: number
  levelCode: MemberLevelCode
  levelName: string
  status: MemberStatus

  referralCode: string | null
  referrerCode: string | null
  referrerName: string | null

  totalDirectReferrals: number
  teamMemberCount: number

  totalOrders: number
  totalSpendingTwd: number
  totalSpendingCny: number

  totalIncomeTwd: number
  totalIncomeCny: number

  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
}

export interface MemberListItem {
  id: MemberId
  memberCode: string
  name: string
  email: string
  phone: string
  avatarUrl: string | null

  market: MemberMarket
  level: number
  levelName: string
  status: MemberStatus

  referrerName: string | null
  totalDirectReferrals: number

  createdAt: string
  updatedAt: string
}

/* =========================================================
 * 會員個人資料
 * ======================================================= */

export interface MemberProfile {
  memberId: MemberId

  fullName: string
  displayName: string | null
  gender: MemberGender
  birthday: string | null

  identityType: MemberIdentityType | null
  identityNumber: string | null

  countryCode: string | null
  nationality: string | null

  email: string
  phone: string

  lineId: string | null
  wechatId: string | null

  avatarUrl: string | null
  biography: string | null

  createdAt: string
  updatedAt: string
}

/* =========================================================
 * 會員等級
 * ======================================================= */

export interface MemberLevel {
  id: string
  code: MemberLevelCode
  name: string
  numericLevel: number
  description: string | null

  minimumSpendingTwd: number
  minimumSpendingCny: number

  discountRate: number
  pointsMultiplier: number

  isActive: boolean
  createdAt: string
  updatedAt: string
}

/* =========================================================
 * 地址
 * ======================================================= */

export interface MemberAddress {
  id: string
  memberId: MemberId

  type: MemberAddressType
  recipientName: string
  recipientPhone: string

  country: string
  province: string | null
  city: string | null
  district: string | null
  postalCode: string | null
  addressLine1: string
  addressLine2: string | null

  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateMemberAddressRequest {
  memberId: MemberId
  type: MemberAddressType
  recipientName: string
  recipientPhone: string

  country: string
  province?: string | null
  city?: string | null
  district?: string | null
  postalCode?: string | null
  addressLine1: string
  addressLine2?: string | null

  isDefault?: boolean
}

export interface UpdateMemberAddressRequest {
  type?: MemberAddressType
  recipientName?: string
  recipientPhone?: string

  country?: string
  province?: string | null
  city?: string | null
  district?: string | null
  postalCode?: string | null
  addressLine1?: string
  addressLine2?: string | null

  isDefault?: boolean
}

/* =========================================================
 * 會員角色與權限
 * ======================================================= */

export interface MemberRole {
  id: string
  code: MemberRoleCode
  name: string
  description: string | null
}

export interface MemberPermission {
  id: string
  code: string
  name: string
  module: string
}

export interface MemberRoleAssignment {
  memberId: MemberId
  role: MemberRole
  permissions: MemberPermission[]
  assignedAt: string
}

/* =========================================================
 * 推薦與團隊
 * ======================================================= */

export interface MemberTeamNode {
  memberId: MemberId
  memberCode: string
  name: string
  avatarUrl: string | null

  level: number
  levelName: string
  status: MemberStatus

  referralCode: string | null
  referrerCode: string | null

  depth: number
  directReferralCount: number

  teamSalesTwd: number
  teamSalesCny: number

  joinedAt: string
}

export interface MemberTeamSummary {
  memberId: MemberId

  directMemberCount: number
  indirectMemberCount: number
  totalTeamMemberCount: number

  teamSalesTwd: number
  teamSalesCny: number

  activeMemberCount: number
  disabledMemberCount: number
}

/* =========================================================
 * 登入與操作紀錄
 * ======================================================= */

export type MemberLoginResult =
  | 'success'
  | 'failed'
  | 'blocked'

export interface MemberLoginLog {
  id: string
  memberId: MemberId

  result: MemberLoginResult
  ipAddress: string | null
  userAgent: string | null

  deviceType: string | null
  operatingSystem: string | null
  browser: string | null

  country: string | null
  city: string | null

  failureReason: string | null
  createdAt: string
}

export interface MemberActionLog {
  id: string
  memberId: MemberId

  action: string
  module: string
  description: string

  targetType: string | null
  targetId: string | null

  previousData:
    Record<string, unknown> | null

  nextData:
    Record<string, unknown> | null

  ipAddress: string | null
  createdAt: string
}

/* =========================================================
 * 統計資料
 * ======================================================= */

export interface MemberStatistics {
  total: number
  active: number
  disabled: number
  pending: number
  suspended: number

  newToday: number
  newThisWeek: number
  newThisMonth: number

  taiwanMarket: number
  chinaMarket: number
  globalMarket: number
}

export interface MemberDetailStatistics {
  totalOrders: number

  completedOrders: number
  cancelledOrders: number
  refundedOrders: number

  totalSpendingTwd: number
  totalSpendingCny: number

  totalIncomeTwd: number
  totalIncomeCny: number

  availablePoints: number
  usedPoints: number

  couponCount: number

  directReferralCount: number
  teamMemberCount: number
}

/* =========================================================
 * 搜尋與篩選
 * ======================================================= */

export interface MemberFilters {
  keyword?: string
  market?: MemberMarket | ''
  status?: MemberStatus | ''
  level?: number | null
  levelCode?: MemberLevelCode | ''

  roleCode?: MemberRoleCode | ''

  createdFrom?: string
  createdTo?: string

  referrerCode?: string

  sortBy?: MemberSortField
  sortDirection?: SortDirection

  page?: number
  pageSize?: number
}

/* =========================================================
 * 分頁
 * ======================================================= */

export interface PaginationMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationMeta
}

/* =========================================================
 * API Request
 * ======================================================= */

export interface CreateMemberRequest {
  memberCode?: string

  email: string
  phone?: string
  name: string
  avatarUrl?: string | null

  market: MemberMarket
  level?: number
  levelCode?: MemberLevelCode
  levelName?: string

  status?: MemberStatus

  referralCode?: string | null
  referrerCode?: string | null

  roleCode?: MemberRoleCode

  temporaryPassword?: string
  sendInvitationEmail?: boolean
}

export interface UpdateMemberRequest {
  id: MemberId

  memberCode?: string
  email?: string
  phone?: string
  name?: string
  avatarUrl?: string | null

  market?: MemberMarket
  level?: number
  levelCode?: MemberLevelCode
  levelName?: string

  status?: MemberStatus

  referralCode?: string | null
  referrerCode?: string | null
}

export interface UpdateMemberStatusRequest {
  id: MemberId
  status: MemberStatus
  reason?: string
}

export interface AssignMemberRoleRequest {
  memberId: MemberId
  roleCode: MemberRoleCode
}

export interface RemoveMemberRoleRequest {
  memberId: MemberId
  roleCode: MemberRoleCode
}

export interface DeleteMemberRequest {
  id: MemberId
  reason?: string
  hardDelete?: boolean
}

export interface ResetMemberPasswordRequest {
  memberId: MemberId
  sendResetEmail?: boolean
}

export interface BatchUpdateMemberStatusRequest {
  memberIds: MemberId[]
  status: MemberStatus
  reason?: string
}

/* =========================================================
 * API Response
 * ======================================================= */

export interface MemberListResponse {
  success: boolean
  members: MemberListItem[]
  statistics: MemberStatistics
  pagination: PaginationMeta
  message?: string
  error?: string
}

export interface MemberDetailResponse {
  success: boolean
  member: Member | null
  profile: MemberProfile | null
  roleAssignment: MemberRoleAssignment | null
  statistics: MemberDetailStatistics | null
  addresses: MemberAddress[]
  message?: string
  error?: string
}

export interface MemberMutationResponse {
  success: boolean
  member: Member | null
  message: string
  error?: string
}

export interface MemberDeleteResponse {
  success: boolean
  deletedId: MemberId | null
  message: string
  error?: string
}

export interface MemberTeamResponse {
  success: boolean
  summary: MemberTeamSummary | null
  members: MemberTeamNode[]
  message?: string
  error?: string
}

export interface MemberLoginLogResponse {
  success: boolean
  logs: MemberLoginLog[]
  pagination: PaginationMeta
  message?: string
  error?: string
}

export interface MemberActionLogResponse {
  success: boolean
  logs: MemberActionLog[]
  pagination: PaginationMeta
  message?: string
  error?: string
}

/* =========================================================
 * Supabase 查詢結果
 * ======================================================= */

export interface MemberRoleQueryRecord {
  role:
    | {
        id: string
        code: MemberRoleCode
        name: string
        description: string | null
      }
    | {
        id: string
        code: MemberRoleCode
        name: string
        description: string | null
      }[]
    | null
}

export interface MemberPermissionQueryRecord {
  role:
    | {
        id: string
        code: MemberRoleCode
        name: string
        role_permissions:
          | {
              permission:
                | {
                    id: string
                    code: string
                    name: string
                    module: string
                  }
                | {
                    id: string
                    code: string
                    name: string
                    module: string
                  }[]
                | null
            }[]
          | null
      }
    | {
        id: string
        code: MemberRoleCode
        name: string
        role_permissions:
          | {
              permission:
                | {
                    id: string
                    code: string
                    name: string
                    module: string
                  }
                | {
                    id: string
                    code: string
                    name: string
                    module: string
                  }[]
                | null
            }[]
          | null
      }[]
    | null
}

/* =========================================================
 * 錯誤型別
 * ======================================================= */

export interface MemberApiError {
  code: string
  message: string
  status?: number
  details?: Record<string, unknown>
  cause?: unknown
}