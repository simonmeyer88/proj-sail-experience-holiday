<template>
  <ElTabs @tab-change="handleTabChange" :model-value="currTab">
    <ElTabPane :label="t('students')"> </ElTabPane>
    <ElTabPane :label="t('teachers')"> </ElTabPane>
    <ElTabPane :label="t('admins')"> </ElTabPane>
    <ElTabPane :label="t('approval')"> </ElTabPane>
    <ElTabPane :label="t('newUsers')"> </ElTabPane>
    <TransitionGroup name="fade">
      <StudentsTab v-if="currTab === '0'" data-testid="students-tab" />
      <TeachersTab v-if="currTab === '1'" data-testid="teachers-tab" />
      <AdminsTab v-if="currTab === '2'" data-testid="admins-tab" />
      <AwaitingAccTab v-if="currTab === '3'" data-testid="approval-tab" />
      <NewUsersTab v-if="currTab === '4'" data-testid="new-users-tab" />
    </TransitionGroup>
  </ElTabs>
</template>
<i18n>
  {
    "en": {
      "students": "Students",
      "teachers": "Teachers",
      "admins": "Administrators",
      "approval": "Awaiting approval",
      "newUsers": "New users",
      "close": "Close",
      "phoneNotFoundTitle": "Phone number not found",
      "phoneNotFoundText": "The incoming call's phone number is not associated with any user in our system"
    },
    "es": {
      "students": "Estudiantes",
      "teachers": "Profesores",
      "admins": "Administradores",
      "approval": "Esperando aprobación",
      "newUsers": "Nuevos usuarios",
      "close": "Cerrar",
      "phoneNotFoundTitle": "Número de teléfono no encontrado",
      "phoneNotFoundText": "El número de teléfono de la llamada entrante no está asociado a ningún usuario en nuestro sistema",
    }
  }
</i18n>
<style scoped>
.fade-enter-active {
  transition: opacity 0.1s ease 0.1s;
}

.fade-leave-active {
  transition: opacity 0.1s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

<script lang="ts" setup>
import { ref } from "vue";
import {
  StudentsTab,
  TeachersTab,
  AdminsTab,
  AwaitingAccTab,
  NewUsersTab,
} from "@/components/user-management/tabs";
import { ElTabs, ElTabPane, type TabPaneName } from "element-plus";
import { useQueryClient } from "@tanstack/vue-query";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import { alertError } from "@/util/alert";
import ApiService from "@/core/services/ApiService";
import { UsersFindOneResponse } from "@/server-state";

const queryClient = useQueryClient();

const { t } = useI18n();

const route = useRoute();
const router = useRouter();

const findUserByNumber = async (phone: string) => {
  try {
    const user = (await ApiService.get(
      `users/phone/+${phone}`
    )) as UsersFindOneResponse;

    if (user) {
      router.replace({
        name: "management.users.view",
        params: { id: user.id },
      });
    }
  } catch {
    alertError({
      title: t("phoneNotFoundTitle"),
      text: t("phoneNotFoundText"),
      confirmButtonText: t("close"),
      onClose: () => {
        router.replace({
          name: "management.users",
        });
      },
    });
  }
};

if (route.query.caller) {
  const routeQuery = route.query.caller as string;
  const callerInfo = routeQuery.split(":");
  const phoneNumber = callerInfo[0].trim();

  if (phoneNumber) findUserByNumber(phoneNumber);
}

const currTab = ref("0");
const tabs = {
  "0": {
    roles: ["STUDENT"],
  },
  "1": {
    roles: ["TEACHER"],
  },
  "2": {
    roles: ["ADMIN"],
  },
  "3": {
    roles: ["AWAITINGTEACHER", "AWAITINGSTUDENT"],
  },
  "4": {
    roles: ["NEWUSER"],
  },
};
const handleTabChange = (newTab: TabPaneName) => {
  currTab.value = newTab as string;
  queryClient.invalidateQueries(["users", tabs[newTab as keyof typeof tabs]]);
};
</script>
