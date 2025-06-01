<template>
  <div class="row mb-6">
    <label class="col-lg-4 col-form-label fw-semobold fs-6">{{
      props.label
    }}</label>
    <div class="col-lg-8 fv-row">
      <Field
        :readonly="props.readonly"
        :multiple="multiple"
        type="file"
        :name="props.name"
        class="form-control form-control-lg"
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

const props = defineProps<{
  label: string;
  name: string;
  multiple?: boolean;
  readonly?: boolean;
}>();
</script>
