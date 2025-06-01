<template>
  <LoadingComponent v-if="loading" :height="500" />
  <div class="row g-5 g-xl-10" v-else>
    <div class="col-12 col-md-6 mb-8 mb-md-0">
      <WelcomeWidget class="h-50 mb-5 mb-xl-10" />
      <StudentsWidget class="h-50 mb-5 mb-xl-10" />
    </div>
    <div class="col-12 col-md-6 mb">
      <CoursesWidget class="h-100" />
    </div>
  </div>
</template>

<style scoped>
.mb {
  margin-bottom: -1.25rem !important;
}

@media (min-width: 1200px) {
  .mb {
    margin-bottom: -2.5rem !important;
  }
}
</style>

<script lang="ts" setup>
import CoursesWidget from "@/components/dashboard/CoursesWidget.vue";
import StudentsWidget from "@/components/dashboard/StudentsWidget.vue";
import WelcomeWidget from "@/components/dashboard/WelcomeWidget.vue";
import { LoadingComponent } from "@/components/ui";
import { useTeacherStats, useAdminStats } from "@/server-state/stats";
import { computed } from "vue";

const teacherStats = useTeacherStats();
const adminStats = useAdminStats();

const loading = computed(() => {
  return teacherStats.isLoading.value || adminStats.isLoading.value;
});
</script>
