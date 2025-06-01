<template>
  <BaseModal :title="t('editVideo')" v-model="show">
    <Form
      :initial-values="initialValues"
      :validation-schema="createVideoSchema"
      @submit="handleSubmit"
      class="form w-100"
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
        :default-text="t('saveChanges')"
        color="primary"
        :loading="false"
      />
    </Form>
  </BaseModal>
</template>

<script setup lang="ts">
import {
  useCourses,
  useUpdateVideo,
  useVideosManagement,
} from "@/server-state";
import { getSubmitFn } from "@/util/form";
import { createVideoSchema } from "@/validation-schemas/videos";
import { BaseModal } from "@/components/common";
import { computed } from "vue";
import { Form } from "vee-validate";
import {
  MultiSelectGroup,
  InputGroup,
  LoadableButton,
} from "@/components/form";
import { toastError, toastSuccess } from "@/util/toast";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const updateVideo = useUpdateVideo();
const videos = useVideosManagement(null);
const courses = useCourses();
const props = defineProps<{
  videoId: string | null;
}>();
const emit = defineEmits(["update:videoId"]);

const show = computed({
  get: () => props.videoId !== null,
  set: (value) => {
    if (!value) {
      emit("update:videoId", null);
    }
  },
});

const initialValues = computed(() => {
  if (!props.videoId) {
    return undefined;
  }
  const video = videos.data.value?.find((v) => v.id === props.videoId);
  if (!video) {
    return undefined;
  }
  return {
    title: video.title,
    url: video.url,
    courseIds: video.courses.map((c) => c.id),
    date: video.date,
  };
});

const handleSubmit = getSubmitFn(createVideoSchema, (values) => {
  if (!props.videoId) {
    return;
  }
  updateVideo.mutate(
    {
      ...values,
      id: props.videoId,
    },
    {
      onSuccess: () => {
        show.value = false;
        toastSuccess(t("videoUpdated"));
      },

      onError: (error: any) => {
        return toastError(error.message || "Unknown error");
      },
    }
  );
});
</script>
<i18n>
  {
    "en": {
      "editVideo": "Edit video",
      "title": "Title",
      "url": "URL",
      "courses": "Courses",
      "saveChanges": "Save changes",
      "videoUpdated": "Video updated successfully",
      "date": "Date",
      
    },
    "es": {
      "editVideo": "Editar video",
      "title": "Título",
      "url": "URL",
      "courses": "Cursos",
      "saveChanges": "Guardar cambios",
      "videoUpdated": "Video actualizado correctamente",
      "date": "Fecha",
      
    }
    
  }
</i18n>
