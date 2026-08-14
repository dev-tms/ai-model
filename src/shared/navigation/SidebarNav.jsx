import { NavLink } from "react-router-dom";
import { ChevronRight, History, LayoutDashboard, PhoneCall, X } from "lucide-react";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  {
    to: "/conversations",
    label: "Conversations",
    icon: History,
    isActive: (location) =>
      location.pathname.startsWith("/conversations") ||
      location.pathname.startsWith("/customers"),
  },
];

export const SidebarNav = ({ isOpen, onClose, onNavigate }) => {
  return (
    <>
      <button
        type="button"
        aria-label="Close navigation overlay"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-slate-950/40 transition-opacity lg:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-slate-800 bg-slate-900 text-slate-300 shadow-2xl transition-transform duration-200 lg:static lg:z-auto lg:h-screen lg:w-64 lg:max-w-none lg:translate-x-0 lg:shadow-none ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-3 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-600 p-2">
              <PhoneCall size={22} className="text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">Praangan Elitus</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-300 transition hover:bg-slate-700 lg:hidden"
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-2 px-4 py-4">
          {navItems.map(({ to, label, icon: Icon, end, isActive }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              isActive={isActive}
              onClick={onNavigate}
              className={({ isActive: active }) =>
                `group flex w-full items-center justify-between rounded-xl px-4 py-3 transition-all duration-200 ${
                  active
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                    : "hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              {({ isActive: active }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon
                      size={20}
                      className={active ? "text-white" : "text-slate-400 group-hover:text-white"}
                    />
                    <span className="font-medium">{label}</span>
                  </div>
                  {active && <ChevronRight size={16} />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto p-4">
          <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              System Status
            </p>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-sm font-medium text-slate-300">All systems normal</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
