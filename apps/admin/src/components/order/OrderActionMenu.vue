<template>
  <div class="action-menu">

    <button
      class="primary"
      type="button"
      @click="$emit('view')"
    >
      查看
    </button>

    <button
      class="secondary"
      type="button"
      @click="$emit('edit')"
    >
      編輯
    </button>

    <button
      class="success"
      type="button"
      @click="$emit('complete')"
    >
      完成
    </button>

    <button
      class="warning"
      type="button"
      @click="$emit('ship')"
    >
      出貨
    </button>

    <button
      class="danger"
      type="button"
      @click="$emit('cancel')"
    >
      取消
    </button>

  </div>
</template>

<script setup lang="ts">
defineEmits<{
  (e:'view'):void
  (e:'edit'):void
  (e:'complete'):void
  (e:'ship'):void
  (e:'cancel'):void
}>()
</script>

<style scoped>

.action-menu{

display:flex;

flex-wrap:wrap;

gap:8px;

}

button{

height:34px;

padding:0 14px;

border:none;

border-radius:8px;

cursor:pointer;

font-size:13px;

font-weight:700;

transition:.2s;

}

button:hover{

transform:translateY(-1px);

}

.primary{

background:#3157d6;

color:#fff;

}

.secondary{

background:#f1f5f9;

color:#334155;

}

.success{

background:#16a34a;

color:#fff;

}

.warning{

background:#f59e0b;

color:#fff;

}

.danger{

background:#dc2626;

color:#fff;

}

</style>