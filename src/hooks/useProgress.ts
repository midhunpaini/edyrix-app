import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";

interface ProgressSummary {
  overall_percentage: number;
  subjects: {
    subject_id: string;
    name: string;
    chapters_completed: number;
    chapters_total: number;
    percentage: number;
  }[];
}

interface ChapterProgress {
  chapter_id: string;
  lessons_completed: number;
  lessons_total: number;
  percentage: number;
  lessons: { lesson_id: string; watch_percentage: number; is_completed: boolean }[];
}

export function useProgressSummary() {
  return useQuery<ProgressSummary>({
    queryKey: ["progress", "summary"],
    queryFn: () => api.get("/progress/summary").then((r) => r.data),
  });
}

export function useChapterProgress(chapterId: string | undefined) {
  return useQuery<ChapterProgress>({
    queryKey: ["progress", "chapter", chapterId],
    queryFn: () => api.get(`/progress/chapter/${chapterId}`).then((r) => r.data),
    enabled: !!chapterId,
  });
}

export function useWatchProgress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { lesson_id: string; percentage: number }) =>
      api.post<{ is_completed: boolean }>("/progress/watch", vars).then((r) => r.data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["progress"] });
      qc.invalidateQueries({ queryKey: ["lesson", "play", vars.lesson_id] });
    },
  });
}
