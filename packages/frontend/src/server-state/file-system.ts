import ApiService from "@/core/services/ApiService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { toValue, type MaybeRefOrGetter, computed } from "vue";
import type { FileSystemController } from "@aula-anclademia/backend/src/file-system/file-system.controller";

type FolderContentResponse = Awaited<
  ReturnType<InstanceType<typeof FileSystemController>["getFolderContent"]>
>;

export const useFileSystem = (folderId: MaybeRefOrGetter<string | null>) => {
  return useQuery({
    queryKey: ["file-system", folderId],
    queryFn: async () => {
      return (await ApiService.get(
        `/file-system/folders/${toValue(folderId)}`
      )) as FolderContentResponse;
    },
    enabled: computed(() => !!toValue(folderId)),
  });
};

export const useCreateFolder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      folder: Pick<FolderContentResponse, "name" | "parentId">
    ) => {
      await ApiService.post(
        "/file-system/folders/" + folder.parentId + "/folders",
        {
          name: folder.name,
        }
      );
    },
    mutationKey: ["createFolder"],
    onSuccess: () => {
      queryClient.invalidateQueries(["file-system"]);
    },
  });
};

export const useCreateFile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      file,
      folderId,
      name,
    }: {
      file: File;
      folderId: string;
      name: string;
    }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", name);
      await ApiService.post(
        "/file-system/folders/" + folderId + "/files",
        formData
      );
    },
    mutationKey: ["createFile"],
    onSuccess: () => {
      queryClient.invalidateQueries(["file-system"]);
    },
  });
};

export const useCreateMultipleFiles = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      files,
      folderId,
    }: {
      files: File[];
      folderId: string;
    }) => {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });
      await ApiService.post(
        "/file-system/folders/" + folderId + "/files/multiple",
        formData
      );
    },
    mutationKey: ["createFiles"],
    onSuccess: () => {
      queryClient.invalidateQueries(["file-system"]);
    },
  });
};

export const useDeleteFile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (fileId: string) => {
      await ApiService.delete(`/file-system/files/${fileId}`);
    },
    mutationKey: ["deleteFile"],
    onSuccess: () => {
      queryClient.invalidateQueries(["file-system"]);
    },
  });
};

export const useDeleteFolder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (folderId: string) => {
      await ApiService.delete(`/file-system/folders/${folderId}`);
    },
    mutationKey: ["deleteFolder"],
    onSuccess: () => {
      queryClient.invalidateQueries(["file-system"]);
    },
  });
};

export const useUpdateFolder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      folderId,
      name,
    }: {
      folderId: string;
      name: string;
    }) => {
      const data = await ApiService.patch(`/file-system/folders/${folderId}`, {
        name,
      });
      return data;
    },
    mutationKey: ["updateFolder"],
    onSuccess: () => {
      queryClient.invalidateQueries(["file-system"]);
    },
  });
};

export const useUpdateFile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ fileId, name }: { fileId: string; name: string }) => {
      const data = await ApiService.patch(`/file-system/files/${fileId}`, {
        name,
      });
      return data;
    },
    mutationKey: ["updateFile"],
    onSuccess: () => {
      queryClient.invalidateQueries(["file-system"]);
    },
  });
};

export const useGenerateFileDownloadUrl = () => {
  return useMutation({
    mutationFn: async (fileId: string) => {
      const data = await ApiService.get(
        `/file-system/files/${fileId}/download`
      );
      return data;
    },
    mutationKey: ["generateFileDownloadUrl"],
  });
};
