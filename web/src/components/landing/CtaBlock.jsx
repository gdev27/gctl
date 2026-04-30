import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Github } from "lucide-react";

export default function CtaBlock() {
  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-8 py-32">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-12 md:p-20">
        <div className="absolute inset-0 grid-bg-fine opacity-40 pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl">
          <h2 className="font-serif text-4xl md:text-6xl leading-[1.05] tracking-tight text-balance">
            Stop writing the same guardrails. <span className="italic text-primary">Ship the agent.</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl">
            Open source, batteries included, production-grade. Get from <code className="font-mono text-foreground bg-accent px-1.5 py-0.5 rounded text-sm">npm install</code> to live agent in under ten minutes.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link to="/docs">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-6 group">
                Read the docs
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </Link>
            <a href="https://github.com/gdev27/gctl" target="_blank" rel="noreferrer">
              <Button size="lg" variant="outline" className="h-12 px-6 border-border hover:bg-accent gap-2">
                <Github className="w-4 h-4" /> Star on GitHub
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}