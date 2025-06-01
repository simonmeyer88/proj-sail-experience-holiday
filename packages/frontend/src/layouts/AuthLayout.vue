<template>
  <div
    class="d-flex justify-content-center flex-row flex-column-fluid"
    style="min-height: 100dvh"
  >
    <div
      class="d-flex flex-lg-row-fluid w-lg-50 bgi-size-cover bgi-position-center d-none d-lg-flex"
      :style="`background-image:
    url('${getAssetPath('media/backgrounds/auth-bg.jpg')}')`"
    />

    <div
      class="d-flex flex-column justify-content-center p-5 p-md-10 w-100 w-lg-75 align-items-center"
    >
      <div class="d-flex flex-center w-100 w-md-75 flex-column">
        <div class="d-flex flex-center mb-8">
          <img
            alt="Logo"
            :src="getAssetPath('media/logos/anclademia-full.webp')"
            class="h-70px h-lg-80px"
          />
        </div>
        <Suspense>
          <router-view></router-view>
        </Suspense>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { getAssetPath } from "@/core/helpers/assets";
import { defineComponent, onMounted } from "vue";
import LayoutService from "@/core/services/LayoutService";
import { useBodyStore } from "@/stores/body";

export default defineComponent({
  name: "auth-layout",
  components: {},
  setup() {
    const store = useBodyStore();

    onMounted(() => {
      LayoutService.emptyElementClassesAndAttributes(document.body);

      store.addBodyClassname("app-blank");
      store.addBodyClassname("bg-body");
    });

    return {
      getAssetPath,
    };
  },
});
</script>
