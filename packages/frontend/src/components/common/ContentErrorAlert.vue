<i18n>
  {
    "es": {
      "errorLoadingContent": "Ha ocurrido un error al cargar el contenido."
    },
    "en": {
      "errorLoadingContent": "An error has occurred while loading the content."
    }
  }
</i18n>

<template>
  <div class="col-12">
    <div
      class="alert alert-danger border border-dashed border-danger fs-3 d-flex align-items-center justify-content-start"
    >
      <i class="ki-duotone ki-information-5 fs-4tx text-danger me-4 shrink-0"
        ><span class="path1"></span><span class="path2"></span
        ><span class="path3"></span
      ></i>
      <div
        class="d-flex flex-wrap justify-content-start gap-2 align-items-center"
      >
        <span class="fw-bold">
          {{ t("errorLoadingContent") }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
const { t } = useI18n();
</script>
