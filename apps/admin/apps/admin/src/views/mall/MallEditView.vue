<template>
  <AdminLayout>
    <div class="page-container">
      <h1>編輯商品</h1>
      <p>商品 ID：{{ route.params.id }}</p>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'

const route = useRoute()
</script>