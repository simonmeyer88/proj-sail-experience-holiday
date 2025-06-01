<template>
  <div class="row mb-6">
    <div class="fv-row form-check form-switch d-flex align-items-center ps-3">
      <label class="col-form-label fw-semibold fs-6">{{ props.label }}</label>
      <Field
        :disabled="props.readonly"
        type="checkbox"
        :name="props.name"
        class="form-check-input mx-3"
        :value="true"
        :unchecked-value="false"
        @update:model-value="$emit('change', $event)"
      />

      <div class="fv-plugins-message-container">
        <div class="fv-help-block">
          <ErrorMessage :name="props.name" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Field, ErrorMessage } from "vee-validate";
const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["change"]);
</script>
