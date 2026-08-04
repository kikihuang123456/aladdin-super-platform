/**
 * ALADDIN Enterprise V4
 *
 * Dealer ERP
 *
 * API Layer
 */


import {
  supabase,
} from '../lib/supabase'


import type {
  Dealer,
  DealerDetailResponse,
  DealerFilters,
  DealerLogListResponse,
  DealerListResponse,
  DealerMutationResponse,
  DealerPagination,
  DealerStatistics,
  DealerApprovalInput,
  DealerStatusUpdateInput,
  DealerLevelUpdateInput,
} from '../types/dealer'



const DEALER_TABLE =
  'dealers'


const DEALER_LOG_TABLE =
  'dealer_logs'


const DEFAULT_PAGE_SIZE =
  20



interface DealerRow {

  id?: unknown

  dealer_no?: unknown

  dealer_code?: unknown

  member_id?: unknown

  name?: unknown

  phone?: unknown

  email?: unknown

  market?: unknown

  level?: unknown

  status?: unknown

  region_id?: unknown

  region_name?: unknown

  direct_count?: unknown

  team_count?: unknown

  team_sales?: unknown

  total_commission?: unknown

  approved_by?: unknown

  approved_at?: unknown

  remark?: unknown

  created_at?: unknown

  updated_at?: unknown

}



// =================================
// Empty Statistics
// =================================

function createEmptyStatistics():
DealerStatistics {

  return {

    total: 0,

    pending: 0,

    approved: 0,

    active: 0,

    suspended: 0,

    disabled: 0,


    normal: 0,

    star1: 0,

    star2: 0,

    star3: 0,

    star4: 0,

    star5: 0,

    star6: 0,

    star7: 0,


    totalTeamCount: 0,

    totalTeamSales: 0,

    totalCommission: 0,

  }

}



// =================================
// Empty Pagination
// =================================

function createEmptyPagination():
DealerPagination {

  return {

    page: 1,

    pageSize:
      DEFAULT_PAGE_SIZE,

    total: 0,

    totalPages: 0,

  }

}



// =================================
// Normalize String
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
    &&
    value.trim()
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
// API Error Normalize
// =================================

function normalizeApiError(
  errorValue: unknown,
  fallback: string,
): string {


  if (
    errorValue instanceof Error
  ) {

    return errorValue.message

  }



  if (
    typeof errorValue === 'object'
    &&
    errorValue !== null
  ) {


    const errorRecord =
      errorValue as Record<
        string,
        unknown
      >



    const parts = [

      typeof errorRecord.message === 'string'
        ? errorRecord.message
        : '',


      typeof errorRecord.details === 'string'
        ? errorRecord.details
        : '',


      typeof errorRecord.hint === 'string'
        ? `提示：${errorRecord.hint}`
        : '',


      typeof errorRecord.code === 'string'
        ? `錯誤代碼：${errorRecord.code}`
        : '',

    ].filter(Boolean)



    if (
      parts.length
    ) {

      return parts.join('；')

    }

  }


  return fallback

}
// =================================
// Dealer Mapping
// =================================

function mapDealer(
  row: DealerRow,
): Dealer {

  return {

    id:
      normalizeString(
        row.id,
      ),


    dealerNo:
      normalizeString(
        row.dealer_no ??
        row.dealer_code,
      ),


    memberId:
      normalizeString(
        row.member_id,
      ),


    name:
      normalizeString(
        row.name,
      ),


    phone:
      normalizeNullableString(
        row.phone,
      ),


    email:
      normalizeNullableString(
        row.email,
      ),


    market:
      normalizeString(
        row.market,
        'taiwan',
      ) as Dealer['market'],


    level:
      normalizeString(
        row.level,
        'normal',
      ) as Dealer['level'],


    status:
      normalizeString(
        row.status,
        'pending',
      ) as Dealer['status'],


    regionId:
      normalizeNullableString(
        row.region_id,
      ),


    regionName:
      normalizeNullableString(
        row.region_name,
      ),


    directCount:
      normalizeNumber(
        row.direct_count,
      ),


    teamCount:
      normalizeNumber(
        row.team_count,
      ),


    teamSales:
      normalizeNumber(
        row.team_sales,
      ),


    totalCommission:
      normalizeNumber(
        row.total_commission,
      ),


    approvedBy:
      normalizeNullableString(
        row.approved_by,
      ),


    approvedAt:
      normalizeNullableString(
        row.approved_at,
      ),


    remark:
      normalizeNullableString(
        row.remark,
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
// Dealer List
// =================================

export async function getDealers(
  filters:
    DealerFilters,
): Promise<DealerListResponse> {


  try {


    const page =
      Number.isInteger(
        filters.page,
      )
      &&
      filters.page > 0
        ? filters.page
        : 1



    const pageSize =
      Number.isInteger(
        filters.pageSize,
      )
      &&
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
          DEALER_TABLE,
        )
        .select(
          '*',
          {
            count:
              'exact',
          },
        )



    const keyword =
      filters.keyword
        ?.trim()
        ??
        ''



    if (
      keyword
    ) {

      query =
        query.or(
          [
            `dealer_no.ilike.%${keyword}%`,
            `dealer_code.ilike.%${keyword}%`,
            `name.ilike.%${keyword}%`,
            `phone.ilike.%${keyword}%`,
            `email.ilike.%${keyword}%`,
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
      filters.level
    ) {

      query =
        query.eq(
          'level',
          filters.level,
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



    if (
      filters.regionId
    ) {

      query =
        query.eq(
          'region_id',
          filters.regionId,
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



    if (
      error
    ) {

      throw error

    }



    const dealers =
      (
        data ?? []
      )
      .map(
        (row) =>
          mapDealer(
            row as DealerRow,
          ),
      )



    const statistics =
      dealers.reduce<
        DealerStatistics
      >(
        (
          result,
          dealer,
        ) => {


          result.total += 1


          result.totalTeamCount +=
            dealer.teamCount


          result.totalTeamSales +=
            dealer.teamSales


          result.totalCommission +=
            dealer.totalCommission



          switch(
            dealer.status
          ) {

            case 'pending':

              result.pending += 1

              break


            case 'approved':

              result.approved += 1

              break


            case 'active':

              result.active += 1

              break


            case 'suspended':

              result.suspended += 1

              break


            case 'disabled':

              result.disabled += 1

              break

          }



          switch(
            dealer.level
          ) {

            case 'normal':

              result.normal += 1

              break


            case 'star_1':

              result.star1 += 1

              break


            case 'star_2':

              result.star2 += 1

              break


            case 'star_3':

              result.star3 += 1

              break


            case 'star_4':

              result.star4 += 1

              break


            case 'star_5':

              result.star5 += 1

              break


            case 'star_6':

              result.star6 += 1

              break


            case 'star_7':

              result.star7 += 1

              break

          }


          return result


        },
        createEmptyStatistics(),
      )



    const total =
      count ?? 0



    return {

      success:
        true,


      dealers,


      statistics,


      pagination: {

        page,

        pageSize,

        total,

        totalPages:
          total > 0
            ? Math.ceil(
                total /
                pageSize,
              )
            : 0,

      },


      message:
        '經銷商資料載入成功。',

    }



  } catch(
    errorValue
  ) {


    return {

      success:
        false,


      dealers:
        [],


      statistics:
        createEmptyStatistics(),


      pagination:
        createEmptyPagination(),


      message:
        '經銷商資料載入失敗。',


      error:
        normalizeApiError(
          errorValue,
          '經銷商資料載入發生未知錯誤。',
        ),

    }

  }

}
// =================================
// Dealer Detail
// =================================

export async function getDealerById(
  dealerId: string,
): Promise<DealerDetailResponse> {


  const normalizedId =
    dealerId.trim()



  if (!normalizedId) {

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
      data,
      error,
    } =
      await supabase
        .from(
          DEALER_TABLE,
        )
        .select('*')
        .eq(
          'id',
          normalizedId,
        )
        .single()



    if (
      error
    ) {

      throw error

    }



    return {

      success:
        true,


      dealer:
        mapDealer(
          data as DealerRow,
        ),


      message:
        '經銷商詳情載入成功。',

    }



  } catch(
    errorValue
  ) {


    return {

      success:
        false,


      message:
        '經銷商詳情載入失敗。',


      error:
        normalizeApiError(
          errorValue,
          '經銷商詳情載入發生未知錯誤。',
        ),

    }

  }

}



// =================================
// Dealer Logs
// =================================

export async function getDealerLogs(
  dealerId: string,
): Promise<DealerLogListResponse> {


  const normalizedId =
    dealerId.trim()



  if (!normalizedId) {

    return {

      success:
        false,

      logs:
        [],

      pagination: {

        page: 1,

        pageSize: 20,

        total: 0,

        totalPages: 0,

      },

      message:
        'Dealer ID 不可空白。',

      error:
        'Dealer ID 不可空白。',

    }

}



  try {


    const {
      data,
      error,
    } =
      await supabase
        .from(
          DEALER_LOG_TABLE,
        )
        .select(`
          id,
          dealer_id,
          action_type,
          action_name,
          previous_data,
          next_data,
          operator_id,
          operator_role,
          remark,
          created_at
        `)
        .eq(
          'dealer_id',
          normalizedId,
        )
        .order(
          'created_at',
          {
            ascending:
              false,
          },
        )



    if (
      error
    ) {

      throw error

    }



    const logs =
      (data ?? [])
      .map(
        (item) => ({

          id:
            item.id,


          dealerId:
            item.dealer_id,


          actionType:
            item.action_type,


          actionName:
            item.action_name,


          previousData:
            item.previous_data,


          nextData:
            item.next_data,


          operatorId:
            item.operator_id,


          operatorRole:
            item.operator_role,


          remark:
            item.remark,


          createdAt:
            item.created_at,

        }),
      )



    return {

      success:
        true,


      logs,


      pagination: {

        page:
          1,


        pageSize:
          logs.length,


        total:
          logs.length,


        totalPages:
          logs.length > 0
            ? 1
            : 0,

      },


      message:
        '經銷商操作紀錄載入成功。',

    }



  }catch(errorValue) {


    return {

      success:
        false,


      logs:
        [],


      pagination: {

        page: 1,

        pageSize: 20,

        total: 0,

        totalPages: 0,

      },


      message:
        '經銷商操作紀錄載入失敗。',
        

    }

  }

}
// =================================
// Dealer Approval
// =================================

export async function reviewDealer(
  input:
    DealerApprovalInput,
): Promise<DealerMutationResponse> {


  const normalizedId =
    input.dealerId.trim()



  if (!normalizedId) {

    return {

      success:
        false,


      message:
        'Dealer ID 不可空白。',


      error:
        'Dealer ID 不可空白。',

    }

  }



  const now =
    new Date()
      .toISOString()



  const payload:
    Record<string, unknown> = {


      status:
        input.status,


      approved_by:
        input.approvedBy ??
        null,


      approved_at:
        now,


      remark:
        input.remark ??
        null,


      updated_at:
        now,

    }



  /**
   * approved
   * → active
   *
   * rejected
   * → disabled
   */

  if (
    input.status === 'approved'
  ) {

    payload.status =
      'active'

  }



  if (
    input.status === 'rejected'
  ) {

    payload.status =
      'disabled'

  }



  try {


    const {
      data,
      error,
    } =
      await supabase
        .from(
          DEALER_TABLE,
        )
        .update(
          payload,
        )
        .eq(
          'id',
          normalizedId,
        )
        .select('*')
        .single()



    if (
      error
    ) {

      throw error

    }



    return {

      success:
        true,


      dealer:
        mapDealer(
          data as DealerRow,
        ),


      message:

        input.status === 'approved'

          ? '經銷商審核通過，已啟用。'

          : '經銷商審核已拒絕。',

    }



  } catch(
    errorValue
  ) {


    return {

      success:
        false,


      message:
        '經銷商審核更新失敗。',


      error:
        normalizeApiError(
          errorValue,
          '經銷商審核更新發生未知錯誤。',
        ),

    }

  }

}
// =================================
// Dealer Status Update
// =================================

export async function updateDealerStatus(
  input:
    DealerStatusUpdateInput,
): Promise<DealerMutationResponse> {


  const normalizedId =
    input.dealerId.trim()



  if (!normalizedId) {

    return {

      success:
        false,


      message:
        'Dealer ID 不可空白。',


      error:
        'Dealer ID 不可空白。',

    }

  }



  const payload:
    Record<string, unknown> = {


      status:
        input.status,


      updated_at:
        new Date()
          .toISOString(),

    }



  if (
    input.operatorId !== undefined
  ) {

    payload.approved_by =
      input.operatorId

  }



  if (
    input.remark !== undefined
  ) {

    payload.remark =
      input.remark

  }



  try {


    const {
      data,
      error,
    } =
      await supabase
        .from(
          DEALER_TABLE,
        )
        .update(
          payload,
        )
        .eq(
          'id',
          normalizedId,
        )
        .select('*')
        .single()



    if (
      error
    ) {

      throw error

    }



    return {

      success:
        true,


      dealer:
        mapDealer(
          data as DealerRow,
        ),


      message:
        getDealerStatusMessage(
          input.status,
        ),

    }



  } catch(
    errorValue
  ) {


    return {

      success:
        false,


      message:
        'Dealer 狀態更新失敗。',


      error:
        normalizeApiError(
          errorValue,
          'Dealer 狀態更新發生未知錯誤。',
        ),

    }

  }

}



// =================================
// Dealer Status Message
// =================================

function getDealerStatusMessage(
  status:
    DealerStatusUpdateInput['status'],
): string {


  switch(
    status
  ) {


    case 'active':

      return '經銷商已啟用。'



    case 'suspended':

      return '經銷商已暫停。'



    case 'disabled':

      return '經銷商已停用。'



    case 'approved':

      return '經銷商已通過。'



    default:

      return '經銷商狀態已更新。'

  }

}
// =================================
// Dealer Level Update
// =================================

export async function updateDealerLevel(
  input:
    DealerLevelUpdateInput,
): Promise<DealerMutationResponse> {


  const normalizedId =
    input.dealerId.trim()



  if (!normalizedId) {

    return {

      success:
        false,


      message:
        'Dealer ID 不可空白。',


      error:
        'Dealer ID 不可空白。',

    }

  }



  const payload:
    Record<string, unknown> = {


      level:
        input.level,


      updated_at:
        new Date()
          .toISOString(),

    }



  if (
    input.operatorId !== undefined
  ) {

    payload.approved_by =
      input.operatorId

  }



  if (
    input.remark !== undefined
  ) {

    payload.remark =
      input.remark

  }



  try {


    const {
      data,
      error,
    } =
      await supabase
        .from(
          DEALER_TABLE,
        )
        .update(
          payload,
        )
        .eq(
          'id',
          normalizedId,
        )
        .select('*')
        .single()



    if (
      error
    ) {

      throw error

    }



    return {

      success:
        true,


      dealer:
        mapDealer(
          data as DealerRow,
        ),


      message:
        '經銷商等級更新成功。',

    }



  } catch(
    errorValue
  ) {


    return {

      success:
        false,


      message:
        '經銷商等級更新失敗。',


      error:
        normalizeApiError(
          errorValue,
          '經銷商等級更新發生未知錯誤。',
        ),

    }

  }

}



// =================================
// Dealer API Export
// =================================

export const dealerApi = {

  getDealers,

  getPendingDealers,

  getDealerById,

  getDealerLogs,

  reviewDealer,

  updateDealerStatus,

  updateDealerLevel,

}
// =================================
// Dealer Pending Approval List
// =================================

export async function getPendingDealers()
: Promise<DealerListResponse> {


  try {


    const {
      data,
      error,
      count,
    } =
      await supabase
        .from(
          DEALER_TABLE,
        )
        .select(
          '*',
          {
            count:
              'exact',
          },
        )
        .eq(
          'status',
          'pending',
        )
        .order(
          'created_at',
          {
            ascending:
              false,
          },
        )


    if(error){

      throw error

    }



    const dealers =
      (
        data ?? []
      )
      .map(
        (row)=>
          mapDealer(
            row as DealerRow,
          ),
      )



    return {

      success:
        true,

      dealers,


      statistics:
        createEmptyStatistics(),


      pagination: {

        page:
          1,

        pageSize:
          dealers.length,

        total:
          count ?? dealers.length,

        totalPages:
          1,

      },


      message:
        '待審核經銷商載入成功。',

    }



  } catch(errorValue){


    return {

      success:
        false,


      dealers:
        [],


      statistics:
        createEmptyStatistics(),


      pagination:
        createEmptyPagination(),


      message:
        '待審核經銷商載入失敗。',


      error:
        normalizeApiError(
          errorValue,
          '取得待審核經銷商失敗。',
        ),

    }

  }

}