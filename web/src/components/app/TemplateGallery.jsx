import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/gctlClient";
import { Sparkles, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { POLICY_TEMPLATES, categoryAccent } from "@/lib/policyTemplates";
import TemplateCard from "../templates/TemplateCard";
import CategoryFilter from "../templates/CategoryFilter";
import AIDebateDialog from "../templates/AIDebateDialog";
import { useToast } from "@/components/ui/use-toast";

export default function TemplateGallery({ onPick }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [category, setCategory] = React.useState("all");
  const [q, setQ] = React.useState("");
  const [debateOpen, setDebateOpen] = React.useState(false);

  const { data: aiTemplates = [] } = useQuery({
    queryKey: ["policyTemplates"],
    queryFn: () => base44.entities.PolicyTemplate.list("-created_date"),
  });

  // Normalize AI templates so they share the same shape as built-ins
  const aiNormalized = aiTemplates.map((t) => ({
    id: t.id,
    name: t.name,
    tagline: t.tagline,
    description: t.description,
    category: t.category || "custom",
    tags: t.tags || [],
    accent: categoryAccent(t.category),
    source: "ai_debate",
    debate_log: t.debate_log,
    config: t.config,
    use_case: t.use_case,
  }));

  const all = React.useMemo(() => [...aiNormalized, ...POLICY_TEMPLATES], [aiNormalized]);

  const counts = React.useMemo(() => {
    const c = {};
    for (const t of all) c[t.category || "custom"] = (c[t.category || "custom"] || 0) + 1;
    return c;
  }, [all]);

  const filtered = React.useMemo(() => {
    const s = q.trim().toLowerCase();
    return all.filter((t) => {
      if (category !== "all" && (t.category || "custom") !== category) return false;
      if (s) {
        const hay = [t.name, t.tagline, t.description, ...(t.tags || [])].join(" ").toLowerCase();
        if (!hay.includes(s)) return false;
      }
      return true;
    });
  }, [all, category, q]);

  const onAiComplete = (template) => {
    qc.invalidateQueries({ queryKey: ["policyTemplates"] });
    toast({
      title: "Template generated",
      description: `"${template.name}" is ready in your library.`,
    });
  };

  return (
    <div>
      <div className="mb-6 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-primary mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" /> templates
          </p>
          <h2 className="font-serif text-2xl">Bootstrap from a pattern</h2>
          <p className="text-sm text-muted-foreground mt-1">Built-in patterns + AI-generated templates tailored to your use case.</p>
        </div>
        <Button
          onClick={() => setDebateOpen(true)}
          className="gap-2 bg-[hsl(var(--chart-3))] text-background hover:bg-[hsl(var(--chart-3))]/90"
        >
          <Sparkles className="w-4 h-4" /> Generate via AI debate
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, tag, use case..."
            className="pl-9 bg-card"
          />
          {q && (
            <button onClick={() => setQ("")} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground" aria-label="Clear">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <CategoryFilter active={category} onChange={setCategory} counts={counts} />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/20 p-12 text-center">
          <Sparkles className="w-6 h-6 text-muted-foreground mx-auto mb-2" strokeWidth={1.5} />
          <p className="font-medium">No templates match</p>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            {q || category !== "all" ? "Try a different search or category — or generate one tailored to your use case." : "Generate the first AI template for your use case."}
          </p>
          <Button onClick={() => setDebateOpen(true)} variant="outline" size="sm" className="gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Generate template
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((t, i) => (
            <TemplateCard key={t.id} template={t} onPick={onPick} index={i} />
          ))}
        </div>
      )}

      <AIDebateDialog open={debateOpen} onOpenChange={setDebateOpen} onComplete={onAiComplete} />
    </div>
  );
}