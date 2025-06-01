<template>
  <div>
    <LoadingComponent v-if="users.isLoading.value" />
    <KTDataTable
      v-else
      :header="usersHeader"
      :data="users.data.value || []"
      class="table table-striped mw-500px"
    >
      <template v-slot:email="{ row: data }">
        {{ data.email }}
      </template>
      <template v-slot:actions="{ row: data }">
        <button
          :disabled="me.data.value?.role !== 'ADMIN'"
          type="button"
          class="btn btn-danger btn-sm"
          @click="handleDeleteUser(data.id)"
        >
          <i class="bi bi-trash fs-2 me-md-2 me-none p-0"></i
          ><span class="d-none d-md-inline">
            {{ t("deleteUser") }}
          </span>
        </button>
      </template>
      <template v-slot:isActive="{ row: data }">
        <IsActiveSwitch :is-active="data.isActive" :id="data.id" />
      </template>
    </KTDataTable>
  </div>
</template>

<script lang="ts" setup>
import KTDataTable from "@/components/kt-datatable/KTDataTable.vue";
import { useDeleteUser, useMe, useUsers } from "@/server-state";
import { alertConfirm } from "@/util/alert";
import { toastError, toastSuccess } from "@/util/toast";
import { ref } from "vue";
import LoadingComponent from "@/components/ui/LoadingComponent.vue";
import { IsActiveSwitch } from "..";
import { useI18n } from "vue-i18n";

const me = useMe();
const deleteUser = useDeleteUser();
const users = useUsers({
  roles: ["NEWUSER"],
});

const { t } = useI18n();

const usersHeader = ref([
  {
    columnName: t("email"),
    columnLabel: "email",
  },
  {
    columnName: t("actions"),
    columnLabel: "actions",
  },
  {
    columnName: t("isActive"),
    columnLabel: "isActive",
  },
]);

const handleDeleteUser = (userId: string) => {
  alertConfirm({
    title: "Eliminar usuario",
    text: "¿Estás seguro que deseas eliminar este usuario?",
    confirmButtonText: "Eliminar",
    cancelButtonText: "Cancelar",
    onConfirm: () => {
      deleteUser.mutate(userId, {
        onSuccess: () => {
          toastSuccess("Usuario eliminado exitosamente");
        },
        onError: () => {
          toastError("Error al eliminar usuario");
        },
      });
    },
  });
};
</script>
<i18n>
  {
    "en": {
      "email": "Email",
      "actions": "Actions",
      "isActive": "Is active",
      "deleteUser": "Delete user"
    },
    "es": {
      "email": "Email",
      "actions": "Acciones",
      "isActive": "Activo",
      "deleteUser": "Eliminar usuario"
    }
  }
</i18n>
