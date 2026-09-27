# Stitch Prompt — Undercover Landing Page (paste the block below into Stitch)

> Design a dark, cinematic, professional landing page for **Undercover**, a "behavioral
> reliability" SaaS that finds hidden failures in AI-agent conversations (cases where the
> agent returns success but does the wrong thing: wrong refund amounts, false success
> messages, duplicate charges, wrong tools, retry loops).
>
> ## Theme and mood
> Sophisticated detective "evidence board" noir. Deep ink-navy backgrounds (`#070B16`,
> `#0B1226`, `#131C38` cards), one cream paper section (`#F4EFE4`), glowing electric-blue
> (`#3B82F6`) and case-red (`#EF4444`) accents, amber (`#F59E0B`) highlights. Restrained and
> premium — no neon cyberpunk, no clutter. Fonts: Space Grotesk for headlines and big
> numbers, Inter for body, JetBrains Mono for badges, labels and data.
>
> ## Hero (with Three.js)
> Full-viewport hero with an interactive Three.js canvas background: hundreds of small
> drifting dots (representing agent sessions) that animate and group into 5 glowing
> clusters joined by thin connecting lines like red strings on an evidence board. Each
> cluster node glows in a priority color (red, orange, blue) with a small floating mono
> label such as CASE-01. Subtle mouse parallax, faint grid, soft blue/red radial glows.
> Foreground content: top nav (logo = magnifier + fingerprint mark, links Problem / How it
> works / Inbox / Evidence / Benchmark, blue CTA button "Open live demo"), eyebrow
> "BEHAVIORAL RELIABILITY FOR AI AGENTS", huge headline "Your agent isn't crashing. It's
> quietly doing the wrong thing.", subtext "Undercover turns thousands of agent traces
> into a small, prioritized inbox of recurring behavioral failures — each one backed by
> evidence.", two CTA buttons ("See the live demo" solid blue, "How it works" ghost), and
> a stat strip with animated counters: 2,347 sessions · 148 failures · 5 patterns · 6.3%
> failure rate.
>
> ## Sections below the hero
> 1. "The problem" — five cards with thin line icons, each showing a silent failure:
> Wrong amount ("User asked refund $10. Tool executed $100."), False success ("Tool
> returned error. Agent said 'Completed!'"), Duplicate refund ("One request. Two
> charges."), Wrong tool ("Asked to change an address. Agent cancelled the order."),
> Retry loop ("Same tool call, 9 times, zero progress.").
> 2. "How it works" — a five-step horizontal stepper: 01 Import traces, 02 Detect
> candidates with deterministic rules, 03 Semantic judge for ambiguous cases,
> 04 Cluster recurring patterns, 05 Prioritize with explainable scores.
> 3. "Issue Inbox preview" — realistic SaaS inbox UI mock with three issue cards sorted
> by priority badges P0 (red `#B91C1C`), P0, P1 (orange `#EA580C`), e.g. "Duplicate
> refunds after retry — 32 occurrences · 28 sessions · Confidence 97%", each with small
> score bars and an "Inspect evidence" link.
> 4. "Evidence" — a LIGHT cream paper "case file" card (contrast against the dark page)
> showing a vertical chat timeline: USER "Refund $10" → AGENT "I'll process that." →
> highlighted TOOL CALL refund_order(amount=100) with warning styling → TOOL RESULT
> success → FINAL ANSWER, plus an "Expected 10 vs Observed 100" diff block. A purple
> "AI hypothesis" tag distinct from factual evidence.
> 5. "Benchmark" — three metric cards: Precision 0.94, Recall 0.89, F1 0.91, with a note
> "Measured against hidden ground truth after discovery completes."
> 6. Closing CTA "Stop guessing what your agent did wrong." with a big blue button "Open
> the Issue Inbox", then a minimal footer.
>
> ## Decorative details and motion
> Floating animated stickers with gentle float/rotate motion: a rotated red "P0" rubber
> stamp, a magnifying glass over a trace snippet, a fingerprint mark, an "E2 EVIDENCE"
> paper tag, push-pins on cards, a caution-tape divider strip. Scroll-triggered fade-up
> reveals with stagger, animated number counters, magnetic buttons, subtle card hover
> tilt. Lucide-style thin line icons throughout (radar, fingerprint, folder-search,
> scale, siren, repeat, stamp). Fully responsive; honor prefers-reduced-motion; keep hero
> text readable with a scrim over the 3D canvas.
