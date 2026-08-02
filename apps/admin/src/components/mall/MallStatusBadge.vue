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
} from '../../types/mall'

interface Props {
  status: MallProductStatus
}

const props =
  defineProps<Props>()

const statusMap:
  Record<
    MallProductStatus,
    {
      text: string
      className: string
    }
  > = {
    draft: {
      text: '草稿',
      className: 'mall-status-badge--draft',
    },
    pending: {
      text: '待審核',
      className: 'mall-status-badge--pending',
    },
    published: {
      text: '已上架',
      className: 'mall-status-badge--published',
    },
    disabled: {
      text: '已下架',
      className: 'mall-status-badge--disabled',
    },
  }

const statusText =
  computed(() =>
    statusMap[
      props.status
    ].text,
  )

const statusClass =
  computed(() =>
    statusMap[
      props.status
    ].className,
  )
</script>

<style scoped>
.mall-status-badge {
  display: inline-flex;
  min-width: 72px;
  padding: 5px 11px;
  border-radius: 999px;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
}

.mall-status-badge--draft {
  background: #f1f5f9;
  color: #475569;
}

.mall-status-badge--pending {
  background: #fef3c7;
  color: #b45309;
}

.mall-status-badge--published {
  background: #dcfce7;
  color: #15803d;
}

.mall-status-badge--disabled {
  background: #fee2e2;
  color: #b91c1c;
}
</style>