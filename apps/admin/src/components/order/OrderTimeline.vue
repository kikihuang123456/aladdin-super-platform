<template>
  <section class="timeline-card">
    <header class="timeline-header">
      <p class="eyebrow">
        ORDER TIMELINE
      </p>

      <h2>
        訂單流程
      </h2>
    </header>

    <div class="timeline">
      <div
        v-for="step in timelineSteps"
        :key="step.key"
        class="timeline-item"
        :class="{
          active: step.active,
          current: step.current,
        }"
      >
        <div class="timeline-dot">
          {{ step.icon }}
        </div>

        <div class="timeline-content">
          <strong>
            {{ step.title }}
          </strong>

          <small>
            {{ step.time || '-' }}
          </small>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import type {
  MallOrderStatus,
} from '../../types/mall-order'

const props =
  defineProps<{

    orderStatus:
      MallOrderStatus

    createdAt:
      string

    updatedAt:
      string

  }>()

const timelineSteps =
  computed(() => {

    const currentIndex =
      getCurrentIndex(
        props.orderStatus,
      )

    return [

      {
        key:'created',

        title:'建立訂單',

        icon:'📝',

        active:true,

        current:
          currentIndex === 0,

        time:
          props.createdAt,
      },

      {
        key:'paid',

        title:'付款完成',

        icon:'💳',

        active:
          currentIndex >= 1,

        current:
          currentIndex === 1,

        time:
          currentIndex >= 1
            ? props.updatedAt
            : '',
      },

      {
        key:'processing',

        title:'備貨中',

        icon:'📦',

        active:
          currentIndex >= 2,

        current:
          currentIndex === 2,

        time:
          currentIndex >= 2
            ? props.updatedAt
            : '',
      },

      {
        key:'shipped',

        title:'已出貨',

        icon:'🚚',

        active:
          currentIndex >= 3,

        current:
          currentIndex === 3,

        time:
          currentIndex >= 3
            ? props.updatedAt
            : '',
      },

      {
        key:'completed',

        title:'完成',

        icon:'✅',

        active:
          currentIndex >= 4,

        current:
          currentIndex === 4,

        time:
          currentIndex >= 4
            ? props.updatedAt
            : '',
      },

    ]

  })

function getCurrentIndex(
  status: MallOrderStatus,
){

  switch(status){

    case 'pending_payment':
      return 0

    case 'paid':
      return 1

    case 'processing':
      return 2

    case 'shipped':
      return 3

    case 'completed':
      return 4

    case 'cancelled':
      return 0

    default:
      return 0

  }

}
</script>

<style scoped>
.timeline-card{

padding:24px;

border:1px solid #e5e7eb;

border-radius:18px;

background:white;

}

.timeline-header{

margin-bottom:24px;

}

.eyebrow{

margin:0;

font-size:12px;

font-weight:800;

color:#3157d6;

}

.timeline-header h2{

margin-top:6px;

font-size:20px;

}

.timeline{

display:flex;

flex-direction:column;

gap:20px;

}

.timeline-item{

display:flex;

gap:18px;

align-items:flex-start;

opacity:.35;

}

.timeline-item.active{

opacity:1;

}

.timeline-dot{

width:48px;

height:48px;

border-radius:50%;

background:#e2e8f0;

display:flex;

align-items:center;

justify-content:center;

font-size:20px;

}

.timeline-item.active
.timeline-dot{

background:#3157d6;

color:white;

}

.timeline-item.current
.timeline-dot{

box-shadow:
0 0 0 5px
rgba(49,87,214,.15);

}

.timeline-content{

display:flex;

flex-direction:column;

gap:4px;

}

.timeline-content strong{

font-size:16px;

}

.timeline-content small{

color:#64748b;

}
</style>