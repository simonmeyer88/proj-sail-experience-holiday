<template>
  <div class="d-flex gap-3 mb-5">
    <select
      v-model="selectedCourseId"
      class="form-select w-150px"
      data-cy="course-select"
    >
      <option
        v-for="course in courses.data.value"
        :key="course.id"
        :value="course.id"
      >
        {{ course.name }}
      </option>
    </select>
    <button
      class="btn btn-light-primary border border-primary"
      @click="showNewVideoModal = true"
    >
      <i class="ki-solid ki-youtube fs-2"></i>
      {{ t("addVideo") }}
    </button>
  </div>
  <FoldersNavbar v-model:currentFolder="currentFolder" :folders="folders" />

  <LoadingComponent v-if="videos.isLoading.value" />
  <ContentErrorAlert v-else-if="videos.isError.value" />
  <VideosGrid
    v-else-if="videos.data.value"
    :videos="
      videos.data.value.filter((video) => {
        if (!currentFolder) {
          return true;
        }
        return moment(video.date).format('MMMM YYYY') === currentFolder;
      })
    "
    @delete-video="onDeleteVideo"
    @edit-video="currentEditVideoId = $event"
    show-actions
  />

  <UpdateVideoModal v-model:videoId="currentEditVideoId" />
  <CreateVideoModal
    v-model:show="showNewVideoModal"
    :current-course-id="selectedCourseId"
    :current-folder="currentFolder"
  />
</template>

<script setup lang="ts">
import {
  useCourses,
  useDeleteVideo,
  useVideosManagement,
} from "@/server-state";
import { computed, ref } from "vue";
import ContentErrorAlert from "@/components/common/ContentErrorAlert.vue";
import { watch } from "vue";
import LoadingComponent from "@/components/ui/LoadingComponent.vue";
import FoldersNavbar from "@/components/videos/FoldersNavbar.vue";
import UpdateVideoModal from "@/components/videos/modals/UpdateVideoModal.vue";
import CreateVideoModal from "@/components/videos/modals/CreateVideoModal.vue";
import { alertConfirm } from "@/util/alert";
import { toastError, toastSuccess } from "@/util/toast";
import VideosGrid from "@/components/videos/VideosGrid.vue";
import { useI18n } from "vue-i18n";
import moment from "moment-timezone";

const currentFolder = ref<string | null>(null);

const currentEditVideoId = ref<string | null>(null);

const selectedCourseId = ref<string | null>(null);
const courses = useCourses();

const videos = useVideosManagement(selectedCourseId, {
  enabled: true,
});

const deleteVideo = useDeleteVideo();

const folders = computed(() =>
  // videos have a date property. Group by month
  Array.from(
    new Set(
      videos.data.value?.map((video) => moment(video.date).format("MMMM YYYY"))
    )
  )
);

watch(
  () => folders.value,
  () => {
    currentFolder.value = folders.value[0] ?? null;
  },
  { immediate: true }
);

watch(
  () => courses.data.value,
  () => {
    if (courses.data.value?.length && !selectedCourseId.value) {
      selectedCourseId.value = courses.data.value[0].id;
    }
  },
  { immediate: true }
);

const showNewVideoModal = ref<boolean>(false);
const { t } = useI18n();

const onDeleteVideo = (videoId: string) => {
  alertConfirm({
    title: t("areYouSure"),
    text: t("youWontBeAbleToRevert"),
    confirmButtonText: t("yesDeleteIt"),
    cancelButtonText: t("noKeepIt"),
    onConfirm: () => {
      deleteVideo.mutate(videoId, {
        onSuccess: () => {
          toastSuccess(t("videoDeleted"));
        },
        onError: () => {
          toastError(t("errorDeletingVideo"));
        },
      });
    },
  });
};
</script>

<i18n>
  {
    "en": {
      "addVideo": "Add video",
      "areYouSure": "Are you sure?",
      "youWontBeAbleToRevert": "You won't be able to revert this!",
      "yesDeleteIt": "Yes, delete it!",
      "noKeepIt": "No, keep it",
      "videoDeleted": "Video deleted",
      "errorDeletingVideo": "Error deleting video",
    },
    "es": {
      "addVideo": "Añadir video",
      "areYouSure": "¿Estás seguro?",
      "youWontBeAbleToRevert": "No podrás revertir esto!",
      "yesDeleteIt": "Sí, borrarlo!",
      "noKeepIt": "No, mantenerlo",
      "videoDeleted": "Video eliminado",
      "errorDeletingVideo": "Error al eliminar el video",
    }
  }
</i18n>
