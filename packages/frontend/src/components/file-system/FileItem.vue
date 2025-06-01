<template>
  <div class="w-100">
    <div class="card h-100 position-relative">
      <div
        v-if="isLoading"
        class="position-absolute w-100 h-100 d-flex flex-column align-items-center justify-content-center"
        style="
          z-index: 1;
          top: 0;
          left: 0;
          background-color: rgba(255, 255, 255, 0.6);
        "
      >
        <div class="spinner-border" role="status">
          <span class="sr-only">Loading...</span>
        </div>
      </div>
      <ElDropdown
        size="large"
        v-if="props.showActions"
        :hide-on-click="false"
        trigger="click"
      >
        <span
          class="el-dropdown-link position-absolute"
          style="z-index: 2; top: 15px; left: 15px"
        >
          <i class="bi bi-three-dots-vertical fs-2 text-primary"></i>
        </span>

        <template #dropdown>
          <ElDropdownMenu>
            <ElDropdownItem @click="emit('delete')">
              <i class="ki-solid ki-file-deleted fs-1 text-danger"></i>
              {{ t("delete") }}
            </ElDropdownItem>
            <ElDropdownItem @click="emit('rename')">
              <i class="ki-solid ki-notepad-edit fs-1 text-primary"></i>
              {{ t("rename") }}
            </ElDropdownItem>
            <ElDropdownItem @click="handleFileOpen(fileId)">
              <i class="ki-solid ki-file-down fs-1 text-success"></i>
              {{ t("open") }}
            </ElDropdownItem>
          </ElDropdownMenu>
        </template>
      </ElDropdown>
      <div
        class="card-body d-flex justify-content-center text-center flex-column p-6 pt-7"
        @click.prevent="handleFileOpen(fileId)"
      >
        <div class="text-gray-800 text-hover-primary d-flex flex-column w-fit">
          <div class="symbol symbol-60px mb-6">
            <img :src="imageUrl" alt="" class="cursor-pointer" />
          </div>
          <div class="fs-5 fw-bold mb-2">
            {{ props.fileTitle }}
          </div>
          <div class="fs-7 fw-semibold text-gray-400 mt-auto">
            {{ modifiedAtString }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<i18n>
{
  "en": {
      "delete": "Delete",
      "rename": "Rename",
      "open": "Open",
      "file": "file",
      "files": "files"
    
  },
  "es": {
      "delete": "Eliminar",
      "rename": "Renombrar",
      "open": "Abrir",
      "file": "archivo",
      "files": "archivos"
    
  }
}
</i18n>

<script lang="ts" setup>
import { computed } from "vue";
import { ElDropdown } from "element-plus";
import moment from "moment-timezone";
import { useGenerateFileDownloadUrl } from "@/server-state";
import mime from "mime-types";
import { useI18n } from "vue-i18n";
import { ref } from "vue";

const isLoading = ref(false);

const props = defineProps<{
  fileTitle: string;
  contentType: string;
  modifiedAt: Date | string;
  fileId: string;
  showActions?: boolean;
}>();

const imageUrl = computed(() => {
  const extension = mime.extension(props.contentType);
  const mapExt: Record<string, string> = {
    pdf: "pdf",
    xml: "xml",
    css: "css",
    docx: "doc",
    doc: "doc",
    sql: "sql",
  };
  return `media/files/${mapExt[extension as string] || "upload"}.svg`;
});

const { t } = useI18n();

const emit = defineEmits(["delete", "rename"]);

const modifiedAtString = computed(() => {
  return moment(props.modifiedAt).fromNow();
});

const generateFileDownloadUrl = useGenerateFileDownloadUrl();
const handleFileOpen = async (fileId: string) => {
  try {
    isLoading.value = true;
    const downloadUrl = await generateFileDownloadUrl.mutateAsync(fileId);
    if (typeof downloadUrl !== "string") {
      throw new Error("Invalid url");
    }
    const link = document.createElement("a");

    const blob = await fetch(downloadUrl).then((r) => r.blob());
    link.href = window.URL.createObjectURL(blob);
    link.download = props.fileTitle;
    link.click();
  } catch (e) {
    console.error("❌ Error downloading file", e);
  } finally {
    isLoading.value = false;
  }
};
</script>
