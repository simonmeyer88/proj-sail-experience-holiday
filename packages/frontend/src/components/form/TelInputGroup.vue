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
    >
      <Field :name="props.name" v-slot="{ field, setErrors }">
        <VueTelInput
          :auto-default-country="false"
          :default-country="'ES'"
          @vue:mounted="onMounted(setErrors)"
          v-bind="field"
          :input-options="{
            readonly: props.readonly,
          }"
          v-model="field.value"
          mode="international"
          class="rounded"
          style-classes="form-control form-control-lg"
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

<style lang="scss">
.vue-tel-input {
  border: 1px solid var(--bs-gray-300);
  box-shadow: none !important;
  &:focus-within {
    border: 1px solid var(--bs-gray-400) !important;
    box-shadow: none !important;
  }
}
.vue-tel-input > * {
  padding: 0;
  color: var(--bs-gray-700);
  font-weight: 500;
  font-size: 1.1rem;
}
.vue-tel-input .vti__dropdown {
  padding-right: 10px;
}
.vti__dropdown-list {
  width: 310px !important;
  left: -15px !important;
}
</style>
<script lang="ts" setup>
import "vue-tel-input/vue-tel-input.css";
import { VueTelInput } from "vue-tel-input";
import { ErrorMessage, Field } from "vee-validate";

defineEmits(["change"]);

const props = defineProps<{
  name: string;
  label: string;
  readonly?: boolean;
  horizontal?: "always" | "never" | "dynamic";
}>();

// hacky way so when the input is mounted, the error message is not shown
const onMounted = (setErrors: any) => {
  setTimeout(() => {
    setErrors([]);
  }, 10);
};
</script>
