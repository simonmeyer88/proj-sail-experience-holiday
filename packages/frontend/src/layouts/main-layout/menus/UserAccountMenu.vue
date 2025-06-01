<i18n>
  {
    "en": {
      "myProfile": "My Profile",
      "signOut": "Sign Out",
      "language": "Language",
      "TEACHER": "Teacher",
      "STUDENT": "Student",
      "ADMIN": "Admin",
    },
    "es": {
      "myProfile": "Mi perfil",
      "signOut": "Cerrar sesión",
      "language": "Idioma",
      "TEACHER": "Profesor",
      "STUDENT": "Estudiante",
      "ADMIN": "Admin",
    }
  }
</i18n>
<template>
  <div
    class="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-semobold py-4 fs-6 w-275px"
    data-kt-menu="true"
  >
    <div class="menu-item px-3">
      <div class="menu-content d-flex align-items-center px-3">
        <div class="symbol symbol-50px me-5 border">
          <BaseImage :src="me.data.value?.pictureUrl" alt="Logo" />
        </div>
        <div class="d-flex flex-column" v-if="me.data.value">
          <div class="fw-bold d-flex align-items-center fs-5">
            {{ me.data.value.firstName }} {{ me.data.value.lastName }}
            <span
              class="badge badge-light-success fw-bold fs-8 px-2 py-1 ms-2"
              >{{ t(me.data.value.role) }}</span
            >
          </div>
          <a href="#" class="fw-semobold text-muted text-hover-primary fs-7">{{
            me.data.value.email
          }}</a>
        </div>
      </div>
    </div>
    <div class="separator my-2"></div>
    <div class="menu-item px-5">
      <router-link to="/profile" class="menu-link px-5">
        {{ t("myProfile") }}
      </router-link>
    </div>
    <div class="separator my-2"></div>
    <div
      class="menu-item px-5"
      data-kt-menu-trigger="hover"
      data-kt-menu-placement="bottom-start"
      data-kt-menu-flip="center, top"
    >
      <div class="menu-link px-5">
        <span class="menu-title position-relative">
          {{ t("language") }}
          <span
            class="fs-8 rounded bg-light px-3 py-2 position-absolute translate-middle-y top-50 end-0"
          >
            {{ currentLangugeLocale.name }}
            <img
              class="w-15px h-15px rounded-1 ms-2"
              :src="currentLangugeLocale.flag"
              alt="metronic"
            />
          </span>
        </span>
      </div>
      <div class="menu-sub menu-sub-dropdown w-175px py-4">
        <div class="menu-item px-3">
          <span
            @click="handleSetLang('en')"
            href="#"
            class="menu-link d-flex px-5"
            :class="{ active: currentLanguage === 'en' }"
          >
            <span class="symbol symbol-20px me-4">
              <img
                class="rounded-1"
                :src="getAssetPath('media/flags/united-states.svg')"
                alt="metronic"
              />
            </span>
            English
          </span>
        </div>
        <div class="menu-item px-3">
          <span
            @click="handleSetLang('es')"
            href="#"
            class="menu-link d-flex px-5"
            :class="{ active: currentLanguage === 'es' }"
          >
            <span class="symbol symbol-20px me-4">
              <img
                class="rounded-1"
                :src="getAssetPath('media/flags/spain.svg')"
                alt="metronic"
              />
            </span>
            Español
          </span>
        </div>
      </div>
    </div>
    <div class="menu-item px-5">
      <a @click="signOut()" class="menu-link px-5">
        {{ t("signOut") }}
      </a>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { getAssetPath } from "@/core/helpers/assets";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useMe } from "@/server-state";
import AuthService from "@/core/services/AuthService";
import BaseImage from "@/components/common/BaseImage.vue";

const i18n = useI18n();

const t = computed(() => i18n.t);

const me = useMe();

const countries = {
  en: {
    flag: getAssetPath("media/flags/united-states.svg"),
    name: "English",
  },
  es: {
    flag: getAssetPath("media/flags/spain.svg"),
    name: "Español",
  },
};

const signOut = async () => {
  await AuthService.logout();
  location.reload();
};

const handleSetLang = (lang: string) => {
  localStorage.setItem("lang", lang);
  i18n.locale.value = lang;
  window.location.reload();
};

const currentLanguage = computed(() => {
  return i18n.locale.value;
});

const currentLangugeLocale = computed(() => {
  return countries[i18n.locale.value as keyof typeof countries];
});
</script>
