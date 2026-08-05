/**
 * ALADDIN Enterprise V4
 *
 * Dealer ERP
 *
 * M05-08 Dealer Region Capacity Rule API
 */


import {
  supabase,
} from '../lib/supabase'


import {
  evaluateDealerRegionCapacity,
} from '../utils/dealer-region-capacity-rule'


import type {
  DealerRegionAssignmentCapacityCheckRequest,
  DealerRegionCapacityCheckRequest,
  DealerRegionCapacityRuleResult,
} from '../types/dealer-region-capacity-rule'



interface DealerRegionCapacityRow {

  id:
    string

  name:
    string

  status:
    string

  max_dealers:
    number | null

}



function normalizeDealerCount(
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



async function getRegionCapacityRow(
  regionId: string,
): Promise<DealerRegionCapacityRow> {

  const {
    data,
    error,
  } =
    await supabase
      .from('dealer_regions')
      .select(`
        id,
        name,
        status,
        max_dealers
      `)
      .eq(
        'id',
        regionId,
      )
      .single()


  if(
    error
  ){

    throw error

  }


  if(
    !data
  ){

    throw new Error(
      '找不到指定的經銷商區域。',
    )

  }


  return data as DealerRegionCapacityRow

}



async function getCurrentDealerCount(
  regionId: string,
): Promise<number> {

  const {
    count,
    error,
  } =
    await supabase
      .from('dealer_region_members')
      .select(
        'dealer_id',
        {
          count:
            'exact',

          head:
            true,
        },
      )
      .eq(
        'region_id',
        regionId,
      )


  if(
    error
  ){

    throw error

  }


  return count ?? 0

}



export async function checkDealerRegionCapacity(
  payload:
    DealerRegionCapacityCheckRequest,
): Promise<DealerRegionCapacityRuleResult> {

  if(
    !payload.regionId
  ){

    throw new Error(
      '缺少區域 ID。',
    )

  }


  const requestedDealers =
    normalizeDealerCount(
      payload.dealerCount,
    )


  if(
    requestedDealers <= 0
  ){

    throw new Error(
      '本次指派的經銷商數量必須大於 0。',
    )

  }


  const [
    region,
    currentDealers,
  ] =
    await Promise.all([

      getRegionCapacityRow(
        payload.regionId,
      ),

      getCurrentDealerCount(
        payload.regionId,
      ),

    ])


  return evaluateDealerRegionCapacity({

    regionId:
      region.id,

    regionName:
      region.name,

    regionStatus:
      region.status,

    maxDealers:
      region.max_dealers ?? 0,

    currentDealers,

    requestedDealers,

  })

}



export async function checkDealerRegionAssignmentCapacity(
  payload:
    DealerRegionAssignmentCapacityCheckRequest,
): Promise<DealerRegionCapacityRuleResult> {

  const uniqueDealerIds =
    Array.from(
      new Set(
        payload.dealerIds.filter(
          dealerId =>
            typeof dealerId === 'string'
            &&
            dealerId.trim().length > 0,
        ),
      ),
    )


  if(
    uniqueDealerIds.length === 0
  ){

    throw new Error(
      '請至少選擇一位經銷商。',
    )

  }


  return checkDealerRegionCapacity({

    regionId:
      payload.regionId,

    dealerCount:
      uniqueDealerIds.length,

  })

}