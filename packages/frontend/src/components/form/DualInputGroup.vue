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
      class="fv-row"
      :class="{
        'col-lg-8': props.horizontal === 'dynamic',
        'col-8': props.horizontal === 'always',
      }"
    >
      <div class="row">
        <div class="col-lg-6 fv-row">
          <Field
            :readonly="props.readonly"
            :type="props.type1"
            :name="props.name1"
            class="form-control form-control-lg mb-3 mb-lg-0"
            :placeholder="props.placeholder1"
          />
          <div class="fv-plugins-message-container">
            <div class="fv-help-block">
              <ErrorMessage :name="props.name1" />
            </div>
          </div>
        </div>

        <div class="col-lg-6 fv-row">
          <Field
            :readonly="props.readonly"
            :type="props.type2"
            :name="props.name2"
            class="form-control form-control-lg"
            :placeholder="props.placeholder2"
          />
          <div class="fv-plugins-message-container">
            <div class="fv-help-block">
              <ErrorMessage :name="props.name2" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Field, ErrorMessage } from "vee-validate";
type InputType = "text" | "password" | "email" | "number" | "date";

const props = defineProps<{
  label: string;
  name1: string;
  placeholder1?: string;
  type1: InputType;
  name2: string;
  placeholder2?: string;
  type2: InputType;
  readonly?: boolean;
  horizontal?: "always" | "never" | "dynamic";
}>();
</script>
