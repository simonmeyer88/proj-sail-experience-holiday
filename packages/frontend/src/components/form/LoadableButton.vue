<template>
  <button
    class="btn"
    :class="`btn-${props.color}`"
    :type="props.submit ? 'submit' : 'button'"
    :data-kt-indicator="loading ? 'on' : 'off'"
    :disabled="props.disabled || loading"
  >
    <span class="indicator-label">{{ props.defaultText }} </span>
    <span class="indicator-progress">
      {{ props.loadingText ?? props.defaultText }}
      <span class="spinner-border spinner-border-sm align-middle ms-2"></span>
    </span>
  </button>
</template>

<script lang="ts" setup>
const props = defineProps<{
  disabled?: boolean;
  defaultText: string;
  loadingText?: string;
  loading: boolean;
  color: string;
  submit?: boolean;
  formId?: string;
}>();
</script>
