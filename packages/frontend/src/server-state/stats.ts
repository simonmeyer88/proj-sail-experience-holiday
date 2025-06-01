import ApiService from "@/core/services/ApiService";
import { useQuery } from "@tanstack/vue-query";
import type { StatsController } from "./../../../backend/src/stats/stats.controller";

export type StatsTeacherResponse = Awaited<
  ReturnType<StatsController["getStatsTeacher"]>
>;

export type StatsAdminResponse = Awaited<
  ReturnType<StatsController["getStatsAdmin"]>
>;

export type StatsStudentResponse = Awaited<
  ReturnType<StatsController["getStatsStudent"]>
>;

export const useStudentStats = () => {
  return useQuery({
    queryKey: ["statsStudent"],
    queryFn: async () => {
      return await ApiService.get<StatsStudentResponse>(`/stats/student`);
    },
  });
};

export const useAdminStats = () => {
  return useQuery({
    queryKey: ["statsAdmin"],
    queryFn: async () => {
      return await ApiService.get<StatsAdminResponse>(`/stats/admin`);
    },
  });
};

export const useTeacherStats = () => {
  return useQuery({
    queryKey: ["statsTeacher"],
    queryFn: async () => {
      return await ApiService.get<StatsTeacherResponse>(`/stats/teacher`);
    },
  });
};
