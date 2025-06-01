import ApiService from "@/core/services/ApiService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";

import type { UsersService } from "@aula-anclademia/backend/src/users/users.service";

import type { ChangeEmailDto } from "@aula-anclademia/backend/src/users/dto/change-email.dto";
import type {
  OnboardStudentDto,
  OnboardTeacherDto,
} from "@aula-anclademia/backend/src/users/dto/onboard-user.dto";
import type { ChangePasswordDto } from "@aula-anclademia/backend/src/users/dto/change-password.dto";
import {
  UpdateManagerProfileDto,
  UpdateStudentProfileDto,
} from "@aula-anclademia/backend/src/users/dto/update-profile.dto";

export type MeResponse = Awaited<
  ReturnType<InstanceType<typeof UsersService>["findOneById"]>
>;

export const useMe = () => {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      return (await ApiService.get("users/me")) as MeResponse;
    },
  });
};

export const useUpdateReceiveEmailsOnNewEvent = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async (data: { receiveEmailsOnNewEvent: boolean }) => {
      const { receiveEmailsOnNewEvent } = data;
      const updatedData = await ApiService.put(`users/me/email-notifications`, {
        receiveEmailsOnNewEvent,
      });
      return updatedData;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["me"]);
      },
    }
  );
};

export type UpdateProfileClientDto = Partial<
  Omit<
    UpdateManagerProfileDto | UpdateStudentProfileDto,
    "birthDate" | "idIssueDate"
  >
> & {
  newImage?: File;
  birthDate?: string;
  idIssueDate?: string;
};
export const useUpdateMeProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["me", "update-profile"],
    mutationFn: async (data: UpdateProfileClientDto) => {
      const formData = new FormData();
      for (const key in data) {
        const element = data[key as keyof typeof data];
        if (element) formData.append(key, element);
      }
      await ApiService.put("users/me/update-profile/", formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["me"]);
    },
  });
};

export const useUpdateMeEmail = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["me", "update-email"],
    mutationFn: async (data: ChangeEmailDto) => {
      await ApiService.put("users/me/email", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["me"]);
    },
  });
};

export const useSendEmailVerificationCode = () => {
  return useMutation({
    mutationKey: ["me", "send-email-verification-code"],
    mutationFn: async (email) => {
      await ApiService.post("auth/email-verification/change-email", {
        email,
      });
    },
  });
};

export const useOnboardMe = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["me", "onboard"],
    mutationFn: async (
      data: (OnboardTeacherDto | OnboardStudentDto) & { profilePic: File }
    ) => {
      const formData = new FormData();
      for (const key in data) {
        const element = data[key as keyof typeof data];
        if (element !== undefined) formData.append(key, element);
      }
      await ApiService.put("users/me/onboard", formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["me"]);
    },
  });
};

export const useChangeMePassword = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["me", "change-password"],
    mutationFn: async (data: ChangePasswordDto) => {
      await ApiService.put("users/me/password", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["me"]);
    },
  });
};
