<template>
  <div
    class="p-4 w-100 d-flex flex-column justify-content-center align-items-center"
  >
    <button
      class="btn btn-primary position-absolute end-0 top-0 mt-6 me-6"
      @click="handleLogout"
    >
      {{ t("logout") }}
    </button>
    <div class="text-center mb-10">
      <h1 class="text-dark mb-3">
        {{ t("title") }}
      </h1>
      <div class="text-gray-400 fw-semobold fs-4 mb-4">
        {{ t("subtitle") }}
      </div>
      <div class="text-dark fs-4 mb-1">
        {{ t("as") }}
        <span class="text-primary fw-bold">{{
          selectedRole === "STUDENT" ? t("student") : t("teacher")
        }}</span>
      </div>
      <button
        @click="toggleSelectedRole"
        class="btn btn-primary"
        data-testid="toggle-role-button"
      >
        {{ t("toggleRole") }}
      </button>
    </div>

    <div class="card border border-gray-300 p-6 mw-500px shadow-sm">
      <ImageInput
        :label="t('userForm.profilePicture')"
        :initial-image-url="getAssetPath('media/default-profile-picture.png')"
        @change="onFileChange"
      />
      <Form
        @invalid-submit="handleInvalidSubmit"
        class="form w-100"
        v-if="selectedRole === 'TEACHER'"
        @submit="onSubmitOnboarding"
        :validation-schema="onboardTeacherSchema"
      >
        <DualInputGroup
          :label="t('userForm.fullName')"
          name1="firstName"
          type1="text"
          name2="lastName"
          type2="text"
        />
        <TelInputGroup
          name="phoneNumber"
          :label="t('userForm.phoneNumber')"
          type="text"
        />
        <div class="text-center">
          <LoadableButton
            submit
            :default-text="t('continue')"
            :loading="onboardMe.isLoading.value"
            color="primary"
          />
        </div>
      </Form>
      <Form
        @invalid-submit="handleInvalidSubmit"
        v-slot="{ setFieldValue }"
        v-else-if="selectedRole === 'STUDENT'"
        class="form w-100"
        @submit="onSubmitOnboarding"
        :validation-schema="onboardStudentSchema"
      >
        <DualInputGroup
          name1="firstName"
          :placeholder1="t('userForm.firstName')"
          :placeholder2="t('userForm.lastName')"
          :label="t('userForm.fullName')"
          type1="text"
          name2="lastName"
          type2="text"
        />
        <TelInputGroup
          name="phoneNumber"
          :label="t('userForm.phoneNumber')"
          type="text"
        />
        <InputGroup
          :initial-value="
            new Date(new Date().setFullYear(new Date().getFullYear() - 16))
              .toISOString()
              .split('T')[0]
          "
          @update:model-value="
            ($event) => {
              // Min age is 16
              if (
                new Date($event) >
                new Date(new Date().setFullYear(new Date().getFullYear() - 16))
              ) {
                setFieldValue(
                  'birthDate',
                  new Date(
                    new Date().setFullYear(new Date().getFullYear() - 16)
                  ).toISOString()
                );
                toastError(t('birthDateMin16'));
              }
            }
          "
          name="birthDate"
          :label="t('userForm.birthDate')"
          type="date"
        />
        <InputGroup name="address" :label="t('userForm.address')" type="text" />
        <InputGroup name="zipCode" :label="t('userForm.zipCode')" type="text" />
        <InputGroup name="city" :label="t('userForm.city')" type="text" />
        <InputGroup
          name="idNumber"
          :label="t('userForm.idNumber')"
          type="text"
        />
        <InputGroup
          name="idIssueDate"
          :label="t('userForm.idIssueDate')"
          type="date"
          :initial-value="
            new Date(new Date().setDate(new Date().getDate() - 1))
              .toISOString()
              .split('T')[0]
          "
          @update:model-value="
            ($event) => {
              if (new Date($event) > new Date()) {
                setFieldValue(
                  'idIssueDate',
                  new Date().toISOString().split('T')[0]
                );
                toastError(t('idIssueDateBeforeToday'));
              }
            }
          "
        />
        <SelectGroup
          class="mb-6"
          :label="t('course')"
          name="courseId"
          :options="coursesOptions"
        />
        <div class="mb-10">
          <SwitchGroup
            :label="t('joinClub')"
            name="joinClub"
            style="margin-bottom: 0 !important"
          />
          <span class="text-danger fw-bold">
            {{ t("joinClubWarning") }}
          </span>
        </div>
        <div class="text-center">
          <LoadableButton
            submit
            :default-text="t('continue')"
            :loading="onboardMe.isLoading.value"
            color="primary"
          />
        </div>
      </Form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import { Form } from "vee-validate";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import {
  InputGroup,
  DualInputGroup,
  SelectGroup,
  SwitchGroup,
  LoadableButton,
  TelInputGroup,
} from "@/components/form";
import { useCourses, useOnboardMe } from "@/server-state";
import {
  onboardStudentSchema,
  onboardTeacherSchema,
} from "@/validation-schemas/auth";
import AuthService from "@/core/services/AuthService";
import { ImageInput } from "@/components/form";
import { getAssetPath } from "@/core/helpers/assets";
import { toastError, toastSuccess } from "@/util/toast";
const onboardMe = useOnboardMe();

const router = useRouter();
const handleLogout = async () => {
  await AuthService.logout();
  router.push("/");
};

const handleInvalidSubmit = () => {
  toastError(t("fillAllFields"));
};

const { t } = useI18n();

const courses = useCourses();

const selectedRole = ref<string>("STUDENT");

const toggleSelectedRole = () => {
  if (selectedRole.value === "STUDENT") {
    selectedRole.value = "TEACHER";
  } else {
    selectedRole.value = "STUDENT";
  }
};

const image = ref<File | null>(null);

const onFileChange = (file: File) => {
  image.value = file;
};

const coursesOptions = computed(() => {
  return (courses.data.value || [])
    .map((course: any) => {
      return {
        label: course.name,
        value: course.id,
      };
    })
    .concat({
      label: t("noCourseSelected"),
      value: "",
    });
});

const onSubmitOnboarding = async (values: any) => {
  // Values date to ISO format
  if (!image.value) {
    toastError(t("noImage"));
    return;
  }

  if (selectedRole.value === "STUDENT") {
    values.birthDate = new Date(values.birthDate).toISOString();
    values.idIssueDate = new Date(values.idIssueDate).toISOString();
    if (values.courseId === "") {
      delete values.courseId;
    }
    // Student onboarding
    onboardMe.mutate(
      {
        ...values,
        profilePic: image.value,
        joinClub: values.joinClub ? true : false,
        courseId: values.courseId ? values.courseId : null,
      },
      {
        onSuccess() {
          toastSuccess(t("success"));
          router.push("/");
        },
        onError(error: any) {
          toastError(error.message || t("error"));
        },
      }
    );
  } else {
    // Teacher onboarding
    onboardMe.mutate(
      {
        ...values,
        profilePic: image.value,
      },
      {
        onSuccess() {
          toastSuccess(t("success"));
          router.push("/");
        },
        onError(error: any) {
          toastError(error.message || t("error"));
        },
      }
    );
  }
};
</script>

<i18n>
{
  "en": {
      "birthDateMin16": "The birth date must be before 16 years. Make sure you are correctly selecting the date.",
      "idIssueDateBeforeToday": "The issue date must be before today. Make sure you are correctly selecting the date.",
      "title": "Welcome to the virtual classroom",
      "subtitle": "To continue, we need you to provide some data to continue with the registration process.",
      "as": "You are registering as a",
      "student": "student",
      "teacher": "teacher",
      "toggleRole": "Tap here to change",
      "course": "Course",
      "joinClub": "Join the club",
      "joinClubWarning": "Joining the club implies extra cost.",
      "continue": "Continue",
      "logout": "Logout",
      "success": "Welcome! You have registered successfully",
      "error": "An error has occurred",
      "noImage": "You must upload a profile image",
      "noCourseSelected": "Not enroll in any course",
      "fillAllFields": "Please, make sure you fill all the fields correctly"
    
  },
  "es": {
      "birthDateMin16": "La fecha de nacimiento debe ser anterior a 16 años. Asegúrate de estar seleccionando correctamente la fecha.",
      "idIssueDateBeforeToday": "La fecha de expedición debe ser anterior a hoy. Asegúrate de estar seleccionando correctamente la fecha.",
      "title": "Bienvenido al aula virtual",
      "subtitle": "Para continuar, necesitamos que nos proporciones algunos datos para continuar con el proceso de registro.",
      "as": "Te estás registrando como",
      "student": "estudiante",
      "teacher": "profesor",
      "toggleRole": "Toca aquí para cambiar",
      "joinClub": "Unirse al club",
      "joinClubWarning": "Unirse al club implica coste extra.",
      "continue": "Continuar",
      "logout": "Cerrar sesión",
      "success": "¡Bienvenido! Te has registrado correctamente",
      "error": "Ha ocurrido un error",
      "noImage": "Debes subir una imagen de perfil",
      "noCourseSelected": "No inscribirse en ningún curso",
      "fillAllFields": "Por favor, asegúrate de rellenar todos los campos correctamente"
    
  }
}
</i18n>
