<template>
  <div>
    <LoadingComponent v-if="users.isLoading.value" />
    <KTDataTable :header="usersHeader" :data="users.data.value || []" v-else>
      <template #userInfo="{ row: data }">
        <UserInfo v-bind="data" @click="currentModalUserId = data.id" />
      </template>
      <template #phoneNumber="{ row: data }">
        {{ data.phoneNumber }}
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
import UserInfo from "../UserInfo.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const users = useUsers({
  roles: ["ADMIN"],
});

const usersHeader = ref([
  {
    columnName: t("user"),
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
]);

const currentModalUserId = ref<string | null>(null);
</script>
<i18n>
  {
    "en": {
      "user": "User",
      "phoneNumber": "Phone number",
      "actions": "Actions"
    },
    "es": {
      "user": "Usuario",
      "phoneNumber": "Número de teléfono",
      "actions": "Acciones"
    }
  }
</i18n>
