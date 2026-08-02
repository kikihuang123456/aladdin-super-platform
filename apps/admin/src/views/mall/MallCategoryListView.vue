<template>
  <AdminLayout>

    <div class="category-page">


      <section class="page-header">

        <div>

          <p class="page-eyebrow">
            MALL CATEGORY MANAGEMENT
          </p>

          <h1>
            商品分類管理
          </h1>

          <p class="page-description">
            管理商城商品分類、排序與啟用狀態。
          </p>

        </div>


        <button
          class="primary-button"
          type="button"
          @click="goCreate"
        >
          新增分類
        </button>


      </section>



      <section class="stats">


        <div class="stat-card">

          <span>
            分類總數
          </span>

          <strong>
            {{ statistics.total }}
          </strong>

        </div>


        <div class="stat-card">

          <span>
            啟用
          </span>

          <strong>
            {{ statistics.enabled }}
          </strong>

        </div>


        <div class="stat-card">

          <span>
            停用
          </span>

          <strong>
            {{ statistics.disabled }}
          </strong>

        </div>


        <div class="stat-card">

          <span>
            子分類
          </span>

          <strong>
            {{ statistics.childCategories }}
          </strong>

        </div>


      </section>




      <section class="card">


        <div class="toolbar">

          <input
            v-model="keyword"
            class="search"
            placeholder="搜尋分類名稱"
            @keyup.enter="search"
          />


          <button
            class="search-button"
            type="button"
            @click="search"
          >
            搜尋
          </button>


          <button
            class="refresh-button"
            type="button"
            @click="refresh"
          >
            重新整理
          </button>


        </div>




        <div
          v-if="error"
          class="error"
        >
          {{ error }}
        </div>



        <MallCategoryTable

          :categories="categories"

          @edit="goEdit"

          @toggle="toggleStatus"

          @delete="remove"

        />


      </section>



    </div>


  </AdminLayout>
</template>



<script setup lang="ts">


import {
  computed,
  onMounted,
  ref,
} from 'vue'


import {
  useRouter,
} from 'vue-router'


import AdminLayout
from '../../layouts/AdminLayout.vue'


import MallCategoryTable
from '../../components/mall/MallCategoryTable.vue'


import {
  useMallCategoryStore,
} from '../../stores/mall-category'


import type {
  MallCategory,
} from '../../types/mall-category'



const router =
  useRouter()



const store =
  useMallCategoryStore()



const keyword =
  ref('')



const categories =
  computed(() =>
    store.categories,
  )



const statistics =
  computed(() =>
    store.statistics,
  )



const error =
  computed(() =>
    store.error,
  )





onMounted(
  async()=>{

    await store.fetchCategories()

  },
)





async function refresh(){

  await store.fetchCategories()

}



async function search(){

  await store.searchCategories(
    keyword.value,
  )

}



function goCreate(){



}



function goEdit(
  id:string,
){

  router.push(
    `/mall/category/${id}/edit`,
  )

}




async function toggleStatus(
  category:MallCategory,
){

  await store.changeCategoryStatus(
    category.id,
    !category.enabled,
  )


  await store.fetchCategories()

}





async function remove(
  id:string,
){

  const result =
    window.confirm(
      '確認刪除此分類？',
    )


  if(!result){

    return

  }


  await store.removeCategory(
  id,
)

await store.fetchCategories()

}



</script>



<style scoped>

.category-page{

display:flex;

flex-direction:column;

gap:24px;

}



.page-header{

display:flex;

justify-content:space-between;

align-items:center;

}



.page-eyebrow{

color:#3157d6;

font-size:13px;

font-weight:800;

}



.page-header h1{

font-size:34px;

margin:8px 0;

}



.page-description{

color:#64748b;

}



.primary-button,
.search-button,
.refresh-button{

height:42px;

padding:0 18px;

border-radius:10px;

cursor:pointer;

font-weight:700;

}



.primary-button{

background:#3157d6;

color:white;

border:none;

}



.stats{

display:grid;

grid-template-columns:
repeat(4,1fr);

gap:18px;

}



.stat-card{

background:white;

padding:22px;

border-radius:18px;

border:1px solid #e5e7eb;

}



.stat-card span{

color:#64748b;

}



.stat-card strong{

display:block;

margin-top:12px;

font-size:32px;

}



.card{

background:white;

border-radius:18px;

border:1px solid #e5e7eb;

overflow:hidden;

}



.toolbar{

padding:20px;

display:flex;

gap:12px;

}



.search{

width:320px;

height:42px;

border:

1px solid #dbe2ea;

border-radius:10px;

padding:0 12px;

}



.search-button{

border:none;

background:#3157d6;

color:white;

}



.refresh-button{

border:1px solid #ddd;

background:white;

}



.error{

padding:15px;

margin:20px;

background:#fee2e2;

color:#b91c1c;

border-radius:10px;

}


</style>