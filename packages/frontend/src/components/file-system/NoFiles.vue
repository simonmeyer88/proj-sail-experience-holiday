<template>
  <div
    class="alert alert-warning d-flex justify-content-center"
    role="alert"
    data-testid="no-files-alert"
  >
    <span class="fw-bold fs-3">{{ t("empty") }}</span>
  </div>
</template>

<i18n>
{
  "en": {
      "empty": "No files found"
    
  },
  "es": {
      "empty": "No se encontraron archivos"
    
  }
}
</i18n>

<script lang="ts" setup>
import { useI18n } from "vue-i18n";
const { t } = useI18n();
</script>
