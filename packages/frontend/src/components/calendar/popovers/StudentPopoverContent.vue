<i18n>
  {
    "en":{
      "slots": "Slots",
      "bookingState": "Booking state",
      "booked": "Booked",
      "notBooked": "Not booked",
      "takenSlots": "Taken slots",
      "freeSlots": "Free slots",
      "description": "Description",
      "startDate": "Start",
      "endDate": "End",
      "noDescription": "No description",
      "seeUsers": "See users",
      "bookSlot": "Book slot",
      "cancelBooking": "Cancel booking",
      "cancellationNotPermitted": "Cancellation are not permitted within 48 hours",
      "contactSupport": "Please contact support",
      "inWaitlist": "In waitlist",
      "leaveWaitlist": "Leave waitlist",
      "joinWaitlist": "Sign up to waitlist"
    },
    "es":{
      "slots": "Plazas",
      "bookingState": "Estado de reserva",
      "booked": "Reservado",
      "notBooked": "No reservado",
      "takenSlots": "Plazas cogidas",
      "freeSlots": "Plazas disponibles",
      "description": "Descripción",
      "startDate": "Comienzo",
      "endDate": "Finalización",
      "noDescription": "Sin descripción",
      "seeUsers": "Ver usuarios",
      "course": "Curso",
      "bookSlot": "Reservar plaza",
      "cancelBooking": "Cancelar reserva",
      "cancellationNotPermitted": "No se permiten cancelaciones dentro de las 48 horas",
      "contactSupport": "Por favor contacte con soporte",
      "inWaitlist": "En la lista de espera",
      "leaveWaitlist": "Salir de la lista de espera",
      "joinWaitlist": "Inscribirse en la lista de espera"
    }
  }
</i18n>

<template>
  <!--@mousedown.prevent.stop prevents full-calendar popover from closing when this is clicked-->
  <div class="d-flex flex-column gap-2" @mousedown.prevent.stop>
    <span v-if="showSlots">
      <span class="fw-bold">
        {{ t("slots") }}
      </span>
      {{ event.totalSlots }}
    </span>
    <span>
      <span class="fw-bold">
        {{ t("bookingState") }}
      </span>
      <span
        class="fw-bold ms-2"
        :class="{
          'text-success': event.booked,
          'text-danger': !event.booked && !event.inWaitlist,
          'text-warning': event.inWaitlist,
        }"
      >
        {{
          event.booked
            ? t("booked")
            : event.inWaitlist
            ? t("inWaitlist")
            : t("notBooked")
        }}
      </span>
    </span>
    <span v-if="event.enableBooking">
      <span class="fw-bold">
        {{ t("takenSlots") }}
      </span>
      {{ event.users.length }}
    </span>
    <span v-if="showSlots">
      <span class="fw-bold">
        {{ t("freeSlots") }}
      </span>
      {{ event.totalSlots - event.users.length }}
    </span>
    <span>
      <span class="fw-bold">
        {{ t("startDate") }}
      </span>
      {{ moment(event.startDate).format("DD/MM/YYYY HH:mm") }}
    </span>
    <span>
      <span class="fw-bold">
        {{ t("endDate") }}
      </span>
      {{ moment(event.endDate).format("DD/MM/YYYY HH:mm") }}
    </span>
    <span>
      <span class="fw-bold">
        {{ t("description") }}
      </span>
      {{ event.description ?? t("noDescription") }}
    </span>

    <template v-if="enableActions && showSlots">
      <template v-if="!event.booked">
        <button
          v-if="event.users.length < event.totalSlots"
          @click="emit('bookEvent', arg.event.id)"
          class="btn btn-success btn-sm"
        >
          {{ t("bookSlot") }}
        </button>

        <button
          v-else-if="event.inWaitlist"
          @click="emit('removeFromWaitlist', arg.event)"
          class="btn btn-danger btn-active btn-sm"
        >
          {{ t("leaveWaitlist") }}
        </button>

        <button
          v-else
          @click="emit('addToWaitlist', arg.event)"
          class="btn btn-waitlist btn-sm"
        >
          {{ t("joinWaitlist") }}
        </button>
      </template>

      <button
        v-else
        ref="cancelBtn"
        :disabled="diffInHours < 48"
        :class="{ disabled: diffInHours < 48 }"
        class="btn btn-danger btn-active btn-sm"
        @click="emit('cancelBooking', arg.event.id)"
      >
        {{ t("cancelBooking") }}
      </button>
    </template>

    <el-popover
      v-if="diffInHours < 48"
      placement="top"
      trigger="hover"
      popper-class="cancel-popover"
      :width="250"
      :virtual-ref="cancelBtn"
      virtual-triggering
    >
      <p class="text-danger">
        {{ t("cancellationNotPermitted") }}
      </p>

      <span class="d-block">
        {{ t("contactSupport") }}
      </span>

      <a v-if="email" :href="`mailto:${email}`">
        {{ email }}
      </a>
    </el-popover>
  </div>
</template>

<script lang="ts" setup>
import { computed, PropType, ref } from "vue";
import moment from "moment-timezone";
import { useI18n } from "vue-i18n";
import { useHoursDifference } from "@/composables/useHoursDifference";

const { t } = useI18n();

const email = import.meta.env.VITE_SUPPORT_EMAIL as string;

const props = defineProps({
  arg: Object as PropType<any>,
  enableActions: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits([
  "bookEvent",
  "cancelBooking",
  "addToWaitlist",
  "removeFromWaitlist",
]);

const cancelBtn = ref();

const diffInHours = computed(() =>
  useHoursDifference(new Date(), props.arg.event.start)
);

const event = computed(() => props.arg.event.extendedProps);
const showSlots = computed(
  () => event.value.enableBooking && !isWoocommerce.value
);

const isWoocommerce = computed(
  () => props.arg?.event.extendedProps.woocommerce
);
</script>

<style lang="scss" scoped>
.btn-danger.disabled {
  pointer-events: auto;
  cursor: not-allowed;
  background: var(--bs-danger) !important;
  color: var(--bs-danger-inverse) !important;
}
</style>

<style lang="scss">
.custom-title .el-popover__title {
  font-weight: 600;
  font-size: 1.7rem;
}

.cancel-popover.el-popover.el-popper {
  text-align: center;
  word-break: break-word;
}

.btn-waitlist {
  background: rgba(255, 140, 0, 0.8);
  color: #fff !important;

  &:hover {
    background: rgba(255, 140, 0, 1);
  }
}
</style>
