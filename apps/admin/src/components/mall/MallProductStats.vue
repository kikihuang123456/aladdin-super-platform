<template>
  <section class="stats-grid">

    <article class="stats-card">
      <div class="stats-card__header">
        <span>
          商品總數
        </span>

        <span class="stats-icon">
          全
        </span>
      </div>

      <strong>
        {{
          statistics.total
            .toLocaleString()
        }}
      </strong>

      <small>
        平台商品總數
      </small>
    </article>


    <article class="stats-card">
      <div class="stats-card__header">
        <span>
          已上架
        </span>

        <span
          class="
            stats-icon
            stats-icon--success
          "
        >
          上
        </span>
      </div>

      <strong>
        {{
          statistics.published
            .toLocaleString()
        }}
      </strong>

      <small>
        正在商城銷售
      </small>
    </article>


    <article class="stats-card">
      <div class="stats-card__header">
        <span>
          待審核
        </span>

        <span
          class="
            stats-icon
            stats-icon--warning
          "
        >
          審
        </span>
      </div>

      <strong>
        {{
          statistics.pending
            .toLocaleString()
        }}
      </strong>

      <small>
        等待管理員審核
      </small>
    </article>


    <article class="stats-card">
      <div class="stats-card__header">
        <span>
          庫存數量
        </span>

        <span
          class="
            stats-icon
            stats-icon--stock
          "
        >
          庫
        </span>
      </div>

      <strong>
        {{
          statistics.totalStock
            .toLocaleString()
        }}
      </strong>

      <small>
        商品庫存總量
      </small>
    </article>


    <article class="stats-card">
      <div class="stats-card__header">
        <span>
          商品銷量
        </span>

        <span
          class="
            stats-icon
            stats-icon--sales
          "
        >
          銷
        </span>
      </div>

      <strong>
        {{
          statistics.totalSales
            .toLocaleString()
        }}
      </strong>

      <small>
        累積銷售數量
      </small>
    </article>


  </section>
</template>


<script setup lang="ts">

import type {
  MallStatistics,
} from '../../types/mall'


interface Props {

  statistics:
    MallStatistics

}


defineProps<Props>()


</script>


<style scoped>

.stats-grid {

  display: grid;

  grid-template-columns:
    repeat(
      5,
      minmax(
        0,
        1fr
      )
    );

  gap: 18px;

}


.stats-card {

  min-height: 140px;

  padding:
    20px;

  border:
    1px solid #e5e7eb;

  border-radius:
    18px;

  background:
    #ffffff;

  box-shadow:
    0 10px 25px
    rgba(
      15,
      23,
      42,
      0.05
    );

}


.stats-card__header {

  display:
    flex;

  align-items:
    center;

  justify-content:
    space-between;

}


.stats-card__header span:first-child {

  color:
    #64748b;

  font-size:
    14px;

  font-weight:
    700;

}


.stats-icon {

  display:
    grid;

  width:
    34px;

  height:
    34px;

  place-items:
    center;

  border-radius:
    10px;

  background:
    #eef2ff;

  color:
    #3157d6;

  font-size:
    12px;

  font-weight:
    900;

}


.stats-icon--success {

  background:
    #dcfce7;

  color:
    #15803d;

}


.stats-icon--warning {

  background:
    #fef3c7;

  color:
    #b45309;

}


.stats-icon--stock {

  background:
    #dbeafe;

  color:
    #1d4ed8;

}


.stats-icon--sales {

  background:
    #fce7f3;

  color:
    #be185d;

}


.stats-card strong {

  display:
    block;

  margin-top:
    18px;

  color:
    #0f172a;

  font-size:
    30px;

  font-weight:
    900;

}


.stats-card small {

  display:
    block;

  margin-top:
    8px;

  color:
    #94a3b8;

  font-size:
    12px;

}


@media (max-width: 1280px) {

  .stats-grid {

    grid-template-columns:
      repeat(
        3,
        minmax(
          0,
          1fr
        )
      );

  }

}


@media (max-width: 768px) {

  .stats-grid {

    grid-template-columns:
      1fr;

  }

}

</style>