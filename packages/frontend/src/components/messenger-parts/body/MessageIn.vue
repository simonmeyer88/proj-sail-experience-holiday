<template>
  <div class="d-flex justify-content-start mb-10" data-message-el>
    <div class="d-flex flex-column align-items-start">
      <div class="d-flex align-items-center mb-2">
        <div class="symbol symbol-35px symbol-circle">
          <BaseImage alt="Pic" :src="image" />
        </div>
        <div class="ms-3">
          <a
            href="#"
            class="fs-5 fw-bold text-gray-900 text-hover-primary me-1"
            >{{ name }}</a
          >
          <span class="text-muted fs-7 mb-1">{{
            moment(time).format("DD/MM/YYYY HH:mm")
          }}</span>
        </div>
      </div>
      <div
        class="p-5 rounded text-dark fw-semobold mw-lg-400px text-end"
        :class="{
          'bg-light-danger': deletedAt,
          'bg-light-primary': !deletedAt,
        }"
      >
        <span v-if="!deletedAt">
          {{ text }}
        </span>

        <span v-else style="font-style: italic">
          {{ t("hasBeenDeleted") }}
        </span>
      </div>
    </div>
  </div>
</template>

<i18n>
{
  "en": {
    "delete": "Delete",
    "hasBeenDeleted": "This message has been deleted",
  },
  "es": {
    "delete": "Borrar",
    "hasBeenDeleted": "Este mensaje ha sido borrado",
  },
}
</i18n>

<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import moment from "moment-timezone";
import BaseImage from "@/components/common/BaseImage.vue";

const { t } = useI18n();

defineProps<{
  name: string;
  image: string;
  text: string;
  time: Date;
  id: string;
  deletedAt?: Date | string | null;
}>();
</script>
