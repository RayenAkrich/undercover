// MismatchDiff — Expected vs Observed side-by-side for wrong-parameter / wrong-entity
// failures (doc/12 "Expected vs observed", US-E8-005). Difference is shown with a
// label + numeric delta, never color alone (accessibility).

import type { FailureEvent } from "@/types/session";
import { formatValue, numericDelta } from "@/lib/failureMeta";

export default function MismatchDiff({ failure }: { failure: FailureEvent }) {
  const delta = numericDelta(failure.expected_value, failure.observed_value);
  const target = [failure.tool_name, failure.parameter_name]
    .filter(Boolean)
    .join(".");

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-space-md flex flex-col gap-space-md shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-800 pb-space-sm">
        <h3 className="font-headline-sm text-headline-sm text-text-light flex items-center gap-space-xs">
          <span className="material-symbols-outlined text-[18px] text-dashboard-accent">
            difference
          </span>
          <span>Parameter diff</span>
        </h3>
        {target && (
          <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60">
            {target}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-space-sm">
        {/* Expected — neutral/blue */}
        <div className="p-space-sm rounded-lg bg-ink-800 border border-blue-900/40 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase font-semibold text-dashboard-accent tracking-wide">
              Expected
            </span>
            <span className="font-mono text-[11px] text-slate-500">from user intent</span>
          </div>
          <span className="font-mono text-2xl font-bold text-text-light break-words">
            {formatValue(failure.expected_value)}
          </span>
        </div>

        {/* Observed — red */}
        <div className="p-space-sm rounded-lg border border-red-800/50 bg-p0/10 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase font-semibold text-red-400 tracking-wide">
              Observed
            </span>
            <span className="font-mono text-[11px] text-red-300/80">executed payload</span>
          </div>
          <span className="font-mono text-2xl font-bold text-red-400 break-words">
            {formatValue(failure.observed_value)}
          </span>
        </div>
      </div>

      {delta && (
        <div className="p-space-sm rounded-lg bg-ink-800 border border-slate-800 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-mono text-[11px] uppercase text-slate-400">Delta</span>
            <span className="font-mono text-sm font-bold text-red-400">
              {delta.delta >= 0 ? "+" : ""}
              {delta.delta}
            </span>
          </div>
          {delta.pct !== null && (
            <span className="px-space-sm py-1 rounded bg-p0/15 border border-red-800/60 text-red-300 font-mono text-[11px] font-semibold">
              {delta.pct >= 0 ? "+" : ""}
              {Math.round(delta.pct)}%
            </span>
          )}
        </div>
      )}
    </div>
  );
}
