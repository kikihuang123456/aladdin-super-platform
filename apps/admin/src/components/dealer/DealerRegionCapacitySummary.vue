<script setup lang="ts">

import {
  computed,
} from 'vue'


import type {
  PropType,
} from 'vue'


import type {
  DealerRegionCapacity,
} from '../../types/dealer-region-capacity'



const props =
defineProps({

  capacities: {

    type:
      Array as PropType<
        DealerRegionCapacity[]
      >,

    default:
      () => [],

  },

})



const totalRegions =
computed(
  () =>
    props.capacities.length,
)



const totalCapacity =
computed(
  () =>
    props.capacities.reduce(
      (
        total,
        item,
      ) =>
        total +
        item.maxDealers,
      0,
    ),
)



const totalUsed =
computed(
  () =>
    props.capacities.reduce(
      (
        total,
        item,
      ) =>
        total +
        item.currentDealers,
      0,
    ),
)



const totalRemaining =
computed(
  () =>
    props.capacities.reduce(
      (
        total,
        item,
      ) =>
        total +
        item.remainingCapacity,
      0,
    ),
)



const averageUsageRate =
computed(
  () => {

    if(
      totalCapacity.value <= 0
    ){

      return 0

    }


    return Number(
      (
        totalUsed.value /
        totalCapacity.value *
        100
      )
      .toFixed(2),
    )

  },
)



const fullRegions =
computed(
  () =>
    props.capacities.filter(
      item =>
        item.maxDealers > 0
        &&
        item.currentDealers >=
          item.maxDealers,
    ).length,
)

</script>


<template>

<div class="summary-grid">

  <div class="summary-card">

    <span class="label">
      區域總數
    </span>

    <strong>
      {{ totalRegions }}
    </strong>

    <small>
      個營運區域
    </small>

  </div>


  <div class="summary-card">

    <span class="label">
      總容量
    </span>

    <strong>
      {{ totalCapacity }}
    </strong>

    <small>
      位經銷商
    </small>

  </div>


  <div class="summary-card">

    <span class="label">
      已使用
    </span>

    <strong>
      {{ totalUsed }}
    </strong>

    <small>
      位經銷商
    </small>

  </div>


  <div class="summary-card">

    <span class="label">
      剩餘容量
    </span>

    <strong>
      {{ totalRemaining }}
    </strong>

    <small>
      個可用名額
    </small>

  </div>


  <div class="summary-card">

    <span class="label">
      平均使用率
    </span>

    <strong>
      {{ averageUsageRate }}%
    </strong>

    <small>
      全區域平均
    </small>

  </div>


  <div class="summary-card">

    <span class="label">
      已滿區域
    </span>

    <strong>
      {{ fullRegions }}
    </strong>

    <small>
      個區域
    </small>

  </div>

</div>

</template>


<style scoped>

.summary-grid {

  display:
    grid;

  grid-template-columns:
    repeat(
      6,
      minmax(0, 1fr)
    );

  gap:
    16px;

}


.summary-card {

  display:
    flex;

  flex-direction:
    column;

  gap:
    8px;

  min-width:
    0;

  padding:
    20px;

  background:
    white;

  border:
    1px solid #eaecf0;

  border-radius:
    16px;

  box-shadow:
    0 4px 12px
    rgba(16, 24, 40, .05);

}


.label {

  color:
    #667085;

  font-size:
    14px;

}


strong {

  color:
    #101828;

  font-size:
    30px;

  line-height:
    1.2;

}


small {

  color:
    #98a2b3;

  font-size:
    13px;

}


@media (
  max-width: 1200px
) {

  .summary-grid {

    grid-template-columns:
      repeat(
        3,
        minmax(0, 1fr)
      );

  }

}


@media (
  max-width: 700px
) {

  .summary-grid {

    grid-template-columns:
      repeat(
        2,
        minmax(0, 1fr)
      );

  }

}

</style>