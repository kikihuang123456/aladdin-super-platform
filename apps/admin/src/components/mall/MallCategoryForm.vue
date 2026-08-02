<template>

  <form
    class="category-form"
    @submit.prevent="submit"
  >


    <div class="form-grid">


      <div class="form-item">

        <label>
          分類名稱
        </label>

        <input
          v-model="form.name"
          type="text"
          placeholder="輸入分類名稱"
        />

      </div>



      <div class="form-item">

        <label>
          分類代碼
        </label>


        <input
          v-model="form.code"
          type="text"
          placeholder="例如 BEAUTY"
        />


      </div>




      <div class="form-item">

        <label>
          排序
        </label>


        <input
          v-model.number="form.sort"
          type="number"
          min="0"
        />


      </div>




      <div class="form-item">

        <label>
          狀態
        </label>


        <select
          v-model="form.enabled"
        >

          <option :value="true">
            啟用
          </option>

          <option :value="false">
            停用
          </option>


        </select>


      </div>


    </div>




    <div
      v-if="error"
      class="error"
    >

      {{ error }}

    </div>




    <div class="actions">


      <button
        type="button"
        class="cancel"
        @click="cancel"
      >
        取消
      </button>



      <button
        type="submit"
        class="submit"
        :disabled="loading"
      >

        {{
          loading
            ? '處理中...'
            : submitText
        }}

      </button>


    </div>


  </form>

</template>



<script setup lang="ts">


import {
  reactive,
  ref,
  watch,
} from 'vue'


import type {
  CreateMallCategoryInput,
  MallCategory,
} from '../../types/mall-category'



const props =
defineProps<{

  modelValue?: Partial<MallCategory>

  loading?: boolean

  submitText?: string

}>()

const error =
  ref<string | null>(null)

const emit =
defineEmits<{

  (
    event:'submit',
    value:CreateMallCategoryInput,
  ):void


  (
    event:'cancel',
  ):void

}>()



const form =
reactive({

  name:'',

  code:'',

  sort:0,

  enabled:true,

})




watch(

  () =>
    props.modelValue,


  value => {

    if(!value){

      return

    }


    form.name =
      value.name ?? ''


    form.code =
      value.code ?? ''


    form.sort =
      value.sort ?? 0


    form.enabled =
      value.enabled ?? true

  },


  {
    immediate:true,
  }

)





function submit(){

  error.value = null


  if(
    !form.name.trim()
  ){

    error.value =
      '請輸入分類名稱'

    return

  }


  if(
    !form.code.trim()
  ){

    error.value =
      '請輸入分類代碼'

    return

  }



  emit(
    'submit',
    {

      name:
        form.name.trim(),

      code:
        form.code.trim(),

      sort:
        form.sort,

      enabled:
        form.enabled,

    },
  )


}




function cancel(){

  emit(
    'cancel',
  )

}



</script>



<style scoped>

.category-form{

display:flex;

flex-direction:column;

gap:30px;

}



.form-grid{

display:grid;

grid-template-columns:
repeat(2,1fr);

gap:24px;

}



.form-item{

display:flex;

flex-direction:column;

gap:8px;

}



label{

font-weight:700;

color:#334155;

}



input,
select{

height:42px;

border:

1px solid #dbe2ea;

border-radius:10px;

padding:0 12px;

}



.actions{

display:flex;

justify-content:flex-end;

gap:12px;

}



.submit,
.cancel{

height:42px;

padding:0 22px;

border-radius:10px;

cursor:pointer;

font-weight:700;

}



.submit{

border:none;

background:#3157d6;

color:white;

}



.cancel{

background:white;

border:1px solid #ddd;

}



.error{

padding:12px;

border-radius:10px;

background:#fef2f2;

color:#b91c1c;

}


</style>