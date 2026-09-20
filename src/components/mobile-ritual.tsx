"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { RitualTemplate } from "@/lib/rituals/templates";
import type { Student, StudentEvent } from "@/lib/types";

interface ClassPayload {
  id: string;
  name: string;
}

interface MobileRitualProps {
  classRoom: ClassPayload;
  students: Student[];
  consentByStudent: Record<string, boolean>;
}

type Mode = "tap" | "homework" | "event";

const toneClass: Record<RitualTemplate["tone"], string> = {
  concern: "border-amber-300 bg-amber-50 text-amber-950",
  win: "border-teal-300 bg-teal-50 text-teal-950",
  attendance: "border-slate-300 bg-slate-50 text-slate-900",
  neutral: "border-[var(--border)] bg-white text-[var(--ink)]",
};

export function MobileRitual({
  classRoom,
  students,
  consentByStudent,
}: MobileRitualProps) {
  const [templates, setTemplates] = useState<RitualTemplate[]>([]);
  const [selectedId, setSelectedId] = useState(students[0]?.id ?? "");
  const [mode, setMode] = useState<Mode>("tap");
  const [homeworkIndex, setHomeworkIndex] = useState(0);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [recent, setRecent] = useState<StudentEvent[]>([]);
  const [checked, setChecked] = useState<Record<string, "ok" | "miss">>({});
  const [volunteers, setVolunteers] = useState<Record<string, boolean>>({});
  const [eventTitle, setEventTitle] = useState("Class activity");
  const [eventDesc, setEventDesc] = useState("");
  const [eventMins, setEventMins] = useState(40);

  const selected = useMemo(
    () => students.find((s) => s.id === selectedId) ?? students[0],
    [students, selectedId],
  );

  const loadRecent = useCallback(async () => {
    const res = await fetch(`/api/events?classId=${classRoom.id}`);
    const data = await res.json();
    setRecent((data.events ?? []).slice(0, 8));
  }, [classRoom.id]);

  useEffect(() => {
    void fetch("/api/rituals")
      .then((r) => r.json())
      .then((d) => setTemplates(d.templates ?? []));
    void loadRecent();
  }, [loadRecent]);

  async function tapTemplate(templateId: string, studentId: string) {
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch("/api/rituals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "tap",
          classId: classRoom.id,
          studentId,
          templateId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");

      const notify = data.notification;
      let msg = `Logged · ${data.template.label}`;
      if (notify?.sent) {
        msg += notify.mock ? " · WA mock sent" : " · WhatsApp sent";
      } else if (notify?.reason === "CONSENT_REQUIRED") {
        msg += " · WA blocked (no consent)";
      } else if (notify?.reason === "DEFERRED") {
        msg += " · WA queued";
      }
      setStatus(msg);
      await loadRecent();
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function homeworkMark(kind: "ok" | "miss") {
    const student = students[homeworkIndex];
    if (!student) return;
    const templateId = kind === "miss" ? "homework_missing" : "present";
    await tapTemplate(templateId, student.id);
    setChecked((prev) => ({ ...prev, [student.id]: kind }));
    setHomeworkIndex((i) => Math.min(i + 1, students.length - 1));
  }

  async function submitClassEvent() {
    setBusy(true);
    setStatus(null);
    try {
      const volunteerIds = Object.entries(volunteers)
        .filter(([, v]) => v)
        .map(([id]) => id);
      const res = await fetch("/api/rituals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "class_event",
          classId: classRoom.id,
          title: eventTitle,
          description: eventDesc,
          durationMinutes: eventMins,
          volunteerIds,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      const sent = (data.notifications ?? []).filter(
        (n: { sent: boolean }) => n.sent,
      ).length;
      setStatus(
        `Event on ${data.eventCount} students · ${sent} parent WhatsApp(s)`,
      );
      setVolunteers({});
      await loadRecent();
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  const homeworkStudent = students[homeworkIndex];
  const homeworkDone = Object.keys(checked).length;

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-lg flex-col gap-4 px-4 pb-10 pt-4">
      <header className="sticky top-0 z-10 -mx-4 border-b border-[var(--border)] bg-[var(--paper)]/95 px-4 py-3 backdrop-blur">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--accent)]">
          Helis · Phone
        </p>
        <h1 className="text-2xl text-[var(--ink)]">{classRoom.name}</h1>
        <p className="text-sm text-[var(--muted)]">
          Tap rituals — no typing mid-class
        </p>
      </header>

      <div className="grid grid-cols-3 gap-2">
        {(
          [
            ["tap", "Quick tap"],
            ["homework", "Homework"],
            ["event", "Event"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setMode(id)}
            className={`rounded-2xl px-2 py-3 text-sm font-medium ${
              mode === id
                ? "bg-[var(--accent)] text-white"
                : "border border-[var(--border)] bg-[var(--surface)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === "tap" ? (
        <>
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3">
            <p className="mb-2 text-xs uppercase tracking-wide text-[var(--muted)]">
              Student
            </p>
            <div className="flex max-h-40 flex-col gap-1 overflow-y-auto">
              {students.map((student) => (
                <button
                  key={student.id}
                  type="button"
                  onClick={() => setSelectedId(student.id)}
                  className={`flex items-center justify-between rounded-xl px-3 py-3 text-left text-base ${
                    selectedId === student.id
                      ? "bg-[var(--accent-soft)] font-medium"
                      : "bg-white"
                  }`}
                >
                  <span>{student.name}</span>
                  <span
                    className={`text-[10px] uppercase ${
                      consentByStudent[student.id]
                        ? "text-teal-700"
                        : "text-rose-600"
                    }`}
                  >
                    {consentByStudent[student.id] ? "WA ok" : "no consent"}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section>
            <p className="mb-2 text-xs uppercase tracking-wide text-[var(--muted)]">
              Templates for {selected?.name?.split(" ")[0]}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {templates.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  disabled={busy || !selected}
                  onClick={() =>
                    selected && void tapTemplate(t.id, selected.id)
                  }
                  className={`min-h-[72px] rounded-2xl border px-3 py-3 text-left text-sm font-medium active:scale-[0.98] disabled:opacity-50 ${toneClass[t.tone]}`}
                >
                  {t.label}
                  {t.notifyParent ? (
                    <span className="mt-1 block text-[10px] font-normal opacity-70">
                      + WhatsApp parent
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          </section>
        </>
      ) : null}

      {mode === "homework" ? (
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
            Homework check · {homeworkDone}/{students.length}
          </p>
          {homeworkStudent ? (
            <>
              <p className="mt-3 text-3xl font-semibold text-[var(--ink)]">
                {homeworkStudent.name}
              </p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Call the name → tap result → next
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void homeworkMark("ok")}
                  className="min-h-[88px] rounded-2xl bg-teal-700 text-lg font-semibold text-white active:scale-[0.98]"
                >
                  Done / OK
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void homeworkMark("miss")}
                  className="min-h-[88px] rounded-2xl bg-amber-600 text-lg font-semibold text-white active:scale-[0.98]"
                >
                  Missing → WA
                </button>
              </div>
              <div className="mt-4 flex justify-between">
                <button
                  type="button"
                  className="text-sm text-[var(--accent)]"
                  onClick={() =>
                    setHomeworkIndex((i) => Math.max(0, i - 1))
                  }
                >
                  ← Prev
                </button>
                <button
                  type="button"
                  className="text-sm text-[var(--accent)]"
                  onClick={() =>
                    setHomeworkIndex((i) =>
                      Math.min(students.length - 1, i + 1),
                    )
                  }
                >
                  Skip →
                </button>
              </div>
            </>
          ) : null}
        </section>
      ) : null}

      {mode === "event" ? (
        <section className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
            Class event → all student records
          </p>
          <input
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] px-3 py-3 text-base"
            placeholder="Event name"
          />
          <input
            value={eventDesc}
            onChange={(e) => setEventDesc(e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] px-3 py-3 text-base"
            placeholder="Short description"
          />
          <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
            Duration (min)
            <input
              type="number"
              value={eventMins}
              onChange={(e) => setEventMins(Number(e.target.value) || 40)}
              className="w-20 rounded-lg border border-[var(--border)] px-2 py-1"
            />
          </label>
          <p className="text-sm font-medium text-[var(--ink)]">
            Who volunteered? (WA parents)
          </p>
          <div className="max-h-48 space-y-1 overflow-y-auto">
            {students.map((student) => (
              <label
                key={student.id}
                className="flex items-center gap-3 rounded-xl bg-white px-3 py-3"
              >
                <input
                  type="checkbox"
                  checked={Boolean(volunteers[student.id])}
                  onChange={(e) =>
                    setVolunteers((prev) => ({
                      ...prev,
                      [student.id]: e.target.checked,
                    }))
                  }
                  className="h-5 w-5"
                />
                <span>{student.name}</span>
              </label>
            ))}
          </div>
          <button
            type="button"
            disabled={busy || !eventTitle.trim()}
            onClick={() => void submitClassEvent()}
            className="w-full rounded-2xl bg-[var(--accent)] py-4 text-base font-semibold text-white disabled:opacity-50"
          >
            Save event + notify volunteers
          </button>
        </section>
      ) : null}

      {status ? (
        <p className="rounded-xl bg-[var(--accent-soft)] px-3 py-2 text-sm text-[var(--accent)]">
          {status}
        </p>
      ) : null}

      <section>
        <p className="mb-2 text-xs uppercase tracking-wide text-[var(--muted)]">
          Just logged
        </p>
        <ul className="space-y-2">
          {recent.map((event) => {
            const name =
              students.find((s) => s.id === event.studentId)?.name ?? "";
            return (
              <li
                key={event.id}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
              >
                <span className="font-medium">{name}</span>
                <span className="text-[var(--muted)]"> · {event.body}</span>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
