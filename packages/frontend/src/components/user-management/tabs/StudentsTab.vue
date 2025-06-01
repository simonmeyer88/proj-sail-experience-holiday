<template>
  <div>
    <div class="filters">
      <div class="d-flex gap-1 flex-column w-100">
        <span class="fw-bold">
          {{ t("search") }}
        </span>

        <div class="d-flex position-relative align-items-center gap-10">
          <i
            class="ki-solid ki-magnifier fs-3 position-absolute text-primary ms-4"
          >
          </i>
          <input
            v-model="search"
            type="text"
            class="form-control-sm form-control ps-14 fs-4"
          />
        </div>
      </div>

      <div class="d-flex gap-1 flex-column w-100">
        <span class="fw-bold">
          {{ t("isInClub") }}
        </span>
        <select
          class="form-select form-control-sm form-select-sm"
          v-model="selectUserIsInClub"
          data-testid="select-is-in-club"
        >
          <option selected value="null">
            {{ t("any") }}
          </option>
          <option value="true">
            {{ t("yes") }}
          </option>
          <option value="false">
            {{ t("no") }}
          </option>
        </select>
      </div>
      <div class="d-flex gap-1 flex-column w-100">
        <span class="fw-bold">
          {{ t("hasPaid") }}
        </span>
        <select
          class="form-select form-select-sm"
          v-model="selectHasPaid"
          data-testid="select-has-paid"
        >
          <option selected value="null">
            {{ t("any") }}
          </option>
          <option value="true">
            {{ t("yes") }}
          </option>
          <option value="false">
            {{ t("no") }}
          </option>
        </select>
      </div>
      <div class="d-flex gap-1 flex-column w-100">
        <span class="fw-bold">
          {{ t("pendingTask") }}
        </span>
        <select
          class="form-select form-select-sm"
          v-model="pendingTaskId"
          data-testid="select-has-paid"
        >
          <option selected value="null">
            {{ t("any") }}
          </option>
          <option
            v-for="event in predefinedEvents.data.value"
            :key="event.id"
            :value="event.id"
          >
            {{ event.title }}
          </option>
        </select>
      </div>

      <div class="progress-filter d-flex gap-1 flex-column w-100">
        <span class="fw-bold">{{ t("progress") }}</span>
        <input
          v-model="minProgress"
          type="range"
          class="form-range align-items-end w-100"
          min="0"
          max="100"
          step="1"
        />
      </div>

      <div class="d-flex gap-1 flex-column w-100">
        <span class="fw-bold">
          {{ t("course") }}
        </span>
        <select class="form-select form-select-sm" v-model="courseId">
          <option selected value="null">
            {{ t("any") }}
          </option>
          <option
            v-for="course in courses.data.value"
            :key="course.id"
            :value="course.id"
          >
            {{ course.name }}
          </option>
        </select>
      </div>

      <div class="d-flex gap-1 flex-column w-100">
        <span class="fw-bold">
          {{ t("calendarAccess") }}
        </span>
        <select
          class="form-select form-select-sm"
          v-model="selectCalendarAccess"
          data-testid="select-has-paid"
        >
          <option selected value="null">
            {{ t("any") }}
          </option>
          <option value="false">
            {{ t("blocked") }}
          </option>
          <option value="true">
            {{ t("available") }}
          </option>
        </select>
      </div>

      <div class="d-flex gap-1 flex-column w-100">
        <span class="fw-bold">
          {{ t("registration") }}
        </span>
        <select class="form-select form-select-sm" v-model="selectCreatedAt">
          <option selected value="desc">
            {{ t("newestFirst") }}
          </option>
          <option value="asc">
            {{ t("oldestFirst") }}
          </option>
        </select>
      </div>
    </div>

    <LoadingComponent v-if="users.isLoading.value" />

    <KTDataTable :header="usersHeader" :data="filteredUsers" v-else>
      <template #userInfo="{ row: data }">
        <UserInfo v-bind="data" @click="onUserSelect(data.id)" />
      </template>

      <template #progress="{ row: data }">
        <div class="d-flex align-items-center">
          <div class="progress w-100px me-2 border border-success">
            <div
              data-testid="progress-bar"
              class="progress-bar bg-success"
              role="progressbar"
              :style="{ width: data.progress + '%' }"
              aria-valuenow="50"
              aria-valuemin="0"
              aria-valuemax="100"
            ></div>
          </div>
          <span class="fs-7" data-testid="progress-value"
            >{{ data.progress }}%</span
          >
        </div>
      </template>
      <template #phoneNumber="{ row: data }">
        {{ data.phoneNumber }}
      </template>
      <template #idNumber="{ row: data }">
        {{ data.idNumber }}
      </template>

      <template #createdAt="{ row: data }">
        {{ moment(data.createdAt).format("DD/MM/YYYY") }}
      </template>

      <template #course="{ row: data }">
        <span
          :class="`badge fs-7 m-1 badge-${
            data.course?.name ? 'light-success' : 'light-danger'
          } m-0`"
        >
          {{ data.course?.name || "No asignado" }}
        </span>
      </template>
      <template #isInClub="{ row: data }">
        <span
          :class="`badge fs-7 m-1 badge-${
            data.isInClub ? 'light-success' : 'light-danger'
          } m-0`"
        >
          {{ data.isInClub ? t("yes") : t("no") }}
        </span>
      </template>
      <template #isActive="{ row: data }">
        <IsActiveSwitch
          class="mx-auto"
          :is-active="data.isActive"
          :id="data.id"
        />
      </template>

      <template #isCalendarEnable="{ row: data }">
        <button
          @click="handleUpdateCalendarAccess(data)"
          class="btn btn-sm"
          :style="{
            minWidth: '130px',
          }"
          :class="{
            'btn-danger': data.isCalendarEnable,
            'btn-success': !data.isCalendarEnable,
          }"
          type="button"
        >
          {{ data.isCalendarEnable ? t("block") : t("enable") }} calendar
        </button>
      </template>
    </KTDataTable>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";

import KTDataTable from "@/components/kt-datatable/KTDataTable.vue";
import {
  useCourses,
  usePredefinedEvents,
  useUpdateCalendarAccess,
  useUsers,
} from "@/server-state";
import UserInfo from "../UserInfo.vue";
import { refDebounced } from "@/composables/useDebouncedRef";
import { LoadingComponent } from "@/components/ui";
import { IsActiveSwitch } from "..";
import { useI18n } from "vue-i18n";
import { alertConfirm } from "@/util/alert";
import { useRouter } from "vue-router";
import moment from "moment-timezone";

const router = useRouter();

const search = ref("");
const selectUserIsInClub = ref("null");
const selectHasPaid = ref("null");
const selectCalendarAccess = ref("null");
const selectCreatedAt = ref<"asc" | "desc">("desc");
const minProgress = ref(0);
const debouncedSearch = refDebounced(search, 300);

const predefinedEvents = usePredefinedEvents();
const pendingTaskId = ref<string | null>(null);

const courses = useCourses();
const courseId = ref<string | null>(null);

const users = useUsers(
  {
    roles: ["STUDENT"],
    search: debouncedSearch,
    pendingTaskId: computed(() =>
      pendingTaskId.value === "null" ? null : pendingTaskId.value
    ),
    courseId: computed(() =>
      courseId.value === "null" ? null : courseId.value
    ),
    createdAt: selectCreatedAt,
  },
  {
    keepPreviousData: true,
  }
);

const filteredUsers = computed(() =>
  (users.data?.value || [])
    .filter((user) => user.progress >= minProgress.value)
    .filter((user) => {
      if (selectUserIsInClub.value === "null") return true;
      return user.isInClub === (selectUserIsInClub.value === "true");
    })
    .filter((user) => {
      if (selectHasPaid.value === "null") return true;
      return user.hasPaid === (selectHasPaid.value === "true");
    })
    .filter((user) => {
      if (selectCalendarAccess.value === "null") return true;
      return user.isCalendarEnable === (selectCalendarAccess.value === "true");
    })
);

const { t } = useI18n();

const updateCalendarAccess = useUpdateCalendarAccess();

const usersHeader = ref([
  {
    columnName: t("userInfo"),
    columnLabel: "userInfo",
  },

  {
    columnName: t("progress"),
    columnLabel: "progress",
    center: true,
  },
  {
    columnName: t("phoneNumber"),
    columnLabel: "phoneNumber",
    center: true,
  },
  {
    columnName: t("idNumber"),
    columnLabel: "idNumber",
    center: true,
  },
  {
    columnName: t("registration"),
    columnLabel: "createdAt",
    center: true,
  },
  {
    columnName: t("course"),
    columnLabel: "course",
    center: true,
  },
  {
    columnName: t("isInClub"),
    columnLabel: "isInClub",
    center: true,
  },
  {
    columnName: t("isActive"),
    columnLabel: "isActive",
    center: true,
  },
  {
    columnName: t("calendarAccess"),
    columnLabel: "isCalendarEnable",
    center: true,
  },
]);

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

const onUserSelect = async (id: string) => {
  await router.push({
    name: "management.users.view",
    params: {
      id,
    },
  });
};
</script>

<style scoped lang="scss">
.filters {
  column-gap: 16px;
  row-gap: 8px;
  display: grid;
  margin-bottom: 24px;
  grid-template-columns: repeat(4, 1fr);

  @media screen and (max-width: 1023px) {
    grid-template-columns: repeat(3, 1fr);

    .progress-filter {
      order: 999;
    }
  }

  @media screen and (max-width: 501px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media screen and (max-width: 360px) {
    grid-template-columns: 1fr;
  }
}

select {
  min-height: calc(1.5em + 1.1rem + 7px);
}
</style>

<i18n>
  {
    "en": {
      "userInfo": "User",
      "progress": "Progress",
      "phoneNumber": "Phone number",
      "idNumber": "DNI",
      "course": "Course",
      "isInClub": "Club",
      "actions": "Actions",
      "isActive": "Active",
      "pendingTask": "Pending task",
      "any": "Any",
      "yes": "Yes",
      "no": "No",
      "tasksProgress": "Tasks progress",
      "hasPaid": "Has paid",
      "calendarAccess": "Calendar Access",
      "blocked": "Blocked",
      "block": "Block",
      "enable": "Enable",
      "cancel": "Cancel",
      "available": "Available",
      "areYouSure": "Are you sure you want to block calendar for {name}?",
      "userWillNotHaveAccess": "The user will not have access to calendar events for 15 days",
      "registration": "Registration",
      "newestFirst": "Newest first",
      "oldestFirst": "Oldest first",
      "search": "Search"
    },
    "es": {
      "userInfo": "Usuario",
      "progress": "Progreso",
      "phoneNumber": "Número de teléfono",
      "idNumber": "DNI",
      "course": "Curso",
      "isInClub": "Club",
      "actions": "Acciones",
      "isActive": "Activo",
      "pendingTask": "Tarea pendiente",
      "any": "Cualquiera",
      "yes": "Sí",
      "no": "No",
      "tasksProgress": "Progreso de tareas",
      "hasPaid": "Ha pagado",
      "calendarAccess": "Acceso al calendario",
      "blocked": "Obstruido",
      "block": "Bloquear",
      "cancel": "Cancelar",
      "enable": "Habilitar",
      "available": "Disponible",
      "areYouSure": "¿Estás seguro de que deseas bloquear el calendario para {name}?",
      "userWillNotHaveAccess": "El usuario no tendrá acceso a los eventos del calendario durante 15 días",
      "registration": "Registro",
      "newestFirst": "El más nuevo",
      "oldestFirst": "Más antiguo",
      "search": "Buscar"
    }
  }
</i18n>
