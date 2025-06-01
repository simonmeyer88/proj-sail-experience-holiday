<i18n>
  {
    "en": {
      "newChat": "New chat",
      "groupChat": "Group chat",
      "image": "Image",
      "name": "Name",
      "createChat": "Create chat",
      "privateChat": "Private chat",
      "chooseUserForPrivateConvo": "Choose a user to start a private conversation",
      "startChat": "Start chat",
      "noUsersFound": "No users found",
      "chatCreated": "Chat created",

    },
    "es":{
      "newChat": "Nuevo chat",
      "groupChat": "Chat de grupo",
      "image": "Imagen",
      "name": "Nombre",
      "createChat": "Crear chat",
      "privateChat": "Chat privado",
      "chooseUserForPrivateConvo": "Elige un usuario para iniciar una conversación privada",
      "startChat": "Iniciar chat",
      "noUsersFound": "No se encontraron usuarios",
      "chatCreated": "Chat creado",
    }
  }
</i18n>
<template>
  <BaseModal
    :model-value="modelValue"
    @update:modelValue="($event) => emit('update:modelValue', $event)"
    :title="t('newChat')"
    :max-width="480"
  >
    <ElTabs>
      <ElTabPane
        :label="t('groupChat')"
        v-if="
          me.data.value?.role === 'ADMIN' || me.data.value?.role === 'TEACHER'
        "
      >
        <CreateGroupChatForm
          @submit="handleCreateGroupChat"
          :loading="createChat.isLoading.value"
        />
      </ElTabPane>
      <ElTabPane :label="t('privateChat')">
        <VForm @submit.prevent v-slot="{ setValues, values }">
          <div class="d-flex flex-column gap-2 mb-4">
            <div
              v-if="values.userId"
              class="fw-bold card p-4 flex-row align-items-center gap-4 bg-light-success border-success"
            >
              <button
                class="btn btn-success"
                type="button"
                @click="handleCreatePrivateConvo(values.userId)"
              >
                {{ t("startChat") }}
              </button>
              <div class="symbol symbol-40px ms-auto">
                <BaseImage :src="values.user?.pictureUrl" />
              </div>
              {{ values.user?.firstName + " " + values.user?.lastName }}
            </div>
            <div
              v-else
              class="bg-light-warning p-4 border-warning border rounded"
            >
              {{ t("chooseUserForPrivateConvo") }}
            </div>

            <input
              type="text"
              class="form-control"
              data-testid="search"
              v-model="usersSearch"
            />

            <ElScrollbar height="330px" always class="mb-8">
              <div class="d-flex flex-column gap-3" style="min-height: 330px">
                <template v-for="user in filteredUsers" :key="user.id">
                  <div
                    @click="setValues({ userId: user.id, user: user })"
                    class="d-flex align-items-center gap-4 px-4 py-2 card d-flex flex-row bg-hover-light-primary cursor-pointer"
                    :class="values.userId === user.id ? 'bg-light-success' : ''"
                  >
                    <div class="symbol symbol-30px">
                      <BaseImage
                        :src="user?.pictureUrl"
                        class="rounded-circle"
                      />
                    </div>
                    <div class="fw-bold">
                      {{ user.firstName + " " + user.lastName }}
                    </div>
                    <div class="ms-auto d-flex align-items-center">
                      <i class="ki-duotone ki-check-square text-success fs-2hx">
                        <i class="path1"></i>
                        <i class="path2"></i>
                      </i>
                    </div>
                  </div>
                </template>
                <div v-if="!filteredUsers.length" class="text-center">
                  {{ t("noUsersFound") }}
                </div>
              </div>
            </ElScrollbar>
          </div>
        </VForm>
      </ElTabPane>
    </ElTabs>
  </BaseModal>
</template>

<script lang="ts" setup>
import {
  useCreateChat,
  useCreatePrivateChat,
  useMe,
  useMyChats,
  useUsersBasicInfo,
} from "@/server-state";
import { toastError, toastSuccess } from "@/util/toast";
import { ref, computed } from "vue";
import { BaseModal } from "@/components/common";
import { VForm } from "@/components/form";
import { useI18n } from "vue-i18n";
import CreateGroupChatForm from "./CreateGroupChatForm.vue";
import BaseImage from "@/components/common/BaseImage.vue";

const { t } = useI18n();

defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
});

const myChats = useMyChats();
const emit = defineEmits<{
  "update:modelValue": [boolean];
}>();

const users = useUsersBasicInfo();

const usersSearch = ref("");
const filteredUsers = computed(
  () =>
    users.data.value
      ?.filter((u) =>
        (u.firstName!.toLowerCase() + " " + u.lastName!.toLowerCase()).includes(
          usersSearch.value.toLowerCase()
        )
      )
      .filter(
        (u) =>
          !myChats.data.value
            ?.map((c) => c?.otherUserId)
            .filter(Boolean)
            .includes(u.id)
      ) || []
);
const createPrivateChat = useCreatePrivateChat();
const handleCreatePrivateConvo = async (userId: string) => {
  createPrivateChat.mutate(
    {
      userId,
    },
    {
      onSuccess: () => {
        toastSuccess("Chat created");
        emit("update:modelValue", false);
      },
      onError: (err: any) => {
        toastError(err?.message || "Error creating chat");
      },
    }
  );
};

const createChat = useCreateChat();

const handleCreateGroupChat = async (values: any) => {
  createChat.mutate(
    {
      name: values.name,
      image: values.image,
    },
    {
      onSuccess: () => {
        emit("update:modelValue", false);
        toastSuccess(t("chatCreated"));
      },
      onError: (err: any) => {
        toastError(err?.message || "Error creating chat");
      },
    }
  );
};

const me = useMe();
</script>
