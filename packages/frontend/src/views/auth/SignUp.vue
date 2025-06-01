<script lang="ts" setup>
import { reactive, ref } from "vue";
import { Form } from "vee-validate";
import { useRouter } from "vue-router";
import {
  requestEmailVerificationCodeSchema,
  registerSchema,
} from "@/validation-schemas/auth";
import AuthService from "@/core/services/AuthService";
import ApiService, { ApiError } from "@/core/services/ApiService";
import { getSubmitFn } from "@/util/form";
import { LoadableButton, InputGroup } from "@/components/form/index";
import { useI18n } from "vue-i18n";
import { toastError, toastSuccess } from "@/util/toast";

enum steps {
  ASK_FOR_EMAIL,
  REGISTER,
}
const router = useRouter();
const { t } = useI18n();
const currStep = ref(steps.ASK_FOR_EMAIL);
const isSubmitting = ref(false);
const isResendingEmailVerificationCode = ref(false);

const onSubmitRegister = getSubmitFn(registerSchema, async (_values) => {
  const { passwordConfirmation, ...values } = _values;
  isSubmitting.value = true;

  try {
    await AuthService.logout();
    await AuthService.register(values);

    await router.push({
      name: "dashboard",
    });
  } catch (error: any) {
    toastError(error.message || "Something went wrong");
  } finally {
    isSubmitting.value = false;
  }
});

const initialRegisterFormValues = reactive({
  email: "",
  password: "",
  passwordConfirmation: "",
  emailVerificationCode: "",
});

const handleSubmitEmail = getSubmitFn(
  requestEmailVerificationCodeSchema,
  async (values) => {
    isSubmitting.value = true;
    try {
      await ApiService.post("/auth/email-verification/register", values);

      initialRegisterFormValues.email = values.email;
      currStep.value = steps.REGISTER;
    } catch (error: any) {
      toastError(error.message || "Something went wrong");
    } finally {
      isSubmitting.value = false;
    }
  }
);

const handleResendEmailVerificationCode = async (email: string) => {
  try {
    isResendingEmailVerificationCode.value = true;
    await ApiService.post("/auth/email-verification/register", { email });
    toastSuccess(t("resentEmailVerificationCode"));
  } catch (error) {
    if (error instanceof ApiError) {
      toastError(error.message);
    }
  } finally {
    isResendingEmailVerificationCode.value = false;
  }
};
</script>

<i18n>
  { 
    "en":{
      createAnAccount: "Create an account",
      alreadyHaveAnAccount: "Already have an account?",
      signInHere: "Sign in here",
      emailLabel: "Email",
      passwordLabel: "Password",
      confirmationLabel: "Password confirmation",
      verificationCodeLabel: "Email verification code",
      submit: "Submit",
      sentEmailVerificationCode: "We have sent you an email verification code. Check your inbox and enter the code below.",
      resendVerificationCode: "Resend verification code",
      resentEmailVerificationCode: "Resent email verification code",
    },
    "es": {
      createAnAccount: "Crear una cuenta",
      alreadyHaveAnAccount: "¿Ya tienes una cuenta?",
      signInHere: "Inicia sesión aquí",
      emailLabel: "Correo electrónico",
      passwordLabel: "Contraseña",
      confirmationLabel: "Confirmación de contraseña",
      verificationCodeLabel: "Código de verificación de correo electrónico",
      submit: "Enviar",
      sentEmailVerificationCode: "Te hemos enviado un código de verificación de correo electrónico. Revisa tu bandeja de entrada y escribe el código a continuación.",
      resendVerificationCode: "Reenviar código de verificación",
      resentEmailVerificationCode: "Código de verificación de correo electrónico reenviado",
    }
  }
</i18n>
<template>
  <div class="mb-10 text-center">
    <h1 class="text-dark mb-3">{{ t("createAnAccount") }}</h1>
    <div class="text-gray-400 fw-semibold fs-4">
      {{ t("alreadyHaveAnAccount") }}
      <router-link
        :to="{
          name: 'auth.sign-in',
        }"
        class="link-primary fw-bold"
      >
        {{ t("signInHere") }}
      </router-link>
    </div>
  </div>
  <Form
    v-if="currStep === steps.ASK_FOR_EMAIL"
    class="w-100 p-6 mw-450px card"
    @submit="handleSubmitEmail"
    :validation-schema="requestEmailVerificationCodeSchema"
  >
    <InputGroup name="email" :label="t('emailLabel')" type="email" />
    <div class="text-center">
      <LoadableButton
        :loading="isSubmitting"
        :disabled="isSubmitting"
        color="primary"
        :default-text="t('submit')"
        :loading-text="t('submit')"
        type="submit"
      />
    </div>
  </Form>
  <Form
    v-if="currStep === steps.REGISTER"
    class="form w-100 card p-6 mw-450px"
    @submit="onSubmitRegister"
    :validation-schema="registerSchema"
    :initial-values="initialRegisterFormValues"
  >
    <span
      class="alert alert-success fw-bold fs-6"
      data-testid="email-sent-alert"
      ><span>{{ t("sentEmailVerificationCode") }}</span>
      <button
        data-testid="resend-email-btn"
        type="button"
        class="btn btn-primary btn-sm fs-7 d-block mt-3"
        @click.stop="
          handleResendEmailVerificationCode(initialRegisterFormValues.email)
        "
      >
        {{ t("resendVerificationCode") }}
      </button>
    </span>
    <InputGroup name="email" :label="t('emailLabel')" type="email" disabled />
    <InputGroup
      style="margin-bottom: 0 !important"
      name="password"
      :label="t('passwordLabel')"
      type="password"
    />
    <InputGroup
      name="passwordConfirmation"
      :label="t('confirmationLabel')"
      type="password"
    />
    <InputGroup
      name="emailVerificationCode"
      :label="t('verificationCodeLabel')"
      type="text"
    />

    <div class="text-center">
      <LoadableButton
        :loading="isSubmitting"
        :disabled="isSubmitting"
        color="primary"
        :default-text="t('submit')"
        :loading-text="t('submit')"
        type="submit"
      />
    </div>
  </Form>
</template>
