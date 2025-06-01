<template>
  <LoadingComponent v-if="studentStats.isLoading.value" :height="500" />
  <div class="row g-5 g-xl-10 mb-5 mb-xl-10" v-else>
    <div class="col-12 col-md-6 mb-5 mb-md-0">
      <WelcomeWidget class="mb-5 mb-xl-10 h-50" />
      <StudentsPaymentsWidget class="mb-5 mb-xl-10 h-50" />
    </div>
    <div class="col-12 col-md-6">
      <QuizzesChartWidget class="mb-5 mb-xl-10" style="height: 60%" />
      <CompletedTasksWidget class="mb-5 mb-xl-10" style="height: 40%" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import QuizzesChartWidget from "@/components/dashboard/QuizzesChartWidget.vue";
import WelcomeWidget from "@/components/dashboard/WelcomeWidget.vue";
import StudentsPaymentsWidget from "@/components/dashboard/StudentsPaymentsWidget.vue";
import CompletedTasksWidget from "@/components/dashboard/CompletedTasksWidget.vue";
import { useStudentStats } from "@/server-state/stats";
import { LoadingComponent } from "@/components/ui";

// Avoid rendering any component before all data is loaded
const studentStats = useStudentStats();
</script>
