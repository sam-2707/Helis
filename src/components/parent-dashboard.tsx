"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { Digest, Guardian, RiskSignal, Student, StudentEvent } from "@/lib/types";
import { EventTimeline } from "@/components/event-timeline";

interface ChartPoint {
  day: string;
  concerns: number;
  wins: number;
  attendance: number;
}

interface ParentDashboardProps {
  guardianId?: string;
}

export function ParentDashboard({ guardianId = "guard-1" }: ParentDashboardProps) {
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

      {risk ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-sm text-[var(--muted)]">Attention level</p>
          <p className="text-2xl text-[var(--ink)] capitalize">
            {risk.level}{" "}
            <span className="text-base text-[var(--muted)]">
              score {risk.score}
            </span>
          </p>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">{risk.reasons[0]}</p>
        </div>
      ) : null}

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="mb-4 text-xl text-[var(--ink)]">Two-week signals</h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7dfd1" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="wins" fill="#0f766e" name="Wins" />
              <Bar dataKey="concerns" fill="#d97706" name="Concerns" />
              <Bar dataKey="attendance" fill="#64748b" name="Attendance" />
            </BarChart>
          </ResponsiveContainer>
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
