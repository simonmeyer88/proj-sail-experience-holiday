<script lang="ts" setup>
import { ref } from "vue";
import { Form } from "vee-validate";
import AuthService from "@/core/services/AuthService";
import { useRouter } from "vue-router";
import { ApiError } from "@/core/services/ApiService";
import { loginSchema } from "@/validation-schemas/auth";
import { InputGroup, LoadableButton } from "@/components/form";
import { getSubmitFn } from "@/util/form";
import { alertError } from "@/util/alert";
import { useI18n } from "vue-i18n";

const router = useRouter();
const isLoggingIn = ref(false);
const { t } = useI18n();
const onSubmitLogin = getSubmitFn(loginSchema, async (values) => {
  isLoggingIn.value = true;
  values;
  try {
    await AuthService.logout();
    await AuthService.login(values);
    // wait 200ms so browser can set cookies
    await new Promise((resolve) => setTimeout(resolve, 200));

    await router.push({ name: "dashboard" });
  } catch (error: any) {
    if (error instanceof ApiError) {
      alertError({
        title: error.message,
        confirmButtonText: t("tryAgain"),
      });
    } else {
      alertError({
        title: "Something went wrong!",
        confirmButtonText: t("tryAgain"),
      });
    }
  } finally {
    isLoggingIn.value = false;
  }
});
</script>

<template>
  <div class="text-center mb-10">
    <h1 class="text-dark mb-3">
      {{ t("welcome") }}
    </h1>
    <div class="text-gray-400 fw-semibold fs-4">
      {{ t("newHere") }}
      <router-link
        :to="{
          name: 'auth.sign-up',
        }"
        class="link-primary fw-bold"
        data-testid="sign-up-link"
      >
        {{ t("signUp") }}
      </router-link>
    </div>
  </div>
  <Form
    class="w-100 card mw-450px p-6"
    @submit="onSubmitLogin"
    :validation-schema="loginSchema"
  >
    <div class="">
      <InputGroup :label="t('emailLabel')" name="email" type="text" />
      <InputGroup :label="t('passwordLabel')" name="password" type="password" />

      <div
        class="d-flex align-items-center flex-column flex-sm-row justify-content-center gap-4"
      >
        <LoadableButton
          :default-text="t('signIn')"
          color="primary"
          submit
          :loading="isLoggingIn"
        />
        <router-link
          to="/auth/password-reset"
          data-testid="forgot-password-link"
          class="link-primary fs-6 fw-bold"
        >
          {{ t("forgotPassword") }}
        </router-link>
      </div>
    </div>
  </Form>
</template>

<i18n>
  { 
    "en":{
      "tryAgain": "Try again!",
      "welcome": "Welcome to Anclademia's virtual classroom!",
      "newHere": "New here?",
      "signUp": "Sign up here!",
      "signIn": "Sign in",
      "emailLabel": "Email",
      "passwordLabel": "Password",
      "forgotPassword": "Forgot password?"
    },
    "es": {
      "tryAgain": "¡Inténtalo de nuevo!",
      "welcome":"¡Bienvenido al aula virtual de Anclademia!",
      "newHere": "¿Nuevo aquí?",
      "signUp": "¡Regístrate aquí!",
      "signIn": "Iniciar sesión",
      "emailLabel": "Correo electrónico",
      "passwordLabel": "Contraseña",
      "forgotPassword": "¿Olvidaste tu contraseña?"
    }
  }
</i18n>
