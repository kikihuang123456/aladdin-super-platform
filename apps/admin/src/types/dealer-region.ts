/**
 * ALADDIN Enterprise V4
 *
 * Dealer ERP
 *
 * M05-04 Dealer Region Assignment
 *
 * M05-05 Dealer Region Dashboard
 *
 * Type Definitions
 */


// =================================
// Region
// =================================

export interface DealerRegion {

  id: string

  code: string

  name: string

  market:
    | 'taiwan'
    | 'china'


  province?: string | null


  city?: string | null


  status:
    | 'active'
    | 'disabled'


  dealerCount: number


  createdAt: string


  updatedAt: string

}



// =================================
// Dashboard Ranking Item
// =================================

export interface DealerRegionRankingItem {


  id:string


  name:string


  dealerCount:number


}



// =================================
// Dashboard Statistics Item
// =================================

export interface DealerRegionStatisticsItem {


  id:string


  name:string


  market:
    | 'taiwan'
    | 'china'


  dealerCount:number


}



// =================================
// M05-05 Region Dashboard
// =================================

export interface DealerRegionDashboard {


  totalRegions:number


  activeRegions:number


  taiwanRegions:number


  chinaRegions:number


  ranking:
    DealerRegionRankingItem[]


  regionStatistics:
    DealerRegionStatisticsItem[]


  regions:
    DealerRegion[]


  assignments:
    DealerRegionAssignment[]


}



// =================================
// Region Member Assignment
// =================================

export interface DealerRegionAssignment {


  id: string


  dealerId: string


  regionId: string


  regionName?: string | null


  dealerName?: string | null


  assignedBy?: string | null


  assignedAt: string


  remark?: string | null


}



// =================================
// Region Log
// =================================

export interface DealerRegionLog {


  id: string


  dealerId: string


  previousRegionId?:
    string | null


  previousRegionName?:
    string | null


  nextRegionId?:
    string | null


  nextRegionName?:
    string | null


  actionType:
    | 'assign'
    | 'reassign'
    | 'remove'


  operatorId?:
    string | null


  operatorRole?:
    string | null


  remark?:
    string | null


  createdAt:
    string

}



// =================================
// Region Filters
// =================================

export interface DealerRegionFilters {


  keyword?:
    string


  market?:
    | 'taiwan'
    | 'china'


  status?:
    | 'active'
    | 'disabled'


  page?:
    number


  pageSize?:
    number

}



// =================================
// Pagination
// =================================

export interface DealerRegionPagination {


  page:
    number


  pageSize:
    number


  total:
    number


  totalPages:
    number

}



// =================================
// Region List Response
// =================================

export interface DealerRegionListResponse {


  success:
    boolean


  regions:
    DealerRegion[]


  pagination:
    DealerRegionPagination


  message:
    string


  error?:
    string

}



// =================================
// Region Assignment Response
// =================================

export interface DealerRegionAssignmentResponse {


  success:
    boolean


  assignment?:
    DealerRegionAssignment


  message:
    string


  error?:
    string

}



// =================================
// Region Assignment Request
// =================================

export interface DealerRegionAssignRequest {


  dealerId:
    string


  regionId:
    string


  operatorId?:
    string


  remark?:
    string

}



// =================================
// Region Reassign Request
// =================================

export interface DealerRegionReassignRequest {


  dealerId:
    string


  newRegionId:
    string


  operatorId?:
    string


  remark?:
    string

}



// =================================
// Region Remove Request
// =================================

export interface DealerRegionRemoveRequest {


  dealerId:
    string


  operatorId?:
    string


  remark?:
    string

}



// =================================
// Region Log Response
// =================================

export interface DealerRegionLogListResponse {


  success:
    boolean


  logs:
    DealerRegionLog[]


  pagination:
    DealerRegionPagination


  message:
    string


  error?:
    string

}



// =================================
// Region History Log Item
// =================================

export interface DealerRegionHistoryItem {


  id:string


  dealerId:string


  previousRegionId?:
    string | null


  previousRegionName?:
    string | null


  nextRegionId?:
    string | null


  nextRegionName?:
    string | null


  actionType:
    | 'assign'
    | 'reassign'
    | 'unassign'


  operatorId?:
    string | null


  operatorName?:
    string | null


  remark?:
    string | null


  createdAt:string

}