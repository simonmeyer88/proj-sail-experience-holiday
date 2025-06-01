<template>
  <div class="card mb-4" data-testid="yt-video-card">
    <div
      class="d-flex px-1 align-items-center justify-content-start"
      style="height: 33px"
    >
      <ElDropdown
        size="large"
        v-if="props.showActions"
        :hide-on-click="false"
        trigger="click"
      >
        <ElButton class="btn btn-sm d-flex btn-icon">
          <i
            class="ki-outline ki-dots-vertical fs-2tx fs-sm-2hx fs-md-2x text-primary"
          ></i>
        </ElButton>

        <template #dropdown>
          <ElDropdownMenu>
            <ElDropdownItem @click="emit('delete')">
              <i class="ki-solid ki-cross fs-2x me-0 text-danger"></i>
              {{ t("delete") }}
            </ElDropdownItem>
            <ElDropdownItem @click="emit('edit')">
              <i class="ki-solid ki-pencil fs-2 me-2 text-primary"></i>
              {{ t("edit") }}
            </ElDropdownItem>
          </ElDropdownMenu>
        </template>
      </ElDropdown>
      <h5 class="card-title text-truncate mb-0 ms-2">
        {{ props.title }}
      </h5>
    </div>
    <LiteYouTubeEmbed :id="id" :title="props.title" />
  </div>
</template>

<script lang="ts" setup>
import {
  ElDropdown,
  ElButton,
  ElDropdownItem,
  ElDropdownMenu,
} from "element-plus";
import { computed } from "vue";
import LiteYouTubeEmbed from "vue-lite-youtube-embed";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const emit = defineEmits(["delete", "edit"]);

const props = defineProps({
  showActions: {
    type: Boolean,
    default: false,
  },
  idOrUrl: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
});

const isYouTubeVideoId = (value: string) => {
  const regex = /^[A-Za-z0-9_-]{11}$/;
  return regex.test(value);
};

const getVideoIdFromUrl = (url: string) => {
  const urlParts = url.split("v=");
  if (urlParts.length === 2) {
    return urlParts[1];
  }
  return url;
};

const id = computed(() => {
  if (isYouTubeVideoId(props.idOrUrl)) {
    return props.idOrUrl;
  }
  return getVideoIdFromUrl(props.idOrUrl);
});
</script>
<i18n>
{
  "en": {
    "delete": "Delete",
    "edit": "Edit"
  },
  "es": {
    "delete": "Eliminar",
    "edit": "Editar"
  }
}
</i18n>
