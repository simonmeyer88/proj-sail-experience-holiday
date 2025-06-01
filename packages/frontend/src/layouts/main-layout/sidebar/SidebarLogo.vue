<template>
  <!--begin::Logo-->
  <div class="app-sidebar-logo px-3 py-3 bg-white" id="kt_app_sidebar_logo">
    <!--begin::Logo image-->
    <router-link
      to="/"
      class="d-flex justify-content-start gap-4 align-items-center w-100"
    >
      <img
        alt="Logo"
        :src="getAssetPath('media/logos/anclademia-full.webp')"
        class="h-50px md-h-60px app-sidebar-logo-default"
      />
    </router-link>
  </div>
</template>

<script lang="ts">
import { getAssetPath } from "@/core/helpers/assets";
import { defineComponent } from "vue";
import { layout, themeMode } from "@/core/helpers/config";
import { sidebarToggleDisplay } from "@/core/helpers/config";

export default defineComponent({
  name: "sidebar-logo",
  components: {},
  setup() {
    return {
      layout,
      themeMode,
      sidebarToggleDisplay,
      getAssetPath,
    };
  },
});
</script>
