import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/gctlClient";
import { Radio, Filter, MessageSquare, Network } from "lucide-react";
import PageHeader from "../components/app/PageHeader";
import MessageItem from "../components/swarm/MessageItem";
import ComposeMessage from "../components/swarm/ComposeMessage";
import SwarmGraph from "../components/swarm/SwarmGraph";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Swarm() {
  const qc = useQueryClient();
  const [view, setView] = React.useState("stream");
  const [filter, setFilter] = React.useState("all");
  const [respondingAs, setRespondingAs] = React.useState("");

  const { data: messages = [] } = useQuery({
    queryKey: ["agentMessages"],
    queryFn: () => base44.entities.AgentMessage.list("-created_date", 100),
    refetchInterval: 8000,
  });
  const { data: agents = [] } = useQuery({
    queryKey: ["agents"],
    queryFn: () => base44.entities.Agent.list(),
  });

  const agentsById = React.useMemo(
    () => Object.fromEntries(agents.map((a) => [a.id, a])),
    [agents]
  );

  React.useEffect(() => {
    if (!respondingAs && agents.length > 0) setRespondingAs(agents[0].id);
  }, [agents, respondingAs]);

  const create = useMutation({
    mutationFn: (data) => base44.entities.AgentMessage.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["agentMessages"] }),
  });

  const respond = async (msg, decision) => {
    const responder = agentsById[respondingAs];
    if (!responder) return;
    await base44.entities.AgentMessage.create({
      kind: "verification_response",
      agent_id: responder.id,
      agent_name: responder.name,
      subject: `${decision === "approved" ? "Approved" : "Rejected"}: ${msg.subject || "request"}`,
      body: decision === "approved"
        ? "Policy checks pass on my side. Cleared to proceed."
        : "Rejecting — policy or risk parameters do not align.",
      in_reply_to: msg.id,
      thread_id: msg.thread_id || msg.id,
      target_agent_ids: [msg.agent_id],
    });

    const responses = messages.filter((m) => m.in_reply_to === msg.id || m.thread_id === (msg.thread_id || msg.id));
    const total = (msg.target_agent_ids || []).length;
    const responsesNow = responses.length + 1;
    const anyRejected = decision === "rejected" || responses.some((r) => r.subject?.startsWith("Rejected"));

    let newStatus = msg.verification_status;
    if (anyRejected) newStatus = "rejected";
    else if (responsesNow >= total) newStatus = "approved";

    if (newStatus !== msg.verification_status) {
      await base44.entities.AgentMessage.update(msg.id, { verification_status: newStatus });
    }

    qc.invalidateQueries({ queryKey: ["agentMessages"] });
  };

  const filtered = messages.filter((m) => {
    if (filter === "all") return true;
    if (filter === "verification") return m.kind === "verification_request" || m.kind === "verification_response";
    if (filter === "pending") return m.kind === "verification_request" && m.verification_status === "pending";
    return m.kind === filter;
  });

  const pendingCount = messages.filter((m) => m.kind === "verification_request" && m.verification_status === "pending").length;

  return (
    <div className="flex-1">
      <PageHeader
        eyebrow="// swarm"
        title="Agent message bus"
        description="Shared real-time channel for status broadcasts and cross-agent verification on multi-stage moves."
        action={
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-1 p-0.5 rounded-md bg-card border border-border">
              <button
                onClick={() => setView("stream")}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition-colors ${view === "stream" ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                <MessageSquare className="w-3 h-3" /> Stream
              </button>
              <button
                onClick={() => setView("graph")}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition-colors ${view === "graph" ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Network className="w-3 h-3" /> Graph
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-primary pulse-dot" />
              <span className="text-xs font-mono text-muted-foreground">{messages.length} msgs · {pendingCount} pending</span>
            </div>
          </div>
        }
      />

      {view === "graph" ? (
        <div className="px-6 lg:px-10 py-8">
          <SwarmGraph agents={agents} messages={messages} />
        </div>
      ) : (
      <div className="px-6 lg:px-10 py-8 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
        <div>
          <div className="flex items-center justify-between mb-4 gap-3">
            <h2 className="font-medium flex items-center gap-2">
              Stream
              {pendingCount > 0 && <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">{pendingCount} need approval</span>}
            </h2>
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-muted-foreground" />
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="h-8 w-[170px] text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All messages</SelectItem>
                  <SelectItem value="pending">Pending verification</SelectItem>
                  <SelectItem value="verification">Verification thread</SelectItem>
                  <SelectItem value="status">Status updates</SelectItem>
                  <SelectItem value="broadcast">Broadcasts</SelectItem>
                  <SelectItem value="alert">Alerts</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mb-3 flex items-center gap-2 text-xs">
            <span className="font-mono text-muted-foreground">Acting as:</span>
            <Select value={respondingAs} onValueChange={setRespondingAs}>
              <SelectTrigger className="h-7 w-[200px] text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {agents.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card/20 p-12 text-center">
              <Radio className="w-6 h-6 text-primary mx-auto mb-2" strokeWidth={1.5} />
              <p className="font-medium">Quiet on the bus</p>
              <p className="text-sm text-muted-foreground mt-1">Post the first message from the panel on the right.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((m) => (
                <MessageItem
                  key={m.id}
                  message={m}
                  agentsById={agentsById}
                  onRespond={respond}
                  currentAgentId={respondingAs}
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="font-medium mb-4">Compose</h2>
          <ComposeMessage agents={agents} onSend={(d) => create.mutate(d)} />
        </div>
      </div>
      )}
    </div>
  );
}