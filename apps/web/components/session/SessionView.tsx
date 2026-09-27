"use client";

// SessionView — client orchestrator for the Session Evidence page.
// Owns: which failure is selected (tabs), highlighting the timeline from the selected
// failure's evidence, and scroll-to-event when an evidence anchor is clicked.
// Facts (timeline, diff) are neutral/blue; AI interpretation is a distinct indigo card
// labelled "AI hypothesis" (doc/12, doc/05 §7).

import { useMemo, useState } from "react";
import type { SessionBundle } from "@/types/session";
import { failureStyle, tierLabel } from "@/lib/failureMeta";
import EvidenceTimeline from "./EvidenceTimeline";
import MismatchDiff from "./MismatchDiff";

export default function SessionView({ bundle }: { bundle: SessionBundle }) {
  const { session, events, failures } = bundle;
  const [selectedId, setSelectedId] = useState(failures[0]?.id ?? null);

  const selected = useMemo(
    () => failures.find((f) => f.id === selectedId) ?? failures[0] ?? null,
    [failures, selectedId]
  );

  const evidenceIds = useMemo(
    () => new Set((selected?.evidence ?? []).map((e) => e.event_id)),
    [selected]
  );

  // Mismatch anchor = the TOOL_CALL among the evidence (falls back to first evidence).
  const mismatchEventId = useMemo(() => {
    if (!selected) return null;
    const ids = selected.evidence.map((e) => e.event_id);
    const toolCall = events.find(
      (ev) => ids.includes(ev.id) && ev.event_type === "TOOL_CALL"
    );
    return toolCall?.id ?? ids[0] ?? null;
  }, [selected, events]);

  function scrollToEvent(eventId: string) {
    const el = document.getElementById(`event-${eventId}`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.add("ring-2", "ring-dashboard-accent");
    window.setTimeout(() => el.classList.remove("ring-2", "ring-dashboard-accent"), 1200);
  }

  if (!selected) {
    return <EmptyState />;
  }

  const style = failureStyle(selected.failure_type);

  return (
    <div className="w-full max-w-7xl mx-auto px-margin-mobile lg:px-margin py-space-xl flex flex-col gap-space-xl">
      {/* Header */}
      <header className="flex flex-col gap-space-lg">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-space-sm font-mono text-[11px] text-slate-400"
        >
          <span className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-[15px]">inventory_2</span>
            Issue Inbox
          </span>
          <span className="text-slate-600">/</span>
          <span className="flex items-center gap-space-xs px-space-xs py-0.5 rounded bg-slate-800 border border-slate-700/60 text-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-p0" />
            Session {session.external_session_id}
          </span>
          {bundle.isDemo && (
            <span className="ml-auto px-space-sm py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/60 font-mono text-[10px] uppercase tracking-wider">
              Demo fallback
            </span>
          )}
        </nav>

        <div className="flex flex-col gap-space-sm">
          <div className="flex items-center gap-space-md flex-wrap">
            <h1 className="font-headline-lg text-3xl text-text-light tracking-tight">
              Session reconstruction
            </h1>
            <span className="font-mono text-sm px-space-sm py-1 rounded bg-slate-800 text-primary-fixed-dim font-semibold border border-slate-700">
              {session.external_session_id}
            </span>
          </div>

          <MetaStrip session={session} />
        </div>

        {/* Prominent failure banner (selected failure) */}
        <div
          className="w-full bg-ink-800 border border-red-900/50 rounded-xl p-space-lg flex flex-col md:flex-row md:items-center justify-between gap-space-md"
          style={{ borderLeft: "4px solid #EF4444" }}
        >
          <div className="flex items-start gap-space-md">
            <div className="w-9 h-9 rounded-lg bg-p0/20 border border-red-800/80 text-red-400 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">gavel</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-space-sm flex-wrap">
                <span
                  className={
                    "px-space-sm py-0.5 rounded font-mono text-[11px] uppercase font-semibold " +
                    style.chip
                  }
                >
                  {style.label}
                </span>
                <span className="px-space-sm py-0.5 rounded font-mono text-[11px] bg-slate-900 text-slate-300 border border-slate-800">
                  Confidence {Math.round(selected.confidence * 100)}%
                </span>
                <span className="px-space-sm py-0.5 rounded font-mono text-[11px] bg-slate-900 text-slate-400 border border-slate-800">
                  Tier {selected.evidence_tier} · {tierLabel(selected.evidence_tier)}
                </span>
              </div>
              {selected.semantic_summary && (
                <p className="font-body-md text-body-md text-slate-200">
                  {selected.semantic_summary}
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Two-column forensic split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
        {/* Timeline */}
        <section aria-labelledby="timeline-heading" className="lg:col-span-8 flex flex-col gap-space-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-space-sm">
            <div>
              <h2
                id="timeline-heading"
                className="font-headline-sm text-headline-sm text-text-light tracking-tight"
              >
                Evidence timeline
              </h2>
              <p className="font-body-sm text-body-sm text-slate-400 mt-0.5">
                Chronological execution events. Steps tied to the selected failure are highlighted.
              </p>
            </div>
            <span className="font-mono text-[11px] text-slate-400 bg-slate-900 px-space-sm py-space-xs rounded border border-slate-800 shrink-0">
              {events.length} events
            </span>
          </div>

          <EvidenceTimeline
            events={events}
            evidenceIds={evidenceIds}
            mismatchEventId={mismatchEventId}
          />
        </section>

        {/* Sidebar */}
        <aside aria-label="Failure detail" className="lg:col-span-4 flex flex-col gap-space-lg">
          {failures.length > 1 && (
            <div className="flex flex-col gap-space-xs">
              <span className="font-mono text-[11px] uppercase font-semibold text-slate-400 tracking-wider">
                Detected violations
              </span>
              <div className="flex items-center p-1 rounded-lg bg-slate-900 border border-slate-800 gap-1">
                {failures.map((f, i) => {
                  const fs = failureStyle(f.failure_type);
                  const active = f.id === selected.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => setSelectedId(f.id)}
                      className={
                        "flex-1 py-1.5 px-2 rounded font-mono text-[11px] font-semibold flex items-center justify-center gap-1 truncate transition-colors " +
                        (active
                          ? fs.chip
                          : "text-slate-400 hover:text-slate-200")
                      }
                    >
                      <span className={"w-1.5 h-1.5 rounded-full shrink-0 " + fs.dot} />
                      <span className="truncate">
                        #{i + 1}: {f.failure_type}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {(selected.expected_value !== undefined || selected.observed_value !== undefined) && (
            <MismatchDiff failure={selected} />
          )}

          {/* Linked evidence anchors */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-space-md flex flex-col gap-space-md shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-800 pb-space-sm">
              <h3 className="font-headline-sm text-headline-sm text-text-light flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-[18px] text-slate-400">link</span>
                Evidence
              </h3>
              <span className="font-mono text-[11px] text-slate-500">
                {selected.evidence.length} anchors
              </span>
            </div>
            <ul className="flex flex-col gap-space-sm">
              {selected.evidence.map((e, idx) => {
                const ev = events.find((x) => x.id === e.event_id);
                const isMismatch = e.event_id === mismatchEventId;
                return (
                  <li key={`${e.event_id}-${idx}`}>
                    <button
                      onClick={() => scrollToEvent(e.event_id)}
                      className={
                        "w-full flex items-center justify-between p-space-sm rounded-lg border transition-colors group text-left " +
                        (isMismatch
                          ? "bg-p0/10 border-red-900/60 hover:bg-p0/20"
                          : "bg-ink-800/60 border-slate-800/80 hover:border-slate-700 hover:bg-ink-800")
                      }
                    >
                      <div className="flex flex-col gap-0.5">
                        <span
                          className={
                            "font-body-sm text-body-sm font-medium " +
                            (isMismatch ? "text-red-300" : "text-slate-200 group-hover:text-dashboard-accent")
                          }
                        >
                          {e.label}
                        </span>
                        <span className="font-mono text-[11px] text-slate-500">
                          Event #{ev ? String(ev.sequence_no).padStart(2, "0") : "?"}
                          {ev ? ` · ${ev.event_type}` : ""}
                        </span>
                      </div>
                      <span className="material-symbols-outlined text-slate-500 group-hover:translate-x-0.5 transition-transform text-[18px]">
                        arrow_forward
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* AI hypothesis — distinct indigo treatment */}
          {selected.semantic_summary && (
            <div
              className="rounded-xl p-space-md flex flex-col gap-space-sm shadow-sm"
              style={{
                backgroundColor: "rgba(99, 102, 241, 0.12)",
                border: "1px solid rgba(99, 102, 241, 0.35)",
              }}
            >
              <div className="flex items-center justify-between pb-space-xs border-b border-indigo-500/30">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-[18px] text-indigo-400">
                    auto_awesome
                  </span>
                  <span className="font-headline-sm text-headline-sm uppercase tracking-wide font-bold text-indigo-300">
                    AI hypothesis
                  </span>
                </div>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-700/50 uppercase">
                  {selected.is_hypothesis ? "Hypothesis" : "Summary"}
                </span>
              </div>
              <p className="font-body-md text-body-md leading-relaxed text-indigo-100">
                {selected.semantic_summary}
              </p>
              <div className="flex items-start gap-1.5 pt-space-xs font-mono text-[11px] text-indigo-300">
                <span className="material-symbols-outlined text-[15px] shrink-0 mt-0.5 text-indigo-400">
                  info
                </span>
                <span className="italic leading-normal">
                  Interpretation, not confirmed root cause.
                </span>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function MetaStrip({ session }: { session: SessionBundle["session"] }) {
  const chips: { icon: string; label: string; value: string }[] = [];
  if (session.agent_version)
    chips.push({ icon: "smart_toy", label: "agent", value: session.agent_version });
  if (session.model_name)
    chips.push({ icon: "neurology", label: "model", value: session.model_name });
  const duration = session.metadata?.duration_ms;
  if (typeof duration === "number")
    chips.push({ icon: "timelapse", label: "duration", value: `${(duration / 1000).toFixed(2)}s` });

  if (chips.length === 0) return null;
  return (
    <div className="flex items-center gap-space-xs flex-wrap font-mono text-[11px] text-slate-400">
      {chips.map((c) => (
        <div
          key={c.label}
          className="flex items-center gap-1.5 px-space-sm py-space-xs rounded bg-ink-800 border border-slate-800"
        >
          <span className="material-symbols-outlined text-[14px] text-slate-400">{c.icon}</span>
          <span className="text-slate-500">{c.label}:</span>
          <span className="text-slate-200 font-medium">{c.value}</span>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="w-full max-w-3xl mx-auto px-margin-mobile lg:px-margin py-space-xl">
      <div className="p-space-lg rounded-xl bg-slate-900 border border-slate-800 text-center flex flex-col items-center gap-space-sm">
        <span className="material-symbols-outlined text-slate-500 text-[28px]">verified</span>
        <h2 className="font-headline-sm text-headline-sm text-text-light">
          No failure events detected
        </h2>
        <p className="font-body-sm text-body-sm text-slate-400 max-w-md">
          No failure events were detected for this session under the current configuration.
          This is not proof of correctness.
        </p>
      </div>
    </div>
  );
}
