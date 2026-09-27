// Deterministic demo bundle for the Session Evidence page (doc/12 jury-demo mode).
// Used when the API is unreachable so a network/model outage never breaks the demo.
// Mirrors the exact shapes the FastAPI endpoints return, so the UI code is identical
// whether data is live or fallback. Scenario: CASE-044 / s-182 wrong refund amount
// with a secondary false-success (hallucinated confirmation).

import type { SessionBundle } from "@/types/session";

export function demoSessionBundle(externalId = "s-182"): SessionBundle {
  return {
    isDemo: true,
    session: {
      id: "demo-s-182",
      external_session_id: externalId,
      agent_version: "checkout-worker-v3.0.4",
      model_name: "gpt-4o-2024-08-06",
      metadata: { origin: "web_chat_client", duration_ms: 1840 },
    },
    events: [
      {
        id: "evt-1",
        sequence_no: 1,
        event_type: "USER_MESSAGE",
        content:
          "Please issue a $10 partial refund for the delayed delivery on order ord_9921. Do not refund the entire order, just the ten dollar courtesy credit.",
      },
      {
        id: "evt-2",
        sequence_no: 2,
        event_type: "ASSISTANT_MESSAGE",
        content:
          "I will look up order ord_9921 and process a courtesy refund of $10 for delayed shipping as requested.",
      },
      {
        id: "evt-3",
        sequence_no: 3,
        event_type: "TOOL_CALL",
        tool_name: "refund_order",
        payload: {
          arguments: {
            order_id: "ord_9921",
            amount: 100.0,
            currency: "USD",
            reason: "customer_courtesy_delay",
          },
        },
      },
      {
        id: "evt-4",
        sequence_no: 4,
        event_type: "TOOL_RESULT",
        tool_name: "refund_order",
        status: "success",
        payload: {
          result: {
            status: "succeeded",
            transaction_id: "tx_891928_rf",
            amount_refunded: 100.0,
            balance_transaction: "txn_0049182",
          },
        },
      },
      {
        id: "evt-5",
        sequence_no: 5,
        event_type: "ASSISTANT_FINAL",
        content:
          "Done! Your $10 refund has been successfully issued to your original payment method for order ord_9921.",
      },
    ],
    failures: [
      {
        id: "fail-1",
        failure_type: "WRONG_PARAMETER",
        tool_name: "refund_order",
        parameter_name: "amount",
        expected_value: 10.0,
        observed_value: 100.0,
        confidence: 0.98,
        evidence_tier: 2,
        is_hypothesis: false,
        semantic_summary:
          "The user requested a $10 partial refund, but refund_order executed amount=100.00 — a 10x overpayment.",
        evidence: [
          { label: "User requested amount: $10.00", event_id: "evt-1", evidence_tier: 3 },
          { label: "Executed tool call: amount=100.00", event_id: "evt-3", evidence_tier: 2 },
          { label: "Refund settled at $100.00", event_id: "evt-4", evidence_tier: 1 },
        ],
      },
      {
        id: "fail-2",
        failure_type: "FALSE_SUCCESS",
        tool_name: "refund_order",
        parameter_name: null,
        expected_value: "refund of $10 (or an accurate amount)",
        observed_value: "claimed $10 refund while $100 was charged",
        confidence: 0.72,
        evidence_tier: 4,
        is_hypothesis: true,
        semantic_summary:
          "The final answer claims a $10 refund was issued, masking the verified $100 debit from the customer.",
        evidence: [
          { label: "Executed tool call: amount=100.00", event_id: "evt-3", evidence_tier: 2 },
          { label: "Final answer claims $10 refund", event_id: "evt-5", evidence_tier: 4 },
        ],
      },
    ],
  };
}
