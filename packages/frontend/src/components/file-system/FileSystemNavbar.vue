<template>
  <div
    class="d-flex align-items-center justify-content-start align-items-center mb-6 border-primary border px-1 py-1 rounded-3 badge-light-primary"
  >
    <button
      class="btn btn-sm bg-primary btn-icon me-3"
      @click="emit('goBack')"
      style="
        background-color: transparent;
        border: none;
        height: 24px;
        width: 24px;
        flex-shrink: 0;
      "
      :disabled="!canGoBack"
    >
      <i class="ki-solid ki-left fs-1 me-1 text-white"></i>
    </button>
    <div class="d-flex align-items-center gap-1 flex-wrap">
      <div
        v-for="(path, index) in pathStack"
        :key="index"
        class="d-flex align-items-center gap-1"
      >
        <span class="fs-6 fw-bold text-primary">{{ path }}</span>
        <i
          class="ki-solid ki-right fs-2"
          v-if="index != pathStack.length - 1"
        ></i>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { PropType } from "vue";

defineProps({
  canGoBack: Boolean,
  pathStack: {
    type: Array as PropType<string[]>,
    required: true,
  },
});

const emit = defineEmits(["goBack"]);
</script>
