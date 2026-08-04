/**
 * ALADDIN Enterprise V4
 *
 * Dealer ERP
 *
 * M05-04 Dealer Region Assignment
 *
 * API Layer
 */


import {
  supabase,
} from '../lib/supabase'


import type {
  DealerRegion,
  DealerRegionFilters,
  DealerRegionListResponse,
  DealerRegionPagination,
  DealerRegionAssignRequest,
  DealerRegionAssignmentResponse,
} from '../types/dealer-region'



const REGION_TABLE =
  'dealer_regions'


const DEFAULT_PAGE_SIZE =
  20



// =================================
// Region Row
// =================================

interface DealerRegionRow {

  id?: unknown

  code?: unknown

  name?: unknown

  market?: unknown

  province?: unknown

  city?: unknown

  status?: unknown

  dealer_count?: unknown

  created_at?: unknown

  updated_at?: unknown

}



// =================================
// Normalize
// =================================

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



function normalizeNumber(
  value: unknown,
  fallback = 0,
): number {


  if (
    typeof value === 'number'
    &&
    Number.isFinite(value)
  ) {

    return value

  }


  if (
    typeof value === 'string'
  ) {

    const parsed =
      Number(value)


    return Number.isFinite(parsed)
      ? parsed
      : fallback

  }


  return fallback

}



// =================================
// Error Normalize
// =================================

function normalizeApiError(
  errorValue: unknown,
  fallback: string,
): string {


  if (
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



// =================================
// Empty Pagination
// =================================

function createEmptyPagination():
DealerRegionPagination {


  return {

    page:
      1,

    pageSize:
      DEFAULT_PAGE_SIZE,

    total:
      0,

    totalPages:
      0,

  }

}



// =================================
// Mapping
// =================================

function mapDealerRegion(
  row: DealerRegionRow,
): DealerRegion {


  return {


    id:
      normalizeString(
        row.id,
      ),


    code:
      normalizeString(
        row.code,
      ),


    name:
      normalizeString(
        row.name,
      ),


    market:
      normalizeString(
        row.market,
        'taiwan',
      ) as DealerRegion['market'],


    province:
      normalizeNullableString(
        row.province,
      ),


    city:
      normalizeNullableString(
        row.city,
      ),


    status:
      normalizeString(
        row.status,
        'active',
      ) as DealerRegion['status'],


    dealerCount:
      normalizeNumber(
        row.dealer_count,
      ),


    createdAt:
      normalizeString(
        row.created_at,
      ),


    updatedAt:
      normalizeString(
        row.updated_at,
      ),


  }

}
// =================================
// Dealer Region List
// =================================

export async function getDealerRegions(
  filters:
    DealerRegionFilters,
): Promise<DealerRegionListResponse> {


  try {


    const page =
      filters.page && filters.page > 0
        ? filters.page
        : 1


    const pageSize =
      filters.pageSize &&
      filters.pageSize > 0
        ? filters.pageSize
        : DEFAULT_PAGE_SIZE



    const from =
      (
        page - 1
      )
      *
      pageSize



    const to =
      from +
      pageSize -
      1



    let query =
      supabase
        .from(
          REGION_TABLE,
        )
        .select(
          '*',
          {
            count:
              'exact',
          },
        )



    if (
      filters.keyword
    ) {

      query =
        query.or(
          [
            `code.ilike.%${filters.keyword}%`,
            `name.ilike.%${filters.keyword}%`,
          ]
          .join(','),
        )

    }



    if (
      filters.market
    ) {

      query =
        query.eq(
          'market',
          filters.market,
        )

    }



    if (
      filters.status
    ) {

      query =
        query.eq(
          'status',
          filters.status,
        )

    }



    const {
      data,
      error,
      count,
    } =
      await query
        .order(
          'created_at',
          {
            ascending:
              false,
          },
        )
        .range(
          from,
          to,
        )



    if(error){

      throw error

    }



    const regions =
      (
        data ?? []
      )
      .map(
        (row) =>
          mapDealerRegion(
            row as DealerRegionRow,
          ),
      )



    return {

      success:
        true,


      regions,


      pagination: {

        page,

        pageSize,

        total:
          count ?? 0,


        totalPages:
          count
            ? Math.ceil(
                count /
                pageSize,
              )
            : 0,

      },


      message:
        '區域資料載入成功。',

    }



  } catch(errorValue){


    return {

      success:
        false,


      regions:
        [],


      pagination:
        createEmptyPagination(),


      message:
        '區域資料載入失敗。',


      error:
        normalizeApiError(
          errorValue,
          '取得區域資料發生錯誤。',
        ),

    }

  }

}
// =================================
// Dealer Region Detail
// =================================

export async function getDealerRegionById(
  regionId: string,
): Promise<DealerRegion | null> {


  const normalizedId =
    regionId.trim()



  if(!normalizedId){

    return null

  }



  try {


    const {
      data,
      error,
    } =
      await supabase
        .from(
          REGION_TABLE,
        )
        .select(
          '*',
        )
        .eq(
          'id',
          normalizedId,
        )
        .single()



    if(error){

      throw error

    }



    return mapDealerRegion(
      data as DealerRegionRow,
    )



  } catch(errorValue){


    console.error(

      '[Dealer Region API] 取得區域詳情失敗：',

      normalizeApiError(
        errorValue,
        '取得區域詳情失敗。',
      ),

    )


    return null

  }

}
// =================================
// Assign Dealer Region
// =================================

export async function assignDealerRegion(
  input:
    DealerRegionAssignRequest,
): Promise<DealerRegionAssignmentResponse> {


  const dealerId =
    input.dealerId.trim()


  const regionId =
    input.regionId.trim()



  if(
    !dealerId ||
    !regionId
  ){

    return {

      success:
        false,

      message:
        '經銷商或區域不可空白。',

      error:
        '經銷商或區域不可空白。',

    }

  }



  try {


    const now =
      new Date()
        .toISOString()



    const {
      data: assignment,
      error: assignmentError,
    } =
      await supabase
        .from(
          'dealer_region_members',
        )
        .insert({

          dealer_id:
            dealerId,


          region_id:
            regionId,


          assigned_by:
            input.operatorId ??
            null,


          assigned_at:
            now,


          remark:
            input.remark ??
            null,

        })
        .select('*')
        .single()



    if(
      assignmentError
    ){

      throw assignmentError

    }



    await supabase
      .from(
        'dealer_region_logs',
      )
      .insert({

        dealer_id:
          dealerId,


        next_region_id:
          regionId,


        action_type:
          'assign',


        operator_id:
          input.operatorId ??
          null,


        remark:
          input.remark ??
          '新增區域指派',


        created_at:
          now,

      })



    return {

      success:
        true,


      assignment: {

        id:
          assignment.id,


        dealerId:
          assignment.dealer_id,


        regionId:
          assignment.region_id,


        assignedBy:
          assignment.assigned_by,


        assignedAt:
          assignment.assigned_at,


        remark:
          assignment.remark,

      },


      message:
        '經銷商區域指派成功。',

    }



  } catch(errorValue){


    return {

      success:
        false,


      message:
        '經銷商區域指派失敗。',


      error:
        normalizeApiError(
          errorValue,
          '區域指派發生未知錯誤。',
        ),

    }

  }

}
// =================================
// Reassign Dealer Region
// =================================

export async function reassignDealerRegion(
  input:
    DealerRegionAssignRequest,
): Promise<DealerRegionAssignmentResponse> {


  const dealerId =
    input.dealerId.trim()


  const regionId =
    input.regionId.trim()



  if(
    !dealerId ||
    !regionId
  ){

    return {

      success:
        false,

      message:
        '經銷商或新區域不可空白。',

      error:
        '經銷商或新區域不可空白。',

    }

  }



  try {


    const {
      data: currentAssignment,
      error: findError,
    } =
      await supabase
        .from(
          'dealer_region_members',
        )
        .select('*')
        .eq(
          'dealer_id',
          dealerId,
        )
        .maybeSingle()



    if(findError){

      throw findError

    }



    const previousRegionId =
      currentAssignment?.region_id
      ??
      null



    const now =
      new Date()
        .toISOString()



    const {
      data,
      error,
    } =
      await supabase
        .from(
          'dealer_region_members',
        )
        .upsert({

          dealer_id:
            dealerId,


          region_id:
            regionId,


          assigned_by:
            input.operatorId ??
            null,


          assigned_at:
            now,


          remark:
            input.remark ??
            '重新指派區域',

        })
        .select('*')
        .single()



    if(error){

      throw error

    }



    await supabase
      .from(
        'dealer_region_logs',
      )
      .insert({

        dealer_id:
          dealerId,


        previous_region_id:
          previousRegionId,


        next_region_id:
          regionId,


        action_type:
          'reassign',


        operator_id:
          input.operatorId ??
          null,


        remark:
          input.remark ??
          '經銷商區域重新指派',


        created_at:
          now,

      })



    return {

      success:
        true,


      assignment: {

        id:
          data.id,


        dealerId:
          data.dealer_id,


        regionId:
          data.region_id,


        assignedBy:
          data.assigned_by,


        assignedAt:
          data.assigned_at,


        remark:
          data.remark,

      },


      message:
        '經銷商區域重新指派成功。',

    }



  } catch(errorValue){


    return {

      success:
        false,


      message:
        '經銷商區域重新指派失敗。',


      error:
        normalizeApiError(
          errorValue,
          '重新指派發生未知錯誤。',
        ),

    }

  }

}
// =================================
// Unassign Dealer Region
// =================================

export async function unassignDealerRegion(
  input:
    DealerRegionAssignRequest,
): Promise<DealerRegionAssignmentResponse> {


  const dealerId =
    input.dealerId.trim()



  if(!dealerId){

    return {

      success:
        false,

      message:
        'Dealer ID 不可空白。',

      error:
        'Dealer ID 不可空白。',

    }

  }



  try {


    const {
      data: currentAssignment,
      error: findError,
    } =
      await supabase
        .from(
          'dealer_region_members',
        )
        .select('*')
        .eq(
          'dealer_id',
          dealerId,
        )
        .maybeSingle()



    if(findError){

      throw findError

    }



    if(!currentAssignment){

      return {

        success:
          false,

        message:
          '目前沒有區域指派資料。',

        error:
          '目前沒有區域指派資料。',

      }

    }



    const now =
      new Date()
        .toISOString()



    const {
      error: deleteError,
    } =
      await supabase
        .from(
          'dealer_region_members',
        )
        .delete()
        .eq(
          'dealer_id',
          dealerId,
        )



    if(deleteError){

      throw deleteError

    }



    await supabase
      .from(
        'dealer_region_logs',
      )
      .insert({

        dealer_id:
          dealerId,


        previous_region_id:
          currentAssignment.region_id,


        next_region_id:
          null,


        action_type:
          'unassign',


        operator_id:
          input.operatorId ??
          null,


        remark:
          input.remark ??
          '解除經銷商區域',


        created_at:
          now,

      })



    return {

      success:
        true,


      message:
        '經銷商區域解除成功。',

    }



  } catch(errorValue){


    return {

      success:
        false,


      message:
        '解除經銷商區域失敗。',


      error:
        normalizeApiError(
          errorValue,
          '解除區域發生未知錯誤。',
        ),

    }

  }

}
/**
 * 取得區域經銷商列表
 */
export async function getRegionDealers(
  regionId:string
){

  const {
    data,
    error
  } =
    await supabase
      .from(
        'dealer_region_members'
      )
      .select(`
        id,
        region_id,
        dealer_id,
        status,
        assigned_at,
        remark,

        members(
          id,
          name,
          phone,
          member_code
        )

      `)
      .eq(
        'region_id',
        regionId
      )
      .order(
        'assigned_at',
        {
          ascending:false
        }
      )


  if(error){

    throw error

  }


  return data ?? []

}
/**
 * 取得區域異動紀錄
 */
export async function getDealerRegionLogs(
  regionId:string
){


  const {
    data,
    error
  } =
    await supabase
      .from(
        'dealer_region_logs'
      )
      .select(`
        id,
        dealer_id,
        previous_region_id,
        next_region_id,
        action_type,
        operator_id,
        remark,
        created_at,

        members(
          name
        )

      `)
      .or(
        `previous_region_id.eq.${regionId},next_region_id.eq.${regionId}`
      )
      .order(
        'created_at',
        {
          ascending:false
        }
      )


  if(error){

    throw error

  }


  return data ?? []

}