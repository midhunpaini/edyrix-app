import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ConfirmationResult } from "firebase/auth";
import api from "../api/axios";
import { auth, GoogleAuthProvider, signInWithPopup } from "../lib/firebase";
import { useAuthStore } from "../store/authStore";
import type { User, UserStats } from "../types";

interface LoginResponse {
  access_token: string;
  is_new_user: boolean;
  user: User;
}

interface UpdateMeInput {
  name?: string;
  current_class?: number;
  medium?: "english" | "malayalam";
  avatar_url?: string;
}

export function useMe() {
  return useQuery<User>({
    queryKey: ["me"],
    queryFn: () => api.get("/users/me").then((r) => r.data),
  });
}

export function useMeStats() {
  return useQuery<UserStats>({
    queryKey: ["me", "stats"],
    queryFn: () => api.get("/users/me/stats").then((r) => r.data),
  });
}

export function useGoogleLogin() {
  return useMutation<LoginResponse, Error, void>({
    mutationFn: async () => {
      const cred = await signInWithPopup(auth, new GoogleAuthProvider());
      const firebaseToken = await cred.user.getIdToken();
      const { data } = await api.post<LoginResponse>("/auth/google", {
        firebase_token: firebaseToken,
      });
      return data;
    },
    onSuccess: (data) => {
      useAuthStore.getState().setUser(data.user, data.access_token);
    },
  });
}

export function usePhoneVerifyOTP() {
  return useMutation<
    LoginResponse,
    Error,
    { confirmation: ConfirmationResult; otp: string }
  >({
    mutationFn: async ({ confirmation, otp }) => {
      const cred = await confirmation.confirm(otp);
      const firebaseToken = await cred.user.getIdToken();
      const { data } = await api.post<LoginResponse>("/auth/phone/verify", {
        firebase_token: firebaseToken,
      });
      return data;
    },
    onSuccess: (data) => {
      useAuthStore.getState().setUser(data.user, data.access_token);
    },
  });
}

export function useDevLogin() {
  return useMutation<LoginResponse, Error, string>({
    mutationFn: (email) =>
      api.post<LoginResponse>("/auth/dev-login", { email }).then((r) => r.data),
    onSuccess: (data) => {
      useAuthStore.getState().setUser(data.user, data.access_token);
    },
  });
}

export function useUpdateMe() {
  const qc = useQueryClient();
  return useMutation<User, Error, UpdateMeInput>({
    mutationFn: (input) => api.put<User>("/users/me", input).then((r) => r.data),
    onSuccess: (data) => {
      qc.setQueryData(["me"], data);
      useAuthStore.getState().updateUser(data);
    },
  });
}
