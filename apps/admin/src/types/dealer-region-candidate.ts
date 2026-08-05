/**
 * ALADDIN Enterprise V4
 *
 * Dealer ERP
 *
 * M05-09 Dealer Region Assignment Candidates
 */


export interface DealerRegionCandidate {

  id:
    string

  name:
    string

  phone:
    string | null

  email:
    string | null

  dealerCode:
    string | null

  status:
    string

  currentRegionId:
    string | null

  currentRegionName:
    string | null

  createdAt:
    string | null

}


export interface DealerRegionCandidateFilters {

  keyword?:
    string

  status?:
    string

  unassignedOnly?:
    boolean

  page?:
    number

  pageSize?:
    number

}


export interface DealerRegionCandidateListResponse {

  items:
    DealerRegionCandidate[]

  total:
    number

  page:
    number

  pageSize:
    number

  totalPages:
    number

}