<script setup lang="ts">

import type {
  Dealer,
} from '../../types/dealer'


interface Props {
  dealer: Dealer
}


const props =
  defineProps<Props>()



function marketText(
  value: Dealer['market'],
): string {

  switch (value) {

    case 'taiwan':
      return '台灣市場'

    case 'china':
      return '中國市場'

    case 'cross_border':
      return '跨境市場'

    default:
      return value

  }

}

</script>


<template>

  <section
    class="region-card"
  >

    <div
      class="section-header"
    >

      <div>

        <h2>
          區域代理資訊
        </h2>

        <p>
          經銷商市場與區域配置
        </p>

      </div>

    </div>


    <div
      class="region-grid"
    >

      <div
        class="region-item"
      >

        <span>
          市場
        </span>

        <strong>
          {{
            marketText(
              dealer.market,
            )
          }}
        </strong>

      </div>



      <div
        class="region-item"
      >

        <span>
          所屬區域
        </span>

        <strong>
          {{
            dealer.regionName ||
            '尚未分配'
          }}
        </strong>

      </div>



      <div
        class="region-item"
      >

        <span>
          Region ID
        </span>

        <strong>
          {{
            dealer.regionId ||
            '-'
          }}
        </strong>

      </div>


    </div>


  </section>

</template>


<style scoped>

.region-card {

  padding:24px;

  border:
    1px solid #e5e7eb;

  border-radius:18px;

  background:#ffffff;

  box-shadow:
    0 10px 25px
    rgba(15,23,42,0.05);

}



.section-header {

  margin-bottom:20px;

}



.section-header h2 {

  margin:0;

  color:#0f172a;

  font-size:20px;

}



.section-header p {

  margin:6px 0 0;

  color:#64748b;

  font-size:13px;

}



.region-grid {

  display:grid;

  grid-template-columns:
    repeat(3,minmax(0,1fr));

  gap:16px;

}



.region-item {

  padding:18px;

  border-radius:14px;

  background:#f8fafc;

}



.region-item span {

  display:block;

  margin-bottom:10px;

  color:#64748b;

  font-size:13px;

  font-weight:700;

}



.region-item strong {

  color:#0f172a;

}



@media(max-width:900px){

.region-grid{

grid-template-columns:1fr;

}

}

</style>