import { useNavigate } from "react-router-dom";
import { useMe, useMeStats } from "../hooks/useAuth";
import { useSubscription } from "../hooks/useSubscription";
import { useAuthStore } from "../store/authStore";
import { Button } from "../components/ui/Button";
import { Icon } from "../components/ui/Icon";
import { Icons } from "../lib/icons";
import api from "../api/axios";
import { showMetric } from "../lib/displayValue";

function StatCard({
  icon,
  color,
  value,
  label,
  emptyLabel,
}: {
  icon: string;
  color: string;
  value: number;
  label: string;
  emptyLabel: string;
}) {
  const metric = showMetric(value, "—");
  return (
    <div className="bg-white rounded-2xl p-4 border border-ink/5 shadow-sm">
      <Icon name={icon} size={20} className="mb-2 block" style={{ color }} aria-hidden />
      <p className="font-display font-bold text-xl text-ink">{metric.display}</p>
      <p className="font-body text-xs text-ink-3">{metric.isEmpty ? emptyLabel : label}</p>
    </div>
  );
}

export function ProfilePage() {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const { data: user, isLoading: userLoading } = useMe();
  const { data: stats, isLoading: statsLoading } = useMeStats();
  const { data: subStatus } = useSubscription();

  async function handleLogout() {
    try {
      await api.post("/auth/logout");
    } finally {
      clearAuth();
      navigate("/login", { replace: true });
    }
  }

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((word) => word[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  return (
    <div className="min-h-screen bg-bg pb-24">
      <div className="px-5 pt-12 pb-6 bg-gradient-to-br from-teal to-teal-dark">
        <h1 className="font-display font-bold text-2xl text-white">Profile</h1>
      </div>

      <div className="px-4 -mt-5">
        <div className="bg-white rounded-2xl border border-ink/5 px-4 py-5 flex items-center gap-4">
          {userLoading ? (
            <div className="skeleton w-[72px] h-[72px] rounded-full" />
          ) : (
            <div className="w-[72px] h-[72px] rounded-full bg-amber/25 text-amber-dark flex items-center justify-center overflow-hidden">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="font-display font-bold text-2xl">{initials}</span>
              )}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="font-display font-bold text-xl text-ink truncate">{user?.name ?? "Student"}</p>
            <p className="font-body text-sm text-ink-3 truncate">{user?.email ?? user?.phone ?? ""}</p>
            {user?.current_class ? (
              <span className="inline-flex mt-1 rounded-full px-2 py-0.5 bg-teal/10 text-teal text-xs font-body font-semibold">
                Class {user.current_class}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="px-4 mt-4">
        <h2 className="font-display font-bold text-sm text-ink mb-3">Your stats</h2>
        {statsLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="skeleton h-20 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon="play_circle"
              color="#0D6E6E"
              value={stats?.videos_completed ?? 0}
              label="Videos done"
              emptyLabel="Watch your first video"
            />
            <StatCard
              icon="assignment"
              color="#534AB7"
              value={stats?.tests_taken ?? 0}
              label="Tests taken"
              emptyLabel="Take your first test"
            />
            <StatCard
              icon="emoji_events"
              color="#F5A623"
              value={Math.round(stats?.avg_test_score ?? 0)}
              label="Avg score"
              emptyLabel="No score yet"
            />
            <StatCard
              icon={Icons.streak}
              color="#0D6E6E"
              value={stats?.streak_days ?? 0}
              label="Day streak"
              emptyLabel="Start your streak"
            />
          </div>
        )}
      </div>

      {stats ? (
        <div className="px-4 mt-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-bold text-sm text-ink">Study goal</h2>
            <button
              type="button"
              onClick={() => navigate("/app/goal-setup")}
              className="h-8 px-2.5 rounded-lg border border-teal/40 text-teal text-xs font-body font-semibold inline-flex items-center gap-1"
            >
              <Icon name={Icons.edit} size={14} aria-hidden />
              Edit
            </button>
          </div>
          <div className="bg-white rounded-2xl border border-ink/5 shadow-sm divide-y divide-ink/5">
            {stats.days_to_exam !== null ? (
              <div className="flex items-center gap-3 px-4 py-3">
                <Icon name={Icons.timer} size={18} className="text-teal" aria-hidden />
                <p className="font-body text-sm text-ink">
                  {stats.days_to_exam === 0 ? "Exam day!" : `${stats.days_to_exam} days to exam`}
                </p>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => navigate("/app/goal-setup")}
                className="w-full flex items-center gap-3 px-4 py-3 text-left"
              >
                <Icon name={Icons.calendar} size={18} className="text-ink-3" aria-hidden />
                <p className="font-body text-sm text-ink-3 flex-1">Set your exam date</p>
                <Icon name={Icons.forward} size={14} className="text-ink-3" aria-hidden />
              </button>
            )}

            {Math.round(stats.score_this_week) > 0 ? (
              <div className="flex items-center gap-3 px-4 py-3">
                <Icon name="emoji_events" size={18} className="text-amber" aria-hidden />
                <p className="font-body text-sm text-ink">
                  Score this week: <span className="font-semibold">{Math.round(stats.score_this_week)}%</span>
                </p>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="px-4 mt-4">
        <h2 className="font-display font-bold text-sm text-ink mb-3">Subscription</h2>
        <div className="bg-white rounded-2xl p-4 border border-ink/5 shadow-sm">
          {!subStatus ? (
            <div className="skeleton h-10 rounded-xl" />
          ) : subStatus.free_trial.active ? (
            <div>
              <p className="font-body font-semibold text-teal text-sm">Free trial active</p>
              <p className="font-body text-ink-3 text-xs mt-0.5">
                Expires{" "}
                {new Date(subStatus.free_trial.expires_at!).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                })}
              </p>
            </div>
          ) : subStatus.subscription?.status === "active" ? (
            <div>
              <p className="font-body font-semibold text-teal text-sm">{subStatus.subscription.plan.name}</p>
              <p className="font-body text-ink-3 text-xs mt-0.5">
                {subStatus.subscription.expires_at
                  ? `Valid till ${new Date(subStatus.subscription.expires_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}`
                  : "Lifetime access"}
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-body font-semibold text-ink text-sm">No active plan</p>
                <p className="font-body text-ink-3 text-xs mt-0.5">Subscribe to unlock all content</p>
              </div>
              <Button size="sm" onClick={() => navigate("/app/pricing")}>
                View plans
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 mt-6">
        <Button variant="secondary" fullWidth onClick={handleLogout}>
          <Icon name={Icons.logout} size={16} className="mr-2" aria-hidden />
          Log out
        </Button>
      </div>
    </div>
  );
}
