import React from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Search, LayoutDashboard, Bot, Shield, Beaker, Bell, Receipt, Radio, BookOpen, Home } from "lucide-react";

const COMMANDS = [
  { id: "dashboard", label: "Go to dashboard", path: "/dashboard", icon: LayoutDashboard, group: "Navigate" },
  { id: "agents", label: "Go to agents", path: "/dashboard/agents", icon: Bot, group: "Navigate" },
  { id: "policies", label: "Open policy builder", path: "/policy-builder", icon: Shield, group: "Navigate" },
  { id: "playground", label: "Open playground", path: "/playground", icon: Beaker, group: "Navigate" },
  { id: "alerting", label: "Open alerting", path: "/alerting", icon: Bell, group: "Navigate" },
  { id: "swarm", label: "Open swarm message bus", path: "/swarm", icon: Radio, group: "Navigate" },
  { id: "explorer", label: "Open explorer", path: "/explorer", icon: Receipt, group: "Navigate" },
  { id: "docs", label: "Read docs", path: "/docs", icon: BookOpen, group: "Site" },
  { id: "site", label: "Back to marketing site", path: "/", icon: Home, group: "Site" },
];

export default function CommandPalette() {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");
  const [active, setActive] = React.useState(0);

  React.useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  React.useEffect(() => {
    if (open) {
      setQ("");
      setActive(0);
    }
  }, [open]);

  const filtered = COMMANDS.filter((c) =>
    c.label.toLowerCase().includes(q.toLowerCase())
  );

  const groups = filtered.reduce((acc, c) => {
    (acc[c.group] ||= []).push(c);
    return acc;
  }, {});

  const run = (cmd) => {
    setOpen(false);
    navigate(cmd.path);
  };

  const handleKey = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && filtered[active]) {
      e.preventDefault();
      run(filtered[active]);
    }
  };

  let renderIdx = -1;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-card border-border max-w-xl p-0 overflow-hidden gap-0">
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            autoFocus
            value={q}
            onChange={(e) => { setQ(e.target.value); setActive(0); }}
            onKeyDown={handleKey}
            placeholder="Type a command or search…"
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
          />
          <kbd className="text-[10px] font-mono text-muted-foreground border border-border rounded px-1.5 py-0.5">esc</kbd>
        </div>
        <div className="max-h-[400px] overflow-y-auto scrollbar-thin py-2">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No matches.</p>
          ) : (
            Object.entries(groups).map(([group, items]) => (
              <div key={group} className="py-1">
                <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground px-3 py-1.5">{group}</p>
                {items.map((c) => {
                  renderIdx += 1;
                  const isActive = filtered[active]?.id === c.id;
                  const Icon = c.icon;
                  return (
                    <button
                      key={c.id}
                      onMouseEnter={() => setActive(renderIdx)}
                      onClick={() => run(c)}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-left transition-colors ${
                        isActive ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/40"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      {c.label}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
        <div className="px-4 py-2 border-t border-border flex items-center justify-between text-[10px] font-mono text-muted-foreground">
          <span><kbd className="border border-border rounded px-1 py-0.5">↑↓</kbd> navigate</span>
          <span><kbd className="border border-border rounded px-1 py-0.5">↵</kbd> open</span>
          <span><kbd className="border border-border rounded px-1 py-0.5">⌘K</kbd> toggle</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}