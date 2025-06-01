<template>
  <div>
    <BaseModal :title="t('addEvent')" v-model="showNewEventDialog">
      <Form
        ref="formRef"
        @submit="handleNewEventSubmit"
        :validation-schema="createEventSchema"
        :initial-values="initialNewEventValues"
        v-slot="{ values, setFieldValue }"
      >
        <InputGroup
          type="datetime-local"
          :label="t('startTime')"
          name="startDate"
        />
        <InputGroup
          type="datetime-local"
          :label="t('endTime')"
          name="endDate"
        />

        <SelectGroup
          :label="t('repeat')"
          name="recurrenceRule"
          :options="repeatOptions"
        />

        <div
          v-if="
            values.recurrenceRule === 'customDays' ||
            values.recurrenceRule === 'customDates'
          "
          class="row"
        >
          <div class="col-12 col-sm-6">
            <label class="col-form-label d-block fw-semobold fs-6">
              {{ t("repeatOn") }}
            </label>

            <div
              v-if="values.recurrenceRule === 'customDates'"
              class="repeat-picker"
            >
              <el-date-picker
                v-model="selectedRepeatDates"
                type="dates"
                name="repeatDates"
                :default-value="defaultRepeatDate"
                @update:model-value="
                   (value: Date[]) => updateRepeatDates(value, setFieldValue)"
                placeholder="Pick one or more dates"
              />

              <div class="fv-plugins-message-container">
                <div class="fv-help-block">
                  <ErrorMessage name="repeatDates" />
                </div>
              </div>
            </div>

            <div
              v-if="values.recurrenceRule === 'customDays'"
              class="multiple-select"
            >
              <el-select
                size="large"
                clearable
                @update:model-value="
                    (value: number[]) => setFieldValue('repeatDays', value)
                "
                v-model="selectedRepeatDays"
                multiple
                name="repeatDays"
                placeholder="Select"
              >
                <el-option
                  v-for="(day, i) in repeatDays"
                  :key="i"
                  :label="day"
                  :value="i + 1"
                />
              </el-select>

              <div class="fv-plugins-message-container">
                <div class="fv-help-block">
                  <ErrorMessage name="repeatDays" />
                </div>
              </div>
            </div>
          </div>

          <div class="col-12 col-sm-6">
            <InputGroup
              type="date"
              :label="t('endOn')"
              name="recurrenceEnd"
              :initial-value="monthEnd"
            />
          </div>
        </div>

        <SwitchGroup
          :label="t('isClub')"
          name="isClub"
          @change="toggleClubOption(values.isClub, setFieldValue)"
        />

        <div class="row mb-6">
          <div class="d-flex align-items-center gap-4">
            <span class="fw-semibold col-form-label fs-6">
              {{ t("eventColor") }}
            </span>

            <el-color-picker
              :predefine="usePredefinedColors()"
              show-alpha
              v-model="eventColor"
              @change="handleColorChange(setFieldValue)"
            />
          </div>
        </div>

        <template v-if="values.isClub === false">
          <SelectGroup
            class="mb-6"
            :label="t('predefinedEvent')"
            name="predefinedEventId"
            :options="
              predefinedEvents.data.value?.map((predefinedEvent) => ({
                label: predefinedEvent.title,
                value: predefinedEvent.id,
              })) || []
            "
          />
        </template>

        <template v-else>
          <InputGroup type="text" :label="t('title')" name="title" />
        </template>

        <SwitchGroup :label="t('enableBooking')" name="enableBooking" />

        <InputGroup
          v-if="values.enableBooking"
          type="number"
          :label="t('slots')"
          name="totalSlots"
          @update:model-value="
            (value: string | Date) => setFieldValue('totalSlots', value || 0)
          "
        />
        <InputGroup type="text" :label="t('description')" name="description" />

        <div class="d-flex justify-content-end">
          <LoadableButton
            color="primary"
            :loading="false"
            submit
            :default-text="t('add')"
            :loading-text="t('adding')"
          />
        </div>
      </Form>
    </BaseModal>

    <div class="card">
      <div class="card-header">
        <div
          class="card-toolbar flex-row gap-3 justify-content-center align-items-center w-100"
        >
          <button
            class="btn btn-flex btn-primary"
            @click="
              resetInitialNewEventValues();
              showNewEventDialog = true;
            "
          >
            <i class="ki-duotone ki-calendar-add fs-1 me-2">
              <i class="path1"></i>
              <i class="path2"></i>
              <i class="path3"></i>
              <i class="path4"></i>
              <i class="path5"></i>
              <i class="path6"></i>
            </i>

            {{ t("add") }}
          </button>
          <div
            class="form-check form-switch form-check-custom form-check-solid flex-column"
          >
            <label class="form-check-label fw-bold text-dark" for="onlyClub">
              {{ t("onlyClub") }}
            </label>
            <input
              class="form-check-input"
              type="checkbox"
              id="onlyClub"
              @change="
                handleFiltersChange(
                  'onlyClub',
                  ($event.target as HTMLInputElement).checked
                )
              "
              :checked="calendarFilters.onlyClub"
            />
          </div>
          <div class="d-flex gap-1 flex-column">
            <span class="fw-bold">
              {{ t("predefinedEvent") }}
            </span>
            <select
              class="form-select form-select-sm"
              @change="
                handleFiltersChange(
                  'predefinedEventId',
                  ($event.target as HTMLSelectElement).value
                )
              "
              :value="calendarFilters.predefinedEventId"
              data-testid="select-has-paid"
            >
              <option selected value="">
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
          <div class="d-flex gap-1 flex-column">
            <span class="fw-bold">
              {{ t("course") }}
            </span>
            <select
              class="form-select form-select-sm"
              @change="
                handleFiltersChange(
                  'courseId',
                  ($event.target as HTMLSelectElement).value
                )
              "
              :value="calendarFilters.courseId"
            >
              <option selected value="">
                {{ t("any") }}
              </option>
              <option v-for="c in courses.data.value" :key="c.id" :value="c.id">
                {{ c.name }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <div class="card-body" style="overflow: auto">
        <CalendarComponent
          :filters="calendarFilters"
          mode="manager"
          @date-click="handleDateClick"
          @delete-event="handleDeleteEvent"
          @cancel-booking="handleCancelBooking"
          @remove-user-from-waitlist="handleRemoveFromWaitlist"
          @update-presence="updatePresence.mutate"
        ></CalendarComponent>
      </div>
    </div>

    <delete-recurring-modal
      @submit="handleDeleteRecurringEvent"
      v-model="deleteRecurShow"
    />
  </div>
</template>

<i18n>
  {
    "en":{
      "course":"Course",
      "bookingCancelled":"Booking cancelled successfully",
      "any": "Any",
      "onlyClub":"Only club events",
      "startTime":"Start time",
      "endTime":"End time",
      "isClub":"Is a club event?",
      "predefinedEvent":"Predefined event",
      "title":"Title",
      "slots":"Slots",
      "description":"Description",
      "add":"Add",
      "adding":"Adding",
      "eventAdded":"Event added successfully",
      "eventDeleted":"Event deleted successfully",
      "addEvent":"Add event",
      "areYouSure":"Are you sure?",
      "eventDeleteConfirmation":"This action cannot be undone",
      "delete":"Delete",
      "cancel":"Cancel",
      "eventColor": "Event color",
      "removeWaitlistSuccess": "Removed from waitlist successfully",
      "doesNotRepeat": "Does not repeat",
      "daily": "Daily",
      "weekly": "Weekly",
      "monthly": "Monthly",
      "annually": "Annually",
      "weekdays": "Weekdays (Monday to Friday)",
      "customDays": "Custom days of the week",
      "customDates": "Custom specific dates",
      "repeat": "Repeat",
      "repeatOn": "Repeat on",
      "endOn": "Ends on",
      "enableBooking": "Enable booking"
    },
    "es":{
      "course":"Curso",
      "bookingCancelled":"Reserva cancelada correctamente",
      "any": "Cualquiera",
      "onlyClub":"Solo eventos del club",
      "startTime":"Hora de inicio",
      "endTime":"Hora de finalización",
      "isClub":"¿Es un evento para el club?",
      "predefinedEvent":"Evento predefinido",
      "title":"Título",
      "slots":"Plazas",
      "description":"Descripción",
      "add":"Añadir",
      "adding":"Añadiendo",
      "eventAdded":"Evento añadido correctamente",
      "eventDeleted":"Evento eliminado correctamente",
      "addEvent":"Añadir evento",
      "areYouSure":"¿Estás seguro?",
      "eventDeleteConfirmation":"Esta acción no se puede deshacer",
      "delete":"Eliminar",
      "cancel":"Cancelar",
      "eventColor": "Color del evento",
      "removeWaitlistSuccess": "Eliminado de la lista de espera con éxito",
      "doesNotRepeat": "No se repite",
      "daily": "Diario",
      "weekly": "Semanal",
      "monthly": "Mensual",
      "annually": "Anual",
      "weekdays": "Días laborables (de lunes a viernes)",
      "customDays": "Días de la semana personalizados",
      "customDates": "Fechas específicas personalizadas",
      "repeat": "Repetir",
      "repeatOn": "Repetir en",
      "endOn": "Terminar en",
      "enableBooking": "Habilitar reserva"
    }
  }
</i18n>

<script lang="ts" setup>
import {
  InputGroup,
  LoadableButton,
  SelectGroup,
  SwitchGroup,
} from "@/components/form";
import { CalendarComponent } from "@/components/calendar";
import { ErrorMessage, Form } from "vee-validate";
import { computed, reactive, ref, watch } from "vue";
import {
  CreateEventReq,
  DeleteParams,
  useCourses,
  usePredefinedEvents,
  useUpdateBooking,
  useUpdateUserPresence,
  useUpdateWaitlist,
} from "@/server-state";
import { useCreateEvent, useDeleteEvent } from "@/server-state";
import { toastError, toastSuccess } from "@/util/toast";
import { BaseModal } from "@/components/common";
import moment from "moment-timezone";
import { getSubmitFn } from "@/util/form";
import { createEventSchema } from "@/validation-schemas/events";
import { useI18n } from "vue-i18n";
import { alertConfirm } from "@/util/alert";
import { useDefaultEventColor } from "@/composables/useDefaultEventColor";
import usePredefinedColors from "@/composables/usePredefinedColors";
import DeleteRecurringModal from "@/components/calendar/modals/DeleteRecurringModal.vue";
import { EventImpl } from "@fullcalendar/core/internal";
import type { RecurrenceRule } from "@aula-anclademia/backend/dist/src/events/events.service";
import { endOfMonth } from "date-fns";

interface RepeatOption {
  label: string;
  value: RecurrenceRule | "custom";
}

const { t } = useI18n();
const showNewEventDialog = ref(false);
const eventColor = ref(useDefaultEventColor(false));
const isColorChanged = ref(false);
const courses = useCourses();
const predefinedEvents = usePredefinedEvents();

const deleteRecurShow = ref(false);
const eventToDelete = ref<EventImpl>();

const getEndOfMonth = (date: Date | string | number) =>
  new Date(endOfMonth(date)).toISOString();

const today = new Date().toISOString();
const monthEnd = ref(getEndOfMonth(today));

const selectedRepeatDates = ref([]);
const selectedRepeatDays = ref([]);
const defaultRepeatDate = ref(new Date());

const repeatDays = ref([
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
]);

const repeatOptions = computed(() => {
  return [
    {
      label: t("doesNotRepeat"),
      value: "",
    },
    {
      label: t("daily"),
      value: "daily",
    },
    {
      label: t("weekly"),
      value: "weekly",
    },
    {
      label: t("monthly"),
      value: "monthly",
    },
    {
      label: t("annually"),
      value: "annually",
    },
    {
      label: t("weekdays"),
      value: "weekdays",
    },
    {
      label: t("customDays"),
      value: "customDays",
    },
    {
      label: t("customDates"),
      value: "customDates",
    },
  ] as RepeatOption[];
});

const calendarFilters = reactive<{
  onlyClub: boolean;
  predefinedEventId: string;
  courseId: string;
}>({
  onlyClub: false,
  predefinedEventId: "",
  courseId: "",
});

const updateRepeatDates = (dates: Date[], setFieldValue: any) => {
  if (dates) {
    setFieldValue("repeatDates", getDates(dates));

    const sortedDates = dates.sort(
      (a: Date, b: Date) => a.getTime() - b.getTime()
    );

    monthEnd.value = getEndOfMonth(sortedDates[dates.length - 1]);
  }
};

const toggleClubOption = (isClub: boolean, setFieldValue: any) => {
  if (!isColorChanged.value) {
    eventColor.value = useDefaultEventColor(isClub);
  }

  setFieldValue("color", eventColor.value);

  !isClub ? setFieldValue("courseId", courses.data.value?.[0]?.id) : "";
};

const handleFiltersChange = (filterName: string, value: any) => {
  // if one was changed, we must reset the other and handle the change
  switch (filterName) {
    case "onlyClub":
      calendarFilters.predefinedEventId = "";
      calendarFilters.courseId = "";
      calendarFilters.onlyClub = value;
      break;
    case "predefinedEventId":
      calendarFilters.onlyClub = false;
      calendarFilters.courseId = "";
      calendarFilters.predefinedEventId = value;
      break;
    case "courseId":
      calendarFilters.predefinedEventId = "";
      calendarFilters.onlyClub = false;
      calendarFilters.courseId = value;
      break;
  }
};

const handleDeleteEvent = (event: EventImpl) => {
  if (event.extendedProps.recurrenceRule) {
    eventToDelete.value = event;
    deleteRecurShow.value = true;

    return;
  }

  alertConfirm({
    title: t("areYouSure"),
    text: t("eventDeleteConfirmation"),
    onConfirm: () =>
      deleteEvent.mutate(
        { id: event.id },
        {
          onSuccess: () => {
            toastSuccess(t("eventDeleted"));
          },
          onError: (error: any) => {
            toastError(error.message || "Unknown error");
          },
        }
      ),
    confirmButtonText: t("delete"),
    cancelButtonText: t("cancel"),
  });
};

const handleDeleteRecurringEvent = (option: "all" | "event") => {
  if (eventToDelete.value) {
    const params: DeleteParams = {
      id: eventToDelete.value.id,
    };

    if (option === "all") {
      params.recurrence = eventToDelete.value.extendedProps.recurrenceRule;
    }

    deleteEvent.mutate(params, {
      onSuccess: () => {
        toastSuccess(t("eventDeleted"));
      },
      onError: (error: any) => {
        toastError(error.message || "Unknown error");
      },
    });
  }
};

const handleColorChange = (setFieldValue: any) => {
  isColorChanged.value = true;
  setFieldValue("color", eventColor.value);
};

const getDates = (dates: Date[]) => dates.map((date) => date.toISOString());

const handleNewEventSubmit = getSubmitFn(createEventSchema, (values) => {
  const { repeatDays, repeatDates, recurrenceRule, ...body } = values;

  const requestBody: typeof values = {
    ...body,
    totalSlots: body.totalSlots || 0,
  };

  if (recurrenceRule) {
    requestBody.recurrenceRule = recurrenceRule;

    if (recurrenceRule === "customDays" && repeatDays) {
      requestBody.repeatDays = repeatDays;
    }

    if (recurrenceRule === "customDates" && repeatDates) {
      requestBody.repeatDates = repeatDates;
    }
  }

  createEvent.mutate(requestBody as CreateEventReq, {
    onSuccess: () => {
      toastSuccess(t("eventAdded"));
    },
    onError: (error: any) => {
      toastError(error.message || "Unknown error");
    },
  });

  isColorChanged.value = false;
  selectedRepeatDates.value = [];
  selectedRepeatDays.value = [];
  eventColor.value = useDefaultEventColor(false);
  showNewEventDialog.value = false;
});

const initialNewEventValues = reactive({
  isClub: false,
  enableBooking: true,
  startDate: moment()
    .add(1, "day")
    .set({
      hour: 9,
      minute: 0,
    })
    .format("YYYY-MM-DDTHH:mm"),
  endDate: moment()
    .add(1, "day")
    .set({
      hour: 10,
      minute: 0,
    })
    .format("YYYY-MM-DDTHH:mm"),
  title: "",
  totalSlots: 20,
  predefinedEventId: predefinedEvents.data.value?.[0]?.id,
  color: eventColor.value,
});

watch(
  () => predefinedEvents.data.value,
  () => {
    initialNewEventValues.predefinedEventId =
      predefinedEvents.data.value?.[0]?.id;
  }
);

const resetInitialNewEventValues = () => {
  initialNewEventValues.startDate = moment()
    .add(1, "day")
    .set({
      hour: 9,
      minute: 0,
    })
    .format("YYYY-MM-DDTHH:mm");

  initialNewEventValues.endDate = moment()
    .add(1, "day")
    .set({
      hour: 10,
      minute: 0,
    })
    .format("YYYY-MM-DDTHH:mm");

  initialNewEventValues.title = "";
  initialNewEventValues.totalSlots = 20;
};

const handleDateClick = (date: string) => {
  initialNewEventValues.startDate = moment(date)
    .set({
      hour: 9,
      minute: 0,
    })
    .format("YYYY-MM-DDTHH:mm");

  initialNewEventValues.endDate = moment(date)
    .set({
      hour: 10,
      minute: 0,
    })
    .format("YYYY-MM-DDTHH:mm");

  defaultRepeatDate.value = new Date(date);
  monthEnd.value = getEndOfMonth(date);

  // it was bugging out without the timeout
  setTimeout(() => {
    showNewEventDialog.value = true;
  }, 100);
};

const deleteEvent = useDeleteEvent();
const createEvent = useCreateEvent();
const updateBooking = useUpdateBooking();
const updateWaitlist = useUpdateWaitlist();
const updatePresence = useUpdateUserPresence();

const handleCancelBooking = (eventId: string, userId: string) => {
  alertConfirm({
    title: t("areYouSure"),
    text: t("eventDeleteConfirmation"),
    onConfirm: () =>
      updateBooking.mutate(
        {
          eventId,
          book: false,
          userId,
        },
        {
          onSuccess: () => {
            toastSuccess(t("bookingCancelled"));
          },
          onError: (error: any) => {
            toastError(error.message || "Unknown error");
          },
        }
      ),
    confirmButtonText: t("delete"),
    cancelButtonText: t("cancel"),
  });
};

const handleRemoveFromWaitlist = (eventId: string, userId: string) => {
  alertConfirm({
    title: t("areYouSure"),
    text: t("eventDeleteConfirmation"),
    onConfirm: () =>
      updateWaitlist.mutate(
        {
          eventId,
          join: false,
          userId,
        },
        {
          onSuccess: () => {
            toastSuccess(t("removeWaitlistSuccess"));
          },
          onError: (error: any) => {
            toastError(error.message || "Unknown error");
          },
        }
      ),
    confirmButtonText: t("delete"),
    cancelButtonText: t("cancel"),
  });
};
</script>

<style lang="scss">
.repeat-picker {
  .el-input__wrapper {
    min-height: calc(1.5em + 1.65rem + 2px);
    padding: 0.825rem 1.5rem;
    font-size: 1.15rem;
    border-radius: 0.625rem;
    width: 100%;
  }

  .el-date-editor.el-input {
    width: 100%;
    height: calc(1.5em + 1.65rem + 2px);
  }
}

.multiple-select {
  .el-select--large {
    width: 100%;
  }

  .el-input--large {
    .el-input__wrapper {
      font-size: 1.15rem;
      border-radius: 0.625rem;
      padding: 3.5px 15px 3.5px 1.5rem;
    }
  }
}
</style>
