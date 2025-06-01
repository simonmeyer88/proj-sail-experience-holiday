<template>
  <ContentErrorAlert v-if="me.error.value || studentEvents.error.value" />
  <LoadingComponent
    v-else-if="me.isLoading.value || studentEvents.isLoading.value"
  />
  <template v-else-if="me.data.value && studentEvents.data.value">
    <HeaderComponent>{{ t("myProgress") }}</HeaderComponent>

    <SectionComponent v-if="me.data.value?.course?.id">
      <SectionTitle>
        {{ t("courseTasks") }}: {{ me.data.value?.course.name }}
      </SectionTitle>
      <div
        v-if="
          studentEvents.data.value?.filter((obj) => obj.event.isClub === false)
            ?.length === 0
        "
        class="alert alert-warning"
      >
        {{ t("noCourseTasks") }}
      </div>
      <div class="row g-5">
        <div
          v-for="event in studentEvents.data.value?.filter(
            (obj) => obj.event.isClub === false
          )"
          :key="event.eventId + event.userId"
          class="col-12 col-md-6 col-lg-6 col-xxl-4"
        >
          <EventCard :event="event" />
        </div>
      </div>
      <div class="mt-8">
        <h3 class="mb-2">{{ t("pendingTasks") }}</h3>
        <div class="row g-5" v-if="pendingEvents.length !== 0">
          <div
            v-for="event in pendingEvents"
            :key="event.event.id"
            class="col-12 col-sm-6 col-md-4 col-lg-4 col-xxl-3"
          >
            <PendingTaskCard :title="event.event.title" />
          </div>
        </div>
        <template v-else>
          <NoPendingTasks />
        </template>
      </div>
    </SectionComponent>

    <SectionComponent v-if="me.data.value?.isInClub">
      <SectionTitle>{{ t("clubTasks") }}</SectionTitle>
      <div
        v-if="
          studentEvents.data.value?.filter((obj) => obj.event.isClub === true)
            ?.length === 0
        "
        class="alert alert-warning"
      >
        {{ t("noClubTasks") }}
      </div>
      <div class="row g-5">
        <div
          v-for="userOnEvent in studentEvents.data.value?.filter(
            (x) => x.event.isClub === true
          )"
          :key="userOnEvent.eventId + userOnEvent.userId"
          class="col-12 col-md-6 col-lg-6 col-xxl-4"
        >
          <EventCard :event="userOnEvent" />
        </div>
      </div>
    </SectionComponent>
  </template>
</template>
<i18n>
  {
    "en": {
      "myProgress": "My progress",
      "courseTasks": "Course tasks",
      "noCourseTasks": "You have not done any course tasks",
      "pendingTasks": "Pending tasks",
      "clubTasks": "Club tasks",
      "noClubTasks": "You have not done any club tasks"
    },
    "es": {
      "myProgress": "Mi progreso",
      "courseTasks": "Tareas del curso",
      "noCourseTasks": "No has realizado ninguna tarea del curso",
      "pendingTasks": "Tareas pendientes",
      "clubTasks": "Tareas del club",
      "noClubTasks": "No has realizado ninguna tarea del club"
    }
  }
</i18n>
<script lang="ts" setup>
import { computed } from "vue";
import { useMe, usePredefinedEvents, useStudentEvents } from "@/server-state";
import { LoadingComponent } from "@/components/ui";
import ContentErrorAlert from "@/components/common/ContentErrorAlert.vue";
import {
  EventCard,
  PendingTaskCard,
  SectionComponent,
  HeaderComponent,
  SectionTitle,
  NoPendingTasks,
} from "@/components/student-tasks";
import { useI18n } from "vue-i18n";
const me = useMe();

const studentEvents = useStudentEvents(
  computed(() => me.data.value?.id ?? null)
);

const predEvents = usePredefinedEvents();

const coursePredEvents = computed(() => {
  const coursePredEvents = predEvents.data.value?.filter((x) =>
    x.courses.some((c) => c.courseId === me.data.value?.course?.id)
  );
  return coursePredEvents;
});

// if user has not done or booked it, it is pending
const pendingEvents = computed(() => {
  const pendingEvents: any[] = [];
  const allCourseEventsDoneOrPendingByUser = studentEvents.data.value?.filter(
    (x) =>
      x.event.isClub === false &&
      x.event.predefinedEvent?.courses.some(
        (c) => c.courseId === me.data.value?.course?.id
      )
  );

  coursePredEvents.value?.forEach((coursePredEvent) => {
    const doneOrBookedByUser =
      allCourseEventsDoneOrPendingByUser?.filter(
        (x) => x.event.predefinedEventId === coursePredEvent.id
      ).length || 0;

    if (doneOrBookedByUser < 1) {
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

const { t } = useI18n();
</script>
