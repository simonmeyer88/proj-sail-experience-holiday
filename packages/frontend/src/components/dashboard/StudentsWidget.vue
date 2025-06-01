<template>
  <div class="card" v-if="stats.data.value">
    <div class="card-body p-0">
      <div class="px-9 pt-7 card-rounded h-150px w-100 bg-primary">
        <div class="d-flex flex-stack">
          <h3 class="m-0 text-white fw-bold fs-3">
            {{ t("usersSummary") }}
          </h3>
        </div>
      </div>
      <div
        class="bg-body shadow-sm card-rounded mx-9 mb-20 px-6 py-9 position-relative z-index-1"
        style="margin-top: -100px"
      >
        <template v-for="(item, index) in items" :key="index">
          <div
            class="d-flex align-items-center"
            :class="[index !== items.length - 1 && 'mb-4']"
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
      </div>
    </div>
  </div>
  <LoadingComponent v-else :height="290" />
</template>

<i18n>
  {
    "en": {
      "usersSummary": "Users summary",
      "signUps": "Sign ups",
      "lastWeek": "Last week",
      "lastMonth": "Last month",
      "allTime": "All time",
      "activeUsers": "Active users",
      "awaitingApprovalUsers": "Awaiting approval users",

    },
    "es": {
      "usersSummary": "Resumen de usuarios",
      "signUps": "Registrados",
      "lastWeek": "Última semana",
      "lastMonth": "Último mes",
      "allTime": "Total",
      "activeUsers": "Usuarios activos",
      "awaitingApprovalUsers": "Usuarios pendientes de aprobación",
    }
  }
</i18n>
<script lang="ts" setup>
import { useTeacherStats } from "@/server-state";
import { computed } from "vue";
import KTIcon from "../ui/KTIcon.vue";
import { useI18n } from "vue-i18n";
import { LoadingComponent } from "../ui";

const stats = useTeacherStats();
const { t } = useI18n();

const items = computed(() => [
  {
    icon: "compass",
    title: t("signUps"),
    description: t("lastWeek"),
    stats: stats.data.value?.users?.registered.lastWeek,
  },
  {
    icon: "category",
    title: t("signUps"),
    description: t("lastMonth"),
    stats: stats.data.value?.users?.registered.lastMonth,
  },
  {
    icon: "bank",
    title: t("signUps"),
    description: t("allTime"),
    stats: stats.data.value?.users?.registered.allTime,
  },
  {
    icon: "briefcase",
    title: t("activeUsers"),
    description: t("allTime"),
    stats: stats.data.value?.users.active,
  },
  {
    icon: "chart-simple",
    title: t("awaitingApprovalUsers"),
    stats: stats.data.value?.users.awaitingApproval,
  },
]);
</script>
