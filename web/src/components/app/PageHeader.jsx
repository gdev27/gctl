import React from "react";

export default function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="border-b border-border">
      <div className="px-6 lg:px-10 py-8 flex items-end justify-between gap-6 flex-wrap">
        <div>
          {eyebrow && <p className="font-mono text-xs uppercase tracking-wider text-primary mb-2">{eyebrow}</p>}
          <h1 className="font-serif text-4xl md:text-5xl tracking-tight">{title}</h1>
          {description && <p className="text-muted-foreground mt-2 max-w-xl">{description}</p>}
        </div>
        {action}
      </div>
    </div>
  );
}