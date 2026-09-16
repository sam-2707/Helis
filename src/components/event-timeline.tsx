import { formatDateTime } from "@/lib/format-date";
import type { StudentEvent } from "@/lib/types";

interface EventTimelineProps {
  events: StudentEvent[];
  studentNames?: Record<string, string>;
}

const valenceColor: Record<string, string> = {
  positive: "bg-emerald-100 text-emerald-800",
  neutral: "bg-slate-100 text-slate-700",
  concern: "bg-amber-100 text-amber-900",
};

export function EventTimeline({ events, studentNames }: EventTimelineProps) {
  if (events.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-[var(--border)] p-6 text-sm text-[var(--muted)]">
        No events yet. Log the first classroom signal above.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {events.map((event) => (
        <li
          key={event.id}
          className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
        >
          <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide">
            <span className="rounded-full bg-[var(--paper)] px-2 py-1 text-[var(--muted)]">
              {event.type}
            </span>
            <span
              className={`rounded-full px-2 py-1 ${valenceColor[event.valence]}`}
            >
              {event.valence}
            </span>
            <span className="text-[var(--muted)] normal-case tracking-normal">
              {formatDateTime(event.occurredAt)}
            </span>
          </div>
          {studentNames?.[event.studentId] ? (
            <p className="mt-2 text-sm font-medium text-[var(--ink)]">
              {studentNames[event.studentId]}
            </p>
          ) : null}
          <p className="mt-1 text-sm text-[var(--ink-soft)]">{event.body}</p>
        </li>
      ))}
    </ul>
  );
}
