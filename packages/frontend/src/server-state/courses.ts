import type { MaybeRef } from "vue";
import ApiService from "../core/services/ApiService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";

import type { CoursesController } from "@aula-anclademia/backend/src/courses/courses.controller";
import type { CreateCourseDto } from "@aula-anclademia/backend/src/courses/dto/create-course.dto";
import type { UpdateCourseDto } from "@aula-anclademia/backend/src/courses/dto/update-course.dto";

type CoursesFindAllResponse = Awaited<
  ReturnType<InstanceType<typeof CoursesController>["findAll"]>
>;

type CourseStudentCountResponse = Awaited<
  ReturnType<InstanceType<typeof CoursesController>["getStudentCounts"]>
>;

type Args =
  | {
      enabled?: MaybeRef<boolean>;
    }
  | undefined;

export const useCourses = ({ enabled: enabled = true }: Args = {}) => {
  return useQuery({
    queryKey: ["courses"],
    enabled: enabled,
    queryFn: async () =>
      await ApiService.get<CoursesFindAllResponse>("/courses"),
  });
};

export const useCoursesStudentCounts = () => {
  return useQuery({
    queryKey: ["courses", "student-counts"],
    queryFn: async () =>
      (await ApiService.get(
        "/courses/student-counts"
      )) as CourseStudentCountResponse,
  });
};

export const useCreateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["createCourse"],
    onSuccess: () => {
      queryClient.invalidateQueries(["courses"]);
    },
    mutationFn: async (course: CreateCourseDto) =>
      await ApiService.post("/courses", course),
  });
};

export const useDeleteCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["deleteCourse"],
    onSuccess: () => {
      // invalidate every query
      queryClient.invalidateQueries();
    },
    mutationFn: async (id: string) => await ApiService.delete(`/courses/${id}`),
  });
};

export const useUpdateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["updateCourse"],
    onSuccess: () => {
      queryClient.invalidateQueries(["courses"]);
    },
    mutationFn: async (course: UpdateCourseDto & { id: string }) =>
      await ApiService.patch(`/courses/${course.id}`, {
        name: course.name,
      }),
  });
};
