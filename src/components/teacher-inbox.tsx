"use client";

import { useEffect, useState } from "react";

import type { Guardian, Message, Student } from "@/lib/types";

interface ThreadRow {
  conversation: { id: string; studentId: string };
  student?: Student;
  guardian?: Guardian;
  lastMessage: Message | null;
  unreadFromParent: boolean;
}

interface TeacherInboxProps {
  classId: string;
}

export function TeacherInbox({ classId }: TeacherInboxProps) {
  const [rows, setRows] = useState<ThreadRow[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [student, setStudent] = useState<Student | null>(null);
  const [reply, setReply] = useState("");
  const [draft, setDraft] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  async function loadList() {
    const res = await fetch(`/api/chat?classId=${classId}`);
    const data = await res.json();
    setRows(data.conversations ?? []);
  }

  async function openThread(conversationId: string) {
    setActiveId(conversationId);
    setDraft(null);
    const res = await fetch(`/api/chat?conversationId=${conversationId}`);
    const data = await res.json();
    setMessages(data.messages ?? []);
    setStudent(data.student);
  }

  useEffect(() => {
    void loadList();
  }, [classId]);

  async function generateDraft() {
    if (!activeId) return;
    const lastParent = [...messages].reverse().find((m) => m.sender === "parent");
    if (!lastParent) {
      setStatus("No parent message to draft from.");
      return;
    }
    setStatus("Drafting…");
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "draft_reply",
        conversationId: activeId,
        parentMessageId: lastParent.id,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setStatus("Draft failed");
      return;
    }
    setDraft(data.draft);
    setReply(data.draft);
    setStatus("Draft ready — edit and send.");
  }

  async function sendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!activeId || !reply.trim()) return;
    await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId: activeId,
        sender: "teacher",
        body: reply.trim(),
      }),
    });
    setReply("");
    setDraft(null);
    await openThread(activeId);
    await loadList();
  }

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <h2 className="text-lg font-semibold text-[var(--ink)]">Parent threads</h2>
      <p className="mb-4 text-sm text-[var(--muted)]">
        AI reply drafts grounded in recent events
      </p>

      <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
        <ul className="space-y-2">
          {rows.length === 0 ? (
            <li className="text-sm text-[var(--muted)]">
              No threads yet. Parents can start from their dashboard.
            </li>
          ) : (
            rows.map((row) => (
              <li key={row.conversation.id}>
                <button
                  type="button"
                  onClick={() => void openThread(row.conversation.id)}
                  className={`w-full rounded-xl border px-3 py-2 text-left text-sm ${
                    activeId === row.conversation.id
                      ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                      : "border-[var(--border)]"
                  }`}
                >
                  <p className="font-medium">
                    {row.student?.name ?? "Student"}
                  </p>
                  <p className="truncate text-xs text-[var(--muted)]">
                    {row.lastMessage?.body ?? "Empty"}
                  </p>
                </button>
              </li>
            ))
          )}
        </ul>

        <div>
          {activeId && student ? (
            <>
              <p className="mb-2 text-sm font-medium text-[var(--ink)]">
                Thread — {student.name}
              </p>
              <div className="mb-3 max-h-56 space-y-2 overflow-y-auto rounded-xl border border-[var(--border)] p-3">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`rounded-lg px-3 py-2 text-sm ${
                      m.sender === "teacher"
                        ? "ml-6 bg-[var(--accent-soft)]"
                        : m.sender === "ai"
                          ? "bg-[var(--paper)] text-[var(--muted)]"
                          : "mr-6 bg-white"
                    }`}
                  >
                    <span className="text-[10px] uppercase tracking-wide text-[var(--muted)]">
                      {m.sender}
                    </span>
                    <p>{m.body}</p>
                  </div>
                ))}
              </div>
              <div className="mb-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => void generateDraft()}
                  className="rounded-full border border-[var(--border)] px-3 py-1.5 text-xs"
                >
                  AI draft reply
                </button>
                {draft ? (
                  <button
                    type="button"
                    onClick={() => setReply(draft)}
                    className="rounded-full border border-[var(--border)] px-3 py-1.5 text-xs"
                  >
                    Insert draft
                  </button>
                ) : null}
              </div>
              <form onSubmit={sendReply} className="flex gap-2">
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  rows={3}
                  className="flex-1 rounded-lg border border-[var(--border)] px-3 py-2 text-sm"
                  placeholder="Reply to parent…"
                />
                <button
                  type="submit"
                  className="self-end rounded-full bg-[var(--accent)] px-4 py-2 text-sm text-white"
                >
                  Send
                </button>
              </form>
            </>
          ) : (
            <p className="text-sm text-[var(--muted)]">Select a thread</p>
          )}
          {status ? (
            <p className="mt-2 text-sm text-[var(--muted)]">{status}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
