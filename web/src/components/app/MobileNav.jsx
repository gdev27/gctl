import React from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, ArrowLeft, Github, Command } from "lucide-react";
import GctlMark from "../site/GctlMark";

export default function MobileNav({ items }) {
  const [open, setOpen] = React.useState(false);
  const location = useLocation();

  // close on route change
  React.useEffect(() => { setOpen(false); }, [location.pathname]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="p-2 -ml-2 rounded-md hover:bg-accent text-foreground" aria-label="Open menu">
          <Menu className="w-5 h-5" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="bg-card/95 backdrop-blur border-border p-0 w-72">
        <div className="px-5 h-16 flex items-center gap-2.5 border-b border-border">
          <GctlMark className="w-6 h-6" />
          <span className="font-mono text-sm">gctl</span>
          <span className="text-[10px] font-mono text-muted-foreground border border-border rounded px-1.5 py-0.5 ml-auto">app</span>
        </div>

        <nav className="px-3 py-4 space-y-0.5">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm transition-colors ${
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

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-border space-y-1 bg-card/95">
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
      </SheetContent>
    </Sheet>
  );
}