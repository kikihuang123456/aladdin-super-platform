/**
 * ALADDIN Enterprise V4
 *
 * Dealer ERP
 *
 * M05-06 Dealer Region Analytics API
 */


import {
  supabase,
} from '../lib/supabase'



export async function
getDealerRegionAnalytics(){


  /**
   * 取得區域資料
   */

  const {
    data:regions,
    error:regionError,

  } =
  await supabase
    .from(
      'dealer_regions'
    )
    .select(
      `
      id,
      name,
      market,
      status
      `
    )



  if(regionError){

    throw regionError

  }





  /**
   * 取得區域經銷商關聯
   */

  const {
    data:assignments,
    error:assignmentError,

  } =
  await supabase
    .from(
      'dealer_region_members'
    )
    .select(
      `
      id,
      region_id,
      dealer_id,
      assigned_at
      `
    )



  if(assignmentError){

    throw assignmentError

  }






  /**
   * 區域經銷商統計
   */

  const regionAnalytics =
    (regions ?? [])
    .map(
      region => {


        const dealerCount =
          (assignments ?? [])
          .filter(
            item =>
              item.region_id === region.id
          )
          .length



        return {

          id:
            region.id,


          name:
            region.name,


          market:
            region.market,


          status:
            region.status,


          dealerCount,

        }

      }
    )






  /**
   * TOP 區域排行
   */

  const topRegions =
    [
      ...regionAnalytics
    ]
    .sort(
      (a,b)=>
        b.dealerCount -
        a.dealerCount
    )
    .slice(
      0,
      10
    )







  /**
   * 市場比例
   */

  const marketDistribution = {


    taiwan:

      (regions ?? [])
      .filter(
        item =>
          item.market === 'taiwan'
      )
      .length,



    china:

      (regions ?? [])
      .filter(
        item =>
          item.market === 'china'
      )
      .length,


  }







  return {


    totalRegions:

      regions?.length ?? 0,



    totalDealers:

      assignments?.length ?? 0,



    regionAnalytics,



    topRegions,



    marketDistribution,



  }


}