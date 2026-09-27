"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Minimal shared nav (placeholder until a Stitch redesign). Person 4 owns.
// Runs/Benchmark/Import activate as their slices deliver real routes.
const LINKS = [
  { href: "/inbox", label: "Issue Inbox" },
  { href: "#", label: "Runs" },
  { href: "#", label: "Benchmark" },
  { href: "#", label: "Import" },
];

export default function AppNav() {
  const pathname = usePathname();
  return (
    <header className="w-full bg-ink-950 border-b border-surface-container-high">
      <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin h-14 flex items-center justify-between gap-space-md">
        <Link href="/inbox" className="font-headline-sm text-headline-sm font-bold text-text-light uppercase tracking-tight">
          Undercover
        </Link>
        <nav className="flex items-center gap-space-xs">
          {LINKS.map((l) => {
            const active = l.href !== "#" && pathname.startsWith(l.href);
            return (
              <Link
                key={l.label}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`px-space-md py-space-sm rounded font-mono-md text-mono-md transition-colors ${
                  active
                    ? "bg-ink-800 text-primary"
                    : "text-on-surface-variant hover:bg-ink-900 hover:text-on-surface"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <span className="hidden sm:inline font-mono-sm text-mono-sm text-text-dim px-space-sm py-1 rounded bg-ink-900">
          prod-agent-checkout
        </span>
      </div>
    </header>
  );
}
