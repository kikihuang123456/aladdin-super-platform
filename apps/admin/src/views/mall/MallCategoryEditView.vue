<template>

  <AdminLayout>

    <div class="page">


      <section class="header">

        <p class="eyebrow">
          MALL CATEGORY
        </p>


        <h1>
          編輯商品分類
        </h1>


        <p>
          修改商城商品分類資料。
        </p>


      </section>




      <section class="card">


        <div
          v-if="loading"
          class="loading"
        >
          正在讀取分類資料...
        </div>



        <MallCategoryForm

          v-else-if="category"

          :model-value="category"

          :loading="
            mallCategoryStore.isMutating
          "

          submit-text="保存修改"


          @submit="handleSubmit"


          @cancel="handleCancel"


        />



      </section>


    </div>


  </AdminLayout>


</template>




<script setup lang="ts">


import {
  computed,
  onMounted,
} from 'vue'


import {
  useRoute,
  useRouter,
} from 'vue-router'


import AdminLayout from '../../layouts/AdminLayout.vue'


import MallCategoryForm from '../../components/mall/MallCategoryForm.vue'


import {
  useMallCategoryStore,
} from '../../stores/mall-category'


import type {
  CreateMallCategoryInput,
} from '../../types/mall-category'



const route =
  useRoute()


const router =
  useRouter()



const mallCategoryStore =
  useMallCategoryStore()



const loading =
  computed(
    () =>
      mallCategoryStore.isLoading,
  )



const category =
  computed(
    () =>
      mallCategoryStore.currentCategory,
  )



const categoryId =
  String(
    route.params.id,
  )





onMounted(
  async () => {

    await mallCategoryStore
      .fetchCategoryById(
        categoryId,
      )

  },
)






async function handleSubmit(
  form:CreateMallCategoryInput,
){


  const result =
    await mallCategoryStore.updateCategory(
      {
        id:
          categoryId,

        ...form,

      },
    )



  if(result){

    router.push(
      '/mall/category',
    )

  }


}





function handleCancel(){

  router.push(
    '/mall/category',
  )

}



</script>




<style scoped>


.page{

display:flex;

flex-direction:column;

gap:24px;

}



.header{

padding:24px;

background:white;

border-radius:16px;

}



.eyebrow{

color:#3157d6;

font-weight:800;

font-size:13px;

}



h1{

margin:8px 0;

font-size:32px;

}



.card{

padding:24px;

background:white;

border-radius:16px;

border:1px solid #e5e7eb;

}



.loading{

padding:50px;

text-align:center;

color:#64748b;

}


</style>