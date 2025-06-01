<template>
  <!--begin::App-->
  <div
    class="d-flex flex-column flex-root app-root h-100"
    id="kt_app_root"
    style="max-width: 100%; overflow-x: hidden"
  >
    <!--begin::Page-->
    <div class="app-page flex-column flex-column-fluid h-100" id="kt_app_page">
      <KTHeader />
      <!--begin::Wrapper-->
      <div
        class="app-wrapper flex-column flex-row-fluid h-100"
        id="kt_app_wrapper"
      >
        <KTSidebar />
        <!--begin::Main-->
        <div
          class="app-main flex-column flex-row-fluid h-100 container-xxl"
          id="kt_app_main"
        >
          <!--begin::Content wrapper-->
          <div class="d-flex flex-column flex-column-fluid h-100">
            <KTToolbar />
            <div
              id="kt_app_content"
              class="app-content flex-column-fluid"
              style="height: calc(100vh - var(--kt-toolbar-height))"
            >
              <KTContent></KTContent>
            </div>
          </div>
          <!--end::Content wrapper-->
        </div>
        <!--end:::Main-->
      </div>
      <!--end::Wrapper-->
    </div>
    <!--end::Page-->
  </div>
  <!--end::App-->

  <KTScrollTop />
</template>

<script lang="ts">
import {
  defineComponent,
  nextTick,
  onBeforeMount,
  onMounted,
  watch,
} from "vue";
import KTHeader from "@/layouts/main-layout/header/Header.vue";
import KTSidebar from "@/layouts/main-layout/sidebar/Sidebar.vue";
import KTContent from "@/layouts/main-layout/content/Content.vue";
import KTToolbar from "@/layouts/main-layout/toolbar/Toolbar.vue";
import KTScrollTop from "@/layouts/main-layout/extras/ScrollTop.vue";
import { useRoute } from "vue-router";
import { reinitializeComponents } from "@/core/plugins/keenthemes";
import LayoutService from "@/core/services/LayoutService";

export default defineComponent({
  name: "default-layout",
  components: {
    KTHeader,
    KTSidebar,
    KTContent,
    KTToolbar,
    KTScrollTop,
  },
  setup() {
    const route = useRoute();

    onBeforeMount(() => {
      LayoutService.init();
    });

    onMounted(() => {
      nextTick(() => {
        reinitializeComponents();
      });
    });

    watch(
      () => route.path,
      () => {
        nextTick(() => {
          reinitializeComponents();
        });
      }
    );
  },
});
</script>
