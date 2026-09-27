type RunSummary = {
  sessions_analyzed?: number;
  failure_events?: number;
  clusters?: number;
  status?: string;
};

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

async function getSummary(runId: string): Promise<RunSummary> {
  try {
    const response = await fetch(`${apiBase}/analysis-runs/${runId}/summary`, { cache: "no-store" });
    if (!response.ok) throw new Error("missing");
    return response.json();
  } catch {
    return { sessions_analyzed: 300, failure_events: 60, clusters: 5, status: "DEMO_PLACEHOLDER" };
  }
}

export default async function RunPage({ params }: { params: { runId: string } }) {
  const summary = await getSummary(params.runId);

  return (
    <main className="min-h-screen bg-ink-950 px-margin-mobile py-12 text-on-surface lg:px-margin">
      <section className="mx-auto flex max-w-5xl flex-col gap-space-lg">
        <div>
          <p className="font-mono-sm text-mono-sm uppercase text-primary">Run {params.runId}</p>
          <h1 className="font-headline-lg text-headline-lg text-text-light">Analysis summary</h1>
          <p className="mt-2 text-body-md text-on-surface-variant">
            Placeholder-safe summary for the demo. Slice 4 can replace these numbers from the analysis API.
          </p>
        </div>
        <div className="grid gap-space-md sm:grid-cols-3">
          <Metric label="Sessions" value={summary.sessions_analyzed ?? 0} />
          <Metric label="Failures" value={summary.failure_events ?? 0} />
          <Metric label="Clusters" value={summary.clusters ?? 0} />
        </div>
        <p className="rounded-lg bg-ink-900 p-3 font-mono-sm text-mono-sm uppercase text-text-dim">
          Status: {summary.status ?? "SUMMARY_READY"}
        </p>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-ink-900 p-space-lg">
      <p className="font-mono-sm text-mono-sm uppercase text-text-dim">{label}</p>
      <p className="font-headline-lg text-headline-lg text-text-light">{value}</p>
    </div>
  );
}
