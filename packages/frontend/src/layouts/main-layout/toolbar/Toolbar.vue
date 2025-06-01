<template>
  <div id="kt_app_toolbar" class="app-toolbar py-3 py-lg-6">
    <div
      id="kt_app_toolbar_container"
      class="app-container d-flex flex-stack"
      :class="{
        'container-fluid': toolbarWidthFluid,
        'container-xxl': !toolbarWidthFluid,
      }"
    >
      <KTPageTitle />
      <ZoomNotif />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { toolbarWidthFluid } from "@/core/helpers/config";
import KTPageTitle from "@/layouts/main-layout/toolbar/PageTitle.vue";
import ZoomNotif from "@/layouts/main-layout/toolbar/ZoomNotif.vue";
export default defineComponent({
  name: "layout-toolbar",
  components: {
    KTPageTitle,
    ZoomNotif,
  },
  setup() {
    return {
      toolbarWidthFluid,
    };
  },
});
</script>
