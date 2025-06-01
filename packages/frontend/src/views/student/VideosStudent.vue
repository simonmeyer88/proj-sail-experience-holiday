<template>
  <FoldersNavbar v-model:currentFolder="currentFolder" :folders="folders" />
  <LoadingComponent v-if="videos.isLoading.value" />
  <ContentErrorAlert v-else-if="videos.isError.value" />
  <VideosGrid
    v-else-if="videos.data.value"
    :videos="
      videos.data.value.filter(
        (video) => moment(video.date).format('MMMM YYYY') === currentFolder
      )
    "
  />
</template>

<script setup lang="ts">
import { useVideosStudent } from "@/server-state";
import { computed, ref, watch } from "vue";
import LoadingComponent from "@/components/ui/LoadingComponent.vue";
import ContentErrorAlert from "@/components/common/ContentErrorAlert.vue";
import FoldersNavbar from "@/components/videos/FoldersNavbar.vue";
import VideosGrid from "@/components/videos/VideosGrid.vue";
import moment from "moment-timezone";
const videos = useVideosStudent();

const folders = computed(() => {
  // use date propery
  return [
    ...new Set(
      videos.data.value?.map((video) => moment(video.date).format("MMMM YYYY"))
    ),
  ];
});

const currentFolder = ref<null | string>(null);

watch(
  [folders],
  () => {
    currentFolder.value = folders.value?.[0] ?? null;
  },
  {
    immediate: true,
  }
);
</script>
