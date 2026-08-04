/**
 * ALADDIN Enterprise V4
 *
 * Dealer ERP
 *
 * Type Definitions
 */


export type DealerLevel =
  | 'normal'
  | 'star_1'
  | 'star_2'
  | 'star_3'
  | 'star_4'
  | 'star_5'
  | 'star_6'
  | 'star_7'


export type DealerStatus =
  | 'pending'
  | 'approved'
  | 'active'
  | 'suspended'
  | 'disabled'


export type DealerMarket =
  | 'taiwan'
  | 'china'
  | 'cross_border'


export interface Dealer {

  id: string


  dealerNo: string


  memberId: string


  name: string


  phone?: string | null


  email?: string | null


  market:
    DealerMarket


  level:
    DealerLevel


  status:
    DealerStatus


  regionId?: string | null


  regionName?: string | null


  directCount: number


  teamCount: number


  teamSales: number


  totalCommission: number


  approvedBy?: string | null


  approvedAt?: string | null


  remark?: string | null


  createdAt: string


  updatedAt: string

}



export interface DealerFilters {

  keyword?: string


  market?:
    DealerMarket | ''


  level?:
    DealerLevel | ''


  status?:
    DealerStatus | ''


  regionId?: string | null


  page: number


  pageSize: number

}



export interface DealerPagination {

  page: number


  pageSize: number


  total: number


  totalPages: number

}
/**
 * Dealer Statistics
 */

export interface DealerStatistics {

  total: number


  pending: number


  approved: number


  active: number


  suspended: number


  disabled: number


  normal: number


  star1: number


  star2: number


  star3: number


  star4: number


  star5: number


  star6: number


  star7: number


  totalTeamCount: number


  totalTeamSales: number


  totalCommission: number

}



/**
 * Dealer List Response
 */

export interface DealerListResponse {

  success: boolean


  dealers:
    Dealer[]


  statistics:
    DealerStatistics


  pagination:
    DealerPagination


  message: string


  error?: string

}



/**
 * Dealer Detail Response
 */

export interface DealerDetailResponse {

  success: boolean


  dealer?:
    Dealer


  message: string


  error?: string

}



/**
 * Dealer Approval Input
 */

export interface DealerApprovalInput {

  dealerId: string


  status:
    | 'approved'
    | 'rejected'


  approvedBy?: string | null


  remark?: string | null

}



/**
 * Dealer Status Update Input
 */

export interface DealerStatusUpdateInput {

  dealerId: string


  status:
    DealerStatus


  operatorId?: string | null


  remark?: string | null

}



/**
 * Dealer Level Update Input
 */

export interface DealerLevelUpdateInput {

  dealerId: string


  level:
    DealerLevel


  operatorId?: string | null


  remark?: string | null

}



/**
 * Dealer Mutation Response
 */

export interface DealerMutationResponse {

  success: boolean


  dealer?:
    Dealer


  message: string


  error?: string

}
// =================================
// Dealer Operation Logs
// =================================

export type DealerLogActionType =
  | 'create'
  | 'approve'
  | 'reject'
  | 'status_update'
  | 'level_update'
  | 'region_assign'
  | 'region_reassign'
  | 'region_unassign'
  | 'profile_update'
  | 'remark_update'
  | 'delete'
  | 'other'


export interface DealerLog {

  id: string


  dealerId: string


  actionType:
    DealerLogActionType


  actionName: string


  previousData:
    Record<string, unknown> | null


  nextData:
    Record<string, unknown> | null


  operatorId:
    string | null


  operatorRole:
    string | null


  remark:
    string | null


  createdAt:
    string

}



export interface DealerLogPagination {

  page: number


  pageSize: number


  total: number


  totalPages: number

}



export interface DealerLogListResponse {

  success: boolean


  logs:
    DealerLog[]


  pagination:
    DealerLogPagination


  message:
    string


  error?:
    string

}