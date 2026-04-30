import React from "react";

export default function DocsSidebar({ sections, active, onSelect }) {
  return (
    <aside className="lg:sticky lg:top-24 lg:h-[calc(100vh-7rem)] lg:overflow-y-auto scrollbar-thin">
      <nav className="space-y-8">
        {sections.map((group) => (
          <div key={group.label}>
            <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">{group.label}</p>
            <ul className="space-y-1">
              {group.items.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => onSelect(item.id)}
                    className={`w-full text-left text-sm px-3 py-1.5 rounded-md transition-colors ${
                      active === item.id
                        ? "bg-accent text-foreground border-l-2 border-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
                    }`}
                  >
                    {item.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}