<script setup lang="ts">

import {
  RouterView,
} from 'vue-router'


</script>


<template>

<div class="admin-layout">


  <aside class="sidebar">


    <h2>
      ALADDIN
    </h2>


    <nav>


      <router-link to="/dealer">
        經銷商管理
      </router-link>


      <router-link to="/dealer/region-assignment">
        區域指派管理
      </router-link>


      <router-link to="/mall">
        商城管理
      </router-link>


    </nav>


  </aside>



  <main class="content">

    <RouterView />

  </main>


</div>


</template>



<style scoped>

.admin-layout{

 display:flex;

 min-height:100vh;

}


.sidebar{

 width:240px;

 background:#111827;

 color:white;

 padding:24px;

}


.sidebar a{

 display:block;

 color:white;

 padding:12px 0;

 text-decoration:none;

}


.content{

 flex:1;

 padding:30px;

}


</style>