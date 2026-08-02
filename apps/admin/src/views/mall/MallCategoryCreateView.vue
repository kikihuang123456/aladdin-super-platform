<template>

  <AdminLayout>

    <div class="page">


      <section class="header">

        <div>

          <p class="eyebrow">
            MALL CATEGORY
          </p>


          <h1>
            新增商品分類
          </h1>


          <p>
            建立商城商品分類資料。
          </p>


        </div>


      </section>




      <section class="card">


        <MallCategoryForm

          :loading="mallCategoryStore.isMutating"

          submit-text="建立分類"

          @submit="handleSubmit"

          @cancel="handleCancel"

        />


      </section>


    </div>


  </AdminLayout>

</template>




<script setup lang="ts">


import {
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



const router =
  useRouter()



const mallCategoryStore =
  useMallCategoryStore()





async function handleSubmit(
  form:CreateMallCategoryInput,
){


  const result =
    await mallCategoryStore.createCategory(
      form,
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

font-size:13px;

font-weight:800;

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


</style>