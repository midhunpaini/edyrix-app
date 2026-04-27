import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useGoal, useUpdateGoal } from "../hooks/useGoals";
import { useUpdateMe } from "../hooks/useAuth";
import { Button } from "../components/ui/Button";
import { Icon } from "../components/ui/Icon";
import { Icons } from "../lib/icons";

const DAILY_OPTIONS = [15, 30, 45, 60, 90];
const SCORE_OPTIONS = [50, 60, 70, 80, 90];

export function GoalSetupPage() {
  const navigate = useNavigate();
  const { data: existing } = useGoal();
  const updateGoal = useUpdateGoal();
  const updateMe = useUpdateMe();

  const [examDate, setExamDate] = useState(existing?.exam_date ?? "");
  const [dailyMinutes, setDailyMinutes] = useState(existing?.daily_minutes ?? 30);
  const [targetScore, setTargetScore] = useState(existing?.target_score ?? 70);

  function handleSave() {
    updateGoal.mutate(
      {
        exam_date: examDate || null,
        daily_minutes: dailyMinutes,
        target_score: targetScore,
      },
      {
        onSuccess: () => {
          if (examDate) {
            updateMe.mutate({ exam_date: examDate });
          }
          toast.success("Goal saved!");
          navigate(-1);
        },
        onError: () => toast.error("Could not save goal. Try again."),
      }
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="flex items-center gap-3 px-4 pt-12 pb-3 bg-white border-b border-ink/5">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center justify-center min-w-[44px] min-h-[44px] rounded-xl hover:bg-bg"
          aria-label="Go back"
        >
          <Icon name={Icons.back} size={20} className="text-ink" aria-hidden />
        </button>
        <h1 className="font-display font-bold text-base text-ink">Study Goal</h1>
      </div>

      <div className="px-4 py-5 space-y-6 max-w-[430px] mx-auto">
        {/* Exam date */}
        <div>
          <label className="font-body text-xs font-semibold text-ink-3 uppercase tracking-wide mb-2 block">
            Exam Date (optional)
          </label>
          <input
            type="date"
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
            className="w-full h-12 px-4 rounded-2xl border border-ink/10 bg-white font-body text-sm text-ink focus:outline-none focus:border-teal"
          />
          <p className="font-body text-xs text-ink-3 mt-1.5">
            We'll show a countdown on your dashboard.
          </p>
        </div>

        {/* Daily study target */}
        <div>
          <p className="font-body text-xs font-semibold text-ink-3 uppercase tracking-wide mb-2">
            Daily Study Target
          </p>
          <div className="flex gap-2 flex-wrap">
            {DAILY_OPTIONS.map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => setDailyMinutes(mins)}
                className={`px-4 py-2.5 rounded-xl border-2 font-body text-sm font-semibold transition-all ${
                  dailyMinutes === mins
                    ? "border-teal bg-teal text-white"
                    : "border-ink/10 bg-white text-ink hover:border-teal/30"
                }`}
              >
                {mins} min
              </button>
            ))}
          </div>
        </div>

        {/* Target score */}
        <div>
          <p className="font-body text-xs font-semibold text-ink-3 uppercase tracking-wide mb-2">
            Target Score
          </p>
          <div className="flex gap-2 flex-wrap">
            {SCORE_OPTIONS.map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => setTargetScore(pct)}
                className={`px-4 py-2.5 rounded-xl border-2 font-body text-sm font-semibold transition-all ${
                  targetScore === pct
                    ? "border-teal bg-teal text-white"
                    : "border-ink/10 bg-white text-ink hover:border-teal/30"
                }`}
              >
                {pct}%+
              </button>
            ))}
          </div>
        </div>

        <Button
          fullWidth
          size="lg"
          loading={updateGoal.isPending}
          onClick={handleSave}
        >
          Save Goal
        </Button>
      </div>
    </div>
  );
}
