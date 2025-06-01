<template>
  <div>
    <LoadingComponent v-if="users.isLoading.value" />
    <KTDataTable v-else :header="usersHeader" :data="users.data.value || []">
      <template #userInfo="{ row: data }">
        <UserInfo v-bind="data" @click="currentModalUserId = data.id" />
      </template>

      <template #phoneNumber="{ row: data }">
        {{ data.phoneNumber }}
      </template>
      <template #isActive="{ row: data }">
        <IsActiveSwitch :is-active="data.isActive" :id="data.id" />
      </template>

      <template #actions="{ row: data }">
        <button
          type="button"
          class="btn btn-primary btn-sm"
          @click="currentModalUserId = data.id"
        >
          <i class="bi bi-eye fs-2 me-md-2 me-none p-0"></i
          ><span class="d-none d-md-inline">Ver</span>
        </button>
      </template>
    </KTDataTable>

    <UserModal v-model:userId="currentModalUserId" />
  </div>
</template>

<script lang="ts" setup>
import KTDataTable from "@/components/kt-datatable/KTDataTable.vue";
import { useUsers } from "@/server-state";
import { ref } from "vue";
import UserModal from "../modals/UserModal.vue";
import LoadingComponent from "@/components/ui/LoadingComponent.vue";
import { IsActiveSwitch } from "..";
import UserInfo from "../UserInfo.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const users = useUsers({
  roles: ["TEACHER"],
});

const usersHeader = ref([
  {
    columnName: t("userInfo"),
    columnLabel: "userInfo",
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
    "es": {
      "userInfo": "Usuario",
      "phoneNumber": "Número de teléfono",
      "actions": "Acciones",
      "isActive": "Activo",
    },
    "en": {
      "userInfo": "User",
      "phoneNumber": "Phone number",
      "actions": "Actions",
      "isActive": "Active",
    }
  }
</i18n>
