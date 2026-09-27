# Undercover — Landing Page Design Spec

Companion to `doc/12-UI-UX-DESIGN-SYSTEM.md`. That file governs the **product dashboard**
(light, calm, evidence-driven). This file governs the **marketing landing page**: a darker,
cinematic "detective evidence-board" aesthetic built around the name *Undercover*.
The landing sells the story; the dashboard keeps the trust.

## 1. Creative direction

**"Every agent has a case file."** The page is a detective's evidence board:
scattered session traces pinned up, red strings converging into labeled case folders
(P0, P1…), each folder backed by hard evidence. Professional and restrained —
sophisticated noir, never cartoonish, never cyberpunk-neon excess.

## 2. Palette

### Landing (dark evidence-board)
| Token | Value | Use |
|---|---|---|
| `ink-950` | `#070B16` | page base |
| `ink-900` | `#0B1226` | section alt |
| `ink-800` | `#131C38` | cards |
| `cream` | `#F4EFE4` | "case file" light section + paper cards |
| `accent-blue` | `#3B82F6` | primary glow, links, factual evidence |
| `accent-red` | `#EF4444` | P0 glow, strings, stamps |
| `accent-amber` | `#F59E0B` | P1/P2 accents |
| `text-dim` | `#94A3B8` | secondary text on dark |

### Product tokens (reused unchanged from `doc/12`)
P0 `#B91C1C` · P1 `#EA580C` · P2 `#CA8A04` · P3 `#475569` · dashboard accent `#2563EB`.
Priority badges on the landing use these exact values so the marketing matches the app.

## 3. Typography
- Display: **Space Grotesk** (headlines, big numbers).
- Body: **Inter** (paragraphs, UI).
- Data/labels: **JetBrains Mono** (badges, diffs, `CASE-042` stamps, code-ish labels).

## 4. Page structure (in order)
1. **Nav** — logo mark (magnifier + fingerprint), links: Problem / How it works / Inbox / Evidence / Benchmark. CTA button "Open live demo".
2. **Hero** (Three.js canvas, §6) — eyebrow, H1, sub, 2 CTAs, live-stat strip.
3. **Stat strip** — `2,347 sessions · 148 failures · 5 patterns · 6.3% rate` (animated counters).
4. **The problem** — 5 silent-failure cards (wrong amount, false success, duplicate refund, wrong tool, retry loop), each with icon + one-line trace quote.
5. **How it works** — 5-step pipeline stepper: Import → Detect → Judge → Cluster → Prioritize.
6. **Issue Inbox preview** — 3 mock cluster cards with priority badges + sub-scores.
7. **Evidence (light "case file" section)** — cream paper card showing the timeline with the highlighted mismatch + Expected/Observed diff. The single light section on the page = contrast moment.
8. **Benchmark** — Precision / Recall / F1 cards.
9. **Closing CTA + footer** — "Stop guessing what your agent did wrong."

## 5. Copy deck (final wording)
- Eyebrow: `BEHAVIORAL RELIABILITY FOR AI AGENTS`
- H1: `Your agent isn't crashing. It's quietly doing the wrong thing.`
- Sub: `Undercover turns thousands of agent traces into a small, prioritized inbox of recurring behavioral failures — each one backed by evidence.`
- CTAs: `See the live demo` / `How it works`
- Problem cards:
  - `Wrong amount` — "User asked refund $10. Tool executed $100."
  - `False success` — "Tool returned error. Agent said 'Completed!'"
  - `Duplicate refund` — "One request. Two charges."
  - `Wrong tool` — "Asked to change an address. Agent cancelled the order."
  - `Retry loop` — "Same tool call, 9 times, zero progress."
- Inbox preview: `[P0] Duplicate refunds after retry — 32 occurrences · 28 sessions · Confidence 97%`, `[P0] False success after refund rejection`, `[P1] Wrong refund amounts`.
- Evidence mock: USER `"Refund $10"` → TOOL `refund_order(amount=100)` ⚠ → `Expected 10 / Observed 100`.
- Closing: `Stop guessing what your agent did wrong.` + button `Open the Issue Inbox`.
- ⚠ All numbers on the landing are **illustrative demo data** until wired to a real run.

## 6. Three.js hero spec
- Full-bleed canvas behind hero content, `ink-950` base with radial blue/red glows + faint grid.
- ~600 small drifting dots (sessions). On load they animate into **5 glowing clusters** connected by thin lines (the red strings), each cluster node ringed in its priority color with a floating mono label (`CASE-01…CASE-05`).
- Mouse parallax on camera; slow idle drift; scroll gently fades canvas.
- `prefers-reduced-motion` → render one static clustered frame. Mobile → ≤200 dots, no parallax.
- Static gradient fallback if WebGL unavailable.

## 7. Motion & stickers
- Scroll reveals (fade-up, staggered), animated counters, magnetic buttons, card hover tilt.
- Floating stickers (gentle float + slight rotation, absolutely positioned, hidden on small screens):
  floating `P0` rubber stamp (rotated red outline), magnifying glass over a trace snippet,
  fingerprint mark, `E2 EVIDENCE` paper tag, push-pins on cards, caution-tape divider strip.
- Icons: Lucide-style thin line icons (radar, fingerprint, folder-search, scale, siren, repeat, git-branch, stamp).
- Timing 150–350ms ease-out; nothing flashing or auto-playing video.

## 8. Don'ts
- No neon cyberpunk, no particle chaos, no fake "trusted by" logos, no sample metrics presented as measured truth, no unreadable text over the 3D canvas (scrim behind hero copy).
