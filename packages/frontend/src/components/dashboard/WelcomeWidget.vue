<template>
  <div class="card" v-if="!me.isLoading.value">
    <div class="card-header my-0 border-0">
      <h3 class="card-title align-items-start flex-column">
        <span class="card-label fw-bold fs-3 mb-1">
          {{ t("welcome") }} {{ me.data.value?.firstName }}
          {{ me.data.value?.lastName }}
        </span>
      </h3>
    </div>
    <div class="card-body pt-0 gap-10 me-8 d-flex justify-content-center w-100">
      <img
        :src="getAssetPath('media/illustrations/dozzy/1.png')"
        style="height: 250px"
      />
    </div>
  </div>
  <LoadingComponent v-else :height="290" />
</template>

<script lang="ts" setup>
import { useMe } from "@/server-state";
import { useI18n } from "vue-i18n";
import { getAssetPath } from "@/core/helpers/assets";
import { LoadingComponent } from "../ui";

const { t } = useI18n();
const me = useMe();
</script>

<i18n>
  {
    "en": {
      "welcome": "Welcome",
    },
    "es": {
      "welcome": "Bienvenido,",
    }
  }
</i18n>
