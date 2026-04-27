import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";
import type { SubjectTrajectory } from "../types";

export function useTrajectory(subjectId: string | undefined) {
  return useQuery<SubjectTrajectory>({
    queryKey: ["trajectory", subjectId],
    queryFn: () => api.get(`/progress/trajectory/${subjectId}`).then((r) => r.data),
    enabled: !!subjectId,
  });
}

export function useAllTrajectories() {
  return useQuery<SubjectTrajectory[]>({
    queryKey: ["trajectory", "all"],
    queryFn: () => api.get("/progress/trajectory").then((r) => r.data),
  });
}
