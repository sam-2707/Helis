"use client";

import type { CreateEventInput } from "@/lib/types";

const STORAGE_KEY = "helis-event-outbox";

export function readOutbox(): CreateEventInput[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CreateEventInput[]) : [];
  } catch {
    return [];
  }
}

export function writeOutbox(items: CreateEventInput[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function enqueueEvent(event: CreateEventInput) {
  writeOutbox([...readOutbox(), event]);
}

export async function flushOutbox() {
  const queue = readOutbox();
  if (queue.length === 0) return { flushed: 0 };

  const remaining: CreateEventInput[] = [];
  let flushed = 0;

  for (const item of queue) {
    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      if (response.ok) {
        flushed += 1;
      } else {
        remaining.push(item);
      }
    } catch {
      remaining.push(item);
    }
  }

  writeOutbox(remaining);
  return { flushed, remaining: remaining.length };
}

export async function postEventWithRetry(input: CreateEventInput) {
  try {
    const response = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as {
        error?: unknown;
      } | null;
      throw new Error(
        typeof data?.error === "string"
          ? data.error
          : `Failed to save event (${response.status})`,
      );
    }

    return response.json();
  } catch (error) {
    // Only queue when the network itself failed (offline / unreachable)
    if (error instanceof TypeError) {
      enqueueEvent(input);
      throw new Error("Saved offline — will retry when back online");
    }
    throw error;
  }
}
