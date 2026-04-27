import { useNavigate } from "react-router-dom";
import { useAvailableTests } from "../../hooks/useTests";
import { Skeleton } from "../../components/ui/Skeleton";
import { Icon } from "../../components/ui/Icon";
import { Icons } from "../../lib/icons";
import type { AvailableTest } from "../../types";

function TestCard({ test, onClick }: { test: AvailableTest; onClick: () => void }) {
  const isLocked = !test.is_unlocked;
  const lastAttempt = test.last_attempt;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-white rounded-2xl border border-ink/5 overflow-hidden shadow-sm active:scale-[0.98] transition-transform ${isLocked ? "opacity-70" : ""}`}
    >
      <div className="flex items-start gap-3 p-4">
        <div className="w-10 h-10 rounded-xl bg-teal/10 flex items-center justify-center flex-shrink-0">
          {isLocked ? (
            <Icon name={Icons.lock} size={18} className="text-teal" aria-hidden />
          ) : lastAttempt ? (
            <Icon name={Icons.complete} size={18} className="text-forest" aria-hidden />
          ) : (
            <Icon name={Icons.quiz} size={18} className="text-teal" aria-hidden />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-body font-semibold text-ink text-sm truncate">{test.title}</p>
          <p className="font-body text-xs text-ink-3 mt-0.5 truncate">
            {test.subject_name} · Chapter {test.chapter_number}
          </p>

          <div className="flex items-center gap-3 mt-2">
            <span className="flex items-center gap-1 font-body text-[11px] text-ink-3">
              <Icon name={Icons.timer} size={11} aria-hidden />
              {test.duration_minutes} min
            </span>
            <span className="font-body text-[11px] text-ink-3">
              {test.question_count} Q
            </span>
            {lastAttempt && (
              <span className={`font-body text-[11px] font-semibold ${lastAttempt.percentage >= 60 ? "text-forest" : "text-rose"}`}>
                Last: {Math.round(lastAttempt.percentage)}%
              </span>
            )}
          </div>
        </div>

        <Icon name={Icons.forward} size={16} className="text-ink-3 flex-shrink-0 mt-1" aria-hidden />
      </div>

      {isLocked && (
        <div className="bg-amber-pale px-4 py-2 border-t border-amber/20">
          <p className="font-body text-[11px] text-amber-dark font-semibold">
            {test.unlock_reason === "complete_lesson"
              ? "Complete the lesson to unlock"
              : "Subscribe to unlock"}
          </p>
        </div>
      )}
    </button>
  );
}

export function TestsListPage() {
  const navigate = useNavigate();
  const { data: tests, isLoading } = useAvailableTests();

  const available = tests?.filter((t) => t.is_unlocked) ?? [];
  const locked = tests?.filter((t) => !t.is_unlocked) ?? [];

  return (
    <div className="pb-4">
      <div className="bg-gradient-to-br from-teal to-teal-dark px-4 pt-12 pb-6">
        <h1 className="font-display font-bold text-2xl text-white">Tests</h1>
        <p className="text-white/70 text-sm font-body mt-0.5">Chapter tests & practice</p>
      </div>

      <div className="px-4 py-4 space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        ) : tests?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Icon name={Icons.quiz} size={40} className="text-ink/20 mb-3 block" aria-hidden />
            <p className="font-body font-semibold text-ink-3 text-sm">No tests yet</p>
            <p className="font-body text-xs text-ink-3 mt-1">Complete lessons to unlock chapter tests</p>
          </div>
        ) : (
          <>
            {available.length > 0 && (
              <div>
                <p className="font-body text-xs font-semibold text-ink-3 uppercase tracking-wide mb-3">
                  Ready to take
                </p>
                <div className="space-y-3">
                  {available.map((test) => (
                    <TestCard
                      key={test.id}
                      test={test}
                      onClick={() =>
                        navigate(`/app/tests/${test.id}`, {
                          state: { lastAttempt: test.last_attempt },
                        })
                      }
                    />
                  ))}
                </div>
              </div>
            )}

            {locked.length > 0 && (
              <div>
                <p className="font-body text-xs font-semibold text-ink-3 uppercase tracking-wide mb-3">
                  Locked
                </p>
                <div className="space-y-3">
                  {locked.map((test) => (
                    <TestCard
                      key={test.id}
                      test={test}
                      onClick={() =>
                        navigate(`/app/tests/${test.id}`, {
                          state: { lastAttempt: test.last_attempt },
                        })
                      }
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
