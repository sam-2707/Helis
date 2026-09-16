"use client";

import { useEffect, useState } from "react";

import type { Digest, Student } from "@/lib/types";

interface DigestPanelProps {
  student: Student;
  hasConsent: boolean;
}

export function DigestPanel({ student, hasConsent }: DigestPanelProps) {
  const [digest, setDigest] = useState<Digest | null>(null);
  const [summaryEn, setSummaryEn] = useState("");
  const [summaryHi, setSummaryHi] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setDigest(null);
    setSummaryEn("");
    setSummaryHi("");
    setMessage(null);
    setLoading(null);
  }, [student.id]);

  async function generateDigest() {
    setLoading("generate");
    setMessage(null);
    try {
      const response = await fetch("/api/digest/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: student.id, periodDays: 7 }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Generate failed");
      setDigest(data.digest);
      setSummaryEn(data.digest.summaryEn);
      setSummaryHi(data.digest.summaryHi);
      setMessage(`Draft ready from ${data.eventCount} event(s).`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Generate failed");
    } finally {
      setLoading(null);
    }
  }

  async function approveDigest() {
    if (!digest) return;
    setLoading("approve");
    setMessage(null);
    try {
      const response = await fetch("/api/digest/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          digestId: digest.id,
          summaryEn,
          summaryHi,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Approve failed");
      setDigest(data.digest);
      setMessage("Approved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Approve failed");
    } finally {
      setLoading(null);
    }
  }

  async function sendDigest() {
    if (!digest) return;
    setLoading("send");
    setMessage(null);
    try {
      const response = await fetch("/api/digest/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ digestId: digest.id }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (data.code === "CONSENT_REQUIRED") {
          throw new Error("WhatsApp blocked — ConsentRecord missing for parent.");
        }
        throw new Error(data.error ?? "Send failed");
      }
      setDigest(data.digest);
      setMessage(
        data.delivery.mock
          ? "Mock WhatsApp sent (check server logs)."
          : "WhatsApp sent.",
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Send failed");
    } finally {
      setLoading(null);
    }
  }

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[var(--ink)]">
            Digest — {student.name}
          </h2>
          <p className="text-sm text-[var(--muted)]">
            Bilingual EN/HI → WhatsApp
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            hasConsent
              ? "bg-emerald-100 text-emerald-800"
              : "bg-rose-100 text-rose-800"
          }`}
        >
          {hasConsent ? "Consent on file" : "No consent"}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={generateDigest}
          disabled={loading !== null}
          className="rounded-full border border-[var(--border)] px-4 py-2 text-sm"
        >
          {loading === "generate" ? "Generating…" : "Generate draft"}
        </button>
        <button
          type="button"
          onClick={approveDigest}
          disabled={!digest || loading !== null}
          className="rounded-full border border-[var(--border)] px-4 py-2 text-sm"
        >
          {loading === "approve" ? "Approving…" : "Approve"}
        </button>
        <button
          type="button"
          onClick={sendDigest}
          disabled={!digest || digest.status !== "approved" || loading !== null}
          className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {loading === "send" ? "Sending…" : "Send WhatsApp"}
        </button>
      </div>

      {digest ? (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <label className="grid gap-1 text-sm">
            <span className="text-[var(--muted)]">English</span>
            <textarea
              value={summaryEn}
              onChange={(e) => setSummaryEn(e.target.value)}
              rows={6}
              className="rounded-lg border border-[var(--border)] bg-white px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-[var(--muted)]">Hindi</span>
            <textarea
              value={summaryHi}
              onChange={(e) => setSummaryHi(e.target.value)}
              rows={6}
              className="rounded-lg border border-[var(--border)] bg-white px-3 py-2"
            />
          </label>
        </div>
      ) : null}

      {message ? (
        <p className="mt-3 text-sm text-[var(--muted)]">{message}</p>
      ) : null}
    </section>
  );
}
