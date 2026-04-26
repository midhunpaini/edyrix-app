import { differenceInDays } from "date-fns";
import { useHasAccess, useSubscription } from "../../hooks/useSubscription";
import { useUIStore } from "../../store/uiStore";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { Icons } from "../../lib/icons";

interface PremiumLockProps {
  subjectId: string;
  classNumber: number;
  children: React.ReactNode;
}

export function PremiumLock({ subjectId, classNumber, children }: PremiumLockProps) {
  const hasAccess = useHasAccess(subjectId, classNumber);
  const { data } = useSubscription();
  const openPricing = useUIStore((s) => s.openPricing);

  const trial = data?.free_trial;
  const trialDaysLeft =
    trial?.active && trial.expires_at
      ? Math.max(0, differenceInDays(new Date(trial.expires_at), new Date()))
      : 0;

  if (hasAccess) {
    return (
      <div className="relative">
        {children}
        {trial?.active && trialDaysLeft > 0 && (
          <div className="absolute top-2 right-2 bg-amber text-ink text-[10px] font-bold font-body px-2 py-0.5 rounded-full pointer-events-none">
            {trialDaysLeft}d free
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <div className="blur-sm pointer-events-none select-none">{children}</div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-ink/50 rounded-2xl">
        <div className="bg-white rounded-2xl px-5 py-4 mx-4 text-center shadow-xl max-w-[200px]">
          <div className="w-10 h-10 bg-teal/10 rounded-full flex items-center justify-center mx-auto mb-2">
            <Icon name={Icons.lock} size={20} className="text-teal" aria-hidden />
          </div>
          <p className="font-body font-semibold text-ink text-sm mb-1">Premium</p>
          <p className="font-body text-xs text-ink-3 mb-3">Subscribe to unlock</p>
          <Button size="sm" onClick={() => openPricing(subjectId)}>
            Subscribe
          </Button>
        </div>
      </div>
    </div>
  );
}
