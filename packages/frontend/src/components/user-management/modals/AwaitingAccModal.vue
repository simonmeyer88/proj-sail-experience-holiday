<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
  useUsers,
  useCourses,
  useDeleteUser,
  useUpdateUser,
  useAcceptUser,
  useMe,
} from "@/server-state";
import { toastSuccess, toastError } from "@/util/toast";
import { Form as VForm } from "vee-validate";

import {
  InputGroup,
  SelectGroup,
  SwitchGroup,
  DualInputGroup,
  LoadableButton,
  TelInputGroup,
} from "@/components/form";

import { ProfilePicture } from "@/components/common";
import {
  editAdminProfileManagerSchema,
  editAdminProfileStudentSchema,
} from "@/validation-schemas/users";
import { getSubmitFn } from "@/util/form";
import { alertConfirm } from "@/util/alert";
import { BaseModal } from "@/components/common";
import moment from "moment-timezone";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const props = defineProps<{
  userId?: string | null;
}>();

const me = useMe();
const users = useUsers();
const deleteUser = useDeleteUser();
const updateUser = useUpdateUser();
const acceptUser = useAcceptUser();
const emit = defineEmits(["update:userId"]);

const formRef = ref<typeof VForm | null>(null);

async function handleAcceptUser(id: string) {
  const formValues = formRef.value?.getValues();
  updateUser.mutate(
    {
      id,
      ...formValues,
    },
    {
      onSuccess: () => {
        acceptUser.mutate(id, {
          onSuccess: () => {
            toastSuccess(t("userAccepted"));
            emit("update:userId", null);
          },
          onError: (error: any) => {
            toastError(error?.message || "Unknown error");
          },
        });
      },
      onError: (error: any) => {
        toastError(error?.message || "Unknown error");
      },
    }
  );
}

function onDeleteUser(id: string) {
  if (!id) return;
  alertConfirm({
    title: t("confirmDeleteUserTitle"),
    text:
      t("confirmDeleteUserText1") +
      users.data.value?.find((user) => user.id === id)?.email +
      t("confirmDeleteUserText2"),
    confirmButtonText: t("delete"),
    cancelButtonText: t("cancel"),
    onConfirm() {
      deleteUser.mutate(id, {
        onSuccess: () => {
          toastSuccess(t("userDeleted"));
          emit("update:userId", null);
        },
        onError: (error: any) => {
          toastError(error?.message || "Unknown error");
        },
      });
    },
  });
}

const courses = useCourses();

const lastUserId = ref<string | null>(null);

watch(
  () => props.userId,
  (userId) => {
    if (!userId) return;
    lastUserId.value = userId;
  }
);
const currentUserData = computed(() => {
  return users.data.value?.find((user) => user.id === lastUserId.value);
});

const serverProfileDetails = computed(() => {
  const role = currentUserData.value?.role;
  if (!role) return {};

  if (role === "AWAITINGTEACHER") {
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

const isUpdatingUser = ref(false);

const updateProfileDetails = getSubmitFn(
  currentUserData.value?.role === "TEACHER"
    ? editAdminProfileManagerSchema
    : editAdminProfileStudentSchema,
  async (values: any) => {
    isUpdatingUser.value = true;
    updateUser.mutate(
      {
        ...values,
        id: props.userId,
        courseId: values.courseId === "" ? null : values.courseId,
        isInClub: values.isInClub ? true : false,
      },
      {
        onSuccess: () => {
          toastSuccess(t("userUpdated"));
          emit("update:userId", null);
        },
        onError: (error: any) => {
          toastError(error.message || "Unknown error");
        },
        onSettled: () => {
          isUpdatingUser.value = false;
        },
      } as any
    );
  }
);

const coursesOptions = computed(() => {
  return (
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
});

const modalOpen = computed({
  get() {
    return !!props.userId;
  },
  set() {
    emit("update:userId", null);
  },
});
const isReadoOnly = computed(() => {
  return me.data.value?.role !== "ADMIN";
});
</script>

<template>
  <BaseModal v-model:model-value="modalOpen" :title="t('acceptUserTitle')">
    <div class="modal-content">
      <slot name="header">
        <h5 class="modal-title">
          {{ t("name") }} {{ currentUserData?.firstName }}
        </h5>
      </slot>
      <div class="d-flex flex-column font-big fs-6 text-dark fw-semibold">
        <span>{{ t("email") }} {{ currentUserData?.email }}</span>

        <VForm
          class="form"
          ref="formRef"
          :validation-schema="
            currentUserData?.role === 'TEACHER' ||
            currentUserData?.role === 'ADMIN'
              ? editAdminProfileManagerSchema
              : editAdminProfileStudentSchema
          "
          :initial-values="serverProfileDetails"
          @submit="updateProfileDetails"
        >
          <div class="card-body border-top">
            <ProfilePicture
              :label="t('userForm.profilePicture')"
              :image-url="currentUserData?.pictureUrl"
            />

            <DualInputGroup
              :readonly="isReadoOnly"
              :label="t('userForm.fullName')"
              name1="firstName"
              name2="lastName"
              type1="text"
              type2="text"
            />
            <TelInputGroup
              :readonly="isReadoOnly"
              :label="t('userForm.phoneNumber')"
              name="phoneNumber"
              placeholder="Número de teléfono"
              type="text"
            />

            <InputGroup
              :readonly="isReadoOnly"
              :label="t('userForm.birthDate')"
              name="birthDate"
              type="date"
              v-if="currentUserData?.role === 'AWAITINGSTUDENT'"
            />

            <InputGroup
              :readonly="isReadoOnly"
              :label="t('userForm.address')"
              name="address"
              type="text"
              v-if="currentUserData?.role === 'AWAITINGSTUDENT'"
            />

            <InputGroup
              :readonly="isReadoOnly"
              :label="t('userForm.zipCode')"
              name="zipCode"
              type="text"
              v-if="currentUserData?.role === 'AWAITINGSTUDENT'"
            />

            <InputGroup
              :readonly="isReadoOnly"
              :label="t('userForm.city')"
              name="city"
              type="text"
              v-if="currentUserData?.role === 'AWAITINGSTUDENT'"
            />

            <InputGroup
              :readonly="isReadoOnly"
              :label="t('userForm.idNumber')"
              name="idNumber"
              type="text"
              v-if="currentUserData?.role === 'AWAITINGSTUDENT'"
            />

            <InputGroup
              :readonly="isReadoOnly"
              :label="t('userForm.idIssueDate')"
              name="idIssueDate"
              type="date"
              v-if="currentUserData?.role === 'AWAITINGSTUDENT'"
            />

            <SelectGroup
              class="mb-6"
              :readonly="isReadoOnly"
              :label="t('userForm.course')"
              name="courseId"
              :options="coursesOptions"
              v-if="currentUserData?.role === 'AWAITINGSTUDENT'"
            />

            <SwitchGroup
              :readonly="isReadoOnly"
              :label="t('userForm.isInClub')"
              name="isInClub"
              v-if="currentUserData?.role === 'AWAITINGSTUDENT'"
            />
          </div>

          <div class="d-flex gap-3 flex-column flex-sm-row justify-content-end">
            <LoadableButton
              v-if="currentUserData && !isReadoOnly"
              color="danger"
              :loading="deleteUser.isLoading.value"
              @click="onDeleteUser(currentUserData.id)"
              :default-text="t('deleteUser')"
            />
            <LoadableButton
              v-if="currentUserData && !isReadoOnly"
              color="success"
              :loading="acceptUser.isLoading.value"
              @click="handleAcceptUser(currentUserData.id)"
              :default-text="t('acceptUser')"
            />
            <LoadableButton
              v-if="currentUserData && !isReadoOnly"
              color="primary"
              :loading="isUpdatingUser"
              submit
              :default-text="t('saveChanges')"
            />
          </div>
        </VForm>
      </div>
    </div>
  </BaseModal>
</template>
<i18n>
  {
  "es":{
    "deleteUser": "Eliminar usuario",
    "acceptUser": "Aceptar usuario",
    "saveChanges": "Guardar cambios",
    "name": "Nombre: ",
    "email": "Email: ",
    "acceptUserTitle": "Aceptar usuario",
    "confirmDeleteUserTitle": "Confirmar eliminación de usuario",
    "confirmDeleteUserText1": "¿Estás seguro de que quieres eliminar el usuario ",
    "confirmDeleteUserText2": "? Esta acción no se puede deshacer.",
    "userDeleted": "Usuario eliminado",
    "userUpdated": "Usuario actualizado",
    "userAccepted": "Usuario aceptado",
    "delete": "Eliminar",
    "cancel": "Cancelar",
    "noCourse": "Sin curso"

  },
  "en":{
    "deleteUser": "Delete user",
    "acceptUser": "Accept user",
    "saveChanges": "Save changes",
    "name": "Name: ",
    "email": "Email: ",
    "acceptUserTitle": "Accept user",
    "confirmDeleteUserTitle": "Confirm user deletion",
    "confirmDeleteUserText": "Are you sure you want to delete the user ",
    "confirmDeleteUserText2": "? This action cannot be undone.",
    "userDeleted": "User deleted",
    "userUpdated": "User updated",
    "userAccepted": "User accepted",
    "delete": "Delete",
    "cancel": "Cancel",
    "noCourse": "No course"
  }
  }
</i18n>
