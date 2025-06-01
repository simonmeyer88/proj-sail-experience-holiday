import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { MaybeRef, computed, toValue } from "vue";

import type { ChatController } from "@aula-anclademia/backend/src/chat/chat.controller";

import ApiService from "@/core/services/ApiService";

type ChatMemberResponse = Awaited<
  ReturnType<InstanceType<typeof ChatController>["getMembers"]>
>;

type ChatResponse = Awaited<
  ReturnType<InstanceType<typeof ChatController>["findAll"]>
>;

export const useMyChats = () => {
  return useQuery({
    queryKey: ["chats", "me"],
    queryFn: async () => {
      return await ApiService.get<ChatResponse>("/chats");
    },
  });
};

export const useChatMembers = (chatId: MaybeRef<string | null>) => {
  return useQuery({
    enabled: computed(() => !!toValue(chatId)),
    queryKey: ["chats", chatId],
    queryFn: async () =>
      (await ApiService.get(
        `/chats/${toValue(chatId)}/members`
      )) as ChatMemberResponse,
  });
};

export const useAddChatMembers = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async ({ chatId, memberIds }: { chatId: string; memberIds: string[] }) => {
      return await ApiService.post(`/chats/${chatId}/members`, {
        memberIds,
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["chats"], { exact: false }, {});
      },
    }
  );
};

export const useDeleteChat = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async (chatId: string) => {
      return await ApiService.delete(`/chats/${chatId}`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["chats"], { exact: false }, {});
      },
    }
  );
};

export const useRemoveChatMembers = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async ({ chatId, memberIds }: { chatId: string; memberIds: string[] }) => {
      return await ApiService.delete(`/chats/${chatId}/members`, {
        data: {
          memberIds,
        },
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["chats"], { exact: false }, {});
      },
    }
  );
};

export const useCreateChat = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async (data: { name: string; image: File; userIds?: string[] }) => {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("image", data.image);
      if (data.userIds) {
        formData.append("userIds", JSON.stringify(data.userIds));
      }
      return await ApiService.post<{ id: string }>(`/chats/groups`, formData);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["chats", "me"]);
      },
    }
  );
};
export const useCreatePrivateChat = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async (data: { userId: string }) => {
      return await ApiService.post(`/chats/private`, data);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["chats", "me"]);
      },
    }
  );
};

export const useSeeChat = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async (chatId: string) => {
      await ApiService.post(`/chats/${chatId}/see`, {});
    },
    {
      onMutate: (chatId) => {
        const currentChats =
          queryClient.getQueryData<ChatResponse>(["chats", "me"]) || [];

        const ahead = new Date();
        ahead.setSeconds(ahead.getSeconds() + 1);
        // Optimistic update
        queryClient.setQueryData<ChatResponse>(
          ["chats", "me"],
          [...currentChats].map((chat) => {
            if (chat.id === chatId) {
              return {
                ...chat,
                lastSeenAt: ahead,
              };
            }
            return chat;
          })
        );
      },

      onSettled: () => {
        queryClient.invalidateQueries(["chats", "me"]);
      },
    }
  );
};
