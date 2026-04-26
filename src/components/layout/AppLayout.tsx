import { useNavigate, Outlet } from "react-router-dom";
import { useState } from "react";
import { RazorpayCheckout } from "../payments/RazorpayCheckout";
import { Modal } from "../ui/Modal";
import { usePlans } from "../../hooks/useSubscription";
import { useUIStore } from "../../store/uiStore";
import type { Plan } from "../../types";
import { BottomNav } from "./BottomNav";

function PricingModal() {
  const navigate = useNavigate();
  const { pricingModalOpen, closePricing } = useUIStore();
  const { data: plans } = usePlans();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  function handleSuccess() {
    setSelectedPlan(null);
    closePricing();
    navigate("/app/dashboard");
  }

  return (
    <>
      <Modal open={pricingModalOpen && !selectedPlan} onClose={closePricing} title="Upgrade to Premium">
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {(plans ?? [])
            .filter((p) => p.billing_cycle === "monthly")
            .map((plan) => (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan)}
                className={`w-full text-left rounded-2xl border-2 p-3 transition-all active:scale-[0.98] ${
                  plan.is_featured ? "border-teal bg-teal/5" : "border-ink/8"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-body font-semibold text-sm text-ink">{plan.name}</p>
                    <p className="font-body text-xs text-ink-3 mt-0.5">
                      {plan.features[0]}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display font-bold text-teal text-base">
                      ₹{(plan.price_paise / 100).toLocaleString("en-IN")}
                    </p>
                    <p className="font-body text-[10px] text-ink-3">/month</p>
                  </div>
                </div>
              </button>
            ))}
          <button
            onClick={() => { closePricing(); navigate("/app/pricing"); }}
            className="w-full font-body text-xs text-teal text-center py-1"
          >
            See all plans →
          </button>
        </div>
      </Modal>

      <Modal
        open={!!selectedPlan}
        onClose={() => setSelectedPlan(null)}
        title="Complete Payment"
      >
        {selectedPlan && (
          <RazorpayCheckout
            plan={selectedPlan}
            onSuccess={handleSuccess}
            onDismiss={() => setSelectedPlan(null)}
          />
        )}
      </Modal>
    </>
  );
}

export function AppLayout() {
  return (
    <div className="min-h-screen bg-bg flex justify-center">
      <div className="relative w-full max-w-[430px] min-h-screen bg-bg">
        <main className="pb-20">
          <Outlet />
        </main>
        <BottomNav />
        <PricingModal />
      </div>
    </div>
  );
}
