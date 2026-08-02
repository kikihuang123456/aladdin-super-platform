import {
  computed,
  ref,
} from 'vue'

import {
  defineStore,
} from 'pinia'


import {
  createMallCategory,
  deleteMallCategory,
  getAllEnabledMallCategories,
  getMallCategories,
  getMallCategoryById,
  updateMallCategory,
  updateMallCategoryStatus,
} from '../api/mall-category'


import type {
  CreateMallCategoryInput,
  MallCategory,
  MallCategoryFilters,
  MallCategoryPagination,
  MallCategoryStatistics,
  UpdateMallCategoryInput,
} from '../types/mall-category'



const DEFAULT_PAGE_SIZE = 20



function createEmptyStatistics():
MallCategoryStatistics {

  return {

    total:0,

    enabled:0,

    disabled:0,

    rootCategories:0,

    childCategories:0,

  }

}



function createEmptyPagination():
MallCategoryPagination {

  return {

    page:1,

    pageSize:DEFAULT_PAGE_SIZE,

    total:0,

    totalPages:0,

  }

}



function createDefaultFilters():
MallCategoryFilters {

  return {

    keyword:'',

    enabled:undefined,

    parentId:undefined,

    page:1,

    pageSize:DEFAULT_PAGE_SIZE,

    sortDirection:'asc',

  }

}



function normalizeError(
  error:unknown,
  fallback:string,
):string {

  return error instanceof Error
    ? error.message
    : fallback

}





export const useMallCategoryStore =
defineStore(
  'mall-category',
  () => {



    const categories =
      ref<MallCategory[]>([])



    const enabledCategories =
      ref<MallCategory[]>([])



    const currentCategory =
      ref<MallCategory | null>(null)



    const statistics =
      ref<MallCategoryStatistics>(
        createEmptyStatistics(),
      )



    const pagination =
      ref<MallCategoryPagination>(
        createEmptyPagination(),
      )



    const filters =
      ref<MallCategoryFilters>(
        createDefaultFilters(),
      )



    const isLoading =
      ref(false)



    const isMutating =
      ref(false)



    const error =
      ref<string | null>(null)



    const mutationMessage =
      ref<string | null>(null)





    const hasCategories =
      computed(
        () =>
          categories.value.length > 0,
      )



    const isEmpty =
      computed(
        () =>
          !isLoading.value &&
          categories.value.length === 0,
      )



    const hasPreviousPage =
      computed(
        () =>
          pagination.value.page > 1,
      )



    const hasNextPage =
      computed(
        () =>
          pagination.value.totalPages > 0 &&
          pagination.value.page <
          pagination.value.totalPages,
      )







    function replaceCategoryInList(
      category:MallCategory,
    ):void {


      const index =
        categories.value.findIndex(
          item =>
            item.id === category.id,
        )


      if(index < 0){

        categories.value.unshift(
          category,
        )

        return

      }


      categories.value[index] =
        category


    }









    async function fetchCategories():
    Promise<void> {


      if(isLoading.value){

        return

      }


      isLoading.value = true

      error.value = null



      try{


        const response =
          await getMallCategories({
            ...filters.value,
          })



        if(!response.success){

          throw new Error(
            response.error ||
            response.message ||
            '分類載入失敗',
          )

        }



        categories.value =
          response.categories



        statistics.value =
          response.statistics



        pagination.value =
          response.pagination



      }catch(errorValue){


        categories.value = []

        statistics.value =
          createEmptyStatistics()



        error.value =
          normalizeError(
            errorValue,
            '分類載入失敗',
          )


      }finally{


        isLoading.value = false

      }


    }







    async function fetchEnabledCategories():
    Promise<void>{


      try{


        enabledCategories.value =
          await getAllEnabledMallCategories()



      }catch(errorValue){


        error.value =
          normalizeError(
            errorValue,
            '啟用分類載入失敗',
          )


      }


    }







    async function fetchCategoryById(
      id:string,
    ):Promise<MallCategory | null>{


      if(!id){

        return null

      }


      isLoading.value = true

      error.value = null



      try{


        const response =
          await getMallCategoryById(
            id,
          )



        if(
          !response.success ||
          !response.category
        ){

          throw new Error(
            response.error ||
            response.message ||
            '分類不存在',
          )

        }



        currentCategory.value =
          response.category



        return response.category



      }catch(errorValue){


        currentCategory.value =
          null


        error.value =
          normalizeError(
            errorValue,
            '讀取分類失敗',
          )


        return null



      }finally{


        isLoading.value=false


      }


    }









    async function createCategory(
      input:CreateMallCategoryInput,
    ):Promise<MallCategory | null>{



      if(isMutating.value){

        return null

      }



      isMutating.value=true

      error.value=null



      try{


        const response =
          await createMallCategory(
            input,
          )



        if(
          !response.success ||
          !response.category
        ){

          throw new Error(
            response.error ||
            response.message ||
            '新增分類失敗',
          )

        }



        currentCategory.value =
          response.category



        replaceCategoryInList(
          response.category,
        )



        await fetchEnabledCategories()



        return response.category



      }catch(errorValue){


        error.value =
          normalizeError(
            errorValue,
            '新增分類失敗',
          )


        return null



      }finally{


        isMutating.value=false


      }


    }









    async function updateCategory(
      input:UpdateMallCategoryInput,
    ):Promise<MallCategory | null>{



      if(isMutating.value){

        return null

      }



      isMutating.value=true

      error.value=null



      try{


        const response =
          await updateMallCategory(
            input,
          )



        if(
          !response.success ||
          !response.category
        ){

          throw new Error(
            response.error ||
            response.message ||
            '更新分類失敗',
          )

        }



        currentCategory.value =
          response.category



        replaceCategoryInList(
          response.category,
        )



        await fetchEnabledCategories()



        return response.category



      }catch(errorValue){


        error.value =
          normalizeError(
            errorValue,
            '更新分類失敗',
          )


        return null



      }finally{


        isMutating.value=false


      }


    }









    async function changeCategoryStatus(
      id:string,
      enabled:boolean,
    ):Promise<boolean>{


      if(isMutating.value){

        return false

      }



      isMutating.value=true



      try{


        const response =
          await updateMallCategoryStatus(
            id,
            enabled,
          )



        if(
          !response.success ||
          !response.category
        ){

          throw new Error(
            response.error ||
            response.message ||
            '狀態更新失敗',
          )

        }



        replaceCategoryInList(
          response.category,
        )


        return true



      }catch(errorValue){


        error.value =
          normalizeError(
            errorValue,
            '狀態更新失敗',
          )


        return false



      }finally{


        isMutating.value=false


      }


    }









    async function removeCategory(
      id:string,
    ):Promise<boolean>{



      if(isMutating.value){

        return false

      }



      isMutating.value=true



      try{


        const response =
          await deleteMallCategory(
            id,
          )



        if(!response.success){

          throw new Error(
            response.error ||
            response.message ||
            '刪除失敗',
          )

        }



        categories.value =
          categories.value.filter(
            item =>
              item.id !== id,
          )



        if(
          currentCategory.value?.id === id
        ){

          currentCategory.value=null

        }



        return true



      }catch(errorValue){


        error.value =
          normalizeError(
            errorValue,
            '刪除失敗',
          )


        return false



      }finally{


        isMutating.value=false


      }


    }









    async function searchCategories(
      keyword:string,
    ){


      filters.value.keyword =
        keyword.trim()



      filters.value.page=1



      await fetchCategories()


    }






    async function setPage(
      page:number,
    ){


      filters.value.page =
        page


      await fetchCategories()


    }






    async function resetFilters(){


      filters.value =
        createDefaultFilters()



      await fetchCategories()


    }






    function clearCurrentCategory(){

      currentCategory.value=null

    }



    function clearError(){

      error.value=null

    }






    return {


      categories,

      enabledCategories,

      currentCategory,

      statistics,

      pagination,

      filters,


      isLoading,

      isMutating,

      error,

      mutationMessage,


      hasCategories,

      isEmpty,

      hasPreviousPage,

      hasNextPage,


      fetchCategories,

      fetchEnabledCategories,

      fetchCategoryById,


      createCategory,

      updateCategory,

      changeCategoryStatus,

      removeCategory,


      searchCategories,

      setPage,

      resetFilters,


      clearCurrentCategory,

      clearError,


    }


  },
)



export default useMallCategoryStore