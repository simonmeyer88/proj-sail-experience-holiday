<template>
  <div class="row">
    <div class="fv-row form-check form-switch d-flex align-items-center ps-3">
      <KTIcon
        :icon-name="iconName"
        class="fs-1 me-4"
        :class="{
          'text-success': enabled,
          'text-danger': !enabled,
        }"
      />
      <label class="fw-bold fs-5">{{ label }}</label>
      <input
        :false-value="false"
        :true-value="true"
        type="checkbox"
        class="form-check-input mx-3"
        style="width: 39px; min-width: 39px"
        :checked="checked"
        @click.prevent="$emit('change', !checked)"
      />
    </div>
  </div>
</template>
<script lang="ts" setup>
import KTIcon from "../ui/KTIcon.vue";

defineProps<{
  enabled: boolean;
  label: string;
  checked: boolean;
  iconName: string;
}>();

defineEmits(["change"]);
</script>
