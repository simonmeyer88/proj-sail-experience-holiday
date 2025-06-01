<i18n>
  {
    "es": {
      "askForEmail": "¿Olvidaste tu contraseña?",
      "sendEmail": "Enviar correo electrónico",
      "token": "Código de verificación",
      "emailSent": "Se ha enviado un correo electrónico con un código de verificación. Por favor, revisa tu bandeja de entrada, y rellena el campo correspondiente.",
      "resendEmail": "Reenviar correo electrónico",
      "newPassword": "Nueva contraseña",
      "confirmNewPassword": "Confirmar nueva contraseña",
      "changePassword": "Cambiar contraseña",
      "passwordChanged": "Contraseña cambiada correctamente.",
      "emailOrTokenIncorrect": "Correo electrónico o código incorrectos.",
      "errorSendingEmail": "No se ha podido enviar el correo electrónico con el código de verificación.",
    },
    "en": {
      "askForEmail": "Forgot your password?",
      "sendEmail": "Send email",
      "token": "Verification code",
      "emailSent": "An email with a verification code has been sent. Please, check your inbox and fill the corresponding field.",
      "resendEmail": "Resend email",
      "newPassword": "New password",
      "confirmNewPassword": "Confirm new password",
      "changePassword": "Change password",
      "passwordChanged": "Password changed successfully.",
      "emailOrTokenIncorrect": "Email or code incorrect.",
      "errorSendingEmail": "An error occurred while sending the email with the verification code.",
    }
  }
</i18n>
<template>
  <Form
    v-if="currentStep === Steps.ASK_FOR_EMAIL"
    :validation-schema="requestPasswordTokenSchema"
    @submit="handleRequestPasswordToken"
    class="w-100 card mw-450px p-6"
  >
    <span class="fs-3 fw-bold">
      {{ t("askForEmail") }}
    </span>
    <InputGroup :label="t('email')" name="email" type="text" />
    <LoadableButton
      submit
      color="primary"
      :default-text="t('sendEmail')"
      :loading="false"
    />
  </Form>
  <Form
    v-else
    :validation-schema="changeForgottenPasswordSchema"
    @submit="handleChangeForgottenPassword"
    :initial-values="{ email: emailRef }"
    class="w-100 card mw-450px p-6"
  >
    <span
      class="alert alert-success fw-bold fs-6"
      data-testid="email-sent-alert"
    >
      {{ t("emailSent") }}

      <button
        data-testid="resend-email-btn"
        type="button"
        class="btn btn-primary btn-sm fs-7 d-block mt-3"
        @click.stop="handleRequestPasswordToken({ email: emailRef })"
      >
        {{ t("resendEmail") }}
      </button>
    </span>
    <InputGroup :label="t('email')" name="email" type="text" disabled />
    <InputGroup :label="t('token')" name="token" type="text" />
    <InputGroup :label="t('newPassword')" name="newPassword" type="password" />
    <InputGroup
      :label="t('confirmNewPassword')"
      name="confirmNewPassword"
      type="password"
    />
    <LoadableButton
      submit
      color="primary"
      :default-text="t('changePassword')"
      :loading="false"
    />
  </Form>
</template>

<script lang="ts" setup>
import { InputGroup, LoadableButton } from "@/components/form";
import { Form } from "vee-validate";
import { ref } from "vue";
import {
  requestPasswordTokenSchema,
  changeForgottenPasswordSchema,
} from "@/validation-schemas/auth";
import {
  useRequestPasswordToken,
  useChangeForgottenPassword,
} from "@/server-state";
import { getSubmitFn } from "@/util/form";
import { toastError, toastSuccess } from "@/util/toast";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

enum Steps {
  ASK_FOR_EMAIL,
  EMAIL_SENT,
}
const requestPasswordToken = useRequestPasswordToken();
const changeForgottenPassword = useChangeForgottenPassword();
const currentStep = ref(Steps.ASK_FOR_EMAIL);
const router = useRouter();
const emailRef = ref("");

const handleRequestPasswordToken = getSubmitFn(
  requestPasswordTokenSchema,
  async (values) => {
    const { email } = values;
    requestPasswordToken.mutate(
      { email },
      {
        onSuccess: () => {
          currentStep.value = Steps.EMAIL_SENT;
          emailRef.value = email;
        },
        onError: () => {
          toastError(t("errorSendingEmail"));
        },
      }
    );
  }
);

const handleChangeForgottenPassword = getSubmitFn(
  changeForgottenPasswordSchema,
  async (values) => {
    const { token, newPassword, email } = values;
    changeForgottenPassword.mutate(
      { token, newPassword, email },
      {
        onSuccess() {
          toastSuccess(t("passwordChanged"));
          setTimeout(() => {
            router.push({ name: "auth.sign-in" });
          }, 1000);
        },
        onError() {
          toastError(t("emailOrTokenIncorrect"));
        },
      }
    );
  }
);
</script>
