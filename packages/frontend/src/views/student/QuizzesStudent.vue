<template>
  <LoadingComponent v-if="quizzes.isLoading.value" />
  <div class="row g-5" v-else>
    <div
      v-for="quiz in quizzes.data.value"
      :key="quiz.id"
      class="cols-12 col-md-6 col-lg-6 col-xxl-4"
    >
      <router-link
        :to="{
          name: 'student.quiz',
          params: { id: quiz.id },
        }"
      >
        <div
          class="card border card-body border border-gray-300 h-100 bg-hover-light-primary"
        >
          <div class="d-flex align-items-center h-100" style="max-width: 100%">
            <div style="max-width: calc(100% - calc(1.5rem + 3vw))">
              <div
                class="fs-2 fw-bold text-dark overflow-hidden"
                style="max-width: 100%"
              >
                {{ quiz.name }}
              </div>
              <div>
                {{ quiz.nQuestionsPerAttempt }} {{ t("questionsPerAttempt") }}
              </div>
            </div>
            <i class="ki-duotone ki-questionnaire-tablet fs-3tx ms-auto">
              <i class="path1"></i>
              <i class="path2"></i>
            </i>
          </div></div
      ></router-link>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useMe, useQuizzes } from "@/server-state";
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { LoadingComponent } from "@/components/ui";
import { useI18n } from "vue-i18n";

const me = useMe();
const { t } = useI18n();
const enabled = computed(() => !!me.data?.value?.courseId);

const quizzes = useQuizzes(
  computed(() => me.data?.value?.course?.id ?? null),
  {
    enabled,
  }
);
</script>
<i18n>
  {
    "en": {
      questionsPerAttempt: "questions per attempt",
    },
    "es": {
      questionsPerAttempt: "preguntas por intento",
    },
  }
</i18n>
