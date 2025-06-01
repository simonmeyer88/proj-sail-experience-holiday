import { defineStore } from "pinia";
import { watch, reactive, ref, onBeforeUnmount, computed } from "vue";
import { Socket, io } from "socket.io-client";
import { useMe, useMyChats, useSeeChat } from "@/server-state";
import { IMessage } from "@aula-anclademia/backend/src/chat/chat.types";
import ApiService from "@/core/services/ApiService";

type ChatId = string;

export const useChatStore = defineStore("chat-store", () => {
  const seeChat = useSeeChat();
  const myChats = useMyChats();
  const me = useMe();

  const chatIds = computed(() => {
    return myChats.data.value?.map((c) => c.id) || [];
  });

  const sidebarOpen = ref(false);
  const currChatId = ref<string | null>(null);
  const socket = ref<Socket | null>(null);

  const chatCursors = reactive<Record<ChatId, string | null>>({});

  const currIsLoading = reactive<Record<ChatId, boolean>>({});

  const isLoadingMore = reactive<Record<ChatId, boolean>>({});

  // by chatId
  const messages: Record<ChatId, IMessage[]> = reactive({});

  const hasUnreadMessagesPerChat = computed<Record<ChatId, boolean>>(() => {
    const obj: Record<ChatId, boolean> = {};

    for (const chat of myChats.data.value || []) {
      const _messages = messages[chat.id];

      const lastMessage = _messages ? _messages[0] : null;

      obj[chat.id] = lastMessage ? lastMessage.sentAt > chat.lastSeenAt : false;
    }

    return obj;
  });

  const messagesFromCurrChat = computed(() => {
    if (!currChatId.value) return [];
    return messages[currChatId.value] || [];
  });

  const isCurrChatLoading = computed(() => {
    if (!currChatId.value) return false;
    return currIsLoading[currChatId.value];
  });

  const isCurrChatLoadingMore = computed(() => {
    if (!currChatId.value) return false;
    return isLoadingMore[currChatId.value];
  });

  const sendMessage = async (message: string) => {
    if (!currChatId.value || !socket.value) return;

    socket.value.emit("message", {
      text: message,
      chatId: currChatId.value,
    });
  };

  const deleteMessage = async (messageId: string) => {
    if (!currChatId.value || !socket.value) return;
    socket.value.emit("deleteMessage", {
      id: messageId,
    });
  };

  const loadMore = async () => {
    if (!currChatId.value) return;
    const val = currChatId.value;
    isLoadingMore[val] = true;
    const messages_ = await ApiService.get<IMessage[]>(
      `/chats/${currChatId.value}/messages?idCursor=${
        chatCursors[currChatId.value] || ""
      }`
    );

    messages[currChatId.value].push(...messages_);
    if (messages_.length > 0) {
      chatCursors[currChatId.value] = messages_[messages_.length - 1].id;
    }
    isLoadingMore[val] = false;
  };

  const init = () => {
    socket.value = io(import.meta.env.VITE_APP_API_URL as string, {
      withCredentials: true,
    });
    socket.value.on("connect", () => {
      console.log("🚀 Connected to chat socket");
    });
    socket.value.on("disconnect", () => {
      console.log("🚀 Disconnected from chat socket");
    });
    socket.value.on("deleteMessage", (obj) => {
      if (!messages[obj.chatId]) {
        messages[obj.chatId] = [];
      }
      messages[obj.chatId] = messages[obj.chatId].map((m) => {
        if (m.id === obj.id) {
          m.deletedAt = new Date();
        }
        return m;
      });
    });
    socket.value.on("message", async (message: IMessage) => {
      if (!messages[message.chatId]) {
        messages[message.chatId] = [];
      }

      messages[message.chatId].unshift(message);

      if (message.chatId === currChatId.value) {
        await seeChat.mutateAsync(message.chatId);
      }
    });
  };

  watch(
    () => me.data.value,
    (newValue, oldValue) => {
      const reload =
        (!!oldValue?.id && !!newValue?.id && newValue.id !== oldValue.id) ||
        !oldValue?.id ||
        !newValue?.id;
      if (reload) {
        console.log("🚀 Reloading chat socket");
        socket.value && socket.value.disconnect();
        init();
      }
    },
    { immediate: true }
  );

  const loadChatMessages = async (chatId: ChatId) => {
    currIsLoading[chatId] = true;
    const messages_ = await ApiService.get<IMessage[]>(
      `/chats/${chatId}/messages`
    );
    messages[chatId] = messages_;
    if (messages_.length > 0) {
      chatCursors[chatId] = messages_[messages_.length - 1].id;
    }

    currIsLoading[chatId] = false;
  };

  watch(
    () => chatIds.value,
    async (newValue, oldValue) => {
      if (newValue.length > 0 && oldValue!.length === 0) {
        await Promise.all(newValue.map((id) => loadChatMessages(id)));
      }
    },
    { immediate: true }
  );

  watch(
    () => currChatId.value,
    async (newValue) => {
      if (!newValue) return;
      currIsLoading[newValue] = true;
      await seeChat.mutateAsync(newValue);
      const messages_ = await ApiService.get<IMessage[]>(
        `/chats/${newValue}/messages`
      );

      messages[newValue] = messages_;

      if (messages_.length > 0) {
        chatCursors[newValue] = messages_[messages_.length - 1].id;
      }

      currIsLoading[newValue] = false;
    },
    { immediate: true }
  );

  onBeforeUnmount(() => {
    socket.value?.disconnect();
    socket.value = null;
  });

  const hasAnyUnreadMessages = computed(() => {
    return Object.values(hasUnreadMessagesPerChat.value).some((v) => v);
  });

  return {
    chatSocket: socket,
    hasUnreadMessagesPerChat,
    hasAnyUnreadMessages,
    isCurrChatLoadingMore,
    isCurrChatLoading,
    deleteMessage,
    messages,
    messagesFromCurrChat,
    sendMessage,
    sidebarOpen,
    currChatId,
    loadMore,
  };
});
