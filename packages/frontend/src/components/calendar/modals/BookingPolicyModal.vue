<template>
  <BaseModal title="" v-model="isOpen">
    <Form
      ref="formRef"
      class="book-form"
      @submit="emits('submit')"
      :validation-schema="bookEventSchema"
      v-slot="{ errors, setFieldValue }"
    >
      <div class="row mb-3">
        <div class="swal2-icon swal2-warning swal2-icon-show">
          <div class="swal2-icon-content">!</div>
        </div>
      </div>

      <div class="row mb-5 text-center">
        <h2>
          {{ t("policyTitle") }}
        </h2>
      </div>

      <div class="row mb-5">
        <el-scrollbar always>
          <!-- Place for policy content -->
          {{ t("policyText") }}
        </el-scrollbar>
      </div>

      <div class="row mb-5">
        <Field name="isAccept" type="checkbox">
          <el-checkbox
            @change="(value: boolean) => setFieldValue('isAccept', value)"
            :label="t('agreePolicy')"
            :class="{ error: errors.isAccept }"
          />
        </Field>
      </div>

      <div class="row">
        <div class="d-flex gap-3 justify-content-end">
          <button
            @click="isOpen = false"
            type="button"
            class="btn btn-outline btn-sm"
          >
            {{ t("cancel") }}
          </button>

          <button type="submit" class="btn btn-success btn-sm">
            {{ t("bookSlot") }}
          </button>
        </div>
      </div>
    </Form>
  </BaseModal>
</template>

<i18n>
{
    "en": {
        "policyTitle": "Cancellation Policy",
        "policyText": "The practice may be canceled in advance without any issues. However, within the last 48 hours, it can only be canceled due to force majeure. If this condition is not met or if it is canceled without valid justification, the ability to make new reservations will be blocked for a period of 15 days.",
        "bookSlot": "Book slot",
        "cancel": "Cancel",
        "agreePolicy": "I have read and accept cancelattion policy"
    },
    "es": {
        "policyTitle": "Política de Cancelación",
        "policyText": "La práctica podrá ser cancelada con antelación sin inconvenientes. Sin embargo, dentro de las últimas 48 horas solo podrá cancelarse por motivos de fuerza mayor. En caso de no cumplir con esta condición o de cancelar sin justificación válida, la posibilidad de realizar nuevas reservas quedará bloqueada por un período de 15 días.",
        "bookSlot": "Reservar plaza",
        "cancel": "Cancelar",
        "agreePolicy": "He leído y acepto la política de cancelación."
    }
}
</i18n>

<script setup lang="ts">
import { bookEventSchema } from "@/validation-schemas/events";
import { BaseModal } from "@/components/common";
import { Form, Field } from "vee-validate";
import { useI18n } from "vue-i18n";
import { computed } from "vue";

const { t } = useI18n();

interface Props {
  modelValue: boolean;
}

interface Emits {
  (e: "update:modelValue", value: Props["modelValue"]): void;
  (e: "submit"): void;
}

const props = defineProps<Props>();
const emits = defineEmits<Emits>();

const isOpen = computed({
  get() {
    return props.modelValue;
  },

  set(value) {
    emits("update:modelValue", value);
  },
});
</script>

<style scoped lang="scss">
.swal2-icon {
  width: 71px;
  height: 71px;
  display: flex;
  box-sizing: border-box;
}
</style>

<style lang="scss">
.book-form {
  .el-checkbox {
    white-space: break-spaces;
    width: fit-content;

    &__label {
      line-height: 120%;
    }

    &.error {
      --el-checkbox-text-color: #f1416c;
      --el-checkbox-input-border: 1px solid #f1416c;
    }
  }
}
</style>
