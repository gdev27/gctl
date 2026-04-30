import React from "react";
import { Link } from "react-router-dom";
import { Github } from "lucide-react";
import GctlMark from "./GctlMark";

export default function SiteFooter() {
  return (
    <footer className="border-t border-border mt-32 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2.5">
              <GctlMark className="w-6 h-6" />
              <span className="font-mono text-sm">gctl</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs leading-relaxed">
              An open-source framework for policy-constrained autonomous agents that move value onchain.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <a href="https://github.com/gdev27/gctl" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          <FooterCol title="Product" links={[
            { label: "Dashboard", to: "/dashboard" },
            { label: "Policy Builder", to: "/policy-builder" },
            { label: "Explorer", to: "/explorer" },
          ]} />
          <FooterCol title="Resources" links={[
            { label: "Docs", to: "/docs" },
            { label: "Concepts", to: "/concepts" },
            { label: "GitHub", to: "https://github.com/gdev27/gctl", external: true },
          ]} />
          <FooterCol title="Legal" links={[
            { label: "Security", to: "/docs" },
          ]} />
        </div>
        <div className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <p className="text-xs font-mono text-muted-foreground">© 2026 gctl contributors.</p>
          <p className="text-xs font-mono text-muted-foreground">Built for builders. Not financial advice.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }) {
  return (
    <div>
      <h4 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-4">{title}</h4>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            {l.external ? (
              <a href={l.to} target="_blank" rel="noreferrer" className="text-sm text-foreground/80 hover:text-foreground">{l.label}</a>
            ) : (
              <Link to={l.to} className="text-sm text-foreground/80 hover:text-foreground">{l.label}</Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}