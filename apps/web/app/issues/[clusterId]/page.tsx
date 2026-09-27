type Priority = {
  impact: number;
  frequency: number;
  severity: number;
  reach: number;
  confidence: number;
  score: number;
  label: string;
};

type Cluster = {
  id: string;
  title: string;
  summary: string;
  likely_contributing_factor: string;
  occurrence_count: number;
  affected_sessions: number;
  first_seen: string | null;
  last_seen: string | null;
  priority: Priority;
  top_tools: string[];
  agent_versions: Record<string, number>;
  representative_failure_ids: string[];
};

type Member = {
  failure_event_id: string;
  is_representative: boolean;
  event: {
    session_id: string;
    failure_type: string;
    workflow: string;
    tool_name: string;
    semantic_summary: string;
    expected_value?: unknown;
    observed_value?: unknown;
    evidence_refs?: string[];
  };
};

const fallbackCluster: Cluster = {
  id: "demo-cluster",
  title: "Duplicate refunds after retry",
  summary: "8 events show duplicate action in refund via refund_order.",
  likely_contributing_factor: "Retry handling may lack idempotency protection.",
  occurrence_count: 8,
  affected_sessions: 8,
  first_seen: "2026-09-27T10:00:00+00:00",
  last_seen: "2026-09-27T10:07:00+00:00",
  priority: { impact: 90, frequency: 100, severity: 91, reach: 100, confidence: 92, score: 94, label: "P0" },
  top_tools: ["refund_order"],
  agent_versions: { v3: 4, v4: 4 },
  representative_failure_ids: ["demo-1", "demo-2", "demo-3"],
};

const fallbackMembers: Member[] = [
  {
    failure_event_id: "demo-1",
    is_representative: true,
    event: {
      session_id: "session-1-1",
      failure_type: "DUPLICATE_ACTION",
      workflow: "refund",
      tool_name: "refund_order",
      semantic_summary: "Refund executed twice after timeout in refund session 1",
      evidence_refs: ["event-0-0-tool"],
    },
  },
];

async function getIssue(clusterId: string) {
  const apiBase = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1").replace(/\/$/, "");
  try {
    const [clusterRes, membersRes] = await Promise.all([
      fetch(`${apiBase}/clusters/${clusterId}`, { cache: "no-store" }),
      fetch(`${apiBase}/clusters/${clusterId}/members`, { cache: "no-store" }),
    ]);
    if (!clusterRes.ok || !membersRes.ok) throw new Error("API unavailable");
    const cluster = (await clusterRes.json()) as Cluster;
    const members = (await membersRes.json()) as { items: Member[] };
    return { cluster, members: members.items };
  } catch {
    return { cluster: { ...fallbackCluster, id: clusterId }, members: fallbackMembers };
  }
}

export default async function IssuePage({ params }: { params: { clusterId: string } }) {
  const { cluster, members } = await getIssue(params.clusterId);
  const representativeMembers = members.filter((member) => member.is_representative).slice(0, 5);
  const first = representativeMembers[0]?.event ?? members[0]?.event;

  return (
    <main className="min-h-screen bg-ink-950 px-margin-mobile py-10 text-on-surface lg:px-margin">
      <section className="mx-auto flex max-w-6xl flex-col gap-space-xl">
        <div className="flex flex-col gap-space-md border-b border-outline-variant pb-space-lg">
          <div className="flex flex-wrap items-center gap-space-sm">
            <span className="rounded bg-p0 px-2 py-1 font-mono-sm text-mono-sm font-bold text-text-light">
              {cluster.priority.label}
            </span>
            <span className="font-mono-sm text-mono-sm uppercase text-text-dim">
              Score {cluster.priority.score} · {cluster.occurrence_count} occurrences
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg font-bold text-text-light">
            {cluster.title}
          </h1>
          <p className="max-w-3xl font-body-lg text-body-lg text-on-surface-variant">
            {cluster.summary}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-space-md md:grid-cols-4">
          <Stat label="Affected sessions" value={cluster.affected_sessions} />
          <Stat label="Top tool" value={cluster.top_tools[0] || "unknown"} />
          <Stat label="First seen" value={formatDate(cluster.first_seen)} />
          <Stat label="Last seen" value={formatDate(cluster.last_seen)} />
        </div>

        <section className="grid gap-space-md md:grid-cols-5">
          <Score label="Impact" value={cluster.priority.impact} />
          <Score label="Frequency" value={cluster.priority.frequency} />
          <Score label="Severity" value={cluster.priority.severity} />
          <Score label="Reach" value={cluster.priority.reach} />
          <Score label="Confidence" value={cluster.priority.confidence} />
        </section>

        <section className="grid gap-space-lg lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-xl bg-ink-900 p-space-lg">
            <h2 className="font-headline-sm text-headline-sm font-semibold text-text-light">
              Behavior pattern
            </h2>
            <div className="mt-space-md grid gap-space-sm font-body-md text-body-md">
              <Pattern label="Intent" value={`${first?.workflow || "workflow"} request`} />
              <Pattern label="Action" value={`${first?.tool_name || "tool"} executed`} />
              <Pattern label="Outcome" value={first?.semantic_summary || cluster.summary} />
            </div>
          </div>

          <div className="rounded-xl bg-ink-900 p-space-lg">
            <h2 className="font-headline-sm text-headline-sm font-semibold text-text-light">
              AI hypothesis
            </h2>
            <p className="mt-space-md font-body-md text-body-md text-on-surface-variant">
              {cluster.likely_contributing_factor}
            </p>
          </div>
        </section>

        <section className="rounded-xl bg-ink-900 p-space-lg">
          <h2 className="font-headline-sm text-headline-sm font-semibold text-text-light">
            Representative evidence
          </h2>
          <div className="mt-space-md grid gap-space-sm">
            {representativeMembers.map((member) => (
              <a
                key={member.failure_event_id}
                href={`/sessions/${member.event.session_id}`}
                className="rounded-lg bg-ink-950 p-space-md font-body-md text-body-md text-on-surface-variant hover:text-text-light"
              >
                <span className="font-mono-sm text-mono-sm text-primary">
                  {member.event.session_id}
                </span>
                <span className="block">{member.event.semantic_summary}</span>
              </a>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-ink-900 p-space-md">
      <div className="font-mono-sm text-mono-sm uppercase text-text-dim">{label}</div>
      <div className="mt-1 font-headline-sm text-headline-sm font-semibold text-text-light">{value}</div>
    </div>
  );
}

function Score({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-ink-900 p-space-md">
      <div className="flex items-center justify-between font-mono-sm text-mono-sm uppercase text-text-dim">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="mt-space-sm h-2 overflow-hidden rounded-full bg-ink-950">
        <div className="h-full rounded-full bg-dashboard-accent" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function Pattern({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-ink-950 p-space-md">
      <div className="font-mono-sm text-mono-sm uppercase text-text-dim">{label}</div>
      <div className="mt-1 text-text-light">{value}</div>
    </div>
  );
}

function formatDate(value: string | null) {
  if (!value) return "unknown";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}
