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
// =================================
// Dealer Create
// =================================

export interface DealerCreateForm {

  memberId:
    string


  dealerNo:
    string


  name:
    string


  phone:
    string


  email:
    string


  market:
    DealerMarket


  level:
    DealerLevel


  status:
    DealerStatus


  regionId:
    string


  directCount:
    number


  teamCount:
    number


  teamSales:
    number


  totalCommission:
    number


  remark:
    string

}



export interface DealerCreateRequest {

  memberId:
    string


  dealerNo:
    string


  name:
    string


  phone?:
    string | null


  email?:
    string | null


  market:
    DealerMarket


  level:
    DealerLevel


  status:
    DealerStatus


  regionId?:
    string | null


  directCount?:
    number


  teamCount?:
    number


  teamSales?:
    number


  totalCommission?:
    number


    remark?:
    string | null


  operatorId?:
    string | null


  operatorRole?:
    string | null


  source?:
    string | null

}

export interface DealerCreateResponse {

  success:
    boolean


  dealer?:
    Dealer


  message:
    string


  error?:
    string

}
// =================================
// Dealer Team Performance
// =================================

export interface DealerTeamMember {
  id: string
  dealerNo: string
  name: string
  phone?: string | null
  email?: string | null
  level: DealerLevel
  status: DealerStatus
  directCount: number
  teamCount: number
  teamSales: number
  joinedAt?: string | null
}

export interface DealerParentSummary {
  id: string
  dealerNo: string
  name: string
  phone?: string | null
  email?: string | null
  level: DealerLevel
  status: DealerStatus
  teamSales: number
}

export interface DealerTeamStatistics {
  directCount: number
  teamCount: number
  teamSales: number
  totalCommission: number
}

export interface DealerTeamPerformance {
  dealer: Dealer
  parentDealer: DealerParentSummary | null
  directDealers: DealerTeamMember[]
  statistics: DealerTeamStatistics
}

export interface DealerTeamPerformanceResponse {
  success: boolean
  data?: DealerTeamPerformance
  message: string
  error?: string
}

// =================================
// Dealer Team Relation
// =================================

export type DealerTeamRelationStatus =
  | 'active'
  | 'inactive'
  | 'terminated'


export interface DealerTeamRelationRecord {
  id: string
  dealerId: string
  parentDealerId: string | null
  status: DealerTeamRelationStatus
  joinedAt: string
  endedAt?: string | null
  createdBy?: string | null
  remark?: string | null
  createdAt: string
  updatedAt: string
}


export interface DealerTeamRelationMutationInput {
  dealerId: string
  parentDealerId?: string
  newParentDealerId?: string
  createdBy?: string | null
  remark?: string | null
}


export interface DealerTeamRelationMutationResponse {
  success: boolean
  message: string
  relation?: DealerTeamRelationRecord
  previousRelation?: DealerTeamRelationRecord
  relationId?: string
  dealerId?: string
  previousParentDealerId?: string | null
  endedAt?: string
  error?: string
}

// =================================
// Dealer Team Relation History
// =================================

export interface DealerTeamRelationHistoryItem {
  id: string
  dealerId: string
  dealerNo: string
  dealerName: string
  parentDealerId?: string | null
  parentDealerNo?: string | null
  parentDealerName?: string | null
  status: DealerTeamRelationStatus
  joinedAt: string
  endedAt?: string | null
  createdBy?: string | null
  operatorName: string
  operatorEmail?: string | null
  remark?: string | null
  createdAt: string
  updatedAt: string
}


export interface DealerTeamRelationHistoryData {
  dealerId: string
  total: number
  history: DealerTeamRelationHistoryItem[]
}


export interface DealerTeamRelationHistoryResponse {
  success: boolean
  data?: DealerTeamRelationHistoryData
  message: string
  error?: string
}
