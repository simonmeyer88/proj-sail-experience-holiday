import ApiService from "@/core/services/ApiService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";

import type { UsersController } from "@aula-anclademia/backend/src/users/users.controller";
import type { UpdateUserDto } from "@aula-anclademia/backend/src/users/dto/update-user.dto";
import { MaybeRef, computed } from "vue";
import { toValue } from "vue";
import type { PasswordTokenReqDto } from "@aula-anclademia/backend/src/auth/dto/password-token-req.dto";
import type { ResetPasswordDto } from "@aula-anclademia/backend/src/auth/dto/reset-password.dto";

export type UsersFindAllResponse = Awaited<
  ReturnType<InstanceType<typeof UsersController>["getAllUsers"]>
>;

export type UsersFindOneResponse = Awaited<
  ReturnType<InstanceType<typeof UsersController>["getUser"]>
>;

export type UsersBasicInfoResponse = Awaited<
  ReturnType<InstanceType<typeof UsersController>["getBasicInfo"]>
>;

export interface UserPresencePayload {
  isPresent: boolean;
  eventId: string;
  userId: string;
}

export const getUsersByEmails = async (emails: string[]) => {
  return (await ApiService.post("/users/find-by-emails", {
    emails,
  })) as UsersFindAllResponse;
};

export const useRequestPasswordToken = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async (data: PasswordTokenReqDto) => {
      const token = await ApiService.post(`auth/forgot-password/request`, data);
      return token;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["users"]);
      },
    }
  );
};

export const useChangeForgottenPassword = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async (data: ResetPasswordDto) => {
      const token = await ApiService.post(`auth/forgot-password/change`, data);
      return token;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["users"]);
      },
    }
  );
};

export const useUpdateUserIsActive = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async (data: { id: string; isActive: boolean }) => {
      const { id, isActive } = data;
      const updatedData = await ApiService.put(`users/${id}/is-active`, {
        isActive,
      });
      return updatedData;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["users"]);
      },
    }
  );
};

export const useUpdateCalendarAccess = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async (data: { id: string; isCalendarEnable: boolean }) => {
      const { id, isCalendarEnable } = data;
      const updatedData = await ApiService.put(`users/${id}/calendar-access`, {
        isCalendarEnable,
      });
      return updatedData;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["users"]);
      },
    }
  );
};

export const useUsers = (
  filters: {
    roles?: MaybeRef<string[] | undefined | null>;
    search?: MaybeRef<string | undefined | null>;
    pendingTaskId?: MaybeRef<string | undefined | null>;
    courseId?: MaybeRef<string | undefined | null>;
    createdAt?: MaybeRef<"asc" | "desc" | null>;
  } = {},
  {
    enabled = true,
    keepPreviousData = false,
  }: {
    enabled?: boolean;
    keepPreviousData?: boolean;
  } = {}
) => {
  return useQuery(
    [
      "users",
      filters.roles,
      filters.search,
      filters.pendingTaskId,
      filters.courseId,
      filters.createdAt,
    ],
    async () => {
      const users = (await ApiService.get("users", {
        roles: toValue(filters.roles),
        pendingTaskId: toValue(filters.pendingTaskId),
        search: toValue(filters.search),
        courseId: toValue(filters.courseId),
        createdAt: toValue(filters.createdAt),
      })) as UsersFindAllResponse;
      return users;
    },
    { enabled, keepPreviousData }
  );
};

export const useUsersBasicInfo = () => {
  return useQuery(
    ["users", "basic-info"],
    async () => {
      const users = (await ApiService.get(
        "users/basic-info"
      )) as UsersBasicInfoResponse;
      return users;
    },
    { enabled: true }
  );
};

export const useUser = (
  id: MaybeRef<string | null>,
  {
    keepPreviousData,
  }: {
    keepPreviousData?: boolean;
  } = {
    keepPreviousData: false,
  }
) => {
  return useQuery(
    ["users", id],
    async () => {
      const user = (await ApiService.get(
        `users/${toValue(id)}`
      )) as UsersFindOneResponse;
      return user;
    },
    {
      enabled: computed(() => !!toValue(id)),
      keepPreviousData,
    }
  );
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async (id: string) => {
      const updatedData = await ApiService.delete(`users/${id}`);
      return updatedData;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["users"]);
      },
    }
  );
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async (
      data: UpdateUserDto & {
        id: string;
      }
    ) => {
      const { id, ...requestData } = data;
      const updatedData = await ApiService.put(`users/${id}`, requestData);
      return updatedData;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["users"]);
      },
    }
  );
};

export const useAcceptUser = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async (id: string) => {
      const updatedData = await ApiService.put(`users/${id}/accept`, {});
      return updatedData;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["users"]);
      },
    }
  );
};

export const useUpdateUserPresence = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, userId, isPresent }: UserPresencePayload) => {
      await ApiService.put(
        `/users-on-events/${eventId}/${userId}/mark-presence`,
        {
          isPresent,
        }
      );
    },
    mutationKey: ["updatePresence"],
    onSuccess: () => {
      queryClient.invalidateQueries(["events"]);
    },
  });
};
