<template>
  <div class="alert alert-warning" style="max-width: fit-content">
    {{ t("noPendingTasks") }}
  </div>
</template>
<i18n>
  {
    "es": {
      "noPendingTasks": "Sin tareas pendientes"
    },
    "en": {
      "noPendingTasks": "No pending tasks"
    }
  }
</i18n>
<script lang="ts" setup>
import { useI18n } from "vue-i18n";
const { t } = useI18n();
</script>
