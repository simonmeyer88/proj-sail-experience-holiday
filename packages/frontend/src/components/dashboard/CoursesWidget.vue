<template>
  <div class="card" v-if="stats.data.value">
    <div class="card-body p-0">
      <div :class="`bg-success`" class="px-9 pt-7 card-rounded h-275px w-100">
        <div class="d-flex flex-stack">
          <h3 class="m-0 text-white fw-bold fs-3">
            {{ t("salesSummary") }}
          </h3>
        </div>
        <div class="fw-bold fs-7 text-white text-center mt-6">
          {{ t("allTime") }}
        </div>
        <div class="d-flex justify-content-center align-items-center gap-8">
          <div class="d-flex text-center flex-column text-white pt-2">
            <span class="fw-bold fs-2x pt-1">
              {{ stats.data.value.finances?.allTime?.totalRevenue / 100 }}€
            </span>
            <span class="fw-semibold fs-7">
              {{ t("revenue").toLowerCase() }}
            </span>
          </div>
          <div class="d-flex text-center flex-column text-white pt-2">
            <span class="fw-bold fs-2x pt-1">
              {{ stats.data.value.finances?.allTime.numberOfSales }}
            </span>
            <span class="fw-semibold fs-7">
              {{ t("payments").toLowerCase() }}
            </span>
          </div>
        </div>
      </div>
      <div
        class="bg-body shadow-sm card-rounded mx-9 mb-9 px-6 py-9 position-relative z-index-1"
        style="margin-top: -100px"
      >
        <template v-for="(item, index) in items" :key="index">
          <div
            :class="[index !== items.length - 1 && 'mb-8']"
            class="d-flex align-items-center"
          >
            <div class="symbol symbol-45px w-40px me-5">
              <span class="symbol-label bg-lighten">
                <KTIcon :icon-name="item.icon" icon-class="fs-1" />
              </span>
            </div>
            <div class="d-flex align-items-center w-100">
              <div class="mb-1 pe-3 flex-grow-1">
                <a
                  href="#"
                  class="fs-5 text-gray-800 text-hover-primary fw-bold"
                  >{{ item.title }}</a
                >
                <div class="text-gray-400 fw-semobold fs-7">
                  {{ item.description }}
                </div>
              </div>
              <div class="d-flex align-items-center">
                <div class="fw-bold fs-5 text-gray-800 pe-1">
                  {{ item.stats }}
                </div>
                <KTIcon icon-name="check" icon-class="fs-5 text-success ms-1" />
              </div>
            </div>
          </div>
        </template>

        <div class="pt-10">
          <h3 class="m-0 fw-bold fs-4 mb-4">
            {{ t("perCourse") }}
          </h3>
          <ElScrollbar always :height="280">
            <div class="d-flex flex-column gap-7">
              <div
                class="d-flex align-items-center"
                v-for="course in stats.data.value.finances?.perCourse || []"
                :key="course.id"
              >
                <div class="symbol symbol-45px w-40px me-5">
                  <span class="symbol-label bg-lighten">
                    <KTIcon icon-name="compass" icon-class="fs-1" />
                  </span>
                </div>
                <div class="d-flex align-items-center w-100">
                  <div class="mb-1 pe-3 flex-grow-1">
                    <a
                      href="#"
                      class="fs-5 text-gray-800 text-hover-primary fw-bold"
                      >{{ course.name }}</a
                    >
                  </div>
                  <div class="d-flex flex-column align-items-center gap-1">
                    <div class="fw-semibold fs-6 text-gray-800 pe-1">
                      {{ course.numberOfSales }}
                      {{ t("payments").toLowerCase() }}
                    </div>
                    <div class="fw-semibold fs-6 text-gray-800 pe-1">
                      {{ course.totalRevenue / 100 }}€
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ElScrollbar>
        </div>
      </div>
    </div>
  </div>
  <LoadingComponent v-else :height="290" />
</template>

<i18n>
  {
    "en": {
      "sales": "Sales",
      "salesSummary": "Sales Summary",
      "perCourse": "Per Course",
      "youBalance": "You Balance",
      "payments": "Payments",
      "allTime": "All Time",
      "lastMonth": "Last Month",
      "lastWeek": "Last Week",
      "revenue": "Revenue",
      "total": "Total",
    },
    "es": {
      "sales": "Ventas",
      "salesSummary": "Resumen de ventas",
      "perCourse": "Por curso",
      "youBalance": "Tu saldo",
      "payments": "Pagos",
      "allTime": "Desde siempre",
      "lastMonth": "Último mes",
      "lastWeek": "Última semana",
      "revenue": "Ingresos",
      "growth": "Crecimiento",
      "dispute": "Disputa",
      "total": "Total",
    }
  }
</i18n>
<script lang="ts" setup>
import { useAdminStats } from "@/server-state";
import { computed } from "vue";
import KTIcon from "../ui/KTIcon.vue";
import { useI18n } from "vue-i18n";
import { ElScrollbar } from "element-plus";
import { LoadingComponent } from "../ui";

const stats = useAdminStats();
const { t } = useI18n();

const items = computed(() => [
  {
    icon: "compass",
    title: t("payments"),
    description: t("lastWeek"),
    stats: stats.data.value?.finances?.lastWeek.numberOfSales,
  },
  {
    icon: "category",
    title: t("revenue"),
    description: t("lastWeek"),
    stats: (stats.data.value?.finances?.lastWeek.totalRevenue || 0) / 100 + "€",
  },
  {
    icon: "compass",
    title: t("payments"),
    description: t("lastMonth"),
    stats: stats.data.value?.finances?.lastMonth.numberOfSales,
  },
  {
    icon: "rocket",
    title: t("revenue"),
    description: t("lastMonth"),
    stats:
      (stats.data.value?.finances?.lastMonth.totalRevenue || 0) / 100 + "€",
  },
]);
</script>
