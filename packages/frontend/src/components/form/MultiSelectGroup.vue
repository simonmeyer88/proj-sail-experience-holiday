<template>
  <div class="row mb-6">
    <label
      class="col-form-label fw-semobold fs-6"
      :class="{
        'col-lg-4': props.horizontal === 'dynamic',
        'col-4': props.horizontal === 'always',
      }"
      >{{ props.label }}</label
    >
    <div
      :class="{
        'col-lg-8': props.horizontal === 'dynamic',
        'col-8': props.horizontal === 'always',
      }"
      class="fv-row"
    >
      <Field :name="props.name" v-slot="{ field }">
        <Multiselect
          :readonly="props.readonly"
          class="rounded"
          v-bind="field"
          v-model="field.value"
          mode="tags"
          searchable
          :options="props.options"
        />
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
import Multiselect from "@vueform/multiselect";
import { ErrorMessage, Field } from "vee-validate";
defineEmits(["change"]);

const props = defineProps<{
  name: string;
  label: string;
  options: { value: string; label: string }[];
  readonly?: boolean;
  horizontal?: "dynamic" | "always" | "never";
}>();
</script>
