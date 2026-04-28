import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAvailableTests } from "../../hooks/useTests";
import { Icon } from "../../components/ui/Icon";
import { Icons } from "../../lib/icons";
import type { AvailableTest } from "../../types";
import { PageHeader } from "../../components/layout/PageHeader";

function cleanTestTitle(title: string) {
  return title.replace(/\s*[-–—]\s*test$/i, "");
}

function scoreTone(score: number) {
  if (score < 50) return "text-amber-dark";
  return "text-forest";
}

function TestCard({ test, onClick }: { test: AvailableTest; onClick: () => void }) {
  const isLocked = !test.is_unlocked;
  const lastPct = Math.round(test.last_attempt?.percentage ?? 0);

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-2xl border border-ink/5 bg-white px-4 py-3 text-left active:scale-[0.99] transition-transform"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-teal/10 flex items-center justify-center flex-shrink-0">
          <Icon
            name={isLocked ? Icons.lock : Icons.tests}
            size={18}
            className={isLocked ? "text-teal" : "text-teal"}
            aria-hidden
          />
        </div>

        <div className="flex-1 min-w-0">
          <p
            className={`font-body text-sm leading-5 ${isLocked ? "text-ink/60" : "text-ink font-semibold"}`}
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {cleanTestTitle(test.title)}
          </p>
          <p className={`font-body text-xs mt-1 ${isLocked ? "text-ink-3/70" : "text-ink-3"}`}>
            {test.question_count} questions · {test.duration_minutes} min
          </p>
          {test.last_attempt && lastPct > 0 ? (
            <p className={`font-body text-xs font-semibold mt-1 ${scoreTone(lastPct)}`}>
              Last: {lastPct}%
            </p>
          ) : null}
        </div>

        {!isLocked ? (
          <Icon name={Icons.forward} size={16} className="text-ink-3 mt-1" aria-hidden />
        ) : null}
      </div>
    </button>
  );
}

export function TestsListPage() {
  const navigate = useNavigate();
  const { data: tests, isLoading } = useAvailableTests();

  const groups = useMemo(() => {
    const grouped = new Map<
      string,
      {
        key: string;
        heading: string;
        tests: AvailableTest[];
      }
    >();

    for (const item of tests ?? []) {
      const key = `${item.subject_id}-${item.chapter_id}`;
      if (!grouped.has(key)) {
        grouped.set(key, {
          key,
          heading: `${item.subject_name} · Chapter ${item.chapter_number}`,
          tests: [],
        });
      }
      grouped.get(key)!.tests.push(item);
    }

    return Array.from(grouped.values());
  }, [tests]);

  return (
    <div className="pb-4">
      <PageHeader
        title="Tests"
        subtitle="Chapter tests and practice"
        onBack={() => navigate("/app/dashboard")}
        backLabel="Home"
      />

      <div className="px-4 py-4">
        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((item) => (
              <div key={item} className="skeleton h-24 rounded-2xl" />
            ))}
          </div>
        ) : !tests || tests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Icon name={Icons.quiz} size={40} className="text-ink/20 mb-3 block" aria-hidden />
            <p className="font-body font-semibold text-ink-3 text-sm">No tests yet</p>
            <p className="font-body text-xs text-ink-3 mt-1">Complete lessons to unlock chapter tests</p>
          </div>
        ) : (
          <div className="space-y-5">
            {groups.map((group) => {
              const ready = group.tests.filter((item) => item.is_unlocked);
              const locked = group.tests.filter((item) => !item.is_unlocked);
              return (
                <section key={group.key} className="space-y-2">
                  <p className="font-body text-xs uppercase tracking-wide font-semibold text-ink-3">
                    {group.heading}
                  </p>

                  {ready.map((test) => (
                    <TestCard
                      key={test.id}
                      test={test}
                      onClick={() => navigate(`/app/tests/${test.id}`)}
                    />
                  ))}

                  {locked.length > 0 ? (
                    <>
                      <div className="rounded-xl bg-bg border border-ink/8 px-3 py-2">
                        <p className="font-body text-xs text-ink-3">Complete lesson to unlock</p>
                      </div>
                      {locked.map((test) => (
                        <div key={test.id} className="opacity-60">
                          <TestCard
                            test={test}
                            onClick={() => navigate(`/app/tests/${test.id}`)}
                          />
                        </div>
                      ))}
                    </>
                  ) : null}
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
