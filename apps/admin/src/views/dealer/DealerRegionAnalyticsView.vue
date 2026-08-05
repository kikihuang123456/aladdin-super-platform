<script setup lang="ts">

import {
  computed,
  onMounted,
} from 'vue'


import {
  useDealerRegionAnalyticsStore,
} from '../../stores/dealer-region-analytics'



const analyticsStore =
  useDealerRegionAnalyticsStore()



const analytics =
computed(
  () =>
    analyticsStore.analytics
)



const ranking =
computed(
  () =>
    analytics.value?.ranking ?? []
)



const marketStatistics =
computed(
  () =>
    analytics.value?.marketStatistics ?? []
)



const dealerDensity =
computed(
  () =>
    analytics.value?.dealerDensity ?? []
)



onMounted(
  async()=>{

    await analyticsStore.fetchAnalytics()

  }
)



</script>


<template>


<div
class="analytics-page"
>


<h1>
經銷商區域營運分析
</h1>


<p>
Dealer ERP M05-06 Region Analytics
</p>



<div
v-if="analyticsStore.loading"
>

分析資料載入中...

</div>



<div
v-else-if="analyticsStore.error"
>

{{ analyticsStore.error }}

</div>



<div
v-else
>


<!-- 區域排行 -->

<div
class="panel"
>


<h2>
🏆 區域業績排行
</h2>


<div
v-for="(item,index) in ranking"
:key="item.id"
class="row"
>


<strong>
{{ Number(index) + 1 }}
</strong>


<span>
{{ item.name }}
</span>


<b>
{{ item.dealerCount }} 家經銷商
</b>


</div>


</div>




<!-- 市場分析 -->

<div
class="panel"
>


<h2>
🌏 市場分析
</h2>


<div
v-for="item in marketStatistics"
:key="item.market"
class="row"
>


<span>
{{ item.market }}
</span>


<b>
{{ item.regionCount }} 個區域
</b>


</div>


</div>




<!-- 經銷商密度 -->

<div
class="panel"
>


<h2>
📊 經銷商分布
</h2>


<div
v-for="item in dealerDensity"
:key="item.regionId"
class="row"
>


<span>
{{ item.regionName }}
</span>


<b>
{{ item.dealerCount }} 位
</b>


</div>


</div>



</div>


</div>


</template>



<style scoped>


.analytics-page{

padding:30px;

}


.panel{

background:white;

padding:25px;

margin-top:25px;

border-radius:16px;

}



.row{

display:flex;

justify-content:space-between;

padding:15px 0;

border-bottom:
1px solid #eee;

}



h1{

font-size:36px;

}


</style>