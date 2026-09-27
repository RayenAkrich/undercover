// Thin server-side API client for the FastAPI analysis service.
// Every call is resilient: on any failure it returns null so the caller can fall
// back to the deterministic demo bundle (doc/12 jury-demo mode).

import type { FailureEvent, SessionEvent, SessionMeta } from "@/types/session";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:8000/api/v1";

async function safeGet<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function getSession(id: string): Promise<SessionMeta | null> {
  return safeGet<SessionMeta>(`/sessions/${encodeURIComponent(id)}`);
}

export async function getSessionEvents(id: string): Promise<SessionEvent[] | null> {
  const data = await safeGet<{ items: SessionEvent[] }>(
    `/sessions/${encodeURIComponent(id)}/events`
  );
  return data?.items ?? null;
}

export async function getSessionFailures(id: string): Promise<FailureEvent[] | null> {
  const data = await safeGet<{ items: FailureEvent[] }>(
    `/sessions/${encodeURIComponent(id)}/failures`
  );
  return data?.items ?? null;
}
