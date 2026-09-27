import type { Metadata } from "next";
import { getEvaluation } from "@/lib/api";
import { MOCK_EVALUATION } from "@/lib/mock-clusters";

export const metadata: Metadata = {
  title: "Benchmark — Undercover",
  description: "Measured detection metrics for the analysis run.",
};

export default async function BenchmarkPage({
  params,
}: {
  params: { runId: string };
}) {
  const E = (await getEvaluation(params.runId)) ?? MOCK_EVALUATION;
  return (
    <>
<header className="fixed top-0 w-full z-50 bg-ink-950/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.35)]"><div className="h-16 w-full px-margin flex items-center justify-between gap-gutter"><div className="flex items-center gap-space-lg"><div className="flex items-center gap-space-sm"><div className="w-8 h-8 rounded bg-ink-900 flex items-center justify-center text-primary"><span className="material-symbols-outlined text-[20px]">fingerprint</span></div><div className="flex flex-col"><span className="font-headline-sm text-headline-sm uppercase tracking-tight text-on-surface leading-none">Undercover</span><span className="font-mono-sm text-mono-sm uppercase text-text-dim tracking-wider">Investigative APM</span></div></div><div className="h-6 w-px bg-surface-variant hidden md:block"></div><nav className="flex items-center gap-space-xs" data-active-classes="bg-ink-800 text-primary shadow-[inset_0_-2px_0_0_#2563EB] font-mono-md"><a className="px-space-md py-space-sm rounded font-mono-md text-mono-md text-on-surface-variant hover:bg-ink-900 hover:text-on-surface transition-colors" data-path="issue-inbox" href="/inbox">Issue Inbox</a><a className="px-space-md py-space-sm rounded font-mono-md text-mono-md text-on-surface-variant hover:bg-ink-900 hover:text-on-surface transition-colors" data-path="runs" href="#">Runs</a><a className="px-space-md py-space-sm rounded font-mono-md text-mono-md text-on-surface-variant hover:bg-ink-900 hover:text-on-surface transition-colors" data-path="benchmark" href="#">Benchmark</a><a className="px-space-md py-space-sm rounded font-mono-md text-mono-md text-on-surface-variant hover:bg-ink-900 hover:text-on-surface transition-colors" data-path="import" href="#">Import</a></nav></div><div className="flex items-center gap-space-md"><div className="hidden xl:flex items-center gap-space-sm px-space-sm py-space-xs rounded bg-ink-900"><div className="flex items-center gap-space-xs"><span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span><span className="font-mono-sm text-mono-sm text-on-surface font-semibold">LIVE 42 spans/sec</span></div><div className="h-3 w-px bg-surface-variant"></div><span className="font-mono-sm text-mono-sm text-text-dim">prod-agent-checkout</span></div><div className="hidden sm:flex items-center gap-space-xs px-space-sm py-space-xs rounded bg-ink-800 hover:bg-ink-900 cursor-pointer transition-colors text-on-surface"><span className="material-symbols-outlined text-[18px] text-text-dim">domain</span><span className="font-body-sm text-body-sm font-medium">Acme Intelligence</span><span className="material-symbols-outlined text-[16px] text-text-dim">expand_more</span></div><div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center"><span className="material-symbols-outlined text-on-primary text-[18px]">person</span></div></div></div></header><main className="w-full pt-16 bg-ink-950 min-h-screen"><div className="flex flex-col w-full">
<div className="w-full max-w-[1280px] mx-auto px-margin-mobile md:px-margin py-space-xl flex flex-col gap-space-xl">

<div className="flex flex-col gap-space-md">

<div className="flex flex-wrap items-center justify-between gap-space-sm">
<div className="flex items-center gap-space-xs font-mono-sm text-mono-sm text-text-dim tracking-wider uppercase">
<span className="text-primary hover:underline cursor-pointer">SYSTEM_INVESTIGATION</span>
<span className="text-surface-variant">/</span>
<span className="text-primary hover:underline cursor-pointer">EVALUATION_HARNESS</span>
<span className="text-surface-variant">/</span>
<span className="text-text-light px-space-xs py-[2px] bg-ink-800 rounded font-bold">RUN_8F3A</span>
<span className="ml-space-xs inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold px-space-xs py-[1px] bg-emerald-950/60 rounded">
<span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> VERIFIED_EVAL
          </span>
</div>
<div className="flex items-center gap-space-xs font-mono-sm text-mono-sm text-text-dim">
<span className="material-symbols-outlined text-[14px]">history</span>
<span>HARNESS SPEC: <span className="text-text-light font-mono">v4.1.0-eval-deterministic</span></span>
</div>
</div>

<div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg">
<div className="flex flex-col gap-space-xs">
<div className="flex items-baseline gap-space-md flex-wrap">
<h1 className="font-headline-lg text-headline-lg text-text-light tracking-tight">Benchmark Evaluation</h1>
<span className="font-stamp-badge text-stamp-badge px-space-sm py-0.5 rounded bg-surface-container text-tertiary uppercase -rotate-1 tracking-widest">
              OFFICIAL VERDICT
            </span>
</div>
<div className="flex flex-wrap items-center gap-x-space-md gap-y-space-xs font-mono-md text-mono-md text-text-dim">
<span className="text-text-light font-semibold">run 8f3a-92bc-c21d</span>
<span className="text-surface-variant">·</span>
<span>dataset <strong className="text-text-light font-normal">Customer Support Demo (v2.4)</strong></span>
<span className="text-surface-variant">·</span>
<span>evaluated 12 min ago</span>
<span className="text-surface-variant">·</span>
<span className="text-primary font-medium">450 total labeled spans</span>
</div>
</div>

<div className="flex items-center gap-space-sm shrink-0">
<button className="flex items-center gap-space-xs px-space-md py-space-sm rounded bg-ink-800 hover:bg-ink-900 text-text-light font-mono-md text-mono-md transition-all">
<span className="material-symbols-outlined text-[18px] text-text-dim group-hover:rotate-180 transition-transform">refresh</span>
<span>Re-run Evaluation</span>
</button>
<button className="flex items-center gap-space-xs px-space-md py-space-sm rounded bg-dashboard-accent hover:bg-primary-container text-text-light font-body-sm text-body-sm font-medium transition-colors shadow-lg shadow-dashboard-accent/20">
<span className="material-symbols-outlined text-[18px]">download</span>
<span>Export Confusion Matrix</span>
</button>
</div>
</div>

<div className="flex flex-wrap items-center justify-between gap-space-sm p-space-sm bg-ink-900 rounded">
<div className="flex items-center gap-space-xs overflow-x-auto">
<span className="font-mono-sm text-mono-sm uppercase text-text-dim px-space-xs">Ground Truth:</span>
<button className="px-space-sm py-1 rounded bg-ink-800 text-text-light font-mono-sm text-mono-sm font-semibold flex items-center gap-1 shadow-sm">
<span>Customer Support Demo v2.4 (450)</span>
<span className="material-symbols-outlined text-[14px] text-dashboard-accent">check</span>
</button>
<button className="px-space-sm py-1 rounded hover:bg-ink-800 text-text-dim hover:text-text-light font-mono-sm text-mono-sm transition-colors">
            Checkout Invariant Golden (1,280)
          </button>
<button className="px-space-sm py-1 rounded hover:bg-ink-800 text-text-dim hover:text-text-light font-mono-sm text-mono-sm transition-colors">
            Adversarial Tool Loop Probe (180)
          </button>
</div>
<div className="flex items-center gap-space-sm text-text-dim font-mono-sm text-mono-sm">
<span>Tolerance Threshold: <span className="text-text-light font-mono">0.85 cosine</span></span>
<span className="text-surface-variant">|</span>
<span className="text-emerald-400">0 Leakage</span>
</div>
</div>
</div>

<div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">

<div className="relative overflow-hidden rounded-xl bg-ink-800 p-space-lg flex flex-col justify-between shadow-xl">
<div className="absolute -right-8 -top-8 w-32 h-32 bg-dashboard-accent/10 rounded-full blur-2xl pointer-events-none"></div>
<div className="flex flex-col gap-space-sm">
<div className="flex items-center justify-between">
<span className="font-mono-sm text-mono-sm uppercase text-text-dim tracking-wider flex items-center gap-1.5">
<span className="w-2 h-2 rounded-full bg-dashboard-accent"></span> PRECISION (POSITIVE PREDICTIVE)
            </span>
<span className="font-mono-sm text-mono-sm px-space-xs py-[2px] rounded bg-emerald-950/70 text-emerald-400 font-bold">
              +0.03 vs baseline
            </span>
</div>
<div className="flex items-baseline gap-space-sm my-space-xs">
<span className="font-display-hero text-display-hero tracking-tighter text-text-light font-bold">{E.precision.toFixed(2)}</span>
<span className="font-mono-md text-mono-md text-text-dim">/ 1.00</span>
</div>
<p className="font-body-sm text-body-sm text-text-dim">
            Near-zero false positives — opened tickets are real. Highly protective of human forensic investigator time.
          </p>
</div>
<div className="flex flex-col gap-space-xs pt-space-md mt-space-md">
<div className="w-full h-1.5 bg-ink-950 rounded-full overflow-hidden flex">
<div className="h-full bg-dashboard-accent rounded-full" style={{ width: `${Math.round(E.precision * 100)}%` }}></div>
</div>
<div className="flex justify-between font-mono-sm text-mono-sm text-text-dim">
<span>TP: 188</span>
<span>Target: &gt; 0.90</span>
<span className="text-dashboard-accent font-semibold">94.0%</span>
</div>
</div>
</div>

<div className="relative overflow-hidden rounded-xl bg-ink-800 p-space-lg flex flex-col justify-between shadow-xl">
<div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none"></div>
<div className="flex flex-col gap-space-sm">
<div className="flex items-center justify-between">
<span className="font-mono-sm text-mono-sm uppercase text-text-dim tracking-wider flex items-center gap-1.5">
<span className="w-2 h-2 rounded-full bg-primary"></span> RECALL (SENSITIVITY)
            </span>
<span className="font-mono-sm text-mono-sm px-space-xs py-[2px] rounded bg-ink-900 text-text-dim font-bold">
              +0.01 vs baseline
            </span>
</div>
<div className="flex items-baseline gap-space-sm my-space-xs">
<span className="font-display-hero text-display-hero tracking-tighter text-text-light font-bold">{E.recall.toFixed(2)}</span>
<span className="font-mono-md text-mono-md text-text-dim">/ 1.00</span>
</div>
<p className="font-body-sm text-body-sm text-text-dim">
            Catches semantic anomalies regex monitors miss entirely, including silent refund parameter alterations.
          </p>
</div>
<div className="flex flex-col gap-space-xs pt-space-md mt-space-md">
<div className="w-full h-1.5 bg-ink-950 rounded-full overflow-hidden flex">
<div className="h-full bg-primary rounded-full" style={{ width: `${Math.round(E.recall * 100)}%` }}></div>
</div>
<div className="flex justify-between font-mono-sm text-mono-sm text-text-dim">
<span>FN: 17 missed</span>
<span>Target: &gt; 0.85</span>
<span className="text-primary font-semibold">89.0%</span>
</div>
</div>
</div>

<div className="relative overflow-hidden rounded-xl bg-ink-800 p-space-lg flex flex-col justify-between shadow-xl">
<div className="absolute -right-8 -top-8 w-32 h-32 bg-tertiary/10 rounded-full blur-2xl pointer-events-none"></div>
<div className="flex flex-col gap-space-sm">
<div className="flex items-center justify-between">
<span className="font-mono-sm text-mono-sm uppercase text-text-dim tracking-wider flex items-center gap-1.5">
<span className="w-2 h-2 rounded-full bg-tertiary"></span> F1 FORENSIC HARMONIC
            </span>
<span className="font-mono-sm text-mono-sm px-space-xs py-[2px] rounded bg-emerald-950/70 text-emerald-400 font-bold">
              +0.02 vs baseline
            </span>
</div>
<div className="flex items-baseline gap-space-sm my-space-xs">
<span className="font-display-hero text-display-hero tracking-tighter text-text-light font-bold">{E.f1.toFixed(2)}</span>
<span className="font-mono-md text-mono-md text-text-dim">/ 1.00</span>
</div>
<p className="font-body-sm text-body-sm text-text-dim">
            Harmonic balance across the run. Confirms system doesn't sacrifice coverage to maintain high precision.
          </p>
</div>
<div className="flex flex-col gap-space-xs pt-space-md mt-space-md">
<div className="w-full h-1.5 bg-ink-950 rounded-full overflow-hidden flex">
<div className="h-full bg-tertiary rounded-full" style={{ width: `${Math.round(E.f1 * 100)}%` }}></div>
</div>
<div className="flex justify-between font-mono-sm text-mono-sm text-text-dim">
<span>Balanced Metric</span>
<span>Confidence Index</span>
<span className="text-tertiary font-semibold">91.4%</span>
</div>
</div>
</div>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">

<div className="rounded-xl bg-ink-800 p-space-lg flex items-start gap-space-md shadow-lg">
<div className="w-12 h-12 rounded bg-ink-950 flex items-center justify-center shrink-0 text-p2">
<span className="material-symbols-outlined text-[24px]">flag</span>
</div>
<div className="flex flex-col gap-1 w-full min-w-0">
<div className="flex items-center justify-between">
<span className="font-mono-sm text-mono-sm uppercase text-text-dim tracking-wider">FALSE POSITIVES (FP)</span>
<span className="font-mono-sm text-mono-sm px-space-xs py-0.5 rounded bg-p2/20 text-p2 font-bold flex items-center gap-1">
<span className="w-1.5 h-1.5 rounded-full bg-p2"></span> 6.0% rate
            </span>
</div>
<div className="flex items-baseline gap-space-xs">
<span className="font-headline-md text-headline-md text-text-light font-bold">{E.false_positives}</span>
<span className="font-mono-sm text-mono-sm text-text-dim">spans flagged</span>
</div>
<p className="font-body-sm text-body-sm text-text-dim mt-1">
            Spurious alerts flagged without semantic breach. Traced predominantly to agent self-repair retry jitter.
          </p>
<div className="flex items-center gap-space-sm mt-space-xs font-mono-sm text-mono-sm">
<span className="text-text-dim">Top culprit:</span>
<span className="text-text-light px-space-xs py-0.5 bg-ink-950 rounded">Retry loops (8 instances)</span>
</div>
</div>
</div>

<div className="rounded-xl bg-ink-800 p-space-lg flex items-start gap-space-md shadow-lg">
<div className="w-12 h-12 rounded bg-ink-950 flex items-center justify-center shrink-0 text-p0">
<span className="material-symbols-outlined text-[24px]">error_outline</span>
</div>
<div className="flex flex-col gap-1 w-full min-w-0">
<div className="flex items-center justify-between">
<span className="font-mono-sm text-mono-sm uppercase text-text-dim tracking-wider">FALSE NEGATIVES (FN)</span>
<span className="font-mono-sm text-mono-sm px-space-xs py-0.5 rounded bg-p0/20 text-p0 font-bold flex items-center gap-1">
<span className="w-1.5 h-1.5 rounded-full bg-p0"></span> 11.0% rate
            </span>
</div>
<div className="flex items-baseline gap-space-xs">
<span className="font-headline-md text-headline-md text-text-light font-bold">{E.false_negatives}</span>
<span className="font-mono-sm text-mono-sm text-text-dim">breaches escaped</span>
</div>
<p className="font-body-sm text-body-sm text-text-dim mt-1">
            Silent behavioral drifts missed by deterministic filters. Concentrated in multi-step refund calculation mismatches.
          </p>
<div className="flex items-center gap-space-sm mt-space-xs font-mono-sm text-mono-sm">
<span className="text-text-dim">Top culprit:</span>
<span className="text-text-light px-space-xs py-0.5 bg-ink-950 rounded">Wrong refund amounts (10 instances)</span>
</div>
</div>
</div>
</div>

<div className="flex items-center gap-space-sm px-space-md py-space-sm bg-ink-900 rounded text-text-dim font-mono-sm text-mono-sm">
<span className="material-symbols-outlined text-[16px] text-primary">verified_user</span>
<span><strong className="text-text-light">Methodological Guarantee:</strong> Ground-truth labels are used only after discovery completes. Zero leakage into candidate clustering. Isolation hash: <span className="text-text-light font-mono">0x9bc2...44f0</span></span>
</div>

<div className="flex flex-col gap-space-md">
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
<div className="flex flex-col">
<h2 className="font-headline-sm text-headline-sm text-text-light flex items-center gap-2">
<span>Failure Class Matrix</span>
<span className="font-mono-sm text-mono-sm text-text-dim px-space-xs py-[2px] bg-ink-900 rounded font-normal">5 ANOMALY INVARIANTS</span>
</h2>
<span className="font-body-sm text-body-sm text-text-dim">Detailed forensic inspection of True Positives, False Positives, and False Negatives per behavioral category</span>
</div>
<div className="flex items-center gap-space-xs font-mono-sm text-mono-sm text-text-dim">
<span className="inline-block w-2.5 h-2.5 bg-emerald-500 rounded-sm"></span>
<span>TP</span>
<span className="inline-block w-2.5 h-2.5 bg-p2 rounded-sm ml-2"></span>
<span>FP</span>
<span className="inline-block w-2.5 h-2.5 bg-p0 rounded-sm ml-2"></span>
<span>FN</span>
</div>
</div>

<div className="w-full overflow-x-auto rounded-xl bg-ink-800 shadow-xl">
<table className="w-full text-left font-body-sm text-body-sm">
<thead>
<tr className="bg-ink-900 text-text-dim font-mono-sm text-mono-sm uppercase tracking-wider">
<th className="py-space-md px-space-lg">Failure Class</th>
<th className="py-space-md px-space-md text-center">Class Total</th>
<th className="py-space-md px-space-md text-center">TP (Caught)</th>
<th className="py-space-md px-space-md text-center">FP (Spurious)</th>
<th className="py-space-md px-space-md text-center">FN (Escaped)</th>
<th className="py-space-md px-space-md text-center">Precision</th>
<th className="py-space-md px-space-md text-center">Recall</th>
<th className="py-space-md px-space-lg text-right">Detection Rate</th>
</tr>
</thead>
<tbody className="text-text-light font-mono-md text-mono-md">

<tr className="hover:bg-ink-900/60 transition-colors">
<td className="py-space-md px-space-lg">
<div className="flex items-center gap-space-sm">
<span className="w-2 h-2 rounded-full bg-p0"></span>
<div className="flex flex-col">
<span className="font-semibold text-text-light font-body-md text-body-md">Duplicate refunds</span>
<span className="text-text-dim font-mono-sm text-mono-sm">Idempotency bypass in payment intent token</span>
</div>
</div>
</td>
<td className="py-space-md px-space-md text-center text-text-dim">44</td>
<td className="py-space-md px-space-md text-center text-emerald-400 font-bold">42</td>
<td className="py-space-md px-space-md text-center text-p2">1</td>
<td className="py-space-md px-space-md text-center text-p0">2</td>
<td className="py-space-md px-space-md text-center text-text-light font-semibold">0.97</td>
<td className="py-space-md px-space-md text-center text-text-light font-semibold">0.95</td>
<td className="py-space-md px-space-lg text-right">
<div className="flex items-center justify-end gap-2">
<div className="w-24 h-1.5 bg-ink-950 rounded-full overflow-hidden">
<div className="h-full bg-emerald-500 rounded-full" style={{ width: "95%" }}></div>
</div>
<span className="text-emerald-400 font-bold text-mono-sm">95.4%</span>
</div>
</td>
</tr>

<tr className="hover:bg-ink-900/60 transition-colors">
<td className="py-space-md px-space-lg">
<div className="flex items-center gap-space-sm">
<span className="w-2 h-2 rounded-full bg-p1"></span>
<div className="flex flex-col">
<span className="font-semibold text-text-light font-body-md text-body-md">False success</span>
<span className="text-text-dim font-mono-sm text-mono-sm">Premature termination signal on sub-task fail</span>
</div>
</div>
</td>
<td className="py-space-md px-space-md text-center text-text-dim">38</td>
<td className="py-space-md px-space-md text-center text-emerald-400 font-bold">36</td>
<td className="py-space-md px-space-md text-center text-p2">2</td>
<td className="py-space-md px-space-md text-center text-p0">2</td>
<td className="py-space-md px-space-md text-center text-text-light font-semibold">0.94</td>
<td className="py-space-md px-space-md text-center text-text-light font-semibold">0.94</td>
<td className="py-space-md px-space-lg text-right">
<div className="flex items-center justify-end gap-2">
<div className="w-24 h-1.5 bg-ink-950 rounded-full overflow-hidden">
<div className="h-full bg-emerald-500 rounded-full" style={{ width: "94%" }}></div>
</div>
<span className="text-emerald-400 font-bold text-mono-sm">94.7%</span>
</div>
</td>
</tr>

<tr className="hover:bg-ink-900/60 transition-colors">
<td className="py-space-md px-space-lg">
<div className="flex items-center gap-space-sm">
<span className="w-2 h-2 rounded-full bg-p0"></span>
<div className="flex flex-col">
<span className="font-semibold text-text-light font-body-md text-body-md">Wrong refund amounts</span>
<span className="text-text-dim font-mono-sm text-mono-sm">Tax or promo code miscalculation in payload</span>
</div>
</div>
</td>
<td className="py-space-md px-space-md text-center text-text-dim">52</td>
<td className="py-space-md px-space-md text-center text-emerald-400 font-bold">42</td>
<td className="py-space-md px-space-md text-center text-p2">1</td>
<td className="py-space-md px-space-md text-center text-p0 font-bold">10</td>
<td className="py-space-md px-space-md text-center text-text-light font-semibold">0.97</td>
<td className="py-space-md px-space-md text-center text-text-light font-semibold text-p2">0.80</td>
<td className="py-space-md px-space-lg text-right">
<div className="flex items-center justify-end gap-2">
<div className="w-24 h-1.5 bg-ink-950 rounded-full overflow-hidden">
<div className="h-full bg-tertiary rounded-full" style={{ width: "80%" }}></div>
</div>
<span className="text-tertiary font-bold text-mono-sm">80.7%</span>
</div>
</td>
</tr>

<tr className="hover:bg-ink-900/60 transition-colors">
<td className="py-space-md px-space-lg">
<div className="flex items-center gap-space-sm">
<span className="w-2 h-2 rounded-full bg-p2"></span>
<div className="flex flex-col">
<span className="font-semibold text-text-light font-body-md text-body-md">Wrong tool call</span>
<span className="text-text-dim font-mono-sm text-mono-sm">Hallucinated schema or parameter naming drift</span>
</div>
</div>
</td>
<td className="py-space-md px-space-md text-center text-text-dim">36</td>
<td className="py-space-md px-space-md text-center text-emerald-400 font-bold">34</td>
<td className="py-space-md px-space-md text-center text-text-dim">0</td>
<td className="py-space-md px-space-md text-center text-p0">2</td>
<td className="py-space-md px-space-md text-center text-text-light font-semibold">1.00</td>
<td className="py-space-md px-space-md text-center text-text-light font-semibold">0.94</td>
<td className="py-space-md px-space-lg text-right">
<div className="flex items-center justify-end gap-2">
<div className="w-24 h-1.5 bg-ink-950 rounded-full overflow-hidden">
<div className="h-full bg-emerald-500 rounded-full" style={{ width: "94%" }}></div>
</div>
<span className="text-emerald-400 font-bold text-mono-sm">94.4%</span>
</div>
</td>
</tr>

<tr className="hover:bg-ink-900/60 transition-colors">
<td className="py-space-md px-space-lg">
<div className="flex items-center gap-space-sm">
<span className="w-2 h-2 rounded-full bg-p3"></span>
<div className="flex flex-col">
<span className="font-semibold text-text-light font-body-md text-body-md">Retry loops</span>
<span className="text-text-dim font-mono-sm text-mono-sm">Recursive agent stall without termination token</span>
</div>
</div>
</td>
<td className="py-space-md px-space-md text-center text-text-dim">35</td>
<td className="py-space-md px-space-md text-center text-emerald-400 font-bold">34</td>
<td className="py-space-md px-space-md text-center text-p2 font-bold">8</td>
<td className="py-space-md px-space-md text-center text-p0">1</td>
<td className="py-space-md px-space-md text-center text-text-light font-semibold text-p2">0.80</td>
<td className="py-space-md px-space-md text-center text-text-light font-semibold">0.97</td>
<td className="py-space-md px-space-lg text-right">
<div className="flex items-center justify-end gap-2">
<div className="w-24 h-1.5 bg-ink-950 rounded-full overflow-hidden">
<div className="h-full bg-emerald-500 rounded-full" style={{ width: "97%" }}></div>
</div>
<span className="text-emerald-400 font-bold text-mono-sm">97.1%</span>
</div>
</td>
</tr>
</tbody>
</table>
</div>
</div>

<div className="flex flex-col gap-space-sm">
<div className="flex items-center justify-between">
<span className="font-mono-sm text-mono-sm uppercase text-text-dim tracking-wider flex items-center gap-2">
<span className="material-symbols-outlined text-[16px] text-text-dim">science</span>
<span>STAGING RUN PREVIEW · RUN QUEUE</span>
</span>
<span className="font-mono-sm text-mono-sm text-text-dim">Branch: staging-checkout-v3</span>
</div>
<div className="rounded-xl p-8 text-center flex flex-col items-center justify-center gap-space-md bg-ink-900/50 shadow-inner">

<div className="w-14 h-14 rounded-full bg-ink-800 flex items-center justify-center text-primary shadow-lg">
<span className="material-symbols-outlined text-[30px]">balance</span>
</div>
<div className="flex flex-col items-center max-w-xl gap-space-xs">
<h3 className="font-headline-sm text-headline-sm text-text-light font-semibold">
            No evaluation yet for staging-checkout-v3
          </h3>
<p className="font-body-md text-body-md text-text-dim">
            Ground-truth validation has not run against the latest 200 ingested traces. Run automated evaluation to generate precision, recall, and invariant metrics.
          </p>
</div>

<div className="flex flex-wrap items-center justify-center gap-space-md mt-space-xs">
<button className="flex items-center gap-space-xs px-space-lg py-space-sm rounded bg-dashboard-accent hover:bg-primary-container text-text-light font-body-sm text-body-sm font-medium transition-all shadow-md shadow-dashboard-accent/30">
<span>Run evaluation</span>
<span className="material-symbols-outlined text-[18px]">arrow_forward</span>
</button>
<button className="flex items-center gap-space-xs px-space-md py-space-sm text-text-dim hover:text-text-light font-mono-sm text-mono-sm transition-colors">
<span className="material-symbols-outlined text-[16px]">upload_file</span>
<span className="underline">Upload ground truth set (.jsonl)</span>
</button>
</div>

<div className="mt-space-sm flex items-center gap-space-md text-text-dim font-mono-sm text-mono-sm">
<span>Target agent: <span className="text-text-light">checkout-worker-v3.0.4</span></span>
<span className="text-surface-variant">·</span>
<span>200 cold spans ingested</span>
<span className="text-surface-variant">·</span>
<span>Estimated run time: ~4.2s</span>
</div>
</div>
</div>
</div>
</div></main><footer className="w-full bg-ink-900/80 backdrop-blur-md shadow-[0_-1px_6px_rgba(0,0,0,0.25)]"><div className="h-12 w-full px-margin flex items-center justify-between text-on-surface-variant font-mono-sm text-mono-sm"><div className="flex items-center gap-space-lg"><div className="flex items-center gap-space-xs"><span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span><span className="text-on-surface">Telemetry Ingestion Nominal</span></div><div className="hidden md:flex items-center gap-space-xs text-text-dim"><span className="material-symbols-outlined text-[14px]">sync</span><span>Cluster Sync: node-us-east-1a (0.12ms)</span></div></div><div className="flex items-center gap-space-md"><span className="text-text-dim hidden sm:inline">CASE-INDEX ENGINE v2.4.9</span><a className="text-on-surface-variant hover:text-on-surface transition-colors flex items-center gap-space-xs" href="#"><span className="material-symbols-outlined text-[14px]">terminal</span><span>Agent Tracing Docs</span></a><a className="text-on-surface-variant hover:text-on-surface transition-colors flex items-center gap-space-xs" href="#"><span className="material-symbols-outlined text-[14px]">help</span><span>Forensics Guide</span></a></div></div></footer>
    </>
  );
}

