import { useNavigate } from "react-router-dom";
import { Flame, PlayCircle, FileText, Target, ChevronRight } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useMeStats } from "../hooks/useAuth";
import { useProgressSummary } from "../hooks/useProgress";
import { useSubjects } from "../hooks/useContent";
import { ProgressBar } from "../components/ui/ProgressBar";
import { Skeleton } from "../components/ui/Skeleton";

export function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { data: stats, isLoading: statsLoading } = useMeStats();
  const { data: progress, isLoading: progressLoading } = useProgressSummary();
  const { data: subjects } = useSubjects(user?.current_class ?? null);

  const loading = statsLoading || progressLoading;
  const inProgress = progress?.subjects.find(
    (s) => s.percentage > 0 && s.percentage < 100
  );

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = user?.name?.split(" ")[0] ?? "Student";

  return (
    <div className="pb-4">
      {/* Hero */}
      <div className="bg-gradient-to-br from-teal to-teal-dark px-4 pt-12 pb-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/70 text-sm font-body">{greeting},</p>
            <h1 className="text-white text-2xl font-display font-bold leading-tight">
              {firstName}!
            </h1>
            {stats && (
              <div className="flex items-center gap-1 mt-1.5">
                <Flame size={14} className="text-amber" />
                <span className="text-white/80 text-sm font-body">
                  {stats.streak_days} day streak
                </span>
              </div>
            )}
          </div>
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              className="w-11 h-11 rounded-full border-2 border-white/30 flex-shrink-0"
              alt=""
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-display font-bold text-lg">
                {firstName[0]?.toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* Continue learning / start card */}
        {loading ? (
          <Skeleton className="h-24 rounded-2xl" />
        ) : inProgress ? (
          <button
            onClick={() => navigate(`/app/subjects/${inProgress.subject_id}`)}
            className="w-full bg-amber/10 border border-amber/25 rounded-2xl p-4 text-left flex items-center gap-3"
          >
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-amber font-body font-bold uppercase tracking-wider mb-1">
                Continue Learning
              </p>
              <p className="font-display font-bold text-ink text-base truncate">
                {inProgress.name}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <ProgressBar value={inProgress.percentage} color="amber" className="flex-1" />
                <span className="text-xs text-ink-3 font-body flex-shrink-0">
                  {Math.round(inProgress.percentage)}%
                </span>
              </div>
            </div>
            <ChevronRight size={18} className="text-amber flex-shrink-0" />
          </button>
        ) : (
          <button
            onClick={() => navigate("/app/subjects")}
            className="w-full bg-teal/5 border border-teal/15 rounded-2xl p-4 text-left flex items-center gap-3"
          >
            <div className="flex-1">
              <p className="text-[11px] text-teal font-body font-bold uppercase tracking-wider mb-1">
                Get Started
              </p>
              <p className="font-display font-bold text-ink text-base">
                Start your first lesson
              </p>
              <p className="text-ink-3 text-sm font-body mt-0.5">
                Pick a subject and begin learning
              </p>
            </div>
            <ChevronRight size={18} className="text-teal flex-shrink-0" />
          </button>
        )}

        {/* Stats strip */}
        {loading ? (
          <Skeleton className="h-20 rounded-2xl" />
        ) : stats ? (
          <div className="grid grid-cols-3 gap-2">
            {([
              { label: "Videos", value: stats.videos_completed, Icon: PlayCircle },
              { label: "Tests", value: stats.tests_taken, Icon: FileText },
              { label: "Avg Score", value: `${Math.round(stats.avg_test_score)}%`, Icon: Target },
            ] as const).map(({ label, value, Icon }) => (
              <div
                key={label}
                className="bg-white rounded-2xl p-3 text-center border border-ink/5"
              >
                <Icon size={18} className="text-teal mx-auto mb-1" />
                <p className="font-display font-bold text-ink text-lg leading-none">{value}</p>
                <p className="text-ink-3 text-[11px] font-body mt-1">{label}</p>
              </div>
            ))}
          </div>
        ) : null}

        {/* Subjects */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-bold text-ink text-base">Your Subjects</h2>
            <button
              onClick={() => navigate("/app/subjects")}
              className="text-teal text-sm font-body font-semibold"
            >
              See all
            </button>
          </div>

          {subjects ? (
            <div className="space-y-2">
              {subjects.slice(0, 4).map((subject) => {
                const subjectProgress = progress?.subjects.find(
                  (s) => s.subject_id === subject.id
                );
                return (
                  <button
                    key={subject.id}
                    onClick={() => navigate(`/app/subjects/${subject.id}`)}
                    className="w-full bg-white rounded-2xl p-3 flex items-center gap-3 border border-ink/5 active:scale-[0.98] transition-transform"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{ backgroundColor: subject.color + "20" }}
                    >
                      {subject.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1.5">
                        <p className="font-body font-semibold text-ink text-sm truncate">
                          {subject.name}
                        </p>
                        <span className="text-xs text-ink-3 font-body ml-2 flex-shrink-0">
                          {Math.round(subjectProgress?.percentage ?? 0)}%
                        </span>
                      </div>
                      <ProgressBar value={subjectProgress?.percentage ?? 0} />
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-16 rounded-2xl" />
              ))}
            </div>
          )}
        </div>

        {/* Class label */}
        {user?.current_class && (
          <p className="text-center text-xs text-ink-3 font-body pb-2">
            Class {user.current_class} · {user.medium === "malayalam" ? "Malayalam Medium" : "English Medium"}
          </p>
        )}
      </div>
    </div>
  );
}
