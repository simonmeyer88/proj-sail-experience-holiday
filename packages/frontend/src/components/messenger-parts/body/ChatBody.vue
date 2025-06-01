<style lang="scss" scoped>
.fade-in-only-enter-active {
  transition: opacity 0.3s ease-in-out;
}
.fade-in-only-enter-from {
  opacity: 0;
}
.fade-in-only-enter-to {
  opacity: 1;
}
</style>
<i18n>
  {
    "es": {
      "noMessages": "No hay mensajes"
    },
    "en": {
      "noMessages": "No hay mensajes"
    }
  }
</i18n>
<template>
  <LoadingComponent v-if="chatStore.isCurrChatLoading" class="card-body" />

  <div
    class="card-body overflow-y-auto position-relative"
    ref="messagesRef"
    @scroll="handleScroll"
    @vue:mounted="handleMounted"
    :key="chatStore.currChatId"
    v-else-if="chatStore.currChatId"
  >
    <div v-if="chatStore.messagesFromCurrChat.length === 0" class="text-center">
      {{ t("noMessages") }}
    </div>
    <LoadingComponent
      :height="70"
      v-else-if="chatStore.isCurrChatLoadingMore"
      class="position-absolute top-0 start-0 w-100"
    />
    <template
      v-for="item in [...chatStore.messagesFromCurrChat].reverse()"
      :key="item.id"
    >
      <MessageIn
        id="item.id"
        :deleted-at="item.deletedAt"
        v-if="item.sender.id !== me.data.value?.id"
        :name="item.sender.fullName"
        :image="item.sender.pictureUrl || getDefaultProfilePicture()"
        :time="new Date(item.sentAt)"
        :text="item.content"
      ></MessageIn>
      <MessageOut
        v-else
        @delete="chatStore.deleteMessage(item.id)"
        :deleted-at="item.deletedAt"
        :id="item.id"
        :name="'You'"
        :image="item.sender.pictureUrl || getDefaultProfilePicture()"
        :time="new Date(item.sentAt)"
        :text="item.content"
      ></MessageOut>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { useChatStore } from "@/stores/chat";
import { useMe } from "@/server-state";
import { getDefaultProfilePicture } from "@/core/helpers/assets";
import MessageIn from "./MessageIn.vue";
import MessageOut from "./MessageOut.vue";
import { nextTick, ref, watch } from "vue";
import { LoadingComponent } from "@/components/ui";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const chatStore = useChatStore();

const me = useMe();

const handleScroll = async (e: Event) => {
  const target = e.target as HTMLElement;

  // Store the current scroll position
  const prevScrollTop = target.scrollTop;

  // we need to get the last message element
  const prevHeight = target.scrollHeight;

  if (target.scrollTop === 0) {
    // Load more messages
    await chatStore.loadMore();

    const currHeight = target.scrollHeight;

    // Set the scroll position to whatever it was before the new messages were added
    target.scrollTop = currHeight - prevHeight + prevScrollTop;
  }
};

const messagesRef = ref<HTMLElement | null>(null);

const handleMounted = () => {
  nextTick(() => {
    if (messagesRef.value) {
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight;
    }
  });
};

watch(
  () => chatStore.messagesFromCurrChat,
  () => {
    nextTick(() => {
      if (messagesRef.value) {
        const isScrolledToBottom =
          messagesRef.value.scrollTop + messagesRef.value.clientHeight >=
          messagesRef.value.scrollHeight - 600;
        if (isScrolledToBottom) {
          messagesRef.value.scrollTo({
            top: messagesRef.value.scrollHeight,
            behavior: "smooth",
          });
        }
      }
    });
  },
  { immediate: true, deep: true }
);
</script>
