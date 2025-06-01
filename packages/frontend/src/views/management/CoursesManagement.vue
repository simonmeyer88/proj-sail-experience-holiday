<i18n>
  {
    "en": {
        "course": "Course",
        "createCourse": "Create course",
        "courses": "Courses",
        "predefinedEvent": "Predefined event",
        "predefinedEvents": "Predefined events",
        "createPredefinedEvent": "Create predefined event",
        "delete": "Delete",
        "cancel": "Cancel",
        "rename": "Rename",
        "students": "Students",
        "title": "Title",
        "update": "Update",
        "predefinedEventDeleted": "Predefined event deleted",
        "predefinedEventUpdated": "Predefined event updated",
        "predefinedEventCreated": "Predefined event created",
        "courseCreated": "Course created",
        "courseDeleted": "Course deleted",
        "courseRenamed": "Course renamed",
        "deleteCourse": "Delete course",
        "deleteCourseText": "Are you sure you want to delete this course? All information related to the course (videos, files, exams...) will be permanently deleted. The students that belong to this course will be removed from it, but they won't be deleted from the platform.",

      
    },
    
  
  "es": {
      "course": "Curso",
      "courses": "Cursos",
      "createCourse": "Crear curso",
      "predefinedEvent": "Evento predefinido",
      "predefinedEvents": "Eventos predefinidos",
      "createPredefinedEvent": "Crear evento predefinido",
      "delete": "Eliminar",
      "cancel": "Cancelar",
      "rename": "Renombrar",
      "students": "Estudiantes",
      "title": "Título",
      "update": "Actualizar",
      "predefinedEventDeleted": "Evento predefinido eliminado",
      "predefinedEventUpdated": "Evento predefinido actualizado",
      "predefinedEventCreated": "Evento predefinido creado",
      "courseCreated": "Curso creado",
      "courseDeleted": "Curso eliminado",
      "courseRenamed": "Curso renombrado",
      "deleteCourse": "Eliminar curso",
      "deleteCourseText": "¿Estás seguro de que quieres eliminar este curso? Toda la información relacionada con el curso (videos, archivos, exámenes...) se eliminará permanentemente. Los alumnos que pertenecen a este curso serán eliminados de él, pero no se eliminarán de la plataforma.",
  },
}
</i18n>
<template>
  <div class="d-flex mb-6 gap-2" v-if="courses.data.value">
    <button
      class="btn btn-light-success border-success border"
      @click="showCreateCourseDialog = true"
    >
      <i class="ki-duotone ki-plus-square fs-1">
        <i class="path1"></i>
        <i class="path2"></i>
        <i class="path3"></i>
      </i>
      {{ t("course") }}
    </button>
    <button
      class="btn btn-light-primary border-primary border"
      @click="showCreatePredEvent = true"
    >
      <i class="ki-duotone ki-plus-square fs-1">
        <i class="path1"></i>
        <i class="path2"></i>
        <i class="path3"></i>
      </i>
      {{ t("predefinedEvent") }}
    </button>
  </div>
  <div
    class="row g-5 row-cols-1 row-cols-md-2 row-cols-xxl-3"
    v-if="courses.data.value"
  >
    <div
      v-for="course in courses.data.value"
      :key="course.id"
      data-testid="course-card"
    >
      <div class="card card-flush h-100">
        <ElDropdown size="large" :hide-on-click="false" trigger="click">
          <span
            class="el-dropdown-link position-absolute"
            style="z-index: 2; top: 10px; right: 10px"
          >
            <i class="ki-duotone ki-category fs-2x text-primary">
              <i class="path1"></i>
              <i class="path2"></i>
              <i class="path3"></i>
              <i class="path4"></i>
            </i>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="handleCourseDelete(course.id)">
                <i class="ki-solid ki-trash-square text-danger fs-1"> </i>
                {{ t("delete") }}
              </el-dropdown-item>
              <el-dropdown-item @click="currCourseRenameModalId = course.id">
                <i class="ki-solid ki-notepad-edit fs-1 text-primary"> </i>
                {{ t("rename") }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </ElDropdown>

        <div class="card-header pt-5 w-100">
          <div class="card-title d-flex flex-column w-100">
            <div class="d-flex flex-column align-items-stretch mb-4 w-100">
              <div
                class="fs-1 fw-bold text-dark me-9 lh-1 ls-n2 pb-4 border-bottom border-bottom-dashed w-100"
                style="word-wrap: break-word"
              >
                {{ course.name }}
              </div>
              <div class="fs-8">ID: {{ course.id }}</div>
              <div class="d-flex align-items-center flex-wrap pt-2">
                <i class="ki-solid ki-profile-user fs-2x text-primary"></i>
                <span class="text-gray-800 pt-1 fw-semibold fs-1 me-2">{{
                  coursesStudentCounts.data.value?.find(
                    (obj) => obj.courseId === course.id
                  )?._count || 0
                }}</span>

                <span class="text-gray-400 pt-2 fw-semibold fs-6">
                  {{ t("students") }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <LoadingComponent v-else :height="290" />
  <div v-if="predefinedEvents.data.value">
    <div class="d-flex align-items-center mt-10 gap-4">
      <h3 class="text-gray-900 fs-1">
        {{ t("predefinedEvents") }}
      </h3>
    </div>
    <div class="row g-5">
      <div
        v-for="predEvent in predefinedEvents.data.value"
        :key="predEvent.id"
        class="col-12 col-sm-6 col-md-6 col-lg-6 col-xxl-4"
      >
        <div class="card card-flush pt-6 h-100">
          <div class="card-header fs-2 fw-bold min-h-40px">
            {{ predEvent.title }}
          </div>
          <div class="card-body pt-0">
            <div
              class="d-flex align-items-center gap-3 border-top border-top-dashed h-100"
            >
              <Form
                :initial-values="{
                  title: predEvent.title,
                  courseIds: predEvent.courses.map((course) => course.courseId),
                }"
                @submit="
                  (values, rest) =>
                    handleUpdatePredefinedEventSubmit(
                      predEvent.id,
                      values,
                      rest
                    )
                "
                :validation-schema="updatePredefinedEventSchema"
                v-slot="{ meta }"
                class="w-100 d-flex flex-column h-100"
              >
                <InputGroup :label="t('title')" name="title" type="text" />
                <MultiSelectGroup
                  :label="t('courses')"
                  name="courseIds"
                  :options="
                    courses.data.value?.map((course) => ({
                      label: course.name,
                      value: course.id,
                    })) || []
                  "
                />
                <div
                  class="d-flex gap-3 justify-content-end align-items-end flex-grow-1"
                  style="justify-self: flex-end"
                >
                  <LoadableButton
                    class="btn-sm"
                    :default-text="t('update')"
                    submit
                    :color="meta.dirty ? 'primary' : 'secondary'"
                    :loading="
                      updatePredefinedEvent.variables.value?.id ===
                        predEvent.id && updatePredefinedEvent.isLoading.value
                    "
                    :disabled="!meta.dirty"
                  />
                  <button
                    type="button"
                    class="btn btn-danger btn-sm"
                    @click="handleDeletePredefinedEvent(predEvent.id)"
                  >
                    {{ t("delete") }}
                  </button>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <LoadingComponent v-else :height="290" />

  <BaseModal
    v-model="showCourseRenameModal"
    :max-width="350"
    :title="t('rename')"
  >
    <Form
      @submit="handleCourseRenameSubmit"
      :initial-values="
        courses.data.value?.find(
          (course) => course.id === currCourseRenameModalId
        )
      "
      :validation-schema="renameCourseSchema"
    >
      <InputGroup label="Nombre" name="name" type="text" horizontal="dynamic" />
      <LoadableButton
        :default-text="t('rename')"
        :loading="false"
        color="success"
        submit
      />
    </Form>
  </BaseModal>
  <BaseModal
    :title="t('createCourse')"
    v-model="showCreateCourseDialog"
    :max-width="350"
  >
    <Form
      @submit="handleCreateCourseSubmit"
      :validation-schema="createCourseSchema"
    >
      <InputGroup label="Nombre" name="name" type="text" />
      <LoadableButton
        :default-text="t('createCourse')"
        :loading="false"
        color="success"
        submit
      />
    </Form>
  </BaseModal>

  <BaseModal
    :title="t('createPredefinedEvent')"
    v-model="showCreatePredEvent"
    :max-width="350"
  >
    <Form
      @submit="handleCreatePredifinedEventSubmit"
      :validation-schema="createPredefinedEventSchema"
    >
      <InputGroup :label="t('title')" name="title" type="text" />
      <MultiSelectGroup
        :label="t('courses')"
        name="courseIds"
        :options="
          courses.data.value?.map((course) => ({
            label: course.name,
            value: course.id,
          })) || []
        "
      />

      <LoadableButton
        :default-text="t('createPredefinedEvent')"
        :loading="false"
        color="success"
        submit
      />
    </Form>
  </BaseModal>
</template>

<script lang="ts" setup>
import {
  useCourses,
  useCoursesStudentCounts,
  useCreateCourse,
  useCreatePredefinedEvent,
  useDeleteCourse,
  useUpdateCourse,
  useUpdatePredefinedEvent,
  useDeletePredefinedEvent,
  usePredefinedEvents,
} from "@/server-state";
import { BaseModal } from "@/components/common";
import { computed, ref } from "vue";
import { Form } from "vee-validate";
import {
  InputGroup,
  LoadableButton,
  MultiSelectGroup,
} from "@/components/form";
import { alertConfirm } from "@/util/alert";
import { toastError, toastSuccess } from "@/util/toast";
import {
  createCourseSchema,
  renameCourseSchema,
} from "@/validation-schemas/courses";
import {
  createPredefinedEventSchema,
  updatePredefinedEventSchema,
} from "@/validation-schemas/events";
import { ElDropdown, ElDropdownItem, ElDropdownMenu } from "element-plus";
import { useI18n } from "vue-i18n";
import { LoadingComponent } from "@/components/ui";

const { t } = useI18n();

const predefinedEvents = usePredefinedEvents();
const createCourse = useCreateCourse();
const deleteCourse = useDeleteCourse();
const updateCourse = useUpdateCourse();
const courses = useCourses();
const coursesStudentCounts = useCoursesStudentCounts();
const createPredefinedEvent = useCreatePredefinedEvent();

const showCreateCourseDialog = ref(false);

const updatePredefinedEvent = useUpdatePredefinedEvent();
const deletePredefinedEvent = useDeletePredefinedEvent();

const showCreatePredEvent = ref(false);
const handleDeletePredefinedEvent = async (predEventId: string) => {
  const course = courses.data.value?.find((course) =>
    course.predefinedEvents.find(
      (predEvent) => predEvent.predefinedEventId === predEventId
    )
  );
  const predEvent = course?.predefinedEvents.find(
    (predEvent) => predEvent.predefinedEventId === predEventId
  );
  if (predEvent) {
    try {
      await deletePredefinedEvent.mutateAsync(predEvent.predefinedEventId);
      toastSuccess(t("predefinedEventDeleted"));
    } catch (e: any) {
      toastError(e.message || "Unknown error");
    }
  }
};
const handleUpdatePredefinedEventSubmit = async (
  predEventId: string,
  values: any,
  { resetForm, setTouched }: any
) => {
  const course = courses.data.value?.find((course) =>
    course.predefinedEvents.find(
      (predEvent) => predEvent.predefinedEventId === predEventId
    )
  );
  const predEvent = course?.predefinedEvents.find(
    (predEvent) => predEvent.predefinedEventId === predEventId
  );
  if (predEvent) {
    try {
      await updatePredefinedEvent.mutateAsync(
        {
          id: predEvent.predefinedEventId,
          title: values.title,
          courseIds: values.courseIds,
        },
        {
          onError: (error: any) => {
            resetForm();
            toastError(error.message || "Unknown error");
          },
          onSuccess: () => {
            setTouched(false);
            toastSuccess(t("predefinedEventUpdated"));
          },
        }
      );
    } catch (e: any) {
      toastError(e.message || "Unknown error");
    }
  }
};

const handleCreatePredifinedEventSubmit = async (
  values: any,
  { resetForm }: any
) => {
  createPredefinedEvent.mutate(values, {
    onError: (error: any) => {
      toastError(error.message || "Unknown error");
    },
    onSuccess: () => {
      showCreateCourseDialog.value = false;
      resetForm();
      toastSuccess(t("predefinedEventCreated"));
    },
  });
};

const handleCreateCourseSubmit = async (values: any) => {
  createCourse.mutate(
    {
      name: values.name,
    },
    {
      onError: (error: any) => {
        toastError(error.message || "Unknown error");
      },
      onSuccess: () => {
        showCreateCourseDialog.value = false;
        toastSuccess(t("courseCreated"));
      },
    }
  );
};

const handleCourseDelete = (id: string) => {
  alertConfirm({
    title: t("deleteCourse"),
    text: t("deleteCourseText"),
    confirmButtonText: t("delete"),
    cancelButtonText: t("cancel"),
    onConfirm: () => {
      deleteCourse.mutate(id, {
        onError: (error: any) => {
          toastError(error.message || "Unknown error");
        },
        onSuccess: () => {
          toastSuccess(t("courseDeleted"));
        },
      });
    },
  });
};

const currCourseRenameModalId = ref<string | null>(null);
const showCourseRenameModal = computed({
  get() {
    return currCourseRenameModalId.value !== null;
  },
  set(value) {
    if (!value) {
      currCourseRenameModalId.value = null;
    }
  },
});

const handleCourseRenameSubmit = async (values: any) => {
  if (currCourseRenameModalId.value) {
    updateCourse.mutate(
      {
        id: currCourseRenameModalId.value,
        name: values.name,
      },
      {
        onError: (error: any) => {
          toastError(error.message || "Unknown error");
        },
        onSuccess: () => {
          showCourseRenameModal.value = false;
          toastSuccess(t("courseRenamed"));
        },
      }
    );
  }
};
</script>
