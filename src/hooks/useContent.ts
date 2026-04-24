import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";
import type { Chapter, ClassSummary, LessonPlay, Subject, SubjectDetail } from "../types";

type NotesResponse = { url: string; expires_in_seconds: number; title: string; file_size_bytes: number | null };

export function useClasses() {
  return useQuery<ClassSummary[]>({
    queryKey: ["classes"],
    queryFn: () => api.get("/classes").then((r) => r.data),
  });
}

export function useSubjects(classNum: number | null) {
  return useQuery<Subject[]>({
    queryKey: ["subjects", classNum],
    queryFn: () => api.get(`/classes/${classNum}/subjects`).then((r) => r.data),
    enabled: classNum !== null,
  });
}

export function useSubject(id: string | undefined) {
  return useQuery<SubjectDetail>({
    queryKey: ["subject", id],
    queryFn: () => api.get(`/subjects/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useChapter(id: string | undefined) {
  return useQuery<Chapter>({
    queryKey: ["chapter", id],
    queryFn: () => api.get(`/chapters/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useLessonPlay(id: string | undefined) {
  return useQuery<LessonPlay>({
    queryKey: ["lesson", "play", id],
    queryFn: () => api.get(`/lessons/${id}/play`).then((r) => r.data),
    enabled: !!id,
    retry: false,
  });
}

export function useChapterNotes(id: string | undefined) {
  return useQuery<NotesResponse>({
    queryKey: ["chapter", "notes", id],
    queryFn: () => api.get(`/chapters/${id}/notes`).then((r) => r.data),
    enabled: !!id,
    retry: false,
  });
}
