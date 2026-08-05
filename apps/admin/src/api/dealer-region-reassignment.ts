/**
 * ALADDIN Enterprise V4
 *
 * Dealer ERP
 *
 * M05-11 Dealer Region Reassignment API
 */


import {
  supabase,
} from '../lib/supabase'


import {
  checkDealerRegionAssignmentCapacity,
} from './dealer-region-capacity-rule'


import type {
  DealerRegionReassignmentRequest,
  DealerRegionReassignmentResponse,
  DealerRegionReassignmentSnapshot,
} from '../types/dealer-region-reassignment'



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



function normalizeString(
  value: unknown,
  fallback = '',
): string {

  return typeof value === 'string'
    ? value
    : fallback

}



function normalizeNullableString(
  value: unknown,
): string | null {

  return typeof value === 'string'
    ? value
    : null

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



async function restorePreviousAssignment(
  snapshot:
    DealerRegionReassignmentSnapshot,
): Promise<void> {

  const {
    error,
  } =
    await supabase
      .from(
        ASSIGNMENT_TABLE,
      )
      .update({

        region_id:
          snapshot.previousRegionId,

        assigned_by:
          snapshot.previousAssignedBy,

        assigned_at:
          snapshot.previousAssignedAt,

        remark:
          snapshot.previousRemark,

      })
      .eq(
        'id',
        snapshot.assignmentId,
      )


  if(
    error
  ){

    throw new Error(
      `重新指派紀錄寫入失敗，且原區域回復失敗：${
        normalizeApiError(
          error,
          '未知回復錯誤。',
        )
      }`,
    )

  }

}



export async function reassignDealerToRegion(
  input:
    DealerRegionReassignmentRequest,
): Promise<DealerRegionReassignmentResponse> {

  const dealerId =
    input.dealerId.trim()


  const nextRegionId =
    input.nextRegionId.trim()


  if(
    !dealerId
    ||
    !nextRegionId
  ){

    return {

      success:
        false,

      dealerId,

      previousRegionId:
        null,

      nextRegionId:
        nextRegionId || null,

      message:
        '經銷商 ID 與新區域 ID 不可空白。',

      error:
        '經銷商 ID 與新區域 ID 不可空白。',

    }

  }


  try {


    const exists =
      await regionExists(
        nextRegionId,
      )


    if(
      !exists
    ){

      return {

        success:
          false,

        dealerId,

        previousRegionId:
          null,

        nextRegionId,

        message:
          '找不到指定的新區域。',

        error:
          '找不到指定的新區域。',

      }

    }


    const {
      data: currentAssignment,
      error: currentAssignmentError,
    } =
      await supabase
        .from(
          ASSIGNMENT_TABLE,
        )
        .select(`
          id,
          dealer_id,
          region_id,
          assigned_by,
          assigned_at,
          remark
        `)
        .eq(
          'dealer_id',
          dealerId,
        )
        .maybeSingle()


    if(
      currentAssignmentError
    ){

      throw currentAssignmentError

    }


    if(
      !currentAssignment
    ){

      return {

        success:
          false,

        dealerId,

        previousRegionId:
          null,

        nextRegionId,

        message:
          '該經銷商目前沒有區域指派資料。',

        error:
          '該經銷商目前沒有區域指派資料。',

      }

    }


    const currentRow =
      currentAssignment as AssignmentRow


    const assignmentId =
      normalizeString(
        currentRow.id,
      )


    const previousRegionId =
      normalizeString(
        currentRow.region_id,
      )


    if(
      previousRegionId ===
      nextRegionId
    ){

      return {

        success:
          false,

        dealerId,

        previousRegionId,

        nextRegionId,

        message:
          '新區域與目前區域相同，不需要重新指派。',

        error:
          '新區域與目前區域相同。',

      }

    }


    /*
     * M05-08：
     * 檢查新區域是否仍有一位經銷商的可用容量。
     */

    const capacityResult =
      await checkDealerRegionAssignmentCapacity({

        regionId:
          nextRegionId,

        dealerIds: [
          dealerId,
        ],

      })


    if(
      !capacityResult.allowed
    ){

      return {

        success:
          false,

        dealerId,

        previousRegionId,

        nextRegionId,

        message:
          capacityResult.message,

        error:
          capacityResult.message,

      }

    }


    const snapshot:
      DealerRegionReassignmentSnapshot = {

        assignmentId,

        dealerId,

        previousRegionId,

        nextRegionId,

        previousAssignedBy:
          normalizeNullableString(
            currentRow.assigned_by,
          ),

        previousAssignedAt:
          normalizeNullableString(
            currentRow.assigned_at,
          ),

        previousRemark:
          normalizeNullableString(
            currentRow.remark,
          ),

      }


    const now =
      new Date()
        .toISOString()


    const {
      error: updateError,
    } =
      await supabase
        .from(
          ASSIGNMENT_TABLE,
        )
        .update({

          region_id:
            nextRegionId,

          assigned_by:
            input.operatorId
            ??
            null,

          assigned_at:
            now,

          remark:
            input.remark
            ??
            '後台重新指派經銷商區域',

        })
        .eq(
          'id',
          assignmentId,
        )


    if(
      updateError
    ){

      throw updateError

    }


    const {
      error: logError,
    } =
      await supabase
        .from(
          LOG_TABLE,
        )
        .insert({

          dealer_id:
            dealerId,

          previous_region_id:
            previousRegionId,

          next_region_id:
            nextRegionId,

          action_type:
            'reassign',

          operator_id:
            input.operatorId
            ??
            null,

          remark:
            input.remark
            ??
            '後台重新指派經銷商區域',

          created_at:
            now,

        })


    if(
      logError
    ){

      await restorePreviousAssignment(
        snapshot,
      )


      return {

        success:
          false,

        dealerId,

        previousRegionId,

        nextRegionId,

        snapshot,

        message:
          '重新指派紀錄寫入失敗，已回復原區域。',

        error:
          normalizeApiError(
            logError,
            '重新指派操作紀錄寫入失敗。',
          ),

      }

    }


    return {

      success:
        true,

      dealerId,

      previousRegionId,

      nextRegionId,

      snapshot,

      message:
        '經銷商區域重新指派成功。',

    }


  }catch(
    errorValue
  ){


    const errorMessage =
      normalizeApiError(
        errorValue,
        '經銷商區域重新指派發生未知錯誤。',
      )


    return {

      success:
        false,

      dealerId,

      previousRegionId:
        null,

      nextRegionId,

      message:
        '經銷商區域重新指派失敗。',

      error:
        errorMessage,

    }

  }

}



export const dealerRegionReassignmentApi = {

  reassignDealerToRegion,

}