<style>
.custom__dp .el-input__wrapper {
  box-shadow: none !important;
  width: 100% !important;
}

.custom__dp .el-input__inner {
  color: var(--bs-gray-700) !important;
  font-weight: 500 !important;
}
</style>
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
      <Field
        :model-value="props.initialValue"
        :name="props.name"
        v-slot="{ field }"
        v-if="
          props.type === 'date' ||
          props.type === 'datetime-local' ||
          props.type === 'month'
        "
        @update:model-value="($event) => emit('update:modelValue', $event)"
      >
        <ElDatePicker
          :type="
            props.type === 'date'
              ? 'date'
              : props.type === 'month'
              ? 'month'
              : 'datetime'
          "
          class="form-control form-control-lg w-100 custom__dp d-flex align-items-center justify-content-center"
          style="padding-block: 0; padding-left: 10px; overflow: hidden"
          :readonly="props.readonly"
          :disabled="props.disabled"
          :placeholder="props.placeholder"
          :model-value="field.value"
          v-bind="field"
        />
      </Field>

      <Field
        :model-value="props.initialValue"
        v-else
        @update:model-value="($event) => emit('update:modelValue', $event)"
        :readonly="props.readonly"
        :disabled="props.disabled"
        :type="props.type"
        :name="props.name"
        class="form-control form-control-lg"
        :placeholder="props.placeholder"
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
import { ElDatePicker } from "element-plus";

type InputType =
  | "text"
  | "password"
  | "email"
  | "number"
  | "date"
  | "time"
  | "datetime-local"
  | "month";

const props = defineProps<{
  label: string;
  name: string;
  placeholder?: string;
  type: InputType;
  disabled?: boolean;
  readonly?: boolean;
  horizontal?: "always" | "never" | "dynamic";
  initialValue?: string;
}>();

const emit = defineEmits<{
  (event: "update:modelValue", value: string | Date): void;
}>();
</script>
