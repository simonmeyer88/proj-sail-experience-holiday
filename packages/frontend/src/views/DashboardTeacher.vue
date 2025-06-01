<template>
  <LoadingComponent v-if="teacherStats.isLoading.value" :height="500" />
  <div class="row g-5 g-xl-10" v-else>
    <div class="col-12 col-md-6 mb-0">
      <WelcomeWidget class="h-100" />
    </div>
    <div class="col-12 col-md-6">
      <StudentsWidget class="h-100" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import StudentsWidget from "@/components/dashboard/StudentsWidget.vue";
import WelcomeWidget from "@/components/dashboard/WelcomeWidget.vue";
import { useTeacherStats } from "@/server-state/stats";
import { LoadingComponent } from "@/components/ui";
const teacherStats = useTeacherStats();
</script>
