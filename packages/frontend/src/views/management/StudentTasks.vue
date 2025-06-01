<template>
  <ContentErrorAlert v-if="user.error.value || studentEvents.error.value" />
  <LoadingComponent
    v-else-if="user.isLoading.value || studentEvents.isLoading.value"
  />
  <template v-else-if="user.data.value && studentEvents.data.value">
    <HeaderComponent>
      <div class="symbol symbol-40px">
        <img
          :src="
            user.data.value?.pictureUrl ??
            getAssetPath('media/default-profile-picture.png')
          "
        />
      </div>
      <span class="fs-1"
        >{{ user.data.value?.firstName }} {{ user.data.value?.lastName }}</span
      >
    </HeaderComponent>

    <SectionTasks
      row
      v-if="user.data.value?.course?.id"
      :user="user.data.value"
    />

    <SectionTasks
      v-if="user.data.value?.isInClub"
      is-club
      row
      :user="user.data.value"
    />
  </template>
</template>

<script lang="ts" setup>
import { useRouter } from "vue-router";
import { useStudentEvents, useUser } from "@/server-state";
import ContentErrorAlert from "@/components/common/ContentErrorAlert.vue";
import { LoadingComponent } from "@/components/ui";
import { HeaderComponent } from "@/components/student-tasks";
import { getAssetPath } from "@/core/helpers/assets";
import SectionTasks from "@/components/student-tasks/SectionTasks.vue";

const router = useRouter();

const studentId = router.currentRoute.value.params.studentId as string;

const user = useUser(studentId);
const studentEvents = useStudentEvents(studentId);
</script>
