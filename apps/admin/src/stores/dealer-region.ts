/**
 * ALADDIN Enterprise V4
 *
 * Dealer ERP
 *
 * M05-04 Dealer Region Assignment
 *
 * Pinia Store
 */


import {
  computed,
  ref,
} from 'vue'


import {
  defineStore,
} from 'pinia'


import {
  getDealerRegions,
  assignDealerRegion,
  reassignDealerRegion,
  unassignDealerRegion,
} from '../api/dealer-region'


import type {
  DealerRegion,
  DealerRegionFilters,
  DealerRegionAssignRequest,
  DealerRegionAssignmentResponse,
} from '../types/dealer-region'



function normalizeError(
  error: unknown,
  fallback: string,
): string {

  if(error instanceof Error){

    return error.message

  }

  return fallback

}



export const useDealerRegionStore =
  defineStore(
    'dealer-region',
    () => {


      const regions =
        ref<DealerRegion[]>([])


      const currentRegion =
        ref<DealerRegion | null>(null)


      const isLoading =
        ref(false)


      const isMutating =
        ref(false)


      const error =
        ref<string | null>(null)


      const message =
        ref<string | null>(null)



      const total =
        computed(
          () =>
            regions.value.length,
        )



      async function fetchRegions(
        filters:
          DealerRegionFilters = {},
      ){

        isLoading.value =
          true

        error.value =
          null


        try {


          const response =
            await getDealerRegions(
              filters,
            )


          if(
            !response.success
          ){

            throw new Error(
              response.error ??
              response.message,
            )

          }


          regions.value =
            response.regions



          return response



        }catch(errorValue){


          error.value =
            normalizeError(
              errorValue,
              '取得區域資料失敗。',
            )


          return null



        }finally{

          isLoading.value =
            false

        }

      }



     async function assignRegion(
  input:
    DealerRegionAssignRequest,
): Promise<DealerRegionAssignmentResponse | null>{


  if(isMutating.value){

    return null

  }


  console.log(
    'assignRegion input:',
    input
  )


  isMutating.value =
    true


  error.value =
    null



  try {


    const response =
      await assignDealerRegion(
        input,
      )


    console.log(
      'assignRegion API response:',
      response
    )


    if(
      !response.success
    ){

      throw new Error(
        response.error ??
        response.message,
      )

    }


    message.value =
      response.message


    return response



  }catch(errorValue){


    error.value =
      normalizeError(
        errorValue,
        '區域指派失敗。',
      )


    return null



  }finally{

    isMutating.value =
      false

  }

}



      async function reassignRegion(
        input:
          DealerRegionAssignRequest,
      ){

        if(isMutating.value){

          return null

        }


        isMutating.value =
          true


        try {


          const response =
            await reassignDealerRegion(
              input,
            )


          if(
            !response.success
          ){

            throw new Error(
              response.error ??
              response.message,
            )

          }


          message.value =
            response.message


          return response



        }catch(errorValue){

          error.value =
            normalizeError(
              errorValue,
              '區域重新指派失敗。',
            )


          return null


        }finally{

          isMutating.value =
            false

        }

      }



      async function removeRegion(
        input:
          DealerRegionAssignRequest,
      ){

        if(isMutating.value){

          return null

        }


        isMutating.value =
          true


        try {


          const response =
            await unassignDealerRegion(
              input,
            )


          if(
            !response.success
          ){

            throw new Error(
              response.error ??
              response.message,
            )

          }


          message.value =
            response.message


          return response



        }catch(errorValue){

          error.value =
            normalizeError(
              errorValue,
              '解除區域失敗。',
            )


          return null


        }finally{

          isMutating.value =
            false

        }

      }



      return {

        regions,

        currentRegion,

        isLoading,

        isMutating,

        error,

        message,

        total,


        fetchRegions,

        assignRegion,

        reassignRegion,

        removeRegion,

      }


    },
  )


export default useDealerRegionStore