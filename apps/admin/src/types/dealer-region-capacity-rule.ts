/**
 * ALADDIN Enterprise V4
 *
 * Dealer ERP
 *
 * M05-08 Dealer Region Capacity Rules
 */


export type DealerRegionCapacityRuleStatus =
  | 'available'
  | 'near_capacity'
  | 'full'
  | 'not_configured'
  | 'disabled'


export interface DealerRegionCapacityRuleResult {

  regionId:
    string

  regionName:
    string

  regionStatus:
    string

  maxDealers:
    number

  currentDealers:
    number

  requestedDealers:
    number

  projectedDealers:
    number

  remainingCapacity:
    number

  allowed:
    boolean

  status:
    DealerRegionCapacityRuleStatus

  message:
    string

}


export interface DealerRegionCapacityCheckRequest {

  regionId:
    string

  dealerCount:
    number

}


export interface DealerRegionAssignmentCapacityCheckRequest {

  regionId:
    string

  dealerIds:
    string[]

}