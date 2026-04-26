import { useNavigate } from "react-router-dom";
import { useMe, useMeStats } from "../hooks/useAuth";
import { useSubscription } from "../hooks/useSubscription";
import { useAuthStore } from "../store/authStore";
import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";
import { Icon } from "../components/ui/Icon";
import { Icons } from "../lib/icons";
import api from "../api/axios";

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
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  return (
    <div className="min-h-screen bg-bg pb-24">
      {/* Header */}
      <div className="px-4 pt-12 pb-4 bg-white border-b border-ink/5">
        <h1 className="font-display font-bold text-xl text-ink">Profile</h1>
      </div>

      {/* Avatar + name card */}
      <div className="bg-white px-4 py-6 flex items-center gap-4">
        {userLoading ? (
          <>
            <Skeleton className="w-16 h-16 rounded-full flex-shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-teal flex items-center justify-center flex-shrink-0 overflow-hidden">
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-display font-bold text-white text-xl">{initials}</span>
              )}
            </div>
            <div>
              <p className="font-display font-bold text-ink text-lg">{user?.name ?? "Student"}</p>
              <p className="font-body text-ink-3 text-sm">
                {user?.email ?? user?.phone ?? ""}
              </p>
              {user?.current_class && (
                <span className="inline-block mt-1 px-2 py-0.5 bg-teal/10 text-teal text-xs font-body font-semibold rounded-full">
                  Class {user.current_class}
                </span>
              )}
            </div>
          </>
        )}
      </div>

      {/* Stats */}
      <div className="px-4 mt-4">
        <h2 className="font-display font-bold text-sm text-ink mb-3">Your Stats</h2>
        <div className="grid grid-cols-2 gap-3">
          {statsLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-2xl" />
            ))
          ) : (
            <>
              <div className="bg-white rounded-2xl p-4 border border-ink/5 shadow-sm">
                <Icon name={Icons.videoLesson} size={20} className="text-teal mb-2 block" aria-hidden />
                <p className="font-display font-bold text-xl text-ink">
                  {stats?.videos_completed ?? 0}
                </p>
                <p className="font-body text-xs text-ink-3">Videos done</p>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-ink/5 shadow-sm">
                <Icon name={Icons.quiz} size={20} className="text-amber mb-2 block" aria-hidden />
                <p className="font-display font-bold text-xl text-ink">
                  {stats?.tests_taken ?? 0}
                </p>
                <p className="font-body text-xs text-ink-3">Tests taken</p>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-ink/5 shadow-sm">
                <Icon name={Icons.trophy} size={20} className="text-amber mb-2 block" aria-hidden />
                <p className="font-display font-bold text-xl text-ink">
                  {stats?.avg_test_score ?? 0}%
                </p>
                <p className="font-body text-xs text-ink-3">Avg score</p>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-ink/5 shadow-sm">
                <Icon name={Icons.streak} size={20} className="text-teal mb-2 block" aria-hidden />
                <p className="font-display font-bold text-xl text-ink">
                  {stats?.streak_days ?? 0}
                </p>
                <p className="font-body text-xs text-ink-3">Day streak</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Subscription */}
      <div className="px-4 mt-4">
        <h2 className="font-display font-bold text-sm text-ink mb-3">Subscription</h2>
        <div className="bg-white rounded-2xl p-4 border border-ink/5 shadow-sm">
          {!subStatus ? (
            <Skeleton className="h-10 w-full" />
          ) : subStatus.free_trial.active ? (
            <div>
              <p className="font-body font-semibold text-teal text-sm">Free Trial Active</p>
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
              <p className="font-body font-semibold text-teal text-sm">
                {subStatus.subscription.plan.name}
              </p>
              <p className="font-body text-ink-3 text-xs mt-0.5">
                {subStatus.subscription.expires_at
                  ? `Valid till ${new Date(
                      subStatus.subscription.expires_at
                    ).toLocaleDateString("en-IN", {
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
                <p className="font-body text-ink-3 text-xs mt-0.5">
                  Subscribe to unlock all content
                </p>
              </div>
              <Button size="sm" onClick={() => navigate("/app/pricing")}>
                View Plans
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Logout */}
      <div className="px-4 mt-6">
        <Button variant="secondary" fullWidth onClick={handleLogout}>
          <Icon name={Icons.logout} size={16} className="mr-2" aria-hidden />
          Log Out
        </Button>
      </div>
    </div>
  );
}
