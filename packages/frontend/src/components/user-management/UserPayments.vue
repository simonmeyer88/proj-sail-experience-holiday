<template>
  <div>
    <div class="mb-4 fs-3 fw-bold d-flex">
      <span v-if="showTitle" class="me-2 fs-2">
        {{ t("payments") }}
      </span>

      <button
        v-if="!isReadonly"
        class="btn btn-dark btn-sm align-items-center"
        @click="showAddPaymentModal = true"
      >
        <i class="ki-solid ki-plus fs-4 me-2"></i>
        {{ t("addPayment") }}
      </button>
    </div>

    <div class="d-flex flex-wrap gap-4 w-100 py-3">
      <payment-card
        :is-readonly="isReadonly"
        :payment="payment"
        v-for="payment in user.payments"
        :key="payment.id"
        @delete="handleDeletePayment"
      />
    </div>
    <div v-if="user.payments.length === 0">
      <span class="mt-2 fs-3 fw-bold p-4 text-gray-700 bg-light-warning">
        {{ t("noPayments") }}
      </span>
    </div>

    <BaseModal
      v-model:model-value="showAddPaymentModal"
      :title="t('addPayment')"
    >
      <div class="d-flex flex-column font-big fs-6 text-dark fw-semibold">
        <VForm
          class="form"
          ref="formRef"
          :validation-schema="addPaymentSchema"
          :initial-values="{
            amount: 1,
            method: 'CARD',
            type: 'ONE_TIME',
            paidAt: moment().format('YYYY-MM-DD'),
          }"
          @submit="addPayment"
        >
          <div class="card-body p-9 mt-4">
            <InputGroup
              :label="t('amount')"
              name="amount"
              type="number"
              placeholder="Cantidad"
            />

            <SelectGroup
              class="mb-6"
              :label="t('paymentMethod')"
              name="method"
              :options="[
                { label: t('card'), value: 'CARD' },
                { label: t('cash'), value: 'CASH' },
                { label: 'Efectivo', value: 'EFECTIVO' },

                { label: 'Stripe', value: 'STRIPE' },
                { label: 'Woocommerce', value: 'WOOCOMMERCE' },
              ]"
            />

            <SelectGroup
              class="mb-6"
              :label="t('paymentType')"
              name="type"
              :options="[
                { label: t('oneTime'), value: 'ONE_TIME' },
                { label: t('subscription'), value: 'SUBSCRIPTION' },
              ]"
            />

            <InputGroup
              :label="t('paidAt')"
              name="paidAt"
              type="date"
              :placeholder="t('paymentDate')"
            />

            <InputGroup
              :label="t('description')"
              name="description"
              type="text"
            />

            <Field hidden name="userId" :value="user.id" />
          </div>

          <div class="d-flex gap-3 flex-column flex-sm-row justify-content-end">
            <LoadableButton
              color="primary"
              :loading="createPayment.isLoading.value"
              submit
              :default-text="t('addPayment')"
            />
          </div>
        </VForm>
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import moment from "moment-timezone";
import { addPaymentSchema } from "@/validation-schemas/payments";
import { InputGroup, LoadableButton, SelectGroup } from "@/components/form";
import { BaseModal } from "@/components/common";
import { ref } from "vue";
import {
  PaymentMethod,
  useCreatePayment,
  useDeletePayment,
  UsersFindOneResponse,
} from "@/server-state";
import { Field, Form as VForm } from "vee-validate";
import { getSubmitFn } from "@/util/form";
import { toastError, toastSuccess } from "@/util/toast";
import { useI18n } from "vue-i18n";
import PaymentCard from "@/components/user-management/PaymentCard.vue";

interface Props {
  isReadonly?: boolean;
  showTitle?: boolean;
  user: UsersFindOneResponse;
}

defineProps<Props>();

const { t } = useI18n();

const createPayment = useCreatePayment();
const deletePayment = useDeletePayment();

const showAddPaymentModal = ref(false);

const addPayment = getSubmitFn(addPaymentSchema, async (values) => {
  createPayment.mutate(
    {
      ...values,
      amount: values.amount * 100,
      type: values.type === "ONE_TIME" ? "ONE_TIME" : "SUBSCRIPTION",
      method: values.method as PaymentMethod,
    },
    {
      onSuccess: () => {
        toastSuccess(t("paymentAdded"));
        showAddPaymentModal.value = false;
      },
      onError: (error: any) => {
        toastError(error.message || "Unknown error");
      },
    }
  );
});

const handleDeletePayment = (id: string) => {
  if (!id) return;
  deletePayment.mutate(id, {
    onSuccess: () => {
      toastSuccess(t("paymentDeleted"));
    },
    onError: (error: any) => {
      toastError(error.message || "Unknown error");
    },
  });
};
</script>

<style scoped lang="scss"></style>

<i18n>
{
    "en":{
        "payments":"Payments",
        "addPayment":"Add payment",
        "stripe":"Stripe",
        "cash":"Cash",
        "woocommerce_abbreviated":"Woocomm.",
        "oneTime":"One time",
        "subscription":"Subscription",
        "noPayments":"No payments",
        "paymentDeleted":"Payment deleted",
        "paymentAdded":"Payment added",
        "paymentMethod":"Payment method",
        "paymentType":"Payment type",
        "paidAt":"Paid at",
        "amount":"Amount",
        "paymentDate":"Payment date",
        "description":"Description",
        "card":"Credit card"
    },
    "es":{
        "payments":"Pagos",
        "addPayment":"Añadir pago",
        "stripe":"Stripe",
        "cash":"Datáfono",
        "woocommerce_abbreviated":"Woocomm.",
        "oneTime":"Único",
        "subscription":"Suscripción",
        "noPayments":"No hay pagos",
        "paymentDeleted":"Pago borrado",
        "paymentAdded":"Pago añadido",
        "paymentMethod":"Método de pago",
        "paymentType":"Tipo de pago",
        "paidAt":"Pagado el",
        "amount":"Cantidad",
        "paymentDate":"Fecha de pago",
        "description":"Descripción",
        "card":"Tarjeta de credito"
    }
}
</i18n>
