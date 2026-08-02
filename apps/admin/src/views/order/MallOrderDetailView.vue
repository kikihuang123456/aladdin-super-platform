<template>
  <AdminLayout>

    <div class="detail-page">


      <section class="page-header">

        <div>

          <p class="page-eyebrow">
            MALL ORDER ERP
          </p>


          <h1>
            訂單詳情
          </h1>


          <p class="page-description">
            查看訂單交易、付款、配送與商品明細。
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
            class="success-button"
            type="button"
            :disabled="store.isMutating"
            @click="handleComplete"
          >
            完成訂單
          </button>


          <button
            class="danger-button"
            type="button"
            :disabled="store.isMutating"
            @click="handleCancel"
          >
            取消訂單
          </button>


        </div>


      </section>




      <section
        v-if="store.isLoading"
        class="card"
      >

        正在載入訂單資料...

      </section>



      <section
        v-else-if="store.error"
        class="error"
      >

        {{ store.error }}

      </section>





      <template v-else-if="order">


        <section class="card">

          <h2>
            訂單資訊
          </h2>


          <div class="grid">


            <div>
              <label>
                訂單編號
              </label>

              <p>
                {{ order.orderNo }}
              </p>
            </div>



            <div>
              <label>
                會員
              </label>

              <p>
                {{ order.memberName || '-' }}
              </p>
            </div>



            <div>
              <label>
                訂單狀態
              </label>

              <p>
                {{ order.orderStatus }}
              </p>
            </div>



            <div>
              <label>
                建立時間
              </label>

              <p>
                {{ formatDate(order.createdAt) }}
              </p>
            </div>


          </div>


        </section>





        <section class="card">


          <h2>
            商品明細
          </h2>



          <table>


            <thead>

              <tr>

                <th>
                  商品
                </th>

                <th>
                  數量
                </th>

                <th>
                  單價
                </th>

                <th>
                  小計
                </th>

              </tr>

            </thead>



            <tbody>


              <tr
                v-for="item in order.items"
                :key="item.id"
              >


                <td>

                  {{ item.productName }}

                </td>


                <td>

                  {{ item.quantity }}

                </td>


                <td>

                  {{ item.price }}

                </td>


                <td>

                  {{ item.subtotal }}

                </td>


              </tr>


            </tbody>


          </table>


        </section>





        <section class="card">


          <h2>
            金額資訊
          </h2>



          <div class="grid">


            <div>

              <label>
                商品金額
              </label>

              <p>
                {{ order.totalAmount }}
              </p>

            </div>



            <div>

              <label>
                折扣
              </label>

              <p>
                {{ order.discountAmount ?? 0 }}
              </p>

            </div>



            <div>

              <label>
                運費
              </label>

              <p>
                {{ order.shippingFee ?? 0 }}
              </p>

            </div>



            <div>

              <label>
                應付金額
              </label>

              <p>
                {{ order.payableAmount }}
              </p>

            </div>


          </div>


        </section>





        <section class="card">


          <h2>
            配送資訊
          </h2>



          <div
            v-if="order.shippingAddress"
            class="address"
          >

            <p>
              收件人：
              {{ order.shippingAddress.receiverName }}
            </p>


            <p>
              電話：
              {{ order.shippingAddress.receiverPhone }}
            </p>


            <p>
              地址：
              {{ order.shippingAddress.address }}
            </p>


          </div>


          <p v-else>
            尚無配送資訊
          </p>


        </section>




        <section class="card">


          <h2>
            支付資訊
          </h2>


          <div class="grid">


            <div>

              <label>
                支付方式
              </label>

              <p>
                {{ order.paymentMethod || '-' }}
              </p>

            </div>



            <div>

              <label>
                支付狀態
              </label>

              <p>
                {{ order.paymentStatus }}
              </p>

            </div>



            <div>

              <label>
                物流單號
              </label>

              <p>
                {{ order.trackingNo || '-' }}
              </p>

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
  useMallOrderStore,
} from '../../stores/mall-order'



const route =
  useRoute()


const router =
  useRouter()



const store =
  useMallOrderStore()



const orderId =
  computed(() =>
    String(
      route.params.id ?? '',
    ),
  )



const order =
  computed(() =>
    store.currentOrder,
  )





onMounted(
  async()=>{

    await store.fetchOrderById(
      orderId.value,
    )

  },
)





async function handleComplete(){

  await store.completeOrder(
    orderId.value,
  )

}





async function handleCancel(){

  await store.cancelOrder(
    orderId.value,
  )

}



function handleBack():
  void {
  router.push('/order')
}





function formatDate(
  value:string,
){

  return value
    ? new Date(value)
      .toLocaleString()
    : '-'

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

align-items:flex-start;

gap:20px;

}



.page-eyebrow{

color:#3157d6;

font-size:13px;

font-weight:800;

}



.page-description{

color:#64748b;

}



.actions{

display:flex;

gap:10px;

}



.card{

background:white;

border:1px solid #e5e7eb;

border-radius:18px;

padding:24px;

}



.grid{

display:grid;

grid-template-columns:
repeat(4,1fr);

gap:20px;

}



label{

color:#64748b;

font-size:13px;

}



p{

font-weight:700;

}



table{

width:100%;

border-collapse:collapse;

}



th,
td{

padding:14px;

border-bottom:1px solid #eee;

text-align:left;

}



.primary-button,
.secondary-button,
.success-button,
.danger-button{

height:42px;

padding:0 18px;

border-radius:10px;

cursor:pointer;

font-weight:700;

}



.secondary-button{

background:white;

border:1px solid #ddd;

}



.success-button{

background:#16a34a;

border:none;

color:white;

}



.danger-button{

background:#dc2626;

border:none;

color:white;

}



.error{

padding:20px;

border-radius:12px;

background:#fee2e2;

color:#b91c1c;

}



@media(max-width:900px){

.grid{

grid-template-columns:repeat(2,1fr);

}

}

</style>