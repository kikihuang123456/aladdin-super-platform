/**
 * ALADDIN Enterprise V4
 *
 * Dealer ERP
 *
 * M05-07 Dealer Region Capacity API
 */

import {
  supabase,
} from '../lib/supabase'

import type {
  DealerRegionCapacity,
  DealerRegionCapacityUpdateRequest,
} from '../types/dealer-region-capacity'


export async function getDealerRegionCapacity():
Promise<DealerRegionCapacity[]> {

  const {
    data: regions,
    error: regionError,
  } =
    await supabase
      .from('dealer_regions')
      .select(`
        id,
        name,
        market,
        status,
        max_dealers
      `)

  if (regionError) {
    throw regionError
  }

  const {
    data: members,
    error: memberError,
  } =
    await supabase
      .from('dealer_region_members')
      .select(`
        region_id,
        dealer_id
      `)

  if (memberError) {
    throw memberError
  }

  return (regions ?? []).map(
    (region) => {

      const currentDealers =
        (members ?? []).filter(
          (item) =>
            item.region_id === region.id,
        ).length

      const maxDealers =
        typeof region.max_dealers === 'number'
          ? region.max_dealers
          : 0

      const remainingCapacity =
        Math.max(
          maxDealers - currentDealers,
          0,
        )

      const usageRate =
        maxDealers > 0
          ? Number(
              (
                currentDealers /
                maxDealers *
                100
              ).toFixed(2),
            )
          : 0

      return {
        regionId:
          region.id,

        regionName:
          region.name,

        market:
          region.market,

        status:
          region.status,

        maxDealers,

        currentDealers,

        remainingCapacity,

        usageRate,
      }
    },
  )
}


export async function updateDealerRegionCapacity(
  payload:
    DealerRegionCapacityUpdateRequest,
) {

  const {
    data,
    error,
  } =
    await supabase
      .from('dealer_regions')
      .update({
        max_dealers:
          payload.maxDealers,
      })
      .eq(
        'id',
        payload.regionId,
      )
      .select()
      .single()

  if (error) {
    throw error
  }

  return data
}