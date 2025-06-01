<i18n>
  {
    "en": {
      "slots": "Slots",
      "chatCreated": "Chat created successfully",
      "description": "Description",
      "start": "Start",
      "end": "End",
      "update": "Update",
      "bookedUsers": "Booked users",
      "name": "Name",
      "phone": "Phone",
      "idNumber": "ID Number",
      "tasks": "Tasks",
      "profile": "Profile",
      "noBookedUsers": "No users booked for this event",
      "eventUpdated": "Event updated successfully",
      "editEvent": "Edit event",
      "more": "more",
      "createChat": "Create chat",
      "createChatForEvent": "Create chat for event",
      "on": "on",
      "aTotalOf": "A total of",
      "usersHaveBooked": "users have booked this event.",
      "cancelBooking": "Cancel booking",
      "title": "Title",
      "eventColor": "Event color",
      "remove": "Remove",
      "waitlist": "Waitlist",
      "emptyWaitlist": "No users in waitlist",
      "markPresent": "Mark as present",
      "enableBooking": "Enable booking"
    },
    "es": {
      "slots": "Plazas",
      "chatCreated": "Chat creado correctamente",
      "description": "Descripción",
      "start": "Comienzo",
      "end": "Finalización",
      "update": "Actualizar",
      "bookedUsers": "Usuarios apuntados",
      "name": "Nombre",
      "phone": "Teléfono",
      "idNumber": "DNI",
      "tasks": "Tareas",
      "profile": "Perfil",
      "noBookedUsers": "No hay usuarios apuntados a este evento",
      "eventUpdated": "Evento actualizado correctamente",
      "editEvent": "Editar evento",
      "more": "más",
      "createChat": "Crear chat",
      "createChatForEvent": "Crear chat para evento",
      "on": "el",
      "aTotalOf": "Un total de",
      "usersHaveBooked": "usuarios se han apuntado a este evento.",
      "cancelBooking": "Cancelar reserva",
      "title": "Título",
      "eventColor": "Color del evento",
      "remove": "Eliminar",
      "emptyWaitlist": "No hay usuarios en la lista de espera",
      "waitlist": "Lista de espera",
      "markPresent": "Marcar como presente",
      "enableBooking": "Habilitar reserva"
    }
  }
</i18n>
<template>
  <BaseModal
    v-model="showUpdateEventModal"
    :title="t('editEvent')"
    :max-width="400"
  >
    <VForm
      :validation-schema="updateEventSchema"
      @submit="handleUpdateEventSubmit"
      :initial-values="{
        totalSlots: currEvent?.totalSlots,
        description: currEvent?.description,
        startDate: moment(currEvent?.startDate).format('YYYY-MM-DDTHH:mm'),
        endDate: moment(currEvent?.endDate).format('YYYY-MM-DDTHH:mm'),
        title: currEvent?.title,
        isClub: currEvent?.isClub,
        enableBooking: currEvent?.enableBooking,
        color: currEvent?.color ?? useDefaultEventColor(currEvent?.isClub),
      }"
      v-slot="{ setFieldValue, values }"
    >
      <InputGroup
        :label="t('title')"
        name="title"
        type="text"
        v-if="currEvent?.isClub"
      />

      <InputGroup
        v-if="values.enableBooking"
        :label="t('slots')"
        name="totalSlots"
        @update:model-value="
            (value: string | Date) => setFieldValue('totalSlots', value || 0)
          "
        type="number"
      />

      <SwitchGroup :label="t('enableBooking')" name="enableBooking" />

      <InputGroup :label="t('description')" name="description" type="text" />

      <InputGroup :label="t('start')" name="startDate" type="datetime-local" />

      <InputGroup :label="t('end')" name="endDate" type="datetime-local" />

      <div class="row mb-6">
        <div class="d-flex align-items-center gap-4">
          <span class="fw-semibold col-form-label fs-6">
            {{ t("eventColor") }}
          </span>

          <el-color-picker
            :predefine="usePredefinedColors()"
            show-alpha
            v-model="colorUpdateEvent"
            @change="setFieldValue('color', colorUpdateEvent)"
          />
        </div>
      </div>

      <LoadableButton
        color="primary"
        :loading="updateEvent.isLoading.value"
        type="submit"
        :default-text="t('update')"
        :loading-text="t('update')"
      />
    </VForm>
  </BaseModal>
  <UserModal v-model:userId="currentUserModalId" />

  <BaseModal
    v-model="showCreateChatModal"
    :title="t('createChat')"
    :max-width="400"
  >
    <div class="alert alert-success">
      {{ t("createChatForEvent") }}
      <b>{{
        eventsFormatted.find((e) => e.id === createChatModalEventId)?.title
      }}</b>
      {{ t("on") }}
      <b
        >{{
          moment(
            eventsFormatted.find((e) => e.id === createChatModalEventId)?.start
          ).format("DD/MM/YYYY")
        }} </b
      >.
      <br />
      {{ t("aTotalOf") }}
      <b>{{
        eventsFormatted.find((e) => e.id === createChatModalEventId)?.users
          .length
      }}</b>
      {{ t("usersHaveBooked") }}
    </div>
    <CreateGroupChatForm
      @submit="handleCreateEventChat"
      :loading="createChat.isLoading.value"
    />
  </BaseModal>

  <BaseModal
    v-model="showUsersModal"
    :title="t('bookedUsers')"
    :max-width="500"
  >
    <ElScrollbar :max-height="400" always>
      <div class="d-flex flex-column gap-2">
        <div
          v-for="user in selectedEvent?.users"
          :key="user.id"
          class="d-flex flex-row align-items-center gap-2 card card-body py-2 px-2 border-gray-300"
        >
          <div class="d-flex">
            <div class="d-flex flex-column gap-2">
              <span class="fw-bold fs-6 text-dark">{{ user.email }}</span>
              <div class="d-flex gap-4">
                <BaseImage
                  class="symbol symbol-40px"
                  width="40"
                  height="40"
                  :src="user.pictureUrl"
                />
                <div class="d-flex flex-column">
                  <span class="fs-6">
                    {{ t("name") }}
                    <span class="fw-bold">
                      {{ user.firstName }} {{ user.lastName }}</span
                    >
                  </span>

                  <span class="fs-6">
                    {{ t("idNumber") }}
                    <span class="fw-bold">{{ user.idNumber }}</span>
                  </span>
                </div>
              </div>

              <el-checkbox
                :checked="selectedEvent?.visitedUsers.includes(user.id)"
                :value="user.id"
                @change="
                  (checked: boolean) =>
                    emit('updatePresence', {
                      userId: user.id,
                      eventId: selectedEvent?.id,
                      isPresent: checked,
                    })
                "
                :label="t('markPresent')"
              />
            </div>
          </div>
          <div
            class="d-flex flex-column gap-1 ms-auto"
            style="width: max-content"
          >
            <RouterLink
              :to="{
                name: 'management.student-tasks',
                params: { studentId: user.id },
              }"
              class="btn btn-sm btn-primary ms-auto w-100 fs-8 px-2 py-2"
            >
              {{ t("tasks") }}
            </RouterLink>
            <button
              class="btn btn-sm btn-success fs-8 px-2 py-2"
              @click="currentUserModalId = user.id"
            >
              {{ t("profile") }}
            </button>
            <button
              class="btn btn-sm btn-danger fs-8 px-2 py-2"
              style="width: max-content"
              @click="emit('cancelBooking', usersModalEventId, user.id)"
            >
              {{ t("cancelBooking") }}
            </button>
          </div>
        </div>

        <div
          v-if="
            !eventsFormatted.find((e) => e.id === usersModalEventId)?.users
              .length
          "
          class="bg-light-warning p-3"
        >
          {{ t("noBookedUsers") }}
        </div>
      </div>
    </ElScrollbar>
  </BaseModal>

  <BaseModal
    v-model="showWaitlistModal"
    :title="t('waitlist')"
    :max-width="400"
  >
    <ElScrollbar :max-height="300" always>
      <div class="d-flex flex-column gap-2">
        <div
          v-for="user in eventsFormatted.find(
            (e) => e.id === waitlistModalEventId
          )?.waitlist"
          :key="user.id"
          class="d-flex flex-row align-items-center gap-2 card card-body py-2 px-2 border-gray-300"
        >
          <div class="d-flex">
            <div class="d-flex flex-column gap-2">
              <span class="fw-bold fs-6 text-dark">{{ user.email }}</span>
              <div class="d-flex gap-4">
                <BaseImage
                  class="symbol symbol-40px"
                  width="40"
                  height="40"
                  :src="user.pictureUrl"
                />
                <div class="d-flex flex-column">
                  <span class="fs-6">
                    {{ t("name") }}
                    <span class="fw-bold">
                      {{ user.firstName }} {{ user.lastName }}</span
                    >
                  </span>

                  <span class="fs-6">
                    {{ t("idNumber") }}
                    <span class="fw-bold">{{ user.idNumber }}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div
            class="d-flex flex-column gap-1 ms-auto"
            style="width: max-content"
          >
            <RouterLink
              :to="{
                name: 'management.student-tasks',
                params: { studentId: user.id },
              }"
              class="btn btn-sm btn-primary ms-auto w-100 fs-8 px-2 py-2"
            >
              {{ t("tasks") }}
            </RouterLink>
            <button
              class="btn btn-sm btn-success fs-8 px-2 py-2"
              @click="currentUserModalId = user.id"
            >
              {{ t("profile") }}
            </button>
            <button
              class="btn btn-sm btn-danger fs-8 px-2 py-2"
              style="width: max-content"
              @click="
                emit('removeUserFromWaitlist', waitlistModalEventId, user.id)
              "
            >
              {{ t("remove") }}
            </button>
          </div>
        </div>
        <div
          v-if="
            !eventsFormatted.find((e) => e.id === waitlistModalEventId)
              ?.waitlist.length
          "
          class="bg-light-warning p-3"
        >
          {{ t("emptyWaitlist") }}
        </div>
      </div>
    </ElScrollbar>
  </BaseModal>

  <!-- Woocommerce bookings -->
  <BaseModal
    v-model="showOrdersModal"
    :title="t('bookedUsers')"
    :max-width="400"
  >
    <ElScrollbar :max-height="300" always>
      <div id="orders-modal" class="d-flex min-h-100px flex-column gap-2">
        <template v-if="!isOrdersLoading">
          <template v-if="usersFromBooking.length > 0">
            <div
              v-for="user in usersFromBooking"
              :key="user.id"
              class="d-flex flex-row align-items-center gap-2 card card-body py-2 px-2 border-gray-300"
            >
              <div class="d-flex">
                <div class="d-flex flex-column gap-2">
                  <span class="fw-bold fs-6 text-dark">{{ user.email }}</span>
                  <div class="d-flex gap-4">
                    <BaseImage
                      class="symbol symbol-40px"
                      width="40"
                      height="40"
                      :src="user.pictureUrl"
                    />
                    <div class="d-flex flex-column">
                      <span class="fs-6">
                        {{ t("name") }}
                        <span class="fw-bold">
                          {{ user.firstName }} {{ user.lastName }}
                        </span>
                      </span>

                      <span class="fs-6">
                        {{ t("idNumber") }}
                        <span class="fw-bold">{{ user.idNumber }}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div
                class="d-flex flex-column gap-1 ms-auto"
                style="min-width: 95px"
              >
                <RouterLink
                  :to="{
                    name: 'management.student-tasks',
                    params: { studentId: user.id },
                  }"
                  class="btn btn-sm btn-primary ms-auto w-100 fs-8 px-2 py-2"
                >
                  {{ t("tasks") }}
                </RouterLink>
                <button
                  class="btn btn-sm btn-success fs-8 px-2 py-2"
                  @click="currentUserModalId = user.id"
                >
                  {{ t("profile") }}
                </button>
              </div>
            </div>
          </template>

          <template v-if="ordersFromBooking?.length">
            <div
              v-for="{ user, id } in ordersFromBooking"
              :key="id"
              class="d-flex flex-row align-items-center gap-2 card card-body py-2 px-2 border-gray-300"
            >
              <div class="d-flex">
                <div class="d-flex flex-column gap-2">
                  <span class="fw-bold fs-6 text-dark">{{ user.email }}</span>
                  <div class="d-flex gap-4">
                    <BaseImage
                      class="symbol symbol-40px"
                      width="40"
                      height="40"
                      :src="getAssetPath('media/default-profile-picture.png')"
                    />
                    <div class="d-flex flex-column">
                      <span class="fs-6">
                        {{ t("name") }}
                        <span class="fw-bold">
                          {{ user.first_name }} {{ user.last_name }}
                        </span>
                        <span> (Guest) </span>
                      </span>
                      <span class="fs-6">
                        {{ t("phone") }}
                        <span class="fw-bold">
                          {{ user.phone }}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <div
            v-if="!usersFromBooking.length && !ordersFromBooking?.length"
            class="bg-light-warning p-3"
          >
            {{ t("noBookedUsers") }}
          </div>
        </template>
      </div>
    </ElScrollbar>
  </BaseModal>

  <div class="position-relative">
    <LoadingComponent
      v-if="events.isLoading.value"
      class="position-absolute top-0 left-0 w-100 h-100"
      style="z-index: 1000; background-color: rgba(255, 255, 255, 0.5)"
    />
    <FullCalendar
      class="demo-app-calendar notranslate"
      :options="calendarOptions"
      style="min-width: 700px"
    >
      <template #eventContent="arg">
        <ElPopover
          keep-alive
          trigger="click"
          width="300px"
          :title="arg.event.title"
          popper-class="custom-title"
        >
          <template #reference>
            <div
              class="w-100 position-relative d-flex align-items-center"
              style="font-size: 0.9rem"
            >
              <template v-if="mode == 'user'">
                <i
                  class="ki-solid ki-check-square fs-3 text-success me-2"
                  v-if="arg.event.extendedProps.booked"
                ></i>
                <i
                  class="ki-solid ki-cross-square fs-3 text-danger me-2"
                  v-else
                ></i>
              </template>
              {{ arg.event.title }}
            </div>
          </template>
          <template #default v-if="props.mode === 'manager'">
            <ManagerPopoverContent
              @show-users-modal="usersModalEventId = arg.event.id"
              @show-orders-modal="
                handleLoadUsers(arg.event.extendedProps.orderIds)
              "
              @show-waitlist-modal="waitlistModalEventId = arg.event.id"
              :arg="arg"
              @deleteEvent="emit('deleteEvent', arg.event)"
              @updateEventOpen="showEventUpdate(arg.event)"
              @showCreateChatModal="createChatModalEventId = arg.event.id"
              :create-chat-loading="true"
            />
          </template>

          <template #default v-else-if="props.mode === 'user'">
            <StudentPopoverContent
              @mousedown.prevent.stop
              :arg="arg"
              :enable-actions="enableActions"
              @add-to-waitlist="emit('addToWaitlist', arg.event)"
              @remove-from-waitlist="emit('removeFromWaitlist', arg.event)"
              @bookEvent="emit('bookEvent', arg.event.id)"
              @cancelBooking="emit('cancelBooking', arg.event)"
            />
          </template>
        </ElPopover>
      </template>
    </FullCalendar>
  </div>
</template>

<script lang="ts" setup>
import { UserModal } from "../user-management";
import {
  computed,
  ref,
  type PropType,
  type Ref,
  ComputedRef,
  nextTick,
  watch,
} from "vue";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { CalendarOptions } from "@fullcalendar/core";
import { ElPopover, ElLoading } from "element-plus";
import {
  OrdersResponse,
  useCreateChat,
  useEvents,
  useMe,
  getBookingOrders,
  useUpdateEvent,
  getWoocommerceBookings,
  BookingsResponse,
  UsersFindAllResponse,
  getUsersByEmails,
} from "@/server-state";
import moment from "moment-timezone";
import { InputGroup, LoadableButton, SwitchGroup } from "../form";
import { Form as VForm } from "vee-validate";
import { updateEventSchema } from "@/validation-schemas/events";
import LoadingComponent from "../ui/LoadingComponent.vue";
import {
  ManagerPopoverContent,
  //@ts-ignore
  StudentPopoverContent,
} from "@/components/calendar";
import { BaseModal } from "../common";
import { toastError, toastSuccess } from "@/util/toast";
import { useI18n } from "vue-i18n";
import CreateGroupChatForm from "../messenger-parts/sidebar/CreateGroupChatForm.vue";
import { useRouter } from "vue-router";
import { useDefaultEventColor } from "@/composables/useDefaultEventColor";
import usePredefinedColors from "@/composables/usePredefinedColors";
import { getAssetPath } from "@/core/helpers/assets";
import BaseImage from "@/components/common/BaseImage.vue";

const { t } = useI18n();
const me = useMe();

const emit = defineEmits([
  "deleteEvent",
  "bookEvent",
  "cancelBooking",
  "dateClick",
  "addToWaitlist",
  "removeFromWaitlist",
  "removeUserFromWaitlist",
  "updatePresence",
]);

const props = defineProps({
  mode: {
    type: String as PropType<"manager" | "user">,
    required: false,
    default: "user",
    validator: (value: string) => {
      return ["manager", "user"].includes(value);
    },
  },
  filters: {
    type: Object as PropType<{
      onlyClub: boolean;
      predefinedEventId: string | null;
      courseId: string | null;
    }>,
    required: false,
  },

  enableActions: {
    type: Boolean,
    default: true,
  },
});

const INITIAL_DATE = new Date();
const currDate = ref<Date>(INITIAL_DATE);

const currentUserModalId = ref<string | null>(null);

const updateEventModalCurrentId = ref<string | null>(null);

const colorUpdateEvent = ref(useDefaultEventColor(false));

const usersModalEventId = ref<string | null>(null);
const ordersModalIds = ref<number[] | null>(null);
const ordersFromBooking = ref<OrdersResponse | null>(null);
const usersFromBooking = ref<UsersFindAllResponse>([]);
const isOrdersLoading = ref(false);
const waitlistModalEventId = ref<string | null>(null);

const showUsersModal = computed<boolean>({
  get() {
    return !!usersModalEventId.value;
  },
  set(value: boolean) {
    if (!value) {
      usersModalEventId.value = null;
    }
  },
});

const showOrdersModal = computed<boolean>({
  get() {
    return !!ordersModalIds.value;
  },
  set(value: boolean) {
    if (!value) {
      ordersModalIds.value = null;
    }
  },
});

const showWaitlistModal = computed<boolean>({
  get() {
    return !!waitlistModalEventId.value;
  },
  set(value: boolean) {
    if (!value) {
      waitlistModalEventId.value = null;
    }
  },
});

const showUpdateEventModal = computed<boolean>({
  get() {
    return updateEventModalCurrentId.value !== null;
  },
  set(value: boolean) {
    if (!value) {
      updateEventModalCurrentId.value = null;
    }
  },
});

const currEvent: ComputedRef<any> = computed(() => {
  return events.data.value?.find((event: any) => {
    return event.id === updateEventModalCurrentId.value;
  });
});

const updateEvent = useUpdateEvent();
const handleUpdateEventSubmit = async (values: any) => {
  // Do not send isClub to backend
  // Also, if we arent updating a club event, we should not send title
  let rest;
  if (values["isClub"]) {
    rest = { ...values };
    delete rest["isClub"];
  } else {
    rest = values;
    delete rest["isClub"];
    delete rest["title"];
  }

  updateEvent.mutate(
    {
      id: updateEventModalCurrentId.value,
      ...rest,
      totalSlots: rest.enableBooking
        ? rest.totalSlots
        : currEvent.value?.users.length ?? 0,
    },
    {
      onSuccess: () => {
        toastSuccess(t("eventUpdated"));
      },
      onError: (error: any) => {
        toastError(error?.message || "Error al actualizar el evento");
      },
      onSettled: () => {
        showUpdateEventModal.value = false;
      },
    }
  );
};

const events = useEvents({
  date: currDate,
  onlyClub: computed(() => props.filters?.onlyClub),
  predefinedEventId: computed(() => props.filters?.predefinedEventId),
  courseId: computed(() => props.filters?.courseId),
});

const bookings = ref<BookingsResponse>([]);

const loadBookings = async () => {
  const role = me.data.value?.role;
  bookings.value =
    role && role !== "STUDENT" ? await getWoocommerceBookings() : [];
};

loadBookings();

watch(me.data, (value) => {
  if (value) loadBookings();
});

const eventsFormatted = computed(() => {
  const appEvents =
    events.data.value?.map((event: any) => {
      return {
        ...event,
        title: event.title,
        start: event.startDate,
        end: event.endDate,
        booked: event.users
          .map((user: any) => user.id)
          .includes(me.data.value?.id),
        inWaitlist: event.waitlist
          .map((user: any) => user.id)
          .includes(me.data.value?.id),
        backgroundColor: event.color,
      };
    }) || [];

  const bookingsEvents =
    bookings.value
      ?.map((booking) => {
        return {
          ...booking,
          woocommerce: true,
          title: booking.event.name,
          id: booking.id.toString(),
          start: booking.startDate,
          end: booking.endDate,
          description: booking.event.description,
          booked: true,
          inWaitlist: false,
          backgroundColor: "#9B5C8F",
          color: "#9B5C8F",
          users: [],
          usersCount: booking.orderIds.length,
          waitlist: [],
        };
      })
      .filter((booking) => booking.status === "paid") || [];

  return [...appEvents, ...bookingsEvents];
});

const selectedEvent = computed(() =>
  eventsFormatted.value.find((e) => e.id === usersModalEventId.value)
);

const calendarOptions: Ref<CalendarOptions> = computed(() => {
  return {
    eventDisplay: "block",
    plugins: [dayGridPlugin, interactionPlugin],
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
      return "+" + n + " " + t("more");
    },
    eventMaxStack: 3,
    dateClick: (arg: any) => {
      emit("dateClick", arg.dateStr);
    },
    navLinkDayClick: (arg: any) => {
      emit("dateClick", moment(arg).format("YYYY-MM-DD"));
    },
  };
});

const createChatModalEventId = ref<string | null>(null);

const showCreateChatModal = computed<boolean>({
  get() {
    return createChatModalEventId.value !== null;
  },
  set(value: boolean) {
    if (!value) {
      createChatModalEventId.value = null;
    }
  },
});

const showEventUpdate = (event: any) => {
  colorUpdateEvent.value =
    event.backgroundColor !== "null" && event.backgroundColor
      ? event.backgroundColor
      : useDefaultEventColor(event.extendedProps.isClub);

  updateEventModalCurrentId.value = event.id;
};

const handleLoadUsers = async (orderIds: number[]) => {
  isOrdersLoading.value = true;
  usersFromBooking.value = [];
  ordersModalIds.value = orderIds;

  await nextTick();

  const loading = ElLoading.service({
    target: "#orders-modal",
  });

  try {
    ordersFromBooking.value = (await getBookingOrders(orderIds)) ?? [];

    const userEmails = ordersFromBooking.value.map((order) => order.user.email);

    if (userEmails.length > 0) {
      usersFromBooking.value = (await getUsersByEmails(userEmails)) ?? [];
    }
  } finally {
    if (usersFromBooking.value.length > 0 && ordersFromBooking.value) {
      ordersFromBooking.value = ordersFromBooking.value.filter((order) =>
        usersFromBooking.value.some((user) => user.email !== order.user.email)
      );
    }

    isOrdersLoading.value = false;
    loading.close();
  }
};

const router = useRouter();
const createChat = useCreateChat();
const handleCreateEventChat = async (values: { name: string; image: File }) => {
  createChat.mutate(
    {
      name: values.name,
      image: values.image,
      userIds: events.data.value
        ?.filter((e: any) => e.id === createChatModalEventId.value)[0]
        ?.users.map((u) => u.id),
    },
    {
      onSuccess: (data) => {
        toastSuccess(t("chatCreated"));
        router.push({
          name: "chat",
          query: {
            id: data.id,
          },
        });
      },
      onError: (err: any) => {
        toastError(err?.message || "Error creating chat");
      },
      onSettled: () => {
        showCreateChatModal.value = false;
      },
    }
  );
};
</script>

<style lang="scss">
@import "@/assets/sass/components/_variables.custom.scss";
</style>
