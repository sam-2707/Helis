"use client";

import { useEffect, useMemo, useState } from "react";

import { EventTimeline } from "@/components/event-timeline";
import type {
  Digest,
  Guardian,
  RiskSignal,
  Student,
  StudentEvent,
} from "@/lib/types";

interface ChartPoint {
  day: string;
  concerns: number;
  wins: number;
  attendance: number;
}

interface ParentDashboardProps {
  guardianId?: string;
}

function MiniSpark({
  values,
  color,
}: {
  values: number[];
  color: string;
}) {
  const max = Math.max(1, ...values);
  return (
    <div className="mt-4 flex h-10 items-end gap-0.5" aria-hidden>
      {values.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm opacity-80"
          style={{
            height: `${Math.max(8, (v / max) * 100)}%`,
            backgroundColor: v > 0 ? color : "var(--border)",
          }}
        />
      ))}
    </div>
  );
}

function SignalTablet({
  label,
  value,
  hint,
  accent,
  spark,
  sparkColor,
}: {
  label: string;
  value: number | string;
  hint: string;
  accent: string;
  spark: number[];
  sparkColor: string;
}) {
  return (
    <article
      className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_1px_0_rgba(31,41,51,0.04)]"
      style={{ boxShadow: `inset 0 3px 0 ${accent}` }}
    >
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-3 text-4xl font-semibold tracking-tight text-[var(--ink)]">
        {value}
      </p>
      <p className="mt-1 text-sm text-[var(--ink-soft)]">{hint}</p>
      <MiniSpark values={spark} color={sparkColor} />
      <p className="mt-2 text-[10px] uppercase tracking-wide text-[var(--muted)]">
        Last 14 days
      </p>
    </article>
  );
}

export function ParentDashboard({
  guardianId = "guard-1",
}: ParentDashboardProps) {
  const [guardian, setGuardian] = useState<Guardian | null>(null);
  const [children, setChildren] = useState<Student[]>([]);
  const [student, setStudent] = useState<Student | null>(null);
  const [events, setEvents] = useState<StudentEvent[]>([]);
  const [risk, setRisk] = useState<RiskSignal | null>(null);
  const [digest, setDigest] = useState<Digest | null>(null);
  const [chart, setChart] = useState<ChartPoint[]>([]);
  const [lang, setLang] = useState<"en" | "hi">("en");
  const [question, setQuestion] = useState("");
  const [chatLog, setChatLog] = useState<
    Array<{ role: "parent" | "ai"; body: string }>
  >([]);
  const [chatBusy, setChatBusy] = useState(false);

  async function load(studentId?: string) {
    const qs = new URLSearchParams({ guardianId });
    if (studentId) qs.set("studentId", studentId);
    const res = await fetch(`/api/parent/dashboard?${qs}`);
    const data = await res.json();
    setGuardian(data.guardian);
    setChildren(data.children ?? []);
    setStudent(data.student);
    setEvents(data.events ?? []);
    setRisk(data.risk);
    setDigest(data.digest);
    setChart(data.chart ?? []);
    if (data.guardian?.preferredLanguage) {
      setLang(data.guardian.preferredLanguage);
    }
  }

  useEffect(() => {
    void load();
  }, [guardianId]);

  const totals = useMemo(() => {
    return chart.reduce(
      (acc, day) => ({
        wins: acc.wins + day.wins,
        concerns: acc.concerns + day.concerns,
        attendance: acc.attendance + day.attendance,
      }),
      { wins: 0, concerns: 0, attendance: 0 },
    );
  }, [chart]);

  async function askChat(e: React.FormEvent) {
    e.preventDefault();
    if (!student || !question.trim()) return;
    setChatBusy(true);
    setChatLog((prev) => [...prev, { role: "parent", body: question.trim() }]);
    const q = question.trim();
    setQuestion("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ask_ai",
          studentId: student.id,
          question: q,
        }),
      });
      const data = await res.json();
      setChatLog((prev) => [
        ...prev,
        { role: "ai", body: data.result?.answer ?? "No answer." },
      ]);
    } finally {
      setChatBusy(false);
    }
  }

  if (!student) {
    return <p className="text-sm text-[var(--muted)]">Loading parent view…</p>;
  }

  const attentionAccent =
    risk?.level === "elevated"
      ? "#e11d48"
      : risk?.level === "watch"
        ? "#d97706"
        : "#0f766e";

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--accent)]">
            Helis · Parent
          </p>
          <h1 className="mt-2 text-4xl text-[var(--ink)]">{student.name}</h1>
          <p className="mt-1 text-[var(--muted)]">
            {guardian?.name} · Grade {student.grade}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {children.map((child) => (
            <button
              key={child.id}
              type="button"
              onClick={() => void load(child.id)}
              className={`rounded-full px-4 py-2 text-sm ${
                child.id === student.id
                  ? "bg-[var(--accent)] text-white"
                  : "border border-[var(--border)] bg-[var(--surface)]"
              }`}
            >
              {child.name.split(" ")[0]}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setLang(lang === "en" ? "hi" : "en")}
            className="rounded-full border border-[var(--border)] px-4 py-2 text-sm"
          >
            {lang === "en" ? "हिंदी" : "English"}
          </button>
        </div>
      </header>

      <section>
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-xl text-[var(--ink)]">Two-week snapshot</h2>
            <p className="text-sm text-[var(--muted)]">
              Each tablet is one signal type — not one crowded chart
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SignalTablet
            label="Attention"
            value={risk ? risk.level : "—"}
            hint={
              risk
                ? `Score ${risk.score} · ${risk.reasons[0]}`
                : "No risk score yet"
            }
            accent={attentionAccent}
            spark={risk?.sparkline.map((v) => Math.abs(v)) ?? chart.map(() => 0)}
            sparkColor={attentionAccent}
          />
          <SignalTablet
            label="Wins"
            value={totals.wins}
            hint={
              totals.wins === 0
                ? "No positive signals logged"
                : "Positive moments from class"
            }
            accent="#0f766e"
            spark={chart.map((d) => d.wins)}
            sparkColor="#0f766e"
          />
          <SignalTablet
            label="Concerns"
            value={totals.concerns}
            hint={
              totals.concerns === 0
                ? "No concerns this window"
                : "Areas teachers flagged"
            }
            accent="#d97706"
            spark={chart.map((d) => d.concerns)}
            sparkColor="#d97706"
          />
          <SignalTablet
            label="Attendance"
            value={totals.attendance}
            hint={
              totals.attendance === 0
                ? "No attendance notes"
                : "Late / absent notes logged"
            }
            accent="#64748b"
            spark={chart.map((d) => d.attendance)}
            sparkColor="#64748b"
          />
        </div>
      </section>

      {digest ? (
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="text-xl text-[var(--ink)]">Latest digest</h2>
          <p className="mt-2 text-sm text-[var(--ink-soft)]">
            {lang === "hi" ? digest.summaryHi : digest.summaryEn}
          </p>
          <p className="mt-2 text-xs uppercase tracking-wide text-[var(--muted)]">
            Status: {digest.status}
          </p>
        </section>
      ) : null}

      <section>
        <h2 className="mb-3 text-xl text-[var(--ink)]">Timeline</h2>
        <EventTimeline events={events} />
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="text-xl text-[var(--ink)]">Ask about {student.name}</h2>
        <p className="mb-3 text-sm text-[var(--muted)]">
          Answers only from this child&apos;s events — no speculation
        </p>
        <div className="mb-3 max-h-56 space-y-2 overflow-y-auto">
          {chatLog.map((item, i) => (
            <div
              key={i}
              className={`rounded-lg px-3 py-2 text-sm ${
                item.role === "parent"
                  ? "ml-8 bg-[var(--accent-soft)]"
                  : "mr-8 bg-[var(--paper)]"
              }`}
            >
              {item.body}
            </div>
          ))}
        </div>
        <form onSubmit={askChat} className="flex gap-2">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="How has homework been this week?"
            className="flex-1 rounded-lg border border-[var(--border)] px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={chatBusy}
            className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm text-white"
          >
            Ask
          </button>
        </form>
      </section>
    </div>
  );
}
