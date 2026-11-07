import { useContext } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Receipt, TrendingUp, Repeat, Users, Sparkles,
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";

const links = [
  { to: "/", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/expenses", label: "Expenses", icon: Receipt },
  { to: "/budgets", label: "Budgets", icon: TrendingUp },
  { to: "/recurring", label: "Recurring", icon: Repeat },
  { to: "/groups", label: "Groups", icon: Users },
  { to: "/summary", label: "AI summary", icon: Sparkles },
];

const getInitials = (name = "") =>
  name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col gap-1 border-r border-line-soft bg-sidebar px-4 py-6">
      <div className="flex items-center gap-2.5 px-3 pb-6 text-xl font-bold tracking-tight">
        <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-accent text-[#100d25]">
          <TrendingUp size={18} strokeWidth={2.4} />
        </span>
        moneta
      </div>

      {links.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm ${
              isActive
                ? "bg-nav-active font-semibold text-nav-active-ink"
                : "font-medium text-muted hover:text-ink"
            }`
          }
        >
          <Icon size={18} strokeWidth={1.8} />
          {label}
        </NavLink>
      ))}

      <div className="mt-auto flex items-center gap-2.5 border-t border-line-soft px-2 pt-4">
        <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#cdb4e0] text-[13px] font-bold text-[#21141b]">
          {getInitials(user?.name)}
        </span>
        <div className="min-w-0">
          <div className="truncate text-[13px] font-semibold">{user?.name}</div>
          <button onClick={logout} className="text-xs text-muted hover:text-ink">
            Log out
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;