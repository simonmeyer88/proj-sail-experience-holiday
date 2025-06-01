<template>
  <div>
    <LoadingComponent v-if="users.isLoading.value" />
    <KTDataTable
      :header="usersHeader"
      :data="users.data.value || []"
      v-else
      class="table table-striped"
    >
      <template v-slot:email="{ row: data }">
        {{ data.email }}
      </template>
      <template #phoneNumber="{ row: data }">
        {{ data.phoneNumber }}
      </template>
      <template v-slot:role="{ row: data }">
        <span
          :class="`badge fs-7 m-1 badge-light-${rolesColor[data.role]} m-0`"
        >
          {{ data.role === "AWAITINGTEACHER" ? t("teacher") : t("student") }}
        </span>
      </template>
      <template v-slot:fullName="{ row: data }">
        {{ data.firstName }} {{ data.lastName }}
      </template>
      <template #actions="{ row: data }">
        <button
          class="btn btn-primary btn-sm"
          @click="currentModalUserId = data.id"
        >
          <i class="bi bi-eye fs-2 me-md-2 me-none p-0"></i
          ><span class="d-none d-md-inline">{{ t("view") }}</span>
        </button>
      </template>
      <template #isActive="{ row: data }">
        <IsActiveSwitch :is-active="data.isActive" :id="data.id" />
      </template>
    </KTDataTable>
    <AwaitingAccModal v-model:userId="currentModalUserId" />
  </div>
</template>

<script lang="ts" setup>
import KTDataTable from "@/components/kt-datatable/KTDataTable.vue";
import { useUsers } from "@/server-state";
import { ref } from "vue";
import AwaitingAccModal from "../modals/AwaitingAccModal.vue";
import LoadingComponent from "@/components/ui/LoadingComponent.vue";
import { IsActiveSwitch } from "..";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const users = useUsers({
  roles: ["AWAITINGTEACHER", "AWAITINGSTUDENT"],
});

const rolesColor: Record<string, string> = {
  AWAITINGTEACHER: "primary",
  AWAITINGSTUDENT: "warning",
};

const usersHeader = ref([
  {
    columnName: t("desiredRole"),
    columnLabel: "role",
  },
  {
    columnName: t("fullName"),
    columnLabel: "fullName",
  },
  {
    columnName: t("email"),
    columnLabel: "email",
  },
  {
    columnName: t("phoneNumber"),
    columnLabel: "phoneNumber",
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

const currentModalUserId = ref<string | null>(null);
</script>
<i18n>
  {
    "en": {
      "desiredRole": "Desired role",
      "view": "View",
      "teacher": "Teacher",
      "student": "Student",
      "actions": "Actions",
      "isActive": "Active",
      "fullName": "Full name",
      "phoneNumber": "Phone number",
      "email": "Email",
      
    },
    "es": {
      "desiredRole": "Rol deseado",
      "view": "Ver",
      "teacher": "Profesor",
      "student": "Estudiante",
      "actions": "Acciones",
      "isActive": "Activo",
      "fullName": "Nombre completo",
      "phoneNumber": "Número de teléfono",
      "email": "Email",
      
    }
  }
</i18n>
