"use client";

import { useState, type ChangeEvent } from "react";
import type { ClusterItem, RunSummary } from "@/lib/api-types";
import { MOCK_CLUSTERS, MOCK_SUMMARY } from "@/lib/mock-clusters";

// Searchable text per card (same order as articles above).
const SEARCH: string[] = [
  "p0 critical case-042 \u2022 32 occurrences \u00b7 28 sessions \u00b7 confidence 97% currency_exchange $3,200 exposure duplicate refunds after retry gavel invariant breach: idempotency_guarantee_violated idempotency breach: tool 'refund_charge' executed 2x within 400ms without unique idempotency key. target: payment_gateway.refund agent: customer-agent-v3 trigger: sockettimeoutexception -&gt; retry schedule first: oct 24, 04:12 utc history last: 3 mins ago confidence: 97% inspect evidence arrow_forward",
  "p0 critical case-043 \u2022 19 occurrences \u00b7 19 sessions \u00b7 confidence 94% sentiment_very_dissatisfied high churn risk false success after refund rejection psychology invariant breach: hallucinated_state_affirmation hallucinated confirmation: stripe api returned http 402 card declined, agent emitted 'your refund has processed successfully'. payload code: card_declined (insufficient_funds) agent output: \"refund issued to original card.\" schedule first: oct 23, 18:40 utc history last: 14 mins ago confidence: 94% inspect evidence arrow_forward",
  "p1 elevated case-044 \u2022 45 occurrences \u00b7 42 sessions \u00b7 confidence 89% trending_up $840 aggregate delta wrong refund amounts tune invariant breach: argument_numerical_drift parameter drift: user prompt specified '$10 partial credit', payload executed 'amount=100.00'. prompt extraction: subtotal_dispute_amount: 10.00 tool execution: stripe.refunds.create(amount=10000) schedule first: oct 21, 09:15 utc history last: 32 mins ago confidence: 89% inspect evidence arrow_forward",
  "p1 elevated case-045 \u2022 14 occurrences \u00b7 14 sessions \u00b7 confidence 91% dangerous destructive action drift wrong tool: cancel instead of address change alt_route invariant breach: irreversible_tool_collision intent classification divergence: user stated 'update apt 4b', agent called 'order_service.cancel_entire_order'. expected tool: order.update_shipping_address actual tool: order.cancel_entire_order schedule first: oct 22, 11:02 utc history last: 1 hr ago confidence: 91% inspect evidence arrow_forward",
  "p2 moderate case-046 \u2022 58 occurrences \u00b7 51 sessions \u00b7 confidence 83% hourglass_top 14.2k wasted tokens \u00b7 latency +45s retry loop on order lookup sync_problem invariant breach: cyclic_state_decay deadlock iteration: 'search_kb(customer_status_vip)' called 9x consecutively with null diff. loop invariant: zero_state_entropy_delta token burn: 1,580 tokens/cycle schedule first: oct 20, 15:30 utc history last: 2 hrs ago confidence: 83% inspect evidence arrow_forward"
];

export default function InboxView({
  clusters,
  summary,
}: {
  clusters: ClusterItem[];
  summary: RunSummary;
}) {
  const C = clusters.length >= 5 ? clusters : MOCK_CLUSTERS;
  const S = summary ?? MOCK_SUMMARY;
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const visible = (priority: string, text: string) =>
    (filter === "all" || priority === filter) && (!query || text.includes(query));
  return (
    <>
<header className="fixed top-0 w-full z-50 bg-ink-950/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.35)]"><div className="h-16 w-full px-margin flex items-center justify-between gap-gutter"><div className="flex items-center gap-space-lg"><div className="flex items-center gap-space-sm"><div className="w-8 h-8 rounded bg-ink-900 flex items-center justify-center text-primary"><span className="material-symbols-outlined text-[20px]">fingerprint</span></div><div className="flex flex-col"><span className="font-headline-sm text-headline-sm uppercase tracking-tight text-on-surface leading-none">Undercover</span><span className="font-mono-sm text-mono-sm uppercase text-text-dim tracking-wider">Investigative APM</span></div></div><div className="h-6 w-px bg-surface-variant hidden md:block"></div><nav className="flex items-center gap-space-xs" data-active-classes="bg-ink-800 text-primary shadow-[inset_0_-2px_0_0_#2563EB] font-mono-md"><a aria-current="page" className="px-space-md py-space-sm rounded transition-colors bg-ink-800 text-primary shadow-[inset_0_-2px_0_0_#2563EB] font-mono-md" data-path="issue-inbox" href="#">Issue Inbox</a><a className="px-space-md py-space-sm rounded font-mono-md text-mono-md text-on-surface-variant hover:bg-ink-900 hover:text-on-surface transition-colors" data-path="runs" href="#">Runs</a><a className="px-space-md py-space-sm rounded font-mono-md text-mono-md text-on-surface-variant hover:bg-ink-900 hover:text-on-surface transition-colors" data-path="benchmark" href="#">Benchmark</a><a className="px-space-md py-space-sm rounded font-mono-md text-mono-md text-on-surface-variant hover:bg-ink-900 hover:text-on-surface transition-colors" data-path="import" href="#">Import</a></nav></div><div className="flex items-center gap-space-md"><div className="hidden xl:flex items-center gap-space-sm px-space-sm py-space-xs rounded bg-ink-900"><div className="flex items-center gap-space-xs"><span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span><span className="font-mono-sm text-mono-sm text-on-surface font-semibold">LIVE 42 spans/sec</span></div><div className="h-3 w-px bg-surface-variant"></div><span className="font-mono-sm text-mono-sm text-text-dim">prod-agent-checkout</span></div><div className="hidden sm:flex items-center gap-space-xs px-space-sm py-space-xs rounded bg-ink-800 hover:bg-ink-900 cursor-pointer transition-colors text-on-surface"><span className="material-symbols-outlined text-[18px] text-text-dim">domain</span><span className="font-body-sm text-body-sm font-medium">Acme Intelligence</span><span className="material-symbols-outlined text-[16px] text-text-dim">expand_more</span></div><div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center"><span className="material-symbols-outlined text-on-primary text-[18px]">person</span></div></div></div></header><main className="w-full pt-16 bg-ink-950 min-h-screen"><div className="flex flex-col w-full">

<section className="relative w-full overflow-hidden pb-space-xl">

<div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[340px] bg-dashboard-accent/15 blur-[120px] rounded-full pointer-events-none"></div>
<div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(37,99,235,0.12),transparent_70%)] pointer-events-none"></div>
<div className="relative max-w-7xl mx-auto px-margin-mobile md:px-margin pt-space-lg flex flex-col gap-space-lg">

<div className="flex flex-wrap items-center justify-between gap-space-sm">
<div className="flex items-center gap-space-sm text-text-dim font-mono-sm text-mono-sm">
<span className="inline-flex items-center gap-space-xs text-primary font-semibold">
<span className="material-symbols-outlined text-[16px]">folder_special</span>
<span>SYSTEM_INVESTIGATION</span>
</span>
<span>/</span>
<span className="text-on-surface">CLUSTER_INBOX_ACTIVE</span>
<span className="px-1.5 py-0.5 rounded bg-ink-800 text-text-dim text-[10px]">CASE_COUNT: 05</span>
</div>
<div className="flex items-center gap-space-xs font-mono-sm text-mono-sm text-text-dim">
<span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
<span>AUTONOMOUS_DETECTION_ENGINE: ONLINE</span>
</div>
</div>

<div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md">
<div className="flex flex-col gap-space-xs max-w-3xl">
<div className="flex items-center gap-space-sm">
<span className="px-space-sm py-0.5 rounded bg-primary-container/20 text-primary font-mono-sm text-mono-sm uppercase tracking-wider">
              Cluster Analysis
            </span>
<span className="text-text-dim font-mono-sm text-mono-sm">REF: INV-2024-Q4</span>
</div>
<h1 className="font-headline-lg text-headline-lg text-text-light tracking-tight">
            Issue Inbox
          </h1>
<p className="font-body-md text-body-md text-text-dim max-w-2xl leading-relaxed">
            Clustered behavioral anomalies and silent logic breaches across active autonomous runs. Forensic analysis flags invariants failing without HTTP error signatures.
          </p>
</div>

<div className="flex items-center gap-space-sm shrink-0">
<button className="px-space-md py-space-sm rounded bg-ink-800 hover:bg-ink-900 text-text-light font-body-sm text-body-sm font-medium shadow-md transition-all flex items-center gap-space-xs" id="exportDossierBtn">
<span className="material-symbols-outlined text-[18px] text-primary">download</span>
<span>Export Dossier</span>
</button>
<button className="px-space-md py-space-sm rounded bg-dashboard-accent hover:bg-on-primary-container text-text-light font-body-sm text-body-sm font-medium shadow-md transition-all flex items-center gap-space-xs">
<span className="material-symbols-outlined text-[18px]">rule_folder</span>
<span>Trigger Rescan</span>
</button>
</div>
</div>

<div className="w-full bg-ink-900 rounded-xl p-space-sm shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-space-sm">

<div className="flex items-center p-1 rounded-lg bg-ink-950 self-start md:self-auto" id="priorityFilters">
<button onClick={() => setFilter("all")} className={`filter-tab px-space-md py-1.5 rounded font-mono-md text-mono-md transition-colors flex items-center gap-1.5 ${filter === "all" ? "bg-ink-800 text-text-light font-semibold" : "text-text-dim hover:text-text-light"}`}>
            All (5)
          </button>
<button onClick={() => setFilter("p0")} className={`filter-tab px-space-md py-1.5 rounded font-mono-md text-mono-md transition-colors flex items-center gap-1.5 ${filter === "p0" ? "bg-ink-800 text-text-light font-semibold" : "text-text-dim hover:text-text-light"}`}>
<span className="w-2 h-2 rounded-full bg-p0"></span>
<span>P0 (2)</span>
</button>
<button onClick={() => setFilter("p1")} className={`filter-tab px-space-md py-1.5 rounded font-mono-md text-mono-md transition-colors flex items-center gap-1.5 ${filter === "p1" ? "bg-ink-800 text-text-light font-semibold" : "text-text-dim hover:text-text-light"}`}>
<span className="w-2 h-2 rounded-full bg-p1"></span>
<span>P1 (2)</span>
</button>
<button onClick={() => setFilter("p2")} className={`filter-tab px-space-md py-1.5 rounded font-mono-md text-mono-md transition-colors flex items-center gap-1.5 ${filter === "p2" ? "bg-ink-800 text-text-light font-semibold" : "text-text-dim hover:text-text-light"}`}>
<span className="w-2 h-2 rounded-full bg-p2"></span>
<span>P2 (1)</span>
</button>
</div>

<div className="flex items-center gap-space-sm flex-1 md:max-w-xl">
<div className="relative w-full">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-text-dim pointer-events-none">search</span>
<input className="w-full pl-9 pr-space-md py-1.5 bg-ink-950 rounded-lg text-text-light placeholder:text-text-dim text-body-sm font-body-sm focus:outline-none focus:ring-1 focus:ring-dashboard-accent transition-all" id="clusterSearch" value={query} onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value.toLowerCase().trim())} placeholder="Filter by cluster name, tool call, or invariant..." type="text"/>
</div>

<div className="relative shrink-0">
<button className="px-space-md py-1.5 bg-ink-950 hover:bg-ink-800 rounded-lg text-text-light font-mono-md text-mono-md flex items-center gap-space-xs transition-colors">
<span className="material-symbols-outlined text-[16px] text-text-dim">schedule</span>
<span>Last 24 hours</span>
<span className="material-symbols-outlined text-[16px] text-text-dim">expand_more</span>
</button>
</div>
</div>
</div>

<div className="w-full bg-ink-800 rounded-xl p-space-md shadow-xl grid grid-cols-2 lg:grid-cols-4 gap-space-md relative overflow-hidden">
<div className="absolute -right-10 -bottom-10 w-44 h-44 bg-dashboard-accent/5 rounded-full blur-2xl pointer-events-none"></div>

<div className="flex flex-col gap-1 p-space-sm bg-ink-900/60 rounded-lg">
<div className="flex items-center justify-between text-text-dim">
<span className="font-mono-sm text-mono-sm uppercase tracking-wider">Ingested Runs</span>
<span className="material-symbols-outlined text-[18px] text-primary">data_thresholding</span>
</div>
<div className="font-display-hero text-headline-lg font-bold text-text-light tracking-tight">
            {S.sessions_analyzed}
          </div>
<div className="font-mono-sm text-mono-sm text-text-dim flex items-center gap-1">
<span>Ingested OTEL Traces</span>
<span className="text-emerald-400">100% cap</span>
</div>
</div>

<div className="flex flex-col gap-1 p-space-sm bg-ink-900/60 rounded-lg relative overflow-hidden">
<div className="absolute top-0 right-0 w-16 h-16 bg-p0/10 rounded-bl-3xl pointer-events-none"></div>
<div className="flex items-center justify-between text-text-dim">
<span className="font-mono-sm text-mono-sm uppercase tracking-wider">Breached Traces</span>
<span className="material-symbols-outlined text-[18px] text-p0">warning</span>
</div>
<div className="font-display-hero text-headline-lg font-bold text-error tracking-tight flex items-baseline gap-space-xs">
<span>{S.failure_events}</span>
<span className="text-mono-sm font-mono-sm text-p0 uppercase tracking-widest font-semibold">Flagged</span>
</div>
<div className="font-mono-sm text-mono-sm text-text-dim flex items-center gap-1">
<span className="inline-block w-1.5 h-1.5 rounded-full bg-p0"></span>
<span>Silent Status 200 Anomalies</span>
</div>
</div>

<div className="flex flex-col gap-1 p-space-sm bg-ink-900/60 rounded-lg">
<div className="flex items-center justify-between text-text-dim">
<span className="font-mono-sm text-mono-sm uppercase tracking-wider">Distinct Signatures</span>
<span className="material-symbols-outlined text-[18px] text-tertiary">bubble_chart</span>
</div>
<div className="font-display-hero text-headline-lg font-bold text-text-light tracking-tight">
            {S.clusters}
          </div>
<div className="font-mono-sm text-mono-sm text-text-dim">
            Deduplicated Case Clusters
          </div>
</div>

<div className="flex flex-col gap-1 p-space-sm bg-ink-900/60 rounded-lg">
<div className="flex items-center justify-between text-text-dim">
<span className="font-mono-sm text-mono-sm uppercase tracking-wider">Algorithmic Precision</span>
<span className="material-symbols-outlined text-[18px] text-dashboard-accent">verified</span>
</div>
<div className="font-display-hero text-headline-lg font-bold text-primary tracking-tight">
            92.4%
          </div>
<div className="font-mono-sm text-mono-sm text-text-dim">
            Ground-truth Bayesian Score
          </div>
</div>
</div>

<div className="flex items-center justify-between pt-space-xs">
<div className="flex items-center gap-space-sm">
<span className="material-symbols-outlined text-primary text-[20px]">manage_search</span>
<h2 className="font-headline-sm text-headline-sm text-text-light">
            Identified Cluster Dossiers
          </h2>
<span className="px-2 py-0.5 rounded-full bg-ink-800 text-text-dim font-mono-sm text-mono-sm">Strict Rank: Severity</span>
</div>
<div className="hidden sm:flex items-center gap-space-md text-text-dim font-mono-sm text-mono-sm">
<span>SORTED BY INVARIANT SEVERITY</span>
<span>•</span>
<span className="text-on-surface">AUTO-HEURISTIC TRIAGE</span>
</div>
</div>

<div className="flex flex-col gap-space-md" id="issuesList">

<article className={`issue-card bg-ink-800 rounded-xl p-space-lg shadow-xl hover:shadow-2xl transition-all duration-200 relative overflow-hidden flex flex-col gap-space-md group${visible("p0", SEARCH[0]) ? "" : " hidden"}`}>

<div className="absolute left-0 top-0 bottom-0 w-1 bg-p0"></div>

<div className="flex flex-wrap items-center justify-between gap-space-sm">
<div className="flex flex-wrap items-center gap-space-sm">
<span className="px-space-sm py-1 rounded bg-p0 text-text-light font-mono-sm text-mono-sm font-bold uppercase tracking-wider">
                P0 CRITICAL
              </span>
<span className="font-mono-sm text-mono-sm text-text-dim font-semibold">CASE-042</span>
<span className="text-text-dim">•</span>
<span className="font-mono-sm text-mono-sm text-on-surface">{C[0].occurrence_count} occurrences · {C[0].affected_sessions} sessions · Confidence {C[0].confidence_score}%</span>
</div>

<div className="flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-error-container/40 text-secondary font-mono-sm text-mono-sm font-semibold">
<span className="material-symbols-outlined text-[15px]">currency_exchange</span>
<span>$3,200 exposure</span>
</div>
</div>

<div className="flex flex-col gap-space-xs">
<h3 className="font-headline-md text-headline-md text-text-light group-hover:text-primary transition-colors">
              {C[0].title}
            </h3>

<div className="mt-space-xs p-space-md rounded-lg bg-ink-950 flex flex-col gap-1.5 font-mono-md text-mono-md">
<div className="flex items-center gap-space-xs text-text-dim text-[11px] uppercase tracking-wider">
<span className="material-symbols-outlined text-p0 text-[14px]">gavel</span>
<span>INVARIANT BREACH: IDEMPOTENCY_GUARANTEE_VIOLATED</span>
</div>
<p className="text-error font-mono-md text-mono-md leading-relaxed">
                Idempotency breach: tool 'refund_charge' executed 2x within 400ms without unique idempotency key.
              </p>
<div className="text-text-dim text-[12px] flex flex-wrap items-center gap-space-md pt-1">
<span>Target: <code className="text-on-surface">payment_gateway.refund</code></span>
<span>Agent: <code className="text-on-surface">customer-agent-v3</code></span>
<span>Trigger: <code className="text-p1">SocketTimeoutException -&gt; retry</code></span>
</div>
</div>
</div>

<div className="flex flex-wrap items-center justify-between gap-space-md pt-space-xs">
<div className="flex items-center gap-space-lg text-text-dim font-mono-sm text-mono-sm">
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-[16px]">schedule</span>
<span>First: <strong className="text-on-surface font-normal">Oct 24, 04:12 UTC</strong></span>
</div>
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-[16px]">history</span>
<span>Last: <strong className="text-error font-medium">3 mins ago</strong></span>
</div>

<div className="hidden md:flex items-center gap-2">
<span>Confidence:</span>
<div className="w-24 h-2 rounded-full bg-ink-950 overflow-hidden p-0.5">
<div className="h-full bg-p0 rounded-full" style={{ width: `${C[0].confidence_score}%` }}></div>
</div>
<span className="text-text-light font-semibold">{C[0].confidence_score}%</span>
</div>
</div>

<a className="px-space-md py-space-xs rounded bg-dashboard-accent/10 hover:bg-dashboard-accent text-primary hover:text-text-light font-mono-md text-mono-md font-semibold transition-all flex items-center gap-space-xs" href="/issues/CASE-042">
<span>Inspect evidence</span>
<span className="material-symbols-outlined text-[16px]">arrow_forward</span>
</a>
</div>
</article>

<article className={`issue-card bg-ink-800 rounded-xl p-space-lg shadow-xl hover:shadow-2xl transition-all duration-200 relative overflow-hidden flex flex-col gap-space-md group${visible("p0", SEARCH[1]) ? "" : " hidden"}`}>
<div className="absolute left-0 top-0 bottom-0 w-1 bg-p0"></div>

<div className="flex flex-wrap items-center justify-between gap-space-sm">
<div className="flex flex-wrap items-center gap-space-sm">
<span className="px-space-sm py-1 rounded bg-p0 text-text-light font-mono-sm text-mono-sm font-bold uppercase tracking-wider">
                P0 CRITICAL
              </span>
<span className="font-mono-sm text-mono-sm text-text-dim font-semibold">CASE-043</span>
<span className="text-text-dim">•</span>
<span className="font-mono-sm text-mono-sm text-on-surface">{C[1].occurrence_count} occurrences · {C[1].affected_sessions} sessions · Confidence {C[1].confidence_score}%</span>
</div>

<div className="flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-p1/20 text-p1 font-mono-sm text-mono-sm font-semibold">
<span className="material-symbols-outlined text-[15px]">sentiment_very_dissatisfied</span>
<span>High churn risk</span>
</div>
</div>

<div className="flex flex-col gap-space-xs">
<h3 className="font-headline-md text-headline-md text-text-light group-hover:text-primary transition-colors">
              {C[1].title}
            </h3>
<div className="mt-space-xs p-space-md rounded-lg bg-ink-950 flex flex-col gap-1.5 font-mono-md text-mono-md">
<div className="flex items-center gap-space-xs text-text-dim text-[11px] uppercase tracking-wider">
<span className="material-symbols-outlined text-p0 text-[14px]">psychology</span>
<span>INVARIANT BREACH: HALLUCINATED_STATE_AFFIRMATION</span>
</div>
<p className="text-error font-mono-md text-mono-md leading-relaxed">
                Hallucinated confirmation: Stripe API returned HTTP 402 Card Declined, agent emitted 'Your refund has processed successfully'.
              </p>
<div className="text-text-dim text-[12px] flex flex-wrap items-center gap-space-md pt-1">
<span>Payload Code: <code className="text-p0">card_declined (insufficient_funds)</code></span>
<span>Agent Output: <code className="text-text-light">"Refund issued to original card."</code></span>
</div>
</div>
</div>

<div className="flex flex-wrap items-center justify-between gap-space-md pt-space-xs">
<div className="flex items-center gap-space-lg text-text-dim font-mono-sm text-mono-sm">
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-[16px]">schedule</span>
<span>First: <strong className="text-on-surface font-normal">Oct 23, 18:40 UTC</strong></span>
</div>
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-[16px]">history</span>
<span>Last: <strong className="text-p0 font-medium">14 mins ago</strong></span>
</div>
<div className="hidden md:flex items-center gap-2">
<span>Confidence:</span>
<div className="w-24 h-2 rounded-full bg-ink-950 overflow-hidden p-0.5">
<div className="h-full bg-p0 rounded-full" style={{ width: `${C[1].confidence_score}%` }}></div>
</div>
<span className="text-text-light font-semibold">{C[1].confidence_score}%</span>
</div>
</div>
<a className="px-space-md py-space-xs rounded bg-dashboard-accent/10 hover:bg-dashboard-accent text-primary hover:text-text-light font-mono-md text-mono-md font-semibold transition-all flex items-center gap-space-xs" href="/issues/CASE-043">
<span>Inspect evidence</span>
<span className="material-symbols-outlined text-[16px]">arrow_forward</span>
</a>
</div>
</article>

<article className={`issue-card bg-ink-800 rounded-xl p-space-lg shadow-xl hover:shadow-2xl transition-all duration-200 relative overflow-hidden flex flex-col gap-space-md group${visible("p1", SEARCH[2]) ? "" : " hidden"}`}>
<div className="absolute left-0 top-0 bottom-0 w-1 bg-p1"></div>

<div className="flex flex-wrap items-center justify-between gap-space-sm">
<div className="flex flex-wrap items-center gap-space-sm">
<span className="px-space-sm py-1 rounded bg-p1 text-text-light font-mono-sm text-mono-sm font-bold uppercase tracking-wider">
                P1 ELEVATED
              </span>
<span className="font-mono-sm text-mono-sm text-text-dim font-semibold">CASE-044</span>
<span className="text-text-dim">•</span>
<span className="font-mono-sm text-mono-sm text-on-surface">{C[2].occurrence_count} occurrences · {C[2].affected_sessions} sessions · Confidence {C[2].confidence_score}%</span>
</div>

<div className="flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-p2/20 text-tertiary font-mono-sm text-mono-sm font-semibold">
<span className="material-symbols-outlined text-[15px]">trending_up</span>
<span>$840 aggregate delta</span>
</div>
</div>

<div className="flex flex-col gap-space-xs">
<h3 className="font-headline-md text-headline-md text-text-light group-hover:text-primary transition-colors">
              {C[2].title}
            </h3>
<div className="mt-space-xs p-space-md rounded-lg bg-ink-950 flex flex-col gap-1.5 font-mono-md text-mono-md">
<div className="flex items-center gap-space-xs text-text-dim text-[11px] uppercase tracking-wider">
<span className="material-symbols-outlined text-p1 text-[14px]">tune</span>
<span>INVARIANT BREACH: ARGUMENT_NUMERICAL_DRIFT</span>
</div>
<p className="text-tertiary font-mono-md text-mono-md leading-relaxed">
                Parameter drift: User prompt specified '$10 partial credit', payload executed 'amount=100.00'.
              </p>
<div className="text-text-dim text-[12px] flex flex-wrap items-center gap-space-md pt-1">
<span>Prompt Extraction: <code className="text-on-surface">subtotal_dispute_amount: 10.00</code></span>
<span>Tool Execution: <code className="text-p1">stripe.refunds.create(amount=10000)</code></span>
</div>
</div>
</div>

<div className="flex flex-wrap items-center justify-between gap-space-md pt-space-xs">
<div className="flex items-center gap-space-lg text-text-dim font-mono-sm text-mono-sm">
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-[16px]">schedule</span>
<span>First: <strong className="text-on-surface font-normal">Oct 21, 09:15 UTC</strong></span>
</div>
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-[16px]">history</span>
<span>Last: <strong className="text-on-surface font-medium">32 mins ago</strong></span>
</div>
<div className="hidden md:flex items-center gap-2">
<span>Confidence:</span>
<div className="w-24 h-2 rounded-full bg-ink-950 overflow-hidden p-0.5">
<div className="h-full bg-p1 rounded-full" style={{ width: `${C[2].confidence_score}%` }}></div>
</div>
<span className="text-text-light font-semibold">{C[2].confidence_score}%</span>
</div>
</div>
<a className="px-space-md py-space-xs rounded bg-dashboard-accent/10 hover:bg-dashboard-accent text-primary hover:text-text-light font-mono-md text-mono-md font-semibold transition-all flex items-center gap-space-xs" href="/issues/CASE-044">
<span>Inspect evidence</span>
<span className="material-symbols-outlined text-[16px]">arrow_forward</span>
</a>
</div>
</article>

<article className={`issue-card bg-ink-800 rounded-xl p-space-lg shadow-xl hover:shadow-2xl transition-all duration-200 relative overflow-hidden flex flex-col gap-space-md group${visible("p1", SEARCH[3]) ? "" : " hidden"}`}>
<div className="absolute left-0 top-0 bottom-0 w-1 bg-p1"></div>

<div className="flex flex-wrap items-center justify-between gap-space-sm">
<div className="flex flex-wrap items-center gap-space-sm">
<span className="px-space-sm py-1 rounded bg-p1 text-text-light font-mono-sm text-mono-sm font-bold uppercase tracking-wider">
                P1 ELEVATED
              </span>
<span className="font-mono-sm text-mono-sm text-text-dim font-semibold">CASE-045</span>
<span className="text-text-dim">•</span>
<span className="font-mono-sm text-mono-sm text-on-surface">{C[3].occurrence_count} occurrences · {C[3].affected_sessions} sessions · Confidence {C[3].confidence_score}%</span>
</div>

<div className="flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-secondary-container/40 text-secondary font-mono-sm text-mono-sm font-semibold">
<span className="material-symbols-outlined text-[15px]">dangerous</span>
<span>Destructive action drift</span>
</div>
</div>

<div className="flex flex-col gap-space-xs">
<h3 className="font-headline-md text-headline-md text-text-light group-hover:text-primary transition-colors">
              {C[3].title}
            </h3>
<div className="mt-space-xs p-space-md rounded-lg bg-ink-950 flex flex-col gap-1.5 font-mono-md text-mono-md">
<div className="flex items-center gap-space-xs text-text-dim text-[11px] uppercase tracking-wider">
<span className="material-symbols-outlined text-p1 text-[14px]">alt_route</span>
<span>INVARIANT BREACH: IRREVERSIBLE_TOOL_COLLISION</span>
</div>
<p className="text-secondary font-mono-md text-mono-md leading-relaxed">
                Intent classification divergence: User stated 'Update Apt 4B', agent called 'order_service.cancel_entire_order'.
              </p>
<div className="text-text-dim text-[12px] flex flex-wrap items-center gap-space-md pt-1">
<span>Expected Tool: <code className="text-emerald-400">order.update_shipping_address</code></span>
<span>Actual Tool: <code className="text-error">order.cancel_entire_order</code></span>
</div>
</div>
</div>

<div className="flex flex-wrap items-center justify-between gap-space-md pt-space-xs">
<div className="flex items-center gap-space-lg text-text-dim font-mono-sm text-mono-sm">
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-[16px]">schedule</span>
<span>First: <strong className="text-on-surface font-normal">Oct 22, 11:02 UTC</strong></span>
</div>
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-[16px]">history</span>
<span>Last: <strong className="text-on-surface font-medium">1 hr ago</strong></span>
</div>
<div className="hidden md:flex items-center gap-2">
<span>Confidence:</span>
<div className="w-24 h-2 rounded-full bg-ink-950 overflow-hidden p-0.5">
<div className="h-full bg-p1 rounded-full" style={{ width: `${C[3].confidence_score}%` }}></div>
</div>
<span className="text-text-light font-semibold">{C[3].confidence_score}%</span>
</div>
</div>
<a className="px-space-md py-space-xs rounded bg-dashboard-accent/10 hover:bg-dashboard-accent text-primary hover:text-text-light font-mono-md text-mono-md font-semibold transition-all flex items-center gap-space-xs" href="/issues/CASE-045">
<span>Inspect evidence</span>
<span className="material-symbols-outlined text-[16px]">arrow_forward</span>
</a>
</div>
</article>

<article className={`issue-card bg-ink-800 rounded-xl p-space-lg shadow-xl hover:shadow-2xl transition-all duration-200 relative overflow-hidden flex flex-col gap-space-md group${visible("p2", SEARCH[4]) ? "" : " hidden"}`}>
<div className="absolute left-0 top-0 bottom-0 w-1 bg-p2"></div>

<div className="flex flex-wrap items-center justify-between gap-space-sm">
<div className="flex flex-wrap items-center gap-space-sm">
<span className="px-space-sm py-1 rounded bg-p2 text-ink-950 font-mono-sm text-mono-sm font-bold uppercase tracking-wider">
                P2 MODERATE
              </span>
<span className="font-mono-sm text-mono-sm text-text-dim font-semibold">CASE-046</span>
<span className="text-text-dim">•</span>
<span className="font-mono-sm text-mono-sm text-on-surface">{C[4].occurrence_count} occurrences · {C[4].affected_sessions} sessions · Confidence {C[4].confidence_score}%</span>
</div>

<div className="flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-ink-950 text-tertiary font-mono-sm text-mono-sm font-semibold">
<span className="material-symbols-outlined text-[15px]">hourglass_top</span>
<span>14.2k wasted tokens · Latency +45s</span>
</div>
</div>

<div className="flex flex-col gap-space-xs">
<h3 className="font-headline-md text-headline-md text-text-light group-hover:text-primary transition-colors">
              {C[4].title}
            </h3>
<div className="mt-space-xs p-space-md rounded-lg bg-ink-950 flex flex-col gap-1.5 font-mono-md text-mono-md">
<div className="flex items-center gap-space-xs text-text-dim text-[11px] uppercase tracking-wider">
<span className="material-symbols-outlined text-p2 text-[14px]">sync_problem</span>
<span>INVARIANT BREACH: CYCLIC_STATE_DECAY</span>
</div>
<p className="text-on-surface-variant font-mono-md text-mono-md leading-relaxed">
                Deadlock iteration: 'search_kb(customer_status_vip)' called 9x consecutively with null diff.
              </p>
<div className="text-text-dim text-[12px] flex flex-wrap items-center gap-space-md pt-1">
<span>Loop Invariant: <code className="text-p2">zero_state_entropy_delta</code></span>
<span>Token Burn: <code className="text-text-light">1,580 tokens/cycle</code></span>
</div>
</div>
</div>

<div className="flex flex-wrap items-center justify-between gap-space-md pt-space-xs">
<div className="flex items-center gap-space-lg text-text-dim font-mono-sm text-mono-sm">
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-[16px]">schedule</span>
<span>First: <strong className="text-on-surface font-normal">Oct 20, 15:30 UTC</strong></span>
</div>
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-[16px]">history</span>
<span>Last: <strong className="text-on-surface font-medium">2 hrs ago</strong></span>
</div>
<div className="hidden md:flex items-center gap-2">
<span>Confidence:</span>
<div className="w-24 h-2 rounded-full bg-ink-950 overflow-hidden p-0.5">
<div className="h-full bg-p2 rounded-full" style={{ width: `${C[4].confidence_score}%` }}></div>
</div>
<span className="text-text-light font-semibold">{C[4].confidence_score}%</span>
</div>
</div>
<a className="px-space-md py-space-xs rounded bg-dashboard-accent/10 hover:bg-dashboard-accent text-primary hover:text-text-light font-mono-md text-mono-md font-semibold transition-all flex items-center gap-space-xs" href="/issues/CASE-046">
<span>Inspect evidence</span>
<span className="material-symbols-outlined text-[16px]">arrow_forward</span>
</a>
</div>
</article>
</div>

<section className="mt-space-xl mb-space-lg bg-cream text-ink-950 rounded-xl p-space-lg md:p-space-xl shadow-2xl relative overflow-hidden">

<div className="absolute -top-3 left-8 w-6 h-6 rounded-full bg-p0 border-2 border-cream-dim shadow-md flex items-center justify-center pointer-events-none">
<div className="w-1.5 h-1.5 rounded-full bg-white"></div>
</div>
<div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-lg">
<div className="flex flex-col gap-space-xs max-w-2xl">
<div className="flex items-center gap-space-sm font-mono-sm text-mono-sm uppercase tracking-widest text-ink-800">
<span className="material-symbols-outlined text-[18px]">verified_user</span>
<span>FORENSIC REPLAY SYNTHESIS</span>
<span>•</span>
<span>DOSSIER FILE #881</span>
</div>
<h3 className="font-headline-md text-headline-md text-ink-950 font-bold tracking-tight">
              Export Evidence Package to Automated Test Harness
            </h3>
<p className="font-body-md text-body-md text-ink-800">
              Transform active silent failures into continuous regression invariants. Generates deterministic pytest suites and LangSmith verification cases directly from trace diffs.
            </p>
</div>
<div className="flex flex-wrap items-center gap-space-md shrink-0">
<button className="px-space-md py-space-sm rounded bg-ink-950 hover:bg-ink-900 text-cream font-mono-md text-mono-md font-semibold shadow-lg transition-colors flex items-center gap-space-xs">
<span className="material-symbols-outlined text-[16px] text-tertiary">code</span>
<span>Generate PyTest Stubs</span>
</button>
<button className="px-space-md py-space-sm rounded bg-ink-800 hover:bg-ink-900 text-cream font-mono-md text-mono-md transition-colors flex items-center gap-space-xs">
<span className="material-symbols-outlined text-[16px]">share</span>
<span>Share Dossier</span>
</button>
</div>
</div>
</section>
</div>
</section>


</div></main><footer className="w-full bg-ink-900/80 backdrop-blur-md shadow-[0_-1px_6px_rgba(0,0,0,0.25)]"><div className="h-12 w-full px-margin flex items-center justify-between text-on-surface-variant font-mono-sm text-mono-sm"><div className="flex items-center gap-space-lg"><div className="flex items-center gap-space-xs"><span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span><span className="text-on-surface">Telemetry Ingestion Nominal</span></div><div className="hidden md:flex items-center gap-space-xs text-text-dim"><span className="material-symbols-outlined text-[14px]">sync</span><span>Cluster Sync: node-us-east-1a (0.12ms)</span></div></div><div className="flex items-center gap-space-md"><span className="text-text-dim hidden sm:inline">CASE-INDEX ENGINE v2.4.9</span><a className="text-on-surface-variant hover:text-on-surface transition-colors flex items-center gap-space-xs" href="#"><span className="material-symbols-outlined text-[14px]">terminal</span><span>Agent Tracing Docs</span></a><a className="text-on-surface-variant hover:text-on-surface transition-colors flex items-center gap-space-xs" href="#"><span className="material-symbols-outlined text-[14px]">help</span><span>Forensics Guide</span></a></div></div></footer>
    </>
  );
}
