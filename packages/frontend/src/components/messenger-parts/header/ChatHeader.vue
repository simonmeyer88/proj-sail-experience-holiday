<i18n>
  {
    "es": {
      "members": "Miembros",
      "removeMembers": "Eliminar miembros",
      "addMembers": "Añadir miembros",
      "searchUsers": "Buscar usuarios",
      "more": "Más",
      "deleteChat": "Eliminar chat",
      "allCourses": "Todos los cursos"
    },
    "en": {
      "members": "Members",
      "removeMembers": "Remove members",
      "addMembers": "Add members",
      "searchUsers": "Search users",
      "more": "More",
      "deleteChat": "Delete chat",
      "allCourses": "All courses"
    }
  }
</i18n>

<template>
  <template v-if="currChat">
    <BaseModal v-model="showChatModal" :title="currChat.name!" :max-width="480">
      <ElTabs v-if="currChat.isGroup" type="border-card">
        <ElTabPane :label="t('members')">
          <div v-if="membersToRemove.length > 0" class="mb-8">
            <button
              @click="handleRemoveMembers"
              class="btn btn-light-danger btn-sm border-danger"
            >
              {{ t("removeMembers") }}
            </button>
          </div>
          <el-scrollbar height="400px" always>
            <div class="d-flex flex-column gap-3">
              <template v-for="user in chatMembers.data.value" :key="user.id">
                <div
                  class="d-flex align-items-center justify-content-between gap-4"
                >
                  <div class="d-flex align-items-center gap-4">
                    <div class="symbol symbol-30px">
                      <BaseImage class="rounded" :src="user.pictureUrl" />
                    </div>
                    <div class="fw-bold">
                      {{ user!.firstName! + " " + user!.lastName! }}
                    </div>
                  </div>
                  <input
                    v-model="membersToRemove"
                    type="checkbox"
                    :value="user.id"
                    class="form-check-input me-8"
                    v-if="
                      me.data.value?.role === 'ADMIN' ||
                      me.data.value?.role === 'TEACHER'
                    "
                  />
                </div>
                <div class="separator separator-dashed"></div>
              </template>
            </div>
          </el-scrollbar>
        </ElTabPane>
        <ElTabPane
          :label="t('addMembers')"
          v-if="
            me.data.value?.role === 'ADMIN' || me.data.value?.role === 'TEACHER'
          "
        >
          <VForm @submit="handleAddMembers">
            <div class="d-flex gap-2 align-items-center mb-4 flex-wrap">
              <input
                type="text"
                class="form-control"
                data-testid="search"
                v-model="addMembersSearch"
                :placeholder="t('searchUsers')"
              />
              <select class="form-select" v-model="addMembersCourseId">
                <option :value="null">{{ t("allCourses") }}</option>
                <option
                  v-for="course in courses.data.value"
                  :key="course.id"
                  :value="course.id"
                >
                  {{ course.name }}
                </option>
              </select>
            </div>

            <el-scrollbar height="330px" always class="mb-8">
              <div class="d-flex flex-column gap-3">
                <template v-for="user in filteredUsers" :key="user.id">
                  <div class="d-flex align-items-center gap-4">
                    <input
                      type="checkbox"
                      :value="user.id"
                      v-model="membersToAdd"
                      class="form-check-input"
                    />
                    <div class="symbol symbol-30px">
                      <BaseImage
                        alt="User profile picture"
                        class="rounded"
                        :src="user.pictureUrl"
                      />
                    </div>
                    <div class="fw-bold">
                      {{ user.firstName + " " + user.lastName }}
                    </div>
                  </div>
                  <div class="separator separator-dashed"></div>
                </template>
              </div>
            </el-scrollbar>

            <LoadableButton
              class="btn btn-primary"
              submit
              :loading="false"
              :default-text="t('addMembers')"
              color="primary"
            />
          </VForm>
        </ElTabPane>
        <ElTabPane
          :label="t('more')"
          v-if="
            me.data.value?.role === 'ADMIN' || me.data.value?.role === 'TEACHER'
          "
        >
          <button class="btn btn-danger" @click="handleDeleteChat">
            {{ t("deleteChat") }}
          </button>
        </ElTabPane>
      </ElTabs>
      <div class="d-flex flex-column gap-3 justify-content-center" v-else>
        <div
          class="d-flex align-items-center gap-4"
          v-for="user in chatMembers.data.value"
          :key="user.id"
        >
          <div class="symbol symbol-100px">
            <BaseImage :src="user.pictureUrl" />
          </div>
          <div class="fw-bold">
            {{ user.firstName + " " + user.lastName }}
          </div>
        </div>
      </div>
    </BaseModal>
  </template>

  <div class="card-header">
    <div class="card-title">
      <div class="d-flex gap-6 align-items-center">
        <button
          @click="chatStore.sidebarOpen = !chatStore.sidebarOpen"
          ref="btnSidebarRef"
          class="btn btn-icon me-3 btn-light-primary btn-sm d-lg-none"
        >
          <i class="ki-solid ki-abstract-14 fs-2"></i>
        </button>
        <div
          class="d-flex justify-content-center me-3 align-items-center gap-4"
        >
          <div class="symbol symbol-40px" v-if="currChat?.id">
            <BaseImage class="rounded" :src="currChat?.pictureUrl" />
          </div>
          <div class="fs-2 fw-bold">
            {{ currChat?.name || "" }}
          </div>
        </div>
      </div>
    </div>
    <div class="card-toolbar">
      <div class="me-n3">
        <button
          v-if="currChat?.isGroup"
          @click="showChatModal = true"
          class="btn btn-sm btn-icon btn-active-light-primary"
        >
          <i class="bi bi-three-dots fs-2"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  useAddChatMembers,
  useCourses,
  useDeleteChat,
  useMe,
  useMyChats,
  useRemoveChatMembers,
  useUsersBasicInfo,
} from "@/server-state";
import { computed, ref } from "vue";
import { useChatStore } from "@/stores/chat";
import { useChatMembers } from "@/server-state";
import BaseModal from "@/components/common/BaseModal.vue";
import LoadableButton from "@/components/form/LoadableButton.vue";
import { VForm } from "@/components/form";
import { toastSuccess, toastError } from "@/util/toast";
import { alertConfirm } from "@/util/alert";
import { useI18n } from "vue-i18n";
import BaseImage from "@/components/common/BaseImage.vue";

const { t } = useI18n();
const chatStore = useChatStore();
const myChats = useMyChats();
const addChatMembers = useAddChatMembers();
const removeChatMembers = useRemoveChatMembers();
const deleteChat = useDeleteChat();
const currChat = computed(() =>
  myChats.data.value?.find((c) => c.id === chatStore.currChatId)
);

const showChatModal = ref(false);

const courses = useCourses();

const chatMembers = useChatMembers(computed(() => chatStore.currChatId));

const addMembersSearch = ref("");
const addMembersCourseId = ref<string | null>(null);

const users = useUsersBasicInfo();
const me = useMe();

const filteredUsers = computed(() =>
  users.data.value
    ?.filter(
      (u) =>
        u.id !== me.data.value?.id &&
        u
          .firstName!.toLowerCase()
          .includes(addMembersSearch.value.toLowerCase()) &&
        chatMembers.data.value?.map((m) => m.id).indexOf(u.id) === -1
    )
    .filter((u) => {
      if (!addMembersCourseId.value) return true;

      return u.courseId === addMembersCourseId.value;
    })
);

const handleAddMembers = async () => {
  if (!currChat.value) return;
  addChatMembers.mutate(
    {
      chatId: currChat.value.id,
      memberIds: membersToAdd.value,
    },
    {
      onSuccess: () => {
        toastSuccess("Members added");
        membersToAdd.value = [];
      },
      onError: () => {
        toastError("Error adding members");
      },
    }
  );
};

const membersToAdd = ref<string[]>([]);

const membersToRemove = ref<string[]>([]);

const handleRemoveMembers = async () => {
  if (!currChat.value) return;
  removeChatMembers.mutate(
    {
      chatId: currChat.value.id,
      memberIds: membersToRemove.value,
    },
    {
      onSuccess: () => {
        toastSuccess("Members removed");
        membersToRemove.value = [];
      },
      onError: (error: any) => {
        toastError(error?.message || "Error removing members");
      },
    }
  );
};

const handleDeleteChat = async () => {
  if (!currChat.value) return;
  const confirmed = await alertConfirm({
    title: "Delete chat",
    text: "Are you sure you want to delete this chat?",
    confirmButtonText: "Delete",
    cancelButtonText: "Cancel",
  });
  if (!confirmed) return;
  deleteChat.mutate(currChat.value.id, {
    onSuccess: () => {
      toastSuccess("Chat deleted");
      showChatModal.value = false;
      chatStore.currChatId = null;
    },
    onError: (error: any) => {
      toastError(error?.message || "Error deleting chat");
    },
  });
};
</script>
