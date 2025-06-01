<template>
  <!--Progress is a number-->
  <Transition name="fade">
    <div
      class="position-fixed top-0 w-100"
      style="height: 4px; z-index: 100000"
      v-if="isLoading"
    >
      <div
        class="h-100 bg-primary __progress__"
        :style="{ width: progress + '%' }"
      ></div>
    </div>
  </Transition>

  <Toaster richColors position="top-right" />
  <RouterView />
  <PwaPopup />
</template>

<style lang="scss">
.__progress__ {
  transition: width 0.0001s ease-in-out;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease-in-out;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

<script lang="ts">
import { defineComponent, nextTick, onBeforeMount, onMounted } from "vue";
import { RouterView } from "vue-router";
import { useConfigStore } from "@/stores/config";
import { useThemeStore } from "@/stores/theme";
import { useBodyStore } from "@/stores/body";
import { themeMode } from "@/core/helpers/config";
import { initializeComponents } from "@/core/plugins/keenthemes";
import { Toaster } from "vue-sonner";
import { Loader } from "@/router/progress";
import PwaPopup from "@/components/pwa-popup/PwaPopup.vue";

export default defineComponent({
  name: "app",
  components: {
    RouterView,
    Toaster,
    PwaPopup,
  },
  setup() {
    const configStore = useConfigStore();
    const themeStore = useThemeStore();
    const bodyStore = useBodyStore();

    onBeforeMount(() => {
      /**
       * Overrides the layout config using saved data from localStorage
       * remove this to use static config (@/core/config/DefaultLayoutConfig.ts)
       */
      configStore.overrideLayoutConfig();

      /**
       *  Sets a mode from configuration
       */
      themeStore.setThemeMode(themeMode.value);
    });

    onMounted(() => {
      nextTick(() => {
        initializeComponents();

        bodyStore.removeBodyClassName("page-loading");
      });
    });
    return {
      progress: Loader.current,
      isLoading: Loader.isLoading,
    };
  },
});
</script>

<style lang="scss">
@import "bootstrap-icons/font/bootstrap-icons.css";
@import "apexcharts/dist/apexcharts.css";
@import "animate.css";
@import "sweetalert2/dist/sweetalert2.css";
@import "@fortawesome/fontawesome-free/css/all.min.css";
@import "line-awesome/dist/line-awesome/css/line-awesome.css";
@import "@vueform/multiselect/themes/default.css";
@import "element-plus/dist/index.css";

// Main demo style scss
@import "assets/sass/element-ui.dark";
@import "assets/sass/plugins";
@import "assets/sass/style";
// keenicons
@import "assets/keenicons/duotone/style.css";
@import "assets/keenicons/outline/style.css";
@import "assets/keenicons/solid/style.css";
// youtube video
@import "vue-lite-youtube-embed/style.css";

#app {
  display: contents;
}
</style>
