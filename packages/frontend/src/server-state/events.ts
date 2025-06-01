import ApiService from "@/core/services/ApiService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { toValue, computed } from "vue";
import type { MaybeRef } from "vue";
import type { EventsController } from "@aula-anclademia/backend/src/events/events.controller";

import type { CreateEventDto } from "@aula-anclademia/backend/src/events/dto/create-event.dto";
import type { UpdateEventDto } from "@aula-anclademia/backend/src/events/dto/update-event.dto";
import { RecurrenceRule } from "@aula-anclademia/backend/dist/src/events/events.service";

type EventsResponse = Awaited<
  ReturnType<InstanceType<typeof EventsController>["findAllForUser"]>
>;
export type BookingsResponse = Awaited<
  ReturnType<
    InstanceType<typeof EventsController>["loadBookingsFromWoocommerce"]
  >
>;
export type OrdersResponse = Awaited<
  ReturnType<InstanceType<typeof EventsController>["loadOrdersFromWoocommerce"]>
>;
type PredefinedEventsResponse = Awaited<
  ReturnType<InstanceType<typeof EventsController>["findAllPredefined"]>
>;

type UsersOnEventsResponse = Awaited<
  ReturnType<InstanceType<typeof EventsController>["findAllUsersOnEvents"]>
>;
// Define the arguments type for the useEvents hook
type Args =
  | {
      enabled?: MaybeRef<boolean>;
    }
  | undefined;

export interface DeleteParams {
  id: string;
  recurrence?: RecurrenceRule;
}

export const useEvents = (
  {
    date,
    onlyClub,
    predefinedEventId,
    courseId,
  }: {
    date: MaybeRef<Date>;
    onlyClub?: MaybeRef<boolean | null | undefined>;
    predefinedEventId?: MaybeRef<string | null | undefined>;
    courseId?: MaybeRef<string | null | undefined>;
  },
  { enabled: enabled = true }: Args = {}
) => {
  return useQuery({
    queryKey: ["events", date, enabled, onlyClub, predefinedEventId, courseId],
    queryFn: async () => {
      return (await ApiService.get("/events", {
        date: toValue(date),
        onlyClub: toValue(onlyClub),
        predefinedEventId: toValue(predefinedEventId),
        courseId: toValue(courseId),
      })) as EventsResponse;
    },
    enabled: enabled,
  });
};

export const getWoocommerceBookings = async () => {
  return (await ApiService.get("/bookings")) as BookingsResponse;
};

export const getBookingOrders = async (ordersIds: number[]) => {
  return (await ApiService.post("/booking-orders", {
    ids: ordersIds,
  })) as OrdersResponse;
};

export type CreateEventReq = Omit<
  CreateEventDto,
  "startDate" | "endDate" | "recurrenceEnd"
> & {
  startDate: string;
  endDate: string;
  recurrenceEnd: string;
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (event: CreateEventReq) => {
      await ApiService.post("/events", {
        isClub: event.isClub,
        title: event.title,
        startDate: event.startDate,
        endDate: event.endDate,
        totalSlots: event.totalSlots,
        predefinedEventId: event.predefinedEventId,
        description: event.description,
        color: event.color,
        recurrenceRule: event.recurrenceRule,
        recurrenceEnd: event.recurrenceEnd,
        repeatDays: event.repeatDays,
        repeatDates: event.repeatDates,
        enableBooking: event.enableBooking,
      });
    },
    mutationKey: ["createEvent"],
    onSuccess: () => {
      queryClient.invalidateQueries(["events"]);
    },
  });
};

export const useStudentEvents = (studentId: MaybeRef<string | null>) => {
  return useQuery({
    queryKey: ["studentEvents", studentId],
    queryFn: async () => {
      return (await ApiService.get(
        `/users-on-events/${toValue(studentId)}`
      )) as UsersOnEventsResponse;
    },
    enabled: computed(() => !!toValue(studentId)),
  });
};

export const useDeleteStudentOnEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      studentId,
      eventId,
    }: {
      studentId: string;
      eventId: string;
    }) => {
      await ApiService.delete(`/users-on-events/${studentId}/${eventId}`);
    },
    mutationKey: ["deleteStudentOnEvent"],
    onSuccess: () => {
      queryClient.invalidateQueries(["events"]);
      queryClient.invalidateQueries(["studentEvents"]);
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, recurrence }: DeleteParams) => {
      await ApiService.delete(
        `/events/${id}${recurrence ? `?recurrence=${recurrence}` : ""}`
      );
    },
    mutationKey: ["deleteEvent"],
    onSuccess: () => {
      queryClient.invalidateQueries(["events"]);
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateEventDto & { id: string }) => {
      const { id, ...rest } = data;
      await ApiService.patch(`/events/${id}`, rest);
    },
    mutationKey: ["updateEvent"],
    onSuccess: () => {
      queryClient.invalidateQueries(["events"]);
    },
  });
};

export const useUpdateBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      eventId,
      userId,
      book,
    }: {
      eventId: string;
      book: boolean;
      userId: string;
    }) => {
      await ApiService.post(`/users-on-events/${eventId}/${userId}/bookings`, {
        book,
      });
    },
    mutationKey: ["updateBooking"],
    onSuccess: () => {
      queryClient.invalidateQueries(["events"]);
    },
  });
};

export const useUpdateWaitlist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      eventId,
      userId,
      join,
    }: {
      eventId: string;
      join: boolean;
      userId: string;
    }) => {
      await ApiService.post(`/users-on-events/${eventId}/${userId}/waitlist`, {
        join,
      });
    },
    mutationKey: ["updateWaitlist"],
    onSuccess: () => {
      queryClient.invalidateQueries(["events"]);
    },
  });
};

export const useCreatePredefinedEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      courseIds,
    }: {
      title: string;
      courseIds: string[];
    }) => {
      await ApiService.post("/predefined-events", {
        title,
        courseIds,
      });
    },
    mutationKey: ["createPredefinedEvent"],
    onSuccess: () => {
      queryClient.invalidateQueries(["events"]);
      queryClient.invalidateQueries(["courses"]);
      queryClient.invalidateQueries(["predefinedEvents"]);
    },
  });
};

export const useUpdatePredefinedEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      title,
      courseIds,
    }: {
      id: string;
      title?: string;
      courseIds?: string[];
    }) => {
      await ApiService.patch(`/predefined-events/${id}`, {
        title,
        courseIds,
      });
    },
    mutationKey: ["updatePredefinedEvent"],
    onSuccess: () => {
      queryClient.invalidateQueries(["events"]);
      queryClient.invalidateQueries(["courses"]);
      queryClient.invalidateQueries(["predefinedEvents"]);
    },
  });
};

export const useDeletePredefinedEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await ApiService.delete(`predefined-events/${id}`);
    },
    mutationKey: ["deletePredefinedEvent"],
    onSuccess: () => {
      queryClient.invalidateQueries(["events"]);
      queryClient.invalidateQueries(["courses"]);
      queryClient.invalidateQueries(["predefinedEvents"]);
    },
  });
};

export const usePredefinedEvents = () => {
  return useQuery({
    queryKey: ["predefinedEvents"],
    queryFn: async () => {
      return (await ApiService.get(
        "/predefined-events"
      )) as PredefinedEventsResponse;
    },
  });
};

export const useArtificiallyMarkPendingAsCompleted = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      predefinedEventId,
      studentId,
    }: {
      predefinedEventId: string;
      studentId: string;
    }) => {
      await ApiService.post(
        `/mark-predefined-events-as-completed/${predefinedEventId}/${studentId}`,
        {}
      );
    },
    mutationKey: ["artificiallyMarkPendingAsCompleted"],
    onSuccess: () => {
      queryClient.invalidateQueries(["events"]);
      queryClient.invalidateQueries(["studentEvents"]);
    },
  });
};
