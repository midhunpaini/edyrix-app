import { useState } from "react";
import { toast } from "sonner";
import { useCreateOrder, useVerifyPayment } from "../../hooks/useSubscription";
import { useAuthStore } from "../../store/authStore";
import type { Plan } from "../../types";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

interface RazorpayCheckoutProps {
  plan: Plan;
  onSuccess: () => void;
  onDismiss: () => void;
}

async function loadRazorpayScript(): Promise<void> {
  if (window.Razorpay) return;
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay"));
    document.body.appendChild(script);
  });
}

export function RazorpayCheckout({ plan, onSuccess, onDismiss }: RazorpayCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const user = useAuthStore((s) => s.user);
  const createOrder = useCreateOrder();
  const verifyPayment = useVerifyPayment();

  async function handleCheckout() {
    setLoading(true);
    try {
      const order = await createOrder.mutateAsync(plan.id);
      await loadRazorpayScript();

      const rzp = new window.Razorpay({
        key: order.razorpay_key_id,
        amount: order.amount,
        currency: order.currency,
        order_id: order.order_id,
        name: "Edyrix",
        description: plan.name,
        image: "https://edyrix.in/logo.png",
        prefill: {
          name: user?.name ?? "",
          contact: user?.phone ?? "",
          email: user?.email ?? "",
        },
        theme: { color: "#0D6E6E" },
        modal: {
          ondismiss: () => {
            setLoading(false);
            onDismiss();
          },
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            await verifyPayment.mutateAsync({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success("Subscription activated!");
            onSuccess();
          } catch {
            toast.error("Payment verification failed. Contact support.");
          } finally {
            setLoading(false);
          }
        },
      });

      rzp.open();
    } catch {
      toast.error("Could not initiate payment. Try again.");
      setLoading(false);
    }
  }

  const price = (plan.price_paise / 100).toLocaleString("en-IN");
  const originalPrice = plan.original_price_paise
    ? (plan.original_price_paise / 100).toLocaleString("en-IN")
    : null;

  return (
    <div className="space-y-4">
      <div className="bg-teal/5 rounded-2xl p-4 text-center">
        <p className="font-display font-bold text-ink text-lg">{plan.name}</p>
        <div className="flex items-baseline justify-center gap-2 mt-1">
          <span className="font-display font-bold text-3xl text-teal">₹{price}</span>
          {plan.billing_cycle === "monthly" && (
            <span className="font-body text-sm text-ink-3">/month</span>
          )}
          {plan.billing_cycle === "yearly" && (
            <span className="font-body text-sm text-ink-3">/year</span>
          )}
        </div>
        {originalPrice && (
          <p className="font-body text-xs text-ink-3 line-through mt-0.5">₹{originalPrice}</p>
        )}
      </div>

      <ul className="space-y-2">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 font-body text-sm text-ink">
            <span className="text-teal mt-0.5 shrink-0">✓</span>
            {f}
          </li>
        ))}
      </ul>

      <button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full h-12 rounded-xl bg-teal text-white font-body font-semibold text-sm active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {loading && (
          <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
        )}
        {loading ? "Processing..." : `Pay ₹${price}`}
      </button>

      <p className="font-body text-[11px] text-ink-3 text-center">
        Secured by Razorpay · UPI, Cards, Wallets accepted
      </p>
    </div>
  );
}
