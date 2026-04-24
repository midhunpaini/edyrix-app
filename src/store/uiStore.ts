import { create } from "zustand";

interface UIState {
  pricingModalOpen: boolean;
  pricingTriggerSubjectId: string | null;
  openPricing: (subjectId?: string) => void;
  closePricing: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  pricingModalOpen: false,
  pricingTriggerSubjectId: null,
  openPricing: (subjectId) =>
    set({ pricingModalOpen: true, pricingTriggerSubjectId: subjectId ?? null }),
  closePricing: () =>
    set({ pricingModalOpen: false, pricingTriggerSubjectId: null }),
}));
