"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { Project } from "@/lib/types";

interface ProjectsPanelProps {
  classId: string;
}

export function ProjectsPanel({ classId }: ProjectsPanelProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [title, setTitle] = useState("New group project");
  const [groupCount, setGroupCount] = useState(2);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const res = await fetch(`/api/projects?classId=${classId}`);
    const data = await res.json();
    setProjects(data.projects ?? []);
  }

  useEffect(() => {
    void load();
  }, [classId]);

  async function createProject(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const due = new Date();
      due.setDate(due.getDate() + 14);
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId,
          title,
          description: "Created from Helis teacher view",
          dueDate: due.toISOString(),
          groupCount,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setMessage(`Created ${data.project.title} with ${groupCount} groups.`);
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <h2 className="text-lg font-semibold text-[var(--ink)]">Group projects</h2>
      <p className="mb-4 text-sm text-[var(--muted)]">
        One Kanban per group — you see all boards
      </p>

      <ul className="mb-4 space-y-2">
        {projects.map((project) => (
          <li key={project.id}>
            <Link
              href={`/teacher/projects/${project.id}`}
              className="flex items-center justify-between rounded-xl border border-[var(--border)] px-4 py-3 hover:border-[var(--accent)]"
            >
              <div>
                <p className="font-medium text-[var(--ink)]">{project.title}</p>
                <p className="text-xs text-[var(--muted)]">
                  Due {project.dueDate.slice(0, 10)} · {project.status}
                </p>
              </div>
              <span className="text-sm text-[var(--accent)]">Overview →</span>
            </Link>
          </li>
        ))}
      </ul>

      <form onSubmit={createProject} className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm"
          placeholder="Project title"
        />
        <select
          value={groupCount}
          onChange={(e) => setGroupCount(Number(e.target.value))}
          className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm"
        >
          {[2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n} groups
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm text-white"
        >
          {loading ? "Creating…" : "Create"}
        </button>
      </form>
      {message ? <p className="mt-2 text-sm text-[var(--muted)]">{message}</p> : null}
    </section>
  );
}
