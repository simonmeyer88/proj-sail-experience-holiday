<i18n>
  {
    "en": {
      "actions": "Actions",
      "course": "Course",
      "edit": "Edit",
      "delete": "Delete",
      "create": "Create",
      "update": "Update",
      "name": "Name",
      "nQuestionsPerAttempt": "Questions/attempt",
      "courses": "Courses",
      "editQuiz": "Edit quiz",
      "createdQuiz": "Quiz created",
      "deletedQuiz": "Quiz deleted",
      "updatedQuiz": "Quiz updated",
      "editQuestions": "Edit questions",
      "createQuiz": "Create quiz",
      "excelFile": "Excel file"
    },
    "es": {
      "actions": "Acciones",
      "course": "Curso",
      "edit": "Editar",
      "delete": "Eliminar",
      "create": "Crear",
      "update": "Actualizar",
      "name": "Nombre",
      "nQuestionsPerAttempt": "Preguntas/intento",
      "courses": "Cursos",
      "editQuiz": "Editar quiz",
      "createdQuiz": "Quiz creado",
      "deletedQuiz": "Quiz eliminado",
      "updatedQuiz": "Quiz actualizado",
      "editQuestions": "Editar preguntas",
      "createQuiz": "Crear quiz",
      "excelFile": "Archivo excel"
    }
  }
</i18n>
<template>
  <div class="d-flex gap-5">
    <button class="btn btn-primary" @click="showNewQuizModal = true">
      <i class="ki-duotone ki-add-notepad fs-1 me-2">
        <i class="path1"></i>
        <i class="path2"></i>
        <i class="path3"></i>
        <i class="path4"></i>
      </i>
      {{ t("create") }}
    </button>
    <select v-model="selectedCourse" class="form-select w-150px">
      <option
        v-for="course in coursesOptions"
        :value="course.value"
        :key="course.value"
      >
        {{ course.label }}
      </option>
    </select>
  </div>

  <div class="mt-5">
    <KTDatatable
      :header="tableHeader"
      :data="quizzes.data.value || []"
      :loading="quizzes.isLoading.value"
    >
      <template #name="{ row }">
        <div style="max-width: 280px">
          {{ row.name }}
        </div>
      </template>

      <template #course="{ row }">
        <div style="max-width: 280px">
          {{ row.courses.map((course: any) => course.name).join(", ") }}
        </div>
      </template>

      <template #nQuestionsPerAttempt="{ row }">
        {{ row.nQuestionsPerAttempt }}
      </template>

      <template #actions="{ row }">
        <div class="d-flex gap-3">
          <button
            class="btn btn-success btn-sm"
            @click="() => {
              quizInitialValues = {
                id: row.id,
                name: row.name,
                nQuestionsPerAttempt: row.nQuestionsPerAttempt,
                courseIds: row.courses.map((course: any) => course.id)
              };
              showUpdateQuizModal = true;
            }"
          >
            <i class="ki-solid ki-notepad-edit fs-2 me-1"></i>
            {{ t("edit") }}
          </button>
          <router-link
            class="btn btn-primary btn-sm"
            :to="`/management/quizzes/${row.id}`"
            ><i class="ki-solid ki-notepad-edit fs-2 me-1"></i>
            {{ t("editQuestions") }}
          </router-link>

          <button class="btn btn-danger btn-sm" @click="onDeleteQuiz(row.id)">
            <i class="ki-solid ki-trash-square fs-2 me-1"></i>
            {{ t("delete") }}
          </button>
        </div>
      </template>
    </KTDatatable>
  </div>

  <BaseModal :title="t('editQuiz')" v-model="showUpdateQuizModal">
    <Form
      :initial-values="quizInitialValues"
      class="form"
      @submit="handleUpdateQuiz"
      :validation-schema="updateQuizMetadataSchema"
    >
      <input hidden name="id" />
      <InputGroup :label="t('name')" name="name" type="text" />
      <InputGroup
        :label="t('nQuestionsPerAttempt')"
        name="nQuestionsPerAttempt"
        type="number"
      />
      <MultiSelectGroup
        :label="t('courses')"
        name="courseIds"
        :options="coursesOptions"
      />
      <LoadableButton
        :default-text="t('update')"
        :loading="updateQuizMetadata.isLoading.value"
        color="primary"
        submit
      />
    </Form>
  </BaseModal>
  <BaseModal :title="t('create')" v-model="showNewQuizModal">
    <Form
      class="form"
      @submit="handleCreateQuiz"
      :validation-schema="createQuizSchema"
    >
      <FileInputGroup :label="t('excelFile')" name="excelFile" />
      <InputGroup :label="t('name')" name="name" type="text" />
      <MultiSelectGroup
        :label="t('courses')"
        name="courseIds"
        :options="coursesOptions"
      />
      <LoadableButton
        :default-text="t('create')"
        :loading="false"
        color="primary"
        submit
      />
    </Form>
  </BaseModal>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import { Form } from "vee-validate";
import {
  FileInputGroup,
  LoadableButton,
  InputGroup,
  MultiSelectGroup,
} from "@/components/form";
import KTDatatable from "@/components/kt-datatable/KTDataTable.vue";
import { getSubmitFn } from "@/util/form";
import {
  useCourses,
  useCreateQuiz,
  useDeleteQuiz,
  useQuizzes,
  useUpdateQuizMetadata,
} from "@/server-state";
import { toastError, toastSuccess } from "@/util/toast";
import { RouterLink } from "vue-router";
import { BaseModal } from "@/components/common";
import {
  createQuizSchema,
  updateQuizMetadataSchema,
} from "@/validation-schemas/quizzes";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const showNewQuizModal = ref(false);

const selectedCourse = ref<string | null>(null);
const courses = useCourses();
const deleteQuiz = useDeleteQuiz();
const createQuiz = useCreateQuiz();
const updateQuizMetadata = useUpdateQuizMetadata();

const showUpdateQuizModal = ref(false);

const quizInitialValues = ref<any>(null);
const tableHeader = [
  {
    columnName: t("name"),
    columnLabel: "name",
  },
  {
    columnName: t("course"),
    columnLabel: "course",
  },
  {
    columnName: t("nQuestionsPerAttempt"),
    columnLabel: "nQuestionsPerAttempt",
  },
  {
    columnName: t("actions"),
    columnLabel: "actions",
  },
];

const quizzes = useQuizzes(selectedCourse, {
  enabled: computed(() => !!selectedCourse.value),
});

watch(
  courses.data,
  () => {
    if (courses.data.value?.length && !selectedCourse.value) {
      selectedCourse.value = courses.data.value[0].id;
    }
  },
  {
    immediate: true,
  }
);

const coursesOptions = computed(
  () =>
    courses.data.value?.map((course) => ({
      label: course.name,
      value: course.id,
    })) || []
);

const handleCreateQuiz = getSubmitFn(createQuizSchema, async (values) => {
  createQuiz.mutate(
    {
      name: values.name,
      excelFile: values.excelFile as File,
      courseIds: values.courseIds,
    },
    {
      onSuccess: () => {
        showNewQuizModal.value = false;
        toastSuccess(t("createdQuiz"));
      },
      onError: (err: any) => {
        toastError(err.message || "Unknown error");
      },
    }
  );
});
const onDeleteQuiz = (quizId: string) => {
  deleteQuiz.mutate(quizId, {
    onSuccess: () => {
      toastSuccess(t("deletedQuiz"));
    },
    onError: (err: any) => {
      toastError(err.message || "Unknown error");
    },
  });
};

const handleUpdateQuiz = getSubmitFn(
  updateQuizMetadataSchema,
  async (values) => {
    updateQuizMetadata.mutate(
      {
        id: values.id,
        name: values.name,
        nQuestionsPerAttempt: values.nQuestionsPerAttempt,
        courseIds: values.courseIds,
      },
      {
        onSuccess: () => {
          showUpdateQuizModal.value = false;
          toastSuccess(t("updatedQuiz"));
        },
        onError: (err: any) => {
          toastError(err.message || "Unknown error");
        },
      }
    );
  }
);
</script>
