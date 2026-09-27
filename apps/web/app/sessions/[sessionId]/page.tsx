// Session Evidence page (Slice 2, Deliverable 4 / plan Step 5).
// Server component: fetches the session, its events, and its failures from FastAPI.
// If the API is unreachable it falls back to a deterministic demo bundle so the jury
// demo never breaks (doc/12 jury-demo mode). Interaction lives in <SessionView/>.

import type { Metadata } from "next";
import SessionView from "@/components/session/SessionView";
import { getSession, getSessionEvents, getSessionFailures } from "@/lib/api";
import { demoSessionBundle } from "@/lib/demoSession";
import type { SessionBundle } from "@/types/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Session Evidence — Undercover",
};

async function loadBundle(sessionId: string): Promise<SessionBundle> {
  const [session, events, failures] = await Promise.all([
    getSession(sessionId),
    getSessionEvents(sessionId),
    getSessionFailures(sessionId),
  ]);

  // Without a session or its timeline there is nothing to reconstruct — fall back.
  if (!session || !events) {
    return demoSessionBundle(sessionId);
  }

  return {
    session,
    events,
    failures: failures ?? [],
    isDemo: false,
  };
}

export default async function SessionPage({
  params,
}: {
  params: { sessionId: string };
}) {
  const bundle = await loadBundle(params.sessionId);

  return (
    <main className="w-full min-h-screen bg-ink-950">
      <SessionView bundle={bundle} />
    </main>
  );
}
