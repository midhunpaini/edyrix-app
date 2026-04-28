import { NavLink, useLocation } from "react-router-dom";
import { clsx } from "clsx";
import { Icon } from "../ui/Icon";
import { Icons } from "../../lib/icons";

const TABS = [
  { to: "/app/dashboard", icon: Icons.home,     label: "Home"     },
  { to: "/app/subjects",  icon: Icons.subjects,  label: "Learn"    },
  { to: "/app/tests",     icon: Icons.tests,     label: "Tests"    },
  { to: "/app/profile",   icon: Icons.profile,   label: "Profile"  },
] as const;

export function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white/95 backdrop-blur-sm border-t border-ink/8 z-40"
      style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
    >
      <div className="flex items-stretch h-14">
        {TABS.map(({ to, icon, label }) => {
          const active = pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 relative"
              aria-label={label}
            >
              <Icon
                name={icon}
                size={22}
                filled={active}
                className={clsx(
                  "transition-colors duration-150",
                  active ? "text-teal" : "text-ink-3"
                )}
                aria-hidden
              />
              <span
                className={clsx(
                  "text-[10px] font-body font-semibold transition-colors duration-150",
                  active ? "text-teal" : "text-ink-3"
                )}
              >
                {label}
              </span>
              {active && (
                <div
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    background: "#0D6E6E",
                    marginTop: 1,
                  }}
                />
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
