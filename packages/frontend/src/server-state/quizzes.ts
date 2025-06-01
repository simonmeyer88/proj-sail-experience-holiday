import ApiService from "@/core/services/ApiService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";

import { toValue, type MaybeRefOrGetter, MaybeRef, computed } from "vue";
import type { QuizService } from "@aula-anclademia/backend/src/quiz/quiz.service";
import type { CreateQuizDto } from "@aula-anclademia/backend/src/quiz/dto/create-quiz.dto";
import type { QuizController } from "./../../../backend/src/quiz/quiz.controller";
import type { UpdateQuizMetadataDto } from "@aula-anclademia/backend/src/quiz/dto/update-quiz-metadata.dto";

export type QuizzesResponse = Awaited<
  ReturnType<InstanceType<typeof QuizService>["findAll"]>
>;

export type QuizResponse = Awaited<
  ReturnType<InstanceType<typeof QuizService>["findOne"]>
>;

export type RandomQuestionsResponse = Awaited<
  ReturnType<InstanceType<typeof QuizController>["getWithRandomQuestions"]>
>;

type Args =
  | {
      enabled?: MaybeRef<boolean>;
    }
  | undefined;

export const useQuizzes = (
  courseId?: MaybeRefOrGetter<string | null>,
  { enabled: enabled = true }: Args = {}
) => {
  return useQuery({
    enabled,
    queryKey: ["quizzes", courseId],

    queryFn: async () => {
      return (await ApiService.get(
        `/quizzes?courseId=${toValue(courseId)}`
      )) as QuizzesResponse;
    },
  });
};

export const useCreateQuiz = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateQuizDto & { excelFile: File }) => {
      const formData = new FormData();
      formData.append("excelFile", data.excelFile);
      formData.append("name", data.name);
      data.courseIds.forEach((courseId) => {
        formData.append("courseIds[]", courseId);
      });
      await ApiService.post("/quizzes", formData);
    },
    mutationKey: ["postQuiz"],
    onSuccess: () => {
      queryClient.invalidateQueries(["quizzes"]);
    },
    onError: (error) => {
      console.log(error);
    },
  });
};

export const useDeleteQuiz = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await ApiService.delete(`/quizzes/${id}`);
    },
    mutationKey: ["deleteQuiz"],
    onSuccess: () => {
      queryClient.invalidateQueries(["quizzes"]);
    },
    onError: (error) => {
      console.log(error);
    },
  });
};

export const useQuiz = (id: MaybeRef<string | null>) => {
  return useQuery({
    enabled: computed(() => !!toValue(id)),
    queryKey: ["quizzes", id],
    queryFn: async () => {
      if (!id) return null;
      return (await ApiService.get(`/quizzes/${toValue(id)}`)) as QuizResponse;
    },
  });
};

export const useQuizRandomQuestions = (id: MaybeRef<string | null>) => {
  return useQuery({
    enabled: computed(() => !!toValue(id)),
    queryKey: ["quizRandomQuestions", id],
    refetchOnWindowFocus: false,
    refetchInterval: false,
    staleTime: Infinity,
    cacheTime: Infinity,
    queryFn: async () => {
      if (!id) return null;
      return (await ApiService.get(
        `/quizzes/${toValue(id)}/random-questions`
      )) as QuizResponse;
    },
  });
};

export const useUpdateQuizMetadata = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateQuizMetadataDto & { id: string }) => {
      const { id, ...rest } = data;
      await ApiService.patch(`/quizzes/${id}/metadata`, rest);
    },
    mutationKey: ["updateQuizMetadata"],
    onSuccess: () => {
      queryClient.invalidateQueries(["quizzes"]);
    },
  });
};

type UpdateQuestionArgs = {
  id: string;
  newCorrectAnswerId: string;
};

export const useUpdateQuizQuestions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      quizId: string;
      questions: UpdateQuestionArgs[];
    }) => {
      const { quizId, questions } = data;
      await ApiService.patch(`/quizzes/${quizId}/questions`, {
        questions,
      });
    },
    mutationKey: ["updateQuizQuestions"],
    onSuccess: () => {
      queryClient.invalidateQueries(["quizzes"]);
    },
  });
};
