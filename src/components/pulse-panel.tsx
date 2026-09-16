"use client";

import { useEffect, useState } from "react";

import type { RiskSignal, Student } from "@/lib/types";

interface PulsePanelProps {
  classId: string;
}

function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(1, ...values.map((v) => Math.abs(v)));
  return (
    <div className="flex h-8 items-end gap-0.5">
      {values.map((v, i) => (
        <div
          key={i}
          className={`w-1.5 rounded-sm ${v > 0 ? "bg-amber-500" : v < 0 ? "bg-emerald-500" : "bg-slate-200"}`}
          style={{ height: `${Math.max(12, (Math.abs(v) / max) * 100)}%` }}
          title={String(v)}
        />
      ))}
    </div>
  );
}

const levelStyle = {
  low: "bg-emerald-100 text-emerald-800",
  watch: "bg-amber-100 text-amber-900",
  elevated: "bg-rose-100 text-rose-800",
};

export function PulsePanel({ classId }: PulsePanelProps) {
  const [pulse, setPulse] = useState<RiskSignal[]>([]);
  const [students, setStudents] = useState<Record<string, Student>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const res = await fetch(`/api/pulse?classId=${classId}`);
      const data = await res.json();
      if (!cancelled) {
        setPulse(data.pulse ?? []);
        setStudents(data.students ?? {});
        setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [classId]);

  if (loading) {
    return <p className="text-sm text-[var(--muted)]">Loading pulse…</p>;
  }

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-[var(--ink)]">Class Pulse</h2>
        <p className="text-sm text-[var(--muted)]">
          Deterministic early-warning from the last 14 days of signals
        </p>
      </div>

      <ul className="space-y-3">
        {pulse.map((row) => {
          const student = students[row.studentId];
          return (
            <li
              key={row.studentId}
              className="flex flex-wrap items-center gap-4 rounded-xl border border-[var(--border)] p-3"
            >
              <div className="min-w-[140px] flex-1">
                <p className="font-medium text-[var(--ink)]">
                  {student?.name ?? row.studentId}
                </p>
                <p className="text-xs text-[var(--muted)]">
                  {row.reasons[0]}
                </p>
              </div>
              <Sparkline values={row.sparkline} />
              <div className="text-right">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${levelStyle[row.level]}`}
                >
                  {row.level} · {row.score}
                </span>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  {row.concernCount} concern · {row.positiveCount} win
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
