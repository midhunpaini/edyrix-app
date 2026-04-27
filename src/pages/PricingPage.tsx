import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RazorpayCheckout } from "../components/payments/RazorpayCheckout";
import { Icon } from "../components/ui/Icon";
import { Icons } from "../lib/icons";
import { Modal } from "../components/ui/Modal";
import { Skeleton } from "../components/ui/Skeleton";
import { usePlans, useSubscription } from "../hooks/useSubscription";
import type { Plan } from "../types";

type CycleFilter = "monthly" | "yearly" | "one_time";

const CYCLE_LABELS: Record<CycleFilter, string> = {
  monthly: "Monthly",
  yearly: "Annual",
  one_time: "Lifetime",
};

function PlanCard({
  plan,
  onSubscribe,
}: {
  plan: Plan;
  onSubscribe: (plan: Plan) => void;
}) {
  const discount =
    plan.original_price_paise && plan.original_price_paise > plan.price_paise
      ? Math.round(
          ((plan.original_price_paise - plan.price_paise) / plan.original_price_paise) * 100
        )
      : null;

  const price = (plan.price_paise / 100).toLocaleString("en-IN");
  const originalPrice = plan.original_price_paise
    ? (plan.original_price_paise / 100).toLocaleString("en-IN")
    : null;

  return (
    <div
      className={`relative rounded-2xl border-2 p-4 bg-white transition-all ${
        plan.is_featured
          ? "border-teal shadow-lg shadow-teal/10"
          : "border-ink/8 shadow-sm"
      }`}
    >
      {plan.is_featured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal text-white text-[11px] font-body font-bold px-3 py-0.5 rounded-full flex items-center gap-1">
          <Icon name={Icons.sparkle} size={12} aria-hidden />
          Most Popular
        </div>
      )}

      {discount && (
        <div className="absolute top-3 right-3 bg-amber text-ink text-[11px] font-body font-bold px-2 py-0.5 rounded-full">
          {discount}% off
        </div>
      )}

      <div className="mb-3">
        <p className="font-display font-bold text-ink text-base pr-12">{plan.name}</p>
        {plan.description && (
          <p className="font-body text-xs text-ink-3 mt-0.5">{plan.description}</p>
        )}
      </div>

      <div className="flex items-baseline gap-1.5 mb-4">
        <span className="font-display font-bold text-2xl text-teal">₹{price}</span>
        {plan.billing_cycle === "monthly" && (
          <span className="font-body text-xs text-ink-3">/month</span>
        )}
        {plan.billing_cycle === "yearly" && (
          <span className="font-body text-xs text-ink-3">/year</span>
        )}
        {originalPrice && (
          <span className="font-body text-xs text-ink-3 line-through ml-1">₹{originalPrice}</span>
        )}
      </div>

      <ul className="space-y-1.5 mb-4">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 font-body text-xs text-ink">
            <Icon name={Icons.check} size={13} className="text-teal mt-0.5 shrink-0" aria-hidden />
            {f}
          </li>
        ))}
      </ul>

      <button
        onClick={() => onSubscribe(plan)}
        className={`w-full h-11 rounded-xl font-body font-semibold text-sm active:scale-95 transition-all ${
          plan.is_featured
            ? "bg-teal text-white"
            : "border border-teal text-teal bg-white hover:bg-teal/5"
        }`}
      >
        Get Started
      </button>
    </div>
  );
}

export function PricingPage() {
  const navigate = useNavigate();
  const { data: plans, isLoading } = usePlans();
  const { data: subData } = useSubscription();
  const [cycle, setCycle] = useState<CycleFilter>("monthly");
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const activeSub = subData?.subscription;
  const freeTrial = subData?.free_trial;

  const filtered = (plans ?? []).filter((p) => p.billing_cycle === cycle);

  function handleSuccess() {
    setSelectedPlan(null);
    navigate("/app/dashboard");
  }

  return (
    <div className="p-4 pb-8">
      <div className="mb-5">
        <h1 className="font-display text-xl font-bold text-ink">Choose Your Plan</h1>
        <p className="font-body text-sm text-ink-3 mt-1">
          Unlock all Kerala SCERT content for Class 7–10
        </p>
      </div>

      {activeSub && (
        <div className="mb-4 bg-teal/10 border border-teal/20 rounded-2xl p-3 flex items-center gap-2">
          <Icon name={Icons.crown} size={16} className="text-teal shrink-0" aria-hidden />
          <div>
            <p className="font-body text-xs font-semibold text-teal">Active: {activeSub.plan.name}</p>
            {activeSub.expires_at && (
              <p className="font-body text-[11px] text-ink-3">
                Expires {new Date(activeSub.expires_at).toLocaleDateString("en-IN")}
              </p>
            )}
          </div>
        </div>
      )}

      {freeTrial?.active && !activeSub && (
        <div className="mb-4 bg-amber/10 border border-amber/30 rounded-2xl p-3">
          <p className="font-body text-xs font-semibold text-amber-700">
            Free trial active — subscribe before it ends to keep your access
          </p>
        </div>
      )}

      <div className="flex gap-1 bg-ink/5 rounded-xl p-1 mb-5">
        {(Object.keys(CYCLE_LABELS) as CycleFilter[]).map((c) => (
          <button
            key={c}
            onClick={() => setCycle(c)}
            className={`flex-1 h-8 rounded-lg font-body text-xs font-semibold transition-all ${
              cycle === c ? "bg-white text-teal shadow-sm" : "text-ink-3"
            }`}
          >
            {CYCLE_LABELS[c]}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="font-body text-sm text-ink-3">No plans in this category</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((plan) => (
            <PlanCard key={plan.id} plan={plan} onSubscribe={setSelectedPlan} />
          ))}
        </div>
      )}

      <p className="font-body text-[11px] text-ink-3 text-center mt-6">
        All plans include access to video lessons, chapter tests, PDF notes, and doubt support.
      </p>

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
    </div>
  );
}
