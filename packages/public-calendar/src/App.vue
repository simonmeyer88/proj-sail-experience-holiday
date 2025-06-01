<template>
  <!-- bootstrap modal -->
  <div
    class="modal fade"
    id="eventModal"
    tabindex="-1"
    role="dialog"
    aria-labelledby="eventModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-sm modal-dialog-centered" role="document">
      <div class="modal-content">
        <div class="modal-header p-4">
          <h3 class="modal-title" id="eventModalLabel">
            {{ currentEvent?.title }}
          </h3>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body p-4">
          <p class="mb-1">
            <span class="fw-bold">Comienzo:</span>
            {{ moment(currentEvent?.start).format("LLL") }}
          </p>
          <p class="mb-1">
            <span class="fw-bold">Final:</span>
            {{ moment(currentEvent?.end).format("LLL") }}
          </p>
          <p v-if="currentEvent?.extendedProps?.enableBooking" class="mb-1">
            <span class="fw-bold">Plazas disponibles:</span>
            {{ currentEvent?.extendedProps?.freeSlots }}
          </p>
          <p class="mb-1">
            <span class="fw-bold">Descripción:</span>
            {{ currentEvent?.extendedProps?.description || "Sin descripción" }}
          </p>
        </div>
      </div>
    </div>
  </div>
  <FullCalendar class="demo-app-calendar" :options="calendarOptions">
  </FullCalendar>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import type { CalendarOptions } from "@fullcalendar/core";
import { watch } from "vue";
import * as bootstrap from "bootstrap";
import { onMounted } from "vue";
import moment from "moment";
import type { ComputedRef } from "vue";
moment.defineLocale("es", {
  months:
    "Enero_Febrero_Marzo_Abril_Mayo_Junio_Julio_Agosto_Septiembre_Octubre_Noviembre_Diciembre".split(
      "_"
    ),
  monthsShort:
    "Ene._Feb._Mar._Abr._May._Jun._Jul._Ago._Sep._Oct._Nov._Dic.".split("_"),
  weekdays: "Domingo_Lunes_Martes_Miércoles_Jueves_Viernes_Sábado".split("_"),
  weekdaysShort: "Dom._Lun._Mar._Mié._Jue._Vie._Sáb.".split("_"),
  weekdaysMin: "Do_Lu_Ma_Mi_Ju_Vi_Sá".split("_"),
  longDateFormat: {
    LT: "H:mm",
    LTS: "H:mm:ss",
    L: "DD/MM/YYYY",
    LL: "D [de] MMMM [de] YYYY",
    LLL: "D [de] MMMM [de] YYYY H:mm",
    LLLL: "dddd, D [de] MMMM [de] YYYY H:mm",
  },
  calendar: {
    sameDay: function () {
      //@ts-expect-error
      return "[hoy a la" + (this.hours() !== 1 ? "s" : "") + "] LT";
    },
  },
  relativeTime: {
    future: "en %s",
    past: "hace %s",
    s: "unos segundos",
    m: "un minuto",
    mm: "%d minutos",
    h: "una hora",
    hh: "%d horas",
    d: "un día",
    dd: "%d días",
    M: "un mes",
    MM: "%d meses",
    y: "un año",
    yy: "%d años",
  },
  ordinalParse: /\d{1,2}º/,
  ordinal: (number) => number + "º",
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 4, // The week that contains Jan 4th is the first week of the year.
  },
});
moment.locale("es");

// get courseId from url params
const courseId = ref<string | null>(
  new URLSearchParams(window.location.search).get("courseId")
);

const modal = ref<HTMLElement | null>(null);

const currentEvent = ref<any>(null);

const showModal = () => {
  const modal_ = modal.value;
  if (modal_) {
    const modalInstance = new bootstrap.Modal(modal_);
    modalInstance.show();
  }
};

// get modal element on initial render
onMounted(() => {
  modal.value = document.getElementById("eventModal");
});

const INITIAL_DATE = new Date();

const currDate = ref<Date>(INITIAL_DATE);

const BASE_BACKEND_URL = import.meta.env.VITE_APP_API_URL;
const EVENTS_ENDPOINT = BASE_BACKEND_URL + "/events/public";

const fetchEvents = async (date: Date) => {
  const response = await fetch(
    `${EVENTS_ENDPOINT}?date=${date.toISOString()}&courseId=${courseId.value}`,
    {
      headers: {
        "Content-Type": "application/json",
        "x-csrf-protection": "1",
      },
    }
  );
  const data = await response.json();
  return data;
};

const events = ref([]);

watch(currDate, async (newDate) => {
  const events_ = await fetchEvents(newDate);
  events.value = events_;
});

const eventsFormatted = computed(() => {
  return (
    events.value?.map((event: any) => {
      return {
        ...event,
        title: event.title,
        start: event.startDate,
        end: event.endDate,
        backgroundColor: event.color,
        // className: event.isClub
        //     ? "bg-success border-success"
        //     : "bg-primary border-primary",
      };
    }) || []
  );
});

// @ts-ignore
const calendarOptions: ComputedRef<CalendarOptions> = computed(() => {
  return {
    eventDisplay: "block",
    plugins: [dayGridPlugin],
    headerToolbar: {
      left: "prev,next today",
      right: "title",
    },
    initialDate: INITIAL_DATE,
    datesSet: (arg: any) => {
      const date = arg.view.currentStart as Date;
      // just to make sure current month is fetched(fullcalendar sometimes will not emit current month, but last day of previous month)
      date.setDate(date.getDate() + 4);
      currDate.value = date;
    },
    dateClick: (_arg: any) => {},
    eventClick: (arg: any) => {
      currentEvent.value = arg.event;
      showModal();
    },
    // dont display hour in day view
    displayEventTime: false,
    navLinkDayClick: (_arg: any) => {},
    navLinks: true,
    selectable: true,
    selectMirror: true,
    locale: "es",
    firstDay: 1,
    editable: false,
    dayMaxEvents: true,
    nextDayThreshold: "00:00:00",
    events: eventsFormatted.value,
    moreLinkText: (n: number) => {
      return n;
    },
    moreLinkClick: "popover",
    eventTextColor: "white",
    eventTimeFormat: {
      hour: "numeric",
      minute: "2-digit",
      meridiem: "short",
      position: "after",
    },
    buttonText: {
      today: "Hoy",
      month: "Mes",
      week: "Semana",
      day: "Día",
      list: "Lista",
    },
    eventMaxStack: 1,
    dayMaxEventRows: 0,
    // eventClassNames: (arg: any) => {
    //   return arg.event.extendedProps.isClub
    //     ? "bg-success border-success"
    //     : "bg-primary border-primary";
    // },
  };
});
</script>

<style lang="scss">
@import "./sass/style.scss";
@import "./sass/plugins";
@import "./sass/element-ui.dark";
.fc-more-link {
  color: white;
  background-color: #007bff;
  font-size: 1.2em;
  margin-bottom: 0.3em;
  padding: 4px !important;
}
.fc-daygrid-day-bottom {
  display: flex;
  justify-content: space-between;
}
.demo-app-calendar {
  min-height: 600px;
}

.modal-button {
  color: white !important;
}
.modal-button:hover {
  color: black !important;
}

// fc event bold
.fc-event {
  font-weight: bold;
}

.modal-backdrop.show {
  opacity: 0;
}
</style>
