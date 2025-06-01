<template>
  <div class="row">
    <TransitionGroup name="fade">
      <div
        class="col-12 col-sm-6 col-md-4 col-lg-6 col-xl-3"
        v-for="video in videos"
        :key="video.id"
      >
        <YTVideoCard
          :idOrUrl="video.url"
          :title="video.title"
          :show-actions="showActions"
          @delete="() => emit('delete-video', video.id)"
          @edit="() => emit('edit-video', video.id)"
        />
      </div>
      <div
        v-if="videos?.length === 0"
        class="text-center fs-2 bg-light-warning py-6 rounded-3 border border-warning fw-bold text-warning"
      >
        {{ t("noVideosFound") }}
      </div>
    </TransitionGroup>
  </div>
</template>
<style>
.fade-enter-active {
  transition: opacity 0.1s ease 0.1s;
}

.fade-leave-active {
  transition: opacity 0.1s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
<script setup lang="ts">
import { PropType } from "vue";
import type { VideosFindAllResponse } from "@/server-state";
import YTVideoCard from "@/components/videos/YTVideoCard.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

defineProps({
  videos: Array as PropType<VideosFindAllResponse>,
  showActions: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["delete-video", "edit-video"]);
</script>
<i18n>
{
  "en": {
      "noVideosFound": "No videos found"
  },
  "es": {
    "noVideosFound": "No se encontraron videos"
  }
}
</i18n>
