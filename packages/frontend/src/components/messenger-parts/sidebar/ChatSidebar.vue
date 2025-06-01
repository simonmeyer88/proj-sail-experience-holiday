<style lang="scss">
@media (min-width: 992px) {
  .sidebar {
    position: static !important;
  }
}

@media (max-width: 991.98px) {
  .sidebar {
    position: absolute !important;
    transition: all 0.3s ease-in-out;
    top: 0;
    left: 0;
    max-width: 400px;
    z-index: 1000000;
    translate: var(--displaced, -100%);
  }
}
</style>

<i18n>
  {
    "es": {
      "newChat": "Nuevo chat",
      "groupChat": "Chat de grupo",
      "chatWith": "Chat con"
    },
    "en": {
      "newChat": "New chat",
      "groupChat": "Group chat",
      "chatWith": "Chat with"
    }
  }
</i18n>
<template>
  <CreateChatModal v-model="showCreateChatModal" />
  <div
    id="__sidebar__guard__"
    class="position-fixed top-0 bottom-0 start-0 end-0"
    style="z-index: 1"
    @click="chatStore.sidebarOpen = false"
    v-if="chatStore.sidebarOpen"
  ></div>

  <div
    ref="sidebarRef"
    class="flex-column flex-lg-row-auto w-100 w-sm-350px mb-10 mb-lg-0 d-lg-block position-absolute position-lg-static rounded-3 bg-light-primary sidebar h-100"
    style="z-index: 2; max-height: 100%"
    :style="chatStore.sidebarOpen ? '--displaced: 0;' : '--displaced: -120%;'"
  >
    <div class="card card-flush h-100">
      <div class="pt-7 flex-column gap-2 card-header">
        <button
          @click="showCreateChatModal = true"
          class="btn btn-light-primary border border-primary"
          data-testid="new-chat-button"
        >
          <i class="ki-solid ki-element-plus fs-2 me-2"></i>
          {{ t("newChat") }}
        </button>
      </div>
      <div class="card-body pt-5 h-100">
        <div
          class="me-n5 pe-5 d-flex flex-column justify-content-start gap-4"
          style="overflow-y: auto; max-height: calc(100% - 68px)"
        >
          <template v-for="chat in myChats.data.value" :key="chat.id">
            <div
              data-testid="chat-sidebar-item"
              class="d-flex flex-stack px-4 py-2 rounded cursor-pointer border border-gray-200 bg-hover-light-primary"
              :class="currChat === chat.id ? 'bg-light-success' : ''"
              @click="
                chatStore.currChatId = chat.id;
                chatStore.sidebarOpen = false;
              "
            >
              <div class="d-flex align-items-center">
                <div
                  class="symbol symbol-45px symbol-circle border border-gray-400"
                >
                  <BaseImage :src="chat?.pictureUrl" />
                  <span
                    v-if="chatStore.hasUnreadMessagesPerChat[chat.id]"
                    class="bullet bullet-dot bg-success translate-middle animation-blink position-absolute"
                    style="height: 12px; width: 12px; top: 5px; left: 5px"
                  ></span>
                </div>
                <div class="ms-5 position-relative">
                  <div class="fw-semibold fs-4 d-flex flex-column">
                    <div>
                      {{ chat.isGroup ? t("groupChat") : t("chatWith") }}
                    </div>
                    <div class="fw-bold text-primary">
                      {{ chat.name }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useChatStore } from "@/stores/chat";
import { useMyChats } from "@/server-state";
import { computed, ref } from "vue";
import CreateChatModal from "./CreateChatModal.vue";
import { useI18n } from "vue-i18n";
import BaseImage from "@/components/common/BaseImage.vue";

const { t } = useI18n();
const chatStore = useChatStore();

const currChat = computed(() => chatStore.currChatId);
const myChats = useMyChats();

const sidebarRef = ref(null);

const showCreateChatModal = ref(false);
</script>
