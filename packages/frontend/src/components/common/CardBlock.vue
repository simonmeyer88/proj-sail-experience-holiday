<template>
  <div class="info-card card">
    <div
      v-if="slots.header"
      :role="collapse ? 'button' : ''"
      :data-bs-toggle="collapse ? 'collapse' : ''"
      :data-bs-target="`#${id}`"
      class="card-header align-items-center pb-4 lh-1 pt-5 w-100"
    >
      <slot name="header"></slot>
    </div>

    <div :id="id" class="card-body collapse show">
      <slot></slot>
    </div>

    <div v-if="slots.footer" class="card-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSlots } from "vue";

defineProps<{ collapse?: boolean }>();

const slots = useSlots();

const id = `card-body-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
</script>

<style scoped lang="scss">
.info-card {
  .card-header {
    min-height: auto;
  }
}
</style>
