import type { Metadata } from "next";
import HeroScene from "@/components/landing/HeroScene";
import CopyCommand from "@/components/landing/CopyCommand";

export const metadata: Metadata = {
  title: "Undercover \u2014 Behavioral Reliability for AI Agents",
  description:
    "Undercover turns thousands of silent agent execution traces into a small, prioritized inbox of recurring behavioral bugs.",
};

export default function LandingPage() {
  return (
    <>
<header className="fixed top-0 left-0 right-0 w-full z-50 bg-ink-950/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.45)]"><div className="h-16 max-w-7xl mx-auto px-margin-mobile lg:px-margin flex items-center justify-between gap-space-md"><div className="flex items-center gap-space-md"><a className="flex items-center gap-space-sm group" data-path="overview" href="/"><div className="w-9 h-9 rounded-lg bg-ink-900 flex items-center justify-center text-primary group-hover:text-text-light transition-colors"><span className="material-symbols-outlined text-[20px]">fingerprint</span></div><span className="font-headline-sm text-headline-sm font-bold tracking-tight text-text-light uppercase">Undercover</span></a><div className="hidden sm:flex items-center gap-1.5 px-space-sm py-0.5 rounded-full bg-ink-900"><span className="w-1.5 h-1.5 rounded-full bg-dashboard-accent"></span><span className="font-mono-sm text-mono-sm text-text-dim uppercase tracking-wider">Behavioral Reliability</span></div></div><nav className="hidden lg:flex items-center gap-space-lg" data-active-classes="text-text-light font-medium"><a className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" data-path="problem" href="#problem">Problem</a><a className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" data-path="how-it-works" href="#how-it-works">How it works</a><a className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" data-path="inbox" href="#inbox-preview">Inbox</a><a className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" data-path="evidence" href="#evidence-dossier">Evidence</a><a className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" data-path="benchmark" href="#benchmark">Benchmark</a></nav><div className="flex items-center gap-space-md"><a className="hidden md:inline-flex font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" data-path="documentation" href="#how-it-works">Docs</a><a className="inline-flex items-center justify-center px-space-md py-2 rounded-lg bg-dashboard-accent text-text-light font-body-sm text-body-sm font-medium hover:bg-dashboard-accent/90 shadow-[0_0_24px_-4px_rgba(37,99,235,0.45)] transition-all" data-path="live-demo" href="/inbox">Open live demo</a><div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0"><span className="material-symbols-outlined text-on-primary text-[18px]">person</span></div></div></div></header><main className="w-full pt-16 bg-ink-950 min-h-screen"><div className="flex flex-col w-full">

<section className="relative w-full min-h-[92vh] flex flex-col justify-between overflow-hidden bg-ink-950 px-margin-mobile lg:px-margin pt-6 pb-12">

<div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
<HeroScene />

<div className="absolute inset-0 bg-radial from-dashboard-accent/15 via-ink-950/70 to-ink-950"></div>
<div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-p0/10 blur-3xl pointer-events-none"></div>
<div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
</div>

<div className="relative z-10 w-full max-w-7xl mx-auto flex flex-wrap items-center gap-space-sm pt-4 pointer-events-none opacity-80">
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-ink-900/90 text-p0 font-mono-sm text-mono-sm shadow-sm">
<span className="w-1.5 h-1.5 rounded-full bg-p0 animate-ping"></span> [CASE-01: DUP_REFUND P0]
      </span>
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-ink-900/90 text-p0 font-mono-sm text-mono-sm shadow-sm">
<span className="w-1.5 h-1.5 rounded-full bg-p0"></span> [CASE-02: WRONG_AMOUNT P0]
      </span>
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-ink-900/90 text-p1 font-mono-sm text-mono-sm shadow-sm">
<span className="w-1.5 h-1.5 rounded-full bg-p1"></span> [CASE-03: FALSE_SUCCESS P1]
      </span>
<span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-ink-900/90 text-primary font-mono-sm text-mono-sm shadow-sm">
<span className="w-1.5 h-1.5 rounded-full bg-primary"></span> [CASE-04: WRONG_TOOL]
      </span>
<span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-ink-900/90 text-text-dim font-mono-sm text-mono-sm shadow-sm">
<span className="w-1.5 h-1.5 rounded-full bg-outline"></span> [CASE-05: RETRY_LOOP]
      </span>
</div>

<div className="relative z-10 w-full max-w-7xl mx-auto my-auto py-12 flex flex-col items-start gap-space-lg">

<div className="inline-flex items-center gap-space-sm px-3.5 py-1.5 rounded-full bg-ink-900/80 shadow-md">
<span className="w-2 h-2 rounded-full bg-dashboard-accent shadow-[0_0_8px_rgba(37,99,235,0.8)]"></span>
<span className="font-mono-sm text-mono-sm text-primary uppercase tracking-widest">BEHAVIORAL RELIABILITY FOR AI AGENTS</span>
</div>

<div className="relative max-w-4xl">
<h1 className="font-display-hero text-display-hero text-text-light font-bold tracking-tight">
          Your agent isn't crashing. <br/>
<span className="text-transparent bg-clip-text bg-gradient-to-r from-text-light via-primary to-dashboard-accent">It's quietly doing the wrong thing.</span>
</h1>

<div className="absolute -top-6 -right-4 sm:-right-12 rotate-[-8deg] pointer-events-none select-none">
<div className="px-3 py-1 rounded bg-p0/10 text-p0 font-stamp-badge text-stamp-badge tracking-widest uppercase shadow-lg shadow-p0/10">
            P0 CRITICAL // EXHIBIT-E2
          </div>
</div>
</div>

<p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl leading-relaxed">
        Undercover turns thousands of silent agent execution traces into a small, prioritized inbox of recurring behavioral bugs — each incident fully reconstructed with forensic ground-truth evidence.
      </p>

<div className="flex flex-wrap items-center gap-space-md pt-2">
<a className="inline-flex items-center justify-center gap-space-sm px-6 py-3.5 rounded bg-dashboard-accent text-text-light font-body-md text-body-md font-medium hover:bg-dashboard-accent/90 shadow-[0_0_24px_-4px_rgba(37,99,235,0.6)] transition-all" href="#inbox-preview">
<span>See the live demo</span>
<span className="material-symbols-outlined text-[18px]">arrow_forward</span>
</a>
<a className="inline-flex items-center justify-center gap-space-sm px-6 py-3.5 rounded bg-ink-900 text-on-surface font-body-md text-body-md font-medium hover:bg-surface-container-high transition-all" href="#how-it-works">
<span className="material-symbols-outlined text-[18px] text-primary">visibility</span>
<span>How it works</span>
</a>
</div>
</div>

<div className="relative z-10 w-full max-w-7xl mx-auto">
<div className="w-full bg-ink-900/90 backdrop-blur-md rounded-xl p-space-md shadow-xl grid grid-cols-2 md:grid-cols-4 gap-space-md">
<div className="flex flex-col gap-0.5">
<div className="flex items-center gap-1.5 text-text-dim font-mono-sm text-mono-sm uppercase">
<span className="w-1.5 h-1.5 rounded-full bg-dashboard-accent"></span>
<span>Sessions Analyzed</span>
</div>
<span className="font-headline-md text-headline-md text-text-light font-semibold tracking-tight">2,347</span>
<span className="font-mono-sm text-mono-sm text-primary">Real-time OTEL ingest</span>
</div>
<div className="flex flex-col gap-0.5">
<div className="flex items-center gap-1.5 text-text-dim font-mono-sm text-mono-sm uppercase">
<span className="w-1.5 h-1.5 rounded-full bg-p0"></span>
<span>Silent Failures</span>
</div>
<span className="font-headline-md text-headline-md text-p0 font-semibold tracking-tight">148</span>
<span className="font-mono-sm text-mono-sm text-text-dim">Status 200 anomalies</span>
</div>
<div className="flex flex-col gap-0.5">
<div className="flex items-center gap-1.5 text-text-dim font-mono-sm text-mono-sm uppercase">
<span className="w-1.5 h-1.5 rounded-full bg-p2"></span>
<span>Recurring Patterns</span>
</div>
<span className="font-headline-md text-headline-md text-tertiary font-semibold tracking-tight">5 Cases</span>
<span className="font-mono-sm text-mono-sm text-text-dim">Clustered &amp; deduplicated</span>
</div>
<div className="flex flex-col gap-0.5">
<div className="flex items-center gap-1.5 text-text-dim font-mono-sm text-mono-sm uppercase">
<span className="w-1.5 h-1.5 rounded-full bg-p1"></span>
<span>Failure Rate</span>
</div>
<span className="font-headline-md text-headline-md text-p1 font-semibold tracking-tight">6.3%</span>
<span className="font-mono-sm text-mono-sm text-text-dim">Undetected by APMs</span>
</div>
</div>
</div>
</section>

<section className="w-full bg-ink-950 py-24 px-margin-mobile lg:px-margin" id="problem">
<div className="max-w-7xl mx-auto flex flex-col gap-space-xl">

<div className="flex flex-col items-start gap-space-xs max-w-3xl">
<span className="font-mono-sm text-mono-sm text-p0 uppercase tracking-widest px-2.5 py-1 rounded bg-p0/10">THE INVISIBLE DRIFT</span>
<h2 className="font-headline-lg text-headline-lg text-text-light font-bold tracking-tight">
          Silent failures look like success in your APM.
        </h2>
<p className="font-body-lg text-body-lg text-on-surface-variant">
          Your HTTP status is 200 OK. Your LLM token usage looks healthy. Latency is green. Meanwhile, your autonomous agents are executing incorrect API payloads, hallucinating completed actions, and silently debiting customer accounts.
        </p>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg">

<div className="group relative flex flex-col justify-between bg-ink-800 p-space-lg rounded-xl shadow-lg hover:shadow-[0_0_24px_-4px_rgba(239,68,68,0.2)] transition-all">
<div className="flex flex-col gap-space-md">
<div className="flex items-center justify-between">
<span className="font-mono-sm text-mono-sm text-p0 bg-p0/10 px-2 py-0.5 rounded uppercase font-semibold">FINANCIAL DRIFT // P0</span>
<span className="material-symbols-outlined text-p0 text-[22px]">payments</span>
</div>
<div>
<h3 className="font-headline-sm text-headline-sm text-text-light font-semibold">Wrong amount</h3>
<p className="font-body-md text-body-md text-on-surface-variant mt-1">User requested refund $10. Tool executed $100.</p>
</div>

<div className="bg-ink-950 p-space-sm rounded-lg font-mono-sm text-mono-sm text-text-dim flex flex-col gap-1 overflow-x-auto">
<span className="text-text-light"><span className="text-text-dim">USER:</span> "Can you refund $10 for delayed shipping?"</span>
<span className="text-p0"><span className="text-text-dim">TOOL:</span> stripe.refunds.create({"{ amount: 10000 }"})</span>
<span className="text-p0 font-bold">&gt;&gt; Delta: 10x overpayment detected</span>
</div>
</div>
<div className="pt-4 mt-4 flex items-center justify-between font-mono-sm text-mono-sm text-text-dim">
<span>Cluster ID: #ANOM-881</span>
<span className="text-p0">42 Occurrences</span>
</div>
</div>

<div className="group relative flex flex-col justify-between bg-ink-800 p-space-lg rounded-xl shadow-lg hover:shadow-[0_0_24px_-4px_rgba(239,68,68,0.2)] transition-all">
<div className="flex flex-col gap-space-md">
<div className="flex items-center justify-between">
<span className="font-mono-sm text-mono-sm text-p0 bg-p0/10 px-2 py-0.5 rounded uppercase font-semibold">HALLUCINATED RESOLUTION // P0</span>
<span className="material-symbols-outlined text-p0 text-[22px]">notification_important</span>
</div>
<div>
<h3 className="font-headline-sm text-headline-sm text-text-light font-semibold">False success</h3>
<p className="font-body-md text-body-md text-on-surface-variant mt-1">Tool returned 403 error. Agent told user "Completed!"</p>
</div>

<div className="bg-ink-950 p-space-sm rounded-lg font-mono-sm text-mono-sm text-text-dim flex flex-col gap-1 overflow-x-auto">
<span className="text-p0"><span className="text-text-dim">TOOL_RES:</span> {'{ status: 403, error: "Unauthorized" }'}</span>
<span className="text-tertiary"><span className="text-text-dim">AGENT:</span> "Your subscription has been canceled!"</span>
<span className="text-p0 font-bold">&gt;&gt; Invariant breach: hallucinated completion</span>
</div>
</div>
<div className="pt-4 mt-4 flex items-center justify-between font-mono-sm text-mono-sm text-text-dim">
<span>Cluster ID: #ANOM-402</span>
<span className="text-p0">19 Occurrences</span>
</div>
</div>

<div className="group relative flex flex-col justify-between bg-ink-800 p-space-lg rounded-xl shadow-lg hover:shadow-[0_0_24px_-4px_rgba(239,68,68,0.2)] transition-all">
<div className="flex flex-col gap-space-md">
<div className="flex items-center justify-between">
<span className="font-mono-sm text-mono-sm text-p0 bg-p0/10 px-2 py-0.5 rounded uppercase font-semibold">IDEMPOTENCY FAILURE // P0</span>
<span className="material-symbols-outlined text-p0 text-[22px]">content_copy</span>
</div>
<div>
<h3 className="font-headline-sm text-headline-sm text-text-light font-semibold">Duplicate refund</h3>
<p className="font-body-md text-body-md text-on-surface-variant mt-1">One user request caused multiple debit transactions.</p>
</div>

<div className="bg-ink-950 p-space-sm rounded-lg font-mono-sm text-mono-sm text-text-dim flex flex-col gap-1 overflow-x-auto">
<span className="text-primary"><span className="text-text-dim">CALL_1:</span> refund_charge(ch_992) -&gt; 200 OK</span>
<span className="text-p0"><span className="text-text-dim">CALL_2:</span> refund_charge(ch_992) -&gt; 200 OK</span>
<span className="text-p0 font-bold">&gt;&gt; Dual execution without idempotency key</span>
</div>
</div>
<div className="pt-4 mt-4 flex items-center justify-between font-mono-sm text-mono-sm text-text-dim">
<span>Cluster ID: #ANOM-119</span>
<span className="text-p0">32 Occurrences</span>
</div>
</div>

<div className="group relative flex flex-col justify-between bg-ink-800 p-space-lg rounded-xl shadow-lg hover:shadow-[0_0_24px_-4px_rgba(245,158,11,0.2)] transition-all">
<div className="flex flex-col gap-space-md">
<div className="flex items-center justify-between">
<span className="font-mono-sm text-mono-sm text-p1 bg-p1/10 px-2 py-0.5 rounded uppercase font-semibold">INTENT MISROUTING // P1</span>
<span className="material-symbols-outlined text-p1 text-[22px]">alt_route</span>
</div>
<div>
<h3 className="font-headline-sm text-headline-sm text-text-light font-semibold">Wrong tool</h3>
<p className="font-body-md text-body-md text-on-surface-variant mt-1">User requested an address change. Agent cancelled the order.</p>
</div>

<div className="bg-ink-950 p-space-sm rounded-lg font-mono-sm text-mono-sm text-text-dim flex flex-col gap-1 overflow-x-auto">
<span className="text-text-light"><span className="text-text-dim">INTENT:</span> "Update shipping to Apt 4B"</span>
<span className="text-p1"><span className="text-text-dim">ROUTED:</span> order_service.cancel_entire_order()</span>
<span className="text-p1 font-bold">&gt;&gt; Destructive action triggered instead of edit</span>
</div>
</div>
<div className="pt-4 mt-4 flex items-center justify-between font-mono-sm text-mono-sm text-text-dim">
<span>Cluster ID: #ANOM-603</span>
<span className="text-p1">14 Occurrences</span>
</div>
</div>

<div className="group relative flex flex-col justify-between bg-ink-800 p-space-lg rounded-xl shadow-lg hover:shadow-[0_0_24px_-4px_rgba(245,158,11,0.2)] transition-all md:col-span-2 lg:col-span-2">
<div className="flex flex-col gap-space-md">
<div className="flex items-center justify-between">
<span className="font-mono-sm text-mono-sm text-p2 bg-p2/10 px-2 py-0.5 rounded uppercase font-semibold">DEADLOCK LOOP // P2</span>
<span className="material-symbols-outlined text-p2 text-[22px]">sync_problem</span>
</div>
<div>
<h3 className="font-headline-sm text-headline-sm text-text-light font-semibold">Retry loop exhaustion</h3>
<p className="font-body-md text-body-md text-on-surface-variant mt-1">Same tool called 9 times consecutively with identical arguments, burning context tokens without progress.</p>
</div>

<div className="bg-ink-950 p-space-sm rounded-lg font-mono-sm text-mono-sm text-text-dim flex flex-col gap-1 overflow-x-auto">
<span className="text-text-dim">LOOP [01..09]: search_kb("customer_status_vip") -&gt; EMPTY_RESULT</span>
<span className="text-tertiary font-bold">&gt;&gt; 9 cycles executed | 14,200 redundant tokens consumed | 45s user wait</span>
</div>
</div>
<div className="pt-4 mt-4 flex items-center justify-between font-mono-sm text-mono-sm text-text-dim">
<span>Cluster ID: #ANOM-094</span>
<span className="text-p2">58 Occurrences</span>
</div>
</div>
</div>
</div>
</section>

<section className="w-full bg-ink-900 py-24 px-margin-mobile lg:px-margin" id="how-it-works">
<div className="max-w-7xl mx-auto flex flex-col gap-space-xl">
<div className="flex flex-col items-start gap-space-xs max-w-2xl">
<span className="font-mono-sm text-mono-sm text-dashboard-accent uppercase tracking-widest px-2.5 py-1 rounded bg-dashboard-accent/10">SYSTEM ARCHITECTURE</span>
<h2 className="font-headline-lg text-headline-lg text-text-light font-bold tracking-tight">
          From raw trace chaos to prioritized case files.
        </h2>
<p className="font-body-lg text-body-lg text-on-surface-variant">
          Engineers cannot review tens of thousands of JSON spans. Undercover evaluates execution invariants deterministically, scores semantics, and distills noise into case tickets.
        </p>
</div>

<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-space-md relative">

<div className="bg-ink-800 p-space-md rounded-xl flex flex-col justify-between gap-space-md shadow-md hover:bg-surface-container-high transition-all">
<div className="flex flex-col gap-space-sm">
<span className="font-mono-lg text-mono-lg text-dashboard-accent font-bold">01</span>
<h4 className="font-headline-sm text-headline-sm text-text-light font-semibold">Import</h4>
<p className="font-body-sm text-body-sm text-on-surface-variant">Ingest OpenTelemetry, LangSmith, Helicone, or raw JSON agent session traces in real time.</p>
</div>
<span className="font-mono-sm text-mono-sm text-text-dim bg-ink-950 px-2 py-1 rounded">OTel SDK / Webhook</span>
</div>

<div className="bg-ink-800 p-space-md rounded-xl flex flex-col justify-between gap-space-md shadow-md hover:bg-surface-container-high transition-all">
<div className="flex flex-col gap-space-sm">
<span className="font-mono-lg text-mono-lg text-dashboard-accent font-bold">02</span>
<h4 className="font-headline-sm text-headline-sm text-text-light font-semibold">Detect</h4>
<p className="font-body-sm text-body-sm text-on-surface-variant">Deterministic AST and rule evaluators catch obvious numerical, state, and schema breaches.</p>
</div>
<span className="font-mono-sm text-mono-sm text-text-dim bg-ink-950 px-2 py-1 rounded">Invariant Engine</span>
</div>

<div className="bg-ink-800 p-space-md rounded-xl flex flex-col justify-between gap-space-md shadow-md hover:bg-surface-container-high transition-all">
<div className="flex flex-col gap-space-sm">
<span className="font-mono-lg text-mono-lg text-dashboard-accent font-bold">03</span>
<h4 className="font-headline-sm text-headline-sm text-text-light font-semibold">Judge</h4>
<p className="font-body-sm text-body-sm text-on-surface-variant">Specialized LLM-as-a-judge isolates subtle conversational intent divergence and tool hallucinations.</p>
</div>
<span className="font-mono-sm text-mono-sm text-text-dim bg-ink-950 px-2 py-1 rounded">Semantic Inspector</span>
</div>

<div className="bg-ink-800 p-space-md rounded-xl flex flex-col justify-between gap-space-md shadow-md hover:bg-surface-container-high transition-all">
<div className="flex flex-col gap-space-sm">
<span className="font-mono-lg text-mono-lg text-dashboard-accent font-bold">04</span>
<h4 className="font-headline-sm text-headline-sm text-text-light font-semibold">Cluster</h4>
<p className="font-body-sm text-body-sm text-on-surface-variant">Vector embeddings group isolated single anomalies into recurring failure patterns.</p>
</div>
<span className="font-mono-sm text-mono-sm text-text-dim bg-ink-950 px-2 py-1 rounded">HDBSCAN Clusterer</span>
</div>

<div className="bg-ink-800 p-space-md rounded-xl flex flex-col justify-between gap-space-md shadow-md hover:bg-surface-container-high transition-all">
<div className="flex flex-col gap-space-sm">
<span className="font-mono-lg text-mono-lg text-dashboard-accent font-bold">05</span>
<h4 className="font-headline-sm text-headline-sm text-text-light font-semibold">Prioritize</h4>
<p className="font-body-sm text-body-sm text-on-surface-variant">Severity scoring (P0–P3) ranks bugs by direct financial loss, blast radius, and frequency.</p>
</div>
<span className="font-mono-sm text-mono-sm text-text-dim bg-ink-950 px-2 py-1 rounded">Triage Case File</span>
</div>
</div>
</div>
</section>

<section className="w-full bg-ink-950 py-24 px-margin-mobile lg:px-margin" id="inbox-preview">
<div className="max-w-7xl mx-auto flex flex-col gap-space-xl">

<div className="flex flex-col items-start gap-space-xs max-w-2xl">
<span className="font-mono-sm text-mono-sm text-primary uppercase tracking-widest px-2.5 py-1 rounded bg-primary/10">TRIAGE WORKFLOW</span>
<h2 className="font-headline-lg text-headline-lg text-text-light font-bold tracking-tight">
          The Issue Inbox: Zero noise, pure evidence.
        </h2>
<p className="font-body-lg text-body-lg text-on-surface-variant">
          Engineers don't have time to read 10,000 logs. Undercover condenses them into actionable case tickets with quantified customer impact.
        </p>
</div>

<div className="w-full bg-ink-900 rounded-xl shadow-2xl overflow-hidden flex flex-col">

<div className="h-12 bg-surface-container-high px-space-md flex items-center justify-between">
<div className="flex items-center gap-2">
<span className="w-3 h-3 rounded-full bg-p0/70"></span>
<span className="w-3 h-3 rounded-full bg-p2/70"></span>
<span className="w-3 h-3 rounded-full bg-primary/70"></span>
<span className="ml-2 font-mono-sm text-mono-sm text-text-dim">undercover.app/workspace/inbox/prod-agent-checkout</span>
</div>
<div className="flex items-center gap-space-sm font-mono-sm text-mono-sm text-text-dim">
<span className="material-symbols-outlined text-[16px] text-dashboard-accent">sync</span>
<span>Live Stream: 42 spans/sec</span>
</div>
</div>

<div className="p-space-md bg-ink-950 flex flex-wrap items-center justify-between gap-space-md">
<div className="flex items-center gap-space-sm flex-wrap">
<button className="px-3 py-1 rounded bg-ink-800 text-text-light font-mono-sm text-mono-sm flex items-center gap-1.5 shadow-sm">
<span className="w-2 h-2 rounded-full bg-p0"></span> All Priorities (P0–P3)
            </button>
<button className="px-3 py-1 rounded bg-ink-900 text-on-surface-variant font-mono-sm text-mono-sm hover:text-text-light">
              Status: Active (5)
            </button>
<button className="px-3 py-1 rounded bg-ink-900 text-on-surface-variant font-mono-sm text-mono-sm hover:text-text-light">
              Sort: Exposure ($)
            </button>
</div>
<div className="font-mono-sm text-mono-sm text-text-dim">
            Showing <span className="text-text-light font-semibold">3 of 5</span> clusters
          </div>
</div>

<div className="flex flex-col divide-y divide-surface-container-high/40 p-space-md gap-space-md">

<div className="bg-ink-800 p-space-md rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md hover:bg-surface-container-high transition-colors">
<div className="flex items-start gap-space-md">
<span className="px-2 py-1 rounded bg-p0/15 text-p0 font-mono-sm text-mono-sm font-bold uppercase tracking-wider shrink-0">P0 CRITICAL</span>
<div className="flex flex-col gap-1">
<div className="flex items-center gap-2">
<h4 className="font-headline-sm text-headline-sm text-text-light font-medium">Duplicate refunds after retry</h4>
<span className="font-mono-sm text-mono-sm text-p0 bg-p0/10 px-2 py-0.5 rounded">CASE-042</span>
</div>
<div className="flex flex-wrap items-center gap-space-sm text-text-dim font-body-sm text-body-sm">
<span>32 occurrences</span>
<span>·</span>
<span>28 unique sessions</span>
<span>·</span>
<span className="text-p0 font-semibold">$3,200 exposure</span>
</div>
</div>
</div>
<div className="flex items-center gap-space-md w-full md:w-auto justify-between md:justify-end">
<div className="flex flex-col items-end gap-1">
<span className="font-mono-sm text-mono-sm text-text-light">Confidence 97%</span>
<div className="w-24 h-1.5 bg-ink-950 rounded-full overflow-hidden">
<div className="w-[97%] h-full bg-p0"></div>
</div>
</div>
<a className="px-3.5 py-1.5 rounded bg-dashboard-accent text-text-light font-mono-sm text-mono-sm font-medium hover:bg-dashboard-accent/90 transition-all" href="#evidence-dossier">
                Inspect case file →
              </a>
</div>
</div>

<div className="bg-ink-800 p-space-md rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md hover:bg-surface-container-high transition-colors">
<div className="flex items-start gap-space-md">
<span className="px-2 py-1 rounded bg-p0/15 text-p0 font-mono-sm text-mono-sm font-bold uppercase tracking-wider shrink-0">P0 CRITICAL</span>
<div className="flex flex-col gap-1">
<div className="flex items-center gap-2">
<h4 className="font-headline-sm text-headline-sm text-text-light font-medium">False success after refund rejection</h4>
<span className="font-mono-sm text-mono-sm text-p0 bg-p0/10 px-2 py-0.5 rounded">CASE-043</span>
</div>
<div className="flex flex-wrap items-center gap-space-sm text-text-dim font-body-sm text-body-sm">
<span>19 occurrences</span>
<span>·</span>
<span>19 unique sessions</span>
<span>·</span>
<span className="text-p0 font-semibold">High Customer Churn Risk</span>
</div>
</div>
</div>
<div className="flex items-center gap-space-md w-full md:w-auto justify-between md:justify-end">
<div className="flex flex-col items-end gap-1">
<span className="font-mono-sm text-mono-sm text-text-light">Confidence 94%</span>
<div className="w-24 h-1.5 bg-ink-950 rounded-full overflow-hidden">
<div className="w-[94%] h-full bg-p0"></div>
</div>
</div>
<a className="px-3.5 py-1.5 rounded bg-ink-950 text-on-surface font-mono-sm text-mono-sm font-medium hover:bg-surface-container-high transition-all" href="#evidence-dossier">
                Inspect case file →
              </a>
</div>
</div>

<div className="bg-ink-800 p-space-md rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md hover:bg-surface-container-high transition-colors">
<div className="flex items-start gap-space-md">
<span className="px-2 py-1 rounded bg-p1/15 text-p1 font-mono-sm text-mono-sm font-bold uppercase tracking-wider shrink-0">P1 HIGH</span>
<div className="flex flex-col gap-1">
<div className="flex items-center gap-2">
<h4 className="font-headline-sm text-headline-sm text-text-light font-medium">Wrong refund amounts on currency conversion</h4>
<span className="font-mono-sm text-mono-sm text-p1 bg-p1/10 px-2 py-0.5 rounded">CASE-044</span>
</div>
<div className="flex flex-wrap items-center gap-space-sm text-text-dim font-body-sm text-body-sm">
<span>45 occurrences</span>
<span>·</span>
<span>42 sessions</span>
<span>·</span>
<span className="text-p1 font-semibold">$840 aggregate delta</span>
</div>
</div>
</div>
<div className="flex items-center gap-space-md w-full md:w-auto justify-between md:justify-end">
<div className="flex flex-col items-end gap-1">
<span className="font-mono-sm text-mono-sm text-text-light">Confidence 89%</span>
<div className="w-24 h-1.5 bg-ink-950 rounded-full overflow-hidden">
<div className="w-[89%] h-full bg-p1"></div>
</div>
</div>
<a className="px-3.5 py-1.5 rounded bg-ink-950 text-on-surface font-mono-sm text-mono-sm font-medium hover:bg-surface-container-high transition-all" href="#evidence-dossier">
                Inspect case file →
              </a>
</div>
</div>
</div>
</div>
</div>
</section>

<section className="w-full bg-ink-950 py-24 px-margin-mobile lg:px-margin" id="evidence-dossier">
<div className="max-w-5xl mx-auto flex flex-col gap-space-lg">
<div className="flex items-center gap-space-sm text-p0 font-mono-sm text-mono-sm uppercase tracking-widest">
<span className="material-symbols-outlined text-[18px]">verified</span>
<span>Forensic Deep-Dive Inspection</span>
</div>

<div className="relative w-full bg-cream text-ink-950 rounded-xl p-6 sm:p-12 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] flex flex-col gap-space-lg">

<div className="flex items-center justify-between">
<div className="flex items-center gap-space-sm">
<span className="w-3 h-3 rounded-full bg-p0 shadow-md"></span>
<span className="font-mono-md text-mono-md text-ink-900 font-bold uppercase tracking-widest">CONFIDENTIAL // CASE-042 // DOSSIER FILE</span>
</div>
<div className="rotate-[-6deg] px-3 py-1 rounded bg-p0/10 text-p0 font-stamp-badge text-stamp-badge uppercase tracking-widest shadow-sm">
            CONFIRMED ANOMALY
          </div>
</div>
<div className="flex flex-col gap-1">
<h3 className="font-headline-lg text-headline-lg font-bold text-ink-950 tracking-tight">
            Case File #042 — Exhibit A: Trace Discrepancy
          </h3>
<p className="font-body-md text-body-md text-ink-900/70">
            Automated reproduction extracted from trace session <code className="font-mono-sm text-mono-sm font-bold bg-ink-900/10 px-1 py-0.5 rounded">session_9941_prod</code>.
          </p>
</div>

<div className="flex flex-col gap-space-sm font-mono-sm text-mono-sm bg-white/70 p- space-md p-4 sm:p-6 rounded-lg shadow-sm">
<div className="flex items-start gap-space-md">
<span className="text-ink-900/50 shrink-0">00:01</span>
<span className="text-ink-900"><strong className="text-dashboard-accent">USER:</strong> "Please refund $10 for the delayed delivery item."</span>
</div>
<div className="flex items-start gap-space-md">
<span className="text-ink-900/50 shrink-0">00:03</span>
<span className="text-ink-900"><strong>AGENT:</strong> "I'll process that refund right away."</span>
</div>

<div className="flex items-start gap-space-md bg-p0/10 p-space-sm rounded-lg text-p0 font-bold">
<span className="text-p0 shrink-0">00:04</span>
<div className="flex flex-col gap-1">
<span>⚠️ TOOL CALL (EXECUTION ERROR):</span>
<code className="text-p0 bg-white/80 p-2 rounded block overflow-x-auto">refund_order(order_id="ord_9921", amount=100.00, currency="USD")</code>
</div>
</div>
<div className="flex items-start gap-space-md">
<span className="text-ink-900/50 shrink-0">00:05</span>
<span className="text-ink-900"><strong>TOOL RESULT:</strong> <code className="bg-ink-900/10 px-1 py-0.5 rounded text-ink-900">{'{"status": "success", "transaction_id": "tx_88192"}'}</code></span>
</div>
<div className="flex items-start gap-space-md">
<span className="text-ink-900/50 shrink-0">00:06</span>
<span className="text-ink-900"><strong>AGENT:</strong> "Done! Your $10 refund has been issued to your card."</span>
</div>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-space-md font-mono-sm text-mono-sm">
<div className="bg-white/80 p-space-md rounded-lg flex flex-col gap-1 text-ink-900">
<span className="text-on-surface-variant font-bold uppercase tracking-wider text-xs">EXPECTED (from Prompt Context)</span>
<span className="text-ink-950 font-bold text-mono-md">amount = 10.00 USD</span>
<span className="text-ink-900/70">Derived from user prompt token: "$10"</span>
</div>
<div className="bg-p0/15 p-space-md rounded-lg flex flex-col gap-1 text-p0">
<span className="font-bold uppercase tracking-wider text-xs">OBSERVED (API Payload Executed)</span>
<span className="font-bold text-mono-md">amount = 100.00 USD</span>
<span>Delta: +$90.00 Unauthorized Overpayment Anomaly</span>
</div>
</div>

<div className="bg-ink-950 text-text-light p-space-md rounded-lg flex flex-col gap-space-xs shadow-md">
<div className="flex items-center gap-space-sm text-primary font-mono-sm text-mono-sm uppercase tracking-wider">
<span className="material-symbols-outlined text-[16px]">psychology</span>
<span>AI Forensic Hypothesis</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface leading-relaxed">
            The agent confused the user's input parameter token "10" with the previous order line-item total "100" in its 8k attention context window. No boundary validation interceptor was registered to enforce customer refund constraints before invoking <code className="font-mono-sm text-primary">stripe.refunds.create</code>.
          </p>
</div>
</div>
</div>
</section>

<section className="w-full bg-ink-900 py-24 px-margin-mobile lg:px-margin" id="benchmark">
<div className="max-w-7xl mx-auto flex flex-col gap-space-xl">
<div className="flex flex-col items-start gap-space-xs max-w-2xl">
<span className="font-mono-sm text-mono-sm text-primary uppercase tracking-widest px-2.5 py-1 rounded bg-primary/10">RIGOROUS EVALUATION</span>
<h2 className="font-headline-lg text-headline-lg text-text-light font-bold tracking-tight">
          Benchmarked against hidden ground truth.
        </h2>
<p className="font-body-lg text-body-lg text-on-surface-variant">
          Alert fatigue destroys reliability teams. Undercover optimizes for near-zero false positive rates while detecting the subtle semantic anomalies traditional keyword monitors completely miss.
        </p>
</div>

<div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">

<div className="bg-ink-800 p-space-xl rounded-xl flex flex-col gap-space-md shadow-lg">
<div className="flex items-center justify-between">
<span className="font-mono-sm text-mono-sm text-text-dim uppercase tracking-wider">Metric 01</span>
<span className="material-symbols-outlined text-dashboard-accent text-[24px]">target</span>
</div>
<span className="font-display-hero text-display-hero text-text-light font-bold tracking-tight">0.94</span>
<div className="flex flex-col gap-1">
<h4 className="font-headline-sm text-headline-sm text-text-light font-medium">Precision</h4>
<p className="font-body-sm text-body-sm text-on-surface-variant">
              Near zero false positives. When Undercover opens an issue ticket, engineers know it's a real deviant execution.
            </p>
</div>
</div>

<div className="bg-ink-800 p-space-xl rounded-xl flex flex-col gap-space-md shadow-lg">
<div className="flex items-center justify-between">
<span className="font-mono-sm text-mono-sm text-text-dim uppercase tracking-wider">Metric 02</span>
<span className="material-symbols-outlined text-primary text-[24px]">radar</span>
</div>
<span className="font-display-hero text-display-hero text-text-light font-bold tracking-tight">0.89</span>
<div className="flex flex-col gap-1">
<h4 className="font-headline-sm text-headline-sm text-text-light font-medium">Recall</h4>
<p className="font-body-sm text-body-sm text-on-surface-variant">
              Surfaces high-dimensional failures that bypass static regex assertions and standard HTTP status checks.
            </p>
</div>
</div>

<div className="bg-ink-800 p-space-xl rounded-xl flex flex-col gap-space-md shadow-lg">
<div className="flex items-center justify-between">
<span className="font-mono-sm text-mono-sm text-text-dim uppercase tracking-wider">Metric 03</span>
<span className="material-symbols-outlined text-tertiary text-[24px]">equalizer</span>
</div>
<span className="font-display-hero text-display-hero text-text-light font-bold tracking-tight">0.91</span>
<div className="flex flex-col gap-1">
<h4 className="font-headline-sm text-headline-sm text-text-light font-medium">F1 Score</h4>
<p className="font-body-sm text-body-sm text-on-surface-variant">
              Harmonic balance validated across 50,000+ synthetic and real customer traces across multi-agent workflows.
            </p>
</div>
</div>
</div>
<div className="text-center font-mono-sm text-mono-sm text-text-dim pt-2">
        Measured against hidden ground-truth behavioral benchmarks across 12 production agent archetypes (E-Commerce, DevTools, FinTech, Support).
      </div>
</div>
</section>

<section className="w-full bg-ink-950 py-24 px-margin-mobile lg:px-margin relative overflow-hidden">

<div className="absolute inset-0 bg-radial from-dashboard-accent/20 via-transparent to-transparent pointer-events-none"></div>
<div className="max-w-4xl mx-auto flex flex-col items-center text-center gap-space-lg relative z-10">
<div className="inline-flex items-center gap-space-sm px-3.5 py-1.5 rounded-full bg-ink-900 shadow-md">
<span className="w-2 h-2 rounded-full bg-dashboard-accent animate-pulse"></span>
<span className="font-mono-sm text-mono-sm text-primary uppercase tracking-widest">GET STARTED IN MINUTES</span>
</div>
<h2 className="font-display-hero text-display-hero text-text-light font-bold tracking-tight">
        Stop guessing what your agent did wrong.
      </h2>
<p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
        Connect your traces in 5 minutes via OpenTelemetry or LangSmith. Find your first silent failure before your customers or finance team do.
      </p>

<div className="flex flex-col sm:flex-row items-center gap-space-md w-full justify-center pt-4">
<a className="w-full sm:w-auto inline-flex items-center justify-center gap-space-sm px-8 py-4 rounded bg-dashboard-accent text-text-light font-body-md text-body-md font-semibold hover:bg-dashboard-accent/90 shadow-[0_0_32px_-4px_rgba(37,99,235,0.7)] transition-all" href="#inbox-preview">
<span>Open the Issue Inbox (Live Demo)</span>
<span className="material-symbols-outlined text-[20px]">arrow_forward</span>
</a>

<div className="w-full sm:w-auto flex items-center justify-between gap-space-md bg-ink-900 px-space-md py-3.5 rounded font-mono-sm text-mono-sm text-text-light shadow-md">
<span className="text-text-dim">$</span>
<code className="text-primary font-mono-md">npm install @undercover/sdk</code>
<CopyCommand />
</div>
</div>
</div>
</section>
</div></main><footer className="w-full bg-ink-900 py-space-xl"><div className="max-w-7xl mx-auto px-margin-mobile lg:px-margin flex flex-col md:flex-row items-start md:items-center justify-between gap-space-lg"><div className="flex flex-col gap-space-xs"><div className="flex items-center gap-space-sm"><span className="font-headline-sm text-headline-sm font-bold tracking-tight text-text-light uppercase">Undercover</span><span className="font-mono-sm text-mono-sm text-p0 uppercase tracking-widest px-1.5 py-0.5 rounded bg-p0/10">Dossier-Secured</span></div><p className="font-body-sm text-body-sm text-text-dim">© 2026 Undercover Labs Inc. All agent traces secured.</p></div><div className="flex items-center gap-space-sm px-space-md py-1.5 rounded-full bg-ink-950"><span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-dashboard-accent"></span></span><span className="font-mono-sm text-mono-sm text-on-surface">System Operational · 99.98% uptime</span></div><div className="flex flex-wrap items-center gap-space-md text-text-dim"><a className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" data-path="privacy-policy" href="#">Privacy</a><a className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" data-path="terms-of-service" href="#">Terms</a><a className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" data-path="security-spec" href="#">Security Spec</a><a className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" data-path="github-repository" href="#">Github</a></div></div></footer>
    </>
  );
}

