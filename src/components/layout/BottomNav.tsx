import { NavLink, useLocation } from "react-router-dom";
import { BookOpen, Home, MessageCircle, PenLine, User } from "lucide-react";
import { clsx } from "clsx";

const TABS = [
  { to: "/app/dashboard", icon: Home, label: "Home" },
  { to: "/app/subjects", icon: BookOpen, label: "Subjects" },
  { to: "/app/tests", icon: PenLine, label: "Tests" },
  { to: "/app/doubts", icon: MessageCircle, label: "Doubts" },
  { to: "/app/profile", icon: User, label: "Profile" },
];

export function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-ink/8 z-40"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center">
        {TABS.map(({ to, icon: Icon, label }) => {
          const active = pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              className="flex-1 flex flex-col items-center gap-0.5 py-2 relative"
            >
              <Icon
                size={22}
                className={clsx("transition-colors", active ? "text-teal" : "text-ink-3")}
                strokeWidth={active ? 2.2 : 1.8}
              />
              <span
                className={clsx(
                  "text-[10px] font-body font-medium transition-colors",
                  active ? "text-teal" : "text-ink-3"
                )}
              >
                {label}
              </span>
              {active && (
                <span className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-teal" />
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
