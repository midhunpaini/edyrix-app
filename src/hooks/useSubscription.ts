import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import type { Plan, SubscriptionStatus } from "../types";

interface CreateOrderResponse {
  order_id: string;
  amount: number;
  currency: string;
  razorpay_key_id: string;
}

interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export function useSubscription() {
  return useQuery<SubscriptionStatus>({
    queryKey: ["subscription"],
    queryFn: () => api.get("/subscriptions/my").then((r) => r.data),
  });
}

export function usePlans() {
  return useQuery<Plan[]>({
    queryKey: ["plans"],
    queryFn: () => api.get("/plans").then((r) => r.data),
  });
}

export function usePlan(id: string | undefined) {
  return useQuery<Plan>({
    queryKey: ["plan", id],
    queryFn: () => api.get(`/plans/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreateOrder() {
  return useMutation({
    mutationFn: (planId: string) =>
      api.post<CreateOrderResponse>("/payments/create-order", { plan_id: planId }).then((r) => r.data),
  });
}

export function useVerifyPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: VerifyPaymentRequest) =>
      api.post("/payments/verify", data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subscription"] });
    },
  });
}

export function useHasAccess(subjectId: string | undefined, _classNum?: number): boolean {
  const { data } = useSubscription();
  if (!data || !subjectId) return false;

  const { subscription, free_trial } = data;

  if (free_trial.active) return true;
  if (!subscription || subscription.status !== "active") return false;

  const { plan } = subscription;
  if (plan.plan_type === "full_access") return true;
  if (["complete", "seasonal"].includes(plan.plan_type)) return true;
  return false;
}
