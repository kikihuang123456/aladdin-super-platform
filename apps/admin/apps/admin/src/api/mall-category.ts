import {
  supabase,
} from '../lib/supabase'


import type {
  MallCategory,
  MallCategoryFilters,
  MallCategoryListResponse,
  MallCategoryDetailResponse,
  MallCategoryMutationResponse,
  CreateMallCategoryInput,
  UpdateMallCategoryInput,
} from '../types/mall-category'



const TABLE_NAME =
  'mall_categories'



function mapCategory(
  item:any,
):MallCategory {

  return {

    id:item.id,

    parentId:
      item.parent_id ?? null,

    code:
      item.code ?? '',

    name:
      item.name ?? '',

    description:
      item.description ?? null,

    imageUrl:
      item.image_url ?? null,

    sort:
      item.sort ?? 0,

    enabled:
      item.enabled ?? true,

    createdAt:
      item.created_at ?? '',

    updatedAt:
      item.updated_at ?? '',

  }

}




/**
 * 分類列表
 */
export async function getMallCategories(
  filters:MallCategoryFilters = {},
):Promise<MallCategoryListResponse>{


  let query =
    supabase
      .from(TABLE_NAME)
      .select(
        '*',
        {
          count:'exact',
        },
      )


  if(
    filters.keyword
  ){

    query =
      query.ilike(
        'name',
        `%${filters.keyword}%`,
      )

  }



  if(
    typeof filters.enabled ===
    'boolean'
  ){

    query =
      query.eq(
        'enabled',
        filters.enabled,
      )

  }



  query =
    query
      .order(
        'sort',
        {
          ascending:true,
        },
      )



  const {
    data,
    error,
    count,
  } =
    await query



  if(error){

    return {

      success:false,

      categories:[],

      statistics:{
        total:0,
        enabled:0,
        disabled:0,
        rootCategories:0,
        childCategories:0,
      },

      pagination:{
        page:1,
        pageSize:20,
        total:0,
        totalPages:0,
      },

      message:
        '分類載入失敗',

      error:
        error.message,

    }

  }



  const categories =
    (data ?? [])
      .map(mapCategory)



  return {

    success:true,

    categories,

    statistics:{

      total:
        categories.length,

      enabled:
        categories.filter(
          item =>
            item.enabled,
        ).length,

      disabled:
        categories.filter(
          item =>
            !item.enabled,
        ).length,

      rootCategories:
        categories.filter(
          item =>
            !item.parentId,
        ).length,

      childCategories:
        categories.filter(
          item =>
            !!item.parentId,
        ).length,

    },


    pagination:{

      page:1,

      pageSize:20,

      total:
        count ?? 0,

      totalPages:1,

    },


    message:
      '分類載入成功',

  }

}





/**
 * 取得單筆分類
 */
export async function getMallCategoryById(
 id:string,
):Promise<MallCategoryDetailResponse>{


 const {
   data,
   error,
 } =
 await supabase
   .from(TABLE_NAME)
   .select('*')
   .eq(
    'id',
    id,
   )
   .single()



 if(error){

  return {

    success:false,

    message:
      '取得分類失敗',

    error:
      error.message,

  }

 }



 return {

  success:true,

  category:
    mapCategory(data),

  message:
    '取得分類成功',

 }

}





/**
 * 新增分類
 */
export async function createMallCategory(
 input:CreateMallCategoryInput,
):Promise<MallCategoryMutationResponse>{


 const {
   data,
   error,
 } =
 await supabase
 .from(TABLE_NAME)
 .insert({

    parent_id:
      input.parentId ?? null,

    code:
      input.code,

    name:
      input.name,

    description:
      input.description ?? null,

    image_url:
      input.imageUrl ?? null,

    sort:
      input.sort,

    enabled:
      input.enabled,

 })
 .select()
 .single()



 if(error){

  return {

   success:false,

   message:
    '新增分類失敗',

   error:
    error.message,

  }

 }



 return {

  success:true,

  category:
    mapCategory(data),

  message:
    '新增分類成功',

 }

}





/**
 * 更新分類
 */
export async function updateMallCategory(
 input:UpdateMallCategoryInput,
):Promise<MallCategoryMutationResponse>{


 const {
   data,
   error,
 } =
 await supabase
 .from(TABLE_NAME)
 .update({

    parent_id:
      input.parentId ?? null,

    code:
      input.code,

    name:
      input.name,

    description:
      input.description ?? null,

    image_url:
      input.imageUrl ?? null,

    sort:
      input.sort,

    enabled:
      input.enabled,

 })
 .eq(
   'id',
   input.id,
 )
 .select()
 .single()



 if(error){

  return {

   success:false,

   message:
    '更新分類失敗',

   error:
    error.message,

  }

 }



 return {

  success:true,

  category:
    mapCategory(data),

  message:
    '更新分類成功',

 }

}





/**
 * 刪除分類
 */
export async function deleteMallCategory(
 id:string,
){

 const {
   error,
 } =
 await supabase
 .from(TABLE_NAME)
 .delete()
 .eq(
  'id',
  id,
 )


 if(error){

  return {

   success:false,

   message:
    '刪除失敗',

   error:
    error.message,

  }

 }



 return {

  success:true,

  message:
    '刪除成功',

 }

}





/**
 * 啟用 / 停用
 */
export async function toggleMallCategoryStatus(
 id:string,
 enabled:boolean,
){

 const {
   error,
 } =
 await supabase
 .from(TABLE_NAME)
 .update({
    enabled,
 })
 .eq(
   'id',
   id,
 )



 if(error){

  return {

   success:false,

   message:
    '狀態更新失敗',

   error:
    error.message,

  }

 }



 return {

  success:true,

  message:
    '狀態更新成功',

 }

}