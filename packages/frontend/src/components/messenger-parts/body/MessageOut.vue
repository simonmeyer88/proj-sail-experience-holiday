<template>
  <div class="d-flex justify-content-end mb-10" data-message-el>
    <div class="d-flex flex-column align-items-end">
      <div class="d-flex align-items-center mb-2">
        <div class="me-3 d-flex align-items-center">
          <i
            v-if="!deletedAt && !isAboutToDelete"
            class="ki-duotone ki-trash-square fs-2x text-danger me-2 cursor-pointer"
            @click="isAboutToDelete = true"
          >
            <i class="path1"></i>
            <i class="path2"></i>
            <i class="path3"></i>
            <i class="path4"></i>
          </i>

          <div v-if="isAboutToDelete" class="d-flex align-items-center fw-bold">
            {{ t("delete") }}
            <i
              class="ki-solid ki-check fs-2x text-success ms-2 cursor-pointer"
              @click="handleDelete"
            >
              <i class="path1"></i>
              <i class="path2"></i>
            </i>
            <i
              class="ki-solid ki-cross fs-2x text-danger cursor-pointer"
              @click="isAboutToDelete = false"
            >
            </i>
          </div>
          <span class="text-muted fs-7">
            {{ moment(time).format("DD/MM/YY HH:mm") }}
          </span>
          <a
            href="#"
            class="fs-5 fw-bold text-gray-900 text-hover-primary ms-1"
            >{{ name }}</a
          >
        </div>
        <div class="symbol symbol-35px symbol-circle">
          <BaseImage alt="Pic" :src="image" />
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
import moment from "moment-timezone";
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import BaseImage from "@/components/common/BaseImage.vue";

const { t } = useI18n();
const props = defineProps<{
  name: string;
  image: string;
  text: string;
  time: Date;
  id: string;
  deletedAt?: Date | string | null;
}>();

const emit = defineEmits(["delete"]);

const handleDelete = () => {
  emit("delete", props.id);
  isAboutToDelete.value = false;
};

const isAboutToDelete = ref(false);
</script>
