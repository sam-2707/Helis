"use client";

import { useState } from "react";

import { postEventWithRetry } from "@/lib/offline/event-queue";
import type { EventType, EventValence, Student } from "@/lib/types";

const EVENT_TYPES: EventType[] = [
  "attendance",
  "academic",
  "behavior",
  "social",
  "win",
  "note",
];

const VALENCES: EventValence[] = ["positive", "neutral", "concern"];

interface EventComposerProps {
  classId: string;
  students: Student[];
  onCreated?: () => void;
}

export function EventComposer({
  classId,
  students,
  onCreated,
}: EventComposerProps) {
  const [studentId, setStudentId] = useState(students[0]?.id ?? "");
  const [type, setType] = useState<EventType>("academic");
  const [valence, setValence] = useState<EventValence>("neutral");
  const [severity, setSeverity] = useState<1 | 2 | 3>(1);
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!studentId || !body.trim()) return;

    setLoading(true);
    setStatus(null);

    try {
      await postEventWithRetry({
        studentId,
        classId,
        type,
        valence,
        severity,
        tags: [],
        body: body.trim(),
      });
      setBody("");
      setStatus("Logged.");
      onCreated?.();
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Could not save event.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[var(--ink)]">Log signal</h2>
        <span className="text-xs uppercase tracking-wide text-[var(--muted)]">
          under 10s
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm">
          <span className="text-[var(--muted)]">Student</span>
          <select
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="rounded-lg border border-[var(--border)] bg-white px-3 py-2"
          >
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1 text-sm">
          <span className="text-[var(--muted)]">Type</span>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as EventType)}
            className="rounded-lg border border-[var(--border)] bg-white px-3 py-2"
          >
            {EVENT_TYPES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1 text-sm">
          <span className="text-[var(--muted)]">Valence</span>
          <select
            value={valence}
            onChange={(e) => setValence(e.target.value as EventValence)}
            className="rounded-lg border border-[var(--border)] bg-white px-3 py-2"
          >
            {VALENCES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1 text-sm">
          <span className="text-[var(--muted)]">Severity</span>
          <select
            value={severity}
            onChange={(e) =>
              setSeverity(Number(e.target.value) as 1 | 2 | 3)
            }
            className="rounded-lg border border-[var(--border)] bg-white px-3 py-2"
          >
            <option value={1}>1 — light</option>
            <option value={2}>2 — moderate</option>
            <option value={3}>3 — urgent</option>
          </select>
        </label>
      </div>

      <label className="mt-3 grid gap-1 text-sm">
        <span className="text-[var(--muted)]">Note</span>
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Homework missing twice; offered help after class."
          className="rounded-lg border border-[var(--border)] bg-white px-3 py-2"
          maxLength={280}
        />
      </label>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="submit"
          disabled={loading || !body.trim()}
          className="rounded-full bg-[var(--accent)] px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "Saving…" : "Log event"}
        </button>
        {status ? (
          <p className="text-sm text-[var(--muted)]">{status}</p>
        ) : null}
      </div>
    </form>
  );
}
