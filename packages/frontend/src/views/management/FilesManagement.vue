<i18n>
{
  "en": {
    "uploadFile": "Upload file",
    "newFolder": "New folder",
    "uploadMultipleFiles": "Upload multiple files",
    "renameFolder": "Rename folder",
    "renameFile": "Rename file",
    "create": "Create",
    "rename": "Rename",
    "fileName": "File name",
    "file": "File",
    "files": "Files",
    "folderName": "Folder name"
  },
  "es": {
    "uploadFile": "Subir archivo",
    "newFolder": "Nueva carpeta",
    "uploadMultipleFiles": "Subir varios archivos",
    "renameFolder": "Renombrar carpeta",
    "renameFile": "Renombrar archivo",
    "create": "Crear",
    "rename": "Renombrar",
    "fileName": "Nombre del archivo",
    "file": "Archivo",
    "files": "Archivos",
    "folderName": "Nombre de la carpeta"

  }
}
</i18n>
<template>
  <div class="d-flex mb-5 gap-5">
    <div class="d-flex align-items-center gap-4">
      <select
        v-model="selectedCourseId"
        class="form-select w-150px form-select-md"
        @change="onSelectedCourseChange"
      >
        <option
          :value="course.id"
          v-for="course in courses.data.value"
          :key="course.id"
        >
          {{ course.name }}
        </option>
      </select>
    </div>
    <ElDropdown size="large" :hide-on-click="false" trigger="click">
      <button
        class="btn btn-icon btn-md btn-primary"
        style="z-index: 2; top: 10px; right: 10px"
      >
        <i class="ki-duotone ki-element-plus fs-2">
          <i class="path1"></i>
          <i class="path2"></i>
          <i class="path3"></i>
          <i class="path4"></i>
          <i class="path5"></i>
        </i>
      </button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item @click="dialogOpen = true">
            <i class="ki-solid ki-add-files fs-1 text-primary"></i>
            {{ t("uploadFile") }}
          </el-dropdown-item>
          <el-dropdown-item @click="dialogOpenFolder = true">
            <i
              class="ki-duotone ki-folder-up text-primary fs-1"
              style="margin-inline-start: -5px; margin-inline-end: 0px"
            >
              <i class="path1"></i>
              <i class="path2"></i>
            </i>
            {{ t("newFolder") }}
          </el-dropdown-item>
          <el-dropdown-item @click="dialogOpenMultipleFiles = true">
            <i
              class="ki-duotone ki-folder-up text-primary fs-1"
              style="margin-inline-start: -5px; margin-inline-end: 0px"
            >
              <i class="path1"></i>
              <i class="path2"></i>
            </i>
            {{ t("uploadMultipleFiles") }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </ElDropdown>
  </div>

  <FileSystemNavbar
    :canGoBack="pathStack.length > 0 || fileSystem.isFetching.value"
    :path-stack="pathStack"
    @goBack="goBack"
  />
  <BaseModal v-model="dialogOpen" :title="t('uploadFile')" :max-width="500">
    <Form
      @submit="onFileUpload"
      class="card-body align-items-center"
      :validation-schema="createFileSchema"
    >
      <InputGroup name="name" :label="t('fileName')" type="text" />
      <FileInputGroup name="file" :label="t('file')" />
      <div class="d-flex justify-content-end">
        <LoadableButton
          submit
          :default-text="t('uploadFile')"
          :loading="createFile.isLoading.value"
          color="primary"
        />
      </div>
    </Form>
  </BaseModal>
  <BaseModal
    v-model="dialogOpenFolder"
    :title="t('newFolder')"
    :max-width="500"
  >
    <Form @submit="onNewFolder" :validation-schema="createFolderSchema">
      <div className="form">
        <InputGroup name="name" label="Nombre de la carpeta" type="text" />
        <div class="d-flex justify-content-end">
          <LoadableButton
            submit
            :default-text="t('create')"
            :loading="createFolder.isLoading.value"
            color="primary"
          />
        </div>
      </div>
    </Form>
  </BaseModal>

  <BaseModal
    v-model="dialogOpenMultipleFiles"
    :title="t('uploadMultipleFiles')"
    :max-width="500"
  >
    <Form
      @submit="onMultipleFilesUpload"
      :validation-schema="createMultipleFilesSchema"
    >
      <div className="form">
        <FileInputGroup name="files" :label="t('files')" multiple />
        <div class="d-flex justify-content-end">
          <LoadableButton
            submit
            :default-text="t('uploadMultipleFiles')"
            :loading="createMultipleFiles.isLoading.value"
            color="primary"
          />
        </div>
      </div>
    </Form>
  </BaseModal>

  <BaseModal v-model="showRenameFileDialog" :title="t('renameFile')">
    <Form
      @submit="onFileRenameSubmit"
      class="card-body form"
      :validation-schema="renameFileSchema"
      :initial-values="
        fileSystem.data.value?.files?.find((f) => f.id === currentRenameFileId)
      "
    >
      <InputGroup name="name" label="Nombre del archivo" type="text" />
      <div class="d-flex justify-content-end">
        <LoadableButton
          submit
          :default-text="t('rename')"
          :loading="updateFile.isLoading.value"
          color="primary"
        />
      </div>
    </Form>
  </BaseModal>
  <BaseModal v-model="showRenameFolderDialog" :title="t('renameFolder')">
    <Form
      @submit="onFolderRenameSubmit"
      class="card-body form"
      :validation-schema="renameFolderSchema"
      :initial-values="
        fileSystem.data.value?.folders.find(
          (f) => f.id === currentRenameFolderId
        )
      "
    >
      <InputGroup name="name" :label="t('folderName')" type="text" />
      <div class="d-flex justify-content-end">
        <LoadableButton
          submit
          :default-text="t('rename')"
          :loading="updateFolder.isLoading.value"
          color="primary"
        />
      </div>
    </Form>
  </BaseModal>

  <LoadingComponent v-if="fileSystem.isLoading.value" />
  <NoFiles
    v-else-if="
      fileSystem.data.value &&
      fileSystem.data.value.files?.length === 0 &&
      fileSystem.data.value.folders.length === 0
    "
  />
  <FileSystemGrid
    v-else-if="fileSystem.data.value"
    mode="MANAGER"
    :data="fileSystem.data.value"
    @fileOpen="onFileOpen"
    @fileRename="onFileRename"
    @fileDelete="onFileDelete"
    @folderRename="currentRenameFolderId = $event"
    @folderDelete="onFolderDelete"
    @folderOpen="onFolderOpen"
  />
</template>

<script lang="ts" setup>
import { ElDropdown } from "element-plus";
import { LoadableButton, InputGroup, FileInputGroup } from "@/components/form";
import { LoadingComponent } from "@/components/ui";
import {
  FileSystemGrid,
  FileSystemNavbar,
  NoFiles,
} from "@/components/file-system";

import { computed, ref, watch } from "vue";
import { Form } from "vee-validate";
import {
  useCreateFile,
  useCreateFolder,
  useDeleteFile,
  useDeleteFolder,
  useFileSystem,
  useGenerateFileDownloadUrl,
  useUpdateFile,
  useUpdateFolder,
  useCourses,
  useCreateMultipleFiles,
} from "@/server-state";
import { toastSuccess } from "@/util/toast";
import {
  createFileSchema,
  createFolderSchema,
  renameFileSchema,
  renameFolderSchema,
  createMultipleFilesSchema,
} from "@/validation-schemas/file-system";
import { getSubmitFn } from "@/util/form";
import { BaseModal } from "@/components/common";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const createMultipleFiles = useCreateMultipleFiles();

const onMultipleFilesUpload = getSubmitFn(
  createMultipleFilesSchema,
  (values) => {
    createMultipleFiles.mutate(
      {
        files: values.files as File[],
        folderId: fileSystem.data.value?.id as string,
      },
      {
        onSuccess: () => {
          dialogOpenMultipleFiles.value = false;
          toastSuccess("Archivos subidos");
        },
      }
    );
  }
);
const dialogOpen = ref<boolean>(false);
const dialogOpenFolder = ref<boolean>(false);
const currFolderId = ref<string | null>(null);
const prevId = ref<string | null>(null);
const pathStack = ref<string[]>([]);
const selectedCourseId = ref<string | null>(null);
const courses = useCourses();

const currentRenameFolderId = ref<string | undefined>(undefined);
const showRenameFolderDialog = computed({
  get: () => !!currentRenameFolderId.value,
  set: (val) => {
    if (!val) {
      currentRenameFolderId.value = undefined;
    }
  },
});

const dialogOpenMultipleFiles = ref<boolean>(false);
const onFolderRenameSubmit = getSubmitFn(renameFolderSchema, (values) => {
  updateFolder.mutate(
    { folderId: currentRenameFolderId.value!, name: values.name },
    {
      onSuccess: () => {
        toastSuccess("Carpeta renombrada");
        currentRenameFolderId.value = undefined;
      },
    }
  );
});

watch(
  courses.data,
  (newVal) => {
    if (!selectedCourseId.value && newVal) {
      selectedCourseId.value = newVal[0]?.id;
    }
    if (newVal) {
      currFolderId.value =
        courses.data.value?.find((c) => c.id === newVal[0].id)?.rootFolder
          ?.id || null;
    }
  },
  { immediate: true }
);

watch(
  () => selectedCourseId.value,
  () => {
    pathStack.value = [];
  },
  { immediate: true }
);

const onSelectedCourseChange = function () {
  currFolderId.value =
    courses.data.value?.find((c) => c.id === selectedCourseId.value)?.rootFolder
      ?.id || null;
};

const onFileUpload = getSubmitFn(createFileSchema, (values) => {
  createFile.mutate(
    {
      file: values.file as File,
      folderId: fileSystem.data.value?.id as string,
      name: values.name as string,
    },
    {
      onSuccess: () => {
        dialogOpen.value = false;
        toastSuccess("Archivo subido");
      },
    }
  );
});

const onNewFolder = getSubmitFn(createFolderSchema, (values) => {
  createFolder.mutate(
    {
      name: values.name as string,
      parentId: fileSystem.data.value?.id as string,
    },
    {
      onSuccess: () => {
        dialogOpenFolder.value = false;
        toastSuccess("Carpeta creada");
      },
    }
  );
});

const generateFileDownloadUrl = useGenerateFileDownloadUrl();
const onFileOpen = async (fileId: string) => {
  generateFileDownloadUrl.mutate(fileId, {
    onSuccess: (url) => {
      if (typeof url === "string") window.open(url, "_blank");
    },
  });
};

const onFileRename = (fileId: string) => {
  currentRenameFileId.value = fileId;
};

const onFileDelete = (fileId: string) => {
  deleteFile.mutate(fileId, {
    onSuccess: () => {
      toastSuccess("Archivo eliminado");
    },
  });
};

const onFileRenameSubmit = getSubmitFn(renameFileSchema, (values) => {
  updateFile.mutate(
    {
      fileId: currentRenameFileId.value as string,
      name: values.name as string,
    },
    {
      onSuccess: () => {
        toastSuccess("Archivo renombrado");
        currentRenameFileId.value = undefined;
      },
    }
  );
});

const fileSystem = useFileSystem(currFolderId);
const updateFile = useUpdateFile();
const deleteFile = useDeleteFile();
const createFile = useCreateFile();
const createFolder = useCreateFolder();
const updateFolder = useUpdateFolder();
const deleteFolder = useDeleteFolder();

// update prevId
watch(
  fileSystem.data,
  (newVal) => {
    if (newVal) {
      prevId.value = newVal.parentId || null;
    }
  },
  { immediate: true }
);

const currentRenameFileId = ref<string | undefined>(undefined);

const showRenameFileDialog = computed({
  get() {
    return !!currentRenameFileId.value;
  },
  set(val) {
    if (!val) {
      currentRenameFileId.value = undefined;
    }
  },
});
const onFolderOpen = (folderId: string) => {
  prevId.value = fileSystem.data.value?.id as string;
  currFolderId.value = folderId;
  const folderName = fileSystem.data.value?.folders.find(
    (f) => f.id === folderId
  )?.name;
  pathStack.value.push(folderName as string);
};

const onFolderDelete = (folderId: string) => {
  deleteFolder.mutate(folderId, {
    onSuccess: () => {
      toastSuccess("Carpeta eliminada");
    },
  });
};

const goBack = () => {
  currFolderId.value = prevId.value;

  if (pathStack.value.length > 0) {
    pathStack.value.pop();
  }
};
</script>
