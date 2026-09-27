"use client";

// Floating demo navigator — lets you click through all 7 pages in story order
// without typing routes. Mounted globally in the root layout, fixed to the bottom so
// it never disturbs each page's own header. Collapsible (state remembered per browser)
// so it can be hidden for clean screenshots.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const STEPS = [
  { href: "/", label: "Landing", match: (p: string) => p === "/" },
  { href: "/import", label: "Import", match: (p: string) => p.startsWith("/import") },
  { href: "/runs/run-01", label: "Run", match: (p: string) => p.startsWith("/runs") },
  { href: "/inbox", label: "Inbox", match: (p: string) => p.startsWith("/inbox") },
  { href: "/issues/CASE-044", label: "Cluster", match: (p: string) => p.startsWith("/issues") },
  { href: "/sessions/s-182", label: "Session", match: (p: string) => p.startsWith("/sessions") },
  { href: "/benchmark/run-01", label: "Benchmark", match: (p: string) => p.startsWith("/benchmark") },
];

const KEY = "undercover-demo-nav-open";

export default function DemoNav() {
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(true);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(KEY);
      if (saved === "0") setOpen(false);
    } catch {
      /* ignore */
    }
  }, []);

  function toggle(next: boolean) {
    setOpen(next);
    try {
      window.localStorage.setItem(KEY, next ? "1" : "0");
    } catch {
      /* ignore */
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => toggle(true)}
        className="fixed bottom-4 right-4 z-[100] flex items-center gap-1.5 rounded-full bg-dashboard-accent px-3.5 py-2 text-[12px] font-semibold text-white shadow-lg shadow-black/40 hover:bg-blue-600"
        aria-label="Show demo navigator"
      >
        <span className="material-symbols-outlined text-[16px]">tour</span>
        Demo
      </button>
    );
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] flex justify-center px-3 pb-3 pointer-events-none">
      <nav className="pointer-events-auto flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-slate-700/70 bg-ink-900/95 px-2 py-1.5 shadow-xl shadow-black/50 backdrop-blur">
        <span className="ml-1 mr-1 hidden shrink-0 items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500 sm:flex">
          <span className="material-symbols-outlined text-[14px] text-dashboard-accent">tour</span>
          Demo
        </span>
        {STEPS.map((s, i) => {
          const active = s.match(pathname);
          return (
            <Link
              key={s.href}
              href={s.href}
              aria-current={active ? "page" : undefined}
              className={
                "flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium transition-colors " +
                (active
                  ? "bg-dashboard-accent text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white")
              }
            >
              <span
                className={
                  "flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold " +
                  (active ? "bg-white/25 text-white" : "bg-slate-800 text-slate-400")
                }
              >
                {i + 1}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </Link>
          );
        })}
        <button
          onClick={() => toggle(false)}
          className="ml-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-slate-800 hover:text-slate-200"
          aria-label="Hide demo navigator"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>
      </nav>
    </div>
  );
}
