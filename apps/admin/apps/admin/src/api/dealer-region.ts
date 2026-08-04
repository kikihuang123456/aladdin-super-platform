/**
 * ALADDIN Enterprise V4
 *
 * Dealer ERP
 *
 * M05-04 Dealer Region Assignment
 *
 * API
 */


import {
  supabase,
} from '../lib/supabase'


import type {
  DealerRegionFilters,
  DealerRegion,
} from '../types/dealer-region'



/**
 * 取得經銷商區域列表
 */
export async function getDealerRegions(
  filters: DealerRegionFilters = {},
){


  let query =
    supabase
      .from('dealer_regions')
      .select('*')
      .order(
        'sort_order',
        {
          ascending:true,
        }
      )



  if(filters.market){

    query =
      query.eq(
        'market',
        filters.market,
      )

  }



  if(filters.status){

    query =
      query.eq(
        'status',
        filters.status,
      )

  }



  const {
    data,
    error,
  } = await query



  if(error){

    return {

      success:false,

      regions:[],

      error:error.message,

    }

  }



  return {

    success:true,

    regions:data as DealerRegion[],

  }

}



/**
 * 取得可指派經銷商
 */
export async function fetchAssignableDealers(){

  console.log(
    'fetchAssignableDealers 開始'
  )


  const {
    data,
    error,
  } =
    await supabase
      .from('members')
      .select(`
        id,
        name,
        phone,
        member_code,
        status
      `)
      .eq(
        'status',
        'active'
      )
      .order(
        'created_at',
        {
          ascending:false,
        }
      )


  console.log(
    'supabase members data:',
    data
  )


  console.log(
    'supabase members error:',
    error
  )

  if(error){

    throw error

  }


  return data ?? []

}



/**
 * 指派經銷商
 */
export async function assignDealerRegion(
  input:any,
){


  const {

    region_id,

    dealer_id,

  } = input



  const {
    data,
    error,
  } =
    await supabase
      .from(
        'dealer_region_members'
      )
      .insert({

        region_id,

        dealer_id,

        status:'active',

        assigned_at:
          new Date()
          .toISOString(),

      })
      .select()
      .single()



  if(error){

    return {

      success:false,

      message:error.message,

    }

  }



  return {

    success:true,

    message:'經銷商指派成功',

    data,

  }

}



/**
 * 重新指派
 */
export async function reassignDealerRegion(
  input:any,
){

  return assignDealerRegion(
    input
  )

}



/**
 * 解除區域
 */
export async function unassignDealerRegion(
  input:any,
){


  const {

    region_id,

    dealer_id,

  } = input



  const {
    error,
  } =
    await supabase
      .from(
        'dealer_region_members'
      )
      .delete()
      .eq(
        'region_id',
        region_id,
      )
      .eq(
        'dealer_id',
        dealer_id,
      )



  if(error){

    return {

      success:false,

      message:error.message,

    }

  }



  return {

    success:true,

    message:'解除成功',

  }

}