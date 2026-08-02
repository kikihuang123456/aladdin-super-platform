<template>

  <div class="table-wrapper">


    <table>

      <thead>

        <tr>

          <th>
            分類名稱
          </th>

          <th>
            分類代碼
          </th>

          <th>
            父分類
          </th>

          <th>
            排序
          </th>

          <th>
            狀態
          </th>

          <th>
            建立時間
          </th>

          <th>
            操作
          </th>


        </tr>

      </thead>



      <tbody>


        <tr
          v-for="category in categories"
          :key="category.id"
        >


          <td>

            <strong>
              {{ category.name }}
            </strong>

          </td>



          <td>

            {{ category.code }}

          </td>



          <td>

  {{
    category.parentId
      ? '子分類'
      : '頂級分類'
  }}

</td>



          <td>

            {{ category.sort }}

          </td>



          <td>


            <span
              class="status"
              :class="{
                active:
                  category.enabled,
                disabled:
                  !category.enabled,
              }"
            >

              {{
                category.enabled
                  ? '啟用'
                  : '停用'
              }}

            </span>


          </td>




          <td>

            {{
              formatDate(
                category.createdAt,
              )
            }}

          </td>




          <td>


            <div class="actions">


              <button
                class="edit"
                type="button"
                @click="
                  emit(
                    'edit',
                    category.id,
                  )
                "
              >

                編輯

              </button>



              <button
                class="toggle"
                type="button"
                @click="
                  emit(
                    'toggle',
                    category,
                  )
                "
              >

                {{
                  category.enabled
                    ? '停用'
                    : '啟用'
                }}

              </button>




              <button
                class="delete"
                type="button"
                @click="
                  emit(
                    'delete',
                    category.id,
                  )
                "
              >

                刪除

              </button>


            </div>


          </td>



        </tr>



        <tr
          v-if="categories.length === 0"
        >

          <td
            colspan="7"
            class="empty"
          >

            暫無分類資料

          </td>

        </tr>



      </tbody>


    </table>


  </div>


</template>




<script setup lang="ts">


import type {
  MallCategory,
} from '../../types/mall-category'



defineProps<{

  categories:
    MallCategory[]

}>()



const emit =
defineEmits<{

  (
    event:'edit',
    id:string,
  ):void


  (
    event:'toggle',
    category:MallCategory,
  ):void


  (
    event:'delete',
    id:string,
  ):void


}>()



function formatDate(
  value?:string,
){

  if(!value){

    return '-'

  }


  return new Date(
    value,
  ).toLocaleDateString(
    'zh-TW',
  )

}



</script>




<style scoped>


.table-wrapper{

overflow-x:auto;

}



table{

width:100%;

border-collapse:collapse;

}



th,
td{

padding:16px 20px;

border-bottom:

1px solid #eef2f7;

text-align:left;

white-space:nowrap;

}



th{

background:#f8fafc;

color:#64748b;

font-size:13px;

}



td{

color:#334155;

}



.status{

display:inline-flex;

padding:5px 12px;

border-radius:999px;

font-size:12px;

font-weight:700;

}



.status.active{

background:#dcfce7;

color:#15803d;

}



.status.disabled{

background:#e2e8f0;

color:#475569;

}



.actions{

display:flex;

gap:8px;

}



.actions button{

height:34px;

padding:0 12px;

border-radius:8px;

cursor:pointer;

font-weight:700;

}



.edit{

border:none;

background:#eef2ff;

color:#3157d6;

}



.toggle{

border:none;

background:#fef3c7;

color:#b45309;

}



.delete{

border:none;

background:#fee2e2;

color:#b91c1c;

}



.empty{

padding:50px;

text-align:center;

color:#94a3b8;

}



</style>