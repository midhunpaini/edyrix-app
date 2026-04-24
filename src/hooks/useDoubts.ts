import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import type { Doubt } from "../types";

export function useDoubts() {
  return useQuery<Doubt[]>({
    queryKey: ["doubts"],
    queryFn: () => api.get("/doubts").then((r) => r.data),
  });
}

export function useSubmitDoubt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { chapter_id?: string; lesson_id?: string; question_text: string }) =>
      api.post<{ id: string; status: string }>("/doubts", vars).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["doubts"] });
    },
  });
}
