<i18n>
    {
      "en":{
        "payments": "Payments",
        "oneTimePayment": "One time payment of ",
        "subscriptionPayment": "Subscription payment of ",
        "oneTime": "One time",
        "subscription": "Subscription",
        "noPayments": "No payments yet"
      },
      "es":{
        "payments": "Pagos",
        "oneTimePayment": "Pago único de ",
        "subscriptionPayment": "Pago de suscripción de ",
        "oneTime": "Pago único",
        "subscription": "Suscripción",
        "noPayments": "Aún no hay pagos"

      }
    }
</i18n>
<template>
  <div class="card" v-if="!studentStats.isLoading.value">
    <div class="card-header border-0">
      <h3 class="card-title fw-bold text-dark">
        {{ t("payments") }}
      </h3>
    </div>
    <div class="card-body pt-2">
      <ElScrollbar :height="240">
        <div v-if="list.length === 0" class="text-center">
          <span class="text-muted fw-bold fs-6">
            {{ t("noPayments") }}
          </span>
        </div>
        <template v-for="(item, index) in list" :key="index">
          <div
            :class="{ 'mb-6': list.length - 1 !== index }"
            class="d-flex align-items-center"
          >
            <span
              class="bullet bullet-vertical h-40px me-5"
              :class="`bg-${item.color}`"
            ></span>
            <div class="flex-grow-1">
              <a
                href="#"
                class="text-gray-800 text-hover-primary fw-bold fs-6"
                >{{ item.title }}</a
              >

              <span class="text-muted fw-semobold d-block">{{
                item.text
              }}</span>
            </div>

            <span
              class="badge fs-8 fw-bold"
              :class="`badge-light-${item.color}`"
            >
              {{ item.label }}</span
            >
          </div>
        </template>
      </ElScrollbar>
    </div>
  </div>
  <LoadingComponent :height="290" v-else />
</template>

<script lang="ts" setup>
import { useStudentStats } from "@/server-state";
import { ElScrollbar } from "element-plus";
import moment from "moment-timezone";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { LoadingComponent } from "../ui";

const { t } = useI18n();
const studentStats = useStudentStats();

const list = computed(() => {
  return (
    (studentStats.data.value?.payments || []).map((item) => {
      return {
        title:
          (item.isSubscription
            ? t("subscriptionPayment")
            : t("oneTimePayment")) +
          item.amount / 100 +
          "€",
        text: moment(item.date).format("DD/MM/YYYY"),
        color: item.isSubscription ? "primary" : "success",
        label: item.isSubscription ? t("subscription") : t("oneTime"),
      };
    }) || []
  );
});
</script>
