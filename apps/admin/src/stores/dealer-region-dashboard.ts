/**
 * ALADDIN Enterprise V4
 *
 * Dealer ERP
 *
 * M05-05 Dealer Region Dashboard
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
  getDealerRegionDashboard,
} from '../api/dealer-region-dashboard'



export const useDealerRegionDashboardStore =
defineStore(
  'dealer-region-dashboard',
  () => {


    const dashboard =
      ref<any>(null)


    const loading =
      ref(false)


    const error =
      ref<string | null>(null)



    async function fetchDashboard(){

      loading.value =
        true


      error.value =
        null


      try{


        dashboard.value =
          await getDealerRegionDashboard()



        return dashboard.value



      }catch(e:any){


        error.value =
          e.message ??
          '取得區域 Dashboard 失敗'


        return null


      }finally{


        loading.value =
          false


      }


    }



    return {


      dashboard,

      loading,

      error,

      fetchDashboard,


    }


  },
)