<i18n>
  {
    "es": {
      "newVideo": "Nuevo video",
      "title": "Título",
      "url": "URL",
      "courses": "Cursos",
      "date": "Fecha",
      "createVideo": "Crear video",
      "videoCreated": "Video creado",

    },
    "en": {
      "newVideo": "New video",
      "title": "Title",
      "url": "URL",
      "courses": "Courses",
      "date": "Date",
      "createVideo": "Create video",
      "videoCreated": "Video created",
    }
  }
</i18n>
<template>
  <BaseModal
    :title="t('newVideo')"
    @update:model-value="emit('update:show', $event)"
    :model-value="show"
  >
    <Form
      id="new-video-form"
      :validation-schema="createVideoSchema"
      @submit="handleSubmit"
      class="form w-100"
      :initial-values="{
        date: new Date(),
      }"
    >
      <InputGroup name="title" :label="t('title')" type="text" />

      <InputGroup name="url" :label="t('url')" type="text" />

      <MultiSelectGroup
        name="courseIds"
        :label="t('courses')"
        :options="
          courses.data.value?.map((course) => ({
            label: course.name,
            value: course.id,
          })) || []
        "
      />
      <InputGroup name="date" :label="t('date')" type="date" />
      <LoadableButton
        submit
        :default-text="t('createVideo')"
        color="primary"
        :loading="false"
      />
    </Form>
  </BaseModal>
</template>
<script setup lang="ts">
import { useCourses, useCreateVideo } from "@/server-state";
import { getSubmitFn } from "@/util/form";
import { createVideoSchema } from "@/validation-schemas/videos";
import { BaseModal } from "@/components/common";
import { Form } from "vee-validate";
import {
  InputGroup,
  LoadableButton,
  MultiSelectGroup,
} from "@/components/form";
import { toastError, toastSuccess } from "@/util/toast";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const createVideo = useCreateVideo();
const courses = useCourses();

defineProps<{
  show: boolean;
  currentCourseId: string | null;
  currentFolder: string | null;
}>();
const emit = defineEmits(["update:show"]);

const handleSubmit = getSubmitFn(createVideoSchema, (values) => {
  createVideo.mutate(
    {
      ...values,
    },
    {
      onSuccess: () => {
        emit("update:show", false);
        toastSuccess(t("videoCreated"));
      },

      onError: (error: any) => {
        toastError(error.message || "Unknown error");
      },
    }
  );
});
</script>
