<template>
  <div class="card">
    <div
      v-if="user && showCountdown"
      class="card-header py-5 justify-content-center"
    >
      <div>
        <p class="fw-bold fs-6 mb-2 text-center">
          {{ t("calendarHasBeenBlocked") }}
        </p>
        <v-countdown
          @timeElapsed="onDeadlineExpired"
          :deadline="user.calendarBlockingDeadline"
        />
      </div>
    </div>

    <div class="card-body" style="overflow: auto">
      <CalendarComponent
        mode="user"
        :enable-actions="!showCountdown"
        @book-event="openBookEvent"
        @cancel-booking="handleCancelBooking"
        @add-to-waitlist="addToWaitlist"
        @remove-from-waitlist="removeFromWaitlist"
      ></CalendarComponent>
    </div>
  </div>

  <booking-policy-modal
    v-model="showBookingPolicy"
    @submit="handleBookEvent(selectedEventId)"
  />
</template>

<i18n>
  {
    "en": {
      "eventBooked": "Event booked successfully",
      "bookingCancelled": "Booking cancelled successfully",
      "cancellationNotPermitted": "Cancellation are not permitted within 48 hours",
      "thanksForJoinWaitlist": "Thank you for joining the waitlist for",
      "sendEmail": "We’ll send you an email as soon as it’s your turn to join the event. Keep an eye on your inbox for updates",
      "confirm": "Confirm",
      "cancel": "Cancel",
      "close": "Close",
      "leftWaitlist": "You are no longer on the waitlist",
      "confirmCancellation": "Are you sure you want to cancel booking?",
      "waitlistWarning": "By canceling your booking, your spot will be automatically offered to the next person on the waitlist",
      "calendarHasBeenBlocked": "Calendar has been blocked for",
      "blockedCalendarTitle": "Access to events blocked!",
      "blockedCalendarText": "Your access to calendar events has been blocked for 15 days. You will not be able to attend events during the blocked period. For more information or to resolve this issue, please contact support.",
      "availableCalendarTitle": "Access Available!",
      "availableCalendarText": "You now have full access to the calendar. Feel free to view and book your events."
    },
    "es": {
      "eventBooked": "Evento reservado correctamente",
      "bookingCancelled": "Reserva cancelada correctamente",
      "cancellationNotPermitted": "No se permiten cancelaciones dentro de las 48 horas",
      "thanksForJoinWaitlist": "Gracias por unirte a la lista de espera para",
      "sendEmail": "Te enviaremos un correo electrónico tan pronto como sea tu turno para unirte al evento. Mantén un ojo en tu bandeja de entrada para actualizaciones",
      "confirm": "Confirmar",
      "cancel": "Cancelar",
      "close": "Cerca",
      "leftWaitlist": "Ya no estás en la lista de espera",
      "confirmCancellation": "¿Estás seguro de que quieres cancelar la reserva?",
      "waitlistWarning": "Al cancelar tu reserva, tu lugar se ofrecerá automáticamente a la siguiente persona en la lista de espera.",
      "calendarHasBeenBlocked": "El calendario ha sido bloqueado para",
      "blockedCalendarTitle": "¡Acceso a los eventos bloqueado!",
      "blockedCalendarText": "Tu acceso a los eventos del calendario ha estado bloqueado durante 15 días. No podrás asistir a eventos durante el período bloqueado. Para más información o para resolver este problema, por favor contacta con soporte.",
      "availableCalendarTitle": "¡Acceso disponible!",
      "availableCalendarText": "Ahora tienes acceso completo al calendario. Puedes consultar y reservar tus eventos con total libertad."
    }
  }
</i18n>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";

import { CalendarComponent } from "@/components/calendar";
import { toastSuccess, toastError } from "@/util/toast";
import { useMe, useUpdateBooking, useUpdateWaitlist } from "@/server-state";
import { useI18n } from "vue-i18n";

import BookingPolicyModal from "@/components/calendar/modals/BookingPolicyModal.vue";
import { EventImpl } from "@fullcalendar/core/internal";
import { useHoursDifference } from "@/composables/useHoursDifference";
import Swal from "sweetalert2";
import VCountdown from "@/components/countdown/VCountdown.vue";

const updateBooking = useUpdateBooking();
const updateWaitlist = useUpdateWaitlist();

const { t } = useI18n();
const me = useMe();

const showCountdown = ref(false);
const user = computed(() => me.data.value);

const email = import.meta.env.VITE_SUPPORT_EMAIL as string;

const showBookingPolicy = ref(false);
const selectedEventId = ref("");

const addToWaitlist = (event: EventImpl) => {
  if (!user.value) return;

  updateWaitlist.mutate(
    {
      eventId: event.id,
      join: true,
      userId: user.value.id,
    },
    {
      onSuccess: () => {
        Swal.fire({
          icon: "success",
          title: `${t(
            "thanksForJoinWaitlist"
          )} <span class="text-primary d-block mt-1">"${event.title}"</span>`,
          text: t("sendEmail"),
          confirmButtonText: t("confirm"),
          heightAuto: false,
          customClass: {
            confirmButton: "btn btn-success",
          },
        });
      },
      onError: (error: any) => {
        toastError(error.message || "Unknown error");
      },
    }
  );
};

const removeFromWaitlist = (event: EventImpl) => {
  if (!user.value) return;

  updateWaitlist.mutate(
    {
      eventId: event.id,
      join: false,
      userId: user.value.id,
    },
    {
      onSuccess: () => {
        toastSuccess(t("leftWaitlist"));
      },
      onError: (error: any) => {
        toastError(error.message || "Unknown error");
      },
    }
  );
};

const openBookEvent = (eventId: string) => {
  showBookingPolicy.value = true;
  selectedEventId.value = eventId;
};

const handleBookEvent = (eventId: string) => {
  if (!user.value) return;

  updateBooking.mutate(
    {
      eventId,
      book: true,
      userId: user.value.id,
    },
    {
      onSuccess: () => {
        toastSuccess(t("eventBooked"));
        showBookingPolicy.value = false;
      },
      onError: (error: any) => {
        toastError(error.message || "Unknown error");
        showBookingPolicy.value = false;
      },
    }
  );
};

const cancelBooking = (event: EventImpl) => {
  if (!user.value) return;

  updateBooking.mutate(
    {
      eventId: event.id,
      book: false,
      userId: user.value.id,
    },
    {
      onSuccess: () => {
        toastSuccess(t("bookingCancelled"));
      },
      onError: (error: any) => {
        toastError(error.message || "Unknown error");
      },
    }
  );
};

const handleCancelBooking = (event: EventImpl) => {
  if (event.start) {
    const diffInHours = useHoursDifference(new Date(), event.start);

    if (diffInHours < 48) {
      toastError(t("cancellationNotPermitted"));

      return;
    }
  }

  if (event.extendedProps.waitlist.length > 0) {
    Swal.fire({
      icon: "warning",
      title: t("confirmCancellation"),
      text: t("waitlistWarning"),
      showCancelButton: true,
      showConfirmButton: true,
      reverseButtons: true,
      confirmButtonText: t("confirm"),
      cancelButtonText: t("cancel"),
      heightAuto: false,
      customClass: {
        confirmButton: "btn btn-danger",
        cancelButton: "btn btn-primary",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        cancelBooking(event);
      }
    });

    return;
  }

  cancelBooking(event);
};

const showBlockingWarnMsg = () => {
  if (user.value) {
    if (!user.value.isCalendarEnable) {
      Swal.fire({
        title: t("blockedCalendarTitle"),
        html: `
        <p>${t("blockedCalendarText")}</p>
        <a href="mailto:${email}">${email}</a>
      `,
        icon: "warning",
        showConfirmButton: true,
        confirmButtonColor: "#f1416c",
        confirmButtonText: t("close"),
      });
    }

    showCountdown.value = !user.value.isCalendarEnable;
  }
};

const onDeadlineExpired = () => {
  showCountdown.value = false;

  Swal.fire({
    title: t("availableCalendarTitle"),
    text: t("availableCalendarText"),
    icon: "success",
    showConfirmButton: true,
    confirmButtonColor: "#50cd89",
    confirmButtonText: t("close"),
  });
};

if (user.value) {
  showBlockingWarnMsg();
}

watch(user, showBlockingWarnMsg);
</script>
