"""Template labels for demo clusters."""

from __future__ import annotations

from collections import Counter
from typing import Any


TITLES = {
    "DUPLICATE_ACTION": "Duplicate refunds after retry",
    "WRONG_PARAMETER": "Wrong refund amounts",
    "FALSE_SUCCESS": "False success after tool failure",
    "WRONG_TOOL": "Wrong tool for address changes",
    "LOOP_RETRY": "Retry loops without progress",
}

HYPOTHESES = {
    "DUPLICATE_ACTION": "Retry handling may lack idempotency protection.",
    "WRONG_PARAMETER": "Parameter extraction may confuse requested and executable amounts.",
    "FALSE_SUCCESS": "Final-response logic may ignore failed tool results.",
    "WRONG_TOOL": "Routing may over-select destructive order tools.",
    "LOOP_RETRY": "Retry policy may not stop repeated empty results.",
}


def label_cluster(events: list[dict[str, Any]]) -> dict[str, str]:
    failure_type = Counter(event["failure_type"] for event in events).most_common(1)[0][0]
    workflow = Counter(event.get("workflow") or "workflow" for event in events).most_common(1)[0][0]
    tool = Counter(event.get("tool_name") or "tool" for event in events).most_common(1)[0][0]
    title = TITLES.get(failure_type, f"{failure_type.replace('_', ' ').title()} in {workflow} via {tool}")
    return {
        "generated_title": title,
        "generated_summary": f"{len(events)} events show {failure_type.replace('_', ' ').lower()} in {workflow} via {tool}.",
        "likely_contributing_factor": HYPOTHESES.get(
            failure_type, "Pattern may share a common routing or validation weakness."
        ),
    }
