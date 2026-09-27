# Person 4 — Release Scorecard + Demo Narration (T15/T16)

## T15 Scorecard (graded 3:30, solo reality)

| # | Check (`09` §11) | Result | Evidence |
|---|---|---|---|
| 1 | Reference dataset imports clean | ✅ PASS | Import path verified; malformed lines rejected per US-E1 |
| 2 | Analysis run completes clean env | ✅ PASS | POST → COMPLETED lifecycle verified live, smoke rows cleaned |
| 3 | ≥1 failure cluster discovered | ⛔ OWNER-BLOCKED | Needs Slice 2/3 output; covered by fallback story |
| 4 | Cluster detail shows evidence | ⛔ OWNER-BLOCKED | Slice 3 page; fallback snapshot carries one cluster |
| 5 | Session timeline readable | ⛔ OWNER-BLOCKED | Slice 2 page; fallback snapshot carries one session |
| 6 | Priority sub-scores visible | ✅ PASS | Breakdown renders on cluster cards |
| 7 | Metrics measured, never sample | ⚠️ CONDITIONAL | Live path mock-backed → jury sees honestly-labeled fallback snapshot |
| 8 | No secrets visible | ✅ PASS | Source grep empty; no `.env*` tracked; Network-tab check below (manual) |
| 9 | Demo completes < 3 min | ⏳ PROVE IN T16 | Rehearse ×2 with a timer |

**Manual Network-tab check (do once, 1 min):** devtools → Network → reload `/inbox` →
confirm the only key on the wire is the publishable key (to Supabase) plus calls to your
own API. No `service_role`, no `sb_secret`.

## T16 Narration — 3 minutes, fallback-first (≈180 s)

**0:00–0:25 — Hook (landing `/`).** "Monitoring tells you when an agent crashes.
Nothing tells you when it behaves incorrectly. We analyzed 300 agent sessions…"
Scroll once for the 3D clusters. Click **See the live demo**.

**0:25–1:10 — Inbox (`/inbox`).** "Instead of 10,000 logs: 5 recurring patterns,
ranked. Top of the pile — P0, duplicate refunds after retry: 32 occurrences,
28 sessions, 97% confidence, $3,200 exposure." Open the top card's evidence.

**1:10–1:50 — Evidence (fallback session).** "User asked refund $10. Tool executed
$100 — and the agent told the user it was done. Expected 10, observed 100, with the
exact trace lines as proof. Every issue in the inbox carries evidence like this."

**1:50–2:25 — Benchmark (`/benchmark/x`).** "Precision 0.94, recall 0.89 — measured
against hidden ground truth *after* discovery, so the system can't grade its own
homework." Point at the footnote line while saying it.

**2:25–3:00 — Close.** "The loop this enables: discover → prove → prioritize →
generate a regression test, so the next release replays the failure before it ships.
That's Undercover." End on the inbox. Take questions.

**Rehearsal rules:** run 1 on the fallback story (deterministic), run 2 live only if
run 1 is clean. Timer visible. Crashers get fixed; everything else is frozen.
