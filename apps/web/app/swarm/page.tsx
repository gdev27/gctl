import { PageHeader } from "../../components/page-header";

const roles = [
  {
    id: "planner",
    role: "Planner",
    job: "Creates policy-aware intent from treasury objective.",
    output: "Intent draft and routing preference."
  },
  {
    id: "researcher",
    role: "Researcher",
    job: "Enriches context with market and risk signals.",
    output: "Market context and risk annotations."
  },
  {
    id: "critic",
    role: "Critic",
    job: "Challenges unsafe plans and requests revision.",
    output: "Veto decision and revision request."
  },
  {
    id: "executor",
    role: "Executor",
    job: "Runs approved actions through KeeperHub and records proofs.",
    output: "Run status and evidence pointers."
  }
];

export default function SwarmPage() {
  return (
    <section className="page">
      <PageHeader
        eyebrow="Swarm Loop"
        title="Role-by-role execution lifecycle"
        description="Understand what each agent contributes before execution moves to the next stage."
      />
      <div className="grid grid-3">
        {roles.map((role) => (
          <article key={role.id} className="card">
            <h3>{role.role}</h3>
            <p className="muted">{role.job}</p>
            <p className="field-label">Latest output</p>
            <p>{role.output}</p>
          </article>
        ))}
      </div>
      <article className="card">
        <h3>Shared memory and identity guarantees</h3>
        <p className="muted">
          Each role writes and reads encrypted memory artifacts, while ENS passport metadata enforces identity
          semantics.
        </p>
        <p className="mb-0">
          The critic can block unsafe plans before the executor submits any onchain action.
        </p>
      </article>
    </section>
  );
}
