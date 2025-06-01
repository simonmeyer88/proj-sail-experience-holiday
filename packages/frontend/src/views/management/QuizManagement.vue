<template>
  <LoadingComponent v-if="quiz.isLoading.value" />
  <template v-else-if="quiz.data.value">
    <h1
      class="text-success mb-6 d-flex align-items-center"
      style="font-size: 36px"
    >
      {{ quiz.data.value?.name }}
    </h1>
    <div class="position-relative mb-5 d-flex align-items-center">
      <i
        class="bi bi-search position-absolute ms-3 fs-4 text-primary"
        style="top: 50%; transform: translateY(-50%); left: 0"
      ></i>

      <input
        type="text"
        v-model="search"
        class="form-control form-control-sm mw-400px ps-9"
        :placeholder="t('searchQuestion')"
      />
    </div>
    <template v-if="quiz.data.value">
      <div
        v-for="(question, idx) in quiz.data.value.questions.filter((q) =>
          q.content
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .includes(
              debouncedSearch
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
            )
        )"
        :key="question.id"
        class="mb-7"
      >
        <h3 class="text-primary">
          <span class="fs-1">{{ idx + 1 }} ∙</span> {{ question.content }}
        </h3>
        <div class="d-flex flex-column gap-3">
          <div
            v-for="answer in question.answers"
            :key="answer.id"
            class="d-flex no-wrap align-items-center gap-2 ms-4"
          >
            <input
              class="form-check-input form-check-input-sm flex-shrink-0"
              type="radio"
              :id="question.id"
              :value="answer.id"
              v-model="answers[question.id]"
            />
            <label
              :for="answer.content"
              class="fw-bold"
              :class="{
                'text-success': answer.isCorrect,
              }"
              >{{ answer.content }}</label
            >
          </div>
        </div>
      </div>
    </template>

    <button
      @click="onQuizSave"
      class="btn btn-primary btn-lg fs-4 mt-8 position-sticky"
      style="bottom: 20px"
    >
      {{ t("save") }}
    </button>
  </template>
</template>
<i18n>
  {
    "en":{
      "searchQuestion": "Search question",
      "save": "Save changes",
      "quizUpdated": "Quiz updated successfully",
    },
    "es":{
      "searchQuestion": "Buscar pregunta",
      "save": "Guardar cambios",
      "quizUpdated": "Quiz actualizado correctamente",
    }
  }
</i18n>
<script lang="ts" setup>
import { useRoute } from "vue-router";
import { ref } from "vue";
import { toastError, toastSuccess } from "@/util/toast";
import { useQuiz, useUpdateQuizQuestions } from "@/server-state";
import { watch } from "vue";
import { useDebounce } from "@/composables/useDebouncedRef";
import { LoadingComponent } from "@/components/ui";
import { useI18n } from "vue-i18n";

const route = useRoute();
const updateQuizQuestions = useUpdateQuizQuestions();
const quizId = route.params.id as string;

const answers = ref<any>();

const quiz = useQuiz(quizId);

const search = ref("");

const debouncedSearch = useDebounce(search, 200);
watch(
  quiz.data,
  (newVal) => {
    if (newVal) {
      answers.value = newVal.questions.reduce((acc: any, quest) => {
        acc[quest.id] = quest.answers.find((a) => a.isCorrect)?.id;
        return acc;
      }, {});
    }
  },
  { immediate: true }
);
const onQuizSave = async () => {
  const data = {
    questions:
      quiz.data.value?.questions.map((q: any) => ({
        id: q.id,
        newCorrectAnswerId: answers.value[q.id] as string,
      })) || [],
  };
  updateQuizQuestions.mutate(
    {
      quizId,
      questions: data.questions,
    },
    {
      onSuccess: () => {
        toastSuccess(t("quizUpdated"));
      },
      onError: (err: any) => {
        toastError(err.message || "Unknown error");
      },
    }
  );
};

const { t } = useI18n();
</script>
