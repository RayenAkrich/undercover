# Hidden Failures Intelligence — UI/UX Design System

## Purpose

The UI must make a complex AI-reliability problem understandable to a jury in seconds.

The product should feel like an engineering reliability tool: precise, calm, evidence-driven, and operational.

Avoid cyberpunk aesthetics, excessive graphs, generic “AI magic” visuals, and dashboards overloaded with vanity metrics.

## Design Principles

- **Issues before charts.** The primary object is a recurring failure cluster.
- **Evidence before explanation.** Generated summaries must lead to trace evidence.
- **Priority before volume.** High-impact rare failures may matter more than common low-impact ones.
- **Facts vs AI interpretation must look different.**
- **Three-click investigation:** Inbox → Cluster → Session evidence.
- **Demo legibility:** key numbers visible from a projector.

## Information Architecture

Primary navigation:

```text
Logo | Issue Inbox | Runs | Benchmark | Import
```

P0 pages:

- Issue Inbox
- Import / Start Analysis
- Run Overview
- Cluster Detail
- Session Trace
- Benchmark

## Color Palette

### Base

| Token | Suggested value | Use |
|---|---|---|
| background | `#F8FAFC` | page |
| surface | `#FFFFFF` | cards |
| text-primary | `#0F172A` | headings |
| text-secondary | `#475569` | body |
| border | `#E2E8F0` | dividers |
| accent | `#2563EB` | primary actions |

### Priority

| Priority | Suggested value | Meaning |
|---|---|---|
| P0 | `#B91C1C` | immediate |
| P1 | `#EA580C` | high |
| P2 | `#CA8A04` | medium |
| P3 | `#475569` | low |

### Evidence

Use neutral/blue styling for factual evidence. Use a distinct subtle purple/indigo treatment for AI-generated interpretation/hypothesis so the difference is obvious.

## Typography

Primary: Inter or system sans-serif.

Technical metadata: JetBrains Mono or another monospace font.

Recommended scale:

```text
H1      32–40px
H2      24–30px
H3      18–22px
Body    15–16px
Small   13–14px
Code    13–14px
```

## Issue Inbox

The first screen should answer:

```text
How many sessions were analyzed?
How many failures were found?
How many recurring patterns exist?
What should I fix first?
```

Suggested header metrics:

```text
2,347 Sessions | 148 Failures | 5 Recurring Patterns | 6.3% Failure Rate
```

Then a prioritized list.

### Cluster Card

Show:

```text
[P0] Duplicate refunds after retry
32 occurrences · 28 sessions · Confidence 97%
Potential financial impact
Last seen 12 min ago
```

Primary CTA: **Inspect evidence**

## Cluster Detail

Recommended structure:

```text
Title + Priority
Short generated summary

Stats row
Occurrences | Reach | Confidence | First seen | Last seen

Priority breakdown
Impact | Frequency | Severity | Reach | Confidence

Behavior pattern
User intent → Agent action → Tool result/outcome

Representative evidence
3–7 sessions

Likely contributing factor
Clearly labeled "AI hypothesis"
```

## Evidence Timeline

Use a vertical sequence:

```text
USER REQUEST
"Refund 10 dollars"

AGENT
"I'll process that."

TOOL CALL   ← highlighted mismatch
refund_order(amount=100)

TOOL RESULT
success

FINAL ANSWER
"Your 10 dollar refund was completed."
```

For expected vs observed values:

```text
Expected  10
Observed 100
```

Make this visually obvious without relying on color alone.

## Run Progress

The analysis experience may show stages:

```text
✓ Imported
✓ Normalized
✓ Deterministic detection
● Semantic judging
○ Clustering
○ Prioritization
```

Do not fake progress percentages. Stage-based progress is sufficient for MVP.

## Benchmark Page

Show only actual measured metrics from the current run.

Suggested:

- Precision
- Recall
- F1
- False positives
- False negatives
- ARI/NMI when available

Add a clear note:

> Ground-truth labels are used only after discovery completes.

## Data States

### Loading

Skeletons or stage progress.

### Empty — no datasets

CTA: `Import demo dataset`

### Empty — no failures

Explain that no failure events were detected under current configuration. Do not present “0 failures” as proof of safety.

### Error

Show human-readable cause and retry action.

## Accessibility

- minimum 4.5:1 contrast for text;
- priority must use label + color;
- keyboard-accessible interactions;
- do not encode evidence solely through red/green;
- tool payloads should wrap/scroll safely.

## Motion

Use minimal 150–250ms transitions.

No decorative particle/AI animations.

## Jury Demo Mode

A demo mode may provide a preloaded dataset/run so a network/model outage does not destroy the presentation.

The live path should still be available, but the demo should have a deterministic fallback.

Recommended 3-minute story:

1. show thousands of sessions;
2. show 5 discovered issues;
3. open P0 duplicate refund;
4. show concrete evidence;
5. show measured benchmark;
6. close with the regression-loop vision.
