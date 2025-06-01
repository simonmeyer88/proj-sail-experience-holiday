<template>
  <div
    class="bg-light-success rounded p-4 justify-content d-flex flex-row gap-2 border border-success border-dashed position-relative flex-grow-1 mw-300px"
  >
    <i
      v-if="!isReadonly"
      @click="emit('delete', payment.id)"
      role="button"
      class="ki-solid ki-trash-square fs-1 text-danger top-0 left-0"
    ></i>
    <div>
      <div class="mb-2">
        <span class="mt-2 fs-4 fw-bold"> {{ payment.amount / 100 }}€ </span>
        <span class="mt-2 fs-7 fw-semibold">
          {{ moment(payment.paidAt).format("DD/MM/YYYY") }}
        </span>
      </div>
      <p>
        <span v-if="payment.description" class="fw-bold">
          {{ t("description") }}:
        </span>

        {{ payment.description ?? t("noDescription") }}
      </p>
      <div class="d-flex gap-2">
        <span
          class="p-1 rounded border-2 fs-8 text-white"
          :class="{
            'bg-success': payment.method === 'STRIPE',
            'bg-primary':
              payment.method === 'CASH' || payment.method === 'CARD',
            'bg-warning': payment.method === 'WOOCOMMERCE',
            'bg-info': payment.method === 'EFECTIVO',
          }"
        >
          {{ paymentMethod }}
        </span>
        <span
          class="p-1 rounded border-2 fs-8 text-white"
          :class="{
            'bg-success': payment.type === 'ONE_TIME',
            'bg-primary': payment.type === 'SUBSCRIPTION',
          }"
        >
          {{ payment.type === "ONE_TIME" ? t("oneTime") : t("subscription") }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import moment from "moment/moment";
import { UsersFindOneResponse } from "@/server-state";
import { useI18n } from "vue-i18n";

interface Props {
  isReadonly?: boolean;
  payment: UsersFindOneResponse["payments"][0];
}

const props = defineProps<Props>();

const emit = defineEmits<{ (e: "delete", value: string): void }>();

const { t } = useI18n();

const paymentMethod = computed(() => {
  switch (props.payment.method) {
    case "STRIPE":
      return t("stripe");
    case "CASH":
      return t("cash");
    case "WOOCOMMERCE":
      return t("woocommerce_abbreviated");
    case "EFECTIVO":
      return "Efectivo";
    case "CARD":
      return t("card");
  }
});
</script>

<style scoped lang="scss"></style>

<i18n>
{
    "en":{
        "stripe":"Stripe",
        "cash":"Cash",
        "woocommerce_abbreviated":"Woocomm.",
        "oneTime":"One time",
        "subscription":"Subscription",
        "description":"Description",
        "noDescription":"No description",
        "card":"Credit card"
    },
    "es":{
        "stripe":"Stripe",
        "cash":"Datáfono",
        "woocommerce_abbreviated":"Woocomm.",
        "oneTime":"Único",
        "subscription":"Suscripción",
        "description":"Descripción",
        "noDescription":"Sin descripción",
        "card":"Tarjeta de credito"
    }
}
</i18n>
