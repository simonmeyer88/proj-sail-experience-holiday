<template>
  <div
    data-testid="pending-task-card"
    class="border border-danger px-4 py-3 bg-light-danger shadow-sm"
    style="border-radius: 6px"
  >
    <div class="d-flex align-items-center gap-0">
      <h3 class="card-title mb-0 fs-2">{{ title }}</h3>

      <ElTooltip
        effect="dark"
        :content="t('markAsComplete')"
        placement="top"
        :open-delay="1000"
      >
        <i
          data-testid="mark-as-completed"
          class="ki-duotone ki-archive-tick fs-2hx text-success ms-auto cursor-pointer"
          v-if="
            me.data.value?.role === 'ADMIN' || me.data.value?.role === 'TEACHER'
          "
          @click="emit('markAsCompleted')"
        >
          <i class="path1"></i>
          <i class="path2"></i>
        </i>
      </ElTooltip>
      <ElTooltip
        effect="dark"
        :content="t('goToCalendar')"
        placement="top"
        :open-delay="1000"
      >
        <RouterLink
          :to="{
            name:
              me.data.value?.role === 'STUDENT'
                ? 'student.calendar'
                : 'management.calendar',
          }"
          class="d-flex align-items-center justify-content-center ms-1"
        >
          <i
            class="ki-duotone ki-calendar-add text-danger fs-2hx cursor-pointer"
          >
            <i class="path1"></i>
            <i class="path2"></i>
            <i class="path3"></i>
            <i class="path4"></i>
            <i class="path5"></i>
            <i class="path6"></i>
          </i>
        </RouterLink>
      </ElTooltip>
    </div>
  </div>
</template>
<i18n>
  {
    "en": {
      "markAsComplete": "Mark as complete",
      "goToCalendar": "Go to calendar"
    },
    "es": {
      "markAsComplete": "Marcar como completado",
      "goToCalendar": "Ir al calendario"
    }
  }
</i18n>

<script lang="ts" setup>
import { useMe } from "@/server-state";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
defineProps<{
  title: string;
}>();

const me = useMe();

const emit = defineEmits({
  markAsCompleted: () => true,
});
</script>
