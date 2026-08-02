<template>
  <form
    class="product-filters"
    @submit.prevent="handleSubmit"
  >
    <div class="search-group">
      <input
        v-model.trim="localKeyword"
        class="search-input"
        type="search"
        autocomplete="off"
        placeholder="搜尋商品名稱、編號或副標題"
        aria-label="搜尋商品"
        :disabled="loading"
      >

      <button
        class="search-button"
        type="submit"
        :disabled="loading"
      >
        {{
          loading
            ? '搜尋中...'
            : '搜尋'
        }}
      </button>
    </div>

    <select
      v-model="localStatus"
      class="filter-select"
      aria-label="商品狀態篩選"
      :disabled="loading"
      @change="handleStatusChange"
    >
      <option value="">
        全部狀態
      </option>

      <option value="draft">
        草稿
      </option>

      <option value="pending">
        待審核
      </option>

      <option value="published">
        已上架
      </option>

      <option value="disabled">
        已下架
      </option>
    </select>

    <input
      v-model.trim="localCategoryId"
      class="filter-input"
      type="text"
      autocomplete="off"
      placeholder="分類 ID"
      aria-label="商品分類 ID"
      :disabled="loading"
      @change="handleCategoryChange"
    >

    <input
      v-model.trim="localBrandId"
      class="filter-input"
      type="text"
      autocomplete="off"
      placeholder="品牌 ID"
      aria-label="商品品牌 ID"
      :disabled="loading"
      @change="handleBrandChange"
    >

    <select
      v-model.number="localPageSize"
      class="filter-select"
      aria-label="每頁商品筆數"
      :disabled="loading"
      @change="handlePageSizeChange"
    >
      <option :value="10">
        每頁 10 筆
      </option>

      <option :value="20">
        每頁 20 筆
      </option>

      <option :value="50">
        每頁 50 筆
      </option>

      <option :value="100">
        每頁 100 筆
      </option>
    </select>

    <button
      class="reset-button"
      type="button"
      :disabled="
        loading ||
        !hasFilters
      "
      @click="handleReset"
    >
      清除篩選
    </button>
  </form>
</template>

<script setup lang="ts">
import {
  computed,
  ref,
  watch,
} from 'vue'

import type {
  MallProductStatus,
} from '../../types/mall'

interface Props {
  keyword?: string
  categoryId?: string
  brandId?: string
  status?: MallProductStatus
  pageSize?: number
  loading?: boolean
}

const props =
  withDefaults(
    defineProps<Props>(),
    {
      keyword: '',
      categoryId: '',
      brandId: '',
      status: undefined,
      pageSize: 20,
      loading: false,
    },
  )

const emit =
  defineEmits<{
    search: [keyword: string]
    statusChange: [
      status: MallProductStatus | '',
    ]
    categoryChange: [
      categoryId: string,
    ]
    brandChange: [
      brandId: string,
    ]
    pageSizeChange: [
      pageSize: number,
    ]
    reset: []
  }>()

const localKeyword =
  ref(
    props.keyword,
  )

const localCategoryId =
  ref(
    props.categoryId,
  )

const localBrandId =
  ref(
    props.brandId,
  )

const localStatus =
  ref<MallProductStatus | ''>(
    props.status ?? '',
  )

const localPageSize =
  ref(
    props.pageSize,
  )

const hasFilters =
  computed(() =>
    Boolean(
      localKeyword.value ||
      localCategoryId.value ||
      localBrandId.value ||
      localStatus.value ||
      localPageSize.value !== 20,
    ),
  )

watch(
  () =>
    props.keyword,
  (value) => {
    localKeyword.value =
      value
  },
)

watch(
  () =>
    props.categoryId,
  (value) => {
    localCategoryId.value =
      value
  },
)

watch(
  () =>
    props.brandId,
  (value) => {
    localBrandId.value =
      value
  },
)

watch(
  () =>
    props.status,
  (value) => {
    localStatus.value =
      value ?? ''
  },
)

watch(
  () =>
    props.pageSize,
  (value) => {
    localPageSize.value =
      value
  },
)

function handleSubmit():
  void {
  emit(
    'search',
    localKeyword.value,
  )
}

function handleStatusChange():
  void {
  emit(
    'statusChange',
    localStatus.value,
  )
}

function handleCategoryChange():
  void {
  emit(
    'categoryChange',
    localCategoryId.value,
  )
}

function handleBrandChange():
  void {
  emit(
    'brandChange',
    localBrandId.value,
  )
}

function handlePageSizeChange():
  void {
  emit(
    'pageSizeChange',
    localPageSize.value,
  )
}

function handleReset():
  void {
  localKeyword.value = ''
  localCategoryId.value = ''
  localBrandId.value = ''
  localStatus.value = ''
  localPageSize.value = 20

  emit('reset')
}
</script>

<style scoped>
.product-filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.search-group {
  display: flex;
  min-width: 320px;
  flex: 1;
  align-items: center;
}

.search-input,
.filter-input,
.filter-select {
  min-height: 42px;
  border: 1px solid #dbe2ea;
  background: #ffffff;
  color: #0f172a;
  font: inherit;
  font-size: 14px;
  outline: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.search-input {
  width: 100%;
  padding: 0 14px;
  border-radius: 10px 0 0 10px;
}

.filter-input {
  width: 150px;
  padding: 0 12px;
  border-radius: 10px;
}

.filter-select {
  min-width: 132px;
  padding: 0 34px 0 12px;
  border-radius: 10px;
  cursor: pointer;
}

.search-input:focus,
.filter-input:focus,
.filter-select:focus {
  z-index: 1;
  border-color: #3157d6;
  box-shadow:
    0 0 0 3px
    rgba(49, 87, 214, 0.12);
}

.search-input:disabled,
.filter-input:disabled,
.filter-select:disabled {
  cursor: not-allowed;
  background: #f8fafc;
  color: #94a3b8;
}

.search-button,
.reset-button {
  min-height: 42px;
  padding: 0 15px;
  border-radius: 10px;
  cursor: pointer;
  font: inherit;
  font-size: 14px;
  font-weight: 800;
}

.search-button {
  min-width: 72px;
  border: 1px solid #3157d6;
  border-left: 0;
  border-radius: 0 10px 10px 0;
  background: #3157d6;
  color: #ffffff;
}

.search-button:hover:not(:disabled) {
  background: #2547bd;
}

.reset-button {
  border: 1px solid #dbe2ea;
  background: #ffffff;
  color: #64748b;
}

.reset-button:hover:not(:disabled) {
  border-color: #bac5d4;
  background: #f8fafc;
  color: #0f172a;
}

.search-button:disabled,
.reset-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

@media (max-width: 900px) {
  .product-filters {
    align-items: stretch;
    flex-direction: column;
  }

  .search-group {
    width: 100%;
    min-width: 0;
  }

  .filter-input,
  .filter-select,
  .reset-button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .search-group {
    flex-direction: column;
    gap: 8px;
  }

  .search-input,
  .search-button {
    width: 100%;
    border: 1px solid #dbe2ea;
    border-radius: 10px;
  }

  .search-button {
    border-color: #3157d6;
  }
}
</style>