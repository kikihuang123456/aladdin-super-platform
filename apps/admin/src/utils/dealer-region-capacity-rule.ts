/**
 * ALADDIN Enterprise V4
 *
 * Dealer ERP
 *
 * M05-08 Dealer Region Capacity Rule Engine
 */


import type {
  DealerRegionCapacityRuleResult,
  DealerRegionCapacityRuleStatus,
} from '../types/dealer-region-capacity-rule'



export interface EvaluateDealerRegionCapacityInput {

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

}



function normalizeCount(
  value: number,
): number {

  if(
    !Number.isFinite(value)
  ){

    return 0

  }


  return Math.max(
    Math.floor(value),
    0,
  )

}



function isRegionActive(
  status: string,
): boolean {

  const normalizedStatus =
    status
      .trim()
      .toLowerCase()


  return (
    normalizedStatus === 'active'
    ||
    normalizedStatus === 'enabled'
  )

}



export function evaluateDealerRegionCapacity(
  input:
    EvaluateDealerRegionCapacityInput,
): DealerRegionCapacityRuleResult {

  const maxDealers =
    normalizeCount(
      input.maxDealers,
    )


  const currentDealers =
    normalizeCount(
      input.currentDealers,
    )


  const requestedDealers =
    normalizeCount(
      input.requestedDealers,
    )


  const projectedDealers =
    currentDealers +
    requestedDealers


  let remainingCapacity =
    maxDealers > 0
      ? Math.max(
          maxDealers -
          currentDealers,
          0,
        )
      : 0


  let allowed =
    true


  let status:
    DealerRegionCapacityRuleStatus =
      'available'


  let message =
    '區域容量足夠，可以進行經銷商指派。'



  // =================================
  // Region disabled
  // =================================

  if(
    !isRegionActive(
      input.regionStatus,
    )
  ){

    allowed =
      false


    status =
      'disabled'


    message =
      `區域「${input.regionName}」目前未啟用，不能進行經銷商指派。`


    return {

      regionId:
        input.regionId,

      regionName:
        input.regionName,

      regionStatus:
        input.regionStatus,

      maxDealers,

      currentDealers,

      requestedDealers,

      projectedDealers,

      remainingCapacity,

      allowed,

      status,

      message,

    }

  }



 // =================================
// Capacity not configured
// =================================

if(
  maxDealers <= 0
){

  allowed =
    false


  status =
    'not_configured'


  message =
    `區域「${input.regionName}」尚未設定有效容量，請先至區域容量管理設定最大容量。`


  return {

    regionId:
      input.regionId,

    regionName:
      input.regionName,

    regionStatus:
      input.regionStatus,

    maxDealers,

    currentDealers,

    requestedDealers,

    projectedDealers,

    remainingCapacity:
      0,

    allowed,

    status,

    message,

  }

}



  // =================================
  // Region already full
  // =================================

  if(
    currentDealers >=
    maxDealers
  ){

    allowed =
      false


    status =
      'full'


    remainingCapacity =
      0


    message =
      `區域「${input.regionName}」容量已滿，無法再指派經銷商。`


    return {

      regionId:
        input.regionId,

      regionName:
        input.regionName,

      regionStatus:
        input.regionStatus,

      maxDealers,

      currentDealers,

      requestedDealers,

      projectedDealers,

      remainingCapacity,

      allowed,

      status,

      message,

    }

  }



  // =================================
  // Requested count exceeds capacity
  // =================================

  if(
    projectedDealers >
    maxDealers
  ){

    allowed =
      false


    status =
      'full'


    message =
      `區域「${input.regionName}」剩餘容量為 ${remainingCapacity} 位，本次要求指派 ${requestedDealers} 位，已超過可用容量。`


    return {

      regionId:
        input.regionId,

      regionName:
        input.regionName,

      regionStatus:
        input.regionStatus,

      maxDealers,

      currentDealers,

      requestedDealers,

      projectedDealers,

      remainingCapacity,

      allowed,

      status,

      message,

    }

  }



  const projectedUsageRate =
    projectedDealers /
    maxDealers *
    100



  // =================================
  // Near capacity
  // =================================

  if(
    projectedUsageRate >= 80
  ){

    allowed =
      true


    status =
      'near_capacity'


    message =
      `區域「${input.regionName}」可以進行指派，但完成後容量使用率將達 ${projectedUsageRate.toFixed(2)}%。`


    return {

      regionId:
        input.regionId,

      regionName:
        input.regionName,

      regionStatus:
        input.regionStatus,

      maxDealers,

      currentDealers,

      requestedDealers,

      projectedDealers,

      remainingCapacity,

      allowed,

      status,

      message,

    }

  }



  return {

    regionId:
      input.regionId,

    regionName:
      input.regionName,

    regionStatus:
      input.regionStatus,

    maxDealers,

    currentDealers,

    requestedDealers,

    projectedDealers,

    remainingCapacity,

    allowed,

    status,

    message,

  }

}