<template>
  <div class="row">
    <label
      class="col-form-label fw-semobold fs-6"
      :class="{
        'col-lg-4': props.horizontal === 'dynamic',
        'col-4': props.horizontal === 'always',
      }"
      >{{ props.label }}</label
    >
    <div
      class="fv-row"
      :class="{
        'col-lg-8': props.horizontal === 'dynamic',
        'col-8': props.horizontal === 'always',
      }"
    >
      <Field as="select" :name="props.name" class="form-select-lg form-select">
        <option
          :disabled="props.readonly"
          v-for="option in props.options"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </Field>
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

interface Option {
  value: string;
  label: string;
}
const props = defineProps<{
  label: string;
  name: string;
  placeholder?: string;
  options: Option[];
  readonly?: boolean;
  horizontal?: "always" | "never" | "dynamic";
}>();
</script>
