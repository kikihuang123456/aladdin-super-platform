<template>
  <AdminLayout>

    <div class="detail-page">


      <section class="page-header">

        <div>

          <p class="eyebrow">
            MALL MANAGEMENT
          </p>

          <h1>
            商品詳情
          </h1>

          <p class="description">
            查看商城商品完整資料。
          </p>

        </div>


        <div class="actions">

          <button
            class="secondary-button"
            type="button"
            @click="handleBack"
          >
            返回列表
          </button>


          <button
            class="primary-button"
            type="button"
            @click="handleEdit"
          >
            編輯商品
          </button>

        </div>

      </section>



      <section
        v-if="store.isLoading"
        class="card"
      >
        載入商品資料中...
      </section>



      <section
        v-else-if="store.error"
        class="error"
      >
        {{ store.error }}
      </section>



      <template
        v-else-if="product"
      >


        <section class="card">

          <h2>
            基本資料
          </h2>


          <div class="grid">


            <div>
              <label>
                商品編號
              </label>

              <p>
                {{ product.productCode }}
              </p>
            </div>


            <div>
              <label>
                商品名稱
              </label>

              <p>
                {{ product.name }}
              </p>
            </div>


            <div>
              <label>
                商品分類
              </label>

              <p>
                {{ product.categoryName || '-' }}
              </p>
            </div>


            <div>
              <label>
                品牌
              </label>

              <p>
                {{ product.brandName || '-' }}
              </p>
            </div>


          </div>

        </section>




        <section class="card">

          <h2>
            價格資訊
          </h2>


          <div class="grid">


            <div>
              <label>
                商品價格
              </label>

              <p>
                {{ product.price }}
              </p>

            </div>


            <div>
              <label>
                台幣價格
              </label>

              <p>
                {{ product.priceTwd ?? '-' }}
              </p>

            </div>


            <div>
              <label>
                人民幣價格
              </label>

              <p>
                {{ product.priceCny ?? '-' }}
              </p>

            </div>


            <div>
              <label>
                幣別
              </label>

              <p>
                {{ product.currency || '-' }}
              </p>

            </div>


          </div>

        </section>




        <section class="card">

          <h2>
            庫存與狀態
          </h2>


          <div class="grid">


            <div>
              <label>
                庫存
              </label>

              <p>
                {{ product.stock }}
              </p>

            </div>


            <div>
              <label>
                安全庫存
              </label>

              <p>
                {{ product.safetyStock ?? 0 }}
              </p>

            </div>



            <div>
              <label>
                銷量
              </label>

              <p>
                {{ product.sales ?? 0 }}
              </p>

            </div>



            <div>

              <label>
                狀態
              </label>


              <span
                class="status"
              >
                {{ product.status }}
              </span>


            </div>


          </div>

        </section>




      </template>


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


import AdminLayout
from '../../layouts/AdminLayout.vue'


import {
  useMallStore,
} from '../../stores/mall'



const route =
  useRoute()


const router =
  useRouter()



const store =
  useMallStore()



const productId =
  computed(() =>
    String(
      route.params.id ?? '',
    ),
  )



const product =
  computed(() =>
    store.currentProduct,
  )




onMounted(
  async()=>{

    if(
      productId.value
    ){

      await store.fetchProductById(
        productId.value,
      )

    }

  },
)




function handleBack():
void {

  router.push('/mall')

}




function handleEdit():
void {

  router.push(
    `/mall/${productId.value}/edit`,
  )

}


</script>



<style scoped>

.detail-page{

display:flex;

flex-direction:column;

gap:24px;

}



.page-header{

display:flex;

justify-content:space-between;

align-items:center;

}



.eyebrow{

color:#3157d6;

font-size:13px;

font-weight:800;

}



.description{

color:#64748b;

}



.actions{

display:flex;

gap:12px;

}



.primary-button,
.secondary-button{

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



.secondary-button{

background:white;

border:1px solid #ddd;

}



.card{

background:white;

border:1px solid #e5e7eb;

border-radius:18px;

padding:24px;

}



.card h2{

margin-bottom:20px;

}



.grid{

display:grid;

grid-template-columns:
repeat(4,1fr);

gap:20px;

}



.grid label{

display:block;

color:#64748b;

font-size:13px;

}



.grid p{

font-size:16px;

font-weight:700;

}



.status{

display:inline-block;

padding:6px 12px;

border-radius:20px;

background:#dbeafe;

color:#1d4ed8;

}



.error{

padding:20px;

background:#fee2e2;

color:#b91c1c;

border-radius:12px;

}



@media(max-width:900px){

.grid{

grid-template-columns:
repeat(2,1fr);

}

}

</style>