<script setup lang="ts">

import type {
  Dealer,
} from '../../types/dealer'


interface Props {
  dealer: Dealer
}


const props =
  defineProps<Props>()



function formatNumber(
  value: number,
): string {

  return new Intl.NumberFormat(
    'zh-TW',
  ).format(
    value || 0,
  )

}



function formatMoney(
  value: number,
): string {

  return new Intl.NumberFormat(
    'zh-TW',
    {
      style: 'currency',
      currency: 'TWD',
      maximumFractionDigits: 0,
    },
  ).format(
    value || 0,
  )

}

</script>


<template>

  <section
    class="statistics-card"
  >

    <div
      class="section-title"
    >

      <h2>
        經銷商營運數據
      </h2>

      <p>
        團隊發展、業績與收益統計
      </p>

    </div>


    <div
      class="statistics-grid"
    >

      <article
        class="stat-item"
      >

        <span>
          直推會員
        </span>

        <strong>
          {{
            formatNumber(
              dealer.directCount,
            )
          }}
        </strong>

      </article>



      <article
        class="stat-item"
      >

        <span>
          團隊總人數
        </span>

        <strong>
          {{
            formatNumber(
              dealer.teamCount,
            )
          }}
        </strong>

      </article>



      <article
        class="stat-item"
      >

        <span>
          團隊業績
        </span>

        <strong
          class="money"
        >
          {{
            formatMoney(
              dealer.teamSales,
            )
          }}
        </strong>

      </article>



      <article
        class="stat-item"
      >

        <span>
          累計佣金
        </span>

        <strong
          class="money success"
        >
          {{
            formatMoney(
              dealer.totalCommission,
            )
          }}
        </strong>

      </article>


    </div>

  </section>

</template>


<style scoped>

.statistics-card {

  padding:24px;

  border:
    1px solid #e5e7eb;

  border-radius:18px;

  background:#ffffff;

  box-shadow:
    0 10px 25px
    rgba(15,23,42,0.05);

}



.section-title {

  margin-bottom:20px;

}



.section-title h2 {

  margin:0;

  color:#0f172a;

  font-size:20px;

}



.section-title p {

  margin:6px 0 0;

  color:#64748b;

  font-size:13px;

}



.statistics-grid {

  display:grid;

  grid-template-columns:
    repeat(4,minmax(0,1fr));

  gap:16px;

}



.stat-item {

  padding:20px;

  border-radius:14px;

  background:#f8fafc;

}



.stat-item span {

  display:block;

  margin-bottom:12px;

  color:#64748b;

  font-size:13px;

  font-weight:700;

}



.stat-item strong {

  color:#0f172a;

  font-size:28px;

}



.stat-item .money {

  font-size:20px;

}



.stat-item .success {

  color:#15803d;

}



@media(max-width:1200px){

.statistics-grid{

grid-template-columns:
repeat(2,minmax(0,1fr));

}

}



@media(max-width:700px){

.statistics-grid{

grid-template-columns:1fr;

}

}

</style>