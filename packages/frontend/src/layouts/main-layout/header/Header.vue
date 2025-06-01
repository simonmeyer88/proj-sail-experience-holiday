<template>
  <!--begin::Header-->
  <div id="kt_app_header" v-if="headerDisplay" class="app-header">
    <!--begin::Header container-->
    <div
      class="app-container d-flex align-items-stretch justify-content-between"
      :class="{
        'container-fluid': headerWidthFluid,
        'container-xxl': !headerWidthFluid,
      }"
    >
      <div
        v-if="layout === 'light-header' || layout === 'dark-header'"
        class="d-flex align-items-center flex-grow-1 flex-lg-grow-0 me-lg-15"
      >
        <router-link to="/">
          <img
            v-if="themeMode === 'light' && layout === 'light-header'"
            alt="Logo"
            :src="getAssetPath('media/logos/default.svg')"
            class="h-20px h-lg-30px app-sidebar-logo-default theme-light-show"
          />
          <img
            v-if="
              layout === 'dark-header' ||
              (themeMode === 'dark' && layout === 'light-header')
            "
            alt="Logo"
            :src="getAssetPath('media/logos/default-dark.svg')"
            class="h-20px h-lg-30px app-sidebar-logo-default theme-dark-show"
          />
        </router-link>
      </div>
      <template v-else>
        <!--begin::sidebar mobile toggle-->
        <div
          class="d-flex align-items-center d-lg-none ms-n3 me-1 me-md-2"
          v-tooltip
        >
          <div
            class="btn btn-icon btn-active-color-primary w-35px h-35px"
            id="kt_app_sidebar_mobile_toggle"
          >
            <span class="svg-icon svg-icon-2 svg-icon-md-1">
              <inline-svg :src="getAssetPath('media/icons/hamburger.svg')" />
            </span>
          </div>
        </div>
        <!--end::sidebar mobile toggle-->
        <!--begin::Mobile logo-->
        <div class="d-flex align-items-center flex-grow-1 flex-lg-grow-0">
          <router-link to="/" class="d-lg-none">
            <!-- Mobile logo content -->
          </router-link>
        </div>
        <!--end::Mobile logo-->
      </template>
      <div
        class="d-flex align-items-center justify-content-end flex-lg-grow-1 align-items-center"
        id="kt_app_header_wrapper"
      >
        <div class="app-navbar-item ms-1 ms-md-4" @click="router.push('/chat')">
          <div
            class="btn btn-icon btn-custom btn-icon-muted btn-active-light btn-active-color-primary w-35px h-35px position-relative"
            id="kt_drawer_chat_toggle"
          >
            <i class="ki-solid ki-message-text-2 fs-1"></i
            ><span
              v-if="chatStore.hasAnyUnreadMessages"
              class="bullet bullet-dot bg-success h-6px w-6px position-absolute translate-middle top-0 start-50 animation-blink"
            ></span>
          </div>
        </div>
        <KTHeaderNavbar />
      </div>
      <!--end::Header wrapper-->
    </div>
    <!--end::Header container-->
  </div>
  <!--end::Header-->
</template>

<script setup lang="ts">
import { getAssetPath } from "@/core/helpers/assets";
import KTHeaderNavbar from "@/layouts/main-layout/header/Navbar.vue";
import {
  layout,
  headerWidthFluid,
  themeMode,
  headerDisplay,
} from "@/core/helpers/config";
import { useChatStore } from "@/stores/chat";
import { useRouter } from "vue-router";

const router = useRouter();
const chatStore = useChatStore();
</script>
