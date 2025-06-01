<i18n>
  {
    "en": {
      "completed": "Completed",
      "booked": "Booked",
      "delete": "Delete",
      "start": "Start",
      "end": "End",
      "askDelete1": "The task is completed, are you sure you want to delete it?",
      "askDelete2": "The task is pending, that is, the user has signed up for the event but it has not yet been held, are you sure you want to delete it?",
      "cancel": "Cancel",
      "successDeleteUserOnEvent": "Task deleted from event successfully",
      "deleteTask": "Delete task",
      "noDescription": "No description"

    },
    "es": {
      "completed": "Completado",
      "booked": "Reservado",
      "delete": "Eliminar",
      "start": "Inicio",
      "end": "Fin",
      "askDelete1": "La tarea está completada, ¿estás seguro de que quieres eliminarla?",
      "askDelete2": "La tarea está pendiente, es decir, el usuario se ha apuntado al evento pero todavía no se ha celebrado, ¿estás seguro de que quieres eliminarla?",
      "cancel": "Cancelar",
      "successDeleteUserOnEvent": "Tarea eliminada del evento correctamente",
      "deleteTask": "Eliminar tarea",
      "noDescription": "Sin descripción"
    }
  }
</i18n>

<template>
  <div
    data-testid="event-card"
    class="card card-flush border h-100 shadow-sm"
    :class="{
      'border-success': event.isCompleted,
      'border-primary': !event.isCompleted,
    }"
  >
    <div class="card-header flex-nowrap">
      <div class="card-title mb-0 fw-bold fs-3" style="overflow: hidden">
        {{
          props.event?.event.predefinedEvent?.title || props.event?.event?.title
        }}
      </div>
      <div class="card-toolbar flex-nowrap ml-4">
        <span
          class="badge badge-light-success fw-bold fs-7 me-1 px-3 py-2"
          v-if="event.isCompleted"
        >
          {{ t("completed") }}
          <i class="ki-duotone ki-check-square ms-1 fs-3">
            <i class="path1"></i>
            <i class="path2"></i>
          </i>
        </span>
        <span
          class="badge badge-light-primary fw-bold fs-7 me-1 px-3 py-2"
          v-else
        >
          {{ t("booked") }}
          <i class="ki-duotone ki-check-square fs-3 ms-1">
            <i class="path1"></i>
            <i class="path2"></i>
          </i>
        </span>
        <ElDropdown
          size="large"
          :hide-on-click="false"
          trigger="click"
          v-if="showActions"
        >
          <span class="dropdown-icon" data-testid="event-card-menu-trigger">
            <i class="bi bi-three-dots-vertical fs-2 text-primary"></i>
          </span>
          <template #dropdown>
            <el-dropdown-menu data-testid="event-card-menu-dropdown">
              <el-dropdown-item @click="handleDeleteUserOnEvent(props.event)">
                <i class="ki-solid ki-trash-square text-danger fs-1"></i>
                {{ t("delete") }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </ElDropdown>
      </div>
    </div>
    <div class="card-body pt-2 d-flex flex-column justify-content-between">
      <span class="text-gray-600 fs-5 fw-semibold">
        {{ eventDescription }}
      </span>
      <div class="d-flex gap-6 mt-4">
        <div class="px-4 py-4 border border-dashed border-gray-400 rounded">
          <span class="fw-bold">
            {{ moment(eventStartDate).format("DD/MM/YYYY hh:mm") }}
          </span>
          <span class="fw-semibold text-gray-600 d-block">
            {{ t("start") }}
          </span>
        </div>
        <div class="px-4 py-4 border border-dashed border-gray-400 rounded">
          <span class="fw-bold">
            {{ moment(eventEndDate).format("DD/MM/YYYY hh:mm") }}
          </span>
          <span class="fw-semibold text-gray-600 d-block d-block">
            {{ t("end") }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElDropdown, ElDropdownMenu, ElDropdownItem } from "element-plus";
import { useDeleteStudentOnEvent } from "@/server-state/events";
import moment from "moment-timezone";
import { alertConfirm } from "@/util/alert";
import { toastSuccess } from "@/util/toast";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const props = defineProps<{
  event: any;
  showActions?: boolean;
}>();

const eventDescription = props.event.event.description || t("noDescription");

// eslint-disable-next-line vue/no-setup-props-destructure
const eventStartDate = props.event.event.startDate;
// eslint-disable-next-line vue/no-setup-props-destructure
const eventEndDate = props.event.event.endDate;

const deleteStudentOnEvent = useDeleteStudentOnEvent();

const handleDeleteUserOnEvent = async (userOnEvent: any) => {
  alertConfirm({
    title: t("deleteTask"),
    text: userOnEvent.isCompleted === true ? t("askDelete1") : t("askDelete2"),
    confirmButtonText: t("delete"),
    cancelButtonText: t("cancel"),
    onConfirm: async () => {
      deleteStudentOnEvent.mutate(
        {
          studentId: userOnEvent.userId,
          eventId: userOnEvent.eventId,
        },

        {
          onSuccess: () => {
            toastSuccess(t("successDeleteUserOnEvent"));
          },
        }
      );
    },
  });
};
</script>
