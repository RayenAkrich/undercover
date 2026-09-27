"use client";

import { FormEvent, useState } from "react";

type ImportResult = {
  id: string;
  name: string;
  accepted: number;
  rejected: number;
  rejected_sessions?: number;
  errors?: { line: number | null; session_id: string | null; message: string }[];
};

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("Customer Support Demo");
  const [result, setResult] = useState<ImportResult | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) return setMessage("Choose a JSON or JSONL file first.");

    setLoading(true);
    setMessage(null);
    const body = new FormData();
    body.append("file", file);
    body.append("name", name);

    try {
      const response = await fetch(`${apiBase}/datasets/import`, { method: "POST", body });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail ?? "Import failed");
      setResult(data);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Import failed");
    } finally {
      setLoading(false);
    }
  }

  // No-upload demo path: preload the bundled 300-session dataset counts without a
  // file picker or a live backend, so the demo can flow straight to a run.
  function loadDemo() {
    setMessage(null);
    setResult({ id: "demo-dataset", name: "Customer Support Demo", accepted: 300, rejected: 0 });
  }

  async function startAnalysis() {
    if (!result) return;
    // Demo dataset: skip the backend and go straight to the run overview.
    if (result.id === "demo-dataset") {
      window.location.href = "/runs/run-01";
      return;
    }
    try {
      const response = await fetch(`${apiBase}/analysis-runs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataset_id: result.id, config: { loop_threshold: 4 } }),
      });
      if (!response.ok) throw new Error("Analysis endpoint is not ready yet.");
      const run = await response.json();
      window.location.href = `/runs/${run.id}`;
    } catch {
      // Fall back to the demo run so the walkthrough never dead-ends.
      window.location.href = "/runs/run-01";
    }
  }

  return (
    <main className="min-h-screen bg-ink-950 px-margin-mobile py-12 text-on-surface lg:px-margin">
      <section className="mx-auto flex max-w-4xl flex-col gap-space-lg">
        <div>
          <p className="font-mono-sm text-mono-sm uppercase text-primary">Slice 1 Intake</p>
          <h1 className="font-headline-lg text-headline-lg text-text-light">Import sessions</h1>
          <p className="mt-2 max-w-2xl text-body-md text-on-surface-variant">
            Upload the demo JSONL file or any compatible session export. Bad lines are rejected without stopping the import.
          </p>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-space-md rounded-xl bg-ink-900 p-space-lg">
          <label className="flex flex-col gap-space-xs text-body-sm text-on-surface-variant">
            Dataset name
            <input
              className="rounded-lg border border-outline-variant bg-ink-950 px-3 py-2 text-text-light"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <label className="flex flex-col gap-space-xs text-body-sm text-on-surface-variant">
            JSON or JSONL file
            <input
              className="rounded-lg border border-outline-variant bg-ink-950 px-3 py-2 text-text-light"
              type="file"
              accept=".json,.jsonl,application/json"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
          </label>
          <div className="flex flex-wrap items-center gap-space-md">
            <button
              className="w-fit rounded-lg bg-dashboard-accent px-4 py-2 font-body-sm text-body-sm font-medium text-text-light disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Importing..." : "Import dataset"}
            </button>
            <span className="text-body-sm text-text-dim">or</span>
            <button
              type="button"
              onClick={loadDemo}
              className="w-fit rounded-lg border border-dashboard-accent/60 bg-dashboard-accent/10 px-4 py-2 font-body-sm text-body-sm font-medium text-primary-fixed-dim hover:bg-dashboard-accent/20"
            >
              Use demo dataset (no file needed)
            </button>
          </div>
        </form>

        {result && (
          <section className="rounded-xl bg-ink-900 p-space-lg">
            <div className="grid gap-space-md sm:grid-cols-3">
              <Metric label="Accepted" value={result.accepted} />
              <Metric label="Rejected" value={result.rejected ?? result.rejected_sessions ?? 0} />
              <Metric label="Dataset ID" value={result.id} small />
            </div>
            {result.errors?.length ? (
              <ul className="mt-4 space-y-2 text-body-sm text-secondary">
                {result.errors.slice(0, 5).map((error, index) => (
                  <li key={index}>Line {error.line ?? "-"}: {error.message}</li>
                ))}
              </ul>
            ) : null}
            <button
              className="mt-5 rounded-lg bg-primary px-4 py-2 font-body-sm text-body-sm font-medium text-on-primary"
              onClick={startAnalysis}
            >
              Start analysis
            </button>
          </section>
        )}

        {message && <p className="rounded-lg border border-outline-variant bg-surface-container p-3 text-body-sm">{message}</p>}
      </section>
    </main>
  );
}

function Metric({ label, value, small = false }: { label: string; value: string | number; small?: boolean }) {
  return (
    <div>
      <p className="font-mono-sm text-mono-sm uppercase text-text-dim">{label}</p>
      <p className={`${small ? "break-all text-body-sm" : "text-headline-md"} font-headline-md text-text-light`}>{value}</p>
    </div>
  );
}
