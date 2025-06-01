<template>
  <!--begin::Navbar-->
  <div class="app-navbar flex-shrink-0">
    <!--begin::Search-->

    <!--begin::User menu-->
    <div class="app-navbar-item ms-1 ms-md-3" id="kt_header_user_menu_toggle">
      <!--begin::Menu wrapper-->
      <div
        class="cursor-pointer symbol symbol-30px symbol-md-40px border-secondary border"
        data-kt-menu-trigger="click"
        data-kt-menu-attach="parent"
        data-kt-menu-placement="bottom-end"
        data-cy="prof-pic"
      >
        <BaseImage alt="user" :src="me.data.value?.pictureUrl" />
      </div>
      <KTUserMenu />
      <!--end::Menu wrapper-->
    </div>
    <!--end::User menu-->
  </div>
  <!--end::Navbar-->
</template>

<script lang="ts">
import { getAssetPath } from "@/core/helpers/assets";
import { defineComponent, computed } from "vue";
import KTUserMenu from "@/layouts/main-layout/menus/UserAccountMenu.vue";

import { useThemeStore } from "@/stores/theme";
import { useMe } from "@/server-state";
import BaseImage from "@/components/common/BaseImage.vue";

export default defineComponent({
  name: "header-navbar",
  components: {
    BaseImage,
    KTUserMenu,
  },
  setup() {
    const me = useMe();
    const store = useThemeStore();

    const themeMode = computed(() => {
      return store.mode;
    });

    return {
      themeMode,
      getAssetPath,
      me,
    };
  },
});
</script>
