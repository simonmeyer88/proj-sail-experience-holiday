<template>
  <LoadingComponent v-if="quizData.isFetching.value" />
  <template v-else-if="quizData.data.value">
    <h1
      class="text-dark mb-4 pb-2 border-bottom border-bottom-dashed border-gray-400"
      style="font-size: 36px"
    >
      {{ quizData.data.value.name }}
      <span class="text-dark" v-if="submitted"
        >{{ lastScore }}/{{ quizData.data.value.questions.length }}
      </span>
    </h1>

    <div
      v-for="(question, idx) in quizData.data.value.questions"
      :key="question.content"
      class="mb-7"
    >
      <h3 class="text-primary">
        <span class="fs-2">{{ idx + 1 }} ∙</span> {{ question.content }}
      </h3>
      <div class="d-flex flex-column gap-3">
        <div
          v-for="answer in question.answers"
          :key="answer.content"
          class="d-flex no-wrap align-items-center gap-2"
        >
          <input
            :disabled="submitted"
            class="form-check-input border border-gray-500 form-check-input-sm flex-shrink-0"
            type="radio"
            :id="question.id"
            :value="answer.id"
            v-model="answers[question.id]"
          />
          <label
            :for="answer.content"
            class="fw-bold ms-2"
            :class="{
              'text-success': submitted && answer.isCorrect,
              'text-danger':
                submitted &&
                !answer.isCorrect &&
                answers[question.id] === answer.id,
            }"
            >{{ answer.content }}</label
          >
        </div>
      </div>
    </div>
    <button
      @click="onQuizSubmit"
      class="btn btn-primary btn-lg fs-4 mt-8 position-sticky"
      style="bottom: 20px"
    >
      {{ submitted ? t("reset") : t("submit") }}
    </button>
    <ConfettiExplosion
      v-bind="{} as any"
      :particle-count="200"
      v-if="exploding"
      class="position-fixed start-50"
      style="top: 25%; z-index: 9999999"
    />
  </template>
</template>

<script lang="ts" setup>
import { useQuizRandomQuestions } from "@/server-state";
import { alertError, alertSuccess } from "@/util/alert";
import { watch } from "vue";
import { ref } from "vue";
import ConfettiExplosion from "vue-confetti-explosion";
import { useRoute } from "vue-router";
import LoadingComponent from "@/components/ui/LoadingComponent.vue";
import ApiService from "@/core/services/ApiService";
import { useI18n } from "vue-i18n";

const route = useRoute();

const { t } = useI18n();
const quizId = route.params.id;

const dialogVisible = ref(false);

const answers = ref<any>({});

const correctAnswers = ref<any>({});

const quizData = useQuizRandomQuestions(quizId as string);

watch(quizData.data, (newVal) => {
  if (newVal) {
    answers.value = quizData.data.value!.questions.reduce(
      (acc: any, question: any) => {
        acc[question.content] = "";
        return acc;
      },
      {}
    );

    correctAnswers.value = quizData.data.value!.questions.reduce(
      (acc: any, question: any) => {
        acc[question.id] = question.answers.find(
          (answer: any) => answer.isCorrect
        ).id;
        return acc;
      },
      {}
    );
  }
});

const lastScore = ref(0);

const submitted = ref(false);

const exploding = ref(false);

const onQuizSubmit = () => {
  window.scrollTo({
    behavior: "smooth",
    top: 0,
  });
  if (submitted.value) {
    //reset quiz

    quizData.refetch();
    submitted.value = false;
    lastScore.value = 0;

    return;
  }
  const score = Object.keys(answers.value).reduce((acc: any, key: any) => {
    if (answers.value[key] === correctAnswers.value[key]) {
      acc++;
    }
    return acc;
  }, 0);

  lastScore.value = score;
  dialogVisible.value = true;
  submitted.value = true;
  exploding.value = true;
  ApiService.post("/quizzes/submit", {}).catch((err) => {
    console.error(err);
  });

  setTimeout(() => {
    exploding.value = false;
  }, 5000);

  const percentage = (score / Object.keys(answers.value).length) * 100;

  if (percentage < 50) {
    alertError({
      title:
        t("text1_1") +
        " " +
        t("text1_2") +
        " " +
        score +
        " " +
        t("text1_3") +
        " " +
        quizData.data.value!.questions.length +
        ".",
      text: t("text1_4"),
      confirmButtonText: t("accept"),
    });
    return;
  } else if (percentage >= 50 && percentage < 80) {
    alertSuccess({
      title:
        t("text2_1") +
        " " +
        t("text2_2") +
        " " +
        score +
        " " +
        t("text2_3") +
        " " +
        quizData.data.value!.questions.length +
        ".",
      text: t("text2_4"),
      confirmButtonText: t("accept"),
    });
    return;
  }
  alertSuccess({
    title:
      t("text3_1") +
      " " +
      score +
      " " +
      t("text3_2") +
      " " +
      quizData.data.value!.questions.length +
      ".",

    text: t("text3_3"),
    confirmButtonText: t("accept"),
  });
};
</script>

<i18n>
  {
    "en": {
      "text1_1": "Oh no! You have not passed the form.",
      "text1_2": "Your score is",
      "text1_3": "points out of",
      "text1_4": "You can see the correct answers below!",
      "text2_1": "Well done! You have passed the form.",
      "text2_2": "Your score is",
      "text2_3": "points out of",
      "text2_4": "You can see the correct answers below!",
      "text3_1": "Congratulations! You have successfully completed the form. Your score is",
      "text3_2": "points out of",
      "text3_3": "You can see the correct answers below!",
      "accept": "Accept",
      "submit": "Submit",
      "reset": "New quiz",

    },
    "es": {
      "text1_1": "¡Oh no! No has superado el formulario.",
      "text1_2": "Tu puntuación es de",
      "text1_3": "puntos sobre",
      "text1_4": "¡Puedes ver las respuestas correctas a continuación!",
      "text2_1": "¡Bien! Has superado el formulario.",
      "text2_2": "Tu puntuación es de",
      "text2_3": "puntos sobre",
      "text2_4": "¡Puedes ver las respuestas correctas a continuación!",
      "text3_1": "¡Enhorabuena! Has completado el formulario con éxito. Tu puntuación es de",
      "text3_2": "puntos sobre",
      "text3_3": "¡Puedes ver las respuestas correctas a continuación!",
      "accept": "Aceptar",
      "submit": "Enviar",
      "reset": "Nuevo formulario",
    }
  }
</i18n>
