import { NavLink } from "react-router-dom";
import { Leaf, Vote, ClipboardList, BarChart3, LogOut, Trophy, Recycle } from "lucide-react";
import { useAuth } from "../AuthContext";

const STUDENT_LINKS = [
  { to: "/vote", label: "Vote & Rate", icon: Vote },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
];

const ADMIN_LINKS = [
  { to: "/admin/menu", label: "Menu setup", icon: ClipboardList },
  { to: "/admin/waste", label: "Waste & voting", icon: Recycle },
  { to: "/admin/dashboard", label: "Dashboard", icon: BarChart3 },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const links = user?.role === "admin" ? ADMIN_LINKS : STUDENT_LINKS;

  return (
    <header className="sticky top-0 z-30 border-b border-surface-border bg-ink/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <NavLink to="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-400/10 text-accent-400">
            <Leaf size={18} />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-ash-100">
            MenuMate
          </span>
        </NavLink>

        {user && (
          <nav className="hidden items-center gap-1 sm:flex">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-surface-raised text-accent-400"
                      : "text-ash-400 hover:text-ash-100"
                  }`
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </nav>
        )}

        {user ? (
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-ash-100">{user.name}</p>
              <p className="text-xs uppercase tracking-wide text-ash-500">
                {user.role === "admin" ? "Admin" : `${user.id} · ${user.student_type === "hosteller" ? "Hosteller" : "Day Scholar"}`}
              </p>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-lg border border-surface-border px-3 py-2 text-sm font-medium text-ash-400 transition-colors hover:border-coral-400/40 hover:text-coral-400"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        ) : (
          <NavLink
            to="/login"
            className="rounded-lg bg-accent-400 px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-accent-200"
          >
            Log in
          </NavLink>
        )}
      </div>

      {/* Mobile nav links */}
      {user && (
        <nav className="flex items-center gap-1 overflow-x-auto border-t border-surface-border px-4 py-2 sm:hidden">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-surface-raised text-accent-400"
                    : "text-ash-400 hover:text-ash-100"
                }`
              }
            >
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
