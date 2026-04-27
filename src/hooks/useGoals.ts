import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import type { UserGoal } from "../types";

export function useGoal() {
  return useQuery<UserGoal>({
    queryKey: ["goals", "me"],
    queryFn: () => api.get("/goals/me").then((r) => r.data),
  });
}

export function useUpdateGoal() {
  const qc = useQueryClient();
  return useMutation<
    UserGoal,
    Error,
    { exam_date?: string | null; daily_minutes?: number; target_score?: number }
  >({
    mutationFn: (body) => api.put<UserGoal>("/goals/me", body).then((r) => r.data),
    onSuccess: (data) => {
      qc.setQueryData(["goals", "me"], data);
    },
  });
}
