<template>
  <div
    class="mx-auto alert bg-light-warning d-flex flex-center flex-column py-10 px-10 px-lg-20"
  >
    <i class="ki-duotone ki-information-5 fs-5tx text-warning mb-5"
      ><span class="path1"></span><span class="path2"></span
      ><span class="path3"></span
    ></i>

    <div class="text-center">
      <h1 class="fw-bold mb-5">
        {{ t("greetings") }}, {{ me.data?.value?.firstName }}
        {{ me.data?.value?.lastName }}
      </h1>

      <div
        class="separator separator-dashed border-danger opacity-25 mb-5"
      ></div>
      <div class="mb-9 text-dark fs-4">
        {{ t("registrationSuccess") }} <strong>{{ t(role || "") }} </strong>.
        {{ t("reviewNotification") }}
        <span class="fw-bold">{{ me.data?.value?.email }}</span>
        {{ t("accountActive") }}
      </div>
      <div class="d-flex flex-center flex-wrap">
        <button class="btn btn-warning me-2" @click="logout">
          {{ t("logout") }}
        </button>
      </div>
    </div>
  </div>
</template>

<i18n>
{
  "es": {
    "greetings": "Buenas",
    "role": "alumno",
    "registrationSuccess": "El proceso de registro se ha completado con éxito. Te estás registrando como",
    "reviewNotification": "El equipo de Anclademia revisará tu solicitud y se te notificará a tu correo",
    "accountActive": "cuando tu cuenta esté activa.",
    "logout": "Cerrar sesión",
    "AWAITINGTEACHER": "profesor",
    "AWAITINGSTUDENT": "alumno",
  },
  "en": {
    "greetings": "Hello",
    "role": "student",
    "registrationSuccess": "Registration process has been completed successfully. You are registering as",
    "reviewNotification": "Anclademia team will review your application and notify you at your email",
    "accountActive": "when your account is active.",
    "logout": "Logout",
    "AWAITINGTEACHER": "teacher",
    "AWAITINGSTUDENT": "student",
  }
}
</i18n>

<script lang="ts" setup>
import AuthService from "@/core/services/AuthService";
import { useMe } from "@/server-state";
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const me = useMe();
const { t } = useI18n();

const role = computed(() => me.data?.value?.role);

const logout = async () => {
  await AuthService.logout();
  window.location.reload();
};
</script>
