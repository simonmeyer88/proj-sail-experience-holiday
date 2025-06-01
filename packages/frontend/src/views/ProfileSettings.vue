<script lang="ts" setup>
import { getDefaultProfilePicture } from "@/core/helpers/assets";
import { ErrorMessage, Field, Form as VForm } from "vee-validate";
import { toastError, toastSuccess } from "@/util/toast";
import {
  useChangeMePassword,
  useMe,
  useUpdateMeEmail,
  useUpdateMeProfile,
  useSendEmailVerificationCode,
  UpdateProfileClientDto,
} from "@/server-state";
import { computed, ref } from "vue";
import { InputGroup, ImageInput, DualInputGroup } from "@/components/form";
import {
  editMeProfileManagerSchema,
  editMeProfileStudentSchema,
} from "@/validation-schemas/users";
import {
  changePasswordSchema,
  changeEmailSchema,
} from "@/validation-schemas/auth";
import { getSubmitFn } from "@/util/form";
import moment from "moment-timezone";
import TelInputGroup from "@/components/form/TelInputGroup.vue";
import LoadableButton from "@/components/form/LoadableButton.vue";
import { requestEmailVerificationCodeSchema } from "@/validation-schemas/auth";
import { useI18n } from "vue-i18n";
import NotificationsSection from "@/components/profile-settings/NotificationsSection.vue";

type ChangeEmailStages = "DEFAULT" | "SENTCODE";
const changeEmailStage = ref<ChangeEmailStages>("DEFAULT");

const emailFormDisplay = ref(false);
const passwordFormDisplay = ref(false);

const me = useMe();
const updateMeEmail = useUpdateMeEmail();
const updateMeProfile = useUpdateMeProfile();
const changeMePassword = useChangeMePassword();

const sendEmailVerificationCode = useSendEmailVerificationCode();

const initialPictureUrl = computed(() => {
  return me.data.value?.pictureUrl || getDefaultProfilePicture();
});
// Holds value if profile picture was changed by user
const imageChanged = ref<File | null>(null);
const onImageChange = (image: File) => {
  imageChanged.value = image;
};

const studentServerProfileDetails = computed(() => ({
  firstName: me.data.value?.firstName,
  lastName: me.data.value?.lastName,
  phoneNumber: me.data.value?.phoneNumber,
  birthDate: moment(me.data.value?.birthDate).format("YYYY-MM-DD"),
  address: me.data.value?.address,
  zipCode: me.data.value?.zipCode,
  city: me.data.value?.city,
  idNumber: me.data.value?.idNumber,
  idIssueDate: moment(me.data.value?.idIssueDate).format("YYYY-MM-DD"),
}));

const teacherServerProfileDetails = computed(() => ({
  firstName: me.data.value?.firstName,
  lastName: me.data.value?.lastName,
  phoneNumber: me.data.value?.phoneNumber,
}));

const serverEmailDetails = computed(() => ({
  email: me.data.value?.email,
  password: "",
}));

const updateEmail = getSubmitFn(changeEmailSchema, (values) => {
  updateMeEmail.mutate(
    { ...values, emailVerificationCode: values.emailVerificationCode },
    {
      onError: (error: any) => {
        toastError(error?.message || "Something went wrong!");
      },
      onSuccess: () => {
        currNewEmail.value = null;
        changeEmailStage.value = "DEFAULT";

        toastSuccess(t("emailChangedSuccessfully"));
        emailFormDisplay.value = false;
      },
    }
  );
});

const updateStudentProfileDetails = getSubmitFn(
  editMeProfileStudentSchema,
  (values) => {
    let _values: UpdateProfileClientDto;
    if (imageChanged.value) {
      _values = {
        ...values,
        newImage: imageChanged.value as File,
      };
    } else {
      _values = { ...values };
    }

    updateMeProfile.mutate(_values, {
      onError: (error: any) => {
        toastError(error?.message || "Something went wrong!");
      },
      onSuccess: () => {
        toastSuccess(t("profileUpdatedSuccessfully"));
      },
    });
  }
);

const updateTeacherProfileDetails = getSubmitFn(
  editMeProfileManagerSchema,
  (values) => {
    let _values;
    if (imageChanged.value) {
      _values = {
        ...values,
        newImage: imageChanged.value,
      };
    } else {
      _values = { ...values };
    }

    updateMeProfile.mutate(_values, {
      onError: (error: any) => {
        toastError(error?.message || "Something went wrong!");
      },
      onSuccess: () => {
        toastSuccess(t("profileUpdatedSuccessfully"));
      },
    });
  }
);

const changePassword = getSubmitFn(changePasswordSchema, (values) => {
  const data = {
    oldPassword: values.currentPassword,
    newPassword: values.newPassword,
  };
  changeMePassword.mutate(data, {
    onError: (error: any) => {
      toastError(error?.message || "Something went wrong!");
    },
    onSuccess: () => {
      toastSuccess(t("passwordChangedSuccessfully"));
      passwordFormDisplay.value = false;
    },
  });
});

const requestEmailVerificationCode = (values: any) => {
  sendEmailVerificationCode.mutate(values.email, {
    onError: (error: any) => {
      toastError(error?.message || "Something went wrong!");
    },
    onSuccess: () => {
      toastSuccess(t("emailCodeSent"));
      changeEmailStage.value = "SENTCODE";
      currNewEmail.value = values.email;
    },
  });
};

// Holds value of new email after user requests email verification code
const currNewEmail = ref<string | null>(null);

const { t } = useI18n();
</script>
<template>
  <div class="card mb-5 mb-xl-10">
    <div
      class="card-header border-0 cursor-pointer"
      role="button"
      data-bs-toggle="collapse"
      data-bs-target="#profile-details"
    >
      <div class="card-title m-0">
        <h3 class="fw-bolder m-0">
          {{ t("myProfile") }}
        </h3>
      </div>
    </div>

    <div id="profile-details" class="collapse show" v-if="me.data.value">
      <VForm
        v-if="me.data.value?.role === 'STUDENT'"
        class="form"
        :validation-schema="editMeProfileStudentSchema"
        :initial-values="studentServerProfileDetails"
        @submit="updateStudentProfileDetails"
      >
        <div class="card-body border-top p-9">
          <ImageInput
            :label="t('userForm.profilePicture')"
            :initial-image-url="initialPictureUrl"
            @change="onImageChange"
          />

          <DualInputGroup
            horizontal="dynamic"
            :label="t('userForm.fullName')"
            name1="firstName"
            name2="lastName"
            type1="text"
            type2="text"
          />
          <TelInputGroup
            horizontal="dynamic"
            :label="t('userForm.phoneNumber')"
            name="phoneNumber"
            type="text"
          />
          <InputGroup
            horizontal="dynamic"
            :label="t('userForm.birthDate')"
            name="birthDate"
            type="date"
          />

          <InputGroup
            :label="t('userForm.address')"
            name="address"
            type="text"
            horizontal="dynamic"
          />

          <InputGroup
            :label="t('userForm.zipCode')"
            name="zipCode"
            type="text"
            horizontal="dynamic"
          />

          <InputGroup
            :label="t('userForm.city')"
            name="city"
            type="text"
            horizontal="dynamic"
          />

          <InputGroup
            :label="t('userForm.idNumber')"
            name="idNumber"
            type="text"
            horizontal="dynamic"
          />

          <InputGroup
            :label="t('userForm.idIssueDate')"
            name="idIssueDate"
            type="date"
            horizontal="dynamic"
          />
        </div>

        <div class="card-footer d-flex justify-content-end py-6 px-9">
          <LoadableButton
            submit
            :loading="updateMeProfile.isLoading.value"
            :default-text="t('saveChanges')"
            color="primary"
          />
        </div>
      </VForm>
      <VForm
        v-else
        class="form"
        :validation-schema="editMeProfileManagerSchema"
        :initial-values="teacherServerProfileDetails"
        @submit="updateTeacherProfileDetails"
      >
        <div class="card-body border-top p-9">
          <ImageInput
            :label="t('userForm.profilePicture')"
            :initial-image-url="initialPictureUrl"
            @change="onImageChange"
          />

          <DualInputGroup
            horizontal="dynamic"
            :label="t('userForm.fullName')"
            name1="firstName"
            name2="lastName"
            type1="text"
            type2="text"
          />
          <TelInputGroup
            :label="t('userForm.phoneNumber')"
            name="phoneNumber"
            type="text"
            horizontal="dynamic"
          />
        </div>
        <div class="card-footer d-flex justify-content-end py-6 px-9">
          <LoadableButton
            submit
            :loading="updateMeProfile.isLoading.value"
            :default-text="t('saveChanges')"
            color="primary"
          />
        </div>
      </VForm>
    </div>
  </div>

  <div class="card mb-5 mb-xl-10">
    <div
      class="card-header border-0 cursor-pointer"
      role="button"
      data-bs-toggle="collapse"
      data-bs-target="#security-settings"
    >
      <div class="card-title m-0">
        <h3 class="fw-bolder m-0">
          {{ t("securitySettings") }}
        </h3>
      </div>
    </div>
    <div id="security-settings" class="collapse show">
      <div class="card-body border-top p-9">
        <div class="d-flex flex-wrap align-items-center mb-8">
          <div id="kt_signin_email" :class="{ 'd-none': emailFormDisplay }">
            <div class="fs-4 fw-bolder mb-1">
              {{ t("userForm.email") }}
            </div>
            <div class="fs-6 fw-semobold text-gray-600">
              {{ serverEmailDetails.email }}
            </div>
          </div>

          <div v-if="emailFormDisplay" class="flex-row-fluid">
            <VForm
              data-testid="sent-code-form"
              v-if="changeEmailStage === 'SENTCODE'"
              class="form"
              novalidate
              @submit="updateEmail"
              :validation-schema="changeEmailSchema"
            >
              <div class="row mb-6 gx-7">
                <span
                  class="fw-semibold mb-3 fs-5 alert alert-success"
                  data-testid="sent-code-alert"
                >
                  {{ t("emailCodeSent") }}
                </span>
                <div class="col-xl-4 mb-4 mb-lg-0 col-md-6">
                  <div class="fv-row mb-0">
                    <label
                      for="emailVerificationCode"
                      class="form-label fs-6 fw-bold mb-3"
                    >
                      {{ t("userForm.emailVerificationCode") }}
                    </label>
                    <Field
                      type="text"
                      class="form-control form-control-lg fw-semibold fs-6"
                      name="emailVerificationCode"
                    />
                    <div class="fv-plugins-message-container">
                      <div class="fv-help-block">
                        <ErrorMessage name="emailVerificationCode" />
                      </div>
                    </div>
                  </div>
                </div>

                <Field hidden name="newEmail" :value="currNewEmail" />

                <div class="col-xl-4 col-md-6">
                  <div class="fv-row mb-0">
                    <label
                      for="password"
                      class="form-label fs-6 fw-bold mb-3"
                      >{{ t("userForm.password") }}</label
                    >
                    <Field
                      type="password"
                      class="form-control form-control-lg fw-semibold fs-6"
                      name="password"
                      id="password"
                    />
                    <div class="fv-plugins-message-container">
                      <div class="fv-help-block">
                        <ErrorMessage name="password" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="d-flex gap-3">
                <LoadableButton
                  submit
                  :loading="updateMeEmail.isLoading.value"
                  :default-text="t('saveChanges')"
                  color="primary"
                />
                <button
                  type="button"
                  class="btn btn-danger px-6"
                  @click="
                    () => {
                      changeEmailStage = 'DEFAULT';
                      emailFormDisplay = !emailFormDisplay;
                    }
                  "
                >
                  {{ t("cancel") }}
                </button>
              </div>
            </VForm>
            <VForm
              :keep-values="false"
              data-testid="request-code-form"
              v-else
              class="form"
              @submit="requestEmailVerificationCode"
              :validation-schema="requestEmailVerificationCodeSchema"
              :initial-values="{
                email: serverEmailDetails.email,
              }"
            >
              <div class="row mb-6 gx-7">
                <div class="col-xl-4 mb-4 mb-lg-0 col-md-6">
                  <div class="fv-row mb-0">
                    <label
                      for="emailVerificationCode"
                      class="form-label fs-6 fw-bold mb-3"
                    >
                      {{ t("newEmail") }}</label
                    >
                    <Field
                      type="text"
                      class="form-control form-control-lg fw-semibold fs-6"
                      name="email"
                    />
                    <div class="fv-plugins-message-container">
                      <div class="fv-help-block">
                        <ErrorMessage name="email" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="d-flex gap-3">
                <LoadableButton
                  submit
                  :loading="updateMeEmail.isLoading.value"
                  :default-text="t('next')"
                  color="primary"
                  class="btn-sm"
                />
                <button
                  type="button"
                  class="btn btn-danger px-6 btn-sm"
                  @click="emailFormDisplay = !emailFormDisplay"
                >
                  {{ t("cancel") }}
                </button>
              </div>
            </VForm>
          </div>
          <div
            :class="{ 'd-none': emailFormDisplay }"
            class="ms-auto"
            data-testid="toggle-email-form"
          >
            <button
              class="btn btn-dark fw-bolder px-6"
              @click="emailFormDisplay = !emailFormDisplay"
            >
              {{ t("change") }}
            </button>
          </div>
        </div>
        <div class="separator border-gray-400 my-10"></div>
        <div class="d-flex flex-wrap align-items-center mb-8">
          <div :class="{ 'd-none': passwordFormDisplay }">
            <div class="fs-4 fw-bolder mb-1">
              {{ t("userForm.password") }}
            </div>
            <div class="fs-6 fw-semobold text-gray-600">************</div>
          </div>
          <div
            id="kt_signin_password_edit"
            class="flex-row-fluid"
            :class="{ 'd-none': !passwordFormDisplay }"
          >
            <div class="fs-6 fw-semobold text-gray-600 mb-4">
              {{ t("userForm.passwordMessage") }}
            </div>

            <VForm
              class="form"
              novalidate
              @submit="changePassword"
              :validation-schema="changePasswordSchema"
            >
              <div class="row mb-6">
                <div class="col-lg-4">
                  <div class="fv-row mb-0">
                    <label
                      for="currentPassword"
                      class="form-label fs-6 fw-bold mb-3"
                      >{{ t("currentPassword") }}
                    </label>
                    <Field
                      type="password"
                      class="form-control form-control-lg fw-semibold fs-6"
                      name="currentPassword"
                      id="currentPassword"
                    />
                    <div class="fv-plugins-message-container">
                      <div class="fv-help-block">
                        <ErrorMessage name="currentPassword" />
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-lg-4">
                  <div class="fv-row mb-0">
                    <label
                      for="newPassword"
                      class="form-label fs-6 fw-bold mb-3"
                    >
                      {{ t("newPassword") }}
                    </label>
                    <Field
                      type="password"
                      class="form-control form-control-lg fw-semibold fs-6"
                      name="newPassword"
                      id="newPassword"
                    />
                    <div class="fv-plugins-message-container">
                      <div class="fv-help-block">
                        <ErrorMessage name="newPassword" />
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-lg-4">
                  <div class="fv-row mb-0">
                    <label
                      for="confirmPassword"
                      class="form-label fs-6 fw-bold mb-3"
                    >
                      {{ t("confirmPassword") }}
                    </label>
                    <Field
                      type="password"
                      class="form-control form-control-lg fw-semobold fs-6"
                      name="confirmPassword"
                      id="confirmPassword"
                    />
                    <div class="fv-plugins-message-container">
                      <div class="fv-help-block">
                        <ErrorMessage name="confirmPassword" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="d-flex gap-4">
                <LoadableButton
                  submit
                  :loading="changeMePassword.isLoading.value"
                  :default-text="t('saveChanges')"
                  color="primary"
                  class="btn-sm"
                />
                <button
                  type="button"
                  @click="passwordFormDisplay = !passwordFormDisplay"
                  class="btn btn-sm btn-danger"
                >
                  {{ t("cancel") }}
                </button>
              </div>
            </VForm>
          </div>
          <div class="ms-auto" :class="{ 'd-none': passwordFormDisplay }">
            <button
              @click="passwordFormDisplay = !passwordFormDisplay"
              class="btn btn-dark fw-bolder"
            >
              {{ t("change") }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <NotificationsSection />
</template>

<i18n>
{
  "en": {
    "notifications": "Notifications",
    "chatPushNotifications": "Chat notifications",
    "notifOptionsEnabled": "Chat notifications enabled!",
    "notifOptionsDisabled": "Chat notifications disabled!",
    "notifOptionsEnableError": "Could not enable chat notifications! Check if you have granted permission to receive notifications.",
    "notifOptionsDisableError": "Could not disable chat notifications!",
    "emailCodeSent": "We have sent a verification code to your new email. Please enter the code to change your email.",
    "emailChangedSuccessfully": "Email changed successfully!",
    "profileUpdatedSuccessfully": "Profile updated successfully!",
    "myProfile": "My Profile",
    "saveChanges": "Save Changes",
    "securitySettings": "Security Settings",
    "cancel": "Cancel",
    "newEmail": "New Email",
    "next": "Next",
    "change": "Change",
    "currentPassword": "Current Password",
    "newPassword": "New Password",
    "confirmPassword": "Confirm Password",
    "calendarNotifications": "Calendar Notifications",
  },
  "es": {
    "notifications": "Notificaciones",
    "chatPushNotifications": "Notificaciones de chat",
    "notifOptionsEnabled": "¡Notificaciones de chat habilitadas!",
    "notifOptionsDisabled": "¡Notificaciones de chat deshabilitadas!",
    "notifOptionsEnableError": "¡No se pudo habilitar las notificaciones de chat! Verifique si ha otorgado permiso para recibir notificaciones.",
    "notifOptionsDisableError": "¡No se pudieron deshabilitar las notificaciones de chat!",
    "emailCodeSent": "Hemos enviado un código de verificación a su nuevo correo electrónico. Por favor ingrese el código para cambiar su correo electrónico.",
    "emailChangedSuccessfully": "¡Correo electrónico cambiado con éxito!",
    "profileUpdatedSuccessfully": "¡Perfil actualizado con éxito!",
    "myProfile": "Mi perfil",
    "saveChanges": "Guardar cambios",
    "securitySettings": "Configuración de seguridad",
    "cancel": "Cancelar",
    "newEmail": "Nuevo correo electrónico",
    "next": "Siguiente",
    "change": "Cambiar",
    "currentPassword": "Contraseña actual",
    "newPassword": "Nueva contraseña",
    "confirmPassword": "Confirmar contraseña",
    "calendarNotifications": "Notificaciones de calendario",
  }
}
</i18n>
