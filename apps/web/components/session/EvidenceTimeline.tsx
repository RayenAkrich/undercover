// EvidenceTimeline — vertical USER -> AGENT -> TOOL CALL -> TOOL RESULT -> FINAL
// timeline (doc/01 §18, doc/12). Events referenced by the selected failure's evidence
// are highlighted; the mismatch step gets a label + icon, never color alone.

import type { SessionEvent } from "@/types/session";
import {
  EVENT_META,
  formatValue,
  toolArgs,
  toolResult,
} from "@/lib/failureMeta";

interface Props {
  events: SessionEvent[];
  evidenceIds: Set<string>;
  mismatchEventId: string | null;
}

function StatusChip({ status }: { status?: string | null }) {
  const s = (status ?? "").toLowerCase();
  const isError = ["error", "failed", "failure", "rejected", "denied"].includes(s);
  if (!status) return null;
  return (
    <span
      className={
        "flex items-center gap-1.5 px-space-sm py-0.5 rounded font-mono text-[11px] border " +
        (isError
          ? "bg-p0/15 text-red-300 border-red-800/60"
          : "bg-emerald-950/60 text-emerald-400 border-emerald-800/60")
      }
    >
      <span className="material-symbols-outlined text-[14px]">
        {isError ? "error" : "check_circle"}
      </span>
      {status}
    </span>
  );
}

function ArgsBlock({ args }: { args: Record<string, unknown> }) {
  const entries = Object.entries(args);
  if (entries.length === 0) return null;
  return (
    <div className="p-space-sm bg-slate-950 rounded-lg border border-slate-800 font-mono text-[12px] text-slate-200 overflow-x-auto">
      {entries.map(([k, v]) => (
        <div key={k} className="whitespace-pre">
          <span className="text-slate-400">{k}</span>
          <span className="text-slate-500">=</span>
          <span className="text-emerald-400">{formatValue(v)}</span>
        </div>
      ))}
    </div>
  );
}

export default function EvidenceTimeline({
  events,
  evidenceIds,
  mismatchEventId,
}: Props) {
  const ordered = [...events].sort((a, b) => a.sequence_no - b.sequence_no);

  return (
    <div className="relative flex flex-col gap-space-lg pl-6 before:content-[''] before:absolute before:left-3 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-700">
      {ordered.map((ev) => {
        const meta = EVENT_META[ev.event_type];
        const isMismatch = ev.id === mismatchEventId;
        const isEvidence = evidenceIds.has(ev.id);

        const cardClass = isMismatch
          ? "border border-p0 border-l-4 border-l-red-500 bg-p0/10"
          : isEvidence
          ? "bg-slate-900 border border-slate-700 ring-1 ring-dashboard-accent/40"
          : "bg-slate-900 border border-slate-800 hover:border-slate-700";

        return (
          <article
            key={ev.id}
            id={`event-${ev.id}`}
            tabIndex={-1}
            className="relative group scroll-mt-24 focus:outline-none"
          >
            <div
              className={
                "absolute -left-6 top-3 w-6 h-6 rounded-full z-10 flex items-center justify-center shadow-sm " +
                (isMismatch
                  ? "bg-red-600 text-white ring-4 ring-red-950"
                  : "bg-ink-950 border-2 border-slate-600 text-slate-400")
              }
            >
              <span className="material-symbols-outlined text-[13px]">
                {isMismatch ? "warning" : meta.icon}
              </span>
            </div>

            <div className={"rounded-xl p-space-md flex flex-col gap-space-sm shadow-sm transition-colors " + cardClass}>
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-space-xs gap-2 flex-wrap">
                <div className="flex items-center gap-space-sm">
                  <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold border border-slate-700/60">
                    {String(ev.sequence_no).padStart(2, "0")}
                  </span>
                  <span
                    className={
                      "font-mono text-xs font-semibold uppercase tracking-wide " +
                      (isMismatch ? "text-red-400" : "text-slate-200")
                    }
                  >
                    {meta.label}
                    {ev.tool_name ? `: ${ev.tool_name}` : ""}
                  </span>
                </div>
                {ev.event_type === "TOOL_RESULT" ? (
                  <StatusChip status={ev.status} />
                ) : isMismatch ? (
                  <span className="flex items-center gap-1.5 px-space-sm py-0.5 rounded bg-p0/20 text-red-300 border border-red-700/60 font-mono text-[11px] font-semibold">
                    <span className="material-symbols-outlined text-[14px]">report</span>
                    Mismatch detected
                  </span>
                ) : null}
              </div>

              {ev.content && (
                <div className="p-space-sm bg-ink-800 rounded-lg border border-slate-800/80">
                  <p className="font-body-md text-body-md text-slate-200 leading-relaxed">
                    {ev.content}
                  </p>
                </div>
              )}

              {ev.event_type === "TOOL_CALL" && <ArgsBlock args={toolArgs(ev.payload)} />}

              {ev.event_type === "TOOL_RESULT" && (
                <div className="p-space-sm bg-slate-950 rounded-lg border border-slate-800 font-mono text-[12px] text-slate-200 overflow-x-auto">
                  <pre className="leading-relaxed whitespace-pre-wrap">
                    {JSON.stringify(toolResult(ev.payload), null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
