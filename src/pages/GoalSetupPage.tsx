import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useGoal, useUpdateGoal } from "../hooks/useGoals";
import { useUpdateMe } from "../hooks/useAuth";
import { Button } from "../components/ui/Button";
import { PageHeader } from "../components/layout/PageHeader";

const DAILY_OPTIONS = [15, 30, 45, 60];
const SCORE_OPTIONS = [50, 60, 70, 80, 90];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function GoalSetupPage() {
  const navigate = useNavigate();
  const { data: existing } = useGoal();
  const updateGoal = useUpdateGoal();
  const updateMe = useUpdateMe();
  const [saveState, setSaveState] = useState<"idle" | "success">("idle");

  const currentYear = new Date().getFullYear();
  const yearOptions = useMemo(() => [currentYear, currentYear + 1, currentYear + 2], [currentYear]);

  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [dailyMinutes, setDailyMinutes] = useState(30);
  const [targetScore, setTargetScore] = useState(70);

  useEffect(() => {
    if (!existing) return;
    setDailyMinutes(existing.daily_minutes ?? 30);
    setTargetScore(existing.target_score ?? 70);
    if (existing.exam_date) {
      const dt = new Date(existing.exam_date);
      if (!Number.isNaN(dt.getTime())) {
        setSelectedMonth(dt.getMonth() + 1);
        setSelectedYear(dt.getFullYear());
      }
    }
  }, [existing]);

  const examDate =
    selectedMonth && selectedYear
      ? `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-01`
      : null;

  function handleSave() {
    updateGoal.mutate(
      {
        exam_date: examDate,
        daily_minutes: dailyMinutes,
        target_score: targetScore,
      },
      {
        onSuccess: () => {
          updateMe.mutate({ exam_date: examDate });
          setSaveState("success");
          toast.success("Goal saved");
          window.setTimeout(() => setSaveState("idle"), 1400);
        },
        onError: () => toast.error("Could not save goal. Try again."),
      }
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <PageHeader
        variant="plain"
        title="Study goal"
        subtitle="Set your targets"
        onBack={() => navigate(-1)}
        backLabel="Profile"
      />

      <div className="px-4 py-5 space-y-6 max-w-[430px] mx-auto">
        <section>
          <p className="font-body text-sm font-semibold text-ink mb-2">Exam month</p>
          <div className="flex flex-wrap gap-2">
            {MONTHS.map((month, index) => (
              <button
                key={month}
                type="button"
                onClick={() => setSelectedMonth(index + 1)}
                className={
                  selectedMonth === index + 1
                    ? "px-3 py-2 rounded-lg bg-teal text-white text-xs font-body font-semibold"
                    : "px-3 py-2 rounded-lg bg-white border border-ink/10 text-xs font-body font-semibold text-ink-3"
                }
              >
                {month}
              </button>
            ))}
          </div>
        </section>

        <section>
          <p className="font-body text-sm font-semibold text-ink mb-2">Exam year</p>
          <div className="flex gap-2">
            {yearOptions.map((year) => (
              <button
                key={year}
                type="button"
                onClick={() => setSelectedYear(year)}
                className={
                  selectedYear === year
                    ? "px-4 py-2 rounded-lg bg-teal text-white text-sm font-body font-semibold"
                    : "px-4 py-2 rounded-lg bg-white border border-ink/10 text-sm font-body font-semibold text-ink-3"
                }
              >
                {year}
              </button>
            ))}
          </div>
        </section>

        <section>
          <p className="font-body text-sm font-semibold text-ink mb-2">Daily study target</p>
          <div className="flex gap-2 flex-wrap">
            {DAILY_OPTIONS.map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => setDailyMinutes(mins)}
                className={
                  dailyMinutes === mins
                    ? "px-4 py-2.5 rounded-xl border-2 border-teal bg-teal text-white font-body text-sm font-semibold"
                    : "px-4 py-2.5 rounded-xl border-2 border-ink/10 bg-white text-ink font-body text-sm font-semibold"
                }
              >
                {mins} min
              </button>
            ))}
          </div>
        </section>

        <section>
          <p className="font-body text-sm font-semibold text-ink mb-2">Target score</p>
          <div className="flex gap-2 flex-wrap">
            {SCORE_OPTIONS.map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => setTargetScore(pct)}
                className={
                  targetScore === pct
                    ? "px-4 py-2.5 rounded-xl border-2 border-teal bg-teal text-white font-body text-sm font-semibold"
                    : "px-4 py-2.5 rounded-xl border-2 border-ink/10 bg-white text-ink font-body text-sm font-semibold"
                }
              >
                {pct}%+
              </button>
            ))}
          </div>
        </section>

        <Button fullWidth size="lg" loading={updateGoal.isPending} onClick={handleSave}>
          {saveState === "success" ? "Saved" : "Save goal"}
        </Button>
      </div>
    </div>
  );
}
