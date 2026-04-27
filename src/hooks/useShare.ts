import { useMutation, useQuery } from "@tanstack/react-query";
import api from "../api/axios";
import type { ShareText } from "../types";

export function useShareText(attemptId: string | undefined) {
  return useQuery<ShareText>({
    queryKey: ["share-text", attemptId],
    queryFn: () => api.get(`/tests/${attemptId}/share-text`).then((r) => r.data),
    enabled: !!attemptId,
    staleTime: Infinity,
  });
}

export function useRecordShare() {
  return useMutation({
    mutationFn: (body: { event_type: string; reference_id?: string; platform?: string }) =>
      api.post("/share", body).then((r) => r.data),
  });
}
