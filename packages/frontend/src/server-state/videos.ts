import ApiService from "../core/services/ApiService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { computed, toValue } from "vue";
import type { MaybeRef, MaybeRefOrGetter } from "vue";
import type { VideosController } from "@aula-anclademia/backend/src/videos/videos.controller";
import type {
  UpdateVideoDto,
  CreateVideoDto,
} from "@aula-anclademia/backend/src/videos/dto";
import { useMe } from "./me";

export type VideosFindAllResponse = Awaited<
  ReturnType<InstanceType<typeof VideosController>["findAll"]>
>;

export const useVideosManagement = (
  courseId: MaybeRefOrGetter<string | null>,
  { enabled: enabled = true }: { enabled?: MaybeRef<boolean> } = {}
) => {
  return useQuery({
    queryKey: ["videos", courseId],
    queryFn: async () => {
      return await ApiService.get<VideosFindAllResponse>(
        "/videos" + (toValue(courseId) ? `?courseId=${toValue(courseId)}` : "")
      );
    },
    enabled: enabled,
  });
};

export const useVideosStudent = ({
  enabled: enabled = true,
}: { enabled?: MaybeRef<boolean> } = {}) => {
  const me = useMe();
  const courseId = computed(() => me.data.value?.courseId);

  return useQuery({
    queryKey: ["videos", courseId],
    queryFn: async () => {
      if (!courseId.value) {
        return [];
      }
      return await ApiService.get<VideosFindAllResponse>(
        `videos?courseId=${courseId.value}`
      );
    },
    enabled: enabled,
  });
};

export const useCreateVideo = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async (video: CreateVideoDto) => {
      await ApiService.post(`/videos`, video);
    },
    {
      mutationKey: ["createVideo"],
      onSuccess: () => {
        queryClient.invalidateQueries(["videos"]);
      },
    }
  );
};

export const useDeleteVideo = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async (videoId: string) => {
      await ApiService.delete(`/videos/${videoId}`);
    },
    {
      mutationKey: ["deleteVideo"],
      onSuccess: () => {
        queryClient.invalidateQueries(["videos"]);
      },
    }
  );
};

export const useUpdateVideo = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async ({ id, ...video }: UpdateVideoDto & { id: string }) => {
      await ApiService.patch(`/videos/${id}`, video);
    },
    {
      mutationKey: ["updateVideo"],
      onSuccess: () => {
        queryClient.invalidateQueries(["videos"]);
      },
    }
  );
};
