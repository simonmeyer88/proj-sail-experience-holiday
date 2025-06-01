<template>
  <div class="row g-5 g-xl-8">
    <div
      v-for="file in data?.files"
      :key="file.id"
      class="col-6 col-md-4 col-lg-3 col-xxl-2.5 d-flex align-items-stretch"
    >
      <FileItem
        :show-actions="mode === 'MANAGER'"
        @delete="emit('fileDelete', file.id)"
        @rename="emit('fileRename', file.id)"
        :file-id="file.id"
        :file-title="file.name"
        :content-type="file.contentType"
        :modified-at="file.updatedAt"
      />
    </div>
    <div
      v-for="folder in data?.folders"
      :key="folder.id"
      class="col-6 col-md-4 col-lg-3 col-xxl-2.5 d-flex align-items-stretch"
    >
      <FolderItem
        :show-actions="mode === 'MANAGER'"
        :name="folder.name"
        @delete="emit('folderDelete', folder.id)"
        @open="emit('folderOpen', folder.id)"
        @rename="emit('folderRename', folder.id)"
        :number-of-children="folder.numberOfChildren"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useFileSystem } from "@/server-state";
import { FileItem, FolderItem } from "./";
import { PropType } from "vue";

defineProps({
  data: {
    type: Object as PropType<ReturnType<typeof useFileSystem>["data"]["value"]>,
    required: true,
  },
  mode: {
    type: String as PropType<"MANAGER" | "STUDENT">,
    required: true,
  },
});

const emit = defineEmits<{
  (e: "fileDelete", id: string): void;
  (e: "fileRename", id: string): void;
  (e: "folderDelete", id: string): void;
  (e: "folderRename", id: string): void;
  (e: "folderOpen", id: string): void;
}>();
</script>
