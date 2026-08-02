<template>
  <span
    class="mall-status-badge"
    :class="statusClass"
  >
    {{ statusText }}
  </span>
</template>

<script setup lang="ts">

import {
  computed,
} from 'vue'

import type {
  MallProductStatus,
} from '@/types/mall'


interface Props {
  status:
    MallProductStatus
}


const props =
  defineProps<Props>()


const statusMap = {
  draft: {
    text:
      '草稿',
    class:
      'draft',
  },

  pending: {
    text:
      '待審核',
    class:
      'pending',
  },

  published: {
    text:
      '已上架',
    class:
      'published',
  },

  disabled: {
    text:
      '已下架',
    class:
      'disabled',
  },
}


const statusText =
  computed(() =>
    statusMap[
      props.status
    ]?.text ??
    '未知',
  )


const statusClass =
  computed(() =>
    statusMap[
      props.status
    ]?.class ??
    'draft',
  )

</script>


<style scoped>

.mall-status-badge {

  display: inline-flex;

  align-items: center;

  justify-content: center;

  min-width: 72px;

  padding:
    4px 12px;

  border-radius:
    999px;

  font-size:
    13px;

  font-weight:
    600;

}


/* 草稿 */

.draft {

  background:
    #f1f5f9;

  color:
    #475569;

}


/* 待審核 */

.pending {

  background:
    #fff7ed;

  color:
    #c2410c;

}


/* 已上架 */

.published {

  background:
    #dcfce7;

  color:
    #15803d;

}


/* 已下架 */

.disabled {

  background:
    #fee2e2;

  color:
    #b91c1c;

}

</style>