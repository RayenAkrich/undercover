import type { Metadata } from "next";
import InboxView from "@/components/inbox/InboxView";
import { getClusters, getSummary } from "@/lib/api";

export const metadata: Metadata = {
  title: "Issue Inbox — Undercover",
  description: "Recurring behavioral failure clusters, ranked by priority.",
};

export default async function InboxPage({
  params,
}: {
  params: { runId: string };
}) {
  void params;
  const [clusters, summary] = await Promise.all([
    getClusters("inbox"),
    getSummary("inbox"),
  ]);
  return <InboxView clusters={clusters} summary={summary} />;
}
