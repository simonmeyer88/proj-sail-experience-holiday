<template>
  <div class="card" v-if="!studentStats.isLoading.value">
    <div class="card-header my-0 border-0">
      <h3 class="card-title align-items-start flex-column">
        <span class="card-label fw-bold fs-3 mb-1">
          {{ t("practiceClasses") }}
        </span>
      </h3>
    </div>
    <div
      class="card-body pt-0 flex-row d-flex align-items-center justify-content-center gap-10 me-8"
    >
      <div class="d-flex">
        <div class="d-flex flex-column align-items-center">
          <div class="fw-bold fs-2hx">
            {{ studentStats.data.value?.usersOnEventsCompleted.total }}
          </div>
          <div class="fw-semibold fs-7">
            {{ t("completed").toLowerCase() }}
          </div>
        </div>
      </div>
      <div class="d-flex flex-column justify-content-end gap-10">
        <RouterLink class="btn btn-light-success btn-sm" to="/student/calendar">
          {{ t("goToCalendar") }}
          <KTIcon icon-name="arrow-right" class="fs-2" />
        </RouterLink>
        <RouterLink class="btn btn-light-primary btn-sm" to="/student/tasks">
          {{ t("goToProgress") }}
          <KTIcon icon-name="arrow-right" class="fs-2" />
        </RouterLink>
      </div>
    </div>
  </div>
  <LoadingComponent v-else :height="290" />
</template>

<script lang="ts" setup>
import { useStudentStats } from "@/server-state";
import { useI18n } from "vue-i18n";
import KTIcon from "../ui/KTIcon.vue";
import { LoadingComponent } from "../ui";

const studentStats = useStudentStats();
const { t } = useI18n();
</script>

<i18n>
  {
    "en": {
      "goToProgress": "See detailed progress",
      "practiceClasses": "Practice classes",
      "goToCalendar": "Go to calendar",
      "completed": "Completed",
    },
    "es": {
      "practiceClasses": "Clases de práctica",
      "goToProgress": "Ver progreso detallado",
      "goToCalendar": "Ir al calendario",
      "completed": "Completadas",

    }
  }
</i18n>
