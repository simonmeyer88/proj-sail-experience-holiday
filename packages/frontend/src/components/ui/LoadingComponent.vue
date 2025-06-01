<template>
  <div
    class="d-flex align-items-center justify-content-center"
    :style="{
      height: height === 'auto' ? 'auto' : height + 'px',
      width: fullWidth ? '100%' : 'auto',
    }"
  >
    <div
      class="spinner-border text-primary"
      role="status"
      :style="{
        width: spinnerSize ? spinnerSize + 'px' : undefined,
        height: spinnerSize ? spinnerSize + 'px' : undefined,
      }"
    ></div>
  </div>
</template>

<script lang="ts" setup>
import { PropType } from "vue";

defineProps({
  height: {
    type: [Number, String] as PropType<number | "auto">,
    default: 200,
  },
  fullWidth: {
    type: Boolean,
    default: false,
  },
  spinnerSize: {
    type: Number,
    required: false,
  },
});
</script>
