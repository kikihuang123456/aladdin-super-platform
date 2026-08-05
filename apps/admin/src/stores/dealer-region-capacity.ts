/**
 * ALADDIN Enterprise V4
 *
 * Dealer ERP
 *
 * M05-07 Dealer Region Capacity Store
 */


import {
  ref,
} from 'vue'


import {
  defineStore,
} from 'pinia'


import {
  getDealerRegionCapacity,
  updateDealerRegionCapacity,
} from '../api/dealer-region-capacity'


import type {
  DealerRegionCapacity,
  DealerRegionCapacityUpdateRequest,
} from '../types/dealer-region-capacity'



function normalizeError(
  errorValue: unknown,
  fallback: string,
): string {

  if(
    errorValue instanceof Error
  ){

    return errorValue.message

  }


  if(
    typeof errorValue === 'object'
    &&
    errorValue !== null
  ){

    const error =
      errorValue as Record<
        string,
        unknown
      >


    if(
      typeof error.message === 'string'
    ){

      return error.message

    }

  }


  return fallback

}



export const useDealerRegionCapacityStore =
defineStore(
  'dealer-region-capacity',
  () => {


    const capacities =
      ref<DealerRegionCapacity[]>([])


    const loading =
      ref(false)


    const updating =
      ref(false)


    const error =
      ref<string | null>(null)


    const message =
      ref<string | null>(null)



    async function fetchCapacity(){

      loading.value =
        true


      error.value =
        null


      try {


        capacities.value =
          await getDealerRegionCapacity()


        return capacities.value


      }catch(errorValue){


        error.value =
          normalizeError(
            errorValue,
            '取得區域容量資料失敗。',
          )


        return []


      }finally{


        loading.value =
          false

      }

    }



    async function updateCapacity(
      payload:
        DealerRegionCapacityUpdateRequest,
    ){

      if(
        updating.value
      ){

        return null

      }


      updating.value =
        true


      error.value =
        null


      message.value =
        null


      try {


        const result =
          await updateDealerRegionCapacity(
            payload,
          )


        message.value =
          '區域容量更新成功。'


        await fetchCapacity()


        return result


      }catch(errorValue){


        error.value =
          normalizeError(
            errorValue,
            '更新區域容量失敗。',
          )


        return null


      }finally{


        updating.value =
          false

      }

    }



    function clearMessage(){

      message.value =
        null

    }



    return {

      capacities,

      loading,

      updating,

      error,

      message,

      fetchCapacity,

      updateCapacity,

      clearMessage,

    }

  },
)


export default useDealerRegionCapacityStore