<template>
  <SectionComponent>
    <SectionTitle>
      {{ t(isClub ? "clubTasks" : "course") }}
      {{ !isClub ? user.course.name : "" }}
    </SectionTitle>
    <div
      v-if="courseTasks && courseTasks.length === 0"
      class="alert alert-warning"
    >
      {{ t(isClub ? "noClubTasksDone" : "noCourseTasksDone") }}
    </div>

    <div class="row g-5">
      <div
        v-for="event in courseTasks"
        :key="event.eventId + event.userId"
        class="col-12 h-auto"
        :class="{ 'col-md-6 col-lg-6 col-xxl-4': row }"
      >
        <EventCard :event="event" show-actions />
      </div>
    </div>

    <div v-if="!isClub" class="mt-8">
      <h3 class="mb-2">{{ t("pendingTasks") }}</h3>
      <div class="row g-5" v-if="pendingEvents.length !== 0">
        <div
          v-for="predEvent in pendingEvents"
          :key="predEvent.event.id"
          class="col-12"
          :class="{ 'col-sm-6 col-md-6 col-lg-4 col-xxl-3': row }"
        >
          <PendingTaskCard
            class="h-100"
            :title="predEvent.event.title"
            @mark-as-completed="handleMarkAsCompleted(predEvent.event.id)"
          />
        </div>
      </div>
      <template v-else>
        <NoPendingTasks />
      </template>
    </div>
  </SectionComponent>
</template>

<script setup lang="ts">
import {
  EventCard,
  PendingTaskCard,
  SectionComponent,
  SectionTitle,
} from "@/components/student-tasks/index";
import NoPendingTasks from "@/components/student-tasks/NoPendingTasks.vue";
import { useI18n } from "vue-i18n";
import {
  useArtificiallyMarkPendingAsCompleted,
  usePredefinedEvents,
  UsersFindOneResponse,
  useStudentEvents,
} from "@/server-state";
import { computed } from "vue";
import { toastError, toastSuccess } from "@/util/toast";

interface Props {
  user: UsersFindOneResponse;
  isClub?: boolean;
  row?: boolean;
}

const props = defineProps<Props>();

const { t } = useI18n();

const studentEvents = useStudentEvents(props.user.id);
const predEvents = usePredefinedEvents();
const artificiallyMarkAsCompleted = useArtificiallyMarkPendingAsCompleted();

const courseTasks = computed(() =>
  studentEvents.data.value?.filter((obj) => obj.event.isClub === props.isClub)
);

const coursePredEvents = computed(() => {
  return predEvents.data.value?.filter((x) =>
    x.courses.some((c) => c.courseId === props.user.course?.id)
  );
});

// if user has not done or booked, it is pending
const pendingEvents = computed(() => {
  const pendingEvents: any[] = [];
  const allCourseEventsDoneOrPendingByUser = studentEvents.data.value?.filter(
    (x) =>
      !x.event.isClub &&
      x.event.predefinedEvent?.courses.some(
        (c) => c.courseId === props.user.course?.id
      )
  );

  coursePredEvents.value?.forEach((coursePredEvent) => {
    const doneByUser =
      allCourseEventsDoneOrPendingByUser?.filter(
        (x) => x.event.predefinedEventId === coursePredEvent.id
      ).length || 0;

    if (doneByUser < 1) {
      pendingEvents.push({
        event: {
          title: coursePredEvent.title,
          id: coursePredEvent.id,
        },
      });
    }
  });

  return pendingEvents;
});

const handleMarkAsCompleted = (predefinedEventId: string) => {
  artificiallyMarkAsCompleted.mutate(
    { predefinedEventId, studentId: props.user.id },
    {
      onSuccess() {
        toastSuccess(t("markedAsCompleted"));
      },
      onError(error: any) {
        toastError(error.message || "Unknown error");
      },
    }
  );
};
</script>

<style scoped lang="scss"></style>

<i18n>
{
    "en": {
        "course": "Course:",
        "noCourseTasksDone": "You have not done any course tasks yet.",
        "pendingTasks": "Pending tasks",
        "clubTasks": "Club tasks",
        "noClubTasksDone": "You have not done any club tasks yet.",
        "markedAsCompleted": "Task marked as completed."
    },
    "es": {
        "course": "Curso:",
        "noCourseTasksDone": "No se ha realizado ninguna tarea del curso.",
        "pendingTasks": "Tareas pendientes",
        "clubTasks": "Tareas del club",
        "noClubTasksDone": "No se ha realizado ninguna tarea del club.",
        "markedAsCompleted": "Tarea marcada como completada."
    }
}
</i18n>
