<i18n>
  {
    "en": {
      "ATTENTION": "ATTENTION",
      "text": "the exams are the same as the PER course but in PNB only the theoretical unit 6 inclusive must be carried out."
    },
    "es":{
      "ATTENTION": "ATENCIÓN",
      "text": "los exámenes son los mismos que el curso PER pero en PNB solo se ha de realizar hasta la unidad teórica 6 incluida."
    }
  }
</i18n>
<template>
  <div
    class="alert alert-warning fs-6 text-dark fw-semibold"
    style="width: fit-content"
    v-if="me.data.value?.course?.name.includes('PNB')"
  >
    <strong class="text-danger">{{ t("ATTENTION") }}:</strong> {{ t("text") }}
  </div>
  <FileSystemNavbar
    :canGoBack="pathStack.length > 0 || fileSystem.isFetching.value"
    :pathStack="pathStack"
    @goBack="goBack"
  />
  <LoadingComponent v-if="fileSystem.isLoading.value" />
  <NoFiles
    v-else-if="
      fileSystem.data.value &&
      fileSystem.data.value.files?.length === 0 &&
      fileSystem.data.value.folders.length === 0
    "
  />
  <FileSystemGrid
    mode="STUDENT"
    @folder-open="onFolderClick"
    :data="fileSystem.data.value"
    v-else-if="fileSystem.data.value"
  />
  <div v-else-if="!currFolderId">
    <div class="d-flex justify-content-center align-items-center h-100">
      no course
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  FileSystemNavbar,
  FileSystemGrid,
  NoFiles,
} from "@/components/file-system";
import { ref, watch } from "vue";
import { useFileSystem } from "@/server-state/";
import { useCourses, useMe } from "@/server-state";
import { LoadingComponent } from "@/components/ui";
import { useI18n } from "vue-i18n";
const currFolderId = ref<string | null>(null);
const prevId = ref<string | null>(null);

const courses = useCourses();

const me = useMe();

const pathStack = ref<string[]>([]);

const { t } = useI18n();
watch(
  [me.data, courses.data],
  (newVal) => {
    const [meData, coursesData] = newVal;
    if (meData && coursesData) {
      if (meData.course?.id) {
        const courseData = coursesData.find(
          (course) => course.id === meData.course?.id
        );
        if (courseData) {
          currFolderId.value = courseData.rootFolder!.id;
        }
      }
    }
  },
  { immediate: true }
);

const fileSystem = useFileSystem(currFolderId);

watch(
  fileSystem.data,
  (newVal) => {
    if (newVal) {
      prevId.value = newVal.parentId ?? null;
    }
  },
  { immediate: true }
);

const onFolderClick = (folderId: string) => {
  prevId.value = fileSystem.data.value?.id ?? null;
  currFolderId.value = folderId;
  const folder = fileSystem.data.value?.folders.find((f) => f.id === folderId)!;
  pathStack.value.push(folder.name);
};

const goBack = () => {
  currFolderId.value = prevId.value;
  if (pathStack.value.length > 0) {
    pathStack.value.pop();
  }
};
</script>
