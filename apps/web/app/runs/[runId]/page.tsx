import type { Metadata } from "next";
import { getSummary } from "@/lib/api";

export const metadata: Metadata = {
  title: "Run Overview — Undercover",
  description: "Progress and summary of the analysis run.",
};

export default async function RunPage({
  params,
}: {
  params: { runId: string };
}) {
  const S = await getSummary(params.runId);
  return (
    <>
<header className="fixed top-0 left-0 w-full z-50 bg-ink-950/95 backdrop-blur-xl border-b border-outline-variant/30 shadow-[0_1px_8px_rgba(0,0,0,0.4)]"><div className="h-16 w-full px-gutter flex items-center justify-between gap-space-md"><div className="flex items-center gap-space-lg"><div className="flex items-center gap-space-sm"><div className="w-8 h-8 rounded bg-surface-container-high border border-outline-variant/40 flex items-center justify-center text-primary"><span className="material-symbols-outlined text-[20px]">fingerprint</span></div><div className="flex flex-col"><span className="font-headline-sm text-headline-sm tracking-tight text-text-light leading-none">UNDERCOVER</span><span className="font-mono-sm text-mono-sm text-primary tracking-widest leading-none mt-1">INVESTIGATIVE APM</span></div></div><div className="h-6 w-[1px] bg-outline-variant/30 hidden md:block"></div><nav className="hidden md:flex items-center gap-space-xs" data-active-classes="bg-ink-800 text-text-light border border-outline-variant/50"><a className="px-space-md py-space-xs rounded font-body-sm text-body-sm text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors" data-path="issue-inbox" href="/inbox">Issue Inbox</a><a aria-current="page" className="px-space-md py-space-xs rounded font-body-sm transition-colors bg-ink-800 text-text-light border border-outline-variant/50" data-path="runs" href="#">Runs</a><a className="px-space-md py-space-xs rounded font-body-sm text-body-sm text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors" data-path="benchmark" href="#">Benchmark</a><a className="px-space-md py-space-xs rounded font-body-sm text-body-sm text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors" data-path="import" href="#">Import</a></nav></div><div className="flex items-center gap-space-md"><div className="hidden lg:flex items-center gap-space-xs bg-ink-900 border border-outline-variant/30 px-space-sm py-1 rounded"><span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span><span className="font-mono-sm text-mono-sm text-text-light font-bold ml-1">LIVE</span><span className="font-mono-sm text-mono-sm text-text-dim">42 spans/sec</span></div><div className="hidden xl:flex items-center gap-space-xs bg-surface-container-lowest border border-outline-variant/40 px-space-sm py-1 rounded"><span className="material-symbols-outlined text-[14px] text-text-dim">terminal</span><span className="font-mono-sm text-mono-sm text-on-surface-variant">prod-agent-checkout</span></div><button className="flex items-center gap-space-xs bg-ink-900 hover:bg-surface-container-high border border-outline-variant/40 px-space-sm py-1.5 rounded transition-colors text-left"><span className="material-symbols-outlined text-[16px] text-tertiary">shield_lock</span><span className="font-body-sm text-body-sm text-text-light">Acme Intelligence</span><span className="material-symbols-outlined text-[16px] text-text-dim">expand_more</span></button><div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0"><span className="material-symbols-outlined text-on-primary text-[18px]">person</span></div></div></div></header><main className="w-full pt-16 bg-ink-950 min-h-[calc(100vh-2.5rem)]"><div className="flex flex-col w-full">

<div className="relative w-full px-gutter py-space-lg max-w-[1400px] mx-auto space-y-space-xl">

<div className="relative bg-ink-800 rounded-xl p-space-lg shadow-xl overflow-hidden">

<div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-dashboard-accent/10 blur-3xl pointer-events-none"></div>
<div className="absolute left-1/3 -bottom-10 w-96 h-20 bg-primary/5 blur-2xl pointer-events-none"></div>

<div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">

<div className="space-y-space-xs">

<div className="flex items-center gap-space-xs font-mono-sm text-mono-sm text-text-dim tracking-wider uppercase">
<span className="hover:text-primary transition-colors cursor-pointer">SYSTEM_INVESTIGATION</span>
<span className="text-outline-variant">/</span>
<span className="hover:text-primary transition-colors cursor-pointer">HARNESS_RUNS</span>
<span className="text-outline-variant">/</span>
<span className="text-primary font-bold">RUN_8F3A29B</span>
</div>

<div className="flex flex-wrap items-center gap-space-md pt-1">
<h1 className="font-headline-lg text-headline-lg text-text-light tracking-tight flex items-center gap-space-sm">
              Run Overview
              <span className="font-mono-lg text-mono-lg text-text-dim font-normal">
                // run_8f3a-92bc-c21d
              </span>
</h1>
<div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-mono-sm text-mono-sm font-semibold shadow-[0_0_12px_rgba(16,185,129,0.25)]">
<span className="relative flex h-2 w-2">
<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
<span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
</span>
<span>COMPLETED</span>
</div>

<div className="hidden sm:inline-flex items-center px-2 py-0.5 rounded font-stamp-badge text-stamp-badge text-p0/90 -rotate-3 select-none bg-p0/10">
              VERIFIED DOSSIER
            </div>
</div>
</div>

<div className="flex flex-wrap items-center gap-space-sm pt-2 lg:pt-0">
<button className="bg-dashboard-accent hover:bg-dashboard-accent/90 text-text-light font-body-sm text-body-sm font-medium px-space-md py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-dashboard-accent/30 transition-all hover:shadow-dashboard-accent/50 active:scale-98">
<span className="material-symbols-outlined text-[18px]">inbox</span>
<span>Open Issue Inbox</span>
<span className="px-1.5 py-0.2 bg-white/20 rounded font-mono-sm text-mono-sm font-bold">5</span>
</button>
<button className="bg-surface-container-high hover:bg-surface-bright text-text-light font-body-sm text-body-sm px-space-md py-2 rounded-lg flex items-center gap-2 transition-all active:scale-98">
<span className="material-symbols-outlined text-[18px] text-tertiary">science</span>
<span>Run Evaluation</span>
</button>
<button className="bg-surface-container-low hover:bg-surface-container-high text-text-dim hover:text-text-light p-2 rounded-lg transition-colors flex items-center justify-center" title="Export Run JSONL">
<span className="material-symbols-outlined text-[20px]">download</span>
</button>
</div>
</div>

<div className="mt-space-lg pt-space-md bg-surface-container-lowest/60 rounded-lg p-space-md grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-space-md font-mono-sm text-mono-sm">
<div className="flex flex-col">
<span className="text-text-dim text-[10px] uppercase tracking-wider font-semibold">Dataset</span>
<span className="text-text-light font-medium truncate mt-0.5">Customer Support Demo (v2.4 - prod)</span>
</div>
<div className="flex flex-col">
<span className="text-text-dim text-[10px] uppercase tracking-wider font-semibold">Started</span>
<span className="text-text-light font-medium mt-0.5">Oct 24, 2024 · 04:02:11 UTC</span>
</div>
<div className="flex flex-col">
<span className="text-text-dim text-[10px] uppercase tracking-wider font-semibold">Finished (Duration)</span>
<span className="text-text-light font-medium mt-0.5">04:05:43 UTC <span className="text-primary font-bold">(3m 32s)</span></span>
</div>
<div className="flex flex-col">
<span className="text-text-dim text-[10px] uppercase tracking-wider font-semibold">Target Agent</span>
<span className="text-tertiary-fixed-dim font-medium flex items-center gap-1 mt-0.5 truncate">
<span className="material-symbols-outlined text-[13px]">smart_toy</span>
            checkout-worker-v3.0.4
          </span>
</div>
<div className="flex flex-col col-span-2 md:col-span-1">
<span className="text-text-dim text-[10px] uppercase tracking-wider font-semibold">Span Ingestion Window</span>
<span className="text-text-light font-medium mt-0.5">span_001928 → span_048120</span>
</div>
</div>
</div>

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-space-md">

<div className="bg-ink-800 rounded-xl p-5 shadow-lg relative overflow-hidden group hover:shadow-primary/10 transition-all">
<div className="flex items-center justify-between text-text-dim font-mono-sm text-mono-sm uppercase tracking-wider">
<span>Sessions Analyzed</span>
<span className="material-symbols-outlined text-[18px] text-text-dim group-hover:text-primary transition-colors">folder_supervised</span>
</div>
<div className="font-headline-lg text-[40px] leading-tight text-text-light font-bold mt-2">
          {S.sessions_analyzed}
        </div>
<div className="mt-2 text-text-dim font-body-sm text-body-sm flex items-center gap-1.5">
<span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0"></span>
<span className="truncate">100% trace coverage · OTEL</span>
</div>
<div className="absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-primary to-transparent opacity-40"></div>
</div>

<div className="bg-ink-800 rounded-xl p-5 shadow-lg relative overflow-hidden group hover:shadow-p2/10 transition-all">
<div className="flex items-center justify-between text-p2 font-mono-sm text-mono-sm uppercase tracking-wider">
<span>Suspicious Sessions</span>
<span className="material-symbols-outlined text-[18px] text-p2">warning</span>
</div>
<div className="font-headline-lg text-[40px] leading-tight text-p2 font-bold mt-2">
          {S.candidate_sessions}
        </div>
<div className="mt-2 text-text-dim font-body-sm text-body-sm flex items-center gap-1.5">
<span className="h-1.5 w-1.5 rounded-full bg-p2 shrink-0"></span>
<span>28.0% candidate triage rate</span>
</div>
<div className="absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-p2 to-transparent opacity-60"></div>
</div>

<div className="bg-ink-800 rounded-xl p-5 shadow-lg relative overflow-hidden group hover:shadow-p0/15 transition-all">
<div className="flex items-center justify-between text-p0 font-mono-sm text-mono-sm uppercase tracking-wider">
<span>Failure Events</span>
<span className="material-symbols-outlined text-[18px] text-p0">crisis_alert</span>
</div>
<div className="font-headline-lg text-[40px] leading-tight text-p0 font-bold mt-2 flex items-baseline gap-2">
          {S.failure_events}
          <span className="font-stamp-badge text-stamp-badge text-p0 uppercase tracking-widest bg-p0/15 px-1.5 py-0.5 rounded">P0 SPIKE</span>
</div>
<div className="mt-2 text-text-dim font-body-sm text-body-sm flex items-center gap-1.5">
<span className="h-1.5 w-1.5 rounded-full bg-p0 shrink-0"></span>
<span className="truncate">Silent status 200 anomalies</span>
</div>
<div className="absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-p0 to-transparent opacity-70"></div>
</div>

<div className="bg-ink-800 rounded-xl p-5 shadow-lg relative overflow-hidden group hover:shadow-dashboard-accent/20 transition-all">
<div className="flex items-center justify-between text-primary font-mono-sm text-mono-sm uppercase tracking-wider">
<span>Recurring Clusters</span>
<span className="material-symbols-outlined text-[18px] text-dashboard-accent">account_tree</span>
</div>
<div className="font-headline-lg text-[40px] leading-tight text-primary font-bold mt-2">
          {S.clusters}
        </div>
<div className="mt-2 text-text-dim font-body-sm text-body-sm flex items-center gap-1.5">
<span className="h-1.5 w-1.5 rounded-full bg-dashboard-accent shrink-0"></span>
<span className="truncate">Deduplicated signatures</span>
</div>
<div className="absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-dashboard-accent to-transparent opacity-60"></div>
</div>

<div className="bg-ink-800 rounded-xl p-5 shadow-lg relative overflow-hidden group">
<div className="flex items-center justify-between text-text-dim font-mono-sm text-mono-sm uppercase tracking-wider">
<span>Noise / Outliers</span>
<span className="material-symbols-outlined text-[18px] text-text-dim">grain</span>
</div>
<div className="font-headline-lg text-[40px] leading-tight text-text-light font-bold mt-2">
          {S.noise_failures}
        </div>
<div className="mt-2 text-text-dim font-body-sm text-body-sm flex items-center gap-1.5">
<span className="h-1.5 w-1.5 rounded-full bg-text-dim shrink-0"></span>
<span className="truncate">Isolated span anomalies</span>
</div>
<div className="absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-surface-bright to-transparent opacity-40"></div>
</div>
</div>

<div className="bg-ink-800 rounded-xl p-space-lg shadow-xl space-y-space-md">

<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs pb-space-sm">
<div className="flex items-center gap-space-sm">
<span className="material-symbols-outlined text-primary text-[22px]">troubleshoot</span>
<h2 className="font-headline-sm text-headline-sm text-text-light">
            Forensic Ingestion &amp; Inference Pipeline
          </h2>
</div>
<div className="inline-flex items-center gap-2 self-start sm:self-auto px-3 py-1 bg-surface-container-lowest rounded font-mono-sm text-mono-sm text-text-dim">
<span className="h-2 w-2 rounded-full bg-dashboard-accent animate-pulse"></span>
<span>LATENCY:</span>
<span className="text-text-light font-bold">212.4s TOTAL</span>
</div>
</div>

<div className="relative pt-2">

<div className="hidden lg:block absolute top-[28px] left-[4%] right-[4%] h-[2px] bg-gradient-to-r from-emerald-500 via-emerald-400 to-dashboard-accent shadow-[0_0_8px_rgba(16,185,129,0.3)] z-0"></div>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-space-md relative z-10">

<div className="bg-surface-container-lowest/80 lg:bg-transparent rounded-lg p-3 lg:p-0 flex flex-col space-y-2">
<div className="flex items-center gap-2">
<div className="w-8 h-8 rounded-full bg-emerald-500 text-ink-950 flex items-center justify-center font-mono-sm font-bold shadow-md shadow-emerald-500/20">
<span className="material-symbols-outlined text-[18px]">check</span>
</div>
<span className="font-mono-sm text-mono-sm text-text-dim">01</span>
</div>
<div>
<div className="font-headline-sm text-[16px] text-text-light font-bold">Imported</div>
<div className="font-mono-sm text-mono-sm text-emerald-400/90 mt-0.5">04:02:11 UTC</div>
<div className="font-body-sm text-[12px] text-text-dim mt-1">300 traces ingested via gRPC</div>
</div>
</div>

<div className="bg-surface-container-lowest/80 lg:bg-transparent rounded-lg p-3 lg:p-0 flex flex-col space-y-2">
<div className="flex items-center gap-2">
<div className="w-8 h-8 rounded-full bg-emerald-500 text-ink-950 flex items-center justify-center font-mono-sm font-bold shadow-md shadow-emerald-500/20">
<span className="material-symbols-outlined text-[18px]">check</span>
</div>
<span className="font-mono-sm text-mono-sm text-text-dim">02</span>
</div>
<div>
<div className="font-headline-sm text-[16px] text-text-light font-bold">Normalized</div>
<div className="font-mono-sm text-mono-sm text-emerald-400/90 mt-0.5">04:02:44 UTC</div>
<div className="font-body-sm text-[12px] text-text-dim mt-1">AST &amp; tool schema mapped</div>
</div>
</div>

<div className="bg-surface-container-lowest/80 lg:bg-transparent rounded-lg p-3 lg:p-0 flex flex-col space-y-2">
<div className="flex items-center gap-2">
<div className="w-8 h-8 rounded-full bg-emerald-500 text-ink-950 flex items-center justify-center font-mono-sm font-bold shadow-md shadow-emerald-500/20">
<span className="material-symbols-outlined text-[18px]">check</span>
</div>
<span className="font-mono-sm text-mono-sm text-text-dim">03</span>
</div>
<div>
<div className="font-headline-sm text-[16px] text-text-light font-bold">Detected</div>
<div className="font-mono-sm text-mono-sm text-emerald-400/90 mt-0.5">04:03:19 UTC</div>
<div className="font-body-sm text-[12px] text-text-dim mt-1">84 candidates flagged via deterministic AST</div>
</div>
</div>

<div className="bg-surface-container-lowest/80 lg:bg-transparent rounded-lg p-3 lg:p-0 flex flex-col space-y-2">
<div className="flex items-center gap-2">
<div className="w-8 h-8 rounded-full bg-emerald-500 text-ink-950 flex items-center justify-center font-mono-sm font-bold shadow-md shadow-emerald-500/20">
<span className="material-symbols-outlined text-[18px]">check</span>
</div>
<span className="font-mono-sm text-mono-sm text-text-dim">04</span>
</div>
<div>
<div className="font-headline-sm text-[16px] text-text-light font-bold">Judged</div>
<div className="font-mono-sm text-mono-sm text-emerald-400/90 mt-0.5">04:04:22 UTC</div>
<div className="font-body-sm text-[12px] text-text-dim mt-1">Dual-evaluator semantic arbitration</div>
</div>
</div>

<div className="bg-surface-container-lowest/80 lg:bg-transparent rounded-lg p-3 lg:p-0 flex flex-col space-y-2">
<div className="flex items-center gap-2">
<div className="w-8 h-8 rounded-full bg-emerald-500 text-ink-950 flex items-center justify-center font-mono-sm font-bold shadow-md shadow-emerald-500/20">
<span className="material-symbols-outlined text-[18px]">check</span>
</div>
<span className="font-mono-sm text-mono-sm text-text-dim">05</span>
</div>
<div>
<div className="font-headline-sm text-[16px] text-text-light font-bold">Clustered</div>
<div className="font-mono-sm text-mono-sm text-emerald-400/90 mt-0.5">04:05:08 UTC</div>
<div className="font-body-sm text-[12px] text-text-dim mt-1">HDBSCAN latent cluster convergence</div>
</div>
</div>

<div className="bg-surface-container-lowest/80 lg:bg-transparent rounded-lg p-3 lg:p-0 flex flex-col space-y-2">
<div className="flex items-center gap-2">
<div className="w-8 h-8 rounded-full bg-dashboard-accent text-text-light flex items-center justify-center font-mono-sm font-bold shadow-md shadow-dashboard-accent/30 ring-2 ring-primary/40">
<span className="material-symbols-outlined text-[18px]">done_all</span>
</div>
<span className="font-mono-sm text-mono-sm text-primary font-bold">06</span>
</div>
<div>
<div className="font-headline-sm text-[16px] text-text-light font-bold">Prioritized</div>
<div className="font-mono-sm text-mono-sm text-primary mt-0.5">04:05:43 UTC</div>
<div className="font-body-sm text-[12px] text-text-dim mt-1">Bayesian severity ranking &amp; P0-P2 tagging</div>
</div>
</div>
</div>
</div>
</div>

<div className="bg-ink-800 rounded-xl p-space-lg shadow-xl space-y-space-md">
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
<div>
<div className="flex items-center gap-2">
<h2 className="font-headline-sm text-headline-sm text-text-light">
              Cluster Signatures Identified in this Run
            </h2>
<span className="px-2 py-0.5 rounded font-mono-sm text-mono-sm bg-dashboard-accent/20 text-primary font-bold">
              5 SIGNATURES
            </span>
</div>
<p className="font-body-sm text-body-sm text-text-dim mt-1">
            Aggregated cross-session failure patterns grouped by semantic tool invocation fingerprints.
          </p>
</div>
<div className="flex items-center gap-2">
<span className="font-mono-sm text-mono-sm text-text-dim">Sort by:</span>
<span className="font-mono-sm text-mono-sm text-text-light bg-surface-container-high px-2 py-1 rounded">Severity (P0 → P2)</span>
</div>
</div>

<div className="overflow-x-auto">
<table className="w-full text-left font-body-sm text-body-sm">
<thead>
<tr className="bg-surface-container-lowest/80 text-text-dim font-mono-sm text-mono-sm uppercase tracking-wider">
<th className="py-3 px-4 rounded-l">Dossier ID</th>
<th className="py-3 px-4">Priority</th>
<th className="py-3 px-4">Failure Signature &amp; Root Cause</th>
<th className="py-3 px-4 text-right">Event Count</th>
<th className="py-3 px-4 text-right">Affected Sessions</th>
<th className="py-3 px-4">Impact / Blast Radius</th>
<th className="py-3 px-4 text-center rounded-r">Action</th>
</tr>
</thead>
<tbody className="space-y-1">

<tr className="hover:bg-surface-container-high/40 transition-colors group">
<td className="py-3.5 px-4 font-mono-md text-mono-md text-primary font-bold">
<span className="group-hover:underline cursor-pointer">CASE-042</span>
</td>
<td className="py-3.5 px-4">
<span className="inline-flex items-center px-2 py-0.5 rounded font-mono-sm text-mono-sm font-bold text-p0 bg-p0/15">
                  P0 CRITICAL
                </span>
</td>
<td className="py-3.5 px-4">
<div className="font-body-md text-body-md text-text-light font-medium group-hover:text-primary transition-colors">
                  Duplicate refunds after retry
                </div>
<div className="font-mono-sm text-mono-sm text-text-dim mt-0.5">
                  Idempotency token missing on <span className="text-tertiary">POST /api/v1/stripe/refund</span>
</div>
</td>
<td className="py-3.5 px-4 text-right font-mono-md text-mono-md text-p0 font-bold">
                32 events
              </td>
<td className="py-3.5 px-4 text-right font-mono-md text-mono-md text-text-light">
                28 sessions
              </td>
<td className="py-3.5 px-4">
<span className="inline-flex items-center gap-1 text-p0 font-mono-sm text-mono-sm font-bold bg-p0/10 px-2 py-1 rounded">
<span className="material-symbols-outlined text-[14px]">payments</span>
                  $3,200 exposure
                </span>
</td>
<td className="py-3.5 px-4 text-center">
<a href="/issues/CASE-042" className="bg-surface-container-high hover:bg-dashboard-accent hover:text-white text-text-dim p-1.5 rounded transition-colors" title="Investigate Case">
<span className="material-symbols-outlined text-[18px]">search</span>
</a>
</td>
</tr>

<tr className="hover:bg-surface-container-high/40 transition-colors group">
<td className="py-3.5 px-4 font-mono-md text-mono-md text-primary font-bold">
<span className="group-hover:underline cursor-pointer">CASE-043</span>
</td>
<td className="py-3.5 px-4">
<span className="inline-flex items-center px-2 py-0.5 rounded font-mono-sm text-mono-sm font-bold text-p0 bg-p0/15">
                  P0 CRITICAL
                </span>
</td>
<td className="py-3.5 px-4">
<div className="font-body-md text-body-md text-text-light font-medium group-hover:text-primary transition-colors">
                  False success after refund rejection
                </div>
<div className="font-mono-sm text-mono-sm text-text-dim mt-0.5">
                  Agent emits hallucinated confirmation string despite 403 Forbidden payload
                </div>
</td>
<td className="py-3.5 px-4 text-right font-mono-md text-mono-md text-p0 font-bold">
                19 events
              </td>
<td className="py-3.5 px-4 text-right font-mono-md text-mono-md text-text-light">
                19 sessions
              </td>
<td className="py-3.5 px-4">
<span className="inline-flex items-center gap-1 text-p0 font-mono-sm text-mono-sm font-bold bg-p0/10 px-2 py-1 rounded">
<span className="material-symbols-outlined text-[14px]">sentiment_very_dissatisfied</span>
                  High churn risk
                </span>
</td>
<td className="py-3.5 px-4 text-center">
<a href="/issues/CASE-043" className="bg-surface-container-high hover:bg-dashboard-accent hover:text-white text-text-dim p-1.5 rounded transition-colors" title="Investigate Case">
<span className="material-symbols-outlined text-[18px]">search</span>
</a>
</td>
</tr>

<tr className="hover:bg-surface-container-high/40 transition-colors group">
<td className="py-3.5 px-4 font-mono-md text-mono-md text-primary font-bold">
<span className="group-hover:underline cursor-pointer">CASE-044</span>
</td>
<td className="py-3.5 px-4">
<span className="inline-flex items-center px-2 py-0.5 rounded font-mono-sm text-mono-sm font-bold text-p1 bg-p1/15">
                  P1 HIGH
                </span>
</td>
<td className="py-3.5 px-4">
<div className="font-body-md text-body-md text-text-light font-medium group-hover:text-primary transition-colors">
                  Wrong refund amounts calculation
                </div>
<div className="font-mono-sm text-mono-sm text-text-dim mt-0.5">
                  Taxes and shipping fees omitted during partial balance settlement calculation
                </div>
</td>
<td className="py-3.5 px-4 text-right font-mono-md text-mono-md text-p1 font-bold">
                45 events
              </td>
<td className="py-3.5 px-4 text-right font-mono-md text-mono-md text-text-light">
                42 sessions
              </td>
<td className="py-3.5 px-4">
<span className="inline-flex items-center gap-1 text-p1 font-mono-sm text-mono-sm font-bold bg-p1/10 px-2 py-1 rounded">
<span className="material-symbols-outlined text-[14px]">toll</span>
                  $840 delta
                </span>
</td>
<td className="py-3.5 px-4 text-center">
<a href="/issues/CASE-044" className="bg-surface-container-high hover:bg-dashboard-accent hover:text-white text-text-dim p-1.5 rounded transition-colors" title="Investigate Case">
<span className="material-symbols-outlined text-[18px]">search</span>
</a>
</td>
</tr>

<tr className="hover:bg-surface-container-high/40 transition-colors group">
<td className="py-3.5 px-4 font-mono-md text-mono-md text-primary font-bold">
<span className="group-hover:underline cursor-pointer">CASE-045</span>
</td>
<td className="py-3.5 px-4">
<span className="inline-flex items-center px-2 py-0.5 rounded font-mono-sm text-mono-sm font-bold text-p1 bg-p1/15">
                  P1 HIGH
                </span>
</td>
<td className="py-3.5 px-4">
<div className="font-body-md text-body-md text-text-light font-medium group-hover:text-primary transition-colors">
                  Wrong tool: cancel instead of address change
                </div>
<div className="font-mono-sm text-mono-sm text-text-dim mt-0.5">
                  Tool semantic ambiguity between <code className="text-tertiary">abort_order</code> and <code className="text-tertiary">update_shipping</code>
</div>
</td>
<td className="py-3.5 px-4 text-right font-mono-md text-mono-md text-p1 font-bold">
                14 events
              </td>
<td className="py-3.5 px-4 text-right font-mono-md text-mono-md text-text-light">
                14 sessions
              </td>
<td className="py-3.5 px-4">
<span className="inline-flex items-center gap-1 text-p1 font-mono-sm text-mono-sm font-bold bg-p1/10 px-2 py-1 rounded">
<span className="material-symbols-outlined text-[14px]">delete_forever</span>
                  Destructive action
                </span>
</td>
<td className="py-3.5 px-4 text-center">
<a href="/issues/CASE-045" className="bg-surface-container-high hover:bg-dashboard-accent hover:text-white text-text-dim p-1.5 rounded transition-colors" title="Investigate Case">
<span className="material-symbols-outlined text-[18px]">search</span>
</a>
</td>
</tr>

<tr className="hover:bg-surface-container-high/40 transition-colors group">
<td className="py-3.5 px-4 font-mono-md text-mono-md text-primary font-bold">
<span className="group-hover:underline cursor-pointer">CASE-046</span>
</td>
<td className="py-3.5 px-4">
<span className="inline-flex items-center px-2 py-0.5 rounded font-mono-sm text-mono-sm font-bold text-p2 bg-p2/15">
                  P2 MEDIUM
                </span>
</td>
<td className="py-3.5 px-4">
<div className="font-body-md text-body-md text-text-light font-medium group-hover:text-primary transition-colors">
                  Retry loop on order lookup
                </div>
<div className="font-mono-sm text-mono-sm text-text-dim mt-0.5">
                  Infinite fallback attempts triggered when order UUID has trailing whitespace
                </div>
</td>
<td className="py-3.5 px-4 text-right font-mono-md text-mono-md text-p2 font-bold">
                58 events
              </td>
<td className="py-3.5 px-4 text-right font-mono-md text-mono-md text-text-light">
                51 sessions
              </td>
<td className="py-3.5 px-4">
<span className="inline-flex items-center gap-1 text-p2 font-mono-sm text-mono-sm font-bold bg-p2/10 px-2 py-1 rounded">
<span className="material-symbols-outlined text-[14px]">bolt</span>
                  Token burn
                </span>
</td>
<td className="py-3.5 px-4 text-center">
<a href="/issues/CASE-046" className="bg-surface-container-high hover:bg-dashboard-accent hover:text-white text-text-dim p-1.5 rounded transition-colors" title="Investigate Case">
<span className="material-symbols-outlined text-[18px]">search</span>
</a>
</td>
</tr>
</tbody>
</table>
</div>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">

<div className="bg-ink-800 rounded-xl p-space-lg shadow-xl relative overflow-hidden flex flex-col justify-between group">
<div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-dashboard-accent/15 blur-2xl pointer-events-none"></div>
<div>

<div className="flex items-center justify-between pb-space-sm">
<div className="flex items-center gap-2">
<span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
<span className="font-mono-sm text-mono-sm text-text-dim uppercase tracking-wider">PRIMARY_INVESTIGATION_PATH</span>
</div>
<span className="font-stamp-badge text-stamp-badge text-p0/80 -rotate-2">EVIDENCE READY</span>
</div>
<h3 className="font-headline-md text-headline-md text-text-light mt-1">
            Triage Discovered Behavioral Failures
          </h3>
<p className="font-body-md text-body-md text-text-dim mt-2 leading-relaxed">
            5 high-confidence failure dossiers synthesized with full session replays, agent memory states, and tool execution logs.
          </p>
</div>
<div className="mt-space-lg pt-space-md flex flex-wrap items-center justify-between gap-space-md">
<div className="flex items-center gap-2 font-mono-sm text-mono-sm text-primary">
<span className="material-symbols-outlined text-[18px]">folder_open</span>
<span>5 case dossiers ready for forensic review</span>
</div>
<a className="bg-dashboard-accent hover:bg-dashboard-accent/90 text-text-light font-body-sm text-body-sm font-semibold px-space-lg py-2.5 rounded-lg flex items-center gap-2 shadow-lg shadow-dashboard-accent/25 transition-all group-hover:shadow-dashboard-accent/40" href="/inbox">
<span>Open Issue Inbox</span>
<span className="material-symbols-outlined text-[18px]">arrow_forward</span>
</a>
</div>
</div>

<div className="bg-cream rounded-xl p-space-lg shadow-2xl relative overflow-hidden flex flex-col justify-between text-ink-950">

<div className="absolute -right-8 -top-8 w-24 h-24 bg-cream-dim/30 rounded-full blur-md"></div>
<div>
<div className="flex items-center justify-between pb-space-sm">
<div className="flex items-center gap-2">
<span className="w-2.5 h-2.5 rounded-full bg-ink-950/70"></span>
<span className="font-mono-sm text-mono-sm text-ink-950/70 font-bold uppercase tracking-wider">REGRESSION_HARNESS</span>
</div>
<div className="px-2 py-0.5 rounded font-stamp-badge text-stamp-badge text-ink-950/80 font-bold tracking-widest bg-ink-950/10 rotate-1">
              BENCHMARK
            </div>
</div>
<h3 className="font-headline-md text-headline-md text-ink-950 mt-1 font-bold">
            Validate Benchmark Invariants
          </h3>
<p className="font-body-md text-body-md text-ink-950/80 mt-2 leading-relaxed font-medium">
            Run automated assertion suite against the baseline golden dataset to determine if candidate prompt mitigations resolve CASE-042 through CASE-046.
          </p>
</div>
<div className="mt-space-lg pt-space-md flex flex-wrap items-center justify-between gap-space-md">
<div className="flex items-center gap-2 font-mono-sm text-mono-sm text-ink-950 font-semibold truncate max-w-xs">
<span className="material-symbols-outlined text-[18px]">dataset</span>
<span className="truncate">customer-support-golden-v2</span>
</div>
<a className="bg-ink-950 hover:bg-ink-900 text-cream font-body-sm text-body-sm font-semibold px-space-lg py-2.5 rounded-lg flex items-center gap-2 shadow-md transition-all" href="#">
<span className="material-symbols-outlined text-[18px] text-tertiary">play_circle</span>
<span>Run Evaluation</span>
</a>
</div>
</div>
</div>
</div>
</div></main><footer className="w-full bg-ink-950 border-t border-outline-variant/30 h-10 flex items-center"><div className="w-full px-gutter flex items-center justify-between text-text-dim font-mono-sm text-mono-sm"><div className="flex items-center gap-space-md"><div className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span><span className="text-on-surface-variant">Telemetry Ingestion Nominal</span></div><span className="text-outline-variant">|</span><span className="hidden sm:inline text-text-dim">Cluster Sync: node-us-east-1a (0.12ms)</span><span className="text-outline-variant hidden sm:inline">|</span><span className="text-primary">CASE-INDEX ENGINE v2.4.9</span></div><div className="flex items-center gap-space-md"><a className="hover:text-primary transition-colors" href="#">Agent Tracing Docs</a><span className="text-outline-variant">•</span><a className="hover:text-primary transition-colors" href="#">Forensics Guide</a></div></div></footer>
    </>
  );
}

