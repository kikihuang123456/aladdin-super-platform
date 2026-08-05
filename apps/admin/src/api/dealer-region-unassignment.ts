/**
 * ALADDIN Enterprise V4
 *
 * Dealer ERP
 *
 * M05-12 Dealer Region Unassignment API
 */


import {
  supabase,
} from '../lib/supabase'


import type {
  DealerRegionUnassignmentRequest,
  DealerRegionUnassignmentResponse,
  DealerRegionUnassignmentSnapshot,
} from '../types/dealer-region-unassignment'



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



async function restoreAssignment(
  snapshot:
    DealerRegionUnassignmentSnapshot,
): Promise<void> {

  const {
    error,
  } =
    await supabase
      .from(
        ASSIGNMENT_TABLE,
      )
      .insert({

        id:
          snapshot.assignmentId,

        dealer_id:
          snapshot.dealerId,

        region_id:
          snapshot.previousRegionId,

        assigned_by:
          snapshot.previousAssignedBy,

        assigned_at:
          snapshot.previousAssignedAt,

        remark:
          snapshot.previousRemark,

      })


  if(
    error
  ){

    throw new Error(
      `解除指派紀錄寫入失敗，且原指派恢復失敗：${
        normalizeApiError(
          error,
          '未知恢復錯誤。',
        )
      }`,
    )

  }

}



export async function unassignDealerFromRegion(
  input:
    DealerRegionUnassignmentRequest,
): Promise<DealerRegionUnassignmentResponse> {

  const dealerId =
    input.dealerId.trim()


  if(
    !dealerId
  ){

    return {

      success:
        false,

      dealerId:
        '',

      previousRegionId:
        null,

      message:
        '經銷商 ID 不可空白。',

      error:
        '經銷商 ID 不可空白。',

    }

  }


  try {


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


    const snapshot:
      DealerRegionUnassignmentSnapshot = {

        assignmentId,

        dealerId,

        previousRegionId,

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


    const {
      error: deleteError,
    } =
      await supabase
        .from(
          ASSIGNMENT_TABLE,
        )
        .delete()
        .eq(
          'id',
          assignmentId,
        )


    if(
      deleteError
    ){

      throw deleteError

    }


    const now =
      new Date()
        .toISOString()


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
            null,

          action_type:
            'unassign',

          operator_id:
            input.operatorId
            ??
            null,

          remark:
            input.remark
            ??
            '後台解除經銷商區域指派',

          created_at:
            now,

        })


    if(
      logError
    ){

      await restoreAssignment(
        snapshot,
      )


      return {

        success:
          false,

        dealerId,

        previousRegionId,

        snapshot,

        message:
          '解除指派紀錄寫入失敗，已恢復原指派。',

        error:
          normalizeApiError(
            logError,
            '解除指派操作紀錄寫入失敗。',
          ),

      }

    }


    return {

      success:
        true,

      dealerId,

      previousRegionId,

      snapshot,

      message:
        '經銷商區域指派解除成功。',

    }


  }catch(
    errorValue
  ){


    const errorMessage =
      normalizeApiError(
        errorValue,
        '解除經銷商區域指派時發生未知錯誤。',
      )


    return {

      success:
        false,

      dealerId,

      previousRegionId:
        null,

      message:
        '經銷商區域指派解除失敗。',

      error:
        errorMessage,

    }

  }

}



export const dealerRegionUnassignmentApi = {

  unassignDealerFromRegion,

}