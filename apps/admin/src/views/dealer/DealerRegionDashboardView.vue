<script setup lang="ts">

import {
  computed,
  onMounted,
} from 'vue'


import {
  useDealerRegionDashboardStore,
} from '../../stores/dealer-region-dashboard'


import type {
  DealerRegionRankingItem,
  DealerRegionStatisticsItem,
} from '../../types/dealer-region'



const dashboardStore =
  useDealerRegionDashboardStore()



const dashboard =
computed(
  () =>
    dashboardStore.dashboard
)



const totalRegions =
computed(
  () =>
    dashboard.value?.totalRegions ?? 0
)



const activeRegions =
computed(
  () =>
    dashboard.value?.activeRegions ?? 0
)



const taiwanRegions =
computed(
  () =>
    dashboard.value?.taiwanRegions ?? 0
)



const chinaRegions =
computed(
  () =>
    dashboard.value?.chinaRegions ?? 0
)



const ranking =
computed<DealerRegionRankingItem[]>(
  () =>
    dashboard.value?.ranking ?? []
)



const regionStatistics =
computed<DealerRegionStatisticsItem[]>(
  () =>
    dashboard.value?.regionStatistics ?? []
)



onMounted(
  async()=>{

    await dashboardStore.fetchDashboard()

  }
)



</script>



<template>


<div
class="dashboard"
>



<h1>
經銷商區域營運 Dashboard
</h1>


<p>
Dealer ERP M05-05 Region Dashboard
</p>




<div
v-if="dashboardStore.loading"
>

載入 Dashboard 中...

</div>



<div
v-else-if="dashboardStore.error"
>

{{ dashboardStore.error }}

</div>




<div
v-else
>



<!-- KPI -->

<div class="cards">


<div class="card">

<h3>
區域總數
</h3>

<strong>
{{ totalRegions }}
</strong>

</div>



<div class="card">

<h3>
啟用區域
</h3>

<strong>
{{ activeRegions }}
</strong>

</div>



<div class="card">

<h3>
台灣市場
</h3>

<strong>
{{ taiwanRegions }}
</strong>

</div>



<div class="card">

<h3>
中國市場
</h3>

<strong>
{{ chinaRegions }}
</strong>

</div>



</div>





<!-- Ranking -->

<div class="panel">


<h2>
🏆 經銷商區域排名 TOP 10
</h2>



<div
v-for="(item,index) in ranking"
:key="item.id"
class="ranking-item"
>


<strong>
{{ index + 1 }}
</strong>


<span>
{{ item.name }}
</span>


<b>
{{ item.dealerCount }}
位
</b>


</div>



</div>





<!-- Statistics -->


<div class="panel">


<h2>
📊 區域統計
</h2>



<table>


<thead>

<tr>

<th>
區域
</th>

<th>
市場
</th>

<th>
經銷商數
</th>

</tr>

</thead>



<tbody>


<tr
v-for="item in regionStatistics"
:key="item.id"
>


<td>
{{ item.name }}
</td>


<td>
{{ item.market }}
</td>


<td>
{{ item.dealerCount }}
</td>


</tr>



</tbody>


</table>



</div>




</div>



</div>


</template>




<style scoped>


.dashboard{

padding:30px;

}



.cards{

display:grid;

grid-template-columns:
repeat(4,1fr);

gap:20px;

margin-top:25px;

}



.card{

background:white;

padding:25px;

border-radius:16px;

box-shadow:
0 4px 12px rgba(0,0,0,.08);

}



.card strong{

font-size:36px;

}



.panel{

background:white;

padding:25px;

border-radius:16px;

margin-top:25px;

}



.ranking-item{

display:flex;

justify-content:space-between;

padding:14px 0;

border-bottom:1px solid #eee;

}



table{

width:100%;

border-collapse:collapse;

}



th,
td{

padding:12px;

border-bottom:1px solid #eee;

text-align:left;

}


</style>