<template>
  <div class="d-flex flex-column flex-center flex-column-fluid">
    <img
      :src="getAssetPath('media/patterns/pattern-1.jpg')"
      style="
        height: 100%;
        width: 100%;
        object-fit: cover;
        position: absolute;
        top: 0;
        left: 0;
      "
      alt=""
    />
    <div class="d-flex flex-column flex-center text-center p-10">
      <div class="card card-flush w-lg-650px py-5">
        <div class="card-body py-15 py-lg-20">
          <h1 class="fw-bolder fs-2hx text-gray-900 mb-4">
            {{ t("notFound.title") }}
          </h1>
          <div class="fw-semibold fs-6 text-gray-500 mb-7">
            {{ t("notFound.subtitle") }}
          </div>
          <div class="mb-3"></div>
          <div class="mb-0">
            <router-link to="/" class="btn btn-sm btn-primary">
              {{ t("notFound.returnHome") }}
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import { getAssetPath } from "@/core/helpers/assets";

const { t } = useI18n();
</script>

<i18n>
{
  "en": {
    "notFound": {
      "title": "Oops!",
      "subtitle": "We can't find that page.",
      "returnHome": "Return Home"
    }
  },
  "es": {
    "notFound": {
      "title": "¡Ups!",
      "subtitle": "No podemos encontrar esa página.",
      "returnHome": "Volver a la página de inicio"
    }
  }
}
</i18n>
