<template>
  <BaseModal v-model:model-value="modalOpen" :title="t('userModalTitle')">
    <div>
      <LoadingComponent v-if="isLoading" :height="500" />

      <template v-else>
        <div class="d-flex flex-column font-big fs-6 text-dark fw-semibold">
          <span
            class="fw-bold fs-3 pb-2 mb-2 border-bottom border-bottom-dashed"
          >
            {{ t("email") }} {{ currentUserData?.email }}</span
          >

          <div v-if="currentUserData?.role === 'STUDENT'">
            <UserPayments :user="currentUserData" show-title />
          </div>

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
            <div class="card-body mt-4">
              <ProfilePicture
                :label="t('userForm.profilePicture')"
                :image-url="
                  currentUserData?.pictureUrl ||
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
                v-if="currentUserData?.role === 'STUDENT'"
              />

              <InputGroup
                :readonly="isReadonly"
                :label="t('userForm.address')"
                name="address"
                type="text"
                v-if="currentUserData?.role === 'STUDENT'"
              />

              <InputGroup
                :readonly="isReadonly"
                :label="t('userForm.zipCode')"
                name="zipCode"
                type="text"
                v-if="currentUserData?.role === 'STUDENT'"
              />

              <InputGroup
                :readonly="isReadonly"
                :label="t('userForm.city')"
                name="city"
                type="text"
                v-if="currentUserData?.role === 'STUDENT'"
              />

              <InputGroup
                :readonly="isReadonly"
                :label="t('userForm.idNumber')"
                name="idNumber"
                type="text"
                v-if="currentUserData?.role === 'STUDENT'"
              />

              <InputGroup
                :readonly="isReadonly"
                :label="t('userForm.idIssueDate')"
                name="idIssueDate"
                type="date"
                v-if="currentUserData?.role === 'STUDENT'"
              />

              <SelectGroup
                class="mb-6"
                :readonly="isReadonly"
                :label="t('userForm.course')"
                name="courseId"
                :options="
                  courses.data.value
                    ?.map((course) => {
                      return {
                        label: course.name,
                        value: course.id,
                      };
                    })
                    .concat({
                      label: t('noCourse'),
                      value: '',
                    }) || []
                "
                v-if="currentUserData?.role === 'STUDENT'"
              />

              <SwitchGroup
                :readonly="isReadonly"
                :label="t('userForm.isInClub')"
                name="isInClub"
                v-if="currentUserData?.role === 'STUDENT'"
              />
            </div>

            <div
              class="d-flex gap-3 flex-column flex-sm-row justify-content-end"
            >
              <LoadableButton
                v-if="currentUserData && !isReadonly"
                color="danger"
                :loading="deleteUser.isLoading.value"
                @click="onDeleteUser(currentUserData.id)"
                :default-text="t('deleteUser')"
              />
              <LoadableButton
                v-if="currentUserData && !isReadonly"
                color="primary"
                :loading="isUpdatingUser"
                submit
                :default-text="t('updateUser')"
              />
            </div>
          </VForm>
        </div>
      </template>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed, ref, toRefs } from "vue";
import {
  useUser,
  useCourses,
  useDeleteUser,
  useUpdateUser,
  useMe,
} from "@/server-state";
import { toastSuccess, toastError } from "@/util/toast";
import { Form as VForm } from "vee-validate";
import { getAssetPath } from "@/core/helpers/assets";

import {
  InputGroup,
  SelectGroup,
  SwitchGroup,
  DualInputGroup,
  LoadableButton,
  TelInputGroup,
} from "@/components/form";
import { LoadingComponent } from "@/components/ui";
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
import UserPayments from "@/components/user-management/UserPayments.vue";

const props = defineProps<{
  userId?: string | null;
}>();

const { userId } = toRefs(props);

const me = useMe();

const deleteUser = useDeleteUser();
const updateUser = useUpdateUser();

const emit = defineEmits(["update:userId"]);

function onDeleteUser(id: string) {
  if (!id) return;
  alertConfirm({
    title: t("confirmDeleteUserTitle"),
    text: t("confirmDeleteUserText") + currentUserData.value?.email + ".",
    confirmButtonText: t("deleteUser"),
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

const user = useUser(
  computed(() => userId?.value || null),
  { keepPreviousData: true }
);

const currentUserData = computed(() => {
  return user.data.value || null;
});

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

const { t } = useI18n();

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
          toastError(t(error.message) || "Unknown error");
        },
        onSettled: () => {
          isUpdatingUser.value = false;
        },
      } as any
    );
  }
);

const modalOpen = computed({
  get() {
    return !!props.userId;
  },
  set() {
    emit("update:userId", null);
  },
});

const isReadonly = computed(() => {
  return me.data.value?.role !== "ADMIN";
});

const isLoading = computed(() => {
  return !!(userId?.value && userId?.value !== currentUserData?.value?.id);
});
</script>

<i18n>
  {
    "en":{
      "userUpdated":"User updated",
      "userModalTitle":"User details",
      "email":"Email",
      "deleteUser":"Delete user",
      "updateUser":"Update user",
      "confirmDeleteUserTitle":"Confirm delete user",
      "confirmDeleteUserText":"Are you sure you want to delete user ",
      "noCourse":"No course",
    },
    "es":{
      "userUpdated":"Usuario actualizado",
      "userModalTitle":"Detalles del usuario",
      "email":"Email",
      "deleteUser":"Borrar usuario",
      "updateUser":"Actualizar usuario",
      "confirmDeleteUserTitle":"Confirmar borrado de usuario",
      "confirmDeleteUserText":"¿Estás seguro de que quieres borrar el usuario ",
      "noCourse":"Sin curso",
    }
  }
</i18n>
