import { NavLink, useLocation } from "react-router-dom";
import { clsx } from "clsx";
import { Icon } from "../ui/Icon";
import { Icons } from "../../lib/icons";

const TABS = [
  { to: "/app/dashboard", icon: Icons.home, iconActive: Icons.homeActive, label: "Home" },
  { to: "/app/subjects", icon: Icons.subjects, iconActive: Icons.subjectsActive, label: "Subjects" },
  { to: "/app/tests", icon: Icons.tests, iconActive: Icons.testsActive, label: "Tests" },
  { to: "/app/doubts", icon: Icons.doubts, iconActive: Icons.doubtsActive, label: "Doubts" },
  { to: "/app/profile", icon: Icons.profile, iconActive: Icons.profileActive, label: "Profile" },
];

export function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-ink/8 z-40"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center">
        {TABS.map(({ to, icon, iconActive, label }) => {
          const active = pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              className="flex-1 flex flex-col items-center gap-0.5 py-2 relative"
              aria-label={label}
            >
              <Icon
                name={active ? iconActive : icon}
                size={22}
                filled={active}
                className={clsx("transition-colors", active ? "text-teal" : "text-ink-3")}
                aria-hidden
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
