/**
 * ALADDIN Enterprise V4
 *
 * Dealer ERP
 *
 * M05-05 Dealer Region Dashboard API
 */


import {
  supabase,
} from '../lib/supabase'





export async function
getDealerRegionDashboard(){



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
   * 取得區域經銷商指派資料
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

  const regionStatistics =
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
   * 區域排行
   *
   * 經銷商數量由高到低
   */

  const ranking =
    [
      ...regionStatistics
    ]
    .sort(
      (a,b)=>
        b.dealerCount -
        a.dealerCount
    )







  /**
   * Dashboard 回傳
   */

  return {



    /**
     * 區域總數
     */

    totalRegions:

      regions?.length ?? 0,





    /**
     * 啟用區域
     */

    activeRegions:

      regions?.filter(
        item =>
          item.status === 'active'
      )
      .length ?? 0,






    /**
     * 台灣區域
     */

    taiwanRegions:

      regions?.filter(
        item =>
          item.market === 'taiwan'
      )
      .length ?? 0,







    /**
     * 中國區域
     */

    chinaRegions:

      regions?.filter(
        item =>
          item.market === 'china'
      )
      .length ?? 0,






    /**
     * 原始資料
     */

    regions:

      regions ?? [],




    assignments:

      assignments ?? [],






    /**
     * 區域統計
     */

    regionStatistics,





    /**
     * 排行榜
     */

    ranking,



  }



}