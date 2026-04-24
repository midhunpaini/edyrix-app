import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import type { TestDetail, TestResult, TestSummary } from "../types";

interface TestHistoryItem {
  attempt_id: string;
  test_title: string;
  score: number;
  total_marks: number;
  percentage: number;
  completed_at: string;
}

export function useChapterTest(chapterId: string | undefined) {
  return useQuery<TestSummary>({
    queryKey: ["test", "chapter", chapterId],
    queryFn: () => api.get(`/tests/chapter/${chapterId}`).then((r) => r.data),
    enabled: !!chapterId,
    retry: false,
  });
}

export function useTest(id: string | undefined) {
  return useQuery<TestDetail>({
    queryKey: ["test", id],
    queryFn: () => api.get(`/tests/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useSubmitTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { testId: string; answers: Record<string, number>; time_taken_seconds: number }) =>
      api
        .post<TestResult>(`/tests/${vars.testId}/submit`, {
          answers: vars.answers,
          time_taken_seconds: vars.time_taken_seconds,
        })
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["test"] });
    },
  });
}

export function useTestHistory() {
  return useQuery<TestHistoryItem[]>({
    queryKey: ["test", "history"],
    queryFn: () => api.get("/tests/history").then((r) => r.data),
  });
}
