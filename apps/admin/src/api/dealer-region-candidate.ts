/**
 * ALADDIN Enterprise V4
 *
 * Dealer ERP
 *
 * M05-09 Dealer Region Candidate API
 */


import {
  supabase,
} from '../lib/supabase'


import type {
  DealerRegionCandidate,
  DealerRegionCandidateFilters,
  DealerRegionCandidateListResponse,
} from '../types/dealer-region-candidate'



const DEALER_TABLE =
  'dealers'


const REGION_TABLE =
  'dealer_regions'


const REGION_MEMBER_TABLE =
  'dealer_region_members'


const DEFAULT_PAGE_SIZE =
  20



interface DealerCandidateRow {

  id?:
    unknown

  name?:
    unknown

  phone?:
    unknown

  email?:
    unknown

  dealer_no?:
    unknown

  dealer_code?:
    unknown

  status?:
    unknown

  region_id?:
    unknown

  region_name?:
    unknown

  created_at?:
    unknown

}



interface DealerRegionMemberRow {

  dealer_id?:
    unknown

  region_id?:
    unknown

}



interface DealerRegionRow {

  id?:
    unknown

  name?:
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

  if(
    typeof value !== 'string'
  ){

    return null

  }


  const normalizedValue =
    value.trim()


  return normalizedValue
    ? normalizedValue
    : null

}



function normalizePositiveInteger(
  value: number | undefined,
  fallback: number,
): number {

  if(
    typeof value !== 'number'
    ||
    !Number.isFinite(value)
  ){

    return fallback

  }


  const normalizedValue =
    Math.floor(value)


  return normalizedValue > 0
    ? normalizedValue
    : fallback

}



function normalizeApiError(
  errorValue: unknown,
  fallback: string,
): Error {

  if(
    errorValue instanceof Error
  ){

    return errorValue

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

      return new Error(
        parts.join('；'),
      )

    }

  }


  return new Error(
    fallback,
  )

}



function mapCandidate(
  row: DealerCandidateRow,
  assignmentMap: Map<string, string>,
  regionMap: Map<string, string>,
): DealerRegionCandidate {

  const id =
    normalizeString(
      row.id,
    )


  const assignedRegionId =
    normalizeNullableString(
      assignmentMap.get(
        id,
      ),
    )


  const dealerRegionId =
    normalizeNullableString(
      row.region_id,
    )


  const currentRegionId =
    assignedRegionId
    ??
    dealerRegionId


  const currentRegionName =
    currentRegionId
      ? (
          regionMap.get(
            currentRegionId,
          )
          ??
          normalizeNullableString(
            row.region_name,
          )
        )
      : null


  return {

    id,

    name:
      normalizeString(
        row.name,
        '未命名經銷商',
      ),

    phone:
      normalizeNullableString(
        row.phone,
      ),

    email:
      normalizeNullableString(
        row.email,
      ),

    dealerCode:
      normalizeNullableString(
        row.dealer_no
        ??
        row.dealer_code,
      ),

    status:
      normalizeString(
        row.status,
        'pending',
      ),

    currentRegionId,

    currentRegionName,

    createdAt:
      normalizeNullableString(
        row.created_at,
      ),

  }

}



async function getRegionAssignments():
Promise<Map<string, string>> {

  const {
    data,
    error,
  } =
    await supabase
      .from(
        REGION_MEMBER_TABLE,
      )
      .select(`
        dealer_id,
        region_id
      `)


  if(
    error
  ){

    throw normalizeApiError(
      error,
      '取得經銷商區域指派資料失敗。',
    )

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
      item as DealerRegionMemberRow


    const dealerId =
      normalizeNullableString(
        row.dealer_id,
      )


    const regionId =
      normalizeNullableString(
        row.region_id,
      )


    if(
      dealerId
      &&
      regionId
    ){

      assignmentMap.set(
        dealerId,
        regionId,
      )

    }

  }


  return assignmentMap

}



async function getRegionMap():
Promise<Map<string, string>> {

  const {
    data,
    error,
  } =
    await supabase
      .from(
        REGION_TABLE,
      )
      .select(`
        id,
        name
      `)


  if(
    error
  ){

    throw normalizeApiError(
      error,
      '取得區域資料失敗。',
    )

  }


  const regionMap =
    new Map<string, string>()


  for(
    const item of
    (
      data ?? []
    )
  ){

    const row =
      item as DealerRegionRow


    const regionId =
      normalizeNullableString(
        row.id,
      )


    const regionName =
      normalizeNullableString(
        row.name,
      )


    if(
      regionId
      &&
      regionName
    ){

      regionMap.set(
        regionId,
        regionName,
      )

    }

  }


  return regionMap

}



export async function getDealerRegionCandidates(
  filters:
    DealerRegionCandidateFilters = {},
): Promise<DealerRegionCandidateListResponse> {

  const page =
    normalizePositiveInteger(
      filters.page,
      1,
    )


  const pageSize =
    normalizePositiveInteger(
      filters.pageSize,
      DEFAULT_PAGE_SIZE,
    )


  const keyword =
    filters.keyword
      ?.trim()
    ??
    ''


  const unassignedOnly =
    filters.unassignedOnly
    ??
    true


  try {


    let dealerQuery =
      supabase
        .from(
          DEALER_TABLE,
        )
        .select(`
          id,
          name,
          phone,
          email,
          dealer_no,
          dealer_code,
          status,
          region_id,
          region_name,
          created_at
        `)


    if(
      keyword
    ){

      dealerQuery =
        dealerQuery.or(
          [
            `dealer_no.ilike.%${keyword}%`,
            `dealer_code.ilike.%${keyword}%`,
            `name.ilike.%${keyword}%`,
            `phone.ilike.%${keyword}%`,
            `email.ilike.%${keyword}%`,
          ].join(','),
        )

    }


    if(
      filters.status
    ){

      dealerQuery =
        dealerQuery.eq(
          'status',
          filters.status,
        )

    }


    const [
      dealerResponse,
      assignmentMap,
      regionMap,
    ] =
      await Promise.all([

        dealerQuery.order(
          'created_at',
          {
            ascending:
              false,
          },
        ),

        getRegionAssignments(),

        getRegionMap(),

      ])


    if(
      dealerResponse.error
    ){

      throw normalizeApiError(
        dealerResponse.error,
        '取得可指派經銷商資料失敗。',
      )

    }


    const mappedCandidates =
      (
        dealerResponse.data
        ??
        []
      )
      .map(
        item =>
          mapCandidate(
            item as DealerCandidateRow,
            assignmentMap,
            regionMap,
          ),
      )


    const filteredCandidates =
      unassignedOnly
        ? mappedCandidates.filter(
            candidate =>
              candidate.currentRegionId ===
              null,
          )
        : mappedCandidates


    const total =
      filteredCandidates.length


    const totalPages =
      total > 0
        ? Math.ceil(
            total /
            pageSize,
          )
        : 0


    const normalizedPage =
      totalPages > 0
        ? Math.min(
            page,
            totalPages,
          )
        : 1


    const from =
      (
        normalizedPage - 1
      )
      *
      pageSize


    const items =
      filteredCandidates.slice(
        from,
        from +
        pageSize,
      )


    return {

      items,

      total,

      page:
        normalizedPage,

      pageSize,

      totalPages,

    }


  }catch(
    errorValue
  ){


    throw normalizeApiError(
      errorValue,
      '取得可指派經銷商資料時發生未知錯誤。',
    )

  }

}



export const dealerRegionCandidateApi = {

  getDealerRegionCandidates,

}