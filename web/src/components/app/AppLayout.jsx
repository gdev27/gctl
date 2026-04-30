import React from "react";
import { Outlet, NavLink, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Bot, Shield, Receipt, Github, ArrowLeft, Beaker, Bell, Radio, Command, Users, ListChecks } from "lucide-react";
import GctlMark from "../site/GctlMark";
import CommandPalette from "./CommandPalette";
import MobileNav from "./MobileNav";
import RoleBadge from "./RoleBadge";
import { usePermissions } from "@/hooks/usePermissions";

const nav = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/onboarding", label: "Onboarding", icon: ListChecks },
  { to: "/dashboard/agents", label: "Agents", icon: Bot },
  { to: "/policy-builder", label: "Policies", icon: Shield },
  { to: "/playground", label: "Playground", icon: Beaker },
  { to: "/swarm", label: "Swarm", icon: Radio },
  { to: "/alerting", label: "Alerting", icon: Bell },
  { to: "/explorer", label: "Explorer", icon: Receipt },
  { to: "/team", label: "Team", icon: Users },
];

export default function AppLayout() {
  const location = useLocation();
  const { role, user } = usePermissions();
  const current = nav.find((n) => (n.end ? location.pathname === n.to : location.pathname.startsWith(n.to))) || nav[0];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-60 shrink-0 flex-col border-r border-border bg-card/30">
        <div className="px-5 h-16 flex items-center gap-2.5 border-b border-border">
          <GctlMark className="w-6 h-6" />
          <span className="font-mono text-sm">gctl</span>
          <span className="text-[10px] font-mono text-muted-foreground border border-border rounded px-1.5 py-0.5 ml-auto">app</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`
              }
            >
              <item.icon className="w-4 h-4" strokeWidth={1.75} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-border space-y-2">
          {user && (
            <div className="px-3 py-2 rounded-md bg-background/40 border border-border flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-xs font-medium truncate">{user.full_name || user.email?.split("@")[0]}</div>
                <div className="text-[10px] font-mono text-muted-foreground truncate">{user.email}</div>
              </div>
              <RoleBadge role={role} />
            </div>
          )}
          <div className="flex items-center justify-between px-3 py-1.5 text-[10px] font-mono text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><Command className="w-3 h-3" /> command palette</span>
            <kbd className="border border-border rounded px-1 py-0.5">⌘K</kbd>
          </div>
          <Link to="/" className="flex items-center gap-2 px-3 py-2 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to site
          </Link>
          <a href="https://github.com/gdev27/gctl" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50">
            <Github className="w-3.5 h-3.5" /> github.com/gdev27/gctl
          </a>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar */}
        <div className="lg:hidden sticky top-0 z-30 h-14 px-4 flex items-center gap-3 border-b border-border bg-background/80 backdrop-blur">
          <MobileNav items={nav} />
          <Link to="/" className="flex items-center gap-2">
            <GctlMark className="w-5 h-5" />
            <span className="font-mono text-sm">gctl</span>
          </Link>
          <span className="ml-auto inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
            <current.icon className="w-3.5 h-3.5" strokeWidth={1.75} />
            {current.label}
          </span>
        </div>
        <Outlet />
      </div>
      <CommandPalette />
    </div>
  );
}