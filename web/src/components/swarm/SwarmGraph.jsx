import React from "react";
import { motion } from "framer-motion";
import { Radio, Bot } from "lucide-react";

/**
 * Lightweight SVG graph: agents on a circle, message edges between them.
 * Edge thickness = message count, color = kind (verification / status / alert).
 */
export default function SwarmGraph({ agents, messages }) {
  const [hoverNode, setHoverNode] = React.useState(null);
  const [hoverEdge, setHoverEdge] = React.useState(null);

  // Layout: agents around a circle
  const W = 720;
  const H = 540;
  const cx = W / 2;
  const cy = H / 2;
  const R = Math.min(W, H) / 2 - 80;

  const nodes = React.useMemo(() => {
    if (agents.length === 0) return [];
    return agents.map((a, i) => {
      const angle = (i / agents.length) * Math.PI * 2 - Math.PI / 2;
      return {
        ...a,
        x: cx + Math.cos(angle) * R,
        y: cy + Math.sin(angle) * R,
      };
    });
  }, [agents]);

  const nodesById = React.useMemo(() => Object.fromEntries(nodes.map((n) => [n.id, n])), [nodes]);

  // Aggregate edges: from agent_id → each target_agent_id (or broadcast to all).
  const edges = React.useMemo(() => {
    const acc = new Map();
    for (const m of messages) {
      if (!m.agent_id || !nodesById[m.agent_id]) continue;
      const targets = (m.target_agent_ids || []).filter((t) => nodesById[t]);
      // For broadcasts with no targets, skip (no clear directed edge)
      for (const t of targets) {
        if (t === m.agent_id) continue;
        const key = `${m.agent_id}|${t}`;
        const prev = acc.get(key) || { from: m.agent_id, to: t, count: 0, kinds: {} };
        prev.count += 1;
        prev.kinds[m.kind] = (prev.kinds[m.kind] || 0) + 1;
        acc.set(key, prev);
      }
    }
    return Array.from(acc.values());
  }, [messages, nodesById]);

  const messageCountByAgent = React.useMemo(() => {
    const m = {};
    for (const msg of messages) {
      if (msg.agent_id) m[msg.agent_id] = (m[msg.agent_id] || 0) + 1;
    }
    return m;
  }, [messages]);

  if (nodes.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/20 p-16 text-center">
        <Bot className="w-7 h-7 text-muted-foreground mx-auto mb-2" strokeWidth={1.5} />
        <p className="font-medium">No agents to graph</p>
        <p className="text-sm text-muted-foreground mt-1">Create agents first — relationships will appear once they message each other.</p>
      </div>
    );
  }

  const maxCount = Math.max(1, ...edges.map((e) => e.count));

  const dominantKind = (kinds) =>
    Object.entries(kinds).sort((a, b) => b[1] - a[1])[0]?.[0];

  const kindColor = (k) => {
    if (k === "verification_request" || k === "verification_response") return "hsl(var(--primary))";
    if (k === "alert") return "hsl(var(--destructive))";
    if (k === "broadcast") return "hsl(var(--chart-3))";
    return "hsl(var(--chart-2))";
  };

  return (
    <div className="rounded-xl border border-border bg-card/40 overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-3 bg-accent/10">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-primary" />
          <h3 className="font-medium text-sm">Agent interaction graph</h3>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground">
          <Legend color="hsl(var(--primary))" label="verification" />
          <Legend color="hsl(var(--chart-3))" label="broadcast" />
          <Legend color="hsl(var(--destructive))" label="alert" />
          <Legend color="hsl(var(--chart-2))" label="status" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-0">
        <div className="relative">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" style={{ maxHeight: 540 }}>
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(var(--muted-foreground))" opacity="0.5" />
              </marker>
            </defs>

            {/* Edges */}
            {edges.map((e, i) => {
              const a = nodesById[e.from];
              const b = nodesById[e.to];
              if (!a || !b) return null;
              const k = dominantKind(e.kinds);
              const color = kindColor(k);
              const thickness = 1 + (e.count / maxCount) * 4;
              const isHover = hoverEdge === i;
              const isDimmed = (hoverNode && hoverNode !== a.id && hoverNode !== b.id) || (hoverEdge != null && !isHover);

              // shorten line so it ends at node radius
              const dx = b.x - a.x;
              const dy = b.y - a.y;
              const len = Math.sqrt(dx * dx + dy * dy);
              const r = 28;
              const x1 = a.x + (dx / len) * r;
              const y1 = a.y + (dy / len) * r;
              const x2 = b.x - (dx / len) * r;
              const y2 = b.y - (dy / len) * r;

              return (
                <motion.line
                  key={i}
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={color}
                  strokeWidth={thickness}
                  strokeOpacity={isDimmed ? 0.1 : isHover ? 0.95 : 0.55}
                  markerEnd="url(#arrow)"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8, delay: i * 0.02 }}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoverEdge(i)}
                  onMouseLeave={() => setHoverEdge(null)}
                />
              );
            })}

            {/* Nodes */}
            {nodes.map((n, i) => {
              const count = messageCountByAgent[n.id] || 0;
              const isActive = n.status === "active";
              const isHover = hoverNode === n.id;
              const isDimmed = hoverNode && !isHover;

              return (
                <motion.g
                  key={n.id}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: isDimmed ? 0.35 : 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  onMouseEnter={() => setHoverNode(n.id)}
                  onMouseLeave={() => setHoverNode(null)}
                  className="cursor-pointer"
                >
                  <circle cx={n.x} cy={n.y} r="28"
                    fill="hsl(var(--card))"
                    stroke={isActive ? "hsl(var(--primary))" : "hsl(var(--border))"}
                    strokeWidth={isHover ? 2.5 : 1.5}
                  />
                  {isActive && (
                    <circle cx={n.x} cy={n.y} r="32"
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth="1"
                      strokeOpacity="0.3"
                      className="pulse-dot"
                    />
                  )}
                  <text
                    x={n.x} y={n.y + 4}
                    textAnchor="middle"
                    fontFamily="var(--font-mono)"
                    fontSize="11"
                    fill="hsl(var(--foreground))"
                  >
                    {n.name?.slice(0, 4) || "—"}
                  </text>
                  {/* Message count chip */}
                  {count > 0 && (
                    <g>
                      <circle cx={n.x + 22} cy={n.y - 22} r="10" fill="hsl(var(--primary))" />
                      <text x={n.x + 22} y={n.y - 18} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10" fill="hsl(var(--primary-foreground))" fontWeight="600">
                        {count}
                      </text>
                    </g>
                  )}
                  {/* Hover label */}
                  {isHover && (
                    <text
                      x={n.x} y={n.y + 48}
                      textAnchor="middle"
                      fontFamily="var(--font-sans)"
                      fontSize="11"
                      fill="hsl(var(--foreground))"
                    >
                      {n.name}
                    </text>
                  )}
                </motion.g>
              );
            })}
          </svg>
        </div>

        {/* Side panel */}
        <div className="border-l border-border bg-background/30 p-4 text-xs">
          <p className="font-mono uppercase tracking-wider text-muted-foreground mb-3 text-[10px]">Network stats</p>
          <Stat label="Agents" value={nodes.length} />
          <Stat label="Edges" value={edges.length} />
          <Stat label="Messages" value={messages.length} />
          <Stat label="Active links" value={edges.filter((e) => e.count >= 2).length} />

          <p className="font-mono uppercase tracking-wider text-muted-foreground mt-5 mb-2 text-[10px]">Top talkers</p>
          <ul className="space-y-1.5">
            {nodes
              .map((n) => ({ ...n, count: messageCountByAgent[n.id] || 0 }))
              .sort((a, b) => b.count - a.count)
              .slice(0, 5)
              .map((n) => (
                <li key={n.id} className="flex items-center justify-between gap-2 truncate">
                  <span className="truncate">{n.name}</span>
                  <span className="font-mono text-muted-foreground shrink-0">{n.count}</span>
                </li>
              ))}
          </ul>

          {hoverEdge != null && edges[hoverEdge] && (
            <div className="mt-5 pt-4 border-t border-border">
              <p className="font-mono uppercase tracking-wider text-muted-foreground mb-2 text-[10px]">Selected link</p>
              <p className="font-medium">{nodesById[edges[hoverEdge].from]?.name} → {nodesById[edges[hoverEdge].to]?.name}</p>
              <p className="text-muted-foreground mt-1 font-mono">{edges[hoverEdge].count} message{edges[hoverEdge].count > 1 ? "s" : ""}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

function Stat({ label, value }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  );
}