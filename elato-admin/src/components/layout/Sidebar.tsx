import { useState } from "react";
import { NavLink } from "react-router-dom";
import { ChevronUp, LogOut, X } from "lucide-react";
import { NAV_ITEMS } from "./nav-items";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../lib/utils";

export function Sidebar({ mobileOpen, onMobileClose }: { mobileOpen: boolean; onMobileClose: () => void }) {
  const { admin, hasRole, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  const visibleItems = NAV_ITEMS.filter((item) => !item.roles || (admin && hasRole(...item.roles)));
  const sections = [...new Set(visibleItems.map((item) => item.section))];

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-neutral-900/40 lg:hidden" onClick={onMobileClose} aria-hidden="true" />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-neutral-200 bg-white transition-transform lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div>
            <p className="font-display text-lg font-semibold tracking-[0.2em] text-neutral-900">ELATŌ</p>
            <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">Admin panel</p>
          </div>
          <button
            type="button"
            onClick={onMobileClose}
            className="rounded-md p-1 text-neutral-400 hover:bg-neutral-100 lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-2" aria-label="Primary">
          {sections.map((section) => (
            <div key={section} className="mb-4">
              <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">{section}</p>
              <ul className="flex flex-col gap-0.5">
                {visibleItems
                  .filter((item) => item.section === section)
                  .map((item) => (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        end={item.to === "/"}
                        onClick={onMobileClose}
                        className={({ isActive }) =>
                          cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                            isActive
                              ? "bg-accent-50 text-accent-800"
                              : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900",
                          )
                        }
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {item.label}
                      </NavLink>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="relative border-t border-neutral-100 p-3">
          {profileOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} aria-hidden="true" />
              <div className="absolute inset-x-3 bottom-[calc(100%-0.5rem)] z-20 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-elevation-lg">
                <div className="px-3.5 py-3">
                  <p className="truncate text-xs font-medium text-neutral-800">{admin?.email}</p>
                  <p className="text-[11px] capitalize text-neutral-400">{admin?.role}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void logout()}
                  className="flex w-full items-center gap-2 border-t border-neutral-100 px-3.5 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </div>
            </>
          )}
          <button
            type="button"
            onClick={() => setProfileOpen((v) => !v)}
            aria-expanded={profileOpen}
            className="relative z-20 flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-neutral-100"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white">
              {admin?.email.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-neutral-800">{admin?.email}</p>
              <p className="text-[11px] capitalize text-neutral-400">{admin?.role}</p>
            </div>
            <ChevronUp className={cn("h-3.5 w-3.5 shrink-0 text-neutral-400 transition-transform", profileOpen && "rotate-180")} />
          </button>
        </div>
      </aside>
    </>
  );
}
