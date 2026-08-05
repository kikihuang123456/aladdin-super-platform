/**
 * ALADDIN Enterprise V4
 *
 * Dealer ERP
 *
 * M05-10 Dealer Region Batch Assignment API
 */


import {
  supabase,
} from '../lib/supabase'


import {
  checkDealerRegionAssignmentCapacity,
} from './dealer-region-capacity-rule'


import type {
  DealerRegionBatchAssignmentFailureItem,
  DealerRegionBatchAssignmentRequest,
  DealerRegionBatchAssignmentResponse,
  DealerRegionBatchAssignmentSuccessItem,
} from '../types/dealer-region-batch-assignment'



const REGION_TABLE =
  'dealer_regions'


const ASSIGNMENT_TABLE =
  'dealer_region_members'


const LOG_TABLE =
  'dealer_region_logs'



interface AssignmentRow {

  id?:
    unknown

  dealer_id?:
    unknown

  region_id?:
    unknown

  assigned_by?:
    unknown

  assigned_at?:
    unknown

  remark?:
    unknown

}



interface ExistingAssignmentRow {

  dealer_id?:
    unknown

  region_id?:
    unknown

}



function normalizeString(
  value: unknown,
  fallback = '',
): string {

  return typeof value === 'string'
    ? value
    : fallback

}



function normalizeApiError(
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


    const parts = [

      typeof error.message === 'string'
        ? error.message
        : '',

      typeof error.details === 'string'
        ? error.details
        : '',

      typeof error.hint === 'string'
        ? `提示：${error.hint}`
        : '',

      typeof error.code === 'string'
        ? `錯誤代碼：${error.code}`
        : '',

    ].filter(Boolean)


    if(
      parts.length > 0
    ){

      return parts.join('；')

    }

  }


  return fallback

}



function normalizeDealerIds(
  dealerIds: string[],
): string[] {

  return Array.from(
    new Set(
      dealerIds
        .map(
          dealerId =>
            dealerId.trim(),
        )
        .filter(Boolean),
    ),
  )

}



async function regionExists(
  regionId: string,
): Promise<boolean> {

  const {
    data,
    error,
  } =
    await supabase
      .from(
        REGION_TABLE,
      )
      .select(
        'id',
      )
      .eq(
        'id',
        regionId,
      )
      .maybeSingle()


  if(
    error
  ){

    throw error

  }


  return Boolean(
    data,
  )

}



async function getExistingAssignments(
  dealerIds: string[],
): Promise<Map<string, string>> {

  if(
    dealerIds.length === 0
  ){

    return new Map()

  }


  const {
    data,
    error,
  } =
    await supabase
      .from(
        ASSIGNMENT_TABLE,
      )
      .select(`
        dealer_id,
        region_id
      `)
      .in(
        'dealer_id',
        dealerIds,
      )


  if(
    error
  ){

    throw error

  }


  const assignmentMap =
    new Map<string, string>()


  for(
    const item of
    (
      data ?? []
    )
  ){

    const row =
      item as ExistingAssignmentRow


    const dealerId =
      normalizeString(
        row.dealer_id,
      )


    const regionId =
      normalizeString(
        row.region_id,
      )


    if(
      dealerId
    ){

      assignmentMap.set(
        dealerId,
        regionId,
      )

    }

  }


  return assignmentMap

}



async function rollbackInsertedAssignments(
  assignmentIds: string[],
): Promise<void> {

  if(
    assignmentIds.length === 0
  ){

    return

  }


  const {
    error,
  } =
    await supabase
      .from(
        ASSIGNMENT_TABLE,
      )
      .delete()
      .in(
        'id',
        assignmentIds,
      )


  if(
    error
  ){

    throw new Error(
      `批次紀錄寫入失敗，而且新增指派回復失敗：${
        normalizeApiError(
          error,
          '未知回復錯誤。',
        )
      }`,
    )

  }

}



export async function batchAssignDealerRegion(
  input:
    DealerRegionBatchAssignmentRequest,
): Promise<DealerRegionBatchAssignmentResponse> {

  const regionId =
    input.regionId.trim()


  const dealerIds =
    normalizeDealerIds(
      input.dealerIds,
    )


  const requestedCount =
    dealerIds.length


  const failedItems:
    DealerRegionBatchAssignmentFailureItem[] =
      []


  if(
    !regionId
  ){

    return {

      success:
        false,

      regionId:
        '',

      requestedCount,

      successCount:
        0,

      failureCount:
        requestedCount,

      successfulItems:
        [],

      failedItems:
        dealerIds.map(
          dealerId => ({

            dealerId,

            message:
              '區域 ID 不可空白。',

          }),
        ),

      message:
        '批次指派失敗。',

      error:
        '區域 ID 不可空白。',

    }

  }


  if(
    dealerIds.length === 0
  ){

    return {

      success:
        false,

      regionId,

      requestedCount:
        0,

      successCount:
        0,

      failureCount:
        0,

      successfulItems:
        [],

      failedItems:
        [],

      message:
        '請至少選擇一位經銷商。',

      error:
        '請至少選擇一位經銷商。',

    }

  }


  try {


    const exists =
      await regionExists(
        regionId,
      )


    if(
      !exists
    ){

      return {

        success:
          false,

        regionId,

        requestedCount,

        successCount:
          0,

        failureCount:
          requestedCount,

        successfulItems:
          [],

        failedItems:
          dealerIds.map(
            dealerId => ({

              dealerId,

              message:
                '找不到指定的經銷商區域。',

            }),
          ),

        message:
          '批次指派失敗。',

        error:
          '找不到指定的經銷商區域。',

      }

    }


    /*
     * 先檢查哪些經銷商已存在區域指派。
     */

    const existingAssignmentMap =
      await getExistingAssignments(
        dealerIds,
      )


    const assignableDealerIds:
      string[] =
        []


    for(
      const dealerId of dealerIds
    ){

      const existingRegionId =
        existingAssignmentMap.get(
          dealerId,
        )


      if(
        existingRegionId
      ){

        failedItems.push({

          dealerId,

          message:
            existingRegionId === regionId
              ? '該經銷商已指派至目前區域。'
              : '該經銷商已有其他區域指派，請使用重新指派功能。',

        })


        continue

      }


      assignableDealerIds.push(
        dealerId,
      )

    }


    if(
      assignableDealerIds.length === 0
    ){

      return {

        success:
          false,

        regionId,

        requestedCount,

        successCount:
          0,

        failureCount:
          failedItems.length,

        successfulItems:
          [],

        failedItems,

        message:
          '沒有可執行批次指派的經銷商。',

        error:
          '所有經銷商都已存在區域指派。',

      }

    }


    /*
     * M05-08 容量規則檢查。
     *
     * 僅計算實際可新增的經銷商，
     * 不把已指派者重複計入容量。
     */

    const capacityResult =
      await checkDealerRegionAssignmentCapacity({

        regionId,

        dealerIds:
          assignableDealerIds,

      })


    if(
      !capacityResult.allowed
    ){

      for(
        const dealerId of
        assignableDealerIds
      ){

        failedItems.push({

          dealerId,

          message:
            capacityResult.message,

        })

      }


      return {

        success:
          false,

        regionId,

        requestedCount,

        successCount:
          0,

        failureCount:
          failedItems.length,

        successfulItems:
          [],

        failedItems,

        message:
          '批次指派未通過區域容量檢查。',

        error:
          capacityResult.message,

      }

    }


    const now =
      new Date()
        .toISOString()


    const assignmentPayload =
      assignableDealerIds.map(
        dealerId => ({

          dealer_id:
            dealerId,

          region_id:
            regionId,

          assigned_by:
            null,

          assigned_at:
            now,

          remark:
            input.remark
            ??
            '後台批次指派經銷商區域',

        }),
      )


    /*
     * 一次批次寫入所有指派資料。
     */

    const {
      data: insertedAssignments,
      error: assignmentError,
    } =
      await supabase
        .from(
          ASSIGNMENT_TABLE,
        )
        .insert(
          assignmentPayload,
        )
        .select(`
          id,
          dealer_id,
          region_id,
          assigned_by,
          assigned_at,
          remark
        `)


    if(
      assignmentError
    ){

      throw assignmentError

    }


    const assignmentRows =
      (
        insertedAssignments ?? []
      ) as AssignmentRow[]


    const successfulItems:
      DealerRegionBatchAssignmentSuccessItem[] =
        assignmentRows.map(
          row => ({

            dealerId:
              normalizeString(
                row.dealer_id,
              ),

            assignmentId:
              normalizeString(
                row.id,
              ),

            regionId:
              normalizeString(
                row.region_id,
                regionId,
              ),

          }),
        )


    const insertedAssignmentIds =
      successfulItems
        .map(
          item =>
            item.assignmentId,
        )
        .filter(Boolean)


    /*
     * 指派完成後批次寫入操作紀錄。
     */

    const logPayload =
      successfulItems.map(
        item => ({

          dealer_id:
            item.dealerId,

          previous_region_id:
            null,

          next_region_id:
            regionId,

          action_type:
            'assign',

          operator_id:
            null,

          remark:
            input.remark
            ??
            '後台批次指派經銷商區域',

          created_at:
            now,

        }),
      )


    const {
      error: logError,
    } =
      await supabase
        .from(
          LOG_TABLE,
        )
        .insert(
          logPayload,
        )


    if(
      logError
    ){

      /*
       * Supabase 瀏覽器端無法直接包覆資料庫 Transaction，
       * 因此以補償式回復刪除本次新增的指派。
       */

      await rollbackInsertedAssignments(
        insertedAssignmentIds,
      )


      const logErrorMessage =
        normalizeApiError(
          logError,
          '批次操作紀錄寫入失敗。',
        )


      for(
        const dealerId of
        assignableDealerIds
      ){

        failedItems.push({

          dealerId,

          message:
            `操作紀錄寫入失敗，已回復區域指派：${logErrorMessage}`,

        })

      }


      return {

        success:
          false,

        regionId,

        requestedCount,

        successCount:
          0,

        failureCount:
          failedItems.length,

        successfulItems:
          [],

        failedItems,

        message:
          '批次指派失敗，新增資料已回復。',

        error:
          logErrorMessage,

      }

    }


    return {

      success:
        successfulItems.length > 0,

      regionId,

      requestedCount,

      successCount:
        successfulItems.length,

      failureCount:
        failedItems.length,

      successfulItems,

      failedItems,

      message:
        failedItems.length > 0
          ? `批次指派完成：成功 ${successfulItems.length} 位，失敗 ${failedItems.length} 位。`
          : `批次指派成功，共完成 ${successfulItems.length} 位經銷商。`,

    }


  }catch(
    errorValue
  ){


    const errorMessage =
      normalizeApiError(
        errorValue,
        '批次區域指派發生未知錯誤。',
      )


    const failedDealerIdSet =
      new Set(
        failedItems.map(
          item =>
            item.dealerId,
        ),
      )


    for(
      const dealerId of dealerIds
    ){

      if(
        failedDealerIdSet.has(
          dealerId,
        )
      ){

        continue

      }


      failedItems.push({

        dealerId,

        message:
          errorMessage,

      })

    }


    return {

      success:
        false,

      regionId,

      requestedCount,

      successCount:
        0,

      failureCount:
        failedItems.length,

      successfulItems:
        [],

      failedItems,

      message:
        '經銷商區域批次指派失敗。',

      error:
        errorMessage,

    }

  }

}



export const dealerRegionBatchAssignmentApi = {

  batchAssignDealerRegion,

}