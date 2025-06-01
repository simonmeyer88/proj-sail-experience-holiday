<i18n>
  {
    "en":{
      "slots": "Slots",
      "takenSlots": "Taken slots",
      "freeSlots": "Free slots",
      "description": "Description",
      "startDate": "Start",
      "endDate": "End",
      "update": "Update",
      "edit": "Edit",
      "delete": "Delete",
      "noDescription": "No description",
      "seeUsers": "See users",
      "course": "Course",
      "createChat": "Create chat",
      "waitlist": "Waitlist",
      "bookingDisabled": "Booking disabled"
    },
    "es":{
      "slots": "Plazas",
      "takenSlots": "Plazas cogidas",
      "freeSlots": "Plazas disponibles",
      "description": "Descripción",
      "startDate": "Comienzo",
      "endDate": "Finalización",
      "edit": "Editar",
      "update": "Actualizar",
      "delete": "Eliminar",
      "noDescription": "Sin descripción",
      "seeUsers": "Ver usuarios",
      "course": "Curso",
      "createChat": "Crear chat",
      "waitlist": "Lista de espera",
      "bookingDisabled": "Reserva deshabilitado"
    }
  }
</i18n>

<template>
  <!--@mousedown.prevent.stop prevents full-calendar popover from closing when this is clicked-->
  <div class="d-flex flex-column gap-2" @mousedown.prevent.stop>
    <span v-if="!isWoocommerce && event.enableBooking">
      <span class="fw-bold">
        {{ t("slots") }}
      </span>
      {{ event.totalSlots }}
    </span>

    <span v-if="isWoocommerce">
      <span class="fw-bold"> Status </span>
      <span class="fw-bold" :class="getOrderStatus(event.status)">
        {{ toCapitalise(event.status) }}
      </span>
    </span>

    <span>
      <span class="fw-bold">
        {{ t("takenSlots") }}
      </span>
      {{ isWoocommerce ? event.usersCount : event.users.length }}

      <button
        @click="
          emit(
            isWoocommerce ? 'showOrdersModal' : 'showUsersModal',
            arg.event.id
          )
        "
        class="btn btn-sm btn-dark"
        style="height: 24px; padding-block: 3px; padding-inline: 6px"
      >
        <i class="ki-duotone ki-eye fs-4">
          <i class="path1"></i>
          <i class="path2"></i>
          <i class="path3"></i>
        </i>
        {{ t("seeUsers") }}
      </button>
    </span>

    <span v-if="!isWoocommerce">
      <span class="fw-bold">
        {{ t("waitlist") }}
      </span>
      {{ event.waitlist.length }}

      <button
        @click="emit('showWaitlistModal', arg.event.id)"
        class="btn btn-sm btn-dark"
        style="height: 24px; padding-block: 3px; padding-inline: 6px"
      >
        <i class="ki-duotone ki-eye fs-4">
          <i class="path1"></i>
          <i class="path2"></i>
          <i class="path3"></i>
        </i>

        {{ t("seeUsers") }}
      </button>
    </span>

    <span v-if="!isWoocommerce && event.enableBooking">
      <span class="fw-bold">
        {{ t("freeSlots") }}
      </span>
      {{ event.totalSlots - event.users.length }}
    </span>
    <span v-if="!isWoocommerce">
      <span class="fw-bold">
        {{ t("course") }}
      </span>
      {{
        !event.isClub
          ? event.courses.map((c: any) => c.name).join(", ")
          : "Club"
      }}
    </span>
    <span>
      <span class="fw-bold">
        {{ t("startDate") }}
      </span>
      {{
        isWoocommerce
          ? formatDate(event.startDate)
          : format(event.startDate, "dd/MM/yyyy HH:mm")
      }}
    </span>
    <span>
      <span class="fw-bold">
        {{ t("endDate") }}
      </span>

      {{
        isWoocommerce
          ? formatDate(event.endDate)
          : format(event.endDate, "dd/MM/yyyy HH:mm")
      }}
    </span>
    <span>
      <span class="fw-bold">
        {{ t("description") }}
      </span>
      {{ event.description || t("noDescription") }}
    </span>

    <span class="text-danger" v-if="!event.enableBooking">
      <span class="fw-bold">
        {{ t("bookingDisabled") }}
      </span>
    </span>

    <div v-if="!isWoocommerce" class="d-flex flex-row gap-2">
      <button
        class="btn btn-primary btn-sm"
        @click="emit('updateEventOpen', arg.event.id)"
      >
        {{ t("edit") }}
      </button>
      <button
        class="btn btn-danger btn-sm"
        @click="emit('deleteEvent', arg.event)"
      >
        {{ t("delete") }}
      </button>
      <button
        :disabled="event.users.length === 0"
        class="btn btn-success btn-sm"
        @click="emit('showCreateChatModal', arg.event.id)"
      >
        {{ t("createChat") }}
      </button>
    </div>
  </div>
</template>

<style>
.custom-title .el-popover__title {
  font-weight: 600;
  font-size: 1.7rem;
}
</style>

<script lang="ts" setup>
import { computed, PropType } from "vue";
import { format } from "date-fns";
import { useI18n } from "vue-i18n";
import { BookingStatus } from "@aula-anclademia/backend/src/woocommerce/dto/get-bookings.response.dto";

const props = defineProps({
  arg: Object as PropType<any>,
});

const { t } = useI18n();

const emit = defineEmits([
  "deleteEvent",
  "updateEventOpen",
  "showUsersModal",
  "showOrdersModal",
  "showWaitlistModal",
  "showCreateChatModal",
]);

const toCapitalise = (str: string) => str[0].toUpperCase() + str.slice(1);

const isWoocommerce = computed(
  () => props.arg?.event.extendedProps.woocommerce
);

const event = computed(() => props.arg.event.extendedProps);

const getOrderStatus = (status: BookingStatus) => {
  return {
    "text-success": status === "complete",
    "text-primary": status === "paid",
    "text-danger": status === "cancelled",
    "text-warning": status === "unpaid" || status === "pending",
  };
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);

  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}`;
};
</script>
