<template>
  <div class="w-100">
    <div class="card h-100 position-relative">
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
          <el-dropdown-menu>
            <el-dropdown-item @click="emit('delete')">
              <i class="ki-solid ki-delete-folder fs-1 text-danger"></i>
              {{ t("delete") }}
            </el-dropdown-item>
            <el-dropdown-item @click="emit('rename')">
              <i class="ki-solid ki-notepad-edit text-primary fs-1"></i>
              {{ t("rename") }}
            </el-dropdown-item>
            <el-dropdown-item @click="emit('open')">
              <i class="ki-solid ki-folder fs-1 text-success"></i>
              {{ t("open") }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </ElDropdown>

      <div
        class="card-body d-flex justify-content-center text-center flex-column p-6 pt-8"
      >
        <span
          class="text-gray-800 text-hover-primary d-flex flex-column align-items-center"
        >
          <div class="symbol symbol-75px mb-4 w-75px">
            <span class="position-absolute top-0 start-0 badge badge-primary">{{
              props.numberOfChildren ? props.numberOfChildren : "0"
            }}</span>
            <img
              @click.prevent="emit('open')"
              class="cursor-pointer"
              :src="getAssetPath('media/files/folder-document.svg')"
              alt=""
            />
          </div>
          <div class="fs-5 fw-bold mb-2">{{ props.name }}</div>
        </span>
        <div class="fs-7 fw-semibold text-gray-400 mt-auto">
          {{ props.numberOfChildren }}
          {{ (props.numberOfChildren || 0) != 1 ? t("files") : t("file") }}
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
      "files": "files",
      "file": "file"
    
  },
  "es": {
      "delete": "Eliminar",
      "rename": "Renombrar",
      "open": "Abrir",
      "files": "archivos",
      "file": "archivo"
  }
}
</i18n>

<script lang="ts" setup>
import { getAssetPath } from "@/core/helpers/assets";
import { ElDropdown } from "element-plus";
import { useI18n } from "vue-i18n";
const props = defineProps<{
  name: string;
  numberOfChildren?: number;
  showActions?: boolean;
}>();

const { t } = useI18n();
const emit = defineEmits(["delete", "rename", "open"]);
</script>
