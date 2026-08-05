/**
 * ALADDIN Enterprise V4
 *
 * Dealer ERP
 *
 * M05-07 Dealer Region Capacity
 *
 * Type Definitions
 */


// =================================
// Region Capacity Item
// =================================

export interface DealerRegionCapacity {


  regionId:
    string


  regionName:
    string


  market:
    string


  status:
    string


  maxDealers:
    number


  currentDealers:
    number


  remainingCapacity:
    number


  usageRate:
    number


}



// =================================
// Update Request
// =================================

export interface DealerRegionCapacityUpdateRequest {


  regionId:
    string


  maxDealers:
    number


}