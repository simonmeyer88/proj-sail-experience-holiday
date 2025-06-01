<template>
  <div
    style="
      display: flex;
      flex-direction: column;
      max-height: calc(100dvh - var(--bs-app-header-height) - calc(13dvh));
      height: 100%;
    "
  >
    <div
      class="d-flex flex-lg-row h-100 justify-content-stretch position-relative"
    >
      <ChatSidebar />

      <div class="flex-lg-row-fluid ms-lg-7 ms-xl-10 w-100 h-100">
        <div class="card h-100">
          <ChatHeader />
          <ChatBody />
          <InputBar @send-message="chatStore.sendMessage" v-if="currChat" />

          <div v-if="!currChat" class="d-flex flex-column align-items-center">
            <img
              :src="getAssetPath('media/illustrations/dozzy/4.png')"
              alt=""
              style="max-width: 400px; width: 100%"
            />
            <div class="fs-1 fw-bold text-center px-3">
              {{ t("selectChat") }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<i18n>
{
  "en": {
    "selectChat": "Select a chat to start messaging",
  },
  "es": {
    "selectChat": "Selecciona un chat para empezar a chatear",
  }
}
</i18n>

<script lang="ts" setup>
import { useChatStore } from "@/stores/chat";
import { computed, onMounted, watch } from "vue";
import ChatHeader from "@/components/messenger-parts/header/ChatHeader.vue";
import ChatBody from "@/components/messenger-parts/body/ChatBody.vue";
import { ChatSidebar } from "@/components/messenger-parts/sidebar";
import { getAssetPath } from "@/core/helpers/assets";
import { useI18n } from "vue-i18n";
import { InputBar } from "@/components/messenger-parts";

const { t } = useI18n();
const chatStore = useChatStore();
const currChat = computed(() => chatStore.currChatId);

import { onBeforeRouteLeave, useRouter } from "vue-router";
import { useMyChats } from "@/server-state";

onBeforeRouteLeave((_to, _from, next) => {
  next();
  chatStore.currChatId = null;
});

const chatId = computed(() => chatStore.currChatId);

const router = useRouter();
watch(chatId, (newVal) => {
  if (newVal) {
    // Put chat id in url
    router.push({ query: { id: newVal } });
  }
});

const myChats = useMyChats();

onMounted(async () => {
  const id = router.currentRoute.value.query.id as string;
  if (id) {
    await myChats.suspense();
    if (myChats.data.value?.map((c) => c.id).includes(id)) {
      chatStore.currChatId = id;
    } else {
      router.push({ query: { id: undefined } });
    }
  }
  if (!id) {
    chatStore.sidebarOpen = true;
  }
});
</script>
