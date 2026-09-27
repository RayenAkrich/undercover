"""Generate the demo JSONL fixture for Slice 1."""

from __future__ import annotations

import json
from datetime import datetime, timedelta, timezone
from pathlib import Path
from random import Random


ROOT = Path(__file__).resolve().parents[3]
OUT_DIR = ROOT / "data" / "demo"
SESSION_COUNT = 300
FAULTS = {
    "WRONG_PARAMETER": 12,
    "FALSE_SUCCESS": 12,
    "DUPLICATE_ACTION": 12,
    "WRONG_TOOL": 12,
    "LOOP_RETRY": 12,
}


def tool_call(call_id: str, tool_name: str, arguments: dict, result: dict) -> dict:
    return {
        "id": call_id,
        "tool_name": tool_name,
        "arguments": arguments,
        "result": result,
    }


def base_session(index: int, failure_type: str | None, rng: Random) -> dict:
    order_id = f"ORD-{1000 + index}"
    session_id = f"demo-{index:04d}"
    ts = datetime(2026, 9, 27, 10, tzinfo=timezone.utc) + timedelta(minutes=index)
    agent_version = "v3" if index % 3 else "v2"
    call_id = f"{session_id}-call"

    refund_phrases = [
        f"Please refund $10 for order {order_id}.",
        f"I was overcharged on {order_id}; refund ten dollars.",
        f"Can you send back 10 USD for {order_id}?",
    ]
    address_phrases = [
        f"Change the shipping address for {order_id} to 42 Cedar St.",
        f"Please update {order_id} to deliver to 42 Cedar St.",
        f"My address changed; send {order_id} to 42 Cedar St.",
    ]

    messages = [
        {"role": "user", "content": rng.choice(refund_phrases)},
        {"role": "assistant", "content": "I will check the order and take care of that."},
    ]
    calls = [
        tool_call(f"{call_id}-1", "get_order", {"order_id": order_id}, {"status": "success"}),
        tool_call(
            f"{call_id}-2",
            "refund_order",
            {"order_id": order_id, "amount": 10, "currency": "USD"},
            {"status": "success", "refund_id": f"rf_{index:04d}"},
        ),
    ]
    final_answer = "Done - I refunded $10 to your original payment method."

    if failure_type == "WRONG_PARAMETER":
        calls[1]["arguments"]["amount"] = 100
        final_answer = "Done - I refunded $10 to your original payment method."
    elif failure_type == "FALSE_SUCCESS":
        calls[1]["result"] = {"status": "error", "error": "Refund window expired"}
        final_answer = "Your refund has been completed successfully."
    elif failure_type == "DUPLICATE_ACTION":
        calls.append(
            tool_call(
                f"{call_id}-3",
                "refund_order",
                {"order_id": order_id, "amount": 10, "currency": "USD"},
                {"status": "success", "refund_id": f"rf_dup_{index:04d}"},
            )
        )
        final_answer = "Your refund has been completed."
    elif failure_type == "WRONG_TOOL":
        messages[0]["content"] = rng.choice(address_phrases)
        calls[1] = tool_call(
            f"{call_id}-2",
            "cancel_order",
            {"order_id": order_id, "reason": "customer_request"},
            {"status": "success", "cancelled": True},
        )
        final_answer = "I updated the shipping address for your order."
    elif failure_type == "LOOP_RETRY":
        calls = [calls[0]]
        for retry in range(4):
            calls.append(
                tool_call(
                    f"{call_id}-{retry + 2}",
                    "change_address",
                    {"order_id": order_id, "address": "42 Cedar St"},
                    {"status": "error", "error": "temporary timeout"},
                )
            )
        final_answer = "I could not confirm the address update yet."
        messages[0]["content"] = rng.choice(address_phrases)
    elif index % 4 == 0:
        messages[0]["content"] = rng.choice(address_phrases)
        calls[1] = tool_call(
            f"{call_id}-2",
            "change_address",
            {"order_id": order_id, "address": "42 Cedar St"},
            {"status": "success"},
        )
        final_answer = "Done - I updated the shipping address."
    elif index % 5 == 0:
        messages[0]["content"] = f"Can you cancel order {order_id}?"
        calls[1] = tool_call(
            f"{call_id}-2",
            "cancel_order",
            {"order_id": order_id, "reason": "customer_request"},
            {"status": "success", "cancelled": True},
        )
        final_answer = "Done - the order has been cancelled."

    return {
        "session_id": session_id,
        "messages": messages,
        "tool_calls": calls,
        "final_answer": final_answer,
        "metadata": {
            "agent_version": agent_version,
            "timestamp": ts.isoformat().replace("+00:00", "Z"),
        },
    }


def main() -> None:
    rng = Random(7)
    labels = [None] * (SESSION_COUNT - sum(FAULTS.values()))
    for failure_type, count in FAULTS.items():
        labels.extend([failure_type] * count)
    rng.shuffle(labels)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    ground_truth = {}
    with (OUT_DIR / "demo.jsonl").open("w", encoding="utf-8") as f:
        for index, failure_type in enumerate(labels, 1):
            session = base_session(index, failure_type, rng)
            f.write(json.dumps(session, separators=(",", ":")) + "\n")
            if failure_type:
                ground_truth[session["session_id"]] = failure_type

    (OUT_DIR / "ground_truth.json").write_text(
        json.dumps(ground_truth, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
