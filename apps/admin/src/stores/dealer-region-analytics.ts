/**
 * ALADDIN Enterprise V4
 *
 * Dealer ERP
 *
 * M05-06 Dealer Region Analytics
 *
 * Pinia Store
 */


import {
  ref,
} from 'vue'


import {
  defineStore,
} from 'pinia'


import {
  getDealerRegionAnalytics,
} from '../api/dealer-region-analytics'





export const useDealerRegionAnalyticsStore =
defineStore(
  'dealer-region-analytics',
  () => {



    const analytics =
      ref<any>(null)



    const loading =
      ref(false)



    const error =
      ref<string | null>(null)





    async function fetchAnalytics(){


      loading.value =
        true


      error.value =
        null




      try{


        analytics.value =
          await getDealerRegionAnalytics()



        return analytics.value



      }catch(errorValue:any){



        error.value =
          errorValue.message ??
          '取得區域分析資料失敗'



        return null



      }finally{


        loading.value =
          false


      }


    }





    return {


      analytics,


      loading,


      error,


      fetchAnalytics,


    }



  },
)