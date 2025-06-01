<template>
  <LoadingComponent v-if="isLoading" :height="500" />

  <div v-else-if="currentUserData" class="row position-relative row-gap-6">
    <div class="col-12 col-xl-6">
      <card-block class="position-sticky">
        <template #header>
          <h2 class="fs-4 fw-bold mb-0">
            {{ t("personalInfo") }}
          </h2>
        </template>

        <template #default>
          <VForm
            class="form"
            ref="formRef"
            :validation-schema="validationSchema"
            :initial-values="serverProfileDetails"
            @submit="updateProfileDetails"
          >
            <div>
              <ProfilePicture
                :label="t('userForm.profilePicture')"
                :image-url="
                  currentUserData.pictureUrl ||
                  getAssetPath('media/default-profile-picture.png')
                "
              />

              <DualInputGroup
                :readonly="isReadonly"
                :label="t('userForm.fullName')"
                name1="firstName"
                name2="lastName"
                type1="text"
                type2="text"
              />

              <InputGroup
                name="email"
                :readonly="true"
                :label="t('email')"
                type="text"
              />

              <TelInputGroup
                :readonly="isReadonly"
                :label="t('userForm.phoneNumber')"
                name="phoneNumber"
                placeholder="Número de teléfono"
                type="text"
              />

              <InputGroup
                :readonly="isReadonly"
                :label="t('userForm.birthDate')"
                name="birthDate"
                type="date"
                v-if="currentUserData.role === 'STUDENT'"
              />

              <InputGroup
                :readonly="isReadonly"
                :label="t('userForm.address')"
                name="address"
                type="text"
                v-if="currentUserData.role === 'STUDENT'"
              />

              <InputGroup
                :readonly="isReadonly"
                :label="t('userForm.zipCode')"
                name="zipCode"
                type="text"
                v-if="currentUserData.role === 'STUDENT'"
              />

              <InputGroup
                :readonly="isReadonly"
                :label="t('userForm.city')"
                name="city"
                type="text"
                v-if="currentUserData.role === 'STUDENT'"
              />

              <InputGroup
                :readonly="isReadonly"
                :label="t('userForm.idNumber')"
                name="idNumber"
                type="text"
                v-if="currentUserData.role === 'STUDENT'"
              />

              <InputGroup
                :readonly="isReadonly"
                :label="t('userForm.idIssueDate')"
                name="idIssueDate"
                type="date"
                v-if="currentUserData.role === 'STUDENT'"
              />

              <SelectGroup
                class="mb-6"
                :readonly="isReadonly"
                :label="t('userForm.course')"
                name="courseId"
                :options="filteredCourses"
                v-if="currentUserData.role === 'STUDENT'"
              />

              <SwitchGroup
                class="w-fit"
                :readonly="isReadonly"
                :label="t('userForm.isInClub')"
                name="isInClub"
                v-if="currentUserData.role === 'STUDENT'"
              />

              <div
                class="d-flex gap-3 flex-column flex-sm-row justify-content-end"
              >
                <LoadableButton
                  v-if="currentUserData && !isReadonly"
                  color="primary"
                  :loading="isUpdatingUser"
                  submit
                  :default-text="t('updateUser')"
                />
              </div>
            </div>
          </VForm>
        </template>
      </card-block>
    </div>

    <div class="col-12 col-xl-6">
      <div class="row gap-6">
        <div class="col-12">
          <card-block>
            <template #header>
              <h2 class="fs-4 fw-bold mb-0">
                {{ t("actions") }}
              </h2>
            </template>

            <template #default>
              <div class="d-grid gap-5">
                <div
                  class="d-flex pb-4 border-bottom align-items-center justify-content-between border-bottom-dashed"
                >
                  <p class="fs-4 mb-0 fw-bold">
                    {{ t("changeActiveStatus") }}
                  </p>

                  <IsActiveSwitch
                    :is-active="currentUserData.isActive"
                    :id="currentUserData.id"
                  />
                </div>

                <div
                  class="d-flex pb-4 border-bottom align-items-center justify-content-between border-bottom-dashed"
                >
                  <p class="fs-4 mb-0 fw-bold">
                    {{ t("calendarAccess") }}
                  </p>

                  <LoadableButton
                    v-if="currentUserData && !isReadonly"
                    :color="
                      currentUserData.isCalendarEnable ? 'danger' : 'success'
                    "
                    :loading="updateCalendarAccess.isLoading.value"
                    @click="handleUpdateCalendarAccess(currentUserData)"
                    :default-text="`${
                      currentUserData.isCalendarEnable
                        ? t('block')
                        : t('enable')
                    } ${t('calendar')}`"
                  />
                </div>

                <div
                  class="d-flex pb-4 border-bottom align-items-center justify-content-between border-bottom-dashed"
                >
                  <p class="fs-4 mb-0 fw-bold">
                    {{ t("deleteUser") }}
                  </p>

                  <LoadableButton
                    v-if="currentUserData && !isReadonly"
                    color="danger"
                    :loading="deleteUser.isLoading.value"
                    @click="onDeleteUser(currentUserData.id)"
                    :default-text="t('deleteUser')"
                  />
                </div>
              </div>
            </template>
          </card-block>
        </div>

        <div class="col-12">
          <card-block v-if="currentUserData?.role === 'STUDENT'">
            <template #header>
              <h2 class="fs-4 fw-bold mb-0">
                {{ t("payments") }}
              </h2>
            </template>

            <template #default>
              <user-payments :user="currentUserData" />
            </template>
          </card-block>
        </div>

        <div class="col-12">
          <card-block>
            <template #header>
              <h2 class="fs-4 fw-bold mb-0">
                {{ t("studentTasks") }}
              </h2>
            </template>

            <template #default>
              <section-tasks
                v-if="currentUserData.course?.id"
                :user="currentUserData"
              />

              <section-tasks
                v-if="currentUserData.isInClub"
                :user="currentUserData"
                is-club
              />

              <div
                class="d-flex gap-3 flex-column flex-sm-row justify-content-end"
              >
                <LoadableButton
                  @click="navigateToTasksPage"
                  :loading="false"
                  color="primary"
                  :default-text="t('openInNewPage')"
                />
              </div>
            </template>
          </card-block>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  useCourses,
  useDeleteUser,
  useMe,
  useUpdateCalendarAccess,
  useUpdateUser,
  useUser,
} from "@/server-state";
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import CardBlock from "@/components/common/CardBlock.vue";
import { getAssetPath } from "@/core/helpers/assets";
import { ProfilePicture } from "@/components/common";
import { useI18n } from "vue-i18n";
import { LoadingComponent } from "@/components/ui";
import { Form as VForm } from "vee-validate";
import {
  DualInputGroup,
  InputGroup,
  LoadableButton,
  SelectGroup,
  SwitchGroup,
  TelInputGroup,
} from "@/components/form";
import {
  editAdminProfileManagerSchema,
  editAdminProfileStudentSchema,
} from "@/validation-schemas/users";
import moment from "moment/moment";
import { getSubmitFn } from "@/util/form";
import { toastError, toastSuccess } from "@/util/toast";
import { alertConfirm } from "@/util/alert";
import { IsActiveSwitch } from "@/components/user-management";
import SectionTasks from "@/components/student-tasks/SectionTasks.vue";
import UserPayments from "@/components/user-management/UserPayments.vue";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const studentId = route.params.id as string;

const me = useMe();
const courses = useCourses();

const deleteUser = useDeleteUser();
const updateUser = useUpdateUser();
const updateCalendarAccess = useUpdateCalendarAccess();

const isUpdatingUser = ref(false);

const filteredCourses = computed(
  () =>
    courses.data.value
      ?.map((course) => {
        return {
          label: course.name,
          value: course.id,
        };
      })
      .concat({
        label: t("noCourse"),
        value: "",
      }) || []
);

const user = useUser(computed(() => studentId as string));

const isReadonly = computed(() => {
  return me.data.value?.role !== "ADMIN";
});

const currentUserData = computed(() => {
  return user.data.value || null;
});

const isLoading = computed(() => user.status.value === "loading");

const validationSchema = computed(() =>
  currentUserData.value?.role === "TEACHER" ||
  currentUserData.value?.role === "ADMIN"
    ? editAdminProfileManagerSchema
    : editAdminProfileStudentSchema
);

const serverProfileDetails = computed(() => {
  const role = currentUserData.value?.role;
  if (!role) return {};

  if (role === "TEACHER" || role === "ADMIN") {
    return {
      firstName: currentUserData.value?.firstName,
      lastName: currentUserData.value?.lastName,
      phoneNumber: currentUserData.value?.phoneNumber,
    };
  }
  return {
    firstName: currentUserData.value?.firstName,
    lastName: currentUserData.value?.lastName,
    phoneNumber: currentUserData.value?.phoneNumber,
    email: currentUserData.value?.email,
    address: currentUserData.value?.address,
    birthDate: moment(currentUserData.value?.birthDate).format("YYYY-MM-DD"),
    zipCode: currentUserData.value?.zipCode,
    city: currentUserData.value?.city,
    idNumber: currentUserData.value?.idNumber,
    idIssueDate: moment(currentUserData.value?.idIssueDate).format(
      "YYYY-MM-DD"
    ),
    courseId: currentUserData.value?.course?.id,
    isInClub: currentUserData.value?.isInClub,
  };
});

const navigateToTasksPage = async () => {
  await router.push({
    name: "management.student-tasks",
    params: { studentId },
  });
};

const updateProfileDetails = getSubmitFn(
  currentUserData.value?.role === "TEACHER"
    ? editAdminProfileManagerSchema
    : editAdminProfileStudentSchema,
  async ({ email: _email, ...values }: any) => {
    isUpdatingUser.value = true;
    updateUser.mutate(
      {
        ...values,
        id: studentId,
        courseId: values.courseId === "" ? null : values.courseId,
        isInClub: !!values.isInClub,
      },
      {
        onSuccess: () => {
          toastSuccess(t("userUpdated"));
        },
        onError: (error: any) => {
          toastError(t(error.message) || "Unknown error");
        },
        onSettled: () => {
          isUpdatingUser.value = false;
        },
      } as any
    );
  }
);

const onDeleteUser = (id: string) => {
  if (!id) return;
  alertConfirm({
    title: t("confirmDeleteUserTitle"),
    text: t("confirmDeleteUserText") + currentUserData.value?.email + ".",
    confirmButtonText: t("deleteUser"),
    cancelButtonText: t("cancel"),
    onConfirm() {
      deleteUser.mutate(id, {
        onSuccess: async () => {
          toastSuccess(t("userDeleted"));
          await router.push({
            name: "management.users",
          });
        },
        onError: (error: any) => {
          toastError(error?.message || "Unknown error");
        },
      });
    },
  });
};

const handleUpdateCalendarAccess = async (user: any) => {
  if (user.isCalendarEnable) {
    const confirm = await alertConfirm({
      title: t("areYouSure", { name: user.firstName }),
      text: t("userWillNotHaveAccess"),
      confirmButtonText: t("block"),
      cancelButtonText: t("cancel"),
    });

    if (confirm) {
      updateCalendarAccess.mutate({
        id: user.id,
        isCalendarEnable: false,
      });
    }
  } else {
    updateCalendarAccess.mutate({
      id: user.id,
      isCalendarEnable: true,
    });
  }
};
</script>

<style scoped lang="scss">
.position-sticky {
  top: 88px;
}
</style>

<i18n>
{
    "en":{
        "personalInfo": "Personal Info",
        "studentTasks": "Student Tasks",
        "actions": "Actions",
        "userUpdated":"User updated",
        "userModalTitle":"User details",
        "email":"Email",
        "payments":"Payments",
        "woocommerce":"Woocommerce",
        "deleteUser":"Delete user",
        "updateUser":"Update user",
        "confirmDeleteUserTitle":"Confirm delete user",
        "confirmDeleteUserText":"Are you sure you want to delete user ",
        "noCourse":"No course",
        "block": "Block",
        "enable": "Enable",
        "cancel": "Cancel",
        "openInNewPage": "Open in new page",
        "areYouSure": "Are you sure you want to block calendar for {name}?",
        "userWillNotHaveAccess": "The user will not have access to calendar events for 15 days",
        "changeActiveStatus": "Change active status",
        "calendarAccess": "Calendar Access",
        "calendar": "Calendar",
        "userDeleted": "User deleted"
    },
    "es":{
        "personalInfo": "Información personal",
        "studentTasks": "Tareas del estudiante",
        "actions": "Comportamiento",
        "userUpdated":"Usuario actualizado",
        "userModalTitle":"Detalles del usuario",
        "email":"Correo electrónico",
        "payments":"Pagos",
        "woocommerce":"Woocommerce",
        "deleteUser":"Borrar usuario",
        "updateUser":"Actualizar usuario",
        "confirmDeleteUserTitle":"Confirmar borrado de usuario",
        "confirmDeleteUserText":"¿Estás seguro de que quieres borrar el usuario ",
        "noCourse":"Sin curso",
        "block": "Bloquear",
        "enable": "Habilitar",
        "cancel": "Cancelar",
        "openInNewPage": "Abrir en nueva página",
        "areYouSure": "¿Estás seguro de que deseas bloquear el calendario para {name}?",
        "userWillNotHaveAccess": "El usuario no tendrá acceso a los eventos del calendario durante 15 días",
        "changeActiveStatus": "Cambiar estado activo",
        "calendarAccess": "Acceso al calendario",
        "calendar": "Calendario",
        "userDeleted": "Usuario eliminado"
    }
}
</i18n>
